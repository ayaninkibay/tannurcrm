'use client';

import { useState, useCallback } from 'react';
import { bonusService } from './BonusService';

type DealerTurnover = {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  total_turnover: number;
  total_orders: number;
  last_order_date: string;
  bonus_tier: 'none' | 'vacation' | 'car' | 'apartment';
  progress_percentage: number;
  amount_to_next_tier: number;
};

type TopDealer = DealerTurnover & {
  rank: number;
};

type BonusSystemStats = {
  total: number;
  none: number;
  vacation: number;
  car: number;
  apartment: number;
};

export const useBonusModule = () => {
  const [topDealers, setTopDealers] = useState<TopDealer[]>([]);
  const [bonusStats, setBonusStats] = useState<BonusSystemStats>({
    total: 0,
    none: 0,
    vacation: 0,
    car: 0,
    apartment: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузить топ дилеров
  const loadTopDealers = useCallback(async (limit: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const data = await bonusService.getTopDealers(limit);
      setTopDealers(data);
      return data;
    } catch (err) {
      setError('Ошибка загрузки топ дилеров');
      console.error('Error loading top dealers:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузить статистику бонусной системы
  const loadBonusStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await bonusService.getBonusSystemStats();
      setBonusStats(stats);
      return stats;
    } catch (err) {
      setError('Ошибка загрузки статистики');
      console.error('Error loading bonus stats:', err);
      return bonusStats;
    } finally {
      setLoading(false);
    }
  }, [bonusStats]);

  // Получить данные конкретного дилера
  const getDealerTurnover = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await bonusService.getDealerTurnover(userId);
      return data;
    } catch (err) {
      setError('Ошибка загрузки данных дилера');
      console.error('Error loading dealer turnover:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Получить дилеров по уровню
  const getDealersByTier = useCallback(async (tier: 'none' | 'vacation' | 'car' | 'apartment') => {
    setLoading(true);
    setError(null);
    try {
      const data = await bonusService.getDealersByTier(tier);
      return data;
    } catch (err) {
      setError('Ошибка загрузки дилеров по уровню');
      console.error('Error loading dealers by tier:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Обновить все данные
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dealers, stats] = await Promise.all([
        bonusService.getTopDealers(10),
        bonusService.getBonusSystemStats()
      ]);
      setTopDealers(dealers);
      setBonusStats(stats);
    } catch (err) {
      setError('Ошибка обновления данных');
      console.error('Error refreshing data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Вспомогательные функции из сервиса
  const formatAmount = bonusService.formatAmount;
  const getTierName = bonusService.getTierName;
  const getTierIcon = bonusService.getTierIcon;

  return {
    // Данные
    topDealers,
    bonusStats,
    loading,
    error,
    
    // Методы
    loadTopDealers,
    loadBonusStats,
    getDealerTurnover,
    getDealersByTier,
    refreshData,
    
    // Утилиты
    formatAmount,
    getTierName,
    getTierIcon
  };
};