'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { teamPurchaseService } from './TeamPurchaseService';
import { teamPurchaseLifecycleService } from './TeamPurchaseLifecycleService';
import { teamPurchaseCartService } from './TeamPurchaseCartService';
import type { 
  TeamPurchase, 
  TeamPurchaseView,
  TeamPurchaseCart,
  Product,
  User 
} from '@/types';

export interface UseTeamPurchaseModuleReturn {
  // State
  purchases: TeamPurchase[];
  currentPurchase: TeamPurchaseView | null;
  memberCart: TeamPurchaseCart[];
  loading: boolean;
  
  // Actions - Lifecycle
  createPurchase: (data: any) => Promise<void>;
  joinPurchase: (inviteCode: string, contribution: number) => Promise<void>;
  leavePurchase: (purchaseId: string) => Promise<void>;
  startPurchase: (purchaseId: string) => Promise<{ success: boolean; message: string; }>;
  completePurchase: (purchaseId: string) => Promise<void>;
  cancelPurchase: (purchaseId: string, reason: string) => Promise<void>;
  updateMemberContribution: (purchaseId: string, userId: string, newAmount: number) => Promise<void>;
  
  // Actions - Cart
  addToCart: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateCartQuantity: (cartId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  checkoutCart: () => Promise<void>;
  
  // Actions - Data
  loadPurchases: () => Promise<void>;
  loadPurchaseDetails: (purchaseId: string) => Promise<void>;
  loadMemberCart: (purchaseId: string) => Promise<void>;
  
  // Utils
  getInviteLink: (purchaseId: string) => Promise<string>;
  copyInviteLink: (purchaseId: string) => Promise<void>;
}

export const useTeamPurchaseModule = (
  currentUser: User | null
): UseTeamPurchaseModuleReturn => {
  const [purchases, setPurchases] = useState<TeamPurchase[]>([]);
  const [currentPurchase, setCurrentPurchase] = useState<TeamPurchaseView | null>(null);
  const [memberCart, setMemberCart] = useState<TeamPurchaseCart[]>([]);
  const [loading, setLoading] = useState(false);

  // Загрузка всех закупок пользователя
  const loadPurchases = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const data = await teamPurchaseService.getUserPurchases(currentUser.id);
      setPurchases(data);
    } catch (error) {
      console.error('Error loading purchases:', error);
      toast.error('Ошибка загрузки закупок');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Загрузка деталей закупки
  const loadPurchaseDetails = useCallback(async (purchaseId: string) => {
    setLoading(true);
    try {
      const details = await teamPurchaseService.getPurchaseDetails(purchaseId);
      setCurrentPurchase(details);
    } catch (error) {
      console.error('Error loading purchase details:', error);
      toast.error('Ошибка загрузки деталей');
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузка корзины участника
  const loadMemberCart = useCallback(async (purchaseId: string) => {
    if (!currentUser) return;
    
    try {
      const cart = await teamPurchaseCartService.getMemberCart(
        purchaseId,
        currentUser.id
      );
      setMemberCart(cart);
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  }, [currentUser]);

  // Создание закупки
  const createPurchase = useCallback(async (data: any) => {
    if (!currentUser) {
      toast.error('Необходимо авторизоваться');
      return;
    }

    try {
      const purchase = await teamPurchaseLifecycleService.createTeamPurchase(
        currentUser.id,
        data
      );
      
      toast.success('Командная закупка создана!');
      await loadPurchases();
      await loadPurchaseDetails(purchase.id);
    } catch (error: any) {
      console.error('Error creating purchase:', error);
      toast.error(error.message || 'Ошибка создания закупки');
    }
  }, [currentUser, loadPurchases, loadPurchaseDetails]);

  // Присоединение к закупке
  const joinPurchase = useCallback(async (inviteCode: string, contribution: number) => {
    if (!currentUser) {
      toast.error('Необходимо авторизоваться');
      return;
    }

    try {
      const result = await teamPurchaseLifecycleService.joinByInviteCode(
        inviteCode,
        currentUser.id,
        contribution
      );
      
      if (result.success) {
        toast.success(result.message);
        await loadPurchases();
        if (result.purchaseId) {
          await loadPurchaseDetails(result.purchaseId);
        }
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error('Error joining purchase:', error);
      toast.error(error.message || 'Ошибка присоединения');
    }
  }, [currentUser, loadPurchases, loadPurchaseDetails]);

  // Выход из закупки
  const leavePurchase = useCallback(async (purchaseId: string) => {
    if (!currentUser) return;

    try {
      await teamPurchaseLifecycleService.leaveTeamPurchase(
        purchaseId,
        currentUser.id
      );
      
      toast.success('Вы вышли из закупки');
      await loadPurchases();
      setCurrentPurchase(null);
    } catch (error: any) {
      console.error('Error leaving purchase:', error);
      toast.error(error.message || 'Ошибка выхода');
    }
  }, [currentUser, loadPurchases]);

  // Старт закупки
  const startPurchase = useCallback(async (purchaseId: string) => {
    try {
      const result = await teamPurchaseLifecycleService.startPurchase(purchaseId);
      
      if (result.success) {
        toast.success(result.message);
        await loadPurchaseDetails(purchaseId);
      } else {
        toast.error(result.message);
      }
      
      return result; // Возвращаем результат
    } catch (error: any) {
      console.error('Error starting purchase:', error);
      toast.error(error.message || 'Ошибка старта');
      return { success: false, message: error.message || 'Ошибка старта' }; // Возвращаем ошибку
    }
  }, [loadPurchaseDetails]);

  // Завершение закупки
  const completePurchase = useCallback(async (purchaseId: string) => {
    try {
      const result = await teamPurchaseLifecycleService.completePurchase(purchaseId);
      
      if (result.success) {
        toast.success(result.message);
        await loadPurchaseDetails(purchaseId);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error('Error completing purchase:', error);
      toast.error(error.message || 'Ошибка завершения');
    }
  }, [loadPurchaseDetails]);

  // Отмена закупки
  const cancelPurchase = useCallback(async (purchaseId: string, reason: string) => {
    try {
      await teamPurchaseLifecycleService.cancelPurchase(purchaseId, reason);
      toast.success('Закупка отменена');
      await loadPurchases();
    } catch (error: any) {
      console.error('Error cancelling purchase:', error);
      toast.error(error.message || 'Ошибка отмены');
    }
  }, [loadPurchases]);

  // Добавление в корзину
  const addToCart = useCallback(async (productId: string, quantity: number) => {
    if (!currentUser || !currentPurchase) return;

    try {
      await teamPurchaseCartService.addToCart(
        currentPurchase.purchase.id,
        currentUser.id,
        productId,
        quantity
      );
      
      toast.success('Товар добавлен в корзину');
      await loadMemberCart(currentPurchase.purchase.id);
      await loadPurchaseDetails(currentPurchase.purchase.id);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Ошибка добавления');
    }
  }, [currentUser, currentPurchase, loadMemberCart, loadPurchaseDetails]);

  // Удаление из корзины
  const removeFromCart = useCallback(async (productId: string) => {
    if (!currentUser || !currentPurchase) return;

    try {
      await teamPurchaseCartService.removeFromCart(
        currentPurchase.purchase.id,
        currentUser.id,
        productId
      );
      
      toast.success('Товар удален');
      await loadMemberCart(currentPurchase.purchase.id);
      await loadPurchaseDetails(currentPurchase.purchase.id);
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      toast.error(error.message || 'Ошибка удаления');
    }
  }, [currentUser, currentPurchase, loadMemberCart, loadPurchaseDetails]);

  // Обновление количества
  const updateCartQuantity = useCallback(async (cartId: string, quantity: number) => {
    if (!currentPurchase) return;

    try {
      await teamPurchaseCartService.updateQuantity(cartId, quantity);
      await loadMemberCart(currentPurchase.purchase.id);
      await loadPurchaseDetails(currentPurchase.purchase.id);
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      toast.error(error.message || 'Ошибка обновления');
    }
  }, [currentPurchase, loadMemberCart, loadPurchaseDetails]);

  // Очистка корзины
  const clearCart = useCallback(async () => {
    if (!currentUser || !currentPurchase) return;

    try {
      await teamPurchaseCartService.clearCart(
        currentPurchase.purchase.id,
        currentUser.id
      );
      
      toast.success('Корзина очищена');
      setMemberCart([]);
      await loadPurchaseDetails(currentPurchase.purchase.id);
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      toast.error(error.message || 'Ошибка очистки');
    }
  }, [currentUser, currentPurchase, loadPurchaseDetails]);

  // Оформление заказа
  const checkoutCart = useCallback(async () => {
    if (!currentUser || !currentPurchase) return;

    try {
      // Проверяем лимиты
      const limits = await teamPurchaseCartService.checkCartLimits(
        currentPurchase.purchase.id,
        currentUser.id
      );
      
      if (!limits.isValid) {
        toast.error(limits.message || 'Превышен лимит');
        return;
      }

      // Создаем заказ
      const orderId = await teamPurchaseCartService.convertToOrder(
        currentPurchase.purchase.id,
        currentUser.id
      );
      
      // Подтверждаем оплату (в реальности здесь будет платежная система)
      const member = currentPurchase.members.find(m => m.user.id === currentUser.id);
      if (member) {
        await teamPurchaseLifecycleService.confirmMemberPayment(
          currentPurchase.purchase.id,
          member.member.id,
          orderId,
          limits.currentTotal
        );
      }
      
      toast.success('Заказ оформлен!');
      await loadPurchaseDetails(currentPurchase.purchase.id);
    } catch (error: any) {
      console.error('Error checking out:', error);
      toast.error(error.message || 'Ошибка оформления');
    }
  }, [currentUser, currentPurchase, loadPurchaseDetails]);

  // Получение ссылки приглашения
  const getInviteLink = useCallback(async (purchaseId: string): Promise<string> => {
    try {
      return await teamPurchaseService.getInviteLink(purchaseId);
    } catch (error) {
      console.error('Error getting invite link:', error);
      return '';
    }
  }, []);

  // Копирование ссылки
  const copyInviteLink = useCallback(async (purchaseId: string) => {
    try {
      const link = await getInviteLink(purchaseId);
      await navigator.clipboard.writeText(link);
      toast.success('Ссылка скопирована');
    } catch (error) {
      console.error('Error copying link:', error);
      toast.error('Ошибка копирования');
    }
  }, [getInviteLink]);

  // Обновление вклада участника
  const updateMemberContribution = useCallback(async (
    purchaseId: string,
    userId: string,
    newAmount: number
  ) => {
    try {
      await teamPurchaseLifecycleService.updateMemberContribution(
        purchaseId,
        userId,
        newAmount
      );
      
      toast.success('Вклад обновлен');
      await loadPurchaseDetails(purchaseId);
    } catch (error: any) {
      console.error('Error updating contribution:', error);
      toast.error(error.message || 'Ошибка обновления вклада');
    }
  }, [loadPurchaseDetails]);

  // Автозагрузка при монтировании
  useEffect(() => {
    if (currentUser) {
      loadPurchases();
    }
  }, [currentUser]);

  return {
    // State
    purchases,
    currentPurchase,
    memberCart,
    loading,
    
    // Actions - Lifecycle
    createPurchase,
    joinPurchase,
    leavePurchase,
    startPurchase,
    completePurchase,
    cancelPurchase,
    updateMemberContribution,
    
    // Actions - Cart
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    checkoutCart,
    
    // Actions - Data
    loadPurchases,
    loadPurchaseDetails,
    loadMemberCart,
    
    // Utils
    getInviteLink,
    copyInviteLink
  };
};