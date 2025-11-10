import { supabase } from '@/lib/supabase/client';

// =====================================================
// ИНТЕРФЕЙСЫ
// =====================================================

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

// Обновлённый интерфейс с учётом команды
export interface UserProgress {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  personal_turnover: number;
  team_turnover: number;
  total_turnover: number;
  personal_orders: number;
  team_orders: number;
  total_orders: number;
  last_order_date: string | null;
  team_members_count: number;
  achieved_targets: AchievedTarget[];
  rank_position?: number;
}

export interface AchievedTarget {
  target_id: string;
  target_amount: number;
  reward_title: string;
  reward_description: string | null;
  reward_icon: string;
  is_achieved: boolean;
  achievement_date: string | null;
}

// Тип данных, возвращаемых из RPC функции get_user_bonus_turnover
interface UserTurnoverData {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  personal_turnover: number;
  team_turnover: number;
  total_turnover: number;
  personal_orders: number;
  team_orders: number;
  total_orders: number;
  last_order_date: string | null;
  team_members_count: number;
}

export interface LeaderboardEntry extends UserProgress {
  rank_position: number;
  role: string;
}

// =====================================================
// СЕРВИС
// =====================================================

export class BonusEventService {
  private supabase = supabase;

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

  async getMainBonusEvent(): Promise<BonusEvent | null> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
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

  async deactivateEvent(eventId: string): Promise<boolean> {
    return this.updateBonusEvent(eventId, { is_active: false });
  }

  async getUserProgress(
    userId: string, 
    eventId?: string, 
    includeTeam: boolean = false
  ): Promise<UserProgress | null> {
    try {
      let startDate: string;
      let endDate: string;
      let event: BonusEvent | null = null;

      if (eventId) {
        event = await this.getBonusEventById(eventId);
        if (!event) return null;
        startDate = event.start_date;
        endDate = event.end_date;
      } else {
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      }

      const { data: turnoverData, error: turnoverError } = await this.supabase
        .rpc('get_user_bonus_turnover', {
          p_user_id: userId,
          p_start_date: startDate,
          p_end_date: endDate,
          p_include_team: includeTeam
        })
        .single() as { data: UserTurnoverData | null; error: any };

      if (turnoverError || !turnoverData) {
        console.error('Error getting user turnover:', turnoverError);
        return null;
      }

      let achievedTargets: AchievedTarget[] = [];
      if (event?.id) {
        const { data: targetsData, error: targetsError } = await this.supabase
          .rpc('get_user_achieved_targets', {
            p_user_id: userId,
            p_event_id: event.id,
            p_turnover: turnoverData.total_turnover
          });

        if (!targetsError && targetsData) {
          achievedTargets = targetsData;
        }
      }

      return {
        user_id: turnoverData.user_id,
        full_name: turnoverData.full_name,
        email: turnoverData.email,
        phone: turnoverData.phone,
        personal_turnover: turnoverData.personal_turnover,
        team_turnover: turnoverData.team_turnover,
        total_turnover: turnoverData.total_turnover,
        personal_orders: turnoverData.personal_orders,
        team_orders: turnoverData.team_orders,
        total_orders: turnoverData.total_orders,
        last_order_date: turnoverData.last_order_date,
        team_members_count: turnoverData.team_members_count,
        achieved_targets: achievedTargets
      };
    } catch (error) {
      console.error('Error getting user progress:', error);
      return null;
    }
  }

  async getEventLeaderboard(
    eventId: string, 
    limit: number = 10,
    includeTeam: boolean = false
  ): Promise<LeaderboardEntry[]> {
    try {
      const event = await this.getBonusEventById(eventId);
      if (!event) return [];

      const { data: leaderboardData, error } = await this.supabase
        .rpc('get_all_users_bonus_turnover', {
          p_start_date: event.start_date,
          p_end_date: event.end_date,
          p_include_team: includeTeam,
          p_limit: limit,
          p_offset: 0
        });

      if (error) {
        console.error('Error getting leaderboard:', error);
        return [];
      }

      const leaderboardWithTargets = await Promise.all(
        leaderboardData.map(async (entry: any) => {
          const { data: targetsData } = await this.supabase
            .rpc('get_user_achieved_targets', {
              p_user_id: entry.user_id,
              p_event_id: eventId,
              p_turnover: entry.total_turnover
            });

          return {
            ...entry,
            achieved_targets: targetsData || []
          };
        })
      );

      return leaderboardWithTargets;
    } catch (error) {
      console.error('Error getting event leaderboard:', error);
      return [];
    }
  }

  async getAdminLeaderboard(
    startDate: string,
    endDate: string,
    includeTeam: boolean = true,
    limit?: number,
    offset: number = 0
  ): Promise<LeaderboardEntry[]> {
    try {
      const { data: leaderboardData, error } = await this.supabase
        .rpc('get_all_users_bonus_turnover', {
          p_start_date: startDate,
          p_end_date: endDate,
          p_include_team: includeTeam,
          p_limit: limit || null,
          p_offset: offset
        });

      if (error) {
        console.error('Error getting admin leaderboard:', error);
        return [];
      }

      return leaderboardData.map((entry: any) => ({
        ...entry,
        achieved_targets: []
      }));
    } catch (error) {
      console.error('Error getting admin leaderboard:', error);
      return [];
    }
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getRewardIcon(iconType: string): string {
    const icons: Record<string, string> = {
      plane: '✈️',
      car: '🚗',
      home: '🏠',
      money: '💰',
      gift: '🎁',
      trophy: '🏆',
      star: '⭐',
      vacation: '🏖️',
      diamond: '💎',
      crown: '👑',
      medal: '🏅',
      rocket: '🚀'
    };
    return icons[iconType] || '🎯';
  }

  isTargetAchieved(turnover: number, targetAmount: number): boolean {
    return turnover >= targetAmount;
  }

  getProgressPercent(currentTurnover: number, targets: BonusEventTarget[]): number {
    const nextTarget = targets.find(t => currentTurnover < t.target_amount);
    
    if (!nextTarget) return 100;
    
    const prevTarget = targets
      .filter(t => t.target_amount < nextTarget.target_amount)
      .sort((a, b) => b.target_amount - a.target_amount)[0];
    
    const startAmount = prevTarget?.target_amount || 0;
    const progress = ((currentTurnover - startAmount) / (nextTarget.target_amount - startAmount)) * 100;
    
    return Math.max(0, Math.min(100, progress));
  }

  getNextTarget(currentTurnover: number, targets: BonusEventTarget[]): BonusEventTarget | null {
    return targets.find(t => currentTurnover < t.target_amount) || null;
  }

  getAchievedTargets(turnover: number, targets: BonusEventTarget[]): BonusEventTarget[] {
    return targets.filter(t => turnover >= t.target_amount);
  }

  formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getDaysRemaining(endDate: string): number {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }
}

export const bonusEventService = new BonusEventService();