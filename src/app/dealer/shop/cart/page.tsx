'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
  CheckCircle,
  Gift
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import { useUser } from '@/context/UserContext';
import { useCartModule } from '@/lib/cart/CartModule';
import { orderService } from '@/lib/order/OrderService';
import KaspiPaymentFlow from '@/components/payment/KaspiPaymentFlow';
import { getActivePromotions, type GiftPromotionWithProducts } from '@/lib/gift_promotions/giftPromotions';

type OrderStage = 'cart' | 'payment' | 'success';

export default function CartPage() {
  const router = useRouter();
  const { profile: currentUser, loading: userLoading } = useUser();
  const cart = useCartModule();
  
  const [orderStage, setOrderStage] = useState<OrderStage>('cart');
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [activePromotions, setActivePromotions] = useState<GiftPromotionWithProducts[]>([]);
  const [loadingPromotions, setLoadingPromotions] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Проверка авторизации
  useEffect(() => {
    if (!userLoading && !currentUser) {
      router.push('/signin');
    }
  }, [userLoading, currentUser, router]);

  // Загрузка корзины и акций
  useEffect(() => {
    if (currentUser) {
      cart.loadUserCart(currentUser.id);
      loadActivePromotions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Отслеживаем изменения в корзине для анимации
  useEffect(() => {
    if (cart.loading) {
      setIsRefreshing(true);
    } else {
      // Небольшая задержка для плавности анимации
      const timer = setTimeout(() => setIsRefreshing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cart.loading]);

  // Загрузка активных акций
  async function loadActivePromotions() {
    try {
      setLoadingPromotions(true);
      const promotions = await getActivePromotions();
      setActivePromotions(promotions);
    } catch (error) {
      console.error('Ошибка загрузки акций:', error);
    } finally {
      setLoadingPromotions(false);
    }
  }

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

  // Валидация перед оформлением
  const validateBeforeCheckout = async (): Promise<boolean> => {
    const errors: string[] = [];
    
    if (cart.selectedItems.size === 0) {
      errors.push('Выберите товары для заказа');
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

  // ПЕРЕХОД К ОПЛАТЕ (без создания заказа)
  const handleProceedToPayment = async () => {
    if (!currentUser || !cart.cart) return;

    const isValid = await validateBeforeCheckout();
    if (!isValid) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    // Просто переходим к экрану оплаты, НЕ создаем заказ
    setOrderStage('payment');
  };

  // ПОДТВЕРЖДЕНИЕ ОПЛАТЫ - ТОЛЬКО ЗДЕСЬ создаем заказ и очищаем корзину
  const handlePaymentConfirmed = async (paymentNotes: string) => {
    if (!currentUser || !cart.cart) return;

    setIsProcessing(true);

    try {
      console.log('📦 Creating order after payment confirmation...');
      
      // 1. СОЗДАЕМ ЗАКАЗ
      const createResult = await orderService.createAndPayOrder(
        currentUser.id,
        cart.cart.id,
        'Самовывоз',
        'pickup'
      );
      
      if (!createResult.success || !createResult.data) {
        toast.error(createResult.error || 'Не удалось создать заказ');
        setIsProcessing(false);
        return;
      }

      const orderId = createResult.data.id;
      console.log('✅ Order created:', createResult.data.order_number);

      // 2. ПОДТВЕРЖДАЕМ ОПЛАТУ
      console.log('✅ Confirming payment...');
      const confirmResult = await orderService.confirmPayment(
        orderId,
        currentUser.id,
        paymentNotes
      );

      if (!confirmResult.success) {
        toast.error(confirmResult.error || 'Ошибка подтверждения оплаты');
        setIsProcessing(false);
        return;
      }

      // 3. ОЧИЩАЕМ КОРЗИНУ (только после успеха)
      await cart.clearCart();
      console.log('🗑️ Cart cleared');

      // 4. SUCCESS
      setOrderStage('success');
      toast.success('Заказ успешно оплачен!');

    } catch (error: any) {
      console.error('❌ Error in payment flow:', error);
      toast.error(error.message || 'Ошибка оформления заказа');
    } finally {
      setIsProcessing(false);
    }
  };

  // ОТКЛОНЕНИЕ ОПЛАТЫ - НЕ создаем заказ, НЕ очищаем корзину, просто возвращаемся
  const handlePaymentCancelled = async () => {
    console.log('❌ Payment cancelled');

    // Просто возвращаемся в корзину
    setOrderStage('cart');

    toast('Вы можете попробовать оплатить позже', {
      icon: '💭',
    });
  };

  const totals = cart.calculateTotals();
  const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} ₸`;

  // Разделяем товары на обычные и подарки
  const regularItems = cart.cartItems.filter(item => !item.is_gift);
  const giftItems = cart.cartItems.filter(item => item.is_gift);

  // Находим применимую акцию
  const applicablePromotion = activePromotions.find(
    promo => promo.min_purchase_amount <= totals.subtotal
  );

  // ==========================================
  // SUCCESS SCREEN
  // ==========================================
  if (orderStage === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white rounded-3xl p-8 text-center shadow-2xl border border-gray-100">
          <div className="inline-flex p-6 bg-green-50 rounded-full mb-6">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Заказ оплачен!
          </h2>
          <p className="text-gray-600 mb-8">
            Спасибо за оплату. Ваш заказ принят в обработку.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/dealer/shop/orders')}
              className="w-full px-8 py-3 bg-gradient-to-r from-[#D77E6C] to-[#E09080] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Перейти к моим заказам
            </button>
            <button
              onClick={() => router.push('/dealer/shop')}
              className="w-full px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              Продолжить покупки
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAYMENT SCREEN
  // ==========================================
  if (orderStage === 'payment') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 md:p-4">
        <MoreHeaderDE title="Оплата заказа" showBackButton={false} />
        
        <div className="max-w-2xl mx-auto mt-6">
          <KaspiPaymentFlow
            totalAmount={totals.total}
            onPaymentConfirmed={handlePaymentConfirmed}
            onPaymentCancelled={handlePaymentCancelled}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    );
  }

  // ==========================================
  // LOADING
  // ==========================================
  if (userLoading || (cart.loading && cart.cartItems.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#D77E6C] animate-spin" />
          <p className="text-gray-500">Загружаем корзину...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  // ==========================================
  // EMPTY CART
  // ==========================================
  if (cart.cartItems.length === 0) {
    return (
      <div className="min-h-screen p-2 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <MoreHeaderDE title="Корзина" showBackButton={true} />
        
        <div className="flex flex-col items-center justify-center py-20">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 max-w-md w-full">
            <div className="w-32 h-32 bg-gradient-to-br from-[#D77E6C]/10 to-[#E09080]/10 rounded-full mx-auto mb-6 flex items-center justify-center">
              <ShoppingCart className="w-16 h-16 text-[#D77E6C]" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Корзина пуста
            </h2>
            <p className="text-gray-500 mb-8 text-center">
              Добавьте товары из каталога
            </p>
            
            <button 
              onClick={() => router.push('/dealer/shop')}
              className="w-full py-3 bg-gradient-to-r from-[#D77E6C] to-[#E09080] text-white rounded-xl hover:shadow-lg transition-all font-medium"
            >
              Перейти в магазин
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // CART VIEW
  // ==========================================
  return (
    <div className="min-h-screen p-2 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <MoreHeaderDE title="Корзина" showBackButton={true} />
      
      <div className="mx-auto mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT - CART ITEMS */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* АКЦИЯ - БАННЕР */}
            {!loadingPromotions && applicablePromotion && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">🎁 {applicablePromotion.name}</h3>
                    {applicablePromotion.description && (
                      <p className="text-white/90 text-sm mb-3">{applicablePromotion.description}</p>
                    )}
                    <div className="bg-white/20 rounded-lg p-3">
                      <p className="text-sm font-medium">
                        ✨ Ваши подарки автоматически добавлены в корзину!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ПРОГРЕСС ДО АКЦИИ */}
            {!loadingPromotions && !applicablePromotion && activePromotions.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-purple-200">
                <div className="flex items-start gap-4">
                  <Gift className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    {activePromotions.map(promo => {
                      const remaining = promo.min_purchase_amount - totals.subtotal;
                      if (remaining > 0) {
                        const progress = (totals.subtotal / promo.min_purchase_amount) * 100;
                        return (
                          <div key={promo.id} className="mb-4 last:mb-0">
                            <p className="text-gray-900 font-medium mb-2">
                              {promo.name}
                            </p>
                            <p className="text-sm text-gray-600 mb-3">
                              Добавьте еще <strong className="text-purple-600">{formatPrice(remaining)}</strong> для получения подарка
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>
            )}
            
            {/* VALIDATION ERRORS */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-2">Исправьте ошибки:</h3>
                    <ul className="space-y-1">
                      {validationErrors.map((error, i) => (
                        <li key={i} className="text-sm text-red-700">• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {/* SELECT ALL - только для обычных товаров */}
            {regularItems.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={cart.selectedItems.size === regularItems.filter(i => i.stock > 0).length && cart.selectedItems.size > 0}
                      onChange={() => cart.toggleSelectAll()}
                      className="w-5 h-5 text-[#D77E6C] rounded-md focus:ring-[#D77E6C]"
                    />
                    <span className="font-medium text-gray-900">
                      Выбрать все ({regularItems.filter(i => i.stock > 0).length})
                    </span>
                  </div>
                  <span className="text-lg font-bold text-[#D77E6C]">
                    {formatPrice(totals.subtotal)}
                  </span>
                </label>
              </div>
            )}

            {/* ВСЕ ТОВАРЫ (ОБЫЧНЫЕ + ПОДАРКИ) С АНИМАЦИЕЙ */}
            <div className="relative">
              {/* Оверлей при обновлении */}
              {isRefreshing && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 rounded-2xl flex items-center justify-center">
                  <div className="bg-white rounded-xl shadow-lg p-4 flex items-center gap-3">
                    <Loader2 className="w-6 h-6 text-[#D77E6C] animate-spin" />
                    <span className="text-gray-700 font-medium">Обновление корзины...</span>
                  </div>
                </div>
              )}
              
              <div className={`space-y-4 transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
                {cart.cartItems.map(item => {
                  const isOutOfStock = item.stock === 0;
                  const isUpdating = cart.loadingStates.updatingItem.get(item.id);
                  const isRemoving = cart.loadingStates.removingItem.get(item.id);
                  const isGift = item.is_gift;
                  
                  return (
                    <div 
                      key={item.id} 
                      className={`bg-white rounded-2xl shadow-sm p-5 relative transition-all duration-300 transform ${
                        isGift ? 'ring-2 ring-purple-400 bg-gradient-to-br from-purple-50/30 to-pink-50/30 animate-fadeIn' : (
                          isOutOfStock ? 'opacity-60' : cart.selectedItems.has(item.id) ? 'ring-2 ring-[#D77E6C]' : ''
                        )
                      }`}
                    >
                      {(isUpdating || isRemoving) && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-2xl">
                          <Loader2 className="w-8 h-8 text-[#D77E6C] animate-spin" />
                        </div>
                      )}
                      
                      {/* Бейдж ПОДАРОК */}
                      {isGift && (
                        <div className="absolute -top-2 -right-2 z-10 animate-bounce">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                            <Gift className="w-4 h-4" />
                            <span className="text-xs font-bold">ПОДАРОК</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-4">
                        {/* CHECKBOX - только для обычных товаров */}
                        {!isGift && (
                          <div className="flex items-center pt-2">
                            <input
                              type="checkbox"
                              checked={cart.selectedItems.has(item.id)}
                              onChange={() => cart.toggleItemSelection(item.id)}
                              disabled={isOutOfStock}
                              className="w-5 h-5 text-[#D77E6C] rounded-md focus:ring-[#D77E6C] disabled:opacity-50"
                            />
                          </div>
                        )}

                        {/* IMAGE */}
                        <div className="relative w-28 h-28">
                          <Image
                            src={item.image || '/placeholder.png'}
                            alt={item.name}
                            fill
                            className={`object-cover rounded-xl ${isGift ? 'ring-2 ring-purple-300' : ''}`}
                          />
                          {isOutOfStock && !isGift && (
                            <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                              <span className="text-white text-sm font-medium px-2 py-1 bg-red-500 rounded">
                                Нет в наличии
                              </span>
                            </div>
                          )}
                          {isGift && (
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                              <Gift className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>

                        {/* INFO */}
                        <div className="flex-1">
                          <div className="flex justify-between mb-3">
                            <div className="flex-1 mr-3">
                              <h3 className="font-semibold text-gray-900">{item.name}</h3>
                              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                {isGift && <Sparkles className="w-3 h-3 text-purple-500" />}
                                {item.category}
                              </p>
                            </div>
                            {!isGift && (
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X className="w-5 h-5 text-gray-400 hover:text-red-500" />
                              </button>
                            )}
                          </div>

                          <div className="flex items-end justify-between">
                            <div>
                              {isGift ? (
                                <>
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                      Бесплатно
                                    </span>
                                    <div className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-bold">
                                      0 ₸
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Подарок за покупку
                                  </p>
                                </>
                              ) : (
                                <>
                                  <span className="text-2xl font-bold text-[#D77E6C]">
                                    {formatPrice(item.price_dealer * item.quantity)}
                                  </span>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {formatPrice(item.price_dealer)} за шт.
                                  </p>
                                </>
                              )}
                            </div>

                            {/* QUANTITY */}
                            {!isOutOfStock && (
                              <div className={`flex items-center gap-1 rounded-xl p-1 ${
                                isGift ? 'bg-purple-100' : 'bg-gray-100'
                              }`}>
                                {!isGift ? (
                                  <>
                                    <button
                                      onClick={() => handleUpdateQuantity(item.id, -1)}
                                      disabled={item.quantity <= 1}
                                      className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg disabled:opacity-50 transition-colors"
                                    >
                                      <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-14 text-center font-semibold">{item.quantity}</span>
                                    <button
                                      onClick={() => handleUpdateQuantity(item.id, 1)}
                                      disabled={item.quantity >= item.stock}
                                      className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg disabled:opacity-50 transition-colors"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  </>
                                ) : (
                                  <div className="px-4 py-2">
                                    <span className="text-lg font-bold text-purple-700">x{item.quantity}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Информационное сообщение о подарках */}
            {giftItems.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3 animate-fadeIn">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-sm text-gray-700">
                  <p className="font-semibold text-purple-900 mb-1">ℹ️ Подарки добавлены автоматически</p>
                  <p>Эти товары будут включены в ваш заказ бесплатно. Они удалятся автоматически, если сумма заказа станет меньше минимальной.</p>
                </div>
              </div>
            )}

            {/* DELIVERY */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#D77E6C]" />
                Способ получения
              </h3>
              
              <div className="bg-gradient-to-r from-[#D77E6C]/5 to-[#E09080]/5 ring-2 ring-[#D77E6C] rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 rounded-full border-2 border-[#D77E6C] flex items-center justify-center">
                      <div className="w-3 h-3 bg-[#D77E6C] rounded-full" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Самовывоз</p>
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        г. Алматы
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-green-600 font-medium">Бесплатно</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT - SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-5">
                Итого к оплате
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Товары ({regularItems.length} шт.)</span>
                  <span className="font-medium">{formatPrice(totals.subtotal)}</span>
                </div>

                {giftItems.length > 0 && (
                  <div className="flex justify-between text-purple-600 animate-fadeIn">
                    <span className="flex items-center gap-1">
                      <Gift className="w-4 h-4" />
                      Подарки ({giftItems.length} шт.)
                    </span>
                    <span className="font-medium">Бесплатно</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Доставка</span>
                  <span className="font-medium text-green-600">Бесплатно</span>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-gray-500">К оплате</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {formatPrice(totals.total)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleProceedToPayment}
                disabled={cart.selectedItems.size === 0 || isProcessing}
                className="w-full py-4 bg-gradient-to-r from-[#D77E6C] to-[#E09080] text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Обработка...
                  </>
                ) : (
                  'Перейти к оплате'
                )}
              </button>

              <div className="mt-6 pt-6 border-t space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Защита покупателя</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Безопасная оплата</p>
                    <p className="text-gray-500">Через Kaspi Pay</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}