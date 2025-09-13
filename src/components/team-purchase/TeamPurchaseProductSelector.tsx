'use client';

import React, { useState, useEffect } from 'react';
import {
  Search, ShoppingCart, Plus, Minus, X, Package,
  Filter, ChevronDown, Check, AlertCircle, TrendingUp, CreditCard
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';
import { TEAM_PURCHASE_RULES } from '@/lib/team-purchase/BusinessRules';
import { teamPurchaseCartService } from '@/lib/team-purchase/TeamPurchaseCartService';
import TeamPurchaseCheckout from './TeamPurchaseCheckout';
import type { Product, TeamPurchaseCart } from '@/types';
import { useTranslate } from '@/hooks/useTranslate';

// Локальный тип для корзины
interface LocalCartItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
  total: number;
}

interface TeamPurchaseProductSelectorProps {
  purchaseId: string;
  userId: string;
  onClose: () => void;
  onCheckout: () => void;
}

export default function TeamPurchaseProductSelector({
  purchaseId,
  userId,
  onClose,
  onCheckout
}: TeamPurchaseProductSelectorProps) {
  const { t } = useTranslate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  // Локальная корзина - хранится только на фронтенде
  const [localCart, setLocalCart] = useState<LocalCartItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [savedCart, setSavedCart] = useState<TeamPurchaseCart[]>([]);

  // Минимальная сумма для оформления
  const MIN_PURCHASE = TEAM_PURCHASE_RULES.finance.MIN_PERSONAL_PURCHASE;
  const cartTotal = localCart.reduce((sum, item) => sum + item.total, 0);
  const remainingToMin = Math.max(0, MIN_PURCHASE - cartTotal);
  const canCheckout = cartTotal >= MIN_PURCHASE;

  // Загрузка товаров
  useEffect(() => {
    loadProducts();
    loadCategories();
    loadExistingCart();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error(t('Ошибка загрузки товаров'));
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .eq('is_active', true);

    if (error) throw error;

      const uniqueCategories = [...new Set(data?.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Загрузка существующей корзины из БД (если есть)
  const loadExistingCart = async () => {
    try {
      const existingCart = await teamPurchaseCartService.getMemberCart(purchaseId, userId);

      if (existingCart && existingCart.length > 0) {
        const localItems: LocalCartItem[] = existingCart.map(item => ({
          id: item.product_id,
          product: item.product as Product,
          quantity: item.quantity,
          price: item.price,
          total: item.total || (item.quantity * item.price)
        }));
        setLocalCart(localItems);
      }
    } catch (error) {
      console.error('Error loading existing cart:', error);
    }
  };

  // Фильтрация товаров
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Добавление в локальную корзину
  const addToCart = (product: Product, quantity: number = 1) => {
    const existingItem = localCart.find(item => item.id === product.id);

    if (existingItem) {
      // Обновляем количество
      updateQuantity(product.id, existingItem.quantity + quantity);
    } else {
      // Добавляем новый товар
      const price = product.price_dealer || 0;
      const newItem: LocalCartItem = {
        id: product.id,
        product,
        quantity,
        price,
        total: price * quantity
      };
      setLocalCart([...localCart, newItem]);
      toast.success(t('Товар добавлен в корзину'));
    }
  };

  // Обновление количества в локальной корзине
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setLocalCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity, total: item.price * newQuantity }
          : item
      )
    );
  };

  // Удаление из локальной корзины
  const removeFromCart = (productId: string) => {
    setLocalCart(prevCart => prevCart.filter(item => item.id !== productId));
    toast.success(t('Товар удален из корзины'));
  };

  // Очистка корзины
  const clearCart = () => {
    setLocalCart([]);
    toast.success(t('Корзина очищена'));
  };

  // Сохранение корзины в БД и переход к оплате
  const handleCheckout = async () => {
    if (!canCheckout) {
      toast.error(t('Минимальная сумма заказа {amount}').replace('{amount}', formatPrice(MIN_PURCHASE)));
      return;
    }

    setIsSaving(true);
    try {
      // Сначала очищаем старую корзину в БД
      await teamPurchaseCartService.clearCart(purchaseId, userId);

      // Добавляем все товары из локальной корзины в БД
      const cartItems: TeamPurchaseCart[] = [];
      for (const item of localCart) {
        await teamPurchaseCartService.addToCart(
          purchaseId,
          userId,
          item.id,
          item.quantity
        );

        // Создаем объект для отображения в чекауте
        cartItems.push({
          id: item.id,
          team_purchase_id: purchaseId,
          member_id: '',
          user_id: userId,
          product_id: item.id,
          product: item.product,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      setSavedCart(cartItems);
      toast.success(t('Корзина сохранена!'));
      setShowCheckout(true);

    } catch (error) {
      console.error('Error saving cart:', error);
      toast.error(t('Ошибка сохранения корзины'));
    } finally {
      setIsSaving(false);
    }
  };

  // Форматирование цены
  const formatPrice = (price: number | undefined | null) => {
    if (price === undefined || price === null) return '0 ₸';
    return `${price.toLocaleString('ru-RU')} ₸`;
  };

  // Расчет процента прогресса к минимальной сумме
  const progressPercent = Math.min(100, (cartTotal / MIN_PURCHASE) * 100);

  // Проверка наличия товара в корзине
  const getCartItem = (productId: string) => {
    return localCart.find(item => item.id === productId);
  };

  return (
    <>
      {showCheckout ? (
        <TeamPurchaseCheckout
          purchaseId={purchaseId}
          userId={userId}
          cart={savedCart}
          onClose={() => {
            setShowCheckout(false);
            onClose();
          }}
          onPaymentComplete={() => {
            onCheckout();
            onClose();
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            {/* Заголовок */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#111]">{t('Выберите товары для закупки')}</h2>
                <button
                  onClick={onClose}
                  aria-label={t('Закрыть')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Индикатор минимальной суммы */}
              <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">{t('Прогресс к минимальной сумме')}</span>
                  <span className="text-sm font-medium text-[#111]">
                    {formatPrice(cartTotal)} / {formatPrice(MIN_PURCHASE)}
                  </span>
                </div>
                <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ${
                      progressPercent >= 100 ? 'bg-green-500' :
                      progressPercent >= 70 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {remainingToMin > 0 ? (
                  <p className="text-sm text-orange-600 mt-2">
                    ⚠️ {t('Добавьте товаров на {amount} для оформления заказа').replace('{amount}', formatPrice(remainingToMin))}
                  </p>
                ) : (
                  <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    {t('Минимальная сумма достигнута! Можно оформлять заказ')}
                  </p>
                )}
              </div>
            </div>

            {/* Основной контент */}
            <div className="flex-1 overflow-hidden flex">
              {/* Левая часть - список товаров */}
              <div className="flex-1 p-6 overflow-y-auto">
                {/* Фильтры и поиск */}
                <div className="mb-6 space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder={t('Поиск товаров...')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C]"
                      />
                    </div>

                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C]"
                    >
                      <option value="all">{t('Все категории')}</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Список товаров */}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D77E6C] border-t-transparent"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map(product => {
                      const cartItem = getCartItem(product.id);
                      const isInCart = !!cartItem;
                      const productPrice = product.price_dealer || 0;

                      return (
                        <div key={product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                          {/* Изображение */}
                          <div className="relative h-48 bg-gray-100">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-16 h-16 text-gray-300" />
                              </div>
                            )}

                            {isInCart && (
                              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                {t('В корзине')}
                              </div>
                            )}
                          </div>

                          {/* Информация */}
                          <div className="p-4">
                            <h3 className="font-semibold text-[#111] mb-2 line-clamp-2">
                              {product.name}
                            </h3>

                            <div className="flex items-baseline gap-2 mb-3">
                              <span className="text-xl font-bold text-[#D77E6C]">
                                {formatPrice(productPrice)}
                              </span>
                              {product.price_retail && (
                                <span className="text-sm text-gray-500 line-through">
                                  {formatPrice(product.price_retail)}
                                </span>
                              )}
                            </div>

                            {/* Действия */}
                            {isInCart ? (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                                    className="w-8 h-8 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center justify-center"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="w-10 text-center font-semibold">
                                    {cartItem.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                                    className="w-8 h-8 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center justify-center"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                                <button
                                  onClick={() => removeFromCart(product.id)}
                                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                                >
                                  {t('Удалить')}
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(product)}
                                className="w-full py-2 bg-[#D77E6C] text-white rounded-lg hover:bg-[#C56D5C] transition-colors"
                              >
                                {t('В корзину')}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Правая часть - корзина */}
              <div className="w-96 border-l border-gray-200 p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#111] flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    {t('Корзина ({n})').replace('{n}', String(localCart.length))}
                  </h3>
                  {localCart.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      {t('Очистить')}
                    </button>
                  )}
                </div>

                {/* Список товаров в корзине */}
                <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                  {localCart.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>{t('Корзина пуста')}</p>
                    </div>
                  ) : (
                    localCart.map(item => (
                      <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-medium text-[#111] line-clamp-2 flex-1">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="ml-2 text-gray-400 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 bg-white rounded hover:bg-gray-100 flex items-center justify-center"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 bg-white rounded hover:bg-gray-100 flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-sm font-semibold text-[#111]">
                            {formatPrice(item.total)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Итого и кнопка оплаты */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-[#111]">{t('Итого:')}</span>
                    <span className="text-2xl font-bold text-[#D77E6C]">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={!canCheckout || isSaving}
                    className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                      canCheckout && !isSaving
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        {t('Сохранение...')}
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        {t('Перейти к оплате')}
                      </>
                    )}
                  </button>

                  {!canCheckout && (
                    <p className="text-xs text-center text-orange-600 mt-2">
                      {t('Добавьте товаров на {amount}').replace('{amount}', formatPrice(remainingToMin))}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
