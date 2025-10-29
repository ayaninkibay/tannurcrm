import { supabase } from '@/lib/supabase/client';

export interface Event {
  id: string;
  created_at: string | null;
  updated_at: string | null;
  title: string;
  description?: string | null;
  short_description?: string | null;
  image_url?: string | null;
  banner_url?: string | null;
  gallery?: string[] | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: string | null;
  goals?: any[] | null;
  rewards?: any[] | null;
  conditions?: any[] | null;
  badge_color?: string | null;
  badge_icon?: string | null;Й
  priority?: number | null;
  is_featured?: boolean | null;
  tags?: string[] | null;
  created_by?: string | null;
  event_type?: string | null;
  target_amount?: number | null;
  reward?: string | null;
  reward_description?: string | null;
  max_participants?: number | null;
}

export interface EventWithStats extends Event {
  participants_count: number;
  achieved_count: number;
  total_turnover: number;
}

export class EventsService {
  // Получить все события со статистикой
 // Обновленный метод getEventsWithStats в lib/events/EventService.ts
async getEventsWithStats(): Promise<EventWithStats[]> {
  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    if (!events || events.length === 0) {
      console.log('No events found in database');
      return [];
    }

    // Получаем всех дилеров
    const { data: dealers } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'dealer');

    // Получаем все оплаченные заказы
    const { data: orders } = await supabase
      .from('orders')
      .select('user_id, total_amount')
      .eq('payment_status', 'paid');

    // Подсчитываем товарооборот для КАЖДОГО дилера отдельно
    const dealerTurnovers = new Map<string, number>();
    
    if (orders) {
      orders.forEach(order => {
        const current = dealerTurnovers.get(order.user_id) || 0;
        dealerTurnovers.set(order.user_id, current + (order.total_amount || 0));
      });
    }

    // Обрабатываем каждое событие
    const eventsWithStats = events.map((event: any) => {
      const targetAmount = Number(event.target_amount) || 0;
      let achievedCount = 0;
      let totalTurnoverSum = 0; // Сумма товарооборотов ВСЕХ участников
      let participantsWithTurnover = 0; // Количество участников с товарооборотом > 0

      // Считаем, сколько дилеров достигли цели
      dealerTurnovers.forEach((turnover, userId) => {
        if (turnover > 0) {
          participantsWithTurnover++;
          totalTurnoverSum += turnover;
        }
        if (targetAmount > 0 && turnover >= targetAmount) {
          achievedCount++;
        }
      });

      const eventWithStats: EventWithStats = {
        ...event,
        participants_count: dealers?.length || 0, // Всего дилеров в системе
        achieved_count: achievedCount, // Сколько достигли цели
        total_turnover: totalTurnoverSum // Сумма товарооборотов всех дилеров
      };

      console.log('Event stats:', {
        title: event.title,
        target: targetAmount,
        participantsCount: dealers?.length || 0,
        achievedCount: achievedCount,
        totalTurnover: totalTurnoverSum
      });

      return eventWithStats;
    });

    return eventsWithStats;
  } catch (error) {
    console.error('Error in getEventsWithStats:', error);
    return [];
  }
}

  // Создать новое событие
  async createEvent(eventData: Partial<Event>) {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const insertData: any = {
        title: eventData.title || '',
        description: eventData.description,
        short_description: eventData.reward,
        event_type: eventData.event_type || 'turnover',
        target_amount: eventData.target_amount || 0,
        reward: eventData.reward,
        reward_description: eventData.reward_description,
        start_date: eventData.start_date || new Date().toISOString().split('T')[0],
        end_date: eventData.end_date || '2024-12-31',
        max_participants: eventData.max_participants,
        status: eventData.status || 'active',
        is_featured: true,
        priority: 1,
        created_by: user?.user?.id
      };

      if (eventData.reward) {
        insertData.rewards = [eventData.reward];
      }
      if (eventData.reward_description) {
        insertData.conditions = [eventData.reward_description];
      }

      const { data, error } = await supabase
        .from('events')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  // Обновить событие
  async updateEvent(id: string, updates: Partial<Event>) {
    try {
      // Убираем null значения из updates
      const cleanUpdates: any = {};
      Object.keys(updates).forEach(key => {
        const value = (updates as any)[key];
        if (value !== null) {
          cleanUpdates[key] = value;
        }
      });

      cleanUpdates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('events')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  // Удалить событие
  async deleteEvent(id: string) {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }

  // Получить участие дилера в событиях
  async getDealerEventParticipation(userId: string) {
    try {
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'active');

      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('user_id', userId)
        .eq('payment_status', 'paid');

      const totalTurnover = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      const participation = events?.map((event: any) => ({
        event_id: event.id,
        user_id: userId,
        current_turnover: totalTurnover,
        is_achieved: totalTurnover >= (Number(event.target_amount) || 0),
        event
      })) || [];

      return participation;
    } catch (error) {
      console.error('Error fetching dealer participation:', error);
      return [];
    }
  }
}

export const eventsService = new EventsService();