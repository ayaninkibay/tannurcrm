// src/app/dealer/shop/cart/page.tsx
// ОБНОВЛЕНО: Синхронизация с типами Orders, delivery_method и delivery_cost

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShoppingCart, 
  Minus, 
  Plus, 
  X, 
  Truck,
  AlertCircle,
  Sparkles,
  Shield,
  MapPin,
  Loader2,
  CreditCard,
  Wallet,
  Building
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import { useUser } from '@/context/UserContext';
import { useCartModule } from '@/lib/cart/CartModule';
import { orderService } from '@/lib/order/OrderService';
import type { DeliveryMethod } from '@/lib/cart/CartService';

export default function CartPage() {
  const router = useRouter();
  const { profile: currentUser, loading: userLoading } = useUser();
  const cart = useCartModule();
  
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Проверка авторизации
  useEffect(() => {
    if (!userLoading && !currentUser) {
      router.push('/signin');
    }
  }, [userLoading, currentUser, router]);

  // Загрузка корзины при монтировании
  useEffect(() => {
    if (currentUser) {
      loadCart();
    }
  }, [currentUser]);

  const loadCart = async () => {
    if (!currentUser) return;
    try {
      await cart.loadUserCart(currentUser.id);
    } catch (error) {
      console.error('❌ Error loading cart:', error);
    }
  };

  // Синхронизация delivery_method из корзины
  const currentDeliveryMethod = cart.getDeliveryMethod();

  const handleUpdateQuantity = async (itemId: string, change: number) => {
    const item = cart.cartItems.find(i => i.id === itemId);
    if (!item) return;
    
    const newQuantity = item.quantity + change;
    await cart.updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!confirm('Удалить товар из корзины?')) return;
    await cart.removeItem(itemId);
  };

  const validateBeforeCheckout = async (): Promise<boolean> => {
    const errors: string[] = [];
    
    if (cart.selectedItems.size === 0) {
      errors.push('Выберите товары для заказа');
    }
    
    // Для доставки курьером требуется адрес (пока недоступна)
    if (currentDeliveryMethod === 'delivery' && !deliveryAddress.trim()) {
      errors.push('Укажите адрес доставки');
    }
    
    if (cart.cart) {
      const validation = await cart.validateCart();
      if (!validation.valid) {
        errors.push(...validation.errors);
      }
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleOpenPaymentModal = async () => {
    const isValid = await validateBeforeCheckout();
    if (!isValid) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }
    
    setShowPaymentModal(true);
  };

  const handlePayment = async (method: string) => {
    if (!currentUser || !cart.cart) {
      toast.error('Ошибка авторизации');
      return;
    }

    try {
      setIsCreatingOrder(true);
      
      console.log('💳 Processing payment...', { 
        method, 
        deliveryMethod: currentDeliveryMethod 
      });
      
      // Определяем финальный адрес на основе метода доставки
      let finalAddress = 'Самовывоз';
      
      if (currentDeliveryMethod === 'delivery') {
        // Сохраняем адрес если доставка (когда будет доступна)
        await cart.updateDeliveryAddress(deliveryAddress);
        finalAddress = deliveryAddress;
      } else {
        // Для самовывоза сохраняем стандартный адрес
        await cart.updateDeliveryAddress('Самовывоз');
      }
      
      // СОЗДАЕМ И ОПЛАЧИВАЕМ ЗАКАЗ (один шаг)
      const result = await orderService.createAndPayOrder(
        currentUser.id,
        cart.cart.id,
        finalAddress,
        currentDeliveryMethod
      );
      
      if (!result.success) {
        toast.error(result.error || 'Ошибка создания заказа');
        setIsCreatingOrder(false);
        return;
      }
      
      console.log('✅ Order created and paid:', result.data);
      
      // Закрываем модалку
      setShowPaymentModal(false);
      
      // SUCCESS
      toast.success('Заказ успешно оплачен!');
      
      // Перезагружаем корзину (она уже должна быть пуста)
      await loadCart();
      
      // Переход на orders
      setTimeout(() => {
        router.push('/dealer/shop/orders');
      }, 500);
      
    } catch (error: any) {
      console.error('❌ Error processing payment:', error);
      setIsCreatingOrder(false);
      toast.error(error.message || 'Ошибка оплаты заказа');
    }
  };

  const totals = cart.calculateTotals();
  const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} ₸`;

  // LOADING STATE
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

  if (!currentUser) return null;

  // EMPTY CART STATE
  if (cart.cartItems.length === 0 && !cart.loading) {
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

  // MAIN CART VIEW
  return (
    <div className="min-h-screen p-2 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <MoreHeaderDE title="Корзина" showBackButton={true} />
      
      <div className="mx-auto mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN - CART ITEMS */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* VALIDATION ERRORS */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-2">
                      Исправьте ошибки:
                    </h3>
                    <ul className="space-y-1">
                      {validationErrors.map((error, i) => (
                        <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                          <span className="text-red-400 mt-0.5">•</span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {/* SELECT ALL */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={
                      cart.selectedItems.size === cart.cartItems.filter(item => item.stock > 0).length 
                      && cart.selectedItems.size > 0
                    }
                    onChange={() => cart.toggleSelectAll()}
                    className="w-5 h-5 text-[#D77E6C] rounded-md focus:ring-[#D77E6C] cursor-pointer"
                  />
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

            {/* CART ITEMS LIST */}
            <div className="space-y-4">
              {cart.cartItems.map(item => {
                const isOutOfStock = item.stock === 0;
                const isLowStock = item.stock > 0 && item.stock < 10;
                const isUpdating = cart.loadingStates.updatingItem.get(item.id);
                const isRemoving = cart.loadingStates.removingItem.get(item.id);
                
                return (
                  <div 
                    key={item.id} 
                    className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-200 relative ${
                      isOutOfStock ? 'opacity-60' : cart.selectedItems.has(item.id) ? 'ring-2 ring-[#D77E6C] shadow-md' : ''
                    }`}
                  >
                    {(isUpdating || isRemoving) && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-2xl">
                        <Loader2 className="w-8 h-8 text-[#D77E6C] animate-spin" />
                      </div>
                    )}
                    
                    <div className="p-5">
                      <div className="flex gap-4">
                        {/* CHECKBOX */}
                        <div className="flex items-center pt-2">
                          <input
                            type="checkbox"
                            checked={cart.selectedItems.has(item.id)}
                            onChange={() => cart.toggleItemSelection(item.id)}
                            disabled={isOutOfStock}
                            className="w-5 h-5 text-[#D77E6C] rounded-md focus:ring-[#D77E6C] disabled:opacity-50 cursor-pointer"
                          />
                        </div>

                        {/* IMAGE */}
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
                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                              <span className="text-white text-sm font-medium px-2 py-1 bg-red-500 rounded">
                                Нет в наличии
                              </span>
                            </div>
                          )}
                          {isLowStock && !isOutOfStock && (
                            <div className="absolute top-2 left-2 px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-lg">
                              Осталось: {item.stock}
                            </div>
                          )}
                        </div>

                        {/* ITEM INFO */}
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
                              disabled={isRemoving}
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

                            {/* QUANTITY CONTROLS */}
                            {!isOutOfStock && (
                              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, -1)}
                                  disabled={item.quantity <= 1 || isUpdating}
                                  className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-all duration-200 group disabled:opacity-50"
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
                                  disabled={item.quantity >= item.stock || isUpdating}
                                  className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-all duration-200 group disabled:opacity-50"
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

            {/* DELIVERY METHOD */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#D77E6C]" />
                Способ получения
              </h3>
              
              <div className="space-y-3">
                {/* САМОВЫВОЗ (АКТИВЕН) */}
                <label className="relative flex items-center p-5 rounded-xl cursor-pointer transition-all duration-200 bg-gradient-to-r from-[#D77E6C]/5 to-[#E09080]/5 ring-2 ring-[#D77E6C]">
                  <input
                    type="radio"
                    name="delivery"
                    value="pickup"
                    checked={true}
                    disabled={true}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      <div className="w-5 h-5 rounded-full border-2 border-[#D77E6C] flex items-center justify-center">
                        <div className="w-3 h-3 bg-[#D77E6C] rounded-full" />
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

                {/* ДОСТАВКА (НЕДОСТУПНА) */}
                <div className="relative p-5 rounded-xl bg-gray-50 opacity-60">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                      <div>
                        <p className="font-medium text-gray-500">Доставка курьером</p>
                        <p className="text-sm text-gray-400 mt-1">Временно недоступна</p>
                      </div>
                    </div>
                    <AlertCircle className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-5">
                Итого к оплате
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Товары ({totals.itemsCount} шт.)</span>
                  <span className="font-medium">{formatPrice(totals.subtotal)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Доставка</span>
                  {totals.deliveryFee === 0 ? (
                    <span className="font-medium text-green-600">Бесплатно</span>
                  ) : (
                    <span className="font-medium">{formatPrice(totals.deliveryFee)}</span>
                  )}
                </div>

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

              <button 
                onClick={handleOpenPaymentModal}
                className="w-full py-4 bg-gradient-to-r from-[#D77E6C] to-[#E09080] text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                disabled={cart.selectedItems.size === 0}
              >
                <CreditCard className="w-5 h-5" />
                <span>Перейти к оплате</span>
              </button>

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
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Моментальная оплата</p>
                    <p className="text-gray-500">Заказ создается после оплаты</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
            
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Выберите способ оплаты
                </h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  disabled={isCreatingOrder}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              <p className="text-gray-500 mt-2">
                К оплате: <span className="font-bold text-[#D77E6C]">{formatPrice(totals.total)}</span>
              </p>
            </div>

            <div className="p-6 space-y-3">
              
              {/* Kaspi */}
              <button
                onClick={() => handlePayment('kaspi')}
                disabled={isCreatingOrder}
                className="w-full p-5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isCreatingOrder ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Оплата...</span>
                  </>
                ) : (
                  <>
                    <Building className="w-6 h-6" />
                    <span>Kaspi Pay</span>
                  </>
                )}
              </button>

              {/* Баланс дилера */}
              <button
                onClick={() => handlePayment('balance')}
                disabled={isCreatingOrder}
                className="w-full p-5 bg-gradient-to-r from-[#D77E6C] to-[#E09080] text-white rounded-xl hover:from-[#C56D5C] hover:to-[#D77E6C] transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isCreatingOrder ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Оплата...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-6 h-6" />
                    <span>Баланс дилера</span>
                  </>
                )}
              </button>

              {/* Карта */}
              <button
                onClick={() => handlePayment('card')}
                disabled={isCreatingOrder}
                className="w-full p-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isCreatingOrder ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Оплата...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-6 h-6" />
                    <span>Банковская карта</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-6 bg-gray-50 rounded-b-3xl border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Безопасная оплата</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}