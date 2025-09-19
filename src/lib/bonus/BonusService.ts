import { supabase } from '@/lib/supabase/client';

type DealerTurnover = {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  total_turnover: number;
  total_orders: number;
  last_order_date: string;
  bonus_tier: 'none' | 'vacation' | 'car' | 'apartment';
  progress_percentage: number;
  amount_to_next_tier: number;
};

type TopDealer = DealerTurnover & {
  rank: number;
};

export class BonusService {
  private supabase = supabase;

  // Получить топ дилеров
  async getTopDealers(limit: number = 10): Promise<TopDealer[]> {
    try {
      // Получаем все оплаченные заказы с информацией о пользователях
      const { data: orders, error } = await this.supabase
        .from('orders')
        .select(`
          user_id,
          total_amount,
          created_at,
          users!inner (
            id,
            first_name,
            last_name,
            email,
            phone,
            role
          )
        `)
        .eq('payment_status', 'paid');

      if (error || !orders) {
        console.error('Error fetching orders:', error);
        return [];
      }

      // Группируем по пользователям
      const userTotals = new Map<string, any>();
      
      orders.forEach((order: any) => {
        const userId = order.user_id;
        const user = order.users;
        
        if (!userTotals.has(userId)) {
          userTotals.set(userId, {
            user_id: userId,
            full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Без имени',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || 'dealer',
            total_turnover: 0,
            total_orders: 0,
            last_order_date: order.created_at
          });
        }
        
        const current = userTotals.get(userId);
        current.total_turnover += order.total_amount || 0;
        current.total_orders += 1;
        if (new Date(order.created_at) > new Date(current.last_order_date)) {
          current.last_order_date = order.created_at;
        }
      });

      // Преобразуем в массив и добавляем расчетные поля
      const dealers: TopDealer[] = Array.from(userTotals.values())
        .map((dealer) => {
          const turnover = dealer.total_turnover;
          let bonus_tier: 'none' | 'vacation' | 'car' | 'apartment' = 'none';
          let progress_percentage = 0;
          let amount_to_next_tier = 30000000;

          if (turnover >= 90000000) {
            bonus_tier = 'apartment';
            progress_percentage = 100;
            amount_to_next_tier = 0;
          } else if (turnover >= 60000000) {
            bonus_tier = 'car';
            progress_percentage = ((turnover - 60000000) * 100) / 30000000;
            amount_to_next_tier = 90000000 - turnover;
          } else if (turnover >= 30000000) {
            bonus_tier = 'vacation';
            progress_percentage = ((turnover - 30000000) * 100) / 30000000;
            amount_to_next_tier = 60000000 - turnover;
          } else {
            progress_percentage = (turnover * 100) / 30000000;
            amount_to_next_tier = 30000000 - turnover;
          }

          return {
            ...dealer,
            bonus_tier,
            progress_percentage: Math.min(100, Math.max(0, progress_percentage)),
            amount_to_next_tier: Math.max(0, amount_to_next_tier)
          };
        })
        .sort((a, b) => b.total_turnover - a.total_turnover)
        .slice(0, limit)
        .map((dealer, index) => ({
          ...dealer,
          rank: index + 1
        }));

      return dealers;
    } catch (error) {
      console.error('Error in getTopDealers:', error);
      return [];
    }
  }

  // Получить данные о товарообороте конкретного дилера
  async getDealerTurnover(userId: string): Promise<DealerTurnover | null> {
    try {
      const { data: orders, error } = await this.supabase
        .from('orders')
        .select(`
          user_id,
          total_amount,
          created_at,
          users!inner (
            id,
            first_name,
            last_name,
            email,
            phone,
            role
          )
        `)
        .eq('payment_status', 'paid')
        .eq('user_id', userId);

      if (error || !orders || orders.length === 0) {
        return null;
      }

      const user = orders[0].users;
      let total_turnover = 0;
      let last_order_date = orders[0].created_at;

      orders.forEach((order: any) => {
        total_turnover += order.total_amount || 0;
        if (new Date(order.created_at) > new Date(last_order_date)) {
          last_order_date = order.created_at;
        }
      });

      // Расчет уровня и прогресса
      let bonus_tier: 'none' | 'vacation' | 'car' | 'apartment' = 'none';
      let progress_percentage = 0;
      let amount_to_next_tier = 30000000;

      if (total_turnover >= 90000000) {
        bonus_tier = 'apartment';
        progress_percentage = 100;
        amount_to_next_tier = 0;
      } else if (total_turnover >= 60000000) {
        bonus_tier = 'car';
        progress_percentage = ((total_turnover - 60000000) * 100) / 30000000;
        amount_to_next_tier = 90000000 - total_turnover;
      } else if (total_turnover >= 30000000) {
        bonus_tier = 'vacation';
        progress_percentage = ((total_turnover - 30000000) * 100) / 30000000;
        amount_to_next_tier = 60000000 - total_turnover;
      } else {
        progress_percentage = (total_turnover * 100) / 30000000;
        amount_to_next_tier = 30000000 - total_turnover;
      }

      return {
        user_id: userId,
        full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Без имени',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'dealer',
        total_turnover,
        total_orders: orders.length,
        last_order_date,
        bonus_tier,
        progress_percentage: Math.min(100, Math.max(0, progress_percentage)),
        amount_to_next_tier: Math.max(0, amount_to_next_tier)
      };
    } catch (error) {
      console.error('Error in getDealerTurnover:', error);
      return null;
    }
  }

  // Получить статистику по бонусной системе
  async getBonusSystemStats() {
    try {
      const dealers = await this.getTopDealers(1000);

      const stats = {
        total: dealers.length,
        none: 0,
        vacation: 0,
        car: 0,
        apartment: 0
      };

      dealers.forEach(dealer => {
        const tier = dealer.bonus_tier as keyof typeof stats;
        if (tier in stats && tier !== 'total') {
          stats[tier]++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error in getBonusSystemStats:', error);
      return {
        total: 0,
        none: 0,
        vacation: 0,
        car: 0,
        apartment: 0
      };
    }
  }

  // Получить дилеров по уровню бонуса
  async getDealersByTier(tier: 'none' | 'vacation' | 'car' | 'apartment'): Promise<DealerTurnover[]> {
    try {
      const dealers = await this.getTopDealers(1000);
      const filteredDealers = dealers.filter(d => d.bonus_tier === tier);
      
      return filteredDealers.map(({ rank, ...dealer }) => dealer);
    } catch (error) {
      console.error('Error in getDealersByTier:', error);
      return [];
    }
  }

  // Форматирование суммы
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Получить название уровня на русском
  getTierName(tier: string): string {
    const tierNames: Record<string, string> = {
      none: 'Без бонуса',
      vacation: 'Путёвка',
      car: 'Автомобиль',
      apartment: 'Квартира'
    };
    return tierNames[tier] || tier;
  }

  // Получить иконку для уровня
  getTierIcon(tier: string): string {
    const tierIcons: Record<string, string> = {
      none: '🎯',
      vacation: '🏖️',
      car: '🚗',
      apartment: '🏠'
    };
    return tierIcons[tier] || '🎯';
  }
}

// Экспортируем singleton
export const bonusService = new BonusService();