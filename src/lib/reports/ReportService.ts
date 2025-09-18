import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';

// Типы для отчетов
export interface SubscriptionPaymentReport {
  id: string;
  user_id: string | null;
  amount: number | null;
  paid_at: string;
  method: string | null;
  status: string | null;
  sponsor_bonus: number | null;
  ceo_bonus: number | null;
  parent_id: string | null;
  parent_info?: {
    id: string;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
  };
  notes: string | null;
}

export interface OrderReport {
  id: string;
  order_number: string | null;
  total_amount: number | null;
  order_status: Database["public"]["Enums"]["order_status"] | null;
  payment_status: Database["public"]["Enums"]["payment_status"] | null;
  created_at: string;
  paid_at: string | null;
  delivery_address: string | null;
  items: OrderItemDetail[];
}

export interface OrderItemDetail {
  id: string;
  product_id: string | null;
  quantity: number | null;
  price: number | null;
  total: number | null;
  product?: {
    name: string | null;
    category: string | null;
    image_url: string | null;
  };
}

export interface TeamPurchaseReport {
  id: string;
  team_purchase_id: string | null;
  user_id: string | null;
  status: string | null;
  role: string | null;
  contribution_target: number | null;
  contribution_actual: number | null;
  joined_at: string | null;
  purchased_at: string | null;
  team_purchase?: {
    title: string;
    status: string | null;
    target_amount: number;
    collected_amount: number | null;
    paid_amount: number | null;
    initiator_id: string;
  };
  bonuses?: {
    total_earned: number;
    personal_bonus: number;
    team_bonus: number;
  };
}

export interface UserReportSummary {
  user_id: string;
  user_info: {
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    role: string | null;
    personal_turnover: number | null;
    personal_level: number | null;
  };
  subscription_payments: {
    total: number;
    count: number;
    last_payment_date: string | null;
  };
  orders: {
    total_amount: number;
    order_count: number;
    item_count: number;
    last_order_date: string | null;
  };
  team_purchases: {
    total_contribution: number;
    purchase_count: number;
    active_purchases: number;
    completed_purchases: number;
  };
  bonuses: {
    total_earned: number;
    total_paid: number;
    pending: number;
  };
}

class ReportService {
  /**
   * Получить отчет по subscription payments для пользователя
   */
async getSubscriptionPaymentsReport(userId: string): Promise<SubscriptionPaymentReport[]> {
  try {
    // Получаем платежи где user_id совпадает
    const { data: payments, error } = await supabase
      .from('subscription_payments')
      .select('*')
      .eq('user_id', userId)
      .order('paid_at', { ascending: false });

    if (error) throw error;

    // Для каждого платежа получаем информацию о parent
    const paymentsWithParent: SubscriptionPaymentReport[] = [];
    
    for (const payment of payments || []) {
      let parentInfo = null;
      
      if (payment.parent_id) {
        const { data: parent } = await supabase
          .from('users')
          .select('id, email, first_name, last_name')
          .eq('id', payment.parent_id)
          .single();
        
        parentInfo = parent;
      }
      
      paymentsWithParent.push({
        ...payment,
        parent_info: parentInfo
      });
    }

    // Получаем также платежи где parent_id совпадает (спонсорские)
    const { data: sponsorPayments, error: sponsorError } = await supabase
      .from('subscription_payments')
      .select('*')
      .eq('parent_id', userId)
      .order('paid_at', { ascending: false });

    if (!sponsorError && sponsorPayments) {
      for (const payment of sponsorPayments) {
        const { data: user } = await supabase
          .from('users')
          .select('id, email, first_name, last_name')
          .eq('id', payment.user_id)
          .single();
        
        paymentsWithParent.push({
          ...payment,
          parent_info: user,
          is_sponsor_payment: true // Добавляем флаг для различия
        });
      }
    }

    return paymentsWithParent;
  } catch (error) {
    console.error('Error in getSubscriptionPaymentsReport:', error);
    return [];
  }
}

  /**
   * Получить детальный отчет по заказам пользователя
   */
async getOrdersReport(userId: string): Promise<OrderReport[]> {
  try {
    // Получаем заказы пользователя
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;

    const orderReports: OrderReport[] = [];

    // Для каждого заказа получаем детали
    for (const order of orders || []) {
      // ИСПРАВЛЕНО: Используем правильное имя связи из вашей схемы
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          product:products!fk_order_items_product(
            name,
            category,
            image_url
          )
        `)
        .eq('order_id', order.id);

      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
        // Можно попробовать альтернативный синтаксис
        const { data: itemsAlt, error: altError } = await supabase
          .from('order_items')
          .select(`
            *,
            products(
              name,
              category,
              image_url
            )
          `)
          .eq('order_id', order.id);

        if (altError) {
          console.error('Alternative query also failed:', altError);
          continue;
        }

        orderReports.push({
          ...order,
          items: (itemsAlt || []).map(item => ({
            ...item,
            product: item.products
          }))
        });
      } else {
        orderReports.push({
          ...order,
          items: items || []
        });
      }
    }

    return orderReports;
  } catch (error) {
    console.error('Error in getOrdersReport:', error);
    return [];
  }
}

  /**
   * Получить отчет по командным закупкам пользователя
   */
  async getTeamPurchasesReport(userId: string): Promise<TeamPurchaseReport[]> {
  try {
    // Получаем все участия в командных закупках
    const { data: memberships, error } = await supabase
      .from('team_purchase_members')
      .select(`
        *,
        team_purchase:team_purchases!team_purchase_members_team_purchase_id_fkey(
          id,
          title,
          status,
          target_amount,
          collected_amount,
          paid_amount,
          initiator_id
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error with named relation, trying alternative:', error);
      
      // Альтернативный запрос без именованной связи
      const { data: altMemberships, error: altError } = await supabase
        .from('team_purchase_members')
        .select(`
          *,
          team_purchases(
            id,
            title,
            status,
            target_amount,
            collected_amount,
            paid_amount,
            initiator_id
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (altError) throw altError;

      const reports: TeamPurchaseReport[] = [];

      // Для каждого участия получаем бонусы
      for (const membership of altMemberships || []) {
        // Получаем бонусы для этой закупки
        const { data: bonuses } = await supabase
          .from('team_purchase_bonuses')
          .select('bonus_amount, received_percent')
          .eq('team_purchase_id', membership.team_purchase_id)
          .eq('beneficiary_id', userId);

        const totalEarned = bonuses?.reduce((sum, b) => sum + (b.bonus_amount || 0), 0) || 0;
        const personalBonus = bonuses?.find(b => b.received_percent)?.bonus_amount || 0;
        const teamBonus = totalEarned - personalBonus;

        reports.push({
          ...membership,
          team_purchase: membership.team_purchases,
          bonuses: {
            total_earned: totalEarned,
            personal_bonus: personalBonus,
            team_bonus: teamBonus
          }
        });
      }

      return reports;
    }

    const reports: TeamPurchaseReport[] = [];

    // Для каждого участия получаем бонусы
    for (const membership of memberships || []) {
      // Получаем бонусы для этой закупки
      const { data: bonuses } = await supabase
        .from('team_purchase_bonuses')
        .select('bonus_amount, received_percent')
        .eq('team_purchase_id', membership.team_purchase_id)
        .eq('beneficiary_id', userId);

      const totalEarned = bonuses?.reduce((sum, b) => sum + (b.bonus_amount || 0), 0) || 0;
      const personalBonus = bonuses?.find(b => b.received_percent)?.bonus_amount || 0;
      const teamBonus = totalEarned - personalBonus;

      reports.push({
        ...membership,
        bonuses: {
          total_earned: totalEarned,
          personal_bonus: personalBonus,
          team_bonus: teamBonus
        }
      });
    }

    return reports;
  } catch (error) {
    console.error('Error in getTeamPurchasesReport:', error);
    return [];
  }
}

  /**
   * Получить сводный отчет по пользователю
   */
  async getUserSummaryReport(userId: string): Promise<UserReportSummary | null> {
    try {
      // Получаем информацию о пользователе
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        console.error('User not found:', userError);
        return null;
      }

      // Получаем subscription payments
      const subscriptionPayments = await this.getSubscriptionPaymentsReport(userId);
      const subscriptionTotal = subscriptionPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const lastPaymentDate = subscriptionPayments[0]?.paid_at || null;

      // Получаем orders
      const orders = await this.getOrdersReport(userId);
      const ordersTotal = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
      const itemsCount = orders.reduce((sum, o) => sum + o.items.length, 0);
      const lastOrderDate = orders[0]?.created_at || null;

      // Получаем team purchases
      const teamPurchases = await this.getTeamPurchasesReport(userId);
      const totalContribution = teamPurchases.reduce((sum, tp) => 
        sum + (tp.contribution_actual || 0), 0
      );
      const activePurchases = teamPurchases.filter(tp => 
        ['forming', 'active', 'purchasing'].includes(tp.team_purchase?.status || '')
      ).length;
      const completedPurchases = teamPurchases.filter(tp => 
        tp.team_purchase?.status === 'completed'
      ).length;

      // Получаем бонусы (исправлена таблица на bonus_payots согласно схеме)
      const { data: bonusPayouts } = await supabase
        .from('bonus_payots')
        .select('amount, status')
        .eq('user_id', userId);

      const totalBonusEarned = bonusPayouts?.reduce((sum, b) => 
        sum + (b.amount || 0), 0
      ) || 0;
      const totalBonusPaid = bonusPayouts?.filter(b => 
        b.status === 'paid'
      ).reduce((sum, b) => sum + (b.amount || 0), 0) || 0;
      const pendingBonus = totalBonusEarned - totalBonusPaid;

      return {
        user_id: userId,
        user_info: {
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          personal_turnover: user.personal_turnover,
          personal_level: user.personal_level
        },
        subscription_payments: {
          total: subscriptionTotal,
          count: subscriptionPayments.length,
          last_payment_date: lastPaymentDate
        },
        orders: {
          total_amount: ordersTotal,
          order_count: orders.length,
          item_count: itemsCount,
          last_order_date: lastOrderDate
        },
        team_purchases: {
          total_contribution: totalContribution,
          purchase_count: teamPurchases.length,
          active_purchases: activePurchases,
          completed_purchases: completedPurchases
        },
        bonuses: {
          total_earned: totalBonusEarned,
          total_paid: totalBonusPaid,
          pending: pendingBonus
        }
      };
    } catch (error) {
      console.error('Error in getUserSummaryReport:', error);
      return null;
    }
  }

  /**
   * Экспорт отчета в CSV
   */
  exportToCSV(data: any[], filename: string): void {
    const csvContent = this.convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return value.toString().includes(',') ? `"${value}"` : value;
      }).join(',');
    });
    
    return [csvHeaders, ...csvRows].join('\n');
  }
}

export const reportService = new ReportService();