

'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  UserEditService,
  UserEditData,
  UpdateUserPayload,
  UserBalance,
  UserStats
} from './usereditservice';

export interface UseUserEditReturn {
  // Данные
  user: UserEditData | null;
  balance: UserBalance | null;
  stats: UserStats | null;
  parentInfo: { id: string; name: string; phone: string } | null;

  // Состояния
  loading: boolean;
  saving: boolean;
  error: string | null;
  successMessage: string | null;

  // Методы
  loadUser: () => Promise<void>;
  updateUser: (payload: UpdateUserPayload) => Promise<boolean>;
  loadBalance: () => Promise<void>;
  loadStats: () => Promise<void>;
  loadParentInfo: (parentId: string | null) => Promise<void>;
  searchParent: (query: string) => Promise<Array<{ id: string; name: string; phone: string; role: string }>>;
  clearError: () => void;
  clearSuccess: () => void;
  refreshAll: () => Promise<void>;
}

export const useUserEdit = (userId: string): UseUserEditReturn => {
  const [user, setUser] = useState<UserEditData | null>(null);
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [parentInfo, setParentInfo] = useState<{ id: string; name: string; phone: string } | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const service = new UserEditService();

  /**
   * Загрузить данные пользователя
   */
  const loadUser = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await service.getUserById(userId);

      if (result.success && result.data) {
        setUser(result.data);
        
        // Автоматически загружаем информацию о спонсоре
        if (result.data.parent_id) {
          await loadParentInfo(result.data.parent_id);
        }
      } else {
        setError(result.error || 'Ошибка загрузки пользователя');
      }
    } catch (err) {
      console.error('Error loading user:', err);
      setError(err instanceof Error ? err.message : 'Критическая ошибка');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Обновить данные пользователя
   */
  const updateUser = useCallback(async (payload: UpdateUserPayload): Promise<boolean> => {
    if (!userId) return false;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const result = await service.updateUser(userId, payload);

      if (result.success && result.data) {
        setUser(result.data);
        setSuccessMessage('Данные успешно обновлены!');
        
        // Если изменился parent_id, обновляем информацию о спонсоре
        if (payload.parent_id !== undefined) {
          await loadParentInfo(payload.parent_id);
        }
        
        return true;
      } else {
        setError(result.error || 'Ошибка обновления данных');
        return false;
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err instanceof Error ? err.message : 'Критическая ошибка');
      return false;
    } finally {
      setSaving(false);
    }
  }, [userId]);

  /**
   * Загрузить баланс пользователя
   */
  const loadBalance = useCallback(async () => {
    if (!userId) return;

    try {
      const result = await service.getUserBalance(userId);

      if (result.success && result.data) {
        setBalance(result.data);
      } else {
        console.warn('Balance not available:', result.error);
        setBalance(null);
      }
    } catch (err) {
      console.error('Error loading balance:', err);
      setBalance(null);
    }
  }, [userId]);

  /**
   * Загрузить статистику пользователя
   */
  const loadStats = useCallback(async () => {
    if (!userId) return;

    try {
      const result = await service.getUserStats(userId);

      if (result.success && result.data) {
        setStats(result.data);
      } else {
        console.warn('Stats not available:', result.error);
        setStats(null);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
      setStats(null);
    }
  }, [userId]);

  /**
   * Загрузить информацию о спонсоре
   */
  const loadParentInfo = useCallback(async (parentId: string | null) => {
    if (!parentId) {
      setParentInfo(null);
      return;
    }

    try {
      const result = await service.getParentInfo(parentId);

      if (result.success) {
        setParentInfo(result.data);
      } else {
        setParentInfo(null);
      }
    } catch (err) {
      console.error('Error loading parent info:', err);
      setParentInfo(null);
    }
  }, []);

  /**
   * Поиск пользователя для назначения спонсором
   */
  const searchParent = useCallback(async (query: string) => {
    try {
      const result = await service.searchUserForParent(query);
      return result.data || [];
    } catch (err) {
      console.error('Error searching parent:', err);
      return [];
    }
  }, []);

  /**
   * Обновить все данные
   */
  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadUser(),
      loadBalance(),
      loadStats()
    ]);
  }, [loadUser, loadBalance, loadStats]);

  /**
   * Очистить ошибку
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Очистить сообщение об успехе
   */
  const clearSuccess = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  // Автоматическая загрузка при монтировании
  useEffect(() => {
    if (userId) {
      loadUser();
      loadBalance();
      loadStats();
    }
  }, [userId]);

  // Автоматическое скрытие сообщения об успехе через 3 секунды
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return {
    // Данные
    user,
    balance,
    stats,
    parentInfo,

    // Состояния
    loading,
    saving,
    error,
    successMessage,

    // Методы
    loadUser,
    updateUser,
    loadBalance,
    loadStats,
    loadParentInfo,
    searchParent,
    clearError,
    clearSuccess,
    refreshAll
  };
};