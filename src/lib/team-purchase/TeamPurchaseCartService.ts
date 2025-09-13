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
      .select('price_dealer, stock')
      .eq('id', productId)
      .single();

    if (!product) throw new Error('Товар не найден');
    
    // Проверяем наличие на складе
    if (product.stock !== null && product.stock < quantity) {
      throw new Error(`Недостаточно товара на складе. Доступно: ${product.stock}`);
    }

    // Добавляем или обновляем БЕЗ поля total (оно вычисляется автоматически)
    const { error } = await supabase
      .from('team_purchase_carts')
      .upsert({
        team_purchase_id: purchaseId,
        member_id: member.id,
        user_id: userId,
        product_id: productId,
        quantity: quantity,
        price: product.price_dealer,
        // НЕ включаем total - оно GENERATED
        status: 'active',
        updated_at: new Date().toISOString()
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
      .update({ 
        status: 'removed',
        updated_at: new Date().toISOString()
      })
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
    // Получаем данные о товаре в корзине
    const { data: cartItem } = await supabase
      .from('team_purchase_carts')
      .select('team_purchase_id, user_id, product_id, price')
      .eq('id', cartId)
      .single();

    if (!cartItem) throw new Error('Позиция не найдена');

    // Проверяем наличие на складе
    const { data: product } = await supabase
      .from('products')
      .select('stock')
      .eq('id', cartItem.product_id)
      .single();

    if (product?.stock !== null && product?.stock < quantity) {
      throw new Error(`Недостаточно товара. Доступно: ${product.stock}`);
    }

    // Обновляем количество (total пересчитается автоматически)
    const { error } = await supabase
      .from('team_purchase_carts')
      .update({ 
        quantity,
        // НЕ включаем total - оно GENERATED
        updated_at: new Date().toISOString()
      })
      .eq('id', cartId);

    if (error) throw new Error(error.message);

    if (cartItem) {
      await this.updateMemberCartTotal(cartItem.team_purchase_id, cartItem.user_id);
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
      .eq('status', 'active')
      .order('created_at', { ascending: false });

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
      .update({ 
        status: 'removed',
        updated_at: new Date().toISOString()
      })
      .eq('team_purchase_id', purchaseId)
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) throw new Error(error.message);

    await this.updateMemberCartTotal(purchaseId, userId);
  }

  /**
   * Конвертировать корзину в заказ
   */
  async convertToOrder(
    purchaseId: string,
    userId: string,
    deliveryAddress?: string
  ): Promise<string> {
    // Получаем товары из корзины
    const cartItems = await this.getMemberCart(purchaseId, userId);
    
    if (cartItems.length === 0) {
      throw new Error('Корзина пуста');
    }

    // Считаем общую сумму
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.total || 0), 0);

    // Проверяем минимальную сумму
    if (totalAmount < 300000) {
      throw new Error(`Минимальная сумма заказа 300,000 ₸. Добавьте товаров на ${(300000 - totalAmount).toLocaleString('ru-RU')} ₸`);
    }

    // Создаем заказ (НЕ массив для user_id!)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId, // Строка, НЕ массив!
        total_amount: totalAmount,
        order_number: `TEAM-${Date.now()}`,
        payment_status: 'pending',
        order_status: 'new',
        delivery_address: deliveryAddress,
        notes: `Командная закупка #${purchaseId.slice(0, 8)}`,
        created_at: new Date().toISOString()
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
      total: item.total,
      user_id: userId,
      created_at: new Date().toISOString()
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      // Откатываем создание заказа при ошибке
      await supabase.from('orders').delete().eq('id', order.id);
      throw new Error(itemsError.message);
    }

    // Помечаем товары как заказанные
    const { error: updateError } = await supabase
      .from('team_purchase_carts')
      .update({ 
        status: 'ordered',
        updated_at: new Date().toISOString()
      })
      .eq('team_purchase_id', purchaseId)
      .eq('user_id', userId)
      .eq('status', 'active');

    if (updateError) {
      console.error('Error updating cart status:', updateError);
    }

    // Обновляем cart_total на 0 после оформления заказа
    await this.updateMemberCartTotal(purchaseId, userId);

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

    const { error } = await supabase
      .from('team_purchase_members')
      .update({ 
        cart_total: total,
        updated_at: new Date().toISOString()
      })
      .eq('team_purchase_id', purchaseId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating member cart total:', error);
    }
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
    minRequired: number;
  }> {
    // Получаем данные участника
    const { data: member } = await supabase
      .from('team_purchase_members')
      .select('cart_total')
      .eq('team_purchase_id', purchaseId)
      .eq('user_id', userId)
      .single();

    if (!member) {
      return {
        isValid: false,
        message: 'Участник не найден',
        currentTotal: 0,
        minRequired: 300000
      };
    }

    const minRequired = 300000; // Минимальная сумма заказа
    const currentTotal = member.cart_total || 0;
    
    if (currentTotal < minRequired) {
      return {
        isValid: false,
        message: `Минимальная сумма заказа ${minRequired.toLocaleString('ru-RU')} ₸`,
        currentTotal,
        minRequired
      };
    }
    
    return {
      isValid: true,
      message: 'Можно оформить заказ',
      currentTotal,
      minRequired
    };
  }

  /**
   * Получить общую статистику корзин закупки
   */
  async getPurchaseCartStats(purchaseId: string): Promise<{
    totalItems: number;
    totalAmount: number;
    uniqueProducts: number;
    participantsWithCarts: number;
  }> {
    const { data: carts } = await supabase
      .from('team_purchase_carts')
      .select('user_id, product_id, quantity, total')
      .eq('team_purchase_id', purchaseId)
      .eq('status', 'active');

    if (!carts || carts.length === 0) {
      return {
        totalItems: 0,
        totalAmount: 0,
        uniqueProducts: 0,
        participantsWithCarts: 0
      };
    }

    const totalItems = carts.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalAmount = carts.reduce((sum, item) => sum + (item.total || 0), 0);
    const uniqueProducts = new Set(carts.map(c => c.product_id)).size;
    const participantsWithCarts = new Set(carts.map(c => c.user_id)).size;

    return {
      totalItems,
      totalAmount,
      uniqueProducts,
      participantsWithCarts
    };
  }
}

export const teamPurchaseCartService = new TeamPurchaseCartService();