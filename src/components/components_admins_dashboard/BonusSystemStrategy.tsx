'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { bonusEventService, BonusEvent, UserProgress } from '@/lib/bonus_event/BonusEventService';
import { useTranslate } from '@/hooks/useTranslate';

export const BonusSystemStrategy: React.FC = () => {
  const { t } = useTranslate();
  const router = useRouter();
  const [events, setEvents] = useState<BonusEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const activeEvents = await bonusEventService.getActiveBonusEvents();
      setEvents(activeEvents);
      if (activeEvents.length > 0 && activeEvents[0].id) {
        setSelectedEventId(activeEvents[0].id);
        loadLeaderboard(activeEvents[0].id);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async (eventId: string) => {
    setLoadingLeaderboard(true);
    console.log('[BonusSystemStrategy] Loading leaderboard for event:', eventId);
    
    try {
      const data = await bonusEventService.getEventLeaderboard(eventId, 100);
      console.log('[BonusSystemStrategy] Leaderboard data received:', data);
      console.log('[BonusSystemStrategy] Number of participants:', data.length);
      
      // Выведем первых 3 участников для проверки
      if (data.length > 0) {
        console.log('[BonusSystemStrategy] Top 3 participants:');
        data.slice(0, 3).forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.full_name}: ${user.total_turnover} KZT (${user.total_orders} orders)`);
        });
      }
      
      setLeaderboard(data);
    } catch (error) {
      console.error('[BonusSystemStrategy] Error loading leaderboard:', error);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId);
    loadLeaderboard(eventId);
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Шапка с выбором события */}
      <div className="bg-white rounded-2xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('Управление бонусными событиями')}</h2>
            <p className="text-gray-600 mt-1">{t('Отслеживайте прогресс участников в реальном времени')}</p>
          </div>
          <button
            onClick={() => router.push('/admin/dashboard/create_event')}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
          >
            + {t('Создать событие')}
          </button>
        </div>

        {/* Селектор события */}
        {events.length > 0 && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('Выберите событие')}
            </label>
            <select
              value={selectedEventId || ''}
              onChange={(e) => handleEventChange(e.target.value)}
              className="w-full md:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.title} ({new Date(event.start_date).toLocaleDateString('ru-RU')} - {new Date(event.end_date).toLocaleDateString('ru-RU')})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Информация о событии */}
      {selectedEvent && (
        <div className="bg-white rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">{selectedEvent.title}</h3>
          <p className="text-gray-600 mb-6">{selectedEvent.description}</p>
          
          {/* Цели события */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedEvent.targets?.map((target, index) => (
              <div key={target.id || index} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{bonusEventService.getRewardIcon(target.reward_icon)}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{target.reward_title}</p>
                    <p className="text-sm text-gray-600">
                      {t('Цель')}: {bonusEventService.formatAmount(target.target_amount)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{target.reward_description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Таблица участников */}
      {selectedEvent && (
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">{t('Рейтинг участников')}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {t('Всего участников')}: {leaderboard.length}
            </p>
          </div>

          {loadingLeaderboard ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('Место')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('Участник')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('Товарооборот')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('Заказов')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('Достигнутые цели')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('Последний заказ')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard.map((user, index) => {
                    const achievedTargetsCount = selectedEvent.targets?.filter(target => 
                      user.total_turnover >= target.target_amount
                    ).length || 0;
                    
                    return (
                      <tr key={user.user_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                            index < 3 ? 'bg-orange-100 text-orange-600 font-bold' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {bonusEventService.formatAmount(user.total_turnover)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-medium text-gray-900">
                            {user.total_orders}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-1">
                            {selectedEvent.targets?.map((target, idx) => {
                              const isAchieved = user.total_turnover >= target.target_amount;
                              return (
                                <div
                                  key={idx}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                                    isAchieved 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-gray-100 text-gray-400'
                                  }`}
                                  title={target.reward_title}
                                >
                                  {bonusEventService.getRewardIcon(target.reward_icon)}
                                </div>
                              );
                            })}
                          </div>
                          <span className="text-xs text-gray-500 mt-1">
                            {achievedTargetsCount} {t('из')} {selectedEvent.targets?.length || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.last_order_date 
                            ? new Date(user.last_order_date).toLocaleDateString('ru-RU')
                            : '-'
                          }
                        </td>
                      </tr>
                    );
                  })}
                  
                  {leaderboard.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        {t('Пока нет участников с товарооборотом')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Статистика */}
      {selectedEvent && leaderboard.length > 0 && (
        <div className="bg-white rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">{t('Статистика события')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-blue-600 mb-1">{t('Общий товарооборот')}</p>
              <p className="text-xl font-bold text-blue-900">
                {bonusEventService.formatAmount(
                  leaderboard.reduce((sum, user) => sum + user.total_turnover, 0)
                )}
              </p>
            </div>
            
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-sm text-green-600 mb-1">{t('Всего заказов')}</p>
              <p className="text-xl font-bold text-green-900">
                {leaderboard.reduce((sum, user) => sum + user.total_orders, 0)}
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-sm text-purple-600 mb-1">{t('Активных участников')}</p>
              <p className="text-xl font-bold text-purple-900">
                {leaderboard.length}
              </p>
            </div>
            
            <div className="bg-orange-50 rounded-xl p-4">
              <p className="text-sm text-orange-600 mb-1">{t('Средний чек')}</p>
              <p className="text-xl font-bold text-orange-900">
                {bonusEventService.formatAmount(
                  leaderboard.reduce((sum, user) => sum + user.total_turnover, 0) /
                  Math.max(1, leaderboard.reduce((sum, user) => sum + user.total_orders, 0))
                )}
              </p>
            </div>
          </div>
          
          {/* Достижения по целям */}
          <div className="mt-6">
            <h4 className="text-base font-medium mb-3">{t('Достижение целей')}</h4>
            <div className="space-y-3">
              {selectedEvent.targets?.map((target, index) => {
                const achievedCount = leaderboard.filter(user => 
                  user.total_turnover >= target.target_amount
                ).length;
                const achievedPercent = leaderboard.length > 0 
                  ? (achievedCount / leaderboard.length) * 100 
                  : 0;
                
                return (
                  <div key={target.id || index} className="flex items-center gap-4">
                    <span className="text-2xl">{bonusEventService.getRewardIcon(target.reward_icon)}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {target.reward_title}
                        </span>
                        <span className="text-sm text-gray-600">
                          {achievedCount} {t('из')} {leaderboard.length} ({Math.round(achievedPercent)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-600"
                          style={{ width: `${achievedPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};