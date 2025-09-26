import React, { useState, useEffect } from 'react';
import {
  User, MapPin, Phone, Mail,
  CheckCircle, Package, AlertCircle, CreditCard, Loader2
} from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface CheckoutProps {
  purchaseId: string;
  userId: string;
  cart: any[];
  onClose: () => void;
  onPaymentComplete?: () => void;
}

export default function TeamPurchaseCheckout({
  purchaseId,
  userId,
  cart,
  onClose,
  onPaymentComplete
}: CheckoutProps) {
  const { profile } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [memberData, setMemberData] = useState<any>(null);

  // Выводим профиль для отладки
  useEffect(() => {
    if (profile) {
      console.log('User profile data:', profile);
      console.log('Available profile fields:', Object.keys(profile));
    }
  }, [profile]);

  // Расчет сумм
  const subtotal = cart.reduce((sum, item) => sum + (item.total || 0), 0);
  const total = subtotal;

  useEffect(() => {
    loadMemberData();
  }, [userId, purchaseId]);

  const loadMemberData = async () => {
    try {
      // Загружаем данные участника
      const { data: member, error: memberError } = await supabase
        .from('team_purchase_members')
        .select('*')
        .eq('team_purchase_id', purchaseId)
        .eq('user_id', userId)
        .single();

      if (memberError) {
        console.error('Error loading member data:', memberError);
        return;
      }

      setMemberData(member);
    } catch (error) {
      console.error('Error in loadMemberData:', error);
    }
  };

  const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} ₸`;

  const handleCreateOrder = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Генерируем номер заказа для отображения (не для БД)
      const orderNumber = `TEAM-${Date.now()}`;
      
      // Сначала обновляем статус участника на "purchased" (купил)
      const { error: memberError } = await supabase
        .from('team_purchase_members')
        .update({
          status: 'purchased',
          purchased_at: new Date().toISOString(),
          contribution_actual: total, // Фактический взнос
          updated_at: new Date().toISOString()
        })
        .eq('team_purchase_id', purchaseId)
        .eq('user_id', userId);

      if (memberError) throw memberError;

      // Получаем member_id для создания заказа
      const { data: memberData } = await supabase
        .from('team_purchase_members')
        .select('id')
        .eq('team_purchase_id', purchaseId)
        .eq('user_id', userId)
        .single();

      if (memberData) {
        // Создаем запись о платеже в team_purchase_orders
        // НЕ передаем order_id, пусть генерируется автоматически как UUID
        const { data: orderData, error: orderError } = await supabase
          .from('team_purchase_orders')
          .insert({
            team_purchase_id: purchaseId,
            user_id: userId,
            member_id: memberData.id,
            order_amount: total,
            payment_status: 'paid',
            payment_method: 'card',
            created_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (orderError) throw orderError;
        
        // Используем реальный UUID из БД для отображения
        if (orderData) {
          setOrderId(orderData.id);
        } else {
          setOrderId(`ORDER-${Date.now()}`);
        }
      } else {
        // Если member_id не найден, все равно создаем номер заказа
        setOrderId(`ORDER-${Date.now()}`);
      }

      // Обновляем статус товаров в корзине (опционально)
      // Таблица team_purchase_carts может не существовать или иметь другие значения для status
      // Поэтому просто удаляем записи из корзины после оплаты
      const { error: cartError } = await supabase
        .from('team_purchase_carts')
        .delete()
        .eq('team_purchase_id', purchaseId)
        .eq('user_id', userId);

      if (cartError) {
        console.warn('Cart cleanup warning (non-critical):', cartError);
        // Не прерываем процесс, так как это не критично
      }

      setIsSuccess(true);
      
      if (onPaymentComplete) {
        onPaymentComplete();
      }
      
      // Переход через 3 секунды
      setTimeout(() => {
        router.push('/dealer/myteam');
      }, 3000);

    } catch (error: any) {
      console.error('Error creating order:', error);
      setError('Ошибка при создании заказа. Попробуйте еще раз.');
      toast.error('Ошибка оформления заказа');
    } finally {
      setLoading(false);
    }
  };

  // Простой попап успеха
  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Заказ успешно оплачен!
          </h2>
          
          <p className="text-xl text-gray-600 mb-6">
            Ваш заказ оформлен и добавлен в совместную закупку
          </p>
          
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">ID заказа:</p>
            <p className="font-mono text-lg font-bold text-gray-800">{orderId}</p>
          </div>
          
          <p className="text-gray-500">
            Переход в личный кабинет через 3 секунды...
          </p>
        </div>
      </div>
    );
  }

  // Основной экран оформления
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Заголовок */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#D77E6C] to-[#E89380]">
          <h2 className="text-2xl font-bold text-white">Оформление заказа</h2>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Ошибка если есть */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">{error}</p>
                <p className="text-xs text-red-700 mt-1">
                  Проверьте корзину и попробуйте снова
                </p>
              </div>
            </div>
          )}

          {/* Информация о покупателе */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#D77E6C]" />
              Информация о покупателе
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              {profile ? (
                <>
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">
                      {profile.name || 'Имя не указано'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">
                      {profile.phone || memberData?.contact_phone || 'Телефон не указан'}
                    </span>
                  </div>
                  {(profile.address || memberData?.delivery_address) && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        {profile.address || memberData?.delivery_address}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500">Загрузка данных пользователя...</p>
              )}
            </div>
            
            {(!profile?.phone || !profile?.address) && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Рекомендуем заполнить контактные данные в профиле для связи по заказу
                </p>
              </div>
            )}
          </div>

          {/* Товары в заказе */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#D77E6C]" />
              Товары в заказе ({cart.length})
            </h3>
            <div className="space-y-3">
              {cart.map((item, index) => (
                <div key={item.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {item.product?.name || 'Товар'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(item.total || 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Расчет стоимости */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Итоговая стоимость</h3>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600">Сумма товаров:</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>

              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">К оплате:</span>
                <span className="text-2xl font-bold text-[#D77E6C]">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          </div>

          {/* Информация о совместной закупке */}
          {memberData && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                Информация о закупке
              </h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Статус участника: {memberData.status === 'active' ? 'Активен' : 
                                       memberData.status === 'purchased' ? 'Оплачено' : 
                                       memberData.status}</p>
                <p>• Дата присоединения: {new Date(memberData.joined_at).toLocaleDateString('ru-RU')}</p>
                {memberData.contribution_actual && (
                  <p>• Ваш взнос: {formatPrice(memberData.contribution_actual)}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="p-6 border-t border-gray-200 flex gap-3 bg-gray-50">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-white transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            onClick={handleCreateOrder}
            disabled={loading || cart.length === 0}
            className="flex-1 py-3 bg-[#D77E6C] text-white rounded-xl font-medium hover:bg-[#C66B5A] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Обработка...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Оформить и оплатить
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}