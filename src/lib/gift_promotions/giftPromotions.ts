// src/lib/gift_promotions/giftPromotions.ts

import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';

type GiftPromotion = Database['public']['Tables']['gift_promotions']['Row'];
type GiftPromotionInsert = Database['public']['Tables']['gift_promotions']['Insert'];
type GiftPromotionUpdate = Database['public']['Tables']['gift_promotions']['Update'];
type GiftPromotionProduct = Database['public']['Tables']['gift_promotion_products']['Row'];

export interface GiftPromotionWithProducts extends GiftPromotion {
  gift_promotion_products: (GiftPromotionProduct & {
    products: {
      id: string;
      name: string;
      image_url: string;
      price_dealer: number;
    };
  })[];
}

/**
 * Получить все акции (для админа)
 */
export async function getAllPromotions(): Promise<GiftPromotionWithProducts[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('gift_promotions')
    .select(`
      *,
      gift_promotion_products (
        *,
        products (
          id,
          name,
          image_url,
          price_dealer
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as GiftPromotionWithProducts[];
}

/**
 * Получить только активные акции (для дилеров)
 */
export async function getActivePromotions(): Promise<GiftPromotionWithProducts[]> {
  const supabase = createClient();
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('gift_promotions')
    .select(`
      *,
      gift_promotion_products (
        *,
        products (
          id,
          name,
          image_url,
          price_dealer
        )
      )
    `)
    .eq('is_active', true)
    .lte('start_date', now)
    .gte('end_date', now)
    .order('priority', { ascending: false });

  if (error) throw error;
  return data as GiftPromotionWithProducts[];
}

/**
 * Получить акцию по ID
 */
export async function getPromotionById(id: string): Promise<GiftPromotionWithProducts | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('gift_promotions')
    .select(`
      *,
      gift_promotion_products (
        *,
        products (
          id,
          name,
          image_url,
          price_dealer
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data as GiftPromotionWithProducts;
}

/**
 * Создать новую акцию
 */
export async function createPromotion(
  promotion: Omit<GiftPromotionInsert, 'id' | 'created_at' | 'updated_at'>
): Promise<GiftPromotion> {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('gift_promotions')
    .insert({
      ...promotion,
      created_by: userData.user?.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Обновить акцию
 */
export async function updatePromotion(
  id: string,
  updates: GiftPromotionUpdate
): Promise<GiftPromotion> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('gift_promotions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Удалить акцию
 */
export async function deletePromotion(id: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('gift_promotions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Добавить товары-подарки к акции
 */
export async function addGiftProducts(
  promotionId: string,
  products: { product_id: string; quantity: number }[]
): Promise<void> {
  const supabase = createClient();
  
  // Сначала удаляем все существующие товары
  await supabase
    .from('gift_promotion_products')
    .delete()
    .eq('promotion_id', promotionId);

  // Добавляем новые товары
  const { error } = await supabase
    .from('gift_promotion_products')
    .insert(
      products.map(p => ({
        promotion_id: promotionId,
        product_id: p.product_id,
        quantity: p.quantity,
      }))
    );

  if (error) throw error;
}

/**
 * Удалить товар-подарок из акции
 */
export async function removeGiftProduct(
  promotionId: string,
  productId: string
): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('gift_promotion_products')
    .delete()
    .eq('promotion_id', promotionId)
    .eq('product_id', productId);

  if (error) throw error;
}

/**
 * Проверить какие акции применимы к текущей корзине
 */
export async function checkApplicablePromotions(
  cartTotal: number
): Promise<GiftPromotionWithProducts[]> {
  const activePromotions = await getActivePromotions();
  
  return activePromotions.filter(
    promo => promo.min_purchase_amount <= cartTotal
  );
}

/**
 * Вручную применить акции к корзине (если нужно перепроверить)
 */
export async function applyPromotionsToCart(cartId: string): Promise<{
  success: boolean;
  cart_total: number;
  gifts_added: number;
}> {
  const supabase = createClient();
  
  const { data, error } = await supabase.rpc('apply_gift_promotions', {
    p_cart_id: cartId,
  });

  if (error) throw error;
  return data;
}

/**
 * Переключить статус активности акции
 */
export async function togglePromotionStatus(
  id: string,
  isActive: boolean
): Promise<GiftPromotion> {
  return updatePromotion(id, { is_active: isActive });
}