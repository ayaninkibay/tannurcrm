// src/lib/admin_orders/ReportService.ts

import { supabase } from '@/lib/supabase/client';
import { OrderWithItems, OrderStatus } from './OrderService';

export interface ReportFilters {
  startDate: string;
  endDate: string;
  statuses: OrderStatus[];
  includeItems?: boolean;
}

export interface ReportData {
  orders: OrderWithItems[];
  summary: {
    totalOrders: number;
    totalAmount: number;
    totalItems: number;
    byStatus: Record<string, number>;
  };
  filters: ReportFilters;
  generatedAt: string;
  generatedBy: string;
}

export class ReportService {
  
  /**
   * Получить заказы для отчета
   */
  async getOrdersForReport(filters: ReportFilters): Promise<{ 
    success: boolean; 
    data?: ReportData; 
    error?: string 
  }> {
    try {
      console.log('📊 Generating report with filters:', filters);

      // Получаем текущего пользователя
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Пользователь не авторизован' };
      }

      // Получаем данные пользователя
      const { data: userData } = await supabase
        .from('users')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single();

      const generatedBy = userData 
        ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email || 'Неизвестно'
        : 'Неизвестно';

      // Строим запрос
      let query = supabase
        .from('orders')
        .select(`
          *,
          users!fk_orders_user (
            first_name,
            last_name,
            email,
            phone
          ),
          order_items (
            id,
            product_id,
            quantity,
            price,
            total,
            products!fk_order_items_product (
              name,
              price,
              image_url
            )
          )
        `)
        .gte('created_at', filters.startDate)
        .lte('created_at', filters.endDate);

      // Фильтр по статусам
      if (filters.statuses.length > 0) {
        query = query.in('order_status', filters.statuses);
      }

      query = query.order('created_at', { ascending: false });

      const { data: orders, error } = await query;

      if (error) {
        console.error('❌ Error loading orders for report:', error);
        return { success: false, error: error.message };
      }

      // Обрабатываем заказы
      const processedOrders: OrderWithItems[] = orders?.map((order: any) => ({
        ...order,
        user: order.users ? {
          first_name: order.users.first_name,
          last_name: order.users.last_name,
          email: order.users.email,
          phone: order.users.phone
        } : null,
        order_items: order.order_items?.map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity || 1,
          price: item.price || 0,
          total: item.total || ((item.quantity || 1) * (item.price || 0)),
          product: item.products ? {
            name: item.products.name,
            price: item.products.price,
            image_url: item.products.image_url
          } : null
        })) || []
      })) || [];

      // Подсчитываем статистику
      const summary = {
        totalOrders: processedOrders.length,
        totalAmount: processedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
        totalItems: processedOrders.reduce((sum, order) => 
          sum + (order.order_items?.reduce((s, item) => s + (item.quantity || 0), 0) || 0), 0
        ),
        byStatus: processedOrders.reduce((acc, order) => {
          const status = order.order_status || 'unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };

      const reportData: ReportData = {
        orders: processedOrders,
        summary,
        filters,
        generatedAt: new Date().toISOString(),
        generatedBy
      };

      console.log('✅ Report generated:', summary);
      return { success: true, data: reportData };
    } catch (error) {
      console.error('💥 Error generating report:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка генерации отчета' 
      };
    }
  }

  /**
   * Получить сегодняшнюю статистику
   */
  async getTodayStats(): Promise<{
    success: boolean;
    data?: {
      packed: number;
      ready_for_pickup: number;
      shipped: number;
      delivered: number;
    };
    error?: string;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('orders')
        .select('order_status')
        .gte('created_at', today.toISOString());

      if (error) {
        return { success: false, error: error.message };
      }

      const stats = {
        packed: data?.filter(o => o.order_status === 'packed').length || 0,
        ready_for_pickup: data?.filter(o => o.order_status === 'ready_for_pickup').length || 0,
        shipped: data?.filter(o => o.order_status === 'shipped').length || 0,
        delivered: data?.filter(o => o.order_status === 'delivered').length || 0
      };

      return { success: true, data: stats };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка получения статистики'
      };
    }
  }
}
