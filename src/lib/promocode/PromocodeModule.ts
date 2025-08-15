'use client';

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { promocodeService } from './PromocodeService';
import { cartService } from '@/lib/cart/CartService';
import type { PromoCode } from '@/types';

export interface UsePromocodeModuleReturn {
  // State
  promoCode: string;
  appliedPromoCode: PromoCode | null;
  promoDiscount: number;
  loading: boolean;
  
  // Actions
  setPromoCode: (code: string) => void;
  applyPromoCode: (orderAmount: number, userId: string, cartId: string) => Promise<boolean>;
  removePromoCode: (cartId: string) => Promise<void>;
  validatePromoCode: (code: string, orderAmount: number) => Promise<boolean>;
}

export const usePromocodeModule = (): UsePromocodeModuleReturn => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState<PromoCode | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  const validatePromoCode = useCallback(async (code: string, orderAmount: number): Promise<boolean> => {
    if (!code.trim()) {
      toast.error('Введите промокод');
      return false;
    }

    setLoading(true);
    try {
      const promo = await promocodeService.getPromoCode(code);
      
      if (!promo) {
        toast.error('Промокод не найден');
        return false;
      }

      // Проверки валидности
      if (promo.valid_until && new Date(promo.valid_until) < new Date()) {
        toast.error('Промокод истек');
        return false;
      }

      if (promo.min_order_amount && orderAmount < promo.min_order_amount) {
        toast.error(`Минимальная сумма заказа: ${promo.min_order_amount.toLocaleString('ru-RU')} ₸`);
        return false;
      }

      if (promo.max_uses && promo.current_uses >= promo.max_uses) {
        toast.error('Промокод больше не действителен');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating promo:', error);
      toast.error('Ошибка проверки промокода');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const applyPromoCode = useCallback(async (
    orderAmount: number, 
    userId: string, 
    cartId: string
  ): Promise<boolean> => {
    if (!await validatePromoCode(promoCode, orderAmount)) {
      return false;
    }

    setLoading(true);
    try {
      const promo = await promocodeService.getPromoCode(promoCode);
      if (!promo) return false;

      setAppliedPromoCode(promo);
      setPromoDiscount(promo.discount_percent);
      
      // Сохраняем в корзине
      await cartService.savePromoCode(cartId, promo.code, promo.discount_percent);
      
      toast.success(`Промокод применен! Скидка ${promo.discount_percent}%`);
      return true;
    } catch (error) {
      console.error('Error applying promo:', error);
      toast.error('Ошибка применения промокода');
      return false;
    } finally {
      setLoading(false);
    }
  }, [promoCode, validatePromoCode]);

  const removePromoCode = useCallback(async (cartId: string) => {
    setPromoCode('');
    setPromoDiscount(0);
    setAppliedPromoCode(null);
    
    try {
      await cartService.savePromoCode(cartId, null, null);
      toast.success('Промокод удален');
    } catch (error) {
      console.error('Error removing promo:', error);
    }
  }, []);

  return {
    promoCode,
    appliedPromoCode,
    promoDiscount,
    loading,
    
    setPromoCode,
    applyPromoCode,
    removePromoCode,
    validatePromoCode
  };
};