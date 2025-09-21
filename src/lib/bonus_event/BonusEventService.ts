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
  achieved_targets: string[]; // IDs целей, которые достигнуты
}

export class BonusEventService {
  private supabase = supabase;

  // Создать новое бонусное событие с целями
  async createBonusEvent(event: BonusEvent, targets: BonusEventTarget[]): Promise<BonusEvent> {
    try {
      // Создаем событие
      const { data: eventData, error: eventError } = await this.supabase
        .from('bonus_events')
        .insert({
          title: event.title,
          description: event.description,
          start_date: event.start_date,
          end_date: event.end_date,
          is_active: true,
          created_by: (await this.supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Создаем цели для события
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

  // Получить активные бонусные события
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
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Сортируем цели по sort_order
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
      // ВРЕМЕННАЯ ОТЛАДКА для конкретного пользователя
      const isTestUser = userId === '33542896-acc2-41a6-ade3-1b6fbac7444f';
      if (isTestUser) {
        console.log('=== TESTING USER: Аян Инкибай ===');
      }

      // Получаем данные пользователя
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('id, first_name, last_name, email, phone')
        .eq('id', userId)
        .single();

      if (userError || !userData) return null;

      // Если указан eventId, проверяем период события
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

      // Получаем оплаченные заказы из обеих таблиц
      const queries = [];

      // Обычные заказы
      let ordersQuery = this.supabase
        .from('orders')
        .select('total_amount, created_at')
        .eq('user_id', userId)
        .eq('payment_status', 'paid');

      // Командные заказы - используем правильное название поля
      let teamOrdersQuery = this.supabase
        .from('team_purchase_orders')
        .select('*') // Выбираем все поля, чтобы увидеть структуру
        .eq('user_id', userId)
        .eq('payment_status', 'paid');

      // Применяем фильтр по датам если есть
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
      
      // ОТЛАДКА для тестового пользователя
      if (isTestUser) {
        console.log('Orders result:', ordersResult.data);
        console.log('Team orders result:', teamOrdersResult.data);
        console.log('Team orders error:', teamOrdersResult.error);
      }
      
      // Игнорируем ошибку team_purchase_orders если таблица не существует или пустая
      if (teamOrdersResult.error) {
        console.warn('Team purchase orders error (ignoring):', teamOrdersResult.error);
      }

      // Объединяем все заказы
      const allOrders = [...(ordersResult.data || [])];
      
      // Добавляем командные заказы если они есть
      if (teamOrdersResult.data && teamOrdersResult.data.length > 0) {
        console.log('[getUserProgress] Team orders found:', teamOrdersResult.data.length);
        teamOrdersResult.data.forEach((order: any) => {
          // В team_purchase_orders поле называется order_amount!
          const amount = order.order_amount || 0;
          console.log('[getUserProgress] Team order amount:', amount);
          allOrders.push({
            total_amount: amount,
            created_at: order.created_at
          });
        });
      } else {
        console.log('[getUserProgress] No team orders found');
      }

      // Считаем статистику
      let totalTurnover = 0;
      let lastOrderDate: string | null = null;

      allOrders.forEach((order, index) => {
        const amount = order.total_amount || 0;
        totalTurnover += amount;
        if (isTestUser) {
          console.log(`Order ${index + 1}: amount=${amount}, running total=${totalTurnover}`);
        }
        if (!lastOrderDate || new Date(order.created_at) > new Date(lastOrderDate)) {
          lastOrderDate = order.created_at;
        }
      });

      if (isTestUser) {
        console.log('=== FINAL RESULT for Аян Инкибай ===');
        console.log('Total turnover:', totalTurnover);
        console.log('Total orders:', allOrders.length);
        console.log('Orders breakdown:', allOrders);
        console.log('==================================');
      }

      // Определяем достигнутые цели
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
      console.log('[getEventLeaderboard] Starting for event:', eventId, 'limit:', limit);
      
      // Получаем событие для определения периода
      const event = await this.getBonusEventById(eventId);
      if (!event) {
        console.log('[getEventLeaderboard] Event not found');
        return [];
      }
      console.log('[getEventLeaderboard] Event period:', event.start_date, 'to', event.end_date);

      // Получаем всех пользователей
      const { data: users, error: usersError } = await this.supabase
        .from('users')
        .select('id, first_name, last_name, email, phone, role')
        .in('role', ['dealer', 'admin']); // Только дилеры и админы

      if (usersError || !users) {
        console.error('[getEventLeaderboard] Error loading users:', usersError);
        return [];
      }
      console.log('[getEventLeaderboard] Found users:', users.length);

      // Получаем прогресс для каждого пользователя
      console.log('[getEventLeaderboard] Loading progress for each user...');
      const progressPromises = users.map(user => 
        this.getUserProgress(user.id, eventId)
      );

      const allProgress = await Promise.all(progressPromises);
      console.log('[getEventLeaderboard] Progress loaded for all users');

      // Фильтруем null значения и сортируем по товарообороту
      const validProgress = allProgress
        .filter(p => p !== null && p.total_turnover > 0)
        .sort((a, b) => b!.total_turnover - a!.total_turnover)
        .slice(0, limit);

      console.log('[getEventLeaderboard] Valid progress entries:', validProgress.length);
      console.log('[getEventLeaderboard] Top user turnover:', validProgress[0]?.total_turnover || 0);
      
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

// Экспортируем singleton
export const bonusEventService = new BonusEventService();