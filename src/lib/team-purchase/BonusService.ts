import { supabase } from '@/lib/supabase/client';

export interface BonusLevel {
  id: string;
  name: string;
  min_amount: number;
  max_amount: number | null;
  bonus_percent: number;
  color: string;
  icon?: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
}

class BonusService {
  private bonusLevels: BonusLevel[] = [];
  private lastFetch: number = 0;
  private cacheTimeout = 5 * 60 * 1000; // 5 минут кэш

  /**
   * Загрузка уровней бонусов из БД
   */
  async loadBonusLevels(forceRefresh = false): Promise<BonusLevel[]> {
    const now = Date.now();
    
    // Используем кэш если он свежий
    if (!forceRefresh && this.bonusLevels.length > 0 && (now - this.lastFetch) < this.cacheTimeout) {
      return this.bonusLevels;
    }

    try {
      const { data, error } = await supabase
        .from('bonus_levels')
        .select('*')
        .eq('is_active', true)
        .order('min_amount', { ascending: true });

      if (error) throw error;

      this.bonusLevels = data || [];
      this.lastFetch = now;
      
      return this.bonusLevels;
    } catch (error) {
      console.error('Error loading bonus levels:', error);
      return this.bonusLevels; // Возвращаем кэшированные если есть
    }
  }

  /**
   * Получить бонусный уровень для суммы
   */
  async getBonusForAmount(amount: number): Promise<BonusLevel | null> {
    const levels = await this.loadBonusLevels();
    
    // Находим подходящий уровень
    for (const level of levels) {
      if (amount >= level.min_amount) {
        // Если есть максимум, проверяем его
        if (level.max_amount === null || amount <= level.max_amount) {
          return level;
        }
      }
    }
    
    return null;
  }

  /**
   * Получить процент бонуса для суммы
   */
  async getBonusPercent(amount: number): Promise<number> {
    const level = await this.getBonusForAmount(amount);
    return level?.bonus_percent || 0;
  }

  /**
   * Рассчитать сумму бонуса
   */
  async calculateBonus(amount: number): Promise<{
    level: BonusLevel | null;
    percent: number;
    bonusAmount: number;
    totalWithBonus: number;
  }> {
    const level = await this.getBonusForAmount(amount);
    const percent = level?.bonus_percent || 0;
    const bonusAmount = Math.floor(amount * percent / 100);
    const totalWithBonus = amount + bonusAmount;

    return {
      level,
      percent,
      bonusAmount,
      totalWithBonus
    };
  }

  /**
   * Получить все уровни для отображения
   */
  async getAllLevels(): Promise<BonusLevel[]> {
    return await this.loadBonusLevels();
  }

  /**
   * Форматирование суммы для отображения бонусного уровня
   */
  formatBonusRange(level: BonusLevel): string {
    const formatAmount = (amount: number) => {
      if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M`;
      }
      return `${(amount / 1000).toFixed(0)}K`;
    };

    if (level.max_amount === null) {
      return `от ${formatAmount(level.min_amount)} ₸`;
    }
    
    return `${formatAmount(level.min_amount)} - ${formatAmount(level.max_amount)} ₸`;
  }
}

export const bonusService = new BonusService();