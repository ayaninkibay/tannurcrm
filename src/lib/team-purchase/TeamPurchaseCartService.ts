import { supabase } from '@/lib/supabase/client';
import type { TeamPurchaseCart, Product } from '@/types';

class TeamPurchaseCartService {
  /**
   * Добавить товар в корзину участника
   */
  async addToCart(
    purchaseId: string,
    userId: string,
    productId: string,
    quantity: number
  ): Promise<void> {
    // Получаем member_id
    const { data: member } = await supabase
      .from('team_purchase_members')
      .select('id')
      .eq('team_purchase_id', purchaseId)
      .eq('user_id', userId)
      .single();

    if (!member) throw new Error('Вы не участник этой закупки');

    // Получаем цену товара
    const { data: product } = await supabase
      .from('products')
      .select('price_dealer')
      .eq('id', productId)
      .single();

    if (!product) throw new Error('Товар не найден');

    // Добавляем или обновляем
    const { error } = await supabase
      .from('team_purchase_carts')
      .upsert({
        team_purchase_id: purchaseId,
        member_id: member.id,
        user_id: userId,
        product_id: productId,
        quantity: quantity,
        price: product.price_dealer,
        status: 'active'
      }, {
        onConflict: 'team_purchase_id,user_id,product_id'
      });

    if (error) throw new Error(error.message);

    // Обновляем cart_total у участника
    await this.updateMemberCartTotal(purchaseId, userId);
  }

  /**
   * Удалить товар из корзины
   */
  async removeFromCart(
    purchaseId: string,
    userId: string,
    productId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('team_purchase_carts')
      .update({ status: 'removed' })
      .eq('team_purchase_id', purchaseId)
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw new Error(error.message);

    await this.updateMemberCartTotal(purchaseId, userId);
  }

  /**
   * Обновить количество
   */
  async updateQuantity(
    cartId: string,
    quantity: number
  ): Promise<void> {
    const { data: cart } = await supabase
      .from('team_purchase_carts')
      .select('team_purchase_id, user_id')
      .eq('id', cartId)
      .single();

    const { error } = await supabase
      .from('team_purchase_carts')
      .update({ quantity })
      .eq('id', cartId);

    if (error) throw new Error(error.message);

    if (cart) {
      await this.updateMemberCartTotal(cart.team_purchase_id, cart.user_id);
    }
  }

  /**
   * Получить корзину участника
   */
  async getMemberCart(
    purchaseId: string,
    userId: string
  ): Promise<TeamPurchaseCart[]> {
    const { data, error } = await supabase
      .from('team_purchase_carts')
      .select(`
        *,
        product:products(*)
      `)
      .eq('team_purchase_id', purchaseId)
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) throw new Error(error.message);
    return data || [];
  }

  /**
   * Очистить корзину
   */
  async clearCart(
    purchaseId: string,
    userId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('team_purchase_carts')
      .update({ status: 'removed' })
      .eq('team_purchase_id', purchaseId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);

    await this.updateMemberCartTotal(purchaseId, userId);
  }

  /**
   * Конвертировать корзину в заказ
   */
  async convertToOrder(
    purchaseId: string,
    userId: string
  ): Promise<string> {
    // Получаем товары из корзины
    const cartItems = await this.getMemberCart(purchaseId, userId);
    
    if (cartItems.length === 0) {
      throw new Error('Корзина пуста');
    }

    // Считаем общую сумму
    const totalAmount = cartItems.reduce((sum, item) => sum + item.total, 0);

    // Создаем заказ
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: [userId], // Массив для совместимости
        total_amount: totalAmount,
        order_number: `TEAM-${Date.now()}`,
        payment_status: 'pending',
        order_status: 'new',
        notes: `Командная закупка #${purchaseId}`
      })
      .select()
      .single();

    if (orderError) throw new Error(orderError.message);

    // Создаем позиции заказа
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      total: item.total
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw new Error(itemsError.message);

    // Помечаем товары как заказанные
    await supabase
      .from('team_purchase_carts')
      .update({ status: 'ordered' })
      .eq('team_purchase_id', purchaseId)
      .eq('user_id', userId)
      .eq('status', 'active');

    return order.id;
  }

  /**
   * Обновить cart_total участника
   */
  private async updateMemberCartTotal(
    purchaseId: string,
    userId: string
  ): Promise<void> {
    const { data: cartItems } = await supabase
      .from('team_purchase_carts')
      .select('total')
      .eq('team_purchase_id', purchaseId)
      .eq('user_id', userId)
      .eq('status', 'active');

    const total = cartItems?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;

    await supabase
      .from('team_purchase_members')
      .update({ cart_total: total })
      .eq('team_purchase_id', purchaseId)
      .eq('user_id', userId);
  }

  /**
   * Проверить лимиты корзины
   */
  async checkCartLimits(
    purchaseId: string,
    userId: string
  ): Promise<{ 
    isValid: boolean; 
    message?: string;
    currentTotal: number;
    targetAmount: number;
  }> {
    // Получаем данные участника
    const { data: member } = await supabase
      .from('team_purchase_members')
      .select('contribution_target, cart_total')
      .eq('team_purchase_id', purchaseId)
      .eq('user_id', userId)
      .single();

    if (!member) {
      return {
        isValid: false,
        message: 'Участник не найден',
        currentTotal: 0,
        targetAmount: 0
      };
    }

    const isValid = member.cart_total <= member.contribution_target;
    
    return {
      isValid,
      message: isValid ? undefined : 'Превышен лимит вклада',
      currentTotal: member.cart_total,
      targetAmount: member.contribution_target
    };
  }
}

export const teamPurchaseCartService = new TeamPurchaseCartService();