'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { useTranslate } from '@/hooks/useTranslate';
import { supabase } from '@/lib/supabase/client';

interface DealerProgress {
  id: string;
  name: string;
  email: string;
  turnover: number;
  progress: number;
  is_achieved: boolean;
  orders_count: number;
  last_order_date: string | null;
}

export default function EventDetailPage() {
  const { t } = useTranslate();
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id as string;
  
  const [event, setEvent] = useState<any>(null);
  const [dealers, setDealers] = useState<DealerProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'achieved' | 'close'>('all');

  useEffect(() => {
    if (eventId) {
      loadEventData();
    }
  }, [eventId]);

  const loadEventData = async () => {
    try {
      // Загружаем событие
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) {
        console.error('Error loading event:', eventError);
        return;
      }

      setEvent(eventData);

      // Загружаем всех дилеров - используем только те поля, которые точно есть
      const { data: dealersData, error: dealersError } = await supabase
        .from('users')
        .select('id, email')
        .eq('role', 'dealer');

      if (dealersError) {
        console.error('Error loading dealers:', dealersError);
        return;
      }

      console.log('Dealers found:', dealersData?.length);

      // Загружаем ВСЕ заказы для ВСЕХ дилеров
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('user_id, total_amount, created_at')
        .eq('payment_status', 'paid');

      if (ordersError) {
        console.error('Error loading orders:', ordersError);
      }

      console.log('Orders found:', orders?.length);

      // Обрабатываем данные дилеров
      const dealerProgressData: DealerProgress[] = [];
      
      if (dealersData && Array.isArray(dealersData) && dealersData.length > 0) {
        for (const dealer of dealersData) {
          // Проверяем, что dealer имеет нужные поля
          if (!dealer || typeof dealer !== 'object') continue;
          
          const dealerId = (dealer as any).id;
          const dealerEmail = (dealer as any).email;
          
          if (!dealerId) continue;
          
          // Фильтруем заказы для текущего дилера
          const dealerOrders = orders?.filter(o => o.user_id === dealerId) || [];
          
          // Считаем товарооборот
          const turnover = dealerOrders.reduce((sum, order) => {
            return sum + (Number(order.total_amount) || 0);
          }, 0);
          
          // Получаем target_amount из события
          const targetAmount = Number((eventData as any)?.target_amount || 
                                     (eventData as any)?.goals?.[0] || 
                                     0);
          const progress = targetAmount > 0 ? Math.min((turnover / targetAmount) * 100, 100) : 0;
          
          // Находим последний заказ
          const sortedOrders = [...dealerOrders].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          const lastOrder = sortedOrders[0];

          dealerProgressData.push({
            id: dealerId,
            name: dealerEmail?.split('@')[0] || 'Дилер', // Используем часть email как имя
            email: dealerEmail || '',
            turnover: turnover,
            progress: progress,
            is_achieved: turnover >= targetAmount,
            orders_count: dealerOrders.length,
            last_order_date: lastOrder?.created_at || null
          });
        }
      }

      // Сортируем по товарообороту (от большего к меньшему)
      dealerProgressData.sort((a, b) => b.turnover - a.turnover);
      
      console.log('Processed dealers:', dealerProgressData);
      setDealers(dealerProgressData);
      
    } catch (error) {
      console.error('Error loading event data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">{t('Событие не найдено')}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            {t('Назад')}
          </button>
        </div>
      </div>
    );
  }

  // Фильтруем дилеров по вкладкам
  let filteredDealers = dealers;
  if (activeTab === 'achieved') {
    filteredDealers = dealers.filter(d => d.is_achieved);
  } else if (activeTab === 'close') {
    filteredDealers = dealers.filter(d => !d.is_achieved && d.progress >= 50);
  }

  // Подсчитываем статистику
  const totalParticipants = dealers.length;
  const achievedCount = dealers.filter(d => d.is_achieved).length;
  const closeCount = dealers.filter(d => !d.is_achieved && d.progress >= 50).length;
  const totalTurnover = dealers.reduce((sum, d) => sum + d.turnover, 0);
  const averageTurnover = totalParticipants > 0 ? totalTurnover / totalParticipants : 0;

  // Получаем target_amount и reward безопасно
  const targetAmount = Number((event as any)?.target_amount || (event as any)?.goals?.[0] || 0);
  const reward = (event as any)?.reward || (event as any)?.rewards?.[0] || '-';

  return (
    <div className="p-4 md:p-6 space-y-6">
      <MoreHeaderAD title={event.title} />

      {/* Основная информация */}
      <div className="bg-white rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">{t('Всего участников')}</p>
            <p className="text-2xl font-bold text-gray-900">{totalParticipants}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">{t('Достигли цели')}</p>
            <p className="text-2xl font-bold text-green-600">{achievedCount}</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">{t('Близки к цели (>50%)')}</p>
            <p className="text-2xl font-bold text-orange-600">{closeCount}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">{t('Средний товарооборот')}</p>
            <p className="text-xl font-bold text-blue-600">
              {averageTurnover.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₸
            </p>
          </div>
        </div>

        {event.description && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <p className="text-gray-700">{event.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <p className="text-sm text-gray-600">{t('Цель')}</p>
            <p className="font-semibold text-lg">
              {targetAmount.toLocaleString('ru-RU')} ₸
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">{t('Награда')}</p>
            <p className="font-semibold text-lg text-orange-600">{reward}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">{t('Статус')}</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm ${
              event.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {event.status === 'active' ? t('Активно') : t('Завершено')}
            </span>
          </div>
        </div>
      </div>

      {/* Вкладки */}
      <div className="bg-white rounded-2xl p-6">
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'all' 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('Все участники')} ({totalParticipants})
          </button>
          <button
            onClick={() => setActiveTab('achieved')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'achieved' 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('Достигли цели')} ({achievedCount})
          </button>
          <button
            onClick={() => setActiveTab('close')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'close' 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('Близки к цели')} ({closeCount})
          </button>
        </div>

        {/* Таблица участников */}
        {filteredDealers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('Нет участников в этой категории')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">#</th>
                  <th className="text-left py-3 px-4">{t('Участник')}</th>
                  <th className="text-left py-3 px-4">{t('Товарооборот')}</th>
                  <th className="text-left py-3 px-4">{t('Прогресс')}</th>
                  <th className="text-left py-3 px-4">{t('Заказов')}</th>
                  <th className="text-left py-3 px-4">{t('Последний заказ')}</th>
                  <th className="text-left py-3 px-4">{t('Статус')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredDealers.map((dealer, index) => (
                  <tr key={dealer.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {activeTab === 'all' && index === 0 && dealer.turnover > 0 && '🥇'}
                      {activeTab === 'all' && index === 1 && dealer.turnover > 0 && '🥈'}
                      {activeTab === 'all' && index === 2 && dealer.turnover > 0 && '🥉'}
                      {(index > 2 || activeTab !== 'all' || dealer.turnover === 0) && (index + 1)}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{dealer.name}</p>
                        <p className="text-sm text-gray-500">{dealer.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      {dealer.turnover.toLocaleString('ru-RU')} ₸
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div 
                            className={`h-2 rounded-full ${
                              dealer.is_achieved ? 'bg-green-500' : 
                              dealer.progress >= 50 ? 'bg-orange-500' : 'bg-gray-400'
                            }`}
                            style={{ width: `${dealer.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{dealer.progress.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{dealer.orders_count}</td>
                    <td className="py-3 px-4">
                      {dealer.last_order_date 
                        ? new Date(dealer.last_order_date).toLocaleDateString('ru-RU')
                        : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {dealer.is_achieved ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          {t('Достигнуто')}
                        </span>
                      ) : dealer.progress >= 50 ? (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                          {t('В процессе')}
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          {t('Начало')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}