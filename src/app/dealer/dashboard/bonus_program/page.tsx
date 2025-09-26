'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { BonusEventProgressView } from '@/components/bonus/BonusEventProgressView';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import { useTranslate } from '@/hooks/useTranslate';
import { bonusEventService, BonusEvent, UserProgress } from '@/lib/bonus_event/BonusEventService';
import { Trophy, Calendar, TrendingUp, Award } from 'lucide-react';

export default function BonusProgramPage() {
  const { t } = useTranslate();
  const { profile: user } = useUser();
  const [events, setEvents] = useState<BonusEvent[]>([]);
  const [userProgress, setUserProgress] = useState<Map<string, UserProgress>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        const activeEvents = await bonusEventService.getActiveBonusEvents();
        setEvents(activeEvents);

        const progressMap = new Map<string, UserProgress>();
        for (const event of activeEvents) {
          if (event.id) {
            const progress = await bonusEventService.getUserProgress(user.id, event.id);
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
  }, [user]);

  // Подсчет общей статистики
  const totalEvents = events.length;
  const totalTargets = events.reduce((sum, event) => sum + (event.targets?.length || 0), 0);
  const achievedTargets = Array.from(userProgress.values()).reduce(
    (sum, progress) => sum + (progress?.achieved_targets.length || 0), 
    0
  );
  const totalTurnover = Array.from(userProgress.values()).reduce(
    (max, progress) => Math.max(max, progress?.total_turnover || 0), 
    0
  );

  // Ближайший дедлайн
  const nearestDeadline = events.reduce((nearest, event) => {
    const eventDate = new Date(event.end_date);
    return !nearest || eventDate < nearest ? eventDate : nearest;
  }, null as Date | null);

  const daysToDeadline = nearestDeadline 
    ? Math.ceil((nearestDeadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `${Math.round(price / 1000)}K`;
    return price.toLocaleString('ru-RU');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-2 md:p-6 space-y-6">
        <MoreHeaderDE title={t('Бонусная программа')} />
        
        {user?.id ? (
          <>
            {/* Информационный блок со статистикой */}
            {!loading && totalEvents > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-[#D77E6C]" />
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">
                        {t('Бонусная программа')}
                      </h2>
                      <p className="text-xs text-gray-500">
                        {totalEvents} {t('событий')} • {totalTargets} {t('наград')}
                      </p>
                    </div>
                  </div>
                  
                  {daysToDeadline && daysToDeadline <= 7 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium">
                      <Calendar className="w-3 h-3" />
                      {t('{n} дн').replace('{n}', String(daysToDeadline))}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <Award className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        {achievedTargets}<span className="text-sm text-gray-400 font-normal">/{totalTargets}</span>
                      </p>
                      <p className="text-xs text-gray-500">{t('достигнуто')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#D77E6C]/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-[#D77E6C]" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{formatPrice(totalTurnover)} ₸</p>
                      <p className="text-xs text-gray-500">{t('оборот')}</p>
                    </div>
                  </div>

                  <div className="flex-1 min-w-[120px]">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#D77E6C] to-[#E89380] rounded-full transition-all duration-700"
                        style={{ width: `${totalTargets > 0 ? (achievedTargets / totalTargets) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Основной компонент с событиями */}
            <BonusEventProgressView userId={user.id} />
          </>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}