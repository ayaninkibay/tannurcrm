'use client';

import { useState, useCallback } from 'react';
import { OrderService, OrderWithItems } from './OrderService';

export interface UseOrderModuleReturn {
  orders: OrderWithItems[];
  stats: any;
  loading: boolean;
  error: string | null;
  loadActiveOrders: () => Promise<void>;
  loadOrdersStats: () => Promise<void>;
  clearError: () => void;
}

export const useOrderModule = (): UseOrderModuleReturn => {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const orderService = new OrderService();

  const loadActiveOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await orderService.getActiveOrders();
      
      if (result.success && result.data) {
        setOrders(result.data);
      } else {
        setError(result.error || 'Ошибка загрузки заказов');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrdersStats = useCallback(async () => {
    try {
      const result = await orderService.getOrdersStats();
      
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Error loading order stats:', err);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    orders,
    stats,
    loading,
    error,
    loadActiveOrders,
    loadOrdersStats,
    clearError
  };
};