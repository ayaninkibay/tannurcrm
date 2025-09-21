'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { bonusEventService, BonusEvent, UserProgress } from '@/lib/bonus_event/BonusEventService';
import { useTranslate } from '@/hooks/useTranslate';

// SVG иконки
const TrophyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V19H7v2h10v-2h-4v-3.1a5.01 5.01 0 003.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" 
    fill="#EA580C"/>
  </svg>
);

interface BonusProgressCardProps {
  userId?: string;
}

export const BonusProgressCard: React.FC<BonusProgressCardProps> = ({ userId }) => {
  const { t } = useTranslate();
  const router = useRouter();
  const [events, setEvents] = useState<BonusEvent[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
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

        // Если есть активные события, загружаем прогресс пользователя для первого события
        if (activeEvents.length > 0 && activeEvents[0].id) {
          const progress = await bonusEventService.getUserProgress(userId, activeEvents[0].id);
          setUserProgress(progress);
        }
      } catch (error) {
        console.error('Error loading bonus data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 animate-pulse h-full">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div className="h-6 bg-gray-200 rounded w-2/3 mb-3"></div>
        <div className="h-2 bg-gray-200 rounded-full"></div>
      </div>
    );
  }

  // Если нет активных событий или нет прогресса
  if (events.length === 0 || !userProgress) {
    return (
      <div 
        className="bg-white rounded-2xl p-5 h-full cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => router.push('/dealer/dashboard/bonus_program')}
      >
        <div className="flex items-center gap-2 mb-3">
          <TrophyIcon />
          <h3 className="text-base font-semibold">{t('Бонусная программа')}</h3>
        </div>
        <p className="text-sm text-gray-500">
          {events.length === 0 
            ? t('Нет активных бонусных событий')
            : t('Начните продавать для участия в программе')
          }
        </p>
      </div>
    );
  }

  // Берем первое активное событие для отображения в карточке
  const currentEvent = events[0];
  const currentTurnover = userProgress.total_turnover || 0;
  
  // Находим следующую недостигнутую цель
  const nextTarget = currentEvent.targets?.find(target => 
    currentTurnover < target.target_amount
  );
  
  // Находим текущую достигнутую цель
  const achievedTargets = currentEvent.targets?.filter(target => 
    currentTurnover >= target.target_amount
  ) || [];
  
  // Вычисляем прогресс
  let progressPercent = 0;
  let amountToNext = 0;
  
  if (nextTarget) {
    // Если есть следующая цель
    const prevTarget = currentEvent.targets
      ?.filter(t => t.target_amount < nextTarget.target_amount)
      ?.sort((a, b) => b.target_amount - a.target_amount)[0];
    
    const startAmount = prevTarget?.target_amount || 0;
    const targetAmount = nextTarget.target_amount;
    
    progressPercent = ((currentTurnover - startAmount) / (targetAmount - startAmount)) * 100;
    progressPercent = Math.max(0, Math.min(100, progressPercent));
    amountToNext = targetAmount - currentTurnover;
  } else if (currentEvent.targets && currentEvent.targets.length > 0) {
    // Все цели достигнуты
    progressPercent = 100;
  }

  return (
    <div 
      className="bg-white rounded-2xl p-5 h-full flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => router.push('/dealer/dashboard/bonus_program')}
    >
      <div className="flex items-center gap-2 mb-4">
        <TrophyIcon />
        <h3 className="text-base font-semibold">{t('Бонусная программа')}</h3>
      </div>

      <div className="space-y-3 flex-1">
        {/* Название события */}
        <div className="text-xs text-gray-500 truncate">
          {currentEvent.title}
        </div>

        {/* Товарооборот */}
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-gray-500">{t('Ваш товарооборот')}</span>
          <span className="text-xl font-bold text-gray-900">
            {bonusEventService.formatAmount(currentTurnover)}
          </span>
        </div>

        {/* До следующего уровня или максимальный уровень */}
        {nextTarget ? (
          <>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{t('До цели')}: {nextTarget.reward_title}</span>
              <span className="text-sm font-medium text-orange-600">
                {bonusEventService.formatAmount(amountToNext)}
              </span>
            </div>

            {/* Прогресс-бар */}
            <div className="relative">
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-orange-500 transition-all"
                  style={{ width: `${Math.round(progressPercent)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-400">{Math.round(progressPercent)}% {t('пройдено')}</span>
                <span className="text-xs text-gray-400">{100 - Math.round(progressPercent)}% {t('осталось')}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-800">
              {achievedTargets.length > 0 
                ? t('Все цели достигнуты!') 
                : t('Начните продавать для достижения целей')}
            </p>
          </div>
        )}

        {/* Достигнутые цели */}
        {achievedTargets.length > 0 && (
          <div className="text-xs text-gray-500">
            {t('Достигнуто целей')}: {achievedTargets.length} {t('из')} {currentEvent.targets?.length || 0}
          </div>
        )}
      </div>

      {/* Последний заказ внизу */}
      {userProgress.last_order_date && (
        <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between items-center text-xs">
          <span className="text-gray-500">{t('Последний заказ')}</span>
          <span className="font-semibold text-gray-700">
            {new Date(userProgress.last_order_date).toLocaleDateString('ru-RU')}
          </span>
        </div>
      )}
    </div>
  );
};