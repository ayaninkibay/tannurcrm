'use client';
      
import React, { useEffect, useState } from 'react';
import { bonusEventService, BonusEvent, UserProgress } from '@/lib/bonus_event/BonusEventService';
import { useTranslate } from '@/hooks/useTranslate';
import { Trophy, Target, TrendingUp, Calendar, Star, Gift, Clock, CheckCircle2, MapPin, Flag } from 'lucide-react';

interface BonusEventProgressViewProps {
  userId: string;
  includeTeam?: boolean;
}

export const BonusEventProgressView: React.FC<BonusEventProgressViewProps> = ({ userId, includeTeam }) => {
  const { t } = useTranslate();
  const [events, setEvents] = useState<BonusEvent[]>([]);
  const [userProgress, setUserProgress] = useState<Map<string, UserProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        const activeEvents = await bonusEventService.getActiveBonusEvents();
        setEvents(activeEvents);
        
        if (activeEvents.length > 0 && !selectedEventId) {
          setSelectedEventId(activeEvents[0].id || null);
        }

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
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [userId, selectedEventId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="relative">
          <div className="w-12 h-12 border-3 border-gray-200 rounded-full"></div>
          <div className="w-12 h-12 border-3 border-[#D77E6C] rounded-full absolute top-0 left-0 animate-spin border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 lg:p-12 text-center shadow-lg shadow-gray-200/50">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
          <Gift className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 font-medium">{t('Нет активных бонусных событий')}</p>
        <p className="text-sm text-gray-500 mt-1">{t('События появятся здесь')}</p>
      </div>
    );
  }

  const selectedEvent = events.find(e => e.id === selectedEventId) || events[0];
  const progress = selectedEvent.id ? userProgress.get(selectedEvent.id) : null;
  const currentTurnover = progress?.total_turnover || 0;

  const daysLeft = Math.ceil(
    (new Date(selectedEvent.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`
    if (price >= 1000) return `${Math.round(price / 1000)}K`
    return price.toLocaleString('ru-RU');
  };

  return (
    <div>
      {/* Табы событий */}
      {events.length > 1 && (
        <div className="mb-4 lg:mb-6 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">
          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => setSelectedEventId(event.id || null)}
              className={`px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl font-medium transition-all whitespace-nowrap text-sm lg:text-base ${
                selectedEvent.id === event.id
                  ? 'bg-gradient-to-r from-[#D77E6C] to-[#E89380] text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
              }`}
            >
              {event.title}
            </button>
          ))}
        </div>
      )}

      {/* Основная карточка */}
      <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        {/* Заголовок */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl lg:text-2xl font-semibold text-gray-900">
                {selectedEvent.title}
              </h3>
              <p className="text-sm lg:text-base text-gray-500 mt-0.5">{selectedEvent.description}</p>
            </div>
            
            <div className="flex items-center gap-3">
              {daysLeft > 0 && daysLeft <= 30 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {t('Осталось {n} дней').replace('{n}', String(daysLeft))}
                </span>
              )}
              <div className="p-2.5 bg-gradient-to-r from-[#D77E6C] to-[#E89380] text-white rounded-xl shadow-md">
                <Trophy className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className="bg-gradient-to-br from-[#D77E6C]/10 via-[#D77E6C]/5 to-white rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#D77E6C]/20 to-transparent rounded-full -translate-y-6 translate-x-6"></div>
              <div className="relative">
                <div className="text-2xl lg:text-3xl font-bold text-[#D77E6C]">{formatPrice(currentTurnover)}</div>
                <div className="text-xs lg:text-sm text-[#D77E6C]/70 font-medium">{t('₸ оборот')}</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#E89380]/10 via-[#E89380]/5 to-white rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#E89380]/20 to-transparent rounded-full -translate-y-6 translate-x-6"></div>
              <div className="relative">
                <div className="text-2xl lg:text-3xl font-bold text-[#D77E6C]">
                  {progress?.achieved_targets.length || 0}/{selectedEvent.targets?.length || 0}
                </div>
                <div className="text-xs lg:text-sm text-[#D77E6C]/70 font-medium">{t('целей')}</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white rounded-2xl p-4 relative overflow-hidden hidden lg:block">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full -translate-y-6 translate-x-6"></div>
              <div className="relative">
                <div className="text-2xl lg:text-3xl font-bold text-emerald-600">
                  {progress?.total_orders || 0}
                </div>
                <div className="text-xs lg:text-sm text-emerald-600/70 font-medium">{t('заказов')}</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white rounded-2xl p-4 relative overflow-hidden hidden lg:block">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full -translate-y-6 translate-x-6"></div>
              <div className="relative">
                <div className="text-2xl lg:text-3xl font-bold text-amber-600">
                  {(() => {
                    const nextTarget = selectedEvent.targets?.find(t => currentTurnover < t.target_amount);
                    if (nextTarget) {
                      const progress = (currentTurnover / nextTarget.target_amount) * 100;
                      return `${Math.round(progress)}%`;
                    }
                    return '100%';
                  })()}
                </div>
                <div className="text-xs lg:text-sm text-amber-600/70 font-medium">{t('прогресс')}</div>
              </div>
            </div>
          </div>

          {/* Дорожная карта прогресса */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base lg:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 lg:w-5 lg:h-5 text-[#D77E6C]" />
                {t('Ваша дорожная карта')}
              </h4>
            </div>

            <div className="relative px-8">
              {/* Линия прогресса */}
              <div className="absolute top-6 left-8 right-8 h-1 bg-gray-200 rounded-full"></div>
              
              {/* Пройденный путь */}
              <div 
                className="absolute top-6 left-8 h-1 bg-gradient-to-r from-[#D77E6C] to-[#E89380] rounded-full transition-all duration-700"
                style={{ 
                  width: `calc(${(() => {
                    const maxTarget = Math.max(...(selectedEvent.targets?.map(t => t.target_amount) || [0]));
                    const progress = maxTarget > 0 ? Math.min((currentTurnover / maxTarget) * 100, 100) : 0;
                    return progress;
                  })()}% * (100% - 64px) / 100%)` 
                }}
              ></div>

              {/* Точки целей */}
              <div className="relative flex justify-between">
                {/* Стартовая точка */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#D77E6C] to-[#E89380] rounded-full flex items-center justify-center shadow-lg z-10">
                    <Flag className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{t('Старт')}</span>
                </div>

                {/* Цели */}
                {selectedEvent.targets?.map((target, index, array) => {
                  const isAchieved = currentTurnover >= target.target_amount;
                  const maxTarget = Math.max(...(selectedEvent.targets?.map(t => t.target_amount) || [1]));
                  // Рассчитываем позицию с учетом отступов (не от 0 до 100, а от 10 до 90)
                  const position = 10 + (target.target_amount / maxTarget) * 80;
                  
                  return (
                    <div 
                      key={target.id || index}
                      className="absolute flex flex-col items-center"
                      style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg z-10 transition-all ${
                        isAchieved 
                          ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 scale-110' 
                          : 'bg-white border-3 border-gray-300'
                      }`}>
                        {isAchieved ? (
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        ) : (
                          <span className="text-lg">
                            {bonusEventService.getRewardIcon(target.reward_icon)}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <span className={`text-xs font-medium ${
                          isAchieved ? 'text-emerald-600' : 'text-gray-600'
                        }`}>
                          {target.reward_title}
                        </span>
                        <div className={`text-xs ${
                          isAchieved ? 'text-emerald-500' : 'text-gray-400'
                        }`}>
                          {formatPrice(target.target_amount)} ₸
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Список целей (сохраняем прежний стиль) */}
          <div className="mt-16">
            <h4 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 lg:w-5 lg:h-5 text-[#D77E6C]" />
              {t('Детали наград')}
            </h4>
            
            <div className="space-y-3 lg:space-y-4">
              {selectedEvent.targets?.map((target, index) => {
                const isAchieved = currentTurnover >= target.target_amount;
                const targetProgress = target.target_amount > 0 
                  ? Math.min((currentTurnover / target.target_amount) * 100, 100)
                  : 0;
                const remaining = Math.max(0, target.target_amount - currentTurnover);
                
                return (
                  <div 
                    key={target.id || index}
                    className={`rounded-xl lg:rounded-2xl p-4 lg:p-6 border transition-all ${
                      isAchieved 
                        ? 'bg-emerald-50 border-emerald-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className={`hidden sm:flex w-12 h-12 lg:w-14 lg:h-14 rounded-xl items-center justify-center flex-shrink-0 ${
                        isAchieved ? 'bg-emerald-100' : 'bg-white'
                      }`}>
                        <span className="text-xl lg:text-2xl">
                          {bonusEventService.getRewardIcon(target.reward_icon)}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-1">
                              {target.reward_title}
                            </h3>
                            <p className="text-xs lg:text-sm text-gray-600">
                              {target.reward_description}
                            </p>
                          </div>
                          {isAchieved && (
                            <CheckCircle2 className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-500 flex-shrink-0 ml-2" />
                          )}
                        </div>
                        
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between text-xs lg:text-sm">
                            <span className="text-gray-500">{t('Необходимо')}</span>
                            <span className="font-semibold text-gray-900">
                              {target.target_amount.toLocaleString('ru-RU')} ₸
                            </span>
                          </div>
                          
                          <div className="relative">
                            <div className="w-full bg-gray-200 rounded-full h-2 lg:h-2.5 overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-700 ${
                                  isAchieved 
                                    ? 'bg-emerald-500' 
                                    : 'bg-gradient-to-r from-[#D77E6C] to-[#E89380]'
                                }`}
                                style={{ width: `${targetProgress}%` }}
                              />
                            </div>
                          </div>
                          
                          {!isAchieved && (
                            <div className="flex items-center justify-between text-xs lg:text-sm">
                              <span className="text-gray-500">
                                {t('Осталось')}: <span className="font-semibold text-gray-700">{remaining.toLocaleString('ru-RU')} ₸</span>
                              </span>
                              <span className="font-bold text-[#D77E6C]">
                                {Math.round(targetProgress)}%
                              </span>
                            </div>
                          )}
                          
                          {isAchieved && (
                            <div className="text-xs lg:text-sm font-medium text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                              {t('Цель достигнута')}
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

          {/* Последний заказ */}
          {progress?.last_order_date && (
            <div className="mt-6 lg:mt-8 p-3 lg:p-4 bg-gray-50 rounded-xl flex items-center gap-3">
              <Calendar className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 flex-shrink-0" />
              <div className="text-xs lg:text-sm">
                <span className="text-gray-500">{t('Последний заказ')}: </span>
                <span className="font-medium text-gray-700">
                  {new Date(progress.last_order_date).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};