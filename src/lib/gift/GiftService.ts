import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';

type Gift = Database['public']['Tables']['gifts']['Row'];
type GiftInsert = Database['public']['Tables']['gifts']['Insert'];
type GiftItem = Database['public']['Tables']['gift_items']['Row'];
type GiftItemInsert = Database['public']['Tables']['gift_items']['Insert'];

export interface GiftWithItems extends Gift {
  gift_items: (GiftItem & {
    product: {
      id: string;
      name: string | null;
      image_url: string | null;
    } | null;
  })[];
}

export interface CreateGiftData {
  recipient_name: string;
  recipient_info?: string;
  reason: string;
  responsible: string;
  comment?: string;
  items: {
    product_id: string;
    quantity: number;
    price: number;
  }[];
}

class GiftService {
  /**
   * Создание нового подарка
   */
  async createGift(data: CreateGiftData): Promise<Gift> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Пользователь не авторизован');
    }

    const totalAmount = data.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );

    const giftInsertData = {
      recipient_name: data.recipient_name,
      recipient_info: data.recipient_info,
      reason: data.reason,
      responsible: data.responsible,
      comment: data.comment,
      total_amount: totalAmount,
      created_by: user.id,
      status: 'pending'
    };

    const { data: gift, error: giftError } = await supabase
      .from('gifts')
      .insert(giftInsertData)
      .select()
      .single();

    if (giftError) {
      throw new Error(giftError.message);
    }

    if (!gift) {
      throw new Error('Подарок не был создан');
    }

    const giftItems: GiftItemInsert[] = data.items.map(item => ({
      gift_id: gift.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('gift_items')
      .insert(giftItems);

    if (itemsError) {
      // Откатываем создание подарка
      await supabase.from('gifts').delete().eq('id', gift.id);
      throw new Error(itemsError.message);
    }

    // Списываем товары со склада
    for (const item of data.items) {
      const { error: stockError } = await supabase.rpc('update_product_stock', {
        p_product_id: item.product_id,
        p_change: -item.quantity,
        p_reason: `Подарок: ${data.recipient_name}`,
        p_source: 'gift'
      });

      if (stockError) {
        console.error('Stock deduction error:', stockError);
      }
    }

    return gift;
  }

  /**
   * Получение списка подарков
   */
  async getGifts(options?: {
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<{ gifts: GiftWithItems[]; total: number }> {
    let query = supabase
      .from('gifts')
      .select(`
        *,
        gift_items (
          *,
          product:products (
            id,
            name,
            image_url
          )
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1);
    }

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    return {
      gifts: data || [],
      total: count || 0
    };
  }

  /**
   * Получение детальной информации о подарке
   */
  async getGiftById(id: string): Promise<GiftWithItems | null> {
    const { data, error } = await supabase
      .from('gifts')
      .select(`
        *,
        gift_items (
          *,
          product:products (
            id,
            name,
            image_url,
            price,
            price_dealer
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Обновление статуса подарка
   */
  async updateGiftStatus(id: string, status: 'pending' | 'issued' | 'cancelled'): Promise<void> {
    const updateData: any = { status };
    
    if (status === 'issued') {
      updateData.issued_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('gifts')
      .update(updateData)
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  /**
   * Получение статистики подарков
   */
  async getGiftStats(): Promise<{
    totalGifts: number;
    totalAmount: number;
    pendingGifts: number;
    issuedGifts: number;
  }> {
    const { data, error } = await supabase
      .from('gifts')
      .select('status, total_amount');

    if (error) throw new Error(error.message);

    return {
      totalGifts: data.length,
      totalAmount: data.reduce((sum, gift) => sum + (gift.total_amount || 0), 0),
      pendingGifts: data.filter(g => g.status === 'pending').length,
      issuedGifts: data.filter(g => g.status === 'issued').length,
    };
  }
}

export const giftService = new GiftService();