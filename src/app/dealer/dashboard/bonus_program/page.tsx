'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useUser } from '@/context/UserContext';
import { BonusEventProgressView } from '@/components/bonus/BonusEventProgressView';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import { useTranslate } from '@/hooks/useTranslate';
import { bonusEventService, BonusEvent, UserProgress } from '@/lib/bonus_event/BonusEventService';
import { Trophy, Calendar, TrendingUp, Award, Users, Package, RefreshCw } from 'lucide-react';

// =====================================================
// ВСТРОЕННЫЙ КЕШ
// =====================================================
interface CachedData<T> {
  data: T;
  timestamp: number;
}

class SimpleCache {
  private static CACHE_PREFIX = 'bonus_';
  private static TTL = {
    EVENTS: 5 * 60 * 1000,     // 5 минут для событий
    PROGRESS: 2 * 60 * 1000,    // 2 минуты для прогресса
  };

  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.CACHE_PREFIX + key);
      if (!item) return null;
      
      const cached: CachedData<T> = JSON.parse(item);
      const now = Date.now();
      
      // Проверяем TTL
      const ttl = key.includes('progress') ? this.TTL.PROGRESS : this.TTL.EVENTS;
      if (now - cached.timestamp > ttl) {
        localStorage.removeItem(this.CACHE_PREFIX + key);
        return null;
      }
      
      return cached.data;
    } catch {
      return null;
    }
  }

  static set<T>(key: string, data: T): void {
    const cached: CachedData<T> = {
      data,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(cached));
    } catch (e) {
      // Если localStorage переполнен, очищаем старые записи
      this.clearOld();
      try {
        localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(cached));
      } catch {}
    }
  }

  static clearOld(): void {
    const now = Date.now();
    const keys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.CACHE_PREFIX)) {
        keys.push(key);
      }
    }
    
    // Удаляем записи старше 10 минут
    keys.forEach(key => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const cached = JSON.parse(item);
          if (now - cached.timestamp > 10 * 60 * 1000) {
            localStorage.removeItem(key);
          }
        }
      } catch {}
    });
  }

  static clearProgress(userId: string): void {
    const keys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.includes(`${this.CACHE_PREFIX}progress_${userId}`)) {
        keys.push(key);
      }
    }
    
    keys.forEach(key => localStorage.removeItem(key));
  }
}

// =====================================================
// КОМПОНЕНТ
// =====================================================
export default function BonusProgramPage() {
  const { t } = useTranslate();
  const { profile: user } = useUser();
  const [events, setEvents] = useState<BonusEvent[]>([]);
  const [userProgress, setUserProgress] = useState<Map<string, UserProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [includeTeam, setIncludeTeam] = useState(true);
  const [isFromCache, setIsFromCache] = useState(false);
  
  // Используем ref для отслеживания первой загрузки
  const isFirstLoad = useRef(true);

  const loadData = useCallback(async (forceRefresh = false) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      if (forceRefresh) {
        setIsRefreshing(true);
      }

      let activeEvents: BonusEvent[] = [];
      let fromCache = false;

      // Пытаемся получить события из кеша
      if (!forceRefresh) {
        const cachedEvents = SimpleCache.get<BonusEvent[]>('events');
        if (cachedEvents) {
          activeEvents = cachedEvents;
          fromCache = true;
        }
      }

      // Если нет в кеше или принудительное обновление
      if (!activeEvents.length) {
        activeEvents = await bonusEventService.getActiveBonusEvents();
        SimpleCache.set('events', activeEvents);
        fromCache = false;
      }

      setEvents(activeEvents);

      // Загружаем прогресс
      const progressMap = new Map<string, UserProgress>();
      
      // Параллельная загрузка для всех событий
      const promises = activeEvents.map(async (event) => {
        if (!event.id) return null;

        const cacheKey = `progress_${user.id}_${event.id}_${includeTeam}`;
        
        // Пытаемся из кеша
        if (!forceRefresh) {
          const cachedProgress = SimpleCache.get<UserProgress>(cacheKey);
          if (cachedProgress) {
            return { eventId: event.id, progress: cachedProgress, fromCache: true };
          }
        }

        // Загружаем из БД
        const progress = await bonusEventService.getUserProgress(user.id, event.id, includeTeam);
        if (progress) {
          SimpleCache.set(cacheKey, progress);
          return { eventId: event.id, progress, fromCache: false };
        }
        
        return null;
      });

      const results = await Promise.all(promises);
      let allFromCache = true;
      
      results.forEach(result => {
        if (result) {
          progressMap.set(result.eventId, result.progress);
          if (!result.fromCache) allFromCache = false;
        }
      });

      setUserProgress(progressMap);
      setIsFromCache(fromCache && allFromCache);
      
    } catch (error) {
      console.error('Error loading bonus events:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      isFirstLoad.current = false;
    }
  }, [user, includeTeam]);

  // Первоначальная загрузка
  useEffect(() => {
    if (isFirstLoad.current) {
      loadData(false); // Используем кеш при первой загрузке
    }
  }, [loadData]);

  // При изменении includeTeam
  useEffect(() => {
    if (!isFirstLoad.current && user?.id) {
      // Очищаем кеш прогресса для пользователя
      SimpleCache.clearProgress(user.id);
      loadData(true); // Принудительное обновление
    }
  }, [includeTeam, user?.id, loadData]);

  // Автообновление каждые 5 минут (с кешем)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isFirstLoad.current) {
        loadData(false); // Используем кеш
      }
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [loadData]);

  // Ручное обновление
  const handleRefresh = () => {
    loadData(true);
  };

  // Подсчет статистики
  const totalEvents = events.length;
  const totalTargets = events.reduce((sum, event) => sum + (event.targets?.length || 0), 0);
  
  const achievedTargets = Array.from(userProgress.values()).reduce(
    (sum, progress) => sum + (progress?.achieved_targets?.length || 0), 
    0
  );
  
  const maxTurnover = Array.from(userProgress.values()).reduce(
    (max, progress) => Math.max(max, progress?.total_turnover || 0), 
    0
  );

  const totalTeamTurnover = Array.from(userProgress.values()).reduce(
    (sum, progress) => sum + (progress?.team_turnover || 0), 
    0
  );

  const totalOrders = Array.from(userProgress.values()).reduce(
    (sum, progress) => sum + (progress?.total_orders || 0), 
    0
  );

  const totalTeamMembers = Array.from(userProgress.values()).reduce(
    (max, progress) => Math.max(max, progress?.team_members_count || 0), 
    0
  );

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
        <MoreHeaderDE title={t('Бонусная программа')} showBackButton={true} />
        
        {user?.id ? (
          <>
            {/* Информационный блок */}
            {!loading && totalEvents > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-[#D77E6C]" />
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">
                        {t('Бонусная программа')}
                      </h2>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        {totalEvents} {t('событий')} • {totalTargets} {t('наград')}
                        {isFromCache && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-400">{t('из кеша')}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Кнопка обновления */}
                    <button
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className={`p-2 rounded-lg transition-colors ${
                        isRefreshing 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={t('Обновить данные')}
                    >
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>

                    {/* Переключатель команды */}
                    <button
                      onClick={() => setIncludeTeam(!includeTeam)}
                      disabled={isRefreshing}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        includeTeam 
                          ? 'bg-[#D77E6C] text-white' 
                          : 'bg-gray-100 text-gray-600'
                      } ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      {includeTeam ? t('С командой') : t('Только личный')}
                    </button>

                    {daysToDeadline && daysToDeadline <= 7 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium">
                        <Calendar className="w-3 h-3" />
                        {t('{n} дн').replace('{n}', String(daysToDeadline))}
                      </span>
                    )}
                  </div>
                </div>

                {/* Статистика */}
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
                      <p className="text-lg font-bold text-gray-900">{formatPrice(maxTurnover)} ₸</p>
                      <p className="text-xs text-gray-500">
                        {includeTeam ? t('общий оборот') : t('личный оборот')}
                      </p>
                      {includeTeam && totalTeamTurnover > 0 && (
                        <p className="text-xs text-gray-400">
                          +{formatPrice(totalTeamTurnover)} {t('от команды')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{totalOrders}</p>
                      <p className="text-xs text-gray-500">{t('заказов')}</p>
                    </div>
                  </div>

                  {includeTeam && totalTeamMembers > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">{totalTeamMembers}</p>
                        <p className="text-xs text-gray-500">{t('в команде')}</p>
                      </div>
                    </div>
                  )}

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

            {/* Основной компонент */}
            <BonusEventProgressView userId={user.id} includeTeam={includeTeam} />
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