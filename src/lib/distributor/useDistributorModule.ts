'use client';

import { useState, useCallback, useMemo } from 'react';
import { DistributorService, CreateDistributorData, DistributorWithUser } from './DistributorService';

export interface UseDistributorModuleReturn {
  // Состояние
  distributors: DistributorWithUser[];
  loading: boolean;
  error: string | null;
  
  // Методы
  loadDistributors: () => Promise<void>;
  createDistributor: (data: CreateDistributorData) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

export const useDistributorModule = (): UseDistributorModuleReturn => {
  const [distributors, setDistributors] = useState<DistributorWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const distributorService = useMemo(() => new DistributorService(), []);

  // Загрузка списка дистрибьюторов
  const loadDistributors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await distributorService.getDistributors();

      if (result.success && result.data) {
        setDistributors(result.data);
      } else {
        setError(result.error || 'Ошибка загрузки дистрибьюторов');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }, [distributorService]);

  // Создание дистрибьютора
  const createDistributor = useCallback(async (data: CreateDistributorData): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const result = await distributorService.createDistributor(data);

      if (result.success && result.data) {
        // Добавляем нового дистрибьютора в начало списка
        setDistributors(prev => [result.data!, ...prev]);
        return { success: true };
      } else {
        const errorMessage = result.error || 'Ошибка создания дистрибьютора';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [distributorService]);

  // Очистка ошибки
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    distributors,
    loading,
    error,
    loadDistributors,
    createDistributor,
    clearError
  };
};