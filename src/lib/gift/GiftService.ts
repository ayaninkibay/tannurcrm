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
    console.log('=== НАЧАЛО СОЗДАНИЯ ПОДАРКА ===');
    console.log('Creating gift with data:', data);
    
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user);
    
    if (!user) {
      console.error('User not authenticated');
      throw new Error('Пользователь не авторизован');
    }

    // Проверяем роль пользователя
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('role, email')
      .eq('id', user.id)
      .single();
    
    console.log('User profile:', userProfile, 'Error:', userError);

    const totalAmount = data.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    console.log('Total amount calculated:', totalAmount);

    // Проверяем доступ к таблице gifts
    console.log('Testing access to gifts table...');
    const { data: testAccess, error: accessError } = await supabase
      .from('gifts')
      .select('id')
      .limit(1);
    
    console.log('Access test result:', { testAccess, accessError });

    // Создаем основную запись подарка
    console.log('Creating gift record...');
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
    
    console.log('Gift insert data:', giftInsertData);

    const { data: gift, error: giftError } = await supabase
      .from('gifts')
      .insert(giftInsertData)
      .select()
      .single();

    console.log('Gift creation result:', { gift, giftError });

    if (giftError) {
      console.error('Gift creation error details:', {
        message: giftError.message,
        details: giftError.details,
        hint: giftError.hint,
        code: giftError.code
      });
      throw new Error(giftError.message);
    }

    if (!gift) {
      console.error('Gift was not returned after creation');
      throw new Error('Подарок не был создан');
    }

    console.log('Gift created successfully:', gift);

    // Создаем позиции подарка
    console.log('Creating gift items...');
    const giftItems: GiftItemInsert[] = data.items.map(item => ({
      gift_id: gift.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity
    }));

    console.log('Gift items to insert:', giftItems);

    // Проверяем доступ к таблице gift_items
    console.log('Testing access to gift_items table...');
    const { data: testItemsAccess, error: itemsAccessError } = await supabase
      .from('gift_items')
      .select('id')
      .limit(1);
    
    console.log('Gift items access test:', { testItemsAccess, itemsAccessError });

    const { data: insertedItems, error: itemsError } = await supabase
      .from('gift_items')
      .insert(giftItems)
      .select();

    console.log('Gift items creation result:', { insertedItems, itemsError });

    if (itemsError) {
      console.error('Gift items creation error details:', {
        message: itemsError.message,
        details: itemsError.details,
        hint: itemsError.hint,
        code: itemsError.code
      });
      
      // Откатываем создание подарка
      console.log('Rolling back gift creation...');
      const { error: deleteError } = await supabase.from('gifts').delete().eq('id', gift.id);
      if (deleteError) {
        console.error('Error rolling back gift creation:', deleteError);
      }
      
      throw new Error(itemsError.message);
    }

    console.log('Gift items created successfully:', insertedItems);

    // ВРЕМЕННО ОТКЛЮЧЕНО: Списываем товары со склада
    console.log('Stock deduction temporarily disabled for debugging');
    /*
    console.log('Starting stock deduction...');
    for (const item of data.items) {
      console.log(`Deducting stock for product ${item.product_id}, quantity: ${item.quantity}`);
      
      const { data: stockResult, error: stockError } = await supabase.rpc('update_product_stock', {
        p_product_id: item.product_id,
        p_change: -item.quantity,
        p_reason: `Подарок: ${data.recipient_name}`,
        p_source: 'gift'
      });

      console.log('Stock update result:', { stockResult, stockError });

      if (stockError) {
        console.error('Stock deduction error:', stockError);
        // Продолжаем выполнение, но логируем ошибку
      }
    }
    */

    console.log('=== ПОДАРОК УСПЕШНО СОЗДАН ===');
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
    console.log('Loading gifts with options:', options);

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

    console.log('Gifts loaded:', { data, error, count });

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
    console.log('Loading gift by id:', id);

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

    console.log('Gift by id result:', { data, error });

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
    console.log('Updating gift status:', { id, status });

    const updateData: any = { status };
    
    if (status === 'issued') {
      updateData.issued_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('gifts')
      .update(updateData)
      .eq('id', id);

    console.log('Status update result:', { error });

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
    console.log('Loading gift stats...');

    const { data, error } = await supabase
      .from('gifts')
      .select('status, total_amount');

    console.log('Stats data:', { data, error });

    if (error) throw new Error(error.message);

    const stats = {
      totalGifts: data.length,
      totalAmount: data.reduce((sum, gift) => sum + (gift.total_amount || 0), 0),
      pendingGifts: data.filter(g => g.status === 'pending').length,
      issuedGifts: data.filter(g => g.status === 'issued').length,
    };

    console.log('Calculated stats:', stats);

    return stats;
  }
}

export const giftService = new GiftService();