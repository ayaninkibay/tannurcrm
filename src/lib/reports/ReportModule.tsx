'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { reportService } from './ReportService';
import type {
  SubscriptionPaymentReport,
  OrderReport,
  TeamPurchaseReport,
  UserReportSummary
} from './ReportService';

export interface UseReportModuleReturn {
  // Состояния
  subscriptionPayments: SubscriptionPaymentReport[];
  orders: OrderReport[];
  teamPurchases: TeamPurchaseReport[];
  userSummary: UserReportSummary | null;
  loading: boolean;
  error: string | null;
  
  // Фильтры
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  
  // Действия
  loadSubscriptionPaymentsReport: (userId: string) => Promise<void>;
  loadOrdersReport: (userId: string) => Promise<void>;
  loadTeamPurchasesReport: (userId: string) => Promise<void>;
  loadUserSummaryReport: (userId: string) => Promise<void>;
  loadFullReport: (userId: string) => Promise<void>;
  
  // Экспорт
  exportSubscriptionPayments: () => void;
  exportOrders: () => void;
  exportTeamPurchases: () => void;
  exportSummary: () => void;
  
  // Утилиты
  setDateRange: (from: Date | null, to: Date | null) => void;
  clearReports: () => void;
  getFilteredData: <T extends { created_at?: string; paid_at?: string }>(
    data: T[]
  ) => T[];
}

export const useReportModule = (): UseReportModuleReturn => {
  // Состояния данных
  const [subscriptionPayments, setSubscriptionPayments] = useState<SubscriptionPaymentReport[]>([]);
  const [orders, setOrders] = useState<OrderReport[]>([]);
  const [teamPurchases, setTeamPurchases] = useState<TeamPurchaseReport[]>([]);
  const [userSummary, setUserSummary] = useState<UserReportSummary | null>(null);
  
  // Состояния UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Фильтры
  const [dateRange, setDateRangeState] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: null,
    to: null
  });

  /**
   * Загрузка отчета по subscription payments
   */
  const loadSubscriptionPaymentsReport = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await reportService.getSubscriptionPaymentsReport(userId);
      setSubscriptionPayments(data);
      
      if (data.length === 0) {
        toast.info('Нет данных по подписочным платежам');
      } else {
        toast.success(`Загружено ${data.length} платежей`);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка загрузки платежей';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Загрузка отчета по заказам
   */
  const loadOrdersReport = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await reportService.getOrdersReport(userId);
      setOrders(data);
      
      if (data.length === 0) {
        toast.info('Нет данных по заказам');
      } else {
        const totalItems = data.reduce((sum, o) => sum + o.items.length, 0);
        toast.success(`Загружено ${data.length} заказов (${totalItems} товаров)`);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка загрузки заказов';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Загрузка отчета по командным закупкам
   */
  const loadTeamPurchasesReport = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await reportService.getTeamPurchasesReport(userId);
      setTeamPurchases(data);
      
      if (data.length === 0) {
        toast.info('Нет данных по командным закупкам');
      } else {
        const activeCount = data.filter(tp => 
          ['forming', 'active', 'purchasing'].includes(tp.team_purchase?.status || '')
        ).length;
        toast.success(`Загружено ${data.length} закупок (${activeCount} активных)`);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка загрузки закупок';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Загрузка сводного отчета
   */
  const loadUserSummaryReport = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await reportService.getUserSummaryReport(userId);
      
      if (!data) {
        throw new Error('Пользователь не найден');
      }
      
      setUserSummary(data);
      toast.success('Сводный отчет загружен');
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка загрузки сводки';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Загрузка полного отчета (все типы)
   */
  const loadFullReport = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Параллельная загрузка всех отчетов
      const [payments, orderData, purchases, summary] = await Promise.all([
        reportService.getSubscriptionPaymentsReport(userId),
        reportService.getOrdersReport(userId),
        reportService.getTeamPurchasesReport(userId),
        reportService.getUserSummaryReport(userId)
      ]);
      
      setSubscriptionPayments(payments);
      setOrders(orderData);
      setTeamPurchases(purchases);
      setUserSummary(summary);
      
      toast.success('Полный отчет загружен');
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка загрузки полного отчета';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Экспорт subscription payments в CSV
   */
  const exportSubscriptionPayments = useCallback(() => {
    if (subscriptionPayments.length === 0) {
      toast.error('Нет данных для экспорта');
      return;
    }
    
    const exportData = subscriptionPayments.map(payment => ({
      'ID': payment.id,
      'Сумма': payment.amount || 0,
      'Дата оплаты': payment.paid_at,
      'Метод': payment.method || '-',
      'Статус': payment.status || '-',
      'Спонсорский бонус': payment.sponsor_bonus || 0,
      'CEO бонус': payment.ceo_bonus || 0,
      'Спонсор': payment.parent_info?.email || '-',
      'Примечания': payment.notes || '-'
    }));
    
    reportService.exportToCSV(exportData, 'subscription_payments');
    toast.success('Данные экспортированы');
  }, [subscriptionPayments]);

  /**
   * Экспорт заказов в CSV
   */
  const exportOrders = useCallback(() => {
    if (orders.length === 0) {
      toast.error('Нет данных для экспорта');
      return;
    }
    
    const exportData: any[] = [];
    
    orders.forEach(order => {
      order.items.forEach(item => {
        exportData.push({
          'Номер заказа': order.order_number || order.id,
          'Дата создания': order.created_at,
          'Товар': item.product?.name || '-',
          'Категория': item.product?.category || '-',
          'Количество': item.quantity || 0,
          'Цена': item.price || 0,
          'Сумма': item.total || 0,
          'Статус заказа': order.order_status || '-',
          'Статус оплаты': order.payment_status || '-',
          'Общая сумма заказа': order.total_amount || 0
        });
      });
    });
    
    reportService.exportToCSV(exportData, 'orders');
    toast.success('Данные экспортированы');
  }, [orders]);

  /**
   * Экспорт командных закупок в CSV
   */
  const exportTeamPurchases = useCallback(() => {
    if (teamPurchases.length === 0) {
      toast.error('Нет данных для экспорта');
      return;
    }
    
    const exportData = teamPurchases.map(tp => ({
      'Название закупки': tp.team_purchase?.title || '-',
      'Статус закупки': tp.team_purchase?.status || '-',
      'Роль': tp.role || 'member',
      'Статус участника': tp.status || '-',
      'Целевой вклад': tp.contribution_target || 0,
      'Фактический вклад': tp.contribution_actual || 0,
      'Дата присоединения': tp.joined_at || '-',
      'Дата покупки': tp.purchased_at || '-',
      'Заработано бонусов': tp.bonuses?.total_earned || 0,
      'Личный бонус': tp.bonuses?.personal_bonus || 0,
      'Командный бонус': tp.bonuses?.team_bonus || 0
    }));
    
    reportService.exportToCSV(exportData, 'team_purchases');
    toast.success('Данные экспортированы');
  }, [teamPurchases]);

  /**
   * Экспорт сводки в CSV
   */
  const exportSummary = useCallback(() => {
    if (!userSummary) {
      toast.error('Нет данных для экспорта');
      return;
    }
    
    const exportData = [{
      'User ID': userSummary.user_id,
      'Email': userSummary.user_info.email || '-',
      'Имя': userSummary.user_info.first_name || '-',
      'Фамилия': userSummary.user_info.last_name || '-',
      'Роль': userSummary.user_info.role || '-',
      'Личный товарооборот': userSummary.user_info.personal_turnover || 0,
      'Личный уровень': userSummary.user_info.personal_level || 0,
      'Подписочные платежи (сумма)': userSummary.subscription_payments.total,
      'Подписочные платежи (кол-во)': userSummary.subscription_payments.count,
      'Заказы (сумма)': userSummary.orders.total_amount,
      'Заказы (кол-во)': userSummary.orders.order_count,
      'Товаров куплено': userSummary.orders.item_count,
      'Командные закупки (вклад)': userSummary.team_purchases.total_contribution,
      'Командные закупки (кол-во)': userSummary.team_purchases.purchase_count,
      'Активные закупки': userSummary.team_purchases.active_purchases,
      'Завершенные закупки': userSummary.team_purchases.completed_purchases,
      'Бонусы заработано': userSummary.bonuses.total_earned,
      'Бонусы выплачено': userSummary.bonuses.total_paid,
      'Бонусы в ожидании': userSummary.bonuses.pending
    }];
    
    reportService.exportToCSV(exportData, 'user_summary');
    toast.success('Сводка экспортирована');
  }, [userSummary]);

  /**
   * Установка диапазона дат
   */
  const setDateRange = useCallback((from: Date | null, to: Date | null) => {
    setDateRangeState({ from, to });
  }, []);

  /**
   * Очистка всех отчетов
   */
  const clearReports = useCallback(() => {
    setSubscriptionPayments([]);
    setOrders([]);
    setTeamPurchases([]);
    setUserSummary(null);
    setError(null);
    toast.info('Отчеты очищены');
  }, []);

  /**
   * Фильтрация данных по датам
   */
  const getFilteredData = useCallback(<T extends { created_at?: string; paid_at?: string }>(
    data: T[]
  ): T[] => {
    if (!dateRange.from && !dateRange.to) return data;
    
    return data.filter(item => {
      const dateStr = (item as any).paid_at || (item as any).created_at;
      if (!dateStr) return true;
      
      const itemDate = new Date(dateStr);
      
      if (dateRange.from && itemDate < dateRange.from) return false;
      if (dateRange.to && itemDate > dateRange.to) return false;
      
      return true;
    });
  }, [dateRange]);

  return {
    // Состояния
    subscriptionPayments,
    orders,
    teamPurchases,
    userSummary,
    loading,
    error,
    dateRange,
    
    // Действия
    loadSubscriptionPaymentsReport,
    loadOrdersReport,
    loadTeamPurchasesReport,
    loadUserSummaryReport,
    loadFullReport,
    
    // Экспорт
    exportSubscriptionPayments,
    exportOrders,
    exportTeamPurchases,
    exportSummary,
    
    // Утилиты
    setDateRange,
    clearReports,
    getFilteredData
  };
};