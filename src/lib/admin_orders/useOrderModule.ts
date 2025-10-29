// src/lib/admin_orders/useOrderModule.ts

'use client';

import { useState, useCallback } from 'react';
import { OrderService, OrderWithItems, ActionLog, OrderStatus } from './OrderService';

export interface UseOrderModuleReturn {
  activeOrders: OrderWithItems[];
  completedOrders: OrderWithItems[];
  currentOrder: OrderWithItems | null;
  actionLog: ActionLog[];
  loading: boolean;
  loadingCompleted: boolean;
  error: string | null;
  completedPagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  
  loadAllActiveOrders: () => Promise<void>;
  loadCompletedOrders: (page?: number, pageSize?: number) => Promise<void>;
  loadOrderById: (orderId: string) => Promise<void>;
  loadActionLog: (orderId: string) => Promise<void>;
  
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, reason?: string) => Promise<boolean>;
  transferToWarehouse: (orderId: string, departmentNotes?: string) => Promise<boolean>;
  updateDepartmentNotes: (orderId: string, departmentNotes: string) => Promise<boolean>;
  updateNotes: (orderId: string, notes: string) => Promise<boolean>;
  updateDeliveryAddress: (orderId: string, address: string) => Promise<boolean>;
  updateDeliveryDate: (orderId: string, date: string) => Promise<boolean>;
  updateDeliveryMethod: (orderId: string, method: 'pickup' | 'delivery') => Promise<boolean>;
  
  clearError: () => void;
  clearCurrentOrder: () => void;
  refreshOrders: () => Promise<void>;
}

export const useOrderModule = (): UseOrderModuleReturn => {
  const [activeOrders, setActiveOrders] = useState<OrderWithItems[]>([]);
  const [completedOrders, setCompletedOrders] = useState<OrderWithItems[]>([]);
  const [currentOrder, setCurrentOrder] = useState<OrderWithItems | null>(null);
  const [actionLog, setActionLog] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCompleted, setLoadingCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [completedPagination, setCompletedPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 50,
    totalPages: 0
  });
  
  const orderService = new OrderService();

  const loadAllActiveOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await orderService.getAllActiveOrders();
      
      if (result.success && result.data) {
        setActiveOrders(result.data);
      } else {
        setError(result.error || 'Ошибка загрузки заказов');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCompletedOrders = useCallback(async (
    page: number = 1,
    pageSize: number = 50
  ) => {
    try {
      setLoadingCompleted(true);
      setError(null);
      
      const result = await orderService.getCompletedOrders(page, pageSize);
      
      if (result.success && result.data) {
        if (page === 1) {
          setCompletedOrders(result.data.orders);
        } else {
          setCompletedOrders(prev => [...prev, ...result.data.orders]);
        }
        
        setCompletedPagination({
          total: result.data.total,
          page: result.data.page,
          pageSize: result.data.pageSize,
          totalPages: result.data.totalPages
        });
      } else {
        setError(result.error || 'Ошибка загрузки завершенных заказов');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoadingCompleted(false);
    }
  }, []);

  const loadOrderById = useCallback(async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await orderService.getOrderById(orderId);
      
      if (result.success && result.data) {
        setCurrentOrder(result.data);
      } else {
        setError(result.error || 'Ошибка загрузки заказа');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadActionLog = useCallback(async (orderId: string) => {
    try {
      setError(null);
      
      const result = await orderService.getOrderActionLog(orderId);
      
      if (result.success && result.data) {
        setActionLog(result.data);
      } else {
        setError(result.error || 'Ошибка загрузки журнала');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    }
  }, []);

  const updateOrderStatus = useCallback(async (
    orderId: string,
    newStatus: OrderStatus,
    reason?: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await (await import('@/lib/supabase/client')).supabase.auth.getUser();
      if (!user) {
        setError('Пользователь не авторизован');
        return false;
      }

      const result = await orderService.updateOrderStatus(orderId, newStatus, user.id, reason);
      
      if (result.success) {
        if (newStatus === 'delivered' || newStatus === 'cancelled' || newStatus === 'returned') {
          setActiveOrders(prev => prev.filter(o => o.id !== orderId));
          if (completedOrders.length > 0) {
            await loadCompletedOrders(1, completedPagination.pageSize);
          }
        } else {
          await loadAllActiveOrders();
        }
        
        if (currentOrder?.id === orderId) {
          await loadOrderById(orderId);
          await loadActionLog(orderId);
        }
        
        return true;
      } else {
        setError(result.error || 'Ошибка обновления статуса');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentOrder, completedOrders.length, completedPagination.pageSize, loadAllActiveOrders, loadCompletedOrders, loadOrderById, loadActionLog]);

  const transferToWarehouse = useCallback(async (
    orderId: string,
    departmentNotes?: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await (await import('@/lib/supabase/client')).supabase.auth.getUser();
      if (!user) {
        setError('Пользователь не авторизован');
        return false;
      }

      const result = await orderService.transferToWarehouse(orderId, user.id, departmentNotes);
      
      if (result.success) {
        await loadAllActiveOrders();
        
        if (currentOrder?.id === orderId) {
          await loadOrderById(orderId);
          await loadActionLog(orderId);
        }
        
        return true;
      } else {
        setError(result.error || 'Ошибка передачи в склад');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentOrder, loadAllActiveOrders, loadOrderById, loadActionLog]);

  const updateDepartmentNotes = useCallback(async (
    orderId: string,
    departmentNotes: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await (await import('@/lib/supabase/client')).supabase.auth.getUser();
      if (!user) {
        setError('Пользователь не авторизован');
        return false;
      }

      const result = await orderService.updateDepartmentNotes(orderId, departmentNotes, user.id);
      
      if (result.success) {
        if (currentOrder?.id === orderId) {
          await loadOrderById(orderId);
          await loadActionLog(orderId);
        }
        return true;
      } else {
        setError(result.error || 'Ошибка обновления заметок между отделами');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentOrder, loadOrderById, loadActionLog]);

  const updateNotes = useCallback(async (
    orderId: string,
    notes: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await (await import('@/lib/supabase/client')).supabase.auth.getUser();
      if (!user) {
        setError('Пользователь не авторизован');
        return false;
      }

      const result = await orderService.updateOrderNotes(orderId, notes, user.id);
      
      if (result.success) {
        if (currentOrder?.id === orderId) {
          await loadOrderById(orderId);
          await loadActionLog(orderId);
        }
        return true;
      } else {
        setError(result.error || 'Ошибка обновления заметок');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentOrder, loadOrderById, loadActionLog]);

  const updateDeliveryAddress = useCallback(async (
    orderId: string,
    address: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await (await import('@/lib/supabase/client')).supabase.auth.getUser();
      if (!user) {
        setError('Пользователь не авторизован');
        return false;
      }

      const result = await orderService.updateDeliveryAddress(orderId, address, user.id);
      
      if (result.success) {
        if (currentOrder?.id === orderId) {
          await loadOrderById(orderId);
          await loadActionLog(orderId);
        }
        return true;
      } else {
        setError(result.error || 'Ошибка обновления адреса');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentOrder, loadOrderById, loadActionLog]);

  const updateDeliveryDate = useCallback(async (
    orderId: string,
    date: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await (await import('@/lib/supabase/client')).supabase.auth.getUser();
      if (!user) {
        setError('Пользователь не авторизован');
        return false;
      }

      const result = await orderService.updateDeliveryDate(orderId, date, user.id);
      
      if (result.success) {
        if (currentOrder?.id === orderId) {
          await loadOrderById(orderId);
          await loadActionLog(orderId);
        }
        return true;
      } else {
        setError(result.error || 'Ошибка обновления даты');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentOrder, loadOrderById, loadActionLog]);

  const updateDeliveryMethod = useCallback(async (
    orderId: string,
    method: 'pickup' | 'delivery'
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await (await import('@/lib/supabase/client')).supabase.auth.getUser();
      if (!user) {
        setError('Пользователь не авторизован');
        return false;
      }

      const result = await orderService.updateDeliveryMethod(orderId, method, user.id);
      
      if (result.success) {
        if (currentOrder?.id === orderId) {
          await loadOrderById(orderId);
          await loadActionLog(orderId);
        }
        return true;
      } else {
        setError(result.error || 'Ошибка обновления типа доставки');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentOrder, loadOrderById, loadActionLog]);

  const refreshOrders = useCallback(async () => {
    await loadAllActiveOrders();
    if (completedOrders.length > 0) {
      await loadCompletedOrders(1, completedPagination.pageSize);
    }
  }, [loadAllActiveOrders, loadCompletedOrders, completedOrders.length, completedPagination.pageSize]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearCurrentOrder = useCallback(() => {
    setCurrentOrder(null);
    setActionLog([]);
  }, []);

  return {
    activeOrders,
    completedOrders,
    currentOrder,
    actionLog,
    loading,
    loadingCompleted,
    error,
    completedPagination,
    
    loadAllActiveOrders,
    loadCompletedOrders,
    loadOrderById,
    loadActionLog,
    
    updateOrderStatus,
    transferToWarehouse,
    updateDepartmentNotes,
    updateNotes,
    updateDeliveryAddress,
    updateDeliveryDate,
    updateDeliveryMethod,
    
    clearError,
    clearCurrentOrder,
    refreshOrders
  };
};