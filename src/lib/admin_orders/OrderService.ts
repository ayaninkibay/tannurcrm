// src/lib/admin_orders/OrderService.ts

import { supabase } from '@/lib/supabase/client';

export type OrderStatus = 
  | 'new' 
  | 'confirmed' 
  | 'processing' 
  | 'transferred_to_warehouse'
  | 'packed'  // 👈 НОВЫЙ СТАТУС
  | 'ready_for_pickup'
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'returned';

export interface OrderWithItems {
  id: string;
  created_at: string;
  total_amount: number | null;
  order_status: OrderStatus | null;
  order_number: string | null;
  paid_at: string | null;
  referrer_star_id: string | null;
  payment_status: string | null;
  delivery_address: string | null;
  delivery_date: string | null;
  delivery_method: string | null;
  delivery_cost: number | null;
  notes: string | null;
  department_notes: string | null;
  updated_at: string | null;
  user_id: string;
  user?: {
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  order_items?: Array<{
    id?: string;
    product_id?: string | null;
    product?: {
      name?: string | null;
      price?: number | null;
      image_url?: string | null;
    } | null;
    quantity?: number | null;
    price?: number | null;
    total?: number | null;
  }>;
}

export interface ActionLog {
  id: string;
  order_id: string;
  user_id: string;
  action_type: string;
  old_value: string | null;
  new_value: string | null;
  description: string | null;
  metadata: any;
  created_at: string;
  user?: {
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
  } | null;
}

export class OrderService {
  
  /**
   * 🚀 ЗАГРУЖАЕМ ВСЕ АКТИВНЫЕ ЗАКАЗЫ (кроме завершенных)
   */
  async getAllActiveOrders(): Promise<{ 
    success: boolean; 
    data?: OrderWithItems[]; 
    error?: string 
  }> {
    try {
      console.log('📦 Loading ALL active orders...');

      const { data: orders, error } = await supabase
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
        .not('order_status', 'in', '(delivered,cancelled,returned)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading orders:', error);
        return { success: false, error: error.message };
      }

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

      console.log(`✅ Active orders loaded: ${processedOrders.length}`);
      return { success: true, data: processedOrders };
    } catch (error) {
      console.error('💥 Service error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка' 
      };
    }
  }

  /**
   * 🚀 ЗАГРУЖАЕМ ТОЛЬКО ЗАВЕРШЕННЫЕ ЗАКАЗЫ (по запросу)
   */
  async getCompletedOrders(
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ 
    success: boolean; 
    data?: {
      orders: OrderWithItems[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }; 
    error?: string 
  }> {
    try {
      console.log('📦 Loading completed orders...', { page, pageSize });
      
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data: orders, error, count } = await supabase
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
        `, { count: 'exact' })
        .in('order_status', ['delivered', 'cancelled', 'returned'])
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('❌ Error loading completed orders:', error);
        return { success: false, error: error.message };
      }

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

      const totalPages = Math.ceil((count || 0) / pageSize);

      console.log(`✅ Completed orders loaded: ${processedOrders.length} of ${count}`);

      return { 
        success: true, 
        data: {
          orders: processedOrders,
          total: count || 0,
          page,
          pageSize,
          totalPages
        }
      };
    } catch (error) {
      console.error('💥 Service error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка' 
      };
    }
  }

  /**
   * Получение одного заказа по ID
   */
  async getOrderById(orderId: string): Promise<{ success: boolean; data?: OrderWithItems; error?: string }> {
    try {
      console.log('📦 Loading order by ID:', orderId);

      const { data: order, error: orderError } = await supabase
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
        .eq('id', orderId)
        .single();

      if (orderError) {
        console.error('❌ Error loading order:', orderError);
        return { success: false, error: orderError.message };
      }

      const result: OrderWithItems = {
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
      };

      console.log('✅ Order loaded with', result.order_items?.length || 0, 'items');
      
      return { success: true, data: result };
    } catch (error) {
      console.error('💥 Error loading order:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка загрузки заказа' 
      };
    }
  }

  /**
   * Изменение статуса заказа
   */
  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    userId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Updating order status:', { orderId, newStatus, userId, reason });

      const { data: currentOrder, error: fetchError } = await supabase
        .from('orders')
        .select('order_status')
        .eq('id', orderId)
        .single();

      if (fetchError) {
        return { success: false, error: fetchError.message };
      }

      const oldStatus = currentOrder.order_status;

      const statusTranslations: Record<string, string> = {
        'new': 'Новый',
        'confirmed': 'Подтвержден',
        'processing': 'В обработке',
        'transferred_to_warehouse': 'Передан в склад',
        'packed': 'Упакован',  // 👈 НОВЫЙ СТАТУС
        'ready_for_pickup': 'Готов к получению',
        'shipped': 'Отправлен',
        'delivered': 'Доставлен',
        'cancelled': 'Отменен',
        'returned': 'Возврат'
      };

      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          order_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      const oldStatusText = statusTranslations[oldStatus] || oldStatus;
      const newStatusText = statusTranslations[newStatus] || newStatus;

      await this.logAction({
        orderId,
        userId,
        actionType: 'status_changed',
        oldValue: oldStatusText,
        newValue: newStatusText,
        description: reason || `Статус изменен с "${oldStatusText}" на "${newStatusText}"`
      });

      console.log('✅ Order status updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Error updating order status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка обновления статуса'
      };
    }
  }

  /**
   * 🆕 Быстрый перевод заказа в статус "Передан в склад"
   */
  async transferToWarehouse(
    orderId: string,
    userId: string,
    departmentNotes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📦 Transferring order to warehouse...', { orderId, userId });

      const { data: currentOrder, error: fetchError } = await supabase
        .from('orders')
        .select('order_status, department_notes')
        .eq('id', orderId)
        .single();

      if (fetchError) {
        return { success: false, error: fetchError.message };
      }

      const oldStatus = currentOrder.order_status;
      const oldNotes = currentOrder.department_notes;

      const updateData: any = {
        order_status: 'transferred_to_warehouse',
        updated_at: new Date().toISOString()
      };

      if (departmentNotes !== undefined) {
        updateData.department_notes = departmentNotes.trim() || null;
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      await this.logAction({
        orderId,
        userId,
        actionType: 'transferred_to_warehouse',
        oldValue: oldStatus,
        newValue: 'transferred_to_warehouse',
        description: 'Заказ передан в склад'
      });

      if (departmentNotes && departmentNotes.trim()) {
        await this.logAction({
          orderId,
          userId,
          actionType: 'department_note_added',
          oldValue: oldNotes,
          newValue: departmentNotes,
          description: 'Добавлена заметка для склада при передаче заказа'
        });
      }

      console.log('✅ Order transferred to warehouse successfully');
      return { success: true };
    } catch (error) {
      console.error('Error transferring to warehouse:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка передачи в склад'
      };
    }
  }

  /**
   * 🆕 Обновление заметок между отделами
   */
  async updateDepartmentNotes(
    orderId: string,
    departmentNotes: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📝 Updating department notes:', { orderId, userId });

      const { data: currentOrder } = await supabase
        .from('orders')
        .select('department_notes')
        .eq('id', orderId)
        .single();

      const oldNotes = currentOrder?.department_notes || '';
      const newNotes = departmentNotes.trim();

      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          department_notes: newNotes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      let actionType = 'department_note_updated';
      let description = 'Заметка между отделами обновлена';
      
      if (!oldNotes && newNotes) {
        actionType = 'department_note_added';
        description = 'Добавлена заметка между отделами';
      } else if (oldNotes && !newNotes) {
        actionType = 'department_note_deleted';
        description = 'Заметка между отделами удалена';
      }

      await this.logAction({
        orderId,
        userId,
        actionType,
        oldValue: oldNotes,
        newValue: newNotes,
        description
      });

      console.log('✅ Department notes updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Error updating department notes:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка обновления заметок'
      };
    }
  }

  /**
   * Обновление заметок заказа (клиентских заметок)
   */
  async updateOrderNotes(
    orderId: string,
    notes: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Updating order notes:', { orderId, userId });

      const { data: currentOrder } = await supabase
        .from('orders')
        .select('notes')
        .eq('id', orderId)
        .single();

      const oldNotes = currentOrder?.notes || '';

      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          notes: notes.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      let actionType = 'note_updated';
      if (!oldNotes && notes) {
        actionType = 'note_added';
      } else if (oldNotes && !notes) {
        actionType = 'note_deleted';
      }

      await this.logAction({
        orderId,
        userId,
        actionType,
        oldValue: oldNotes,
        newValue: notes,
        description: `Заметка ${actionType === 'note_added' ? 'добавлена' : actionType === 'note_deleted' ? 'удалена' : 'обновлена'}`
      });

      console.log('✅ Order notes updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Error updating order notes:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка обновления заметок'
      };
    }
  }

  /**
   * Обновление адреса доставки
   */
  async updateDeliveryAddress(
    orderId: string,
    address: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Updating delivery address:', { orderId, userId });

      const { data: currentOrder } = await supabase
        .from('orders')
        .select('delivery_address')
        .eq('id', orderId)
        .single();

      const oldAddress = currentOrder?.delivery_address || '';

      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          delivery_address: address.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      await this.logAction({
        orderId,
        userId,
        actionType: 'delivery_address_updated',
        oldValue: oldAddress,
        newValue: address,
        description: 'Адрес доставки обновлен'
      });

      console.log('✅ Delivery address updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Error updating delivery address:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка обновления адреса'
      };
    }
  }

  /**
   * Обновление даты доставки
   */
  async updateDeliveryDate(
    orderId: string,
    date: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Updating delivery date:', { orderId, date, userId });

      const { data: currentOrder } = await supabase
        .from('orders')
        .select('delivery_date')
        .eq('id', orderId)
        .single();

      const oldDate = currentOrder?.delivery_date || '';

      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          delivery_date: date || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      await this.logAction({
        orderId,
        userId,
        actionType: 'delivery_date_updated',
        oldValue: oldDate,
        newValue: date,
        description: 'Дата доставки обновлена'
      });

      console.log('✅ Delivery date updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Error updating delivery date:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка обновления даты'
      };
    }
  }

  /**
   * Обновление типа доставки
   */
  async updateDeliveryMethod(
    orderId: string,
    method: 'pickup' | 'delivery',
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Updating delivery method:', { orderId, method, userId });

      const { data: currentOrder } = await supabase
        .from('orders')
        .select('delivery_method')
        .eq('id', orderId)
        .single();

      const oldMethod = currentOrder?.delivery_method || 'pickup';

      const updates: any = {
        delivery_method: method,
        updated_at: new Date().toISOString()
      };

      if (method === 'pickup') {
        updates.delivery_address = null;
        updates.delivery_cost = 0;
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      const methodText = {
        'pickup': 'Самовывоз',
        'delivery': 'Доставка курьером'
      };

      await this.logAction({
        orderId,
        userId,
        actionType: 'delivery_method_updated',
        oldValue: methodText[oldMethod as 'pickup' | 'delivery'] || oldMethod,
        newValue: methodText[method],
        description: `Тип доставки изменен на "${methodText[method]}"`
      });

      console.log('✅ Delivery method updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Error updating delivery method:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка обновления типа доставки'
      };
    }
  }

  /**
   * Получение журнала действий заказа
   */
  async getOrderActionLog(
    orderId: string,
    limit: number = 50
  ): Promise<{ success: boolean; data?: ActionLog[]; error?: string }> {
    try {
      console.log('Loading action log for order:', orderId);

      const { data, error } = await supabase
        .from('order_action_logs')
        .select(`
          *,
          users!order_action_logs_user_id_fkey (
            first_name,
            last_name,
            email
          )
        `)
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return { success: false, error: error.message };
      }

      const logs: ActionLog[] = data?.map((log: any) => ({
        id: log.id,
        order_id: log.order_id,
        user_id: log.user_id,
        action_type: log.action_type,
        old_value: log.old_value,
        new_value: log.new_value,
        description: log.description,
        metadata: log.metadata,
        created_at: log.created_at,
        user: log.users ? {
          first_name: log.users.first_name,
          last_name: log.users.last_name,
          email: log.users.email
        } : null
      })) || [];

      console.log('✅ Action log loaded:', logs.length, 'entries');
      return { success: true, data: logs };
    } catch (error) {
      console.error('Error loading action log:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка загрузки журнала'
      };
    }
  }

  /**
   * Вспомогательный метод для логирования действий
   */
  private async logAction(params: {
    orderId: string;
    userId: string;
    actionType: string;
    oldValue?: string | null;
    newValue?: string | null;
    description?: string;
    metadata?: any;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('order_action_logs')
        .insert({
          order_id: params.orderId,
          user_id: params.userId,
          action_type: params.actionType,
          old_value: params.oldValue || null,
          new_value: params.newValue || null,
          description: params.description || null,
          metadata: params.metadata || null
        });

      if (error) {
        console.error('Error logging action:', error);
      }
    } catch (error) {
      console.error('Error in logAction:', error);
    }
  }
}
