'use client';

import { useState, useCallback } from 'react';
import { bonusEventService, BonusEvent, UserProgress, BonusEventTarget } from './BonusEventService';

export const useBonusEventModule = () => {
  const [events, setEvents] = useState<BonusEvent[]>([]);
  const [mainEvent, setMainEvent] = useState<BonusEvent | null>(null);
  const [currentEvent, setCurrentEvent] = useState<BonusEvent | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [leaderboard, setLeaderboard] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Создать новое бонусное событие
  const createBonusEvent = useCallback(async (
    eventData: Omit<BonusEvent, 'id' | 'created_at' | 'updated_at' | 'targets'>,
    targets: BonusEventTarget[]
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await bonusEventService.createBonusEvent(eventData, targets);
      return result;
    } catch (err: any) {
      setError(err.message || 'Ошибка создания события');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузить активные события
  const loadActiveEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bonusEventService.getActiveBonusEvents();
      setEvents(data);
      return data;
    } catch (err) {
      setError('Ошибка загрузки событий');
      console.error('Error loading events:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузить главное событие (с priority = 1 или последнее)
  const loadMainEvent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bonusEventService.getMainBonusEvent();
      setMainEvent(data);
      return data;
    } catch (err) {
      setError('Ошибка загрузки главного события');
      console.error('Error loading main event:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузить событие по ID
  const loadEventById = useCallback(async (eventId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await bonusEventService.getBonusEventById(eventId);
      setCurrentEvent(data);
      return data;
    } catch (err) {
      setError('Ошибка загрузки события');
      console.error('Error loading event:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузить прогресс пользователя
  const loadUserProgress = useCallback(async (userId: string, eventId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await bonusEventService.getUserProgress(userId, eventId);
      setUserProgress(data);
      return data;
    } catch (err) {
      setError('Ошибка загрузки прогресса');
      console.error('Error loading user progress:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузить рейтинг участников
  const loadLeaderboard = useCallback(async (eventId: string, limit: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const data = await bonusEventService.getEventLeaderboard(eventId, limit);
      setLeaderboard(data);
      return data;
    } catch (err) {
      setError('Ошибка загрузки рейтинга');
      console.error('Error loading leaderboard:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Обновить событие (включая приоритет)
  const updateEvent = useCallback(async (eventId: string, updates: Partial<BonusEvent>) => {
    setLoading(true);
    setError(null);
    try {
      const success = await bonusEventService.updateBonusEvent(eventId, updates);
      if (success) {
        // Перезагружаем событие после обновления
        await loadEventById(eventId);
        // Если обновили приоритет, перезагружаем главное событие
        if ('priority' in updates) {
          await loadMainEvent();
        }
      }
      return success;
    } catch (err) {
      setError('Ошибка обновления события');
      console.error('Error updating event:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadEventById, loadMainEvent]);

  // Установить приоритет события
  const setEventPriority = useCallback(async (eventId: string, priority: number) => {
    return updateEvent(eventId, { priority });
  }, [updateEvent]);

  // Деактивировать событие
  const deactivateEvent = useCallback(async (eventId: string) => {
    setLoading(true);
    setError(null);
    try {
      const success = await bonusEventService.deactivateEvent(eventId);
      if (success) {
        // Обновляем список событий
        await loadActiveEvents();
        // Обновляем главное событие
        await loadMainEvent();
      }
      return success;
    } catch (err) {
      setError('Ошибка деактивации события');
      console.error('Error deactivating event:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadActiveEvents, loadMainEvent]);

  // Проверить, достигнута ли цель
  const isTargetAchieved = useCallback((target: BonusEventTarget, turnover: number): boolean => {
    return turnover >= target.target_amount;
  }, []);

  // Вычислить прогресс к цели
  const calculateTargetProgress = useCallback((target: BonusEventTarget, turnover: number): number => {
    if (target.target_amount <= 0) return 0;
    return Math.min((turnover / target.target_amount) * 100, 100);
  }, []);

  // Утилиты
  const formatAmount = bonusEventService.formatAmount;
  const getRewardIcon = bonusEventService.getRewardIcon;

  return {
    // Данные
    events,
    mainEvent,
    currentEvent,
    userProgress,
    leaderboard,
    loading,
    error,
    
    // Методы
    createBonusEvent,
    loadActiveEvents,
    loadMainEvent,
    loadEventById,
    loadUserProgress,
    loadLeaderboard,
    updateEvent,
    setEventPriority,
    deactivateEvent,
    
    // Хелперы
    isTargetAchieved,
    calculateTargetProgress,
    
    // Утилиты
    formatAmount,
    getRewardIcon
  };
};