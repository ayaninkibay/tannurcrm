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
  Sparkles,
  Clock,
  Shield,
  MapPin
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Компоненты
import MoreHeaderDE from '@/components/header/MoreHeaderDE';

// Контекст пользователя
import { useUser } from '@/context/UserContext';

// Модули и сервисы
import { useCartModule } from '@/lib/cart/CartModule';
import { orderService } from '@/lib/order/OrderService';
import { userService } from '@/lib/user/UserService';

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
      // Не показываем ошибку пользователю, корзина создастся автоматически
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
      
      // Расчитываем итоговую сумму без скидок
      const totalAmount = selectedCartItems.reduce(
        (sum, item) => sum + (item.price_dealer * item.quantity),
        0
      );
      
      // Проверяем наличие всех товаров
      const hasOutOfStock = selectedCartItems.some(item => item.stock === 0);
      if (hasOutOfStock) {
        toast.error('Некоторые товары отсутствуют на складе');
        return;
      }
      
      // Создаем заказ
      const order = await orderService.createOrder(
        currentUser.id,
        totalAmount,
        deliveryMethod === 'delivery' ? deliveryAddress : 'Самовывоз'
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
        personal_turnover: (currentUser.personal_turnover || 0) + totalAmount
      });

      // Очищаем корзину
      await cart.clearCart();

      // Запускаем расчет бонусов
      await orderService.calculateBonuses(order.id);

      toast.success('Заказ успешно создан!');
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

  // Расчет итогов
  const calculateTotals = () => {
    const selectedCartItems = cart.cartItems.filter(item => 
      cart.selectedItems.has(item.id)
    );
    
    const subtotal = selectedCartItems.reduce(
      (sum, item) => sum + (item.price_dealer * item.quantity),
      0
    );
    
    const deliveryFee = deliveryMethod === 'delivery' ? 0 : 0; // Доставка пока бесплатная
    
    return {
      subtotal,
      total: subtotal + deliveryFee,
      deliveryFee
    };
  };

  const totals = calculateTotals();
  const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} ₸`;

  // Loading state
  if (userLoading || cart.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-[#D77E6C] rounded-full animate-spin"></div>
            <ShoppingCart className="w-6 h-6 text-[#D77E6C] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-500">Загружаем корзину...</p>
        </div>
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
      <div className="min-h-screen p-2 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <MoreHeaderDE title="Корзина" />
        
        <div className="flex flex-col items-center justify-center py-20">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 max-w-md w-full mx-4">
            <div className="relative mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-[#D77E6C]/10 to-[#E09080]/10 rounded-full mx-auto flex items-center justify-center">
                <ShoppingCart className="w-16 h-16 text-[#D77E6C]" />
              </div>
              <div className="absolute top-0 right-1/3 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Корзина пуста
            </h2>
            <p className="text-gray-500 mb-8 text-center">
              Самое время добавить что-нибудь интересное!
            </p>
            
            <button 
              onClick={() => router.push('/dealer/shop')}
              className="w-full py-3 bg-gradient-to-r from-[#D77E6C] to-[#E09080] text-white rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
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
    <div className="min-h-screen p-2 md:p-6 ">
      <MoreHeaderDE title="Корзина" showBackButton={true}/>
      
      <div className=" mx-auto mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Левая часть - список товаров */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Выбрать все */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={
                        cart.selectedItems.size === cart.cartItems.filter(item => 
                          item.stock > 0
                        ).length && cart.selectedItems.size > 0
                      }
                      onChange={() => cart.toggleSelectAll()}
                      className="w-5 h-5 text-[#D77E6C] rounded-md focus:ring-[#D77E6C] cursor-pointer"
                    />
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 group-hover:text-[#D77E6C] transition-colors">
                      Выбрать все товары
                    </span>
                    <span className="block text-sm text-gray-500">
                      {cart.selectedItems.size} из {cart.cartItems.length} выбрано
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-[#D77E6C]">
                    {formatPrice(totals.subtotal)}
                  </span>
                </div>
              </label>
            </div>

            {/* Товары в корзине */}
            <div className="space-y-4">
              {cart.cartItems.map(item => {
                const stockLevel = item.stock;
                const stockStatus = stockLevel === 0 ? 'out_of_stock' : 
                                   stockLevel < 10 ? 'low_stock' : 'in_stock';
                
                return (
                  <div 
                    key={item.id} 
                    className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-200 ${
                      stockStatus === 'out_of_stock'
                        ? 'opacity-60' 
                        : cart.selectedItems.has(item.id) 
                          ? 'ring-2 ring-[#D77E6C] shadow-md' 
                          : ''
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex gap-4">
                        {/* Чекбокс */}
                        <div className="flex items-center pt-2">
                          <input
                            type="checkbox"
                            checked={cart.selectedItems.has(item.id)}
                            onChange={() => cart.toggleItemSelection(item.id)}
                            disabled={stockStatus === 'out_of_stock'}
                            className="w-5 h-5 text-[#D77E6C] rounded-md focus:ring-[#D77E6C] disabled:opacity-50 cursor-pointer"
                          />
                        </div>

                        {/* Изображение */}
                        <div className="relative flex-shrink-0">
                          <div className="w-28 h-28 bg-gray-100 rounded-xl overflow-hidden">
                            <img
                              src={item.image || '/placeholder.png'}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.png';
                              }}
                            />
                          </div>
                          {stockStatus === 'out_of_stock' && (
                            <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                              <span className="text-white text-sm font-medium px-2 py-1 bg-red-500 rounded">
                                Нет в наличии
                              </span>
                            </div>
                          )}
                          {stockStatus === 'low_stock' && (
                            <div className="absolute top-2 left-2 px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-lg">
                              Мало
                            </div>
                          )}
                        </div>

                        {/* Информация о товаре */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 min-w-0 mr-3">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {item.name}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {item.category}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                              title="Удалить"
                            >
                              <X className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                            </button>
                          </div>

                          <div className="flex items-end justify-between">
                            <div>
                              <div className="flex items-baseline gap-3 mb-2">
                                <span className="text-2xl font-bold text-[#D77E6C]">
                                  {formatPrice(item.price_dealer * item.quantity)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">
                                {formatPrice(item.price_dealer)} за единицу
                              </p>
                            </div>

                            {/* Количество */}
                            {stockStatus !== 'out_of_stock' && (
                              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, -1)}
                                  className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-all duration-200 group"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="w-4 h-4 group-hover:text-[#D77E6C]" />
                                </button>
                                <input
                                  type="text"
                                  value={item.quantity}
                                  readOnly
                                  className="w-14 text-center font-semibold bg-transparent text-gray-900"
                                />
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, 1)}
                                  className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-all duration-200 group"
                                  disabled={item.quantity >= stockLevel}
                                >
                                  <Plus className="w-4 h-4 group-hover:text-[#D77E6C]" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Способ доставки */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#D77E6C]" />
                Способ получения
              </h3>
              
              <div className="space-y-3">
                <label className={`relative flex items-center p-5 rounded-xl cursor-pointer transition-all duration-200 ${
                  deliveryMethod === 'pickup' 
                    ? 'bg-gradient-to-r from-[#D77E6C]/5 to-[#E09080]/5 ring-2 ring-[#D77E6C]' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}>
                  <input
                    type="radio"
                    name="delivery"
                    value="pickup"
                    checked={deliveryMethod === 'pickup'}
                    onChange={(e) => setDeliveryMethod(e.target.value as 'pickup' | 'delivery')}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        deliveryMethod === 'pickup' ? 'border-[#D77E6C]' : 'border-gray-300'
                      }`}>
                        {deliveryMethod === 'pickup' && (
                          <div className="w-3 h-3 bg-[#D77E6C] rounded-full" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Самовывоз</p>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          г. Алматы, ул. Абая 150
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-green-600 font-medium">Бесплатно</span>
                      <p className="text-xs text-gray-500">Сегодня с 10:00</p>
                    </div>
                  </div>
                </label>

                <div className="relative p-5 rounded-xl bg-gray-50 opacity-60">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                      </div>
                      <div>
                        <p className="font-medium text-gray-500">Доставка курьером</p>
                        <p className="text-sm text-gray-400 mt-1">Временно недоступна</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <AlertCircle className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Правая часть - итоги */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-5">
                Итого к оплате
              </h3>

              {/* Расчеты */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Товары ({cart.selectedItems.size} шт.)</span>
                  <span className="font-medium">{formatPrice(totals.subtotal)}</span>
                </div>

                {totals.deliveryFee > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Доставка</span>
                    <span className="font-medium">{formatPrice(totals.deliveryFee)}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">К оплате</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {formatPrice(totals.total)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Кнопка оформления */}
              <button 
                onClick={createOrder}
                className="w-full py-4 bg-gradient-to-r from-[#D77E6C] to-[#E09080] text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                disabled={cart.selectedItems.size === 0 || isCreatingOrder}
              >
                {isCreatingOrder ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Оформляем...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Оформить заказ</span>
                  </>
                )}
              </button>

              {/* Преимущества */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Защита покупателя</p>
                    <p className="text-gray-500">Гарантия возврата</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Быстрая доставка</p>
                    <p className="text-gray-500">1-2 рабочих дня</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Бонусы с покупки</p>
                    <p className="text-gray-500">Накопительная система</p>
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