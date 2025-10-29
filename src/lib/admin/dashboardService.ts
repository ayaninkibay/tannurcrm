// src/lib/admin/dashboardService.ts

import type { Database } from '@/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

// Типы для дашборда
export interface DashboardStats {
  dealers: {
    total: number;
    newThisMonth: number;
    active: number;
  };
  orders: {
    total: number;
    new: number;
    processing: number;
    readyForPickup: number;
    completed: number;
    totalAmount: number;
    monthlyAmount: number;
  };
  subscriptions: {
    totalCount: number;
    monthlyCount: number;
    totalAmount: number;
    monthlyAmount: number;
  };
  withdrawals: {
    pending: number;
    processing: number;
    approved: number;
    totalAmount: number;
    pendingAmount: number;
  };
  turnover: {
    shop: number;
    tnba: number;
    subscription: number;
    total: number;
    trend: number;
  };
  warehouse: {
    totalProducts: number;
    totalStock: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  bonusEvents: {
    active: number;
    upcoming: number;
    total: number;
  };
  topPerformers: Array<{
    userId: string;
    fullName: string;
    email: string | null;
    turnover: number;
    bonusPercent: number;
  }>;
}

export interface MonthlyTurnoverData {
  month: string;
  shop: number;
  tnba: number;
  subscription: number;
  total: number;
}

export interface StockAlert {
  id: string;
  name: string;
  stock: number;
  price: number;
  category: string | null;
}

// Кеш данных
let cachedStats: DashboardStats | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 2 * 60 * 1000; // 2 минуты

// Проверка актуальности кеша
function isCacheValid(): boolean {
  return cachedStats !== null && Date.now() - cacheTimestamp < CACHE_DURATION;
}

/**
 * Получение статистики дилеров
 */
async function getDealersStats(supabase: SupabaseClient<Database>) {
  try {
    const { count: totalDealers, error: totalError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'dealer');

    if (totalError) throw totalError;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: newDealers, error: newError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'dealer')
      .gte('created_at', startOfMonth.toISOString());

    if (newError) throw newError;

    const { count: activeDealers, error: activeError } = await supabase
      .from('user_turnover_current')
      .select('*', { count: 'exact', head: true })
      .gt('total_turnover', 0);

    if (activeError) throw activeError;

    return {
      total: totalDealers || 0,
      newThisMonth: newDealers || 0,
      active: activeDealers || 0,
    };
  } catch (error) {
    console.error('Error fetching dealers stats:', error);
    return { total: 0, newThisMonth: 0, active: 0 };
  }
}

/**
 * Получение статистики заказов
 */
async function getOrdersStats(supabase: SupabaseClient<Database>) {
  try {
    const { data: allOrders, error: ordersError } = await supabase
      .from('orders')
      .select('status, total_amount, payment_status, created_at');

    if (ordersError) throw ordersError;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const stats = {
      total: allOrders?.length || 0,
      new: 0,
      processing: 0,
      readyForPickup: 0,
      completed: 0,
      totalAmount: 0,
      monthlyAmount: 0,
    };

    allOrders?.forEach(order => {
      if (order.payment_status === 'paid') {
        stats.totalAmount += order.total_amount || 0;
        
        if (new Date(order.created_at) >= startOfMonth) {
          stats.monthlyAmount += order.total_amount || 0;
        }
      }
      
      // Считаем новые заказы
      if (order.status === 'new') {
        stats.new++;
      }
      
      // Считаем заказы в обработке
      if (order.status === 'processing' || order.status === 'confirmed') {
        stats.processing++;
      }
      
      // Считаем готовые к выдаче
      if (order.status === 'ready_for_pickup' || order.status === 'shipped') {
        stats.readyForPickup++;
      }
      
      // Считаем завершенные
      if (order.status === 'delivered') {
        stats.completed++;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error fetching orders stats:', error);
    return {
      total: 0,
      new: 0,
      processing: 0,
      readyForPickup: 0,
      completed: 0,
      totalAmount: 0,
      monthlyAmount: 0,
    };
  }
}

/**
 * Получение статистики подписок
 */
async function getSubscriptionsStats(supabase: SupabaseClient<Database>) {
  try {
    const { data: allSubscriptions, error: subsError } = await supabase
      .from('subscription_payments')
      .select('amount, status, created_at');

    if (subsError) throw subsError;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const stats = {
      totalCount: 0,
      monthlyCount: 0,
      totalAmount: 0,
      monthlyAmount: 0,
    };

    allSubscriptions?.forEach(sub => {
      if (sub.status === 'paid') {
        stats.totalCount++;
        stats.totalAmount += sub.amount || 0;
        
        if (sub.created_at && new Date(sub.created_at) >= startOfMonth) {
          stats.monthlyCount++;
          stats.monthlyAmount += sub.amount || 0;
        }
      }
    });

    return stats;
  } catch (error) {
    console.error('Error fetching subscriptions stats:', error);
    return {
      totalCount: 0,
      monthlyCount: 0,
      totalAmount: 0,
      monthlyAmount: 0,
    };
  }
}

/**
 * Получение статистики запросов на вывод
 */
async function getWithdrawalsStats(supabase: SupabaseClient<Database>) {
  try {
    const { data: withdrawals, error } = await supabase
      .from('withdrawal_requests')
      .select('status, amount');

    if (error) throw error;

    const stats = {
      pending: 0,
      processing: 0,
      approved: 0,
      totalAmount: 0,
      pendingAmount: 0,
    };

    withdrawals?.forEach(withdrawal => {
      stats.totalAmount += withdrawal.amount || 0;
      
      switch (withdrawal.status) {
        case 'pending':
          stats.pending++;
          stats.pendingAmount += withdrawal.amount || 0;
          break;
        case 'processing':
          stats.processing++;
          break;
        case 'approved':
          stats.approved++;
          break;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error fetching withdrawals stats:', error);
    return {
      pending: 0,
      processing: 0,
      approved: 0,
      totalAmount: 0,
      pendingAmount: 0,
    };
  }
}

/**
 * Получение статистики оборота
 */
async function getTurnoverStats(supabase: SupabaseClient<Database>) {
  try {
    const { data: currentMonth, error: currentError } = await supabase
      .from('user_turnover_current')
      .select('personal_turnover');

    if (currentError) throw currentError;

    const currentTotal = currentMonth?.reduce((sum, row) => 
      sum + (row.personal_turnover || 0), 0
    ) || 0;

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthStr = lastMonth.toISOString().slice(0, 7) + '-01';

    const { data: previousMonth, error: previousError } = await supabase
      .from('user_turnover_history')
      .select('personal_turnover')
      .eq('month_start', lastMonthStr);

    if (previousError) throw previousError;

    const previousTotal = previousMonth?.reduce((sum, row) => 
      sum + (row.personal_turnover || 0), 0
    ) || 0;

    const trend = previousTotal > 0 
      ? ((currentTotal - previousTotal) / previousTotal) * 100 
      : 0;

    return {
      shop: currentTotal * 0.6,
      tnba: currentTotal * 0.3,
      subscription: currentTotal * 0.1,
      total: currentTotal,
      trend: Math.round(trend),
    };
  } catch (error) {
    console.error('Error fetching turnover stats:', error);
    return {
      shop: 0,
      tnba: 0,
      subscription: 0,
      total: 0,
      trend: 0,
    };
  }
}

/**
 * Получение статистики склада
 */
async function getWarehouseStats(supabase: SupabaseClient<Database>) {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('stock, price_dealer, price, is_active')
      .eq('is_active', true);

    if (error) throw error;

    const stats = {
      totalProducts: products?.length || 0,
      totalStock: 0,
      totalValue: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
    };

    products?.forEach(product => {
      const stock = product.stock || 0;
      const price = product.price_dealer || product.price || 0;

      stats.totalStock += stock;
      stats.totalValue += stock * price;

      if (stock === 0) {
        stats.outOfStockCount++;
      } else if (stock < 10) {
        stats.lowStockCount++;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error fetching warehouse stats:', error);
    return {
      totalProducts: 0,
      totalStock: 0,
      totalValue: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
    };
  }
}

/**
 * Получение статистики бонусных событий
 */
async function getBonusEventsStats(supabase: SupabaseClient<Database>) {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: events, error } = await supabase
      .from('bonus_events')
      .select('start_date, end_date, is_active');

    if (error) throw error;

    const stats = {
      active: 0,
      upcoming: 0,
      total: events?.length || 0,
    };

    events?.forEach(event => {
      if (event.is_active && event.start_date <= today && event.end_date >= today) {
        stats.active++;
      } else if (event.start_date > today) {
        stats.upcoming++;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error fetching bonus events stats:', error);
    return { active: 0, upcoming: 0, total: 0 };
  }
}

/**
 * Получение топ исполнителей
 */
async function getTopPerformers(supabase: SupabaseClient<Database>, limit: number = 5) {
  try {
    const { data, error } = await supabase
      .from('user_turnover_current')
      .select(`
        user_id,
        total_turnover,
        bonus_percent,
        users:user_id (
          first_name,
          last_name,
          email
        )
      `)
      .order('total_turnover', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data?.map((row: any) => ({
      userId: row.user_id,
      fullName: `${row.users?.first_name || ''} ${row.users?.last_name || ''}`.trim() || 'Без имени',
      email: row.users?.email || null,
      turnover: row.total_turnover || 0,
      bonusPercent: row.bonus_percent || 0,
    })) || [];
  } catch (error) {
    console.error('Error fetching top performers:', error);
    return [];
  }
}

/**
 * Получение данных для графика по месяцам
 */
export async function getMonthlyTurnoverChart(
  supabase: SupabaseClient<Database>,
  months: number = 6
): Promise<MonthlyTurnoverData[]> {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    const startDateStr = startDate.toISOString().slice(0, 7) + '-01';

    const { data, error } = await supabase
      .from('user_turnover_history')
      .select('month_start, personal_turnover')
      .gte('month_start', startDateStr)
      .order('month_start', { ascending: true });

    if (error) throw error;

    const monthlyData: { [key: string]: number } = {};
    data?.forEach(row => {
      const month = row.month_start;
      monthlyData[month] = (monthlyData[month] || 0) + (row.personal_turnover || 0);
    });

    return Object.entries(monthlyData).map(([month, total]) => ({
      month,
      shop: total * 0.6,
      tnba: total * 0.3,
      subscription: total * 0.1,
      total,
    }));
  } catch (error) {
    console.error('Error fetching monthly turnover:', error);
    return [];
  }
}

/**
 * Получение товаров с низким остатком
 */
export async function getStockAlerts(
  supabase: SupabaseClient<Database>
): Promise<StockAlert[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, stock, price_dealer, price, category')
      .eq('is_active', true)
      .lte('stock', 10)
      .order('stock', { ascending: true })
      .limit(10);

    if (error) throw error;

    return data?.map(product => ({
      id: product.id,
      name: product.name || 'Без названия',
      stock: product.stock || 0,
      price: product.price_dealer || product.price || 0,
      category: product.category,
    })) || [];
  } catch (error) {
    console.error('Error fetching stock alerts:', error);
    return [];
  }
}

/**
 * Главная функция получения всех данных дашборда
 */
export async function getDashboardStats(
  supabase: SupabaseClient<Database>,
  useCache: boolean = true
): Promise<DashboardStats> {
  if (useCache && isCacheValid()) {
    return cachedStats!;
  }

  try {
    const [
      dealers,
      orders,
      subscriptions,
      withdrawals,
      turnover,
      warehouse,
      bonusEvents,
      topPerformers,
    ] = await Promise.all([
      getDealersStats(supabase),
      getOrdersStats(supabase),
      getSubscriptionsStats(supabase),
      getWithdrawalsStats(supabase),
      getTurnoverStats(supabase),
      getWarehouseStats(supabase),
      getBonusEventsStats(supabase),
      getTopPerformers(supabase),
    ]);

    const stats: DashboardStats = {
      dealers,
      orders,
      subscriptions,
      withdrawals,
      turnover,
      warehouse,
      bonusEvents,
      topPerformers,
    };

    cachedStats = stats;
    cacheTimestamp = Date.now();

    return stats;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

/**
 * Принудительное обновление кеша
 */
export function invalidateCache() {
  cachedStats = null;
  cacheTimestamp = 0;
}