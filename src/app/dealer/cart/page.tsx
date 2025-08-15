'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShoppingCart, 
  Minus, 
  Plus, 
  X, 
  Package,
  Truck,
  CreditCard,
  Tag,
  AlertCircle,
  CheckCircle,
  MoreVertical
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Компоненты
import MoreHeaderDE from '@/components/header/MoreHeaderDE';

// Контекст пользователя
import { useUser } from '@/context/UserContext';

// Модули и сервисы
import { useCartModule } from '@/lib/cart/CartModule';
import { usePromocodeModule } from '@/lib/promocode/PromocodeModule';
import { orderService } from '@/lib/order/OrderService';
import { userService } from '@/lib/user/UserService';
import { promocodeService } from '@/lib/promocode/PromocodeService';

export default function CartPage() {
  const router = useRouter();
  
  // Используем контекст пользователя
  const { profile: currentUser, loading: userLoading } = useUser();
  
  // State
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  
  // Используем модули
  const cart = useCartModule();
  const promo = usePromocodeModule();
  
  // Проверка авторизации
  useEffect(() => {
    if (!userLoading && !currentUser) {
      router.push('/signin');
    }
  }, [userLoading, currentUser, router]);

  // Загрузка корзины при получении пользователя
  useEffect(() => {
    if (currentUser) {
      loadCart();
    }
  }, [currentUser]);

  // Автосохранение метода доставки
  useEffect(() => {
    if (cart.cart && deliveryMethod !== cart.cart.delivery_method) {
      cart.updateDeliveryMethod(deliveryMethod);
    }
  }, [deliveryMethod, cart.cart]);

  // Загрузка корзины
  const loadCart = async () => {
    if (!currentUser) return;
    
    try {
      await cart.loadUserCart(currentUser.id);
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Ошибка загрузки корзины');
    }
  };

  // Создание заказа
  const createOrder = async () => {
    // Валидация
    if (cart.selectedItems.size === 0) {
      toast.error('Выберите товары для заказа');
      return;
    }

    if (deliveryMethod === 'delivery' && !deliveryAddress.trim()) {
      toast.error('Укажите адрес доставки');
      return;
    }

    if (!currentUser || !cart.cart) {
      toast.error('Ошибка авторизации');
      return;
    }

    try {
      setIsCreatingOrder(true);
      
      const selectedCartItems = cart.cartItems.filter(item => 
        cart.selectedItems.has(item.id)
      );
      const totals = cart.calculateTotals();
      
      // Проверяем наличие всех товаров (используем stock из самих items)
      const hasOutOfStock = selectedCartItems.some(item => item.stock === 0);
      if (hasOutOfStock) {
        toast.error('Некоторые товары отсутствуют на складе');
        return;
      }
      
      // Создаем заказ
      const order = await orderService.createOrder(
        currentUser.id,
        totals.total,
        deliveryMethod === 'delivery' ? deliveryAddress : 'Самовывоз',
        promo.appliedPromoCode 
          ? `Промокод: ${promo.appliedPromoCode.code} (${promo.appliedPromoCode.discount_percent}%)`
          : undefined
      );

      // Создаем позиции заказа
      await orderService.createOrderItems(
        order.id, 
        selectedCartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price_dealer
        }))
      );

      // Обновляем товарооборот пользователя
      await userService.updateProfile(currentUser.id, {
        personal_turnover: (currentUser.personal_turnover || 0) + totals.total
      });

      // Записываем использование промокода
      if (promo.appliedPromoCode) {
        await promocodeService.recordUsage(
          promo.appliedPromoCode.id,
          currentUser.id,
          order.id,
          totals.discount,
          totals.total
        );
      }

      // Очищаем корзину
      await cart.clearCart();

      // Запускаем расчет бонусов
      await orderService.calculateBonuses(order.id);

      toast.success('Заказ успешно создан!');
      // ИСПРАВЛЕНО: перенаправляем на страницу списка заказов
      router.push('/dealer/orders');
      
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error(error.message || 'Ошибка создания заказа');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Обработчики для UI
  const handleUpdateQuantity = async (itemId: string, change: number) => {
    await cart.updateQuantity(itemId, change);
  };

  const handleRemoveItem = async (itemId: string) => {
    await cart.removeItem(itemId);
  };

  const handleApplyPromoCode = async () => {
    if (!currentUser || !cart.cart) return;
    
    const totals = cart.calculateTotals();
    const success = await promo.applyPromoCode(
      totals.subtotal, 
      currentUser.id, 
      cart.cart.id
    );
    
    if (success) {
      // Промокод применен успешно
    }
  };

  const handleRemovePromoCode = async () => {
    if (!cart.cart) return;
    await promo.removePromoCode(cart.cart.id);
  };

  // Вычисления
  const totals = cart.calculateTotals();
  const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} ₸`;

  // Loading state
  if (userLoading || cart.loading) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D77E6C] border-t-transparent"></div>
      </div>
    );
  }

  // Если пользователь не авторизован
  if (!currentUser) {
    return null;
  }

  // Empty cart
  if (cart.cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F6F6F6]">
        <MoreHeaderDE title="Корзина покупок" />
        
        <div className="flex flex-col items-center justify-center py-20">
          <div className="bg-white rounded-2xl border border-gray-200 p-12">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-[#111] mb-2 text-center">Корзина пуста</h2>
            <p className="text-gray-500 mb-8 text-center">Добавьте товары, чтобы начать покупки</p>
            <button 
              onClick={() => router.push('/dealer/shop')}
              className="px-8 py-3 bg-[#D77E6C] text-white rounded-xl hover:bg-[#C56D5C] transition-colors font-medium"
            >
              Перейти к покупкам
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <MoreHeaderDE title="Корзина" showBackButton={true}/>
      
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Статистика карточки */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Package className="w-5 h-5 text-gray-600" />
              </div>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-[#111]">{cart.cartItems.length}</div>
            <div className="text-sm text-gray-500">товаров в корзине</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-[#D77E6C]/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-[#D77E6C]" />
              </div>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-[#111]">{cart.selectedItems.size}</div>
            <div className="text-sm text-gray-500">выбрано товаров</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Tag className="w-5 h-5 text-green-600" />
              </div>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-green-600">{formatPrice(totals.savings)}</div>
            <div className="text-sm text-gray-500">ваша экономия</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-[#D77E6C]/10 rounded-lg">
                <CreditCard className="w-5 h-5 text-[#D77E6C]" />
              </div>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-[#D77E6C]">{formatPrice(totals.total)}</div>
            <div className="text-sm text-gray-500">итого к оплате</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Левая часть - список товаров */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Выбрать все */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    cart.selectedItems.size === cart.cartItems.filter(item => 
                      item.stock > 0
                    ).length && cart.selectedItems.size > 0
                  }
                  onChange={() => cart.toggleSelectAll()}
                  className="w-5 h-5 text-[#D77E6C] rounded focus:ring-[#D77E6C]"
                />
                <span className="font-medium text-[#111]">Выбрать все доступные товары</span>
              </label>
              <span className="text-sm text-gray-500">
                {cart.selectedItems.size} из {cart.cartItems.length}
              </span>
            </div>

            {/* Товары в корзине */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#111] mb-4">Товары в корзине</h2>
              
              <div className="space-y-4">
                {cart.cartItems.map(item => {
                  // ИСПОЛЬЗУЕМ STOCK ПРЯМО ИЗ ITEM
                  const stockLevel = item.stock;
                  const stockStatus = stockLevel === 0 ? 'out_of_stock' : 
                                     stockLevel < 10 ? 'low_stock' : 'in_stock';
                  
                  return (
                    <div 
                      key={item.id} 
                      className={`p-4 rounded-xl border ${
                        stockStatus === 'out_of_stock'
                          ? 'border-gray-200 bg-gray-50 opacity-60' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex gap-4">
                        {/* Чекбокс */}
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={cart.selectedItems.has(item.id)}
                            onChange={() => cart.toggleItemSelection(item.id)}
                            disabled={stockStatus === 'out_of_stock'}
                            className="w-5 h-5 text-[#D77E6C] rounded focus:ring-[#D77E6C] disabled:opacity-50"
                          />
                        </div>

                        {/* Изображение */}
                        <div className="relative">
                          <img
                            src={item.image || '/placeholder.png'}
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.png';
                            }}
                          />
                          {stockStatus === 'out_of_stock' && (
                            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs font-medium">Нет в наличии</span>
                            </div>
                          )}
                        </div>

                        {/* Информация о товаре */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-[#111]">{item.name}</h3>
                              <p className="text-sm text-gray-500">{item.category}</p>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5 text-gray-400" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold text-[#D77E6C]">
                                  {formatPrice(item.price_dealer)}
                                </span>
                                <span className="text-sm text-gray-400 line-through">
                                  {formatPrice(item.price)}
                                </span>
                              </div>
                              {stockStatus === 'low_stock' && (
                                <p className="text-xs text-orange-600 mt-1">
                                  Осталось {stockLevel} шт.
                                </p>
                              )}
                            </div>

                            {/* Количество */}
                            {stockStatus !== 'out_of_stock' ? (
                              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, -1)}
                                  className="w-8 h-8 flex items-center justify-center hover:bg-white rounded transition-colors"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-12 text-center font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, 1)}
                                  className="w-8 h-8 flex items-center justify-center hover:bg-white rounded transition-colors"
                                  disabled={item.quantity >= stockLevel}
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-sm text-red-600 font-medium">Нет в наличии</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Способ доставки */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-[#111] mb-4">
                Способ получения
              </h3>
              
              <div className="space-y-3">
                <label className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                  deliveryMethod === 'pickup' 
                    ? 'bg-[#D77E6C]/5 border-2 border-[#D77E6C]' 
                    : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      value="pickup"
                      checked={deliveryMethod === 'pickup'}
                      onChange={(e) => setDeliveryMethod(e.target.value as 'pickup' | 'delivery')}
                      className="text-[#D77E6C] focus:ring-[#D77E6C]"
                    />
                    <div>
                      <p className="font-medium text-[#111]">Самовывоз</p>
                      <p className="text-sm text-gray-500">г. Алматы, ул. Абая 150</p>
                    </div>
                  </div>
                  <span className="text-green-600 font-medium">Бесплатно</span>
                </label>

                <label className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                  deliveryMethod === 'delivery' 
                    ? 'bg-[#D77E6C]/5 border-2 border-[#D77E6C]' 
                    : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      value="delivery"
                      checked={deliveryMethod === 'delivery'}
                      onChange={(e) => setDeliveryMethod(e.target.value as 'pickup' | 'delivery')}
                      className="text-[#D77E6C] focus:ring-[#D77E6C]"
                    />
                    <div>
                      <p className="font-medium text-[#111]">Доставка курьером</p>
                      <p className="text-sm text-gray-500">1-2 рабочих дня</p>
                    </div>
                  </div>
                  <span className="font-medium">
                    {totals.subtotal >= 50000 ? (
                      <span className="text-green-600">Бесплатно</span>
                    ) : (
                      <span className="text-[#111]">{formatPrice(5000)}</span>
                    )}
                  </span>
                </label>
              </div>

              {deliveryMethod === 'delivery' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Адрес доставки
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Введите полный адрес доставки"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C] focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
              )}

              {deliveryMethod === 'delivery' && totals.subtotal < 50000 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    Добавьте товары на <span className="font-semibold">
                      {formatPrice(50000 - totals.subtotal)}
                    </span> для бесплатной доставки
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Правая часть - итоги */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-[#111] mb-4">Детали заказа</h3>

              {/* Промокод */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Промокод</label>
                {!promo.appliedPromoCode ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Введите код"
                      value={promo.promoCode}
                      onChange={(e) => promo.setPromoCode(e.target.value.toUpperCase())}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C] focus:border-transparent"
                      disabled={promo.loading}
                    />
                    <button
                      onClick={handleApplyPromoCode}
                      disabled={promo.loading || !promo.promoCode.trim()}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {promo.loading ? '...' : 'Применить'}
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-700">
                          {promo.appliedPromoCode.code}
                        </span>
                      </div>
                      <button
                        onClick={handleRemovePromoCode}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-sm text-green-600">
                      Скидка {promo.appliedPromoCode.discount_percent}%
                    </span>
                  </div>
                )}
              </div>

              {/* Расчеты */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Товары ({cart.selectedItems.size} шт.)</span>
                  <span>{formatPrice(totals.subtotal)}</span>
                </div>
                
                {promo.promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Скидка</span>
                    <span>-{formatPrice(totals.discount)}</span>
                  </div>
                )}

                {totals.deliveryFee > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Доставка</span>
                    <span>{formatPrice(totals.deliveryFee)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-semibold text-[#111]">Итого</span>
                    <span className="text-2xl font-bold text-[#D77E6C]">
                      {formatPrice(totals.total)}
                    </span>
                  </div>
                  {totals.savings > 0 && (
                    <p className="text-sm text-green-600 mt-1 text-right">
                      Экономия: {formatPrice(totals.savings)}
                    </p>
                  )}
                </div>
              </div>

              {/* Кнопка оформления */}
              <button 
                onClick={createOrder}
                className="w-full py-3 bg-[#D77E6C] text-white rounded-xl font-semibold hover:bg-[#C56D5C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={cart.selectedItems.size === 0 || isCreatingOrder}
              >
                <CreditCard className="w-5 h-5" />
                {isCreatingOrder ? 'Оформление...' : 'Оформить заказ'}
              </button>

              {/* Информация */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#111]">Быстрая доставка</p>
                    <p className="text-xs text-gray-500">Доставим заказ в течение 1-2 дней</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#111]">Гарантия качества</p>
                    <p className="text-xs text-gray-500">100% оригинальная продукция</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#111]">Безопасная оплата</p>
                    <p className="text-xs text-gray-500">Защищенные платежи</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}