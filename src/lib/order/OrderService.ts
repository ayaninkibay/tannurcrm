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
        user_id: [userId],
        total_amount: total,
        order_number: `ORD-${Date.now()}`,
        payment_status: 'pending',
        order_status: 'new',
        delivery_address: deliveryAddress,
        notes: notes
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
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

    if (error) throw new Error(error.message);
  }

  /**
   * Запустить расчет бонусов
   */
  async calculateBonuses(orderId: string): Promise<void> {
    try {
      await supabase.rpc('calculate_order_bonuses', { p_order_id: orderId });
    } catch (error) {
      console.error('Bonus calculation error:', error);
    }
  }
}

export const orderService = new OrderService();