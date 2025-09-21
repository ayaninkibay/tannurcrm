'use client';

import React, { useEffect, useState } from 'react';
import { bonusEventService, BonusEvent, UserProgress } from '@/lib/bonus_event/BonusEventService';
import { useTranslate } from '@/hooks/useTranslate';

const CheckCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#10B981"/>
  </svg>
);

interface BonusEventProgressViewProps {
  userId: string;
}

export const BonusEventProgressView: React.FC<BonusEventProgressViewProps> = ({ userId }) => {
  const { t } = useTranslate();
  const [events, setEvents] = useState<BonusEvent[]>([]);
  const [userProgress, setUserProgress] = useState<Map<string, UserProgress>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        // Загружаем активные события
        const activeEvents = await bonusEventService.getActiveBonusEvents();
        setEvents(activeEvents);

        // Загружаем прогресс пользователя для каждого события
        const progressMap = new Map<string, UserProgress>();
        for (const event of activeEvents) {
          if (event.id) {
            const progress = await bonusEventService.getUserProgress(userId, event.id);
            if (progress) {
              progressMap.set(event.id, progress);
            }
          }
        }
        setUserProgress(progressMap);
      } catch (error) {
        console.error('Error loading bonus events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Обновляем каждую минуту для актуальности данных
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-gray-50 rounded-2xl p-8 text-center">
        <p className="text-gray-600">{t('Нет активных бонусных событий')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {events.map((event) => {
        const progress = event.id ? userProgress.get(event.id) : null;
        const currentTurnover = progress?.total_turnover || 0;
        const maxTarget = Math.max(...(event.targets?.map(t => t.target_amount) || [0]));
        const overallProgress = maxTarget > 0 ? Math.min((currentTurnover / maxTarget) * 100, 100) : 0;

        return (
          <div key={event.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Шапка события */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
              <p className="text-orange-100">{event.description}</p>
              <div className="mt-4 flex gap-6 text-sm">
                <div>
                  <span className="text-orange-200">{t('Начало')}: </span>
                  <span className="font-medium">{new Date(event.start_date).toLocaleDateString('ru-RU')}</span>
                </div>
                <div>
                  <span className="text-orange-200">{t('Окончание')}: </span>
                  <span className="font-medium">{new Date(event.end_date).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Статистика пользователя */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">{t('Ваш товарооборот')}</p>
                  <p className="text-xl font-bold text-gray-900">
                    {bonusEventService.formatAmount(currentTurnover)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">{t('Общий прогресс')}</p>
                  <p className="text-xl font-bold text-orange-600">{Math.round(overallProgress)}%</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">{t('Всего заказов')}</p>
                  <p className="text-xl font-bold text-gray-900">{progress?.total_orders || 0}</p>
                </div>
              </div>

              {/* Общий прогресс-бар */}
              <div className="mb-8">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{t('Общий прогресс к максимальной награде')}</span>
                  <span className="text-sm font-medium text-gray-700">{Math.round(overallProgress)}%</span>
                </div>
                <div className="relative">
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-1000"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                  
                  {/* Метки целей на прогресс-баре */}
                  <div className="absolute w-full -top-2">
                    {event.targets?.map((target) => {
                      const position = maxTarget > 0 ? (target.target_amount / maxTarget) * 100 : 0;
                      const isReached = currentTurnover >= target.target_amount;
                      
                      return (
                        <div 
                          key={target.id}
                          className="absolute flex flex-col items-center"
                          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isReached ? 'bg-green-500' : 'bg-gray-300'
                          }`}>
                            {isReached ? <CheckCircleIcon /> : (
                              <span className="text-xs text-white font-bold">
                                {bonusEventService.getRewardIcon(target.reward_icon)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Список целей */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">{t('Цели и награды')}</h3>
                
                {event.targets?.map((target, index) => {
                  const isAchieved = progress?.achieved_targets.includes(target.id || '') || false;
                  const targetProgress = target.target_amount > 0 
                    ? Math.min((currentTurnover / target.target_amount) * 100, 100)
                    : 0;
                  const remaining = Math.max(0, target.target_amount - currentTurnover);
                  
                  return (
                    <div 
                      key={target.id || index}
                      className={`border-2 rounded-xl p-5 transition ${
                        isAchieved 
                          ? 'border-green-200 bg-green-50/50' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${
                          isAchieved ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <span className="text-2xl">
                            {bonusEventService.getRewardIcon(target.reward_icon)}
                          </span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {target.reward_title}
                            </h4>
                            {isAchieved && (
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                                {t('Достигнуто')} ✓
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">
                            {target.reward_description}
                          </p>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">{t('Необходимо')}</span>
                              <span className="font-medium">
                                {bonusEventService.formatAmount(target.target_amount)}
                              </span>
                            </div>
                            
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${
                                  isAchieved 
                                    ? 'bg-green-500' 
                                    : 'bg-gradient-to-r from-orange-400 to-orange-600'
                                }`}
                                style={{ width: `${targetProgress}%` }}
                              />
                            </div>
                            
                            {!isAchieved && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">
                                  {t('Осталось')}: {bonusEventService.formatAmount(remaining)}
                                </span>
                                <span className="text-orange-600 font-medium">
                                  {Math.round(targetProgress)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Информация о последнем заказе */}
              {progress?.last_order_date && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{t('Последний учтенный заказ')}</span>
                    <span className="font-medium text-gray-700">
                      {new Date(progress.last_order_date).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};