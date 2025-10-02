// src/lib/cart/CartService.ts

import { supabase } from '@/lib/supabase/client';
import type { Cart, CartItem, CartItemView } from '@/types';

class CartService {
  /**
   * Получить или создать корзину пользователя через функцию БД
   */
  async getOrCreateCart(userId: string): Promise<string> {
    const { data, error } = await supabase
      .rpc('get_or_create_cart', { p_user_id: userId });
    
    if (error) {
      console.error('Error in get_or_create_cart:', error);
      throw new Error(error.message);
    }
    return data;
  }

  /**
   * Загрузить корзину с товарами через join
   */
  async loadCart(cartId: string): Promise<{ cart: Cart; items: CartItemView[] }> {
    // Загружаем корзину
    const { data: cartData, error: cartError } = await supabase
      .from('carts')
      .select('*')
      .eq('id', cartId)
      .single();

    if (cartError) throw new Error(cartError.message);

    // Загружаем товары корзины с join на products для получения актуальных данных
    const { data: cartItemsData, error: itemsError } = await supabase
      .from('cart_items')
      .select(`
        id,
        cart_id,
        product_id,
        quantity,
        created_at,
        updated_at,
        products (
          name,
          category,
          image_url,
          price,
          price_dealer,
          stock
        )
      `)
      .eq('cart_id', cartId)
      .order('created_at', { ascending: false });

    if (itemsError) throw new Error(itemsError.message);

    // Преобразуем данные в нужный формат CartItemView
    const items: CartItemView[] = (cartItemsData || []).map(item => ({
      id: item.id,
      cart_id: item.cart_id,
      product_id: item.product_id,
      quantity: item.quantity,
      created_at: item.created_at,
      updated_at: item.updated_at,
      // Данные из products
      name: item.products?.name || 'Товар',
      category: item.products?.category || '',
      image: item.products?.image_url || null,
      price: item.products?.price || 0,
      price_dealer: item.products?.price_dealer || 0,
      stock: item.products?.stock || 0
    }));

    return { 
      cart: cartData, 
      items
    };
  }

  /**
   * Добавить товар в корзину через функцию БД
   * Использует add_to_cart которая проверяет остатки и обновляет количество если товар уже есть
   */
  async addItemToCart(userId: string, productId: string, quantity: number): Promise<any> {
    const { data, error } = await supabase
      .rpc('add_to_cart', {
        p_user_id: userId,
        p_product_id: productId,
        p_quantity: quantity
      });

    if (error) {
      console.error('Error in add_to_cart:', error);
      throw new Error(error.message);
    }

    // Проверяем результат
    if (data && typeof data === 'object' && 'success' in data) {
      if (!data.success) {
        throw new Error(data.message || 'Failed to add item to cart');
      }
    }

    return data;
  }

  /**
   * Добавить новый товар в корзину (старый метод для совместимости)
   * НЕ РЕКОМЕНДУЕТСЯ - используйте addItemToCart
   */
  async addNewItem(cartId: string, productId: string, quantity: number): Promise<void> {
    // Сначала проверяем остатки
    const { data: product, error: stockError } = await supabase
      .from('products')
      .select('stock')
      .eq('id', productId)
      .single();

    if (stockError) throw new Error(stockError.message);
    
    if (!product || product.stock < quantity) {
      throw new Error('Недостаточно товара на складе');
    }

    // Проверяем, есть ли уже этот товар в корзине
    const { data: existingItem, error: checkError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(checkError.message);
    }

    if (existingItem) {
      // Если товар уже есть, обновляем количество
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        throw new Error('Недостаточно товара на складе');
      }

      const { error: updateError } = await supabase
        .from('cart_items')
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id);

      if (updateError) throw new Error(updateError.message);
    } else {
      // Добавляем новый товар
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

    // Обновляем время изменения корзины
    await supabase
      .from('carts')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', cartId);
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
    // Сначала получаем информацию о товаре
    const { data: item, error: itemError } = await supabase
      .from('cart_items')
      .select('product_id')
      .eq('id', itemId)
      .single();

    if (itemError) throw new Error(itemError.message);

    // Проверяем остатки
    const { data: product, error: stockError } = await supabase
      .from('products')
      .select('stock')
      .eq('id', item.product_id)
      .single();

    if (stockError) throw new Error(stockError.message);
    
    if (!product || product.stock < quantity) {
      throw new Error('Недостаточно товара на складе');
    }

    // Обновляем количество
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
        status: 'completed',
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