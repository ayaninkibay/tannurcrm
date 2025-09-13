import { supabase } from '@/lib/supabase/client';
import type { 
  TeamPurchase, 
  TeamPurchaseMember,
  TeamPurchaseView,
  TeamPurchaseMemberView,
  User 
} from '@/types';

class TeamPurchaseService {
  /**
   * Получить все командные закупки (суммы уже правильные в БД!)
   */
  async getAllPurchases(
    filter?: {
      status?: string;
      initiatorId?: string;
      userId?: string;
    }
  ): Promise<TeamPurchase[]> {
    // Просто читаем данные - триггеры уже обновили суммы!
    let query = supabase
      .from('team_purchases')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter?.status) {
      query = query.eq('status', filter.status);
    }
    if (filter?.initiatorId) {
      query = query.eq('initiator_id', filter.initiatorId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    // Больше не нужно считать - суммы уже правильные!
    return data || [];
  }

  /**
   * Получить закупки пользователя (суммы из БД)
   */
  async getUserPurchases(userId: string): Promise<TeamPurchase[]> {
    try {
      // Получаем участия пользователя
      const { data: memberRecords } = await supabase
        .from('team_purchase_members')
        .select('team_purchase_id, status')
        .eq('user_id', userId);

      if (!memberRecords || memberRecords.length === 0) {
        return [];
      }

      // Фильтруем активные участия
      const activeMemberships = memberRecords.filter(
        m => m.status !== 'left' && m.status !== 'removed'
      );

      if (activeMemberships.length === 0) {
        return [];
      }

      const purchaseIds = activeMemberships.map(m => m.team_purchase_id);

      // Получаем закупки - суммы уже правильные!
      const { data: purchases, error } = await supabase
        .from('team_purchases')
        .select('*')
        .in('id', purchaseIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching purchases:', error);
        return [];
      }

      // Возвращаем как есть - триггеры обеспечивают правильные суммы
      return purchases || [];
    } catch (error) {
      console.error('Error in getUserPurchases:', error);
      return [];
    }
  }

  /**
   * Получить актуальную сумму закупки (для совместимости)
   */
  async getTeamPurchaseTotal(purchaseId: string): Promise<number> {
    // Просто читаем из БД - триггеры уже обновили
    const { data, error } = await supabase
      .from('team_purchases')
      .select('paid_amount')
      .eq('id', purchaseId)
      .single();

    if (error) {
      console.error('Error fetching total:', error);
      return 0;
    }

    return data?.paid_amount || 0;
  }

  /**
   * Получить детальную информацию о закупке
   */
  async getPurchaseDetails(purchaseId: string): Promise<TeamPurchaseView> {
    // Получаем закупку - суммы уже правильные благодаря триггерам!
    const { data: purchase, error: purchaseError } = await supabase
      .from('team_purchases')
      .select('*')
      .eq('id', purchaseId)
      .single();

    if (purchaseError) throw new Error(purchaseError.message);

    // Больше не нужно пересчитывать суммы - используем из БД!

    // Получаем организатора
    const { data: initiator } = await supabase
      .from('users')
      .select('*')
      .eq('id', purchase.initiator_id)
      .single();

    // Получаем всех участников
    const { data: allMembers } = await supabase
      .from('team_purchase_members')
      .select(`
        *,
        user:users(*)
      `)
      .eq('team_purchase_id', purchaseId);

    // Фильтруем активных участников
    const members = allMembers?.filter(
      m => m.status !== 'left' && m.status !== 'removed'
    ) || [];

    // Формируем view для участников
    const memberViews: TeamPurchaseMemberView[] = [];
    
    for (const member of members) {
      // Получаем корзину участника
      const { data: cartItems } = await supabase
        .from('team_purchase_carts')
        .select(`
          *,
          product:products(*)
        `)
        .eq('team_purchase_id', purchaseId)
        .eq('user_id', member.user_id)
        .eq('status', 'active');

      // Получаем заказ участника если есть
      const { data: orders } = await supabase
        .from('team_purchase_orders')
        .select('*')
        .eq('team_purchase_id', purchaseId)
        .eq('member_id', member.id)
        .eq('payment_status', 'paid');

      const order = orders && orders.length > 0 ? orders[0] : null;

      memberViews.push({
        member,
        user: member.user,
        cartItems: cartItems || [],
        order,
        isOrganizer: member.role === 'organizer',
        hasPaid: member.status === 'purchased'
      });
    }

    // Расчет дополнительных данных
    const totalMembers = memberViews.length;
    const totalPaid = purchase.paid_amount; // Используем из БД!
    const progress = purchase.target_amount > 0 
      ? Math.min(100, (totalPaid / purchase.target_amount) * 100)
      : 0;
    
    // Дней до дедлайна
    let daysLeft = 0;
    if (purchase.deadline) {
      const deadline = new Date(purchase.deadline);
      const today = new Date();
      const diffTime = deadline.getTime() - today.getTime();
      daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Проверки возможности действий
    const canStart = 
      purchase.status === 'forming' && 
      purchase.collected_amount >= 300000 && // Используем из БД!
      totalMembers >= 2;

    const canComplete = 
      purchase.status === 'confirming' &&
      totalPaid >= purchase.target_amount;

    return {
      purchase, // Используем как есть из БД
      initiator: initiator!,
      members: memberViews,
      totalMembers,
      totalPaid,
      progress,
      daysLeft,
      canStart,
      canComplete
    };
  }

  /**
   * Получить статистику пользователя
   */
  async getUserStats(userId: string): Promise<{
    totalPurchases: number;
    activePurchases: number;
    completedPurchases: number;
    totalSaved: number;
    totalEarned: number;
  }> {
    // Получаем все записи участника
    const { data: allMembers } = await supabase
      .from('team_purchase_members')
      .select(`
        *,
        team_purchase:team_purchases(*)
      `)
      .eq('user_id', userId);

    // Фильтруем активные на клиенте
    const members = allMembers?.filter(
      m => m.status !== 'left' && m.status !== 'removed'
    ) || [];

    const totalPurchases = members.length;
    const activePurchases = members.filter(m => 
      ['forming', 'active', 'purchasing'].includes(m.team_purchase.status)
    ).length;
    const completedPurchases = members.filter(m => 
      m.team_purchase.status === 'completed'
    ).length;

    // Считаем экономию
    let totalSaved = 0;
    for (const member of members) {
      if (member.status === 'purchased') {
        totalSaved += member.contribution_actual * 0.25;
      }
    }

    // Получаем заработанные бонусы
    const { data: bonuses } = await supabase
      .from('bonus_payouts')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'team_difference');

    const totalEarned = bonuses?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0;

    return {
      totalPurchases,
      activePurchases,
      completedPurchases,
      totalSaved,
      totalEarned
    };
  }

  /**
   * Пригласить участника по email
   */
  async inviteByEmail(
    purchaseId: string,
    email: string,
    inviterId: string
  ): Promise<void> {
    console.log(`Inviting ${email} to purchase ${purchaseId} by ${inviterId}`);
    // TODO: Интеграция с email сервисом
  }

  /**
   * Получить ссылку для приглашения
   */
  async getInviteLink(purchaseId: string): Promise<string> {
    const { data } = await supabase
      .from('team_purchases')
      .select('invite_code')
      .eq('id', purchaseId)
      .single();

    if (!data) throw new Error('Закупка не найдена');

    const baseUrl = window.location.origin;
    return `${baseUrl}/team-purchase/join/${data.invite_code}`;
  }
}

export const teamPurchaseService = new TeamPurchaseService();