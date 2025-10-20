// src/lib/order/OrderService.ts
// ПРОСТАЯ ВЕРСИЯ: без автоматической проверки оплаты

import { supabase } from '@/lib/supabase/client';

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  total_amount: number;
  order_status: 'new' | 'confirmed' | 'processing' | 'ready_for_pickup' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  payment_status: 'pending' | 'paid' | 'cancelled' | 'refunded' | 'processing';
  delivery_address: string;
  notes?: string | null;
  created_at: string;
  updated_at: string | null;
  paid_at: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  total: number;
  product?: {
    name: string;
    image_url: string | null;
    category: string | null;
  };
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export interface ServiceResult<T = void> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class OrderService {
  
  /**
   * Создать заказ из корзины
   */
  async createAndPayOrder(
    userId: string,
    cartId: string,
    deliveryAddress: string,
    deliveryMethod: 'pickup' | 'delivery' = 'pickup',
    notes?: string
  ): Promise<ServiceResult<Order>> {
    try {
      const { data, error } = await supabase.rpc('create_and_pay_order', {
        p_user_id: userId,
        p_cart_id: cartId,
        p_delivery_address: deliveryAddress,
        p_delivery_method: deliveryMethod,
        p_notes: notes || null
      });

      if (error) throw error;

      if (!data || !data.success) {
        return {
          success: false,
          error: data?.message || 'Не удалось создать заказ'
        };
      }

      return {
        success: true,
        data: data.order,
        message: 'Заказ создан'
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Ошибка создания заказа'
      };
    }
  }

  /**
   * Подтвердить оплату (клиент сказал "Я оплатил")
   */
  async confirmPayment(
    orderId: string,
    userId: string,
    paymentNotes: string
  ): Promise<ServiceResult> {
    try {
      // Проверяем что заказ существует и принадлежит пользователю
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('user_id, notes')
        .eq('id', orderId)
        .single();

      if (fetchError || !order) {
        return { success: false, error: 'Заказ не найден' };
      }

      if (order.user_id !== userId) {
        return { success: false, error: 'У вас нет доступа к этому заказу' };
      }

      // Добавляем заметки от клиента
      const updatedNotes = order.notes 
        ? `${order.notes}\n\nДанные оплаты:\n${paymentNotes}`
        : `Данные оплаты:\n${paymentNotes}`;

      // Обновляем статус на PAID
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
          notes: updatedNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      return { success: true, message: 'Оплата подтверждена' };

    } catch (error: any) {
      return { success: false, error: error.message || 'Ошибка подтверждения оплаты' };
    }
  }

  /**
   * Отклонить оплату (клиент сказал "Не оплатил")
   */
  async declinePayment(
    orderId: string,
    userId: string,
    declineNotes: string
  ): Promise<ServiceResult> {
    try {
      // Проверяем что заказ существует и принадлежит пользователю
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('user_id, notes')
        .eq('id', orderId)
        .single();

      if (fetchError || !order) {
        return { success: false, error: 'Заказ не найден' };
      }

      if (order.user_id !== userId) {
        return { success: false, error: 'У вас нет доступа к этому заказу' };
      }

      // Добавляем причину
      const updatedNotes = order.notes 
        ? `${order.notes}\n\nОплата не выполнена:\n${declineNotes}`
        : `Оплата не выполнена:\n${declineNotes}`;

      // Обновляем статус на PENDING
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'pending',
          notes: updatedNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      return { success: true, message: 'Заказ сохранен' };

    } catch (error: any) {
      return { success: false, error: error.message || 'Ошибка сохранения заказа' };
    }
  }

  /**
   * Получить заказы пользователя
   */
  async getUserOrders(userId: string, limit?: number): Promise<ServiceResult<OrderWithItems[]>> {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            quantity,
            price,
            total,
            products (
              name,
              image_url,
              category
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (limit) query = query.limit(limit);

      const { data: orders, error } = await query;
      if (error) throw error;

      const processedOrders: OrderWithItems[] = (orders || []).map(order => ({
        ...order,
        order_items: (order.order_items || []).map((item: any) => ({
          id: item.id,
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity || 1,
          price: item.price || 0,
          total: item.total || 0,
          product: item.products ? {
            name: item.products.name,
            image_url: item.products.image_url,
            category: item.products.category
          } : undefined
        }))
      }));

      return { success: true, data: processedOrders };

    } catch (error: any) {
      return { success: false, error: error.message || 'Ошибка загрузки заказов' };
    }
  }

  /**
   * Получить заказ по ID
   */
  async getOrderById(orderId: string, userId: string): Promise<ServiceResult<OrderWithItems>> {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            quantity,
            price,
            total,
            products (
              name,
              image_url,
              category
            )
          )
        `)
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: 'Заказ не найден' };
        }
        throw error;
      }

      const processedOrder: OrderWithItems = {
        ...order,
        order_items: (order.order_items || []).map((item: any) => ({
          id: item.id,
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity || 1,
          price: item.price || 0,
          total: item.total || 0,
          product: item.products ? {
            name: item.products.name,
            image_url: item.products.image_url,
            category: item.products.category
          } : undefined
        }))
      };

      return { success: true, data: processedOrder };

    } catch (error: any) {
      return { success: false, error: error.message || 'Ошибка загрузки заказа' };
    }
  }

  /**
   * Отменить заказ
   */
  async cancelOrder(orderId: string, userId: string): Promise<ServiceResult> {
    try {
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('order_status, user_id')
        .eq('id', orderId)
        .single();

      if (fetchError || !order) {
        return { success: false, error: 'Заказ не найден' };
      }

      if (order.user_id !== userId) {
        return { success: false, error: 'У вас нет доступа' };
      }

      if (['shipped', 'delivered'].includes(order.order_status)) {
        return { success: false, error: 'Заказ нельзя отменить' };
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update({
          order_status: 'cancelled',
          payment_status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      return { success: true, message: 'Заказ отменен' };

    } catch (error: any) {
      return { success: false, error: error.message || 'Ошибка отмены заказа' };
    }
  }

  /**
   * Статистика заказов
   */
  async getUserOrdersStats(userId: string): Promise<ServiceResult<{
    totalOrders: number;
    totalSpent: number;
    activeOrders: number;
    completedOrders: number;
    pendingOrders: number;
  }>> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('order_status, payment_status, total_amount')
        .eq('user_id', userId);

      if (error) throw error;

      const stats = {
        totalOrders: orders?.length || 0,
        totalSpent: orders?.filter(o => o.payment_status === 'paid')
          .reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
        activeOrders: orders?.filter(o => 
          ['confirmed', 'processing', 'shipped'].includes(o.order_status)
        ).length || 0,
        completedOrders: orders?.filter(o => o.order_status === 'delivered').length || 0,
        pendingOrders: orders?.filter(o => o.payment_status === 'pending').length || 0
      };

      return { success: true, data: stats };

    } catch (error: any) {
      return { success: false, error: error.message || 'Ошибка загрузки статистики' };
    }
  }
}

export const orderService = new OrderService();