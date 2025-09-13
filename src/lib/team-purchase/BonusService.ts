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

export interface BonusCalculation {
  level: BonusLevel | null;
  percent: number;
  bonusAmount: number;
  totalWithBonus: number;
}

export interface BonusReadinessCheck {
  ready: boolean;
  message: string;
  issues?: string[];
}

export interface TeamPurchaseBonusInfo {
  teamLevel: BonusLevel | null;
  teamPercent: number;
  totalAmount: number;
  expectedBonuses: number;
  participantsCount: number;
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
      
      console.log('Loaded bonus levels:', this.bonusLevels.length);
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
    
    // Находим подходящий уровень (от большего к меньшему)
    for (let i = levels.length - 1; i >= 0; i--) {
      const level = levels[i];
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
  async calculateBonus(amount: number): Promise<BonusCalculation> {
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
   * Проверить готовность закупки к расчету бонусов
   */
  async checkBonusReadiness(purchaseId: string): Promise<BonusReadinessCheck> {
    const issues: string[] = [];
    
    try {
      // Проверяем статус закупки
      const { data: purchase, error: purchaseError } = await supabase
        .from('team_purchases')
        .select('status, bonuses_calculated, collected_amount')
        .eq('id', purchaseId)
        .single();
        
      if (purchaseError || !purchase) {
        return { 
          ready: false, 
          message: 'Закупка не найдена',
          issues: ['Закупка не найдена в базе данных']
        };
      }
      
      // Проверяем статус
      if (purchase.status !== 'completed') {
        issues.push(`Закупка должна быть завершена (текущий статус: ${purchase.status})`);
      }
      
      // Проверяем что бонусы еще не рассчитаны
      if (purchase.bonuses_calculated) {
        issues.push('Бонусы уже рассчитаны для этой закупки');
      }
      
      // Проверяем участников
      const { data: members, error: membersError } = await supabase
        .from('team_purchase_members')
        .select(`
          user_id, 
          contribution_actual,
          status,
          user:users(
            id,
            email,
            parent_id,
            personal_level,
            personal_turnover
          )
        `)
        .eq('team_purchase_id', purchaseId)
        .eq('status', 'purchased');
        
      if (membersError) {
        issues.push('Ошибка загрузки участников');
      } else if (!members || members.length === 0) {
        issues.push('Нет оплативших участников');
      } else {
        // Проверяем каждого участника
        let totalContribution = 0;
        const usersWithoutSponsor: string[] = [];
        
        for (const member of members) {
          totalContribution += member.contribution_actual || 0;
          
          // Проверяем наличие спонсора (parent_id)
          if (!member.user?.parent_id) {
            usersWithoutSponsor.push(member.user?.email || member.user_id);
          }
          
          // Проверяем минимальную сумму
          if ((member.contribution_actual || 0) < 300000) {
            issues.push(`Участник ${member.user?.email} оплатил меньше минимальной суммы`);
          }
        }
        
        if (usersWithoutSponsor.length > 0) {
          issues.push(`У следующих участников нет спонсора: ${usersWithoutSponsor.join(', ')}`);
        }
        
        // Проверяем общую сумму
        if (totalContribution < 300000) {
          issues.push(`Общая сумма закупки слишком мала: ${totalContribution.toLocaleString('ru-RU')} ₸`);
        }
      }
      
      // Проверяем наличие уровней бонусов
      const levels = await this.loadBonusLevels();
      if (levels.length === 0) {
        issues.push('Не настроены уровни бонусов в системе');
      }
      
      return {
        ready: issues.length === 0,
        message: issues.length === 0 
          ? 'Закупка готова к расчету бонусов' 
          : `Обнаружено проблем: ${issues.length}`,
        issues: issues.length > 0 ? issues : undefined
      };
    } catch (error) {
      console.error('Error checking bonus readiness:', error);
      return {
        ready: false,
        message: 'Ошибка проверки готовности',
        issues: ['Внутренняя ошибка при проверке']
      };
    }
  }

  /**
   * Получить информацию о бонусах для командной закупки
   */
  async getTeamPurchaseBonusInfo(purchaseId: string): Promise<TeamPurchaseBonusInfo | null> {
    try {
      // Получаем данные о закупке
      const { data: purchase } = await supabase
        .from('team_purchases')
        .select('collected_amount, paid_amount')
        .eq('id', purchaseId)
        .single();
        
      if (!purchase) return null;
      
      // Используем paid_amount если есть, иначе collected_amount
      const totalAmount = purchase.paid_amount || purchase.collected_amount || 0;
      
      // Получаем уровень для общей суммы
      const teamLevel = await this.getBonusForAmount(totalAmount);
      const teamPercent = teamLevel?.bonus_percent || 0;
      
      // Получаем количество участников
      const { data: members } = await supabase
        .from('team_purchase_members')
        .select('contribution_actual')
        .eq('team_purchase_id', purchaseId)
        .eq('status', 'purchased');
        
      const participantsCount = members?.length || 0;
      
      // Примерный расчет ожидаемых бонусов
      // Это упрощенный расчет, реальный будет зависеть от иерархии
      const expectedBonuses = Math.floor(totalAmount * teamPercent / 100);
      
      return {
        teamLevel,
        teamPercent,
        totalAmount,
        expectedBonuses,
        participantsCount
      };
    } catch (error) {
      console.error('Error getting team purchase bonus info:', error);
      return null;
    }
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

  /**
   * Получить следующий уровень бонуса
   */
  async getNextBonusLevel(currentAmount: number): Promise<{
    current: BonusLevel | null;
    next: BonusLevel | null;
    amountToNext: number;
    progressPercent: number;
  }> {
    const levels = await this.loadBonusLevels();
    const current = await this.getBonusForAmount(currentAmount);
    
    let next: BonusLevel | null = null;
    let amountToNext = 0;
    let progressPercent = 100;
    
    // Находим следующий уровень
    for (const level of levels) {
      if (level.min_amount > currentAmount) {
        next = level;
        amountToNext = level.min_amount - currentAmount;
        
        // Рассчитываем прогресс
        if (current) {
          const range = level.min_amount - current.min_amount;
          const progress = currentAmount - current.min_amount;
          progressPercent = Math.min(100, Math.floor((progress / range) * 100));
        } else {
          progressPercent = Math.floor((currentAmount / level.min_amount) * 100);
        }
        break;
      }
    }
    
    return {
      current,
      next,
      amountToNext,
      progressPercent
    };
  }

  /**
   * Проверить и инициализировать бонусные уровни если их нет
   */
  async initializeBonusLevels(): Promise<void> {
    const { data: existingLevels } = await supabase
      .from('bonus_levels')
      .select('id')
      .limit(1);
      
    if (!existingLevels || existingLevels.length === 0) {
      console.log('Initializing default bonus levels...');
      
      const defaultLevels = [
        {
          name: 'Бронза',
          min_amount: 300000,
          max_amount: 499999,
          bonus_percent: 8,
          color: '#CD7F32',
          description: 'Базовый уровень бонусов',
          is_active: true,
          sort_order: 1
        },
        {
          name: 'Серебро',
          min_amount: 500000,
          max_amount: 999999,
          bonus_percent: 10,
          color: '#C0C0C0',
          description: 'Серебряный уровень бонусов',
          is_active: true,
          sort_order: 2
        },
        {
          name: 'Золото',
          min_amount: 1000000,
          max_amount: 2999999,
          bonus_percent: 13,
          color: '#FFD700',
          description: 'Золотой уровень бонусов',
          is_active: true,
          sort_order: 3
        },
        {
          name: 'Платина',
          min_amount: 3000000,
          max_amount: 9999999,
          bonus_percent: 15,
          color: '#E5E4E2',
          description: 'Платиновый уровень бонусов',
          is_active: true,
          sort_order: 4
        },
        {
          name: 'Бриллиант',
          min_amount: 10000000,
          max_amount: null,
          bonus_percent: 17,
          color: '#B9F2FF',
          description: 'Бриллиантовый уровень бонусов',
          is_active: true,
          sort_order: 5
        }
      ];
      
      const { error } = await supabase
        .from('bonus_levels')
        .insert(defaultLevels);
        
      if (error) {
        console.error('Error initializing bonus levels:', error);
      } else {
        console.log('Bonus levels initialized successfully');
        // Обновляем кэш
        await this.loadBonusLevels(true);
      }
    }
  }
}

export const bonusService = new BonusService();