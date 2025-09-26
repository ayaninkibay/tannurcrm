import React, { useState, useEffect } from 'react';
import {
  Search, ShoppingCart, Plus, Minus, X, Package,
  Check, ChevronRight, CreditCard
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';
import { teamPurchaseCartService } from '@/lib/team-purchase/TeamPurchaseCartService';
import TeamPurchaseCheckout from './TeamPurchaseCheckout';
import type { Product, TeamPurchaseCart } from '@/types';
import { useTranslate } from '@/hooks/useTranslate';

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
  const [localCart, setLocalCart] = useState<LocalCartItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [savedCart, setSavedCart] = useState<TeamPurchaseCart[]>([]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const MIN_PURCHASE = 100000;
  const cartTotal = localCart.reduce((sum, item) => sum + item.total, 0);
  const canCheckout = cartTotal >= MIN_PURCHASE;
  const progressPercent = Math.min(100, (cartTotal / MIN_PURCHASE) * 100);
  const remainingToMin = Math.max(0, MIN_PURCHASE - cartTotal);
  const cartItemsCount = localCart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    loadProducts();
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
      toast.error(t('Ошибка загрузки'));
    } finally {
      setLoading(false);
    }
  };

  const loadExistingCart = async () => {
    try {
      const existingCart = await teamPurchaseCartService.getMemberCart(purchaseId, userId);
      if (existingCart && existingCart.length > 0) {
        const localItems = existingCart.map(item => ({
          id: item.product_id,
          product: item.product as Product,
          quantity: item.quantity,
          price: item.price,
          total: item.total || (item.quantity * item.price)
        }));
        setLocalCart(localItems);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existing = localCart.find(item => item.id === product.id);
    if (existing) {
      updateQuantity(product.id, existing.quantity + 1);
    } else {
      const price = product.price_dealer || 0;
      setLocalCart([...localCart, {
        id: product.id,
        product,
        quantity: 1,
        price,
        total: price
      }]);
      toast.success(t('Добавлено'));
    }
  };

  const updateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      setLocalCart(prev => prev.filter(item => item.id !== productId));
      return;
    }
    setLocalCart(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, quantity: newQty, total: item.price * newQty }
          : item
      )
    );
  };

  const handleCheckout = async () => {
    if (!canCheckout) {
      toast.error(t(`Минимум ${formatPrice(MIN_PURCHASE)} ₸`));
      return;
    }

    setIsSaving(true);
    try {
      // Очищаем старую корзину в БД
      await teamPurchaseCartService.clearCart(purchaseId, userId);
      
      // Создаем массив для сохраненной корзины
      const cartItems: TeamPurchaseCart[] = [];
      
      // Добавляем все товары из локальной корзины в БД
      for (const item of localCart) {
        await teamPurchaseCartService.addToCart(purchaseId, userId, item.id, item.quantity);
        
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

  const formatPrice = (price: number) => {
    return price.toLocaleString('ru-RU').replace(/,/g, ' ');
  };

  const getCartItem = (productId: string) => {
    return localCart.find(item => item.id === productId);
  };

  // Компонент карточки товара
  const ProductCard = ({ product, isMobile }: { product: Product; isMobile?: boolean }) => {
    const inCart = getCartItem(product.id);
    const price = product.price_dealer || 0;

    // Мобильная версия - горизонтальная карточка
    if (isMobile) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex gap-4">
            {/* Изображение */}
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 relative overflow-hidden">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-300" />
                </div>
              )}
              {inCart && (
                <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-0.5">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </div>

            {/* Информация */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                {product.name}
              </h3>
              <p className="text-base font-bold text-[#D77E6C]">
                {formatPrice(price)} ₸
              </p>
            </div>

            {/* Действия */}
            <div className="flex items-center">
              {inCart ? (
                <div className="flex items-center bg-gray-50 rounded-lg p-1 gap-1">
                  <button
                    onClick={() => updateQuantity(product.id, inCart.quantity - 1)}
                    className="w-7 h-7 bg-white rounded border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
                  >
                    <Minus className="w-3 h-3 text-gray-600" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">
                    {inCart.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(product.id, inCart.quantity + 1)}
                    className="w-7 h-7 bg-white rounded border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
                  >
                    <Plus className="w-3 h-3 text-gray-600" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addToCart(product)}
                  className="px-3 py-2 bg-[#D77E6C] text-white rounded-lg hover:bg-[#C66B5A] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Десктопная версия - вертикальная карточка
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all group">
        {/* Изображение */}
        <div className="aspect-square bg-gray-50 rounded-lg mb-3 relative overflow-hidden">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-300" />
            </div>
          )}
          {inCart && (
            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 shadow-md">
              <Check className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Информация */}
        <div className="space-y-2 mb-3">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          <p className="text-lg font-bold text-[#D77E6C]">
            {formatPrice(price)} ₸
          </p>
        </div>

        {/* Действия */}
        {inCart ? (
          <div className="flex items-center bg-gray-50 rounded-lg p-1">
            <button
              onClick={() => updateQuantity(product.id, inCart.quantity - 1)}
              className="w-8 h-8 bg-white rounded hover:bg-gray-100 border border-gray-200 flex items-center justify-center transition-colors"
            >
              <Minus className="w-3 h-3 text-gray-600" />
            </button>
            <span className="flex-1 text-center font-semibold text-gray-800">
              {inCart.quantity}
            </span>
            <button
              onClick={() => updateQuantity(product.id, inCart.quantity + 1)}
              className="w-8 h-8 bg-white rounded hover:bg-gray-100 border border-gray-200 flex items-center justify-center transition-colors"
            >
              <Plus className="w-3 h-3 text-gray-600" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => addToCart(product)}
            className="w-full py-2.5 bg-[#D77E6C] text-white text-sm font-medium rounded-lg hover:bg-[#C66B5A] transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            В корзину
          </button>
        )}
      </div>
    );
  };

  // Мобильная корзина
  const MobileCart = () => (
    <div className={`fixed inset-0 bg-black/50 z-50 lg:hidden transition-opacity ${showMobileCart ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl transition-transform ${showMobileCart ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Корзина ({cartItemsCount})
            </h3>
            <button
              onClick={() => setShowMobileCart(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-4">
          {localCart.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3" />
              <p>Корзина пуста</p>
            </div>
          ) : (
            <div className="space-y-3">
              {localCart.map(item => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">
                      {item.product.name}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 0)}
                      className="text-gray-400 hover:text-red-500 ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 bg-white rounded border border-gray-200 flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 bg-white rounded border border-gray-200 flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-semibold text-[#D77E6C]">
                      {formatPrice(item.total)} ₸
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-600">Итого:</span>
            <span className="text-2xl font-bold text-[#D77E6C]">
              {formatPrice(cartTotal)} ₸
            </span>
          </div>
          {!canCheckout && (
            <p className="text-xs text-gray-500 mb-3">
              До минимальной суммы: {formatPrice(remainingToMin)} ₸
            </p>
          )}
          <button
            onClick={handleCheckout}
            disabled={!canCheckout || isSaving}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              canCheckout
                ? 'bg-[#D77E6C] text-white hover:bg-[#C66B5A]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSaving ? 'Оформление...' : canCheckout ? 'Оформить заказ' : `Мин. ${formatPrice(MIN_PURCHASE)} ₸`}
          </button>
        </div>
      </div>
    </div>
  );

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
        <>
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40 p-4">
            <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
              {/* Заголовок */}
              <div className="bg-[#D77E6C] p-4 sm:p-5">
                <div className="flex items-center justify-between text-white mb-3">
                  <h2 className="text-lg sm:text-xl font-semibold">
                    Выбор товаров
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Прогресс-бар */}
                <div>
                  <div className="flex justify-between text-sm mb-1 text-white/90">
                    <span>Минимум для заказа</span>
                    <span className="font-semibold">{formatPrice(cartTotal)} / {formatPrice(MIN_PURCHASE)} ₸</span>
                  </div>
                  <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${canCheckout ? 'bg-green-400' : 'bg-yellow-300'}`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Поиск */}
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Поиск товаров..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#D77E6C] transition-colors"
                  />
                </div>
              </div>

              {/* Основной контент */}
              <div className="flex-1 flex overflow-hidden">
                {/* Список товаров */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="w-12 h-12 border-3 border-[#D77E6C] border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-gray-500">Загрузка товаров...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredProducts.map(product => (
                        <ProductCard 
                          key={product.id} 
                          product={product} 
                          isMobile={isMobile}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Десктопная корзина */}
                <div className="hidden lg:block w-80 border-l border-gray-200 bg-white">
                  <div className="h-full flex flex-col">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4 text-[#D77E6C]" />
                          Корзина ({cartItemsCount})
                        </span>
                        {localCart.length > 0 && (
                          <button
                            onClick={() => setLocalCart([])}
                            className="text-xs text-red-500 hover:text-red-600"
                          >
                            Очистить
                          </button>
                        )}
                      </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3">
                      {localCart.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                          <ShoppingCart className="w-10 h-10 mx-auto mb-3" />
                          <p className="text-sm">Корзина пуста</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {localCart.map(item => (
                            <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex justify-between mb-2">
                                <span className="text-xs font-medium text-gray-900 line-clamp-2 flex-1">
                                  {item.product.name}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, 0)}
                                  className="text-gray-400 hover:text-red-500 ml-2"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="w-6 h-6 bg-white rounded border border-gray-200 flex items-center justify-center"
                                  >
                                    <Minus className="w-2 h-2" />
                                  </button>
                                  <span className="w-7 text-center text-xs font-medium">{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="w-6 h-6 bg-white rounded border border-gray-200 flex items-center justify-center"
                                  >
                                    <Plus className="w-2 h-2" />
                                  </button>
                                </div>
                                <span className="text-sm font-semibold text-[#D77E6C]">
                                  {formatPrice(item.total)} ₸
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-4 border-t border-gray-100">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-gray-600">Итого:</span>
                        <span className="text-xl font-bold text-[#D77E6C]">
                          {formatPrice(cartTotal)} ₸
                        </span>
                      </div>
                      {!canCheckout && (
                        <p className="text-xs text-gray-500 mb-3">
                          До минимума: {formatPrice(remainingToMin)} ₸
                        </p>
                      )}
                      <button
                        onClick={handleCheckout}
                        disabled={!canCheckout || isSaving}
                        className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${
                          canCheckout
                            ? 'bg-[#D77E6C] text-white hover:bg-[#C66B5A]'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isSaving ? 'Сохранение...' : canCheckout ? 'Оформить заказ' : `Мин. ${formatPrice(MIN_PURCHASE)} ₸`}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Мобильная кнопка корзины */}
              <div className="lg:hidden border-t border-gray-100 p-4 bg-white">
                <button
                  onClick={() => setShowMobileCart(true)}
                  className="w-full py-3 bg-[#D77E6C] text-white rounded-lg font-medium flex items-center justify-between px-4 hover:bg-[#C66B5A] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Корзина ({cartItemsCount})
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-semibold">{formatPrice(cartTotal)} ₸</span>
                    <ChevronRight className="w-5 h-5" />
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Мобильная корзина */}
          <MobileCart />
        </>
      )}
    </>
  );
}