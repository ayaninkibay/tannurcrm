import { supabase } from '@/lib/supabase/client';

export interface BonusEventTarget {
  id?: string;
  event_id?: string;
  target_amount: number;
  reward_title: string;
  reward_description: string;
  reward_icon: string;
  sort_order: number;
}

export interface BonusEvent {
  id?: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  priority?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  targets?: BonusEventTarget[];
}

export interface UserProgress {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  total_turnover: number;
  total_orders: number;
  last_order_date: string | null;
  achieved_targets: string[];
}

export class BonusEventService {
  private supabase = supabase;

  // Создать новое бонусное событие с целями
  async createBonusEvent(event: BonusEvent, targets: BonusEventTarget[]): Promise<BonusEvent> {
    try {
      const { data: eventData, error: eventError } = await this.supabase
        .from('bonus_events')
        .insert({
          title: event.title,
          description: event.description,
          start_date: event.start_date,
          end_date: event.end_date,
          priority: event.priority || 0,
          is_active: true,
          created_by: (await this.supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (eventError) throw eventError;

      const targetsWithEventId = targets.map((target, index) => ({
        ...target,
        event_id: eventData.id,
        sort_order: target.sort_order || index
      }));

      const { data: targetsData, error: targetsError } = await this.supabase
        .from('bonus_event_targets')
        .insert(targetsWithEventId)
        .select();

      if (targetsError) throw targetsError;

      return {
        ...eventData,
        targets: targetsData
      };
    } catch (error) {
      console.error('Error creating bonus event:', error);
      throw error;
    }
  }

  // Получить ВСЕ активные бонусные события (без фильтра по приоритету)
  async getActiveBonusEvents(): Promise<BonusEvent[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: events, error } = await this.supabase
        .from('bonus_events')
        .select(`
          *,
          targets:bonus_event_targets(*)
        `)
        .eq('is_active', true)
        .gte('end_date', today)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedEvents = events?.map(event => ({
        ...event,
        targets: event.targets?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []
      })) || [];

      return formattedEvents;
    } catch (error) {
      console.error('Error fetching active bonus events:', error);
      return [];
    }
  }

  // Получить главное бонусное событие (ТОЛЬКО с priority = 1)
  async getMainBonusEvent(): Promise<BonusEvent | null> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Ищем ТОЛЬКО событие с priority = 1
      const { data: priorityEvent, error: priorityError } = await this.supabase
        .from('bonus_events')
        .select(`
          *,
          targets:bonus_event_targets(*)
        `)
        .eq('is_active', true)
        .eq('priority', 1)
        .gte('end_date', today)
        .single();

      if (!priorityError && priorityEvent) {
        priorityEvent.targets = priorityEvent.targets?.sort((a: any, b: any) => a.sort_order - b.sort_order) || [];
        return priorityEvent;
      }

      return null;
    } catch (error) {
      console.error('Error fetching main bonus event:', error);
      return null;
    }
  }

  // Получить бонусное событие по ID
  async getBonusEventById(eventId: string): Promise<BonusEvent | null> {
    try {
      const { data, error } = await this.supabase
        .from('bonus_events')
        .select(`
          *,
          targets:bonus_event_targets(*)
        `)
        .eq('id', eventId)
        .single();

      if (error) throw error;

      if (data) {
        data.targets = data.targets?.sort((a: any, b: any) => a.sort_order - b.sort_order) || [];
      }

      return data;
    } catch (error) {
      console.error('Error fetching bonus event:', error);
      return null;
    }
  }

  // Получить прогресс пользователя в реальном времени
  async getUserProgress(userId: string, eventId?: string): Promise<UserProgress | null> {
    try {
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('id, first_name, last_name, email, phone')
        .eq('id', userId)
        .single();

      if (userError || !userData) return null;

      let dateFilter = {};
      if (eventId) {
        const event = await this.getBonusEventById(eventId);
        if (event) {
          dateFilter = {
            start: event.start_date,
            end: event.end_date
          };
        }
      }

      const queries = [];

      let ordersQuery = this.supabase
        .from('orders')
        .select('total_amount, created_at')
        .eq('user_id', userId)
        .eq('payment_status', 'paid');

      let teamOrdersQuery = this.supabase
        .from('team_purchase_orders')
        .select('*')
        .eq('user_id', userId)
        .eq('payment_status', 'paid');

      if (dateFilter.start && dateFilter.end) {
        ordersQuery = ordersQuery
          .gte('created_at', dateFilter.start)
          .lte('created_at', dateFilter.end + 'T23:59:59');
        
        teamOrdersQuery = teamOrdersQuery
          .gte('created_at', dateFilter.start)
          .lte('created_at', dateFilter.end + 'T23:59:59');
      }

      const [ordersResult, teamOrdersResult] = await Promise.all([
        ordersQuery,
        teamOrdersQuery
      ]);

      if (ordersResult.error) throw ordersResult.error;
      
      if (teamOrdersResult.error) {
        console.warn('Team purchase orders error (ignoring):', teamOrdersResult.error);
      }

      const allOrders = [...(ordersResult.data || [])];
      
      if (teamOrdersResult.data && teamOrdersResult.data.length > 0) {
        teamOrdersResult.data.forEach((order: any) => {
          const amount = order.order_amount || 0;
          allOrders.push({
            total_amount: amount,
            created_at: order.created_at
          });
        });
      }

      let totalTurnover = 0;
      let lastOrderDate: string | null = null;

      allOrders.forEach((order) => {
        const amount = order.total_amount || 0;
        totalTurnover += amount;
        if (!lastOrderDate || new Date(order.created_at) > new Date(lastOrderDate)) {
          lastOrderDate = order.created_at;
        }
      });

      const achievedTargets: string[] = [];
      if (eventId) {
        const event = await this.getBonusEventById(eventId);
        if (event?.targets) {
          event.targets.forEach(target => {
            if (totalTurnover >= target.target_amount && target.id) {
              achievedTargets.push(target.id);
            }
          });
        }
      }

      return {
        user_id: userId,
        full_name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Без имени',
        email: userData.email || '',
        phone: userData.phone || '',
        total_turnover: totalTurnover,
        total_orders: allOrders.length,
        last_order_date: lastOrderDate,
        achieved_targets: achievedTargets
      };
    } catch (error) {
      console.error('Error getting user progress:', error);
      return null;
    }
  }

  // Получить рейтинг участников события
  async getEventLeaderboard(eventId: string, limit: number = 10): Promise<UserProgress[]> {
    try {
      const event = await this.getBonusEventById(eventId);
      if (!event) return [];

      const { data: users, error: usersError } = await this.supabase
        .from('users')
        .select('id, first_name, last_name, email, phone, role')
        .in('role', ['dealer', 'admin']);

      if (usersError || !users) return [];

      const progressPromises = users.map(user => 
        this.getUserProgress(user.id, eventId)
      );

      const allProgress = await Promise.all(progressPromises);

      const validProgress = allProgress
        .filter(p => p !== null && p.total_turnover > 0)
        .sort((a, b) => b!.total_turnover - a!.total_turnover)
        .slice(0, limit);
      
      return validProgress as UserProgress[];
    } catch (error) {
      console.error('[getEventLeaderboard] Error:', error);
      return [];
    }
  }

  // Обновить событие
  async updateBonusEvent(eventId: string, updates: Partial<BonusEvent>): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('bonus_events')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating bonus event:', error);
      return false;
    }
  }

  // Деактивировать событие
  async deactivateEvent(eventId: string): Promise<boolean> {
    return this.updateBonusEvent(eventId, { is_active: false });
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

  // Получить иконку для награды
  getRewardIcon(iconType: string): string {
    const icons: Record<string, string> = {
      plane: '✈️',
      car: '🚗',
      home: '🏠',
      money: '💰',
      gift: '🎁',
      trophy: '🏆',
      star: '⭐',
      vacation: '🏖️'
    };
    return icons[iconType] || '🎯';
  }
}

export const bonusEventService = new BonusEventService();