// src/lib/order/OrderService.ts

import { supabase } from '@/lib/supabase/client';
import type { Order, CreateOrderInput } from '@/types';

class OrderService {
  /**
   * Создать заказ
   */
  async createOrder(
    userId: string,
    total: number,
    deliveryAddress: string,
    notes?: string
  ): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: userId,  // Теперь просто userId, не массив
        total_amount: total,
        order_number: `ORD-${Date.now()}`,
        payment_status: 'pending',
        order_status: 'new',
        delivery_address: deliveryAddress,
        notes: notes
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      throw new Error(error.message);
    }
    
    return data;
  }

  /**
   * Создать позиции заказа
   */
  async createOrderItems(orderId: string, items: any[]): Promise<void> {
    const { error } = await supabase
      .from('order_items')
      .insert(items.map(item => ({
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        volume: item.quantity
      })));

    if (error) {
      console.error('Error creating order items:', error);
      throw new Error(error.message);
    }
  }

  /**
   * Запустить расчет бонусов
   */
  async calculateBonuses(orderId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('calculate_order_bonuses', { 
        p_order_id: orderId 
      });
      
      if (error) {
        console.error('Bonus calculation error:', error);
      }
    } catch (error) {
      console.error('Bonus calculation error:', error);
    }
  }

  /**
   * Получить заказы пользователя
   */
  async getUserOrders(userId: string): Promise<Order[]> {
    // Сначала получаем заказы
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)  // Теперь используем eq вместо contains
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      throw new Error(ordersError.message);
    }

    if (!orders || orders.length === 0) {
      return [];
    }

    // Затем получаем позиции заказов для всех заказов
    const orderIds = orders.map(order => order.id);
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        product:products!fk_order_items_product (
          id,
          name,
          image_url,
          category
        )
      `)
      .in('order_id', orderIds);

    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      // Возвращаем заказы без позиций
      return orders;
    }

    // Группируем позиции по заказам
    const ordersWithItems = orders.map(order => ({
      ...order,
      order_items: orderItems?.filter(item => item.order_id === order.id) || []
    }));

    return ordersWithItems;
  }

  /**
   * Получить заказ по ID
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    // Сначала получаем заказ
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('Error fetching order:', orderError);
      throw new Error(orderError.message);
    }

    if (!order) {
      return null;
    }

    // Получаем позиции заказа
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        product:products!fk_order_items_product (
          id,
          name,
          image_url,
          category,
          price,
          price_dealer
        )
      `)
      .eq('order_id', orderId);

    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      return order;
    }

    // Получаем информацию о пользователе
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', order.user_id)  // Теперь просто order.user_id
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
    }

    return {
      ...order,
      order_items: orderItems || [],
      user: user || null
    };
  }

  /**
   * Обновить статус заказа
   */
  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    // Используем RPC функцию напрямую
    const { error } = await supabase.rpc('update_order_status', {
      p_order_id: orderId,
      p_status: status
    });

    if (error) {
      console.error('Error updating order status:', error);
      throw new Error(error.message);
    }
  }

  /**
   * Обновить статус оплаты
   */
  async updatePaymentStatus(orderId: string, status: string): Promise<void> {
    // Используем RPC функцию напрямую
    const { error } = await supabase.rpc('update_payment_status', {
      p_order_id: orderId,
      p_status: status
    });

    if (error) {
      console.error('Error updating payment status:', error);
      throw new Error(error.message);
    }
  }

  /**
   * Альтернативный метод обновления через создание новой функции
   * Используется когда стандартные методы не работают из-за типа user_id
   */
  private async updateOrderViaRawQuery(orderId: string, updates: any): Promise<void> {
    console.log('Using alternative update method for order:', orderId);
    
    // Создаем временную RPC функцию для обновления
    const updateFields = Object.entries(updates)
      .filter(([key]) => key !== 'updated_at')
      .map(([key, value]) => {
        if (key === 'payment_status' || key === 'order_status') {
          return `${key} = '${value}'::${key}`;
        } else if (typeof value === 'string') {
          return `${key} = '${value}'`;
        } else if (value === null) {
          return `${key} = NULL`;
        } else {
          return `${key} = ${value}`;
        }
      })
      .join(', ');

    // Используем raw SQL через RPC (нужно создать эту функцию в Supabase)
    const { error } = await supabase.rpc('execute_raw_update', {
      p_table: 'orders',
      p_id: orderId,
      p_updates: updateFields
    });

    if (error) {
      console.error('Error with raw update:', error);
      
      // Последний вариант - получить и пересоздать
      const { data: currentOrder, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (fetchError || !currentOrder) {
        console.error('Error fetching order for update:', fetchError);
        throw new Error('Order not found');
      }

      // Создаем объект с обновленными данными
      const updatedOrder = {
        ...currentOrder,
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Удаляем старую запись
      const { error: deleteError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (deleteError) {
        console.error('Error deleting old order:', deleteError);
        throw new Error(deleteError.message);
      }

      // Создаем новую запись
      const { error: insertError } = await supabase
        .from('orders')
        .insert(updatedOrder);

      if (insertError) {
        console.error('Error inserting updated order:', insertError);
        // Пытаемся восстановить старую запись
        await supabase.from('orders').insert(currentOrder);
        throw new Error(insertError.message);
      }
    }
  }

  /**
   * Отменить заказ
   */
  async cancelOrder(orderId: string): Promise<void> {
    const { error } = await supabase.rpc('update_order_status', {
      p_order_id: orderId,
      p_status: 'cancelled'
    });

    if (error) {
      console.error('Error cancelling order:', error);
      throw new Error(error.message);
    }
    
    // Также обновляем статус оплаты
    await this.updatePaymentStatus(orderId, 'cancelled');
  }

  /**
   * Получить статистику заказов пользователя
   */
  async getUserOrderStats(userId: string): Promise<{
    totalOrders: number;
    totalSpent: number;
    pendingOrders: number;
    deliveredOrders: number;
  }> {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('total_amount, order_status, payment_status')
      .eq('user_id', userId);  // Используем eq вместо contains

    if (error) {
      console.error('Error fetching order stats:', error);
      return {
        totalOrders: 0,
        totalSpent: 0,
        pendingOrders: 0,
        deliveredOrders: 0
      };
    }

    const stats = {
      totalOrders: orders?.length || 0,
      totalSpent: orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0,
      pendingOrders: orders?.filter(o => o.payment_status === 'pending').length || 0,
      deliveredOrders: orders?.filter(o => o.order_status === 'delivered').length || 0
    };

    return stats;
  }

  /**
   * Получить последний заказ пользователя
   */
  async getLastUserOrder(userId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)  // Используем eq вместо contains
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching last order:', error);
      return null;
    }

    return data;
  }

  /**
   * Обновить заказ
   */
  async updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      if (error.message.includes('operator does not exist')) {
        await this.updateOrderViaRawQuery(orderId, updates);
      } else {
        console.error('Error updating order:', error);
        throw new Error(error.message);
      }
    }
  }

  /**
   * Удалить позицию заказа
   */
  async deleteOrderItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('order_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting order item:', error);
      throw new Error(error.message);
    }
  }

  /**
   * Пересчитать сумму заказа
   */
  async recalculateOrderTotal(orderId: string): Promise<void> {
    // Получаем все позиции заказа
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('total')
      .eq('order_id', orderId);

    if (itemsError) {
      console.error('Error fetching order items for recalculation:', itemsError);
      throw new Error(itemsError.message);
    }

    // Считаем общую сумму
    const total = items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;

    // Обновляем сумму заказа
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        total_amount: total,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) {
      if (updateError.message.includes('operator does not exist')) {
        await this.updateOrderViaRawQuery(orderId, { total_amount: total });
      } else {
        console.error('Error updating order total:', updateError);
        throw new Error(updateError.message);
      }
    }
  }

  /**
   * Получить заказы по статусу
   */
  async getOrdersByStatus(userId: string, status: string): Promise<Order[]> {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)  // Используем eq вместо contains
      .eq('order_status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders by status:', error);
      throw new Error(error.message);
    }

    return orders || [];
  }

  /**
   * Получить заказы за период
   */
  async getOrdersByDateRange(userId: string, startDate: string, endDate: string): Promise<Order[]> {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)  // Используем eq вместо contains
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders by date range:', error);
      throw new Error(error.message);
    }

    return orders || [];
  }

  /**
   * Поиск заказов по номеру
   */
  async searchOrdersByNumber(userId: string, searchQuery: string): Promise<Order[]> {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)  // Используем eq вместо contains
      .ilike('order_number', `%${searchQuery}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching orders:', error);
      throw new Error(error.message);
    }

    return orders || [];
  }

  /**
   * Проверить существование заказа
   */
  async checkOrderExists(orderId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('orders')
      .select('id')
      .eq('id', orderId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking order existence:', error);
      return false;
    }

    return !!data;
  }

  /**
   * Получить количество заказов пользователя
   */
  async getUserOrdersCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);  // Используем eq вместо contains

    if (error) {
      console.error('Error fetching orders count:', error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Получить все заказы (для админа)
   */
  async getAllOrders(): Promise<Order[]> {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching all orders:', ordersError);
      throw new Error(ordersError.message);
    }

    if (!orders || orders.length === 0) {
      return [];
    }

    // Получаем позиции заказов
    const orderIds = orders.map(order => order.id);
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        product:products!fk_order_items_product (
          id,
          name,
          image_url,
          category
        )
      `)
      .in('order_id', orderIds);

    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      return orders;
    }

    // Получаем пользователей
    const userIds = [...new Set(orders.map(order => order.user_id).filter(Boolean))];  // Упрощено
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .in('id', userIds);

    if (usersError) {
      console.error('Error fetching users:', usersError);
    }

    // Группируем данные
    const ordersWithDetails = orders.map(order => {
      const user = users?.find(u => u.id === order.user_id);  // Упрощено
      return {
        ...order,
        order_items: orderItems?.filter(item => item.order_id === order.id) || [],
        user: user || null
      };
    });

    return ordersWithDetails;
  }

  /**
   * Обновить заказ (для админа)
   */
  async adminUpdateOrder(orderId: string, updates: any): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      if (error.message.includes('operator does not exist')) {
        await this.updateOrderViaRawQuery(orderId, updates);
      } else {
        console.error('Error updating order (admin):', error);
        throw new Error(error.message);
      }
    }
  }
}

export const orderService = new OrderService();