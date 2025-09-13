'use client';

import React, { useState, useEffect } from 'react';
import {
  User, MapPin, Phone, Mail,
  CheckCircle, Package, Gift, 
  Truck, Calendar, Shield
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';
import { bonusService } from '@/lib/team-purchase/BonusService';
import { useRouter } from 'next/navigation';
import type { TeamPurchaseCart, User as UserType } from '@/types';
import { useTranslate } from '@/hooks/useTranslate';

interface CheckoutProps {
  purchaseId: string;
  userId: string;
  cart: TeamPurchaseCart[];
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
  const router = useRouter();
  const { t } = useTranslate();
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<UserType | null>(null);
  const [bonusInfo, setBonusInfo] = useState<any>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string>('');

  // Расчет сумм
  const subtotal = cart.reduce((sum, item) => sum + (item.total || 0), 0);

  const total = subtotal;

  useEffect(() => {
    loadUserInfo();
    loadBonusInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) setUserInfo(data);
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const loadBonusInfo = async () => {
    const info = await bonusService.calculateBonus(total);
    setBonusInfo(info);
  };

  const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} ₸`;

  const handleCreateOrder = async () => {
    setLoading(true);
    try {
      // Сначала проверяем, существует ли участник в таблице team_purchase_members
      const { data: members } = await supabase
        .from('team_purchase_members')
        .select('*')
        .eq('team_purchase_id', purchaseId)
        .eq('user_id', userId);

      if (!members || members.length === 0) {
        // Если участника нет, создаем его
        const { data: newMember, error: createMemberError } = await supabase
          .from('team_purchase_members')
          .insert({
            team_purchase_id: purchaseId,
            user_id: userId,
            role: 'member',
            status: 'accepted',
            contribution_target: 0,
            contribution_actual: 0,
            cart_total: total
          })
          .select()
          .single();

        if (createMemberError) {
          console.error('Error creating member:', createMemberError);
          throw new Error('Ошибка создания участника');
        }

        (members as any[])[0] = newMember;
      }

      const member = (members as any[])[0];

      // Генерируем уникальный ID для заказа
      const teamOrderId = crypto.randomUUID();
      const orderNumber = `TEAM-${Date.now()}`;
      
      // 1. Создаем запись в team_purchase_orders с правильным member_id
      const { error: teamOrderError } = await supabase
        .from('team_purchase_orders')
        .insert({
          id: teamOrderId,
          team_purchase_id: purchaseId,
          user_id: userId,
          member_id: member.id,
          order_id: teamOrderId,
          order_amount: total,
          payment_status: 'paid'
        });

      if (teamOrderError) {
        console.error('Team purchase order error:', teamOrderError);
        throw teamOrderError;
      }

      // 2. Обновляем статус корзины
      await supabase
        .from('team_purchase_carts')
        .update({ status: 'ordered' })
        .eq('team_purchase_id', purchaseId)
        .eq('user_id', userId)
        .eq('status', 'active');

      // 3. Обновляем статус участника
      const { error: memberUpdateError } = await supabase
        .from('team_purchase_members')
        .update({
          status: 'purchased',
          contribution_actual: total
        })
        .eq('team_purchase_id', purchaseId)
        .eq('user_id', userId);

      if (memberUpdateError) {
        console.error('Member update error:', memberUpdateError);
      }

      // 4. Обновляем прогресс командной закупки
      await updateTeamPurchaseProgress(purchaseId);

      setOrderId(orderNumber);
      setIsSuccess(true);
      
      toast.success(t('Заказ успешно оформлен и оплачен!'));
      
      // Через 2 секунды переходим на страницу team_relations
      setTimeout(() => {
        router.push('/dealer/myteam');
      }, 2000);

    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error(error.message || t('Ошибка создания заказа'));
    } finally {
      setLoading(false);
    }
  };

  // Функция обновления прогресса командной закупки
const updateTeamPurchaseProgress = async (purchaseId: string) => {
  try {
    // УДАЛИТЕ весь блок с прямым UPDATE team_purchases
    // Триггер сам все посчитает правильно!
    
    // Оставьте только проверку статуса если нужно
    const { data: teamPurchase } = await supabase
      .from('team_purchases')
      .select('target_amount, collected_amount, status')
      .eq('id', purchaseId)
      .single();

    // Меняем статус только если нужно
    if (teamPurchase && 
        teamPurchase.status === 'active' && 
        teamPurchase.collected_amount >= teamPurchase.target_amount) {
      
      await supabase
        .from('team_purchases')
        .update({ 
          status: 'active',  // Используйте правильный статус
          updated_at: new Date().toISOString()
        })
        .eq('id', purchaseId);
    }
  } catch (error) {
    console.error('Error checking team purchase progress:', error);
  }
};

  // Экран успеха
  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-[#111] mb-2">{t('Заказ оформлен!')}</h2>
          <p className="text-gray-600 mb-4">
            {t('Ваш заказ')} <span className="font-mono font-bold">{orderId}</span> {t('успешно оплачен')}
          </p>

          {bonusInfo && bonusInfo.bonusAmount > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                🎉 {t('Вам начислено {amount} бонусов!').replace('{amount}', formatPrice(bonusInfo.bonusAmount))}
              </p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">{t('Что дальше?')}</p>
            <ul className="text-sm text-left space-y-1">
              <li>✓ {t('Мы подготовим ваш заказ')}</li>
              <li>✓ {t('Отправим в течение 2-3 дней')}</li>
              <li>✓ {t('Вы получите SMS с трек-номером')}</li>
            </ul>
          </div>

          <p className="text-sm text-gray-500">
            {t('Переход на страницу команды через 2 секунды...')}
          </p>
        </div>
      </div>
    );
  }

  // Основной экран оформления
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-[#111]">{t('Оформление заказа')}</h2>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Информация о покупателе */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#111] mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              {t('Информация о покупателе')}
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{userInfo?.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{userInfo?.phone || t('Не указан')}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{userInfo?.address || t('Адрес доставки не указан')}</span>
              </div>
            </div>
          </div>

          {/* Товары в заказе */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#111] mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              {t('Товары в заказе ({n})').replace('{n}', String(cart.length))}
            </h3>
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-[#111]">{item.product?.name}</h4>
                    <p className="text-sm text-gray-500">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className="font-semibold text-[#111]">
                    {formatPrice(item.total || 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Расчет стоимости */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#111] mb-4">{t('Итоговая стоимость')}</h3>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('Сумма товаров:')}</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>

              {bonusInfo && bonusInfo.bonusAmount > 0 && (
                <div className="flex justify-between items-center text-blue-600">
                  <span className="flex items-center gap-2">
                    {t('Бонусы {n}%:').replace('{n}', String(bonusInfo.percent))}
                  </span>
                  <span className="font-medium">+{formatPrice(bonusInfo.bonusAmount)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-lg font-semibold text-[#111]">{t('К оплате:')}</span>
                <span className="text-2xl font-bold text-[#D77E6C]">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          </div>

          {/* Преимущества */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <Truck className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium">{t('Бесплатная доставка')}</p>
            </div>
            <div className="text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium">{t('Доставка 3-5 дней')}</p>
            </div>
            <div className="text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="text-sm font-medium">{t('Гарантия качества')}</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
          >
            {t('Отмена')}
          </button>
          <button
            onClick={handleCreateOrder}
            disabled={loading}
            className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                {t('Обработка...')}
              </>
            ) : (
              t('Оформить и оплатить')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}