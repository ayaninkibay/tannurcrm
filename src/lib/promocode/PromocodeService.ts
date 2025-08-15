import { supabase } from '@/lib/supabase/client';
import type { PromoCode } from '@/types';

class PromocodeService {
  /**
   * Получить промокод по коду
   */
  async getPromoCode(code: string): Promise<PromoCode | null> {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Валидировать промокод через RPC
   */
  async validatePromoCode(code: string, userId: string, orderAmount: number): Promise<any> {
    const { data, error } = await supabase
      .rpc('validate_and_apply_promo_code', {
        p_code: code,
        p_user_id: userId,
        p_order_amount: orderAmount
      });

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Увеличить счетчик использований
   */
  async incrementUsage(promoCodeId: string): Promise<void> {
    const { data: promo } = await supabase
      .from('promo_codes')
      .select('current_uses')
      .eq('id', promoCodeId)
      .single();

    if (promo) {
      await supabase
        .from('promo_codes')
        .update({ 
          current_uses: (promo.current_uses || 0) + 1 
        })
        .eq('id', promoCodeId);
    }
  }

  /**
   * Записать использование промокода
   */
  async recordUsage(
    promoCodeId: string, 
    userId: string, 
    orderId: string, 
    discountAmount: number, 
    orderAmount: number
  ): Promise<void> {
    const { error } = await supabase
      .rpc('record_promo_code_use', {
        p_promo_code_id: promoCodeId,
        p_user_id: userId,
        p_order_id: orderId,
        p_discount_amount: discountAmount,
        p_order_amount: orderAmount
      });

    if (error) throw new Error(error.message);
  }
}

export const promocodeService = new PromocodeService();