// src/lib/orders/OrderDeleteService.ts

import { supabase } from '@/lib/supabase/client';

// ==========================================
// ТИПЫ
// ==========================================

export interface DeleteOrdersResult {
  success: boolean;
  message: string;
  deleted_orders: number;
  deleted_items: number;
}

export interface DeleteOrdersParams {
  orderIds: string[];
  skipConfirmation?: boolean;
}

// ==========================================
// СЕРВИС
// ==========================================

class OrderDeleteService {
  
  /**
   * Удалить выбранные заказы
   * @param orderIds - Массив ID заказов для удаления
   * @returns Результат удаления с количеством удаленных записей
   */
  async deleteOrders(orderIds: string[]): Promise<DeleteOrdersResult> {
    // Валидация входных данных
    if (!orderIds || orderIds.length === 0) {
      console.warn('⚠️ No order IDs provided for deletion');
      return {
        success: false,
        message: 'Не выбраны заказы для удаления',
        deleted_orders: 0,
        deleted_items: 0
      };
    }

    try {
      console.log('🗑️ Deleting orders:', {
        count: orderIds.length,
        ids: orderIds
      });

      // Вызываем RPC функцию
      const { data, error } = await supabase.rpc('delete_orders', {
        p_order_ids: orderIds
      });

      if (error) {
        console.error('❌ Error calling delete_orders RPC:', error);
        throw error;
      }

      // Проверяем результат
      if (!data) {
        throw new Error('No data returned from delete_orders');
      }

      console.log('✅ Orders deleted successfully:', data);

      return {
        success: data.success || false,
        message: data.message || 'Заказы удалены',
        deleted_orders: data.deleted_orders || 0,
        deleted_items: data.deleted_items || 0
      };

    } catch (error: any) {
      console.error('❌ Error in deleteOrders:', error);
      
      return {
        success: false,
        message: error.message || 'Ошибка при удалении заказов',
        deleted_orders: 0,
        deleted_items: 0
      };
    }
  }

  /**
   * Удалить один заказ
   * @param orderId - ID заказа
   * @returns Результат удаления
   */
  async deleteOrder(orderId: string): Promise<DeleteOrdersResult> {
    console.log('🗑️ Deleting single order:', orderId);
    return this.deleteOrders([orderId]);
  }

  /**
   * Проверить можно ли удалить заказы
   * @param orderIds - Массив ID заказов
   * @returns Результат проверки с предупреждениями
   */
  async canDeleteOrders(orderIds: string[]): Promise<{
    canDelete: boolean;
    warnings: string[];
    ordersInfo: Array<{
      id: string;
      order_number: string;
      status: string;
      total_amount: number;
      items_count: number;
    }>;
  }> {
    try {
      // Получаем информацию о заказах
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          total_amount,
          order_items (count)
        `)
        .in('id', orderIds);

      if (error) throw error;

      const warnings: string[] = [];
      const ordersInfo = (orders || []).map(order => {
        const itemsCount = Array.isArray(order.order_items) 
          ? order.order_items.length 
          : 0;

        // Проверяем статус заказа
        if (order.status === 'delivered') {
          warnings.push(`Заказ ${order.order_number} уже доставлен`);
        }
        if (order.status === 'shipped') {
          warnings.push(`Заказ ${order.order_number} отправлен`);
        }

        return {
          id: order.id,
          order_number: order.order_number || '',
          status: order.status || '',
          total_amount: order.total_amount || 0,
          items_count: itemsCount
        };
      });

      return {
        canDelete: true, // Можно удалять любые заказы, но с предупреждениями
        warnings,
        ordersInfo
      };

    } catch (error: any) {
      console.error('❌ Error checking orders:', error);
      return {
        canDelete: false,
        warnings: ['Ошибка проверки заказов: ' + error.message],
        ordersInfo: []
      };
    }
  }

  /**
   * Получить статистику перед удалением
   * @param orderIds - Массив ID заказов
   */
  async getDeleteStats(orderIds: string[]): Promise<{
    ordersCount: number;
    itemsCount: number;
    totalAmount: number;
  }> {
    try {
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total_amount')
        .in('id', orderIds);

      if (ordersError) throw ordersError;

      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('id')
        .in('order_id', orderIds);

      if (itemsError) throw itemsError;

      const totalAmount = (orders || []).reduce(
        (sum, order) => sum + (order.total_amount || 0), 
        0
      );

      return {
        ordersCount: orders?.length || 0,
        itemsCount: items?.length || 0,
        totalAmount
      };

    } catch (error: any) {
      console.error('❌ Error getting delete stats:', error);
      return {
        ordersCount: 0,
        itemsCount: 0,
        totalAmount: 0
      };
    }
  }

  /**
   * Массовое удаление с батчами (для больших объемов)
   * @param orderIds - Массив ID заказов
   * @param batchSize - Размер батча (по умолчанию 50)
   */
  async deleteBatch(
    orderIds: string[], 
    batchSize: number = 50
  ): Promise<DeleteOrdersResult> {
    const totalOrders = orderIds.length;
    let totalDeleted = 0;
    let totalItems = 0;

    console.log(`🗑️ Starting batch deletion: ${totalOrders} orders, batch size: ${batchSize}`);

    // Разбиваем на батчи
    for (let i = 0; i < totalOrders; i += batchSize) {
      const batch = orderIds.slice(i, i + batchSize);
      
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(totalOrders / batchSize)}`);

      const result = await this.deleteOrders(batch);
      
      if (result.success) {
        totalDeleted += result.deleted_orders;
        totalItems += result.deleted_items;
      } else {
        console.error(`❌ Batch failed:`, result.message);
      }
    }

    return {
      success: totalDeleted > 0,
      message: `Удалено заказов: ${totalDeleted} из ${totalOrders}`,
      deleted_orders: totalDeleted,
      deleted_items: totalItems
    };
  }
}

// Экспортируем singleton
export const orderDeleteService = new OrderDeleteService();