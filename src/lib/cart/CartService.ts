// src/lib/cart/CartService.ts

import { supabase } from '@/lib/supabase/client';
import type { Cart, CartItem, CartItemView } from '@/types';

class CartService {
  /**
   * Получить или создать корзину пользователя
   */
  async getOrCreateCart(userId: string): Promise<string> {
    const { data, error } = await supabase
      .rpc('get_or_create_cart', { p_user_id: userId });
    
    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Загрузить корзину с товарами
   */
  async loadCart(cartId: string): Promise<{ cart: Cart; items: CartItemView[] }> {
    const { data, error } = await supabase
      .from('carts')
      .select(`
        *,
        cart_items (
          *,
          product:products (*)
        )
      `)
      .eq('id', cartId)
      .single();

    if (error) throw new Error(error.message);

    // Преобразуем cart_items в CartItemView
    const items: CartItemView[] = data.cart_items?.map((item: any) => ({
      id: item.id,
      cart_id: item.cart_id,
      product_id: item.product_id,
      product: item.product,
      quantity: item.quantity,
      created_at: item.created_at,
      updated_at: item.updated_at,
      // Поля для отображения
      name: item.product?.name || 'Без названия',
      image: item.product?.image_url || '',
      price: item.product?.price || 0,
      price_dealer: item.product?.price_dealer || 0,
      stock: item.product?.stock || 100,
      category: item.product?.category || 'Без категории'
    })) || [];

    return { cart: data, items };
  }

  /**
   * Добавить новый товар в корзину
   */
  async addNewItem(cartId: string, productId: string, quantity: number): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .insert({
        cart_id: cartId,
        product_id: productId,
        quantity: quantity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error adding item to cart:', error);
      throw new Error(error.message);
    }
  }

  /**
   * Обновить метод доставки
   */
  async updateDeliveryMethod(cartId: string, method: 'pickup' | 'delivery'): Promise<void> {
    const { error } = await supabase
      .from('carts')
      .update({ 
        delivery_method: method,
        updated_at: new Date().toISOString()
      })
      .eq('id', cartId);

    if (error) throw new Error(error.message);
  }

  /**
   * Обновить количество товара
   */
  async updateItemQuantity(itemId: string, quantity: number): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .update({ 
        quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId);

    if (error) throw new Error(error.message);
  }

  /**
   * Удалить товар из корзины
   */
  async removeItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) throw new Error(error.message);
  }

  /**
   * Очистить выбранные товары
   */
  async clearSelectedItems(itemIds: string[]): Promise<void> {
    if (itemIds.length === 0) return;
    
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .in('id', itemIds);

    if (error) throw new Error(error.message);
  }

  /**
   * Обновить статус корзины после заказа
   */
  async markAsOrdered(cartId: string): Promise<void> {
    const { error } = await supabase
      .from('carts')
      .update({ 
        status: 'ordered',
        promo_code: null,
        promo_discount: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', cartId);

    if (error) throw new Error(error.message);
  }

  /**
   * Сохранить промокод в корзине
   */
  async savePromoCode(cartId: string, code: string | null, discount: number | null): Promise<void> {
    const { error } = await supabase
      .from('carts')
      .update({ 
        promo_code: code,
        promo_discount: discount,
        updated_at: new Date().toISOString()
      })
      .eq('id', cartId);

    if (error) throw new Error(error.message);
  }
}

// ВАЖНО: Экспортируем инстанс сервиса
export const cartService = new CartService();