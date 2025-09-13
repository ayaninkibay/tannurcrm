import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { giftService, type CreateGiftData, type GiftWithItems } from './GiftService';

export interface UseGiftModuleReturn {
  // State
  gifts: GiftWithItems[];
  currentGift: GiftWithItems | null;
  loading: boolean;
  stats: {
    totalGifts: number;
    totalAmount: number;
    pendingGifts: number;
    issuedGifts: number;
  };
  
  // Actions
  createGift: (data: CreateGiftData) => Promise<void>;
  loadGifts: (options?: { limit?: number; offset?: number; status?: string }) => Promise<void>;
  loadGiftById: (id: string) => Promise<void>;
  updateGiftStatus: (id: string, status: 'pending' | 'issued' | 'cancelled') => Promise<void>;
  loadStats: () => Promise<void>;
}

export const useGiftModule = (): UseGiftModuleReturn => {
  const [gifts, setGifts] = useState<GiftWithItems[]>([]);
  const [currentGift, setCurrentGift] = useState<GiftWithItems | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalGifts: 0,
    totalAmount: 0,
    pendingGifts: 0,
    issuedGifts: 0,
  });

  // Создание подарка
  const createGift = useCallback(async (data: CreateGiftData) => {
    try {
      setLoading(true);
      await giftService.createGift(data);
      toast.success('Подарок успешно создан');
      // Перезагружаем список подарков
      await loadGifts();
      await loadStats();
    } catch (error: any) {
      console.error('Error creating gift:', error);
      toast.error(error.message || 'Ошибка создания подарка');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузка списка подарков
  const loadGifts = useCallback(async (options?: { 
    limit?: number; 
    offset?: number; 
    status?: string 
  }) => {
    try {
      setLoading(true);
      const result = await giftService.getGifts(options);
      setGifts(result.gifts);
    } catch (error: any) {
      console.error('Error loading gifts:', error);
      toast.error(error.message || 'Ошибка загрузки подарков');
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузка конкретного подарка
  const loadGiftById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const gift = await giftService.getGiftById(id);
      setCurrentGift(gift);
    } catch (error: any) {
      console.error('Error loading gift:', error);
      toast.error(error.message || 'Ошибка загрузки подарка');
    } finally {
      setLoading(false);
    }
  }, []);

  // Обновление статуса подарка
  const updateGiftStatus = useCallback(async (
    id: string, 
    status: 'pending' | 'issued' | 'cancelled'
  ) => {
    try {
      setLoading(true);
      await giftService.updateGiftStatus(id, status);
      
      const statusText = {
        pending: 'ожидает выдачи',
        issued: 'выдан',
        cancelled: 'отменен'
      }[status];
      
      toast.success(`Подарок ${statusText}`);
      
      // Обновляем текущий подарок если он загружен
      if (currentGift?.id === id) {
        await loadGiftById(id);
      }
      
      // Перезагружаем список и статистику
      await loadGifts();
      await loadStats();
    } catch (error: any) {
      console.error('Error updating gift status:', error);
      toast.error(error.message || 'Ошибка обновления статуса');
    } finally {
      setLoading(false);
    }
  }, [currentGift, loadGiftById, loadGifts]);

  // Загрузка статистики
  const loadStats = useCallback(async () => {
    try {
      const newStats = await giftService.getGiftStats();
      setStats(newStats);
    } catch (error: any) {
      console.error('Error loading gift stats:', error);
    }
  }, []);

  return {
    // State
    gifts,
    currentGift,
    loading,
    stats,
    
    // Actions
    createGift,
    loadGifts,
    loadGiftById,
    updateGiftStatus,
    loadStats,
  };
};