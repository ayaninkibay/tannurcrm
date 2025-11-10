// src/lib/cart/CartService.ts

import { supabase } from '@/lib/supabase/client';
import type { Cart, CartItem, CartItemView } from '@/types';

// ==========================================
// ТИПЫ (СИНХРОНИЗИРОВАНЫ С ORDERS)
// ==========================================

export type DeliveryMethod = 'pickup' | 'delivery';

export interface ServiceResult<T = void> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface CartValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DeliveryData {
  delivery_method: DeliveryMethod;
  delivery_cost: number;
}

export interface QuantityUpdateData {
  new_quantity: number;
}

export interface DeletedItemsData {
  deleted_count: number;
}

// Стоимость доставки (пока 0 для самовывоза)
export const DELIVERY_COSTS: Record<DeliveryMethod, number> = {
  pickup: 0,
  delivery: 0 // Пока доставка недоступна
};

// ==========================================
// СЕРВИС
// ==========================================

class CartService {
  
  /**
   * Получить или создать корзину пользователя
   * Использует существующую RPC функцию get_or_create_cart
   */
  async getOrCreateCart(userId: string): Promise<string> {
    const { data, error } = await supabase
      .rpc('get_or_create_cart', { p_user_id: userId });
    
    if (error) {
      console.error('❌ Error in get_or_create_cart:', error);
      throw new Error(error.message);
    }
    
    return data;
  }

  /**
   * Загрузить корзину с товарами
   * Использует JOIN для получения актуальных данных товаров
   */
  async loadCart(cartId: string): Promise<{ cart: Cart; items: CartItemView[] }> {
    // Загружаем корзину
    const { data: cartData, error: cartError } = await supabase
      .from('carts')
      .select('*')
      .eq('id', cartId)
      .single();

    if (cartError) throw new Error(cartError.message);

    // Проверяем и устанавливаем дефолтные значения если их нет
    if (!cartData.delivery_method) {
      await this.updateDeliveryMethod(cartId, 'pickup');
      cartData.delivery_method = 'pickup';
      cartData.delivery_cost = 0;
    }

    // Загружаем товары с JOIN на products + is_gift и promotion_id
    const { data: cartItemsData, error: itemsError } = await supabase
      .from('cart_items')
      .select(`
        id,
        cart_id,
        product_id,
        quantity,
        is_gift,
        promotion_id,
        created_at,
        updated_at,
        products (
          name,
          category,
          image_url,
          price,
          price_dealer,
          stock,
          is_active
        )
      `)
      .eq('cart_id', cartId)
      .order('created_at', { ascending: false });

    if (itemsError) throw new Error(itemsError.message);

    // Преобразуем данные
    const items: CartItemView[] = (cartItemsData || [])
      .filter(item => item.products) // Фильтруем удаленные товары
      .map(item => {
        const product = Array.isArray(item.products) ? item.products[0] : item.products;
        return {
          id: item.id,
          cart_id: item.cart_id,
          product_id: item.product_id,
          quantity: item.quantity,
          is_gift: item.is_gift || false,
          promotion_id: item.promotion_id || null,
          created_at: item.created_at,
          updated_at: item.updated_at,
          name: product?.name || 'Товар',
          category: product?.category || '',
          image: product?.image_url || null,
          price: product?.price || 0,
          price_dealer: product?.price_dealer || 0,
          stock: product?.stock || 0
        };
      });

    return { cart: cartData, items };
  }

  /**
   * Добавить товар в корзину
   * Использует существующую RPC функцию add_to_cart
   */
  async addItemToCart(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<ServiceResult> {
    try {
      const { data, error } = await supabase.rpc('add_to_cart', {
        p_user_id: userId,
        p_product_id: productId,
        p_quantity: quantity
      });

      if (error) {
        console.error('❌ Error in add_to_cart:', error);
        throw error;
      }

      // Проверяем результат
      if (data && typeof data === 'object' && 'success' in data) {
        if (!data.success) {
          return {
            success: false,
            error: data.message || 'Не удалось добавить товар'
          };
        }
        return {
          success: true,
          message: data.message || 'Товар добавлен в корзину'
        };
      }

      return {
        success: true,
        message: 'Товар добавлен в корзину'
      };

    } catch (error: any) {
      console.error('❌ Error adding item to cart:', error);
      return {
        success: false,
        error: error.message || 'Ошибка добавления товара'
      };
    }
  }

  /**
   * Обновить количество товара в корзине
   * Использует RPC функцию update_cart_item_quantity (защита от race condition)
   */
  async updateItemQuantity(itemId: string, quantity: number): Promise<ServiceResult<QuantityUpdateData>> {
    try {
      const { data, error } = await supabase.rpc('update_cart_item_quantity', {
        p_item_id: itemId,
        p_quantity: quantity
      });

      if (error) {
        console.error('❌ Error in update_cart_item_quantity:', error);
        throw error;
      }

      if (!data || !data.success) {
        return {
          success: false,
          error: data?.message || 'Не удалось обновить количество'
        };
      }

      return {
        success: true,
        message: data.message || 'Количество обновлено',
        data: {
          new_quantity: data.new_quantity
        }
      };

    } catch (error: any) {
      console.error('❌ Error updating quantity:', error);
      return {
        success: false,
        error: error.message || 'Ошибка обновления количества'
      };
    }
  }

  /**
   * Удалить товар из корзины
   */
  async removeItem(itemId: string): Promise<ServiceResult> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      return {
        success: true,
        message: 'Товар удален из корзины'
      };

    } catch (error: any) {
      console.error('❌ Error removing item:', error);
      return {
        success: false,
        error: error.message || 'Ошибка удаления товара'
      };
    }
  }

  /**
   * Валидировать корзину перед оформлением
   * Использует RPC функцию validate_cart_for_checkout
   */
  async validateCartForCheckout(cartId: string): Promise<ServiceResult<CartValidation>> {
    try {
      const { data, error } = await supabase.rpc('validate_cart_for_checkout', {
        p_cart_id: cartId
      });

      if (error) {
        console.error('❌ Error in validate_cart_for_checkout:', error);
        throw error;
      }

      return {
        success: true,
        data: {
          valid: data.valid || false,
          errors: data.errors || [],
          warnings: data.warnings || []
        }
      };

    } catch (error: any) {
      console.error('❌ Error validating cart:', error);
      return {
        success: false,
        error: error.message || 'Ошибка валидации корзины'
      };
    }
  }

  /**
   * Очистить выбранные товары из корзины
   * Использует RPC функцию clear_cart_items
   */
  async clearSelectedItems(cartId: string, itemIds: string[]): Promise<ServiceResult<DeletedItemsData>> {
    try {
      if (itemIds.length === 0) {
        return {
          success: true,
          message: 'Нет товаров для удаления'
        };
      }

      const { data, error } = await supabase.rpc('clear_cart_items', {
        p_cart_id: cartId,
        p_item_ids: itemIds
      });

      if (error) {
        console.error('❌ Error in clear_cart_items:', error);
        throw error;
      }

      return {
        success: true,
        message: data?.message || 'Корзина очищена',
        data: {
          deleted_count: data?.deleted_count || 0
        }
      };

    } catch (error: any) {
      console.error('❌ Error clearing cart items:', error);
      return {
        success: false,
        error: error.message || 'Ошибка очистки корзины'
      };
    }
  }

  /**
   * Обновить способ доставки и стоимость
   * ВАЖНО: Пока только самовывоз ('pickup')
   */
  async updateDeliveryMethod(cartId: string, method: DeliveryMethod): Promise<ServiceResult<DeliveryData>> {
    try {
      // Пока принудительно устанавливаем только pickup
      const finalMethod: DeliveryMethod = 'pickup';
      const deliveryCost = DELIVERY_COSTS[finalMethod];
      
      const { error } = await supabase
        .from('carts')
        .update({ 
          delivery_method: finalMethod,
          delivery_cost: deliveryCost,
          updated_at: new Date().toISOString()
        })
        .eq('id', cartId);

      if (error) throw error;

      return {
        success: true,
        message: 'Способ доставки обновлен',
        data: {
          delivery_method: finalMethod,
          delivery_cost: deliveryCost
        }
      };

    } catch (error: any) {
      console.error('❌ Error updating delivery method:', error);
      return {
        success: false,
        error: error.message || 'Ошибка обновления способа доставки'
      };
    }
  }

  /**
   * Обновить адрес доставки
   * Для самовывоза сохраняем "Самовывоз"
   */
  async updateDeliveryAddress(cartId: string, address: string): Promise<ServiceResult> {
    try {
      const { error } = await supabase
        .from('carts')
        .update({ 
          delivery_address: address,
          updated_at: new Date().toISOString()
        })
        .eq('id', cartId);

      if (error) throw error;

      return {
        success: true,
        message: 'Адрес доставки обновлен'
      };

    } catch (error: any) {
      console.error('❌ Error updating delivery address:', error);
      return {
        success: false,
        error: error.message || 'Ошибка обновления адреса'
      };
    }
  }

  /**
   * Рассчитать стоимость доставки
   */
  calculateDeliveryCost(method: DeliveryMethod): number {
    return DELIVERY_COSTS[method];
  }
}

// Экспортируем singleton экземпляр
export const cartService = new CartService();