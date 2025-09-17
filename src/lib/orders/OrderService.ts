import { supabase } from '@/lib/supabase/client';

export interface OrderWithItems {
  id: string;
  created_at: string;
  total_amount: number | null;
  order_status: string | null;
  order_number: string | null;
  paid_at: string | null;
  referrer_star_id: string | null;
  payment_status: string | null;
  delivery_address: string | null;
  delivery_date: string | null;
  notes: string | null;
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
    } | null;
    quantity?: number | null;
    price?: number | null;
    total?: number | null;
  }>;
}

export class OrderService {
  async getActiveOrders(
    limit: number = 10,
    userRole?: 'user' | 'dealer' | 'celebrity'
  ): Promise<{ success: boolean; data?: OrderWithItems[]; error?: string }> {
    try {
      console.log('Loading orders with items...', userRole ? `for role: ${userRole}` : 'all roles');
      
      // Получаем ID пользователей нужной роли
      let userIds: string[] | null = null;
      
      if (userRole) {
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id')
          .eq('role', userRole);
        
        if (usersError) {
          console.error('Error loading users by role:', usersError);
          return { success: false, error: usersError.message };
        }
        
        userIds = users?.map(u => u.id) || [];
        
        if (userIds.length === 0) {
          console.log(`No users found with role: ${userRole}`);
          return { success: true, data: [] };
        }
      }
      
      // Загружаем заказы
      let query = supabase
        .from('orders')
        .select('*')
        .not('order_status', 'is', null)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (userIds && userIds.length > 0) {
        query = query.in('user_id', userIds);
      }
      
      const { data: orders, error: ordersError } = await query;

      if (ordersError) {
        return { success: false, error: ordersError.message };
      }

      // Для каждого заказа загружаем полную информацию
      const processedOrders: OrderWithItems[] = [];
      
      for (const order of orders || []) {
        // Загружаем пользователя
        let user: OrderWithItems['user'] = null;
        if (order.user_id) {
          const { data: userData } = await supabase
            .from('users')
            .select('first_name, last_name, email, phone')
            .eq('id', order.user_id)
            .single();
          
          if (userData) {
            user = {
              first_name: userData.first_name,
              last_name: userData.last_name,
              email: userData.email,
              phone: userData.phone
            };
          }
        }

        // Загружаем товары
        const { data: orderItemsData } = await supabase
          .from('order_items')
          .select(`
            *,
            products!fk_order_items_product (
              name,
              price
            )
          `)
          .eq('order_id', order.id);

        const orderItems = orderItemsData?.map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity || 1,
          price: item.price || 0,
          total: item.total || ((item.quantity || 1) * (item.price || 0)),
          product: item.products ? {
            name: item.products.name,
            price: item.products.price
          } : null
        })) || [];

        processedOrders.push({
          ...order,
          user,
          order_items: orderItems
        });
      }

      console.log(`Orders loaded: ${processedOrders.length}${userRole ? ` for role: ${userRole}` : ''}`);
      return { success: true, data: processedOrders };
    } catch (error) {
      console.error('Service error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка' 
      };
    }
  }

  async getOrderById(orderId: string): Promise<{ success: boolean; data?: OrderWithItems; error?: string }> {
    try {
      console.log('=== Loading order by ID:', orderId);

      // Используем правильные foreign key constraints
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          users!fk_orders_user (
            first_name,
            last_name,
            email,
            phone
          ),
          order_items!fk_order_items_order (
            id,
            product_id,
            quantity,
            price,
            total,
            volume,
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
        // Ошибка ожидаема из-за множественных связей, используем fallback
        return this.getOrderByIdFallback(orderId);
      }

      console.log('✅ Order with relations loaded:', orderData);

      // Преобразуем данные в нужный формат
      const result: OrderWithItems = {
        ...orderData,
        user: orderData.users || null,
        order_items: orderData.order_items?.map((item: any) => ({
          id: item.id,
          product_id: item.product_id || undefined,
          quantity: item.quantity || 1,
          price: item.price || 0,
          total: item.total || ((item.quantity || 1) * (item.price || 0)),
          product: item.products ? {
            name: item.products.name,
            price: item.products.price || item.price
          } : null
        })) || []
      };

      // Удаляем лишнее поле users из результата
      delete (result as any).users;

      console.log('=== FINAL RESULT ===');
      console.log('Order ID:', result.id);
      console.log('Order items count:', result.order_items?.length || 0);
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Error loading order:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка загрузки заказа' 
      };
    }
  }

  // Fallback метод на случай если JOIN не работает
  private async getOrderByIdFallback(orderId: string): Promise<{ success: boolean; data?: OrderWithItems; error?: string }> {
    try {
      console.log('=== Using FALLBACK method for loading order ===');

      // Загружаем заказ
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) {
        return { success: false, error: orderError.message };
      }

      console.log('✅ Order loaded:', order);

      // Загружаем пользователя
      let user: OrderWithItems['user'] = null;
      if (order.user_id) {
        const { data: userData } = await supabase
          .from('users')
          .select('first_name, last_name, email, phone')
          .eq('id', order.user_id)
          .single();
        
        if (userData) {
          user = {
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            phone: userData.phone
          };
          console.log('✅ User loaded:', user);
        }
      }

      // Загружаем товары заказа вместе с информацией о продуктах
      console.log('=== Loading order_items for order:', orderId);
      
      const { data: orderItemsData, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          products!fk_order_items_product (
            name,
            price,
            image_url
          )
        `)
        .eq('order_id', orderId);
      
      console.log('Order items loaded:', orderItemsData?.length || 0, 'items');
      if (itemsError) {
        console.error('Error loading order items:', itemsError);
      }

      // Обрабатываем товары
      const orderItems: OrderWithItems['order_items'] = [];
      if (orderItemsData && orderItemsData.length > 0) {
        for (const item of orderItemsData) {
          const processedItem = {
            id: item.id,
            product_id: item.product_id || undefined,
            quantity: item.quantity || 1,
            price: item.price || 0,
            total: item.total || ((item.quantity || 1) * (item.price || 0)),
            product: item.products ? {
              name: item.products.name,
              price: item.products.price || item.price
            } : null
          };
          
          orderItems.push(processedItem);
        }
      } else if (order.total_amount && order.total_amount > 0) {
        // Если товаров нет, но есть total_amount, создаём заглушку
        console.log('⚠️ No order_items found, creating placeholder based on total_amount');
        orderItems.push({
          id: 'placeholder-1',
          product_id: undefined,
          quantity: 1,
          price: order.total_amount - 1500,
          product: {
            name: 'Товары заказа (детализация недоступна)',
            price: order.total_amount - 1500
          }
        });
      }

      const result: OrderWithItems = {
        ...order,
        user,
        order_items: orderItems
      };

      console.log('=== FALLBACK FINAL RESULT ===');
      console.log('Order items count:', result.order_items?.length || 0);
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Fallback error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка загрузки заказа' 
      };
    }
  }

  async getOrdersStats(userRole?: 'user' | 'dealer' | 'celebrity'): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Получаем ID пользователей нужной роли
      let userIds: string[] | null = null;
      
      if (userRole) {
        const { data: users } = await supabase
          .from('users')
          .select('id')
          .eq('role', userRole);
        
        userIds = users?.map(u => u.id) || [];
        
        if (userIds.length === 0) {
          return { 
            success: true, 
            data: {
              totalOrders: 0,
              todayOrders: 0,
              newOrders: 0,
              processingOrders: 0,
              shippedOrders: 0,
              completedOrders: 0,
              totalRevenue: 0,
              todayRevenue: 0
            }
          };
        }
      }
      
      // Загружаем заказы с учетом фильтра
      let query = supabase
        .from('orders')
        .select('*')
        .not('order_status', 'is', null);
      
      if (userIds && userIds.length > 0) {
        query = query.in('user_id', userIds);
      }
      
      const { data: allOrders, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      const todayOrders = allOrders?.filter(o => {
        const orderDate = new Date(o.created_at);
        return orderDate >= today;
      }) || [];

      const stats = {
        totalOrders: allOrders?.length || 0,
        todayOrders: todayOrders.length,
        newOrders: allOrders?.filter(o => o.order_status === 'new').length || 0,
        processingOrders: allOrders?.filter(o => o.order_status === 'processing').length || 0,
        shippedOrders: allOrders?.filter(o => o.order_status === 'shipped').length || 0,
        completedOrders: allOrders?.filter(o => o.order_status === 'delivered').length || 0,
        totalRevenue: allOrders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
        todayRevenue: todayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
      };

      return { success: true, data: stats };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка' 
      };
    }
  }
}