// src/services/dealer_turnover_service.ts

import { supabase } from '@/lib/supabase/client';
import { getSupabaseServer } from '@/lib/supabase/server';
import type { MonthValue } from '@/components/TurnoverChart';

export class DealerTurnoverService {
  
  // Получение личного товарооборота
  static async getPersonalTurnover(
    userId: string, 
    isServer: boolean = false
  ): Promise<MonthValue[]> {
    try {
      const client = isServer ? await getSupabaseServer() : supabase;
      
      console.log('Getting personal turnover for user:', userId);
      
      // Получаем все оплаченные заказы пользователя
      const { data: orders, error } = await client
        .from('orders')
        .select(`
          id,
          created_at,
          total_amount,
          payment_status,
          order_status,
          user_id,
          order_items!inner(
            id,
            quantity,
            price,
            total
          )
        `)
        .eq('user_id', userId)
        .eq('payment_status', 'paid');

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      console.log('Fetched orders:', orders?.length || 0);

      if (!orders || orders.length === 0) {
        return [];
      }

      // Группируем по месяцам
      const monthlyData: { [key: string]: number } = {};
      
      orders.forEach(order => {
        const date = new Date(order.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        // Используем total_amount из заказа или суммируем order_items
        let orderTotal = 0;
        
        if (order.total_amount && order.total_amount > 0) {
          orderTotal = order.total_amount;
        } else if (Array.isArray(order.order_items) && order.order_items.length > 0) {
          orderTotal = order.order_items.reduce(
            (sum: number, item: any) => sum + (item.total || 0), 
            0
          );
        }
        
        console.log(`Order ${order.id}: date=${order.created_at}, total=${orderTotal}`);
        
        if (orderTotal > 0) {
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = 0;
          }
          monthlyData[monthKey] += orderTotal;
        }
      });

      console.log('Monthly data:', monthlyData);

      // Преобразуем в массив MonthValue
      const chartData: MonthValue[] = Object.entries(monthlyData)
        .map(([monthKey, value]) => {
          const [year, month] = monthKey.split('-');
          return {
            date: new Date(parseInt(year), parseInt(month) - 1, 1),
            value: value
          };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      console.log('Chart data:', chartData);
      return chartData;
      
    } catch (error) {
      console.error('Error in getPersonalTurnover:', error);
      return [];
    }
  }

  // Получение командного товарооборота (из team_purchases)
  static async getTeamTurnover(
    userId: string,
    isServer: boolean = false
  ): Promise<MonthValue[]> {
    try {
      const client = isServer ? await getSupabaseServer() : supabase;
      
      console.log('Getting team turnover for user:', userId);
      
      // Получаем завершенные командные закупки где пользователь - организатор
      const { data: purchases, error } = await client
        .from('team_purchases')
        .select('id, completed_at, paid_amount, status')
        .eq('initiator_id', userId)
        .eq('status', 'completed')
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: true });

      if (error) {
        console.error('Error fetching team purchases:', error);
        throw error;
      }

      console.log('Team purchases found:', purchases?.length || 0);

      if (!purchases || purchases.length === 0) {
        return [];
      }

      // Группируем по месяцам
      const monthlyData: { [key: string]: number } = {};
      
      purchases.forEach(purchase => {
        if (purchase.completed_at && purchase.paid_amount) {
          const date = new Date(purchase.completed_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = 0;
          }
          monthlyData[monthKey] += purchase.paid_amount;
        }
      });

      // Преобразуем в массив MonthValue
      const chartData: MonthValue[] = Object.entries(monthlyData)
        .map(([monthKey, value]) => {
          const [year, month] = monthKey.split('-');
          return {
            date: new Date(parseInt(year), parseInt(month) - 1, 1),
            value: value
          };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      console.log('Team chart data:', chartData);
      return chartData;
      
    } catch (error) {
      console.error('Error in getTeamTurnover:', error);
      return [];
    }
  }

  // Получение статистики по бонусам
  static async getBonusStats(
    userId: string,
    isServer: boolean = false
  ): Promise<{
    personal: number;
    team: number;
    subscription: number;
  }> {
    try {
      const client = isServer ? await getSupabaseServer() : supabase;
      
      // Получаем бонусы
      const { data: bonuses, error: bonusError } = await client
        .from('bonus_payots')
        .select('type, amount, status')
        .eq('user_id', userId)
        .in('status', ['assembled', 'paid']);

      if (bonusError) {
        console.error('Error fetching bonuses:', bonusError);
      }

      // Получаем выплаты за подписки
      const { data: subscriptions, error: subError } = await client
        .from('subscription_payments')
        .select('amount, status')
        .eq('user_id', userId)
        .eq('status', 'paid');

      if (subError) {
        console.error('Error fetching subscriptions:', subError);
      }

      // Суммируем по типам
      const personalBonus = bonuses
        ?.filter(b => b.type === 'personal')
        .reduce((sum, b) => sum + (b.amount || 0), 0) || 0;

      const teamBonus = bonuses
        ?.filter(b => b.type === 'team_difference')
        .reduce((sum, b) => sum + (b.amount || 0), 0) || 0;

      const subscriptionPayments = subscriptions
        ?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0;

      return {
        personal: personalBonus,
        team: teamBonus,
        subscription: subscriptionPayments
      };
    } catch (error) {
      console.error('Error in getBonusStats:', error);
      return { personal: 0, team: 0, subscription: 0 };
    }
  }

  // Получение полной статистики для дашборда
  static async getDashboardStats(
    userId: string,
    isServer: boolean = false
  ) {
    try {
      console.log('Getting dashboard stats for user:', userId);
      
      const [personal, team, bonuses] = await Promise.all([
        this.getPersonalTurnover(userId, isServer),
        this.getTeamTurnover(userId, isServer),
        this.getBonusStats(userId, isServer)
      ]);

      // Считаем общие суммы
      const personalTotal = personal.reduce((sum, m) => sum + m.value, 0);
      const teamTotal = team.reduce((sum, m) => sum + m.value, 0);

      const result = {
        totals: {
          personalTurnover: personalTotal,
          teamTurnover: teamTotal,
          personalBonus: bonuses.personal,
          teamBonus: bonuses.team,
          subscriptionPayments: bonuses.subscription
        },
        charts: {
          personal,
          team
        }
      };

      console.log('Dashboard stats result:', result);
      return result;
      
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      throw error;
    }
  }
}