'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { bonusEventService, BonusEvent, UserProgress } from '@/lib/bonus_event/BonusEventService';
import { useTranslate } from '@/hooks/useTranslate';
import { Trophy, Sparkles, ArrowRight, Gift, Target, Users, TrendingUp } from 'lucide-react';

interface BonusProgressCardProps {
  userId?: string;
  includeTeam?: boolean; // Новый проп для включения команды
}

const CardShimmer = () => (
  <div className="bg-white rounded-2xl p-6 animate-pulse shadow-lg">
    <div className="flex items-center justify-between mb-5">
      <div>
        <div className="h-5 bg-gray-200 rounded w-36 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-48"></div>
      </div>
      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
    </div>
    <div className="space-y-3 mb-4">
      <div className="h-2.5 bg-gray-200 rounded-full"></div>
      <div className="flex justify-between">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
    <div className="h-11 bg-gray-200 rounded-xl"></div>
  </div>
);

export const BonusProgressCard: React.FC<BonusProgressCardProps> = ({ userId, includeTeam = true }) => {
  const { t } = useTranslate();
  const router = useRouter();
  const [mainEvent, setMainEvent] = useState<BonusEvent | null>(null);
  const [totalEvents, setTotalEvents] = useState(0);
  const [mainProgress, setMainProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        // Получаем главное событие (priority = 1)
        const main = await bonusEventService.getMainBonusEvent();
        setMainEvent(main);

        // Получаем все активные события
        const allEvents = await bonusEventService.getActiveBonusEvents();
        setTotalEvents(allEvents.length);

        // Получаем прогресс пользователя через оптимизированную RPC функцию
        if (main?.id) {
          const progress = await bonusEventService.getUserProgress(userId, main.id, includeTeam);
          setMainProgress(progress);
        }
      } catch (error) {
        console.error('Error loading bonus data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, includeTeam]);

  const handleViewAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push('/dealer/dashboard/bonus_program');
  };

  const handleCardClick = () => {
    router.push('/dealer/dashboard/bonus_program');
  };

  if (loading) {
    return <CardShimmer />;
  }

  if (!mainEvent) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm shadow-gray-200/50 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{t('Бонусная программа')}</p>
            <h3 className="text-lg font-semibold text-gray-900">{t('Нет активных событий')}</h3>
          </div>
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-gray-400" />
          </div>
        </div>
      </div>
    );
  }

  // Используем total_turnover (который включает личный + команда если includeTeam = true)
  const currentTurnover = mainProgress?.total_turnover || 0;
  const personalTurnover = mainProgress?.personal_turnover || 0;
  const teamTurnover = mainProgress?.team_turnover || 0;
  const teamMembersCount = mainProgress?.team_members_count || 0;
  
  // Получаем следующую цель и достигнутые цели
  const nextTarget = bonusEventService.getNextTarget(currentTurnover, mainEvent.targets || []);
  const achievedTargets = bonusEventService.getAchievedTargets(currentTurnover, mainEvent.targets || []);
  const progressPercent = bonusEventService.getProgressPercent(currentTurnover, mainEvent.targets || []);

  const allTargetsAchieved = progressPercent === 100 && !nextTarget;
  const daysLeft = bonusEventService.getDaysRemaining(mainEvent.end_date);

  return (
    <div 
      className="bg-white rounded-2xl p-6 shadow-sm shadow-gray-200/50  transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Заголовок с названием события */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-gray-500">{t('Бонусная программа')}</p>
            {daysLeft > 0 && daysLeft <= 7 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                {t('{n} дней').replace('{n}', String(daysLeft))}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-900 leading-tight">
            {mainEvent.title}
          </h3>
          
        </div>
        
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-[#D77E6C] to-[#E89380] rounded-xl flex items-center justify-center shadow-lg">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          {achievedTargets.length > 0 && (
            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
              <span className="text-xs text-white font-bold">{achievedTargets.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Прогресс и информация о текущей цели */}
      {!allTargetsAchieved && nextTarget && (
        <div className="mb-5">
          {/* Название награды */}
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-[#D77E6C]" />
            <span className="text-sm font-medium text-gray-700">
              {t('Следующая награда:')} <span className="text-[#D77E6C]">{nextTarget.reward_title}</span>
            </span>
          </div>

          {/* Прогресс-бар */}
          <div className="space-y-2.5">
            <div className="relative">
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-700 ease-out relative"
                  style={{
                    width: `${progressPercent}%`,
                    background: 'linear-gradient(90deg, #D77E6C 0%, #E89380 100%)'
                  }}
                >
                  {progressPercent > 0 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                  )}
                </div>
              </div>
              {progressPercent > 0 && progressPercent < 100 && (
                <div 
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-[#E89380] rounded-full shadow-md flex items-center justify-center"
                  style={{ left: `${progressPercent}%` }}
                >
                  <div className="w-1.5 h-1.5 bg-[#D77E6C] rounded-full"></div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between text-sm mt-3">
              <span className="text-gray-600">
                {includeTeam ? t('Общий оборот:') : t('Ваш оборот:')} 
                <span className="font-bold text-gray-900 ml-1">{currentTurnover.toLocaleString('ru-RU')} ₸</span>
                {includeTeam && personalTurnover !== currentTurnover && (
                  <span className="text-xs text-gray-500 ml-1">
                    ({t('личный')}: {personalTurnover.toLocaleString('ru-RU')})
                  </span>
                )}
              </span>
              <span className="text-gray-600">
                {t('Цель:')} 
                <span className="font-bold text-[#D77E6C] ml-1">{nextTarget.target_amount.toLocaleString('ru-RU')} ₸</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Поздравление при достижении всех целей */}
      {allTargetsAchieved && (
        <div className="mb-5">
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-700">
                {t('Поздравляем!')}
              </p>
              <p className="text-xs text-emerald-600">
                {t('Все цели события достигнуты')}
              </p>
            </div>
          </div>
        </div>
      )}


      {/* Кнопка только если есть больше одного события */}
      {totalEvents > 1 && (
        <button
          onClick={handleViewAll}
          className="w-full group px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-xl transition-all duration-200 flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <Gift className="w-5 h-5 text-[#D77E6C]" />
            <span className="font-medium text-gray-900">
              {t('Смотреть все события')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-gradient-to-r from-[#D77E6C] to-[#E89380] text-white rounded-full text-sm font-bold shadow-md">
              {totalEvents}
            </span>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#D77E6C] group-hover:translate-x-1 transition-all" />
          </div>
        </button>
      )}
    </div>
  );
};