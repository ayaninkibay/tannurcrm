import { supabase } from '@/lib/supabase/client';
import { TEAM_PURCHASE_RULES } from '@/lib/team-purchase/BusinessRules';
import type { TeamPurchase } from '@/types';

class TeamPurchaseLifecycleService {
  /**
   * Генерация уникального кода приглашения
   */
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Создание новой командной закупки
   */
  async createTeamPurchase(
    initiatorId: string,
    data: {
      title: string;
      description?: string;
      targetAmount: number;
      deadline?: string;
    }
  ): Promise<TeamPurchase> {
    try {
      const inviteCode = this.generateInviteCode();

      // Обрабатываем пустые строки - превращаем в null
      const processedDeadline = data.deadline && data.deadline.trim() !== '' 
        ? data.deadline 
        : null;
      
      const processedDescription = data.description && data.description.trim() !== ''
        ? data.description
        : null;

      // Создаем закупку
      const { data: purchase, error: purchaseError } = await supabase
        .from('team_purchases')
        .insert({
          title: data.title,
          description: processedDescription,
          initiator_id: initiatorId,
          target_amount: data.targetAmount,
          collected_amount: 0,
          paid_amount: 0,
          deadline: processedDeadline,
          invite_code: inviteCode,
          status: 'forming',
          bonuses_calculated: false,
          bonuses_approved: false
        })
        .select()
        .single();

      if (purchaseError) {
        throw new Error(`Ошибка создания закупки: ${purchaseError.message}`);
      }

      // Добавляем организатора как первого участника
      const { error: memberError } = await supabase
        .from('team_purchase_members')
        .insert({
          team_purchase_id: purchase.id,
          user_id: initiatorId,
          role: 'organizer',
          status: 'accepted',
          contribution_target: 0,
          contribution_actual: 0,
          cart_total: 0,
          joined_at: new Date().toISOString()
        });

      if (memberError) {
        // Откатываем создание закупки при ошибке
        await supabase
          .from('team_purchases')
          .delete()
          .eq('id', purchase.id);
        throw new Error('Ошибка добавления организатора как участника');
      }

      return purchase;
    } catch (error) {
      console.error('Error in createTeamPurchase:', error);
      throw error;
    }
  }

  /**
   * Присоединение к закупке по коду приглашения (БЕЗ contribution_target)
   */
  async joinByInviteCode(
    inviteCode: string,
    userId: string
  ): Promise<{
    success: boolean;
    message: string;
    purchaseId?: string;
  }> {
    try {
      // Используем обновленную RPC функцию без contribution_target
      const { data, error } = await supabase
        .rpc('join_team_purchase', {
          p_invite_code: inviteCode,
          p_user_id: userId
        });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: data?.success || false,
        message: data?.message || 'Неизвестная ошибка',
        purchaseId: data?.purchase_id
      };
    } catch (error: any) {
      console.error('Error joining team purchase:', error);
      return {
        success: false,
        message: error.message || 'Ошибка присоединения к закупке'
      };
    }
  }

  /**
   * Запуск активной закупки
   */
  async startActivePurchase(purchaseId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const { data: purchase } = await supabase
        .from('team_purchases')
        .select('status')
        .eq('id', purchaseId)
        .single();

      if (!purchase) {
        return { success: false, message: 'Закупка не найдена' };
      }

      if (purchase.status !== 'forming') {
        return { success: false, message: 'Закупка уже активна или завершена' };
      }

      const { error } = await supabase
        .from('team_purchases')
        .update({
          status: 'active',
          started_at: new Date().toISOString()
        })
        .eq('id', purchaseId);

      if (error) throw error;

      await supabase
        .from('team_purchase_members')
        .update({ status: 'active' })
        .eq('team_purchase_id', purchaseId)
        .eq('status', 'accepted');

      return { 
        success: true, 
        message: 'Закупка активна! Участники могут добавлять товары и оформлять заказы' 
      };
    } catch (error) {
      console.error('Error starting purchase:', error);
      return { success: false, message: 'Ошибка запуска закупки' };
    }
  }

  /**
   * Переход в режим проверки финансистом
   */
  async moveToConfirming(purchaseId: string): Promise<{
    success: boolean;
    message: string;
    stats?: {
      totalAmount: number;
      paidMembers: number;
      totalMembers: number;
    }
  }> {
    try {
      const { data: purchase } = await supabase
        .from('team_purchases')
        .select(`
          *,
          team_purchase_members(
            status,
            contribution_actual,
            cart_total
          )
        `)
        .eq('id', purchaseId)
        .single();

      if (!purchase) {
        return { success: false, message: 'Закупка не найдена' };
      }

      if (purchase.status !== 'active') {
        return { success: false, message: 'Закупка должна быть активной' };
      }

      const paidMembers = purchase.team_purchase_members?.filter(
        (m: any) => m.status === 'purchased'
      ).length || 0;

      const totalMembers = purchase.team_purchase_members?.filter(
        (m: any) => m.status !== 'left' && m.status !== 'removed'
      ).length || 0;

      const totalAmount = purchase.team_purchase_members
        ?.filter((m: any) => m.status === 'purchased')
        .reduce((sum: number, m: any) => sum + (m.contribution_actual || 0), 0) || 0;

      if (paidMembers === 0) {
        return { 
          success: false, 
          message: 'Никто еще не оформил заказ' 
        };
      }

      const { error } = await supabase
        .from('team_purchases')
        .update({
          status: 'confirming',
          collected_amount: totalAmount
        })
        .eq('id', purchaseId);

      if (error) throw error;

      return {
        success: true,
        message: 'Закупка передана на проверку финансисту',
        stats: {
          totalAmount,
          paidMembers,
          totalMembers
        }
      };
    } catch (error) {
      console.error('Error moving to confirming:', error);
      return { success: false, message: 'Ошибка перехода к проверке' };
    }
  }

  /**
   * Финансист завершает закупку после проверки
   */
  async completeAfterVerification(
    purchaseId: string,
    verifierId: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const { data: purchase } = await supabase
        .from('team_purchases')
        .select('status')
        .eq('id', purchaseId)
        .single();

      if (purchase?.status !== 'confirming') {
        return { success: false, message: 'Закупка должна быть на проверке' };
      }

      const { error } = await supabase
        .from('team_purchases')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', purchaseId);

      if (error) throw error;

      await supabase.rpc('calculate_team_purchase_bonuses', {
        p_team_purchase_id: purchaseId
      });

      return {
        success: true,
        message: 'Закупка завершена! Бонусы рассчитаны'
      };
    } catch (error) {
      console.error('Error completing after verification:', error);
      return { success: false, message: 'Ошибка завершения закупки' };
    }
  }

  /**
   * Принудительный старт после подтверждения
   */
  async forceStartPurchase(purchaseId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const { data: purchase } = await supabase
        .from('team_purchases')
        .select('*, team_purchase_members(cart_total, status)')
        .eq('id', purchaseId)
        .single();

      const currentAmount = purchase.team_purchase_members
        ?.filter((m: any) => m.status !== 'left' && m.status !== 'removed')
        .reduce((sum: number, m: any) => sum + (m.cart_total || 0), 0) || 0;

      const { error } = await supabase
        .from('team_purchases')
        .update({
          status: 'active',
          started_at: new Date().toISOString(),
          collected_amount: currentAmount
        })
        .eq('id', purchaseId);

      if (error) throw error;

      await supabase
        .from('team_purchase_members')
        .update({ status: 'active' })
        .eq('team_purchase_id', purchaseId)
        .eq('status', 'accepted');

      return { 
        success: true, 
        message: 'Закупка запущена!' 
      };
    } catch (error) {
      return { success: false, message: 'Ошибка запуска' };
    }
  }

  /**
   * Выход участника из закупки
   */
  async leavePurchase(
    purchaseId: string,
    userId: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('team_purchase_members')
        .update({
          status: 'left',
          left_at: new Date().toISOString()
        })
        .eq('team_purchase_id', purchaseId)
        .eq('user_id', userId);

      if (error) throw error;

      await supabase
        .from('team_purchase_carts')
        .delete()
        .eq('team_purchase_id', purchaseId)
        .eq('user_id', userId);

      await this.recalculatePurchaseAmount(purchaseId);
    } catch (error) {
      console.error('Error leaving purchase:', error);
      throw error;
    }
  }

  /**
   * Завершение закупки
   */
  async completeTeamPurchase(purchaseId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const { data, error } = await supabase
        .rpc('complete_team_purchase', {
          p_purchase_id: purchaseId
        });

      if (error) throw error;

      return {
        success: data?.success || false,
        message: data?.message || 'Закупка завершена'
      };
    } catch (error: any) {
      console.error('Error completing purchase:', error);
      return {
        success: false,
        message: error.message || 'Ошибка завершения закупки'
      };
    }
  }

  /**
   * Подтверждение оплаты участником
   */
async confirmMemberPayment(
  purchaseId: string,
  memberId: string,
  orderId: string,
  amount: number,
  userId: string
): Promise<void> {
  try {
    // Получаем текущий contribution_actual
    const { data: currentMember } = await supabase
      .from('team_purchase_members')
      .select('contribution_actual')
      .eq('id', memberId)
      .single();
    
    const currentAmount = currentMember?.contribution_actual || 0;
    
    // ДОБАВЛЯЕМ к существующей сумме, а не перезаписываем!
    const { error: memberError } = await supabase
      .from('team_purchase_members')
      .update({
        status: 'purchased',
        contribution_actual: currentAmount + amount, // СУММИРУЕМ!
        purchased_at: new Date().toISOString()
      })
      .eq('id', memberId);

    if (memberError) throw memberError;

    // Создаем запись о заказе
    const { error: orderError } = await supabase
      .from('team_purchase_orders')
      .insert({
        team_purchase_id: purchaseId,
        member_id: memberId,
        order_id: orderId,
        order_amount: amount,
        payment_status: 'paid',
        user_id: userId
      });

    if (orderError) throw orderError;

  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
}

  /**
   * Обновление вклада участника (удалено contribution_target)
   */
  async updateMemberContribution(
    purchaseId: string,
    userId: string,
    newAmount: number
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('team_purchase_members')
        .update({
          cart_total: newAmount,
          updated_at: new Date().toISOString()
        })
        .eq('team_purchase_id', purchaseId)
        .eq('user_id', userId);

      if (error) throw error;

      await this.recalculatePurchaseAmount(purchaseId);
    } catch (error) {
      console.error('Error updating contribution:', error);
      throw error;
    }
  }

  /**
   * Пересчет общей суммы закупки
   */
  private async recalculatePurchaseAmount(purchaseId: string): Promise<void> {
    try {
      const { data: members } = await supabase
        .from('team_purchase_members')
        .select('contribution_actual, status')
        .eq('team_purchase_id', purchaseId)
        .eq('status', 'purchased');

      const collectedAmount = members?.reduce(
        (sum, m) => sum + (m.contribution_actual || 0), 
        0
      ) || 0;

      const { data: orders } = await supabase
        .from('team_purchase_orders')
        .select('order_amount')
        .eq('team_purchase_id', purchaseId)
        .eq('payment_status', 'paid');

      const paidAmount = orders?.reduce(
        (sum, o) => sum + (o.order_amount || 0),
        0
      ) || 0;

      await supabase
        .from('team_purchases')
        .update({
          collected_amount: collectedAmount,
          paid_amount: paidAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', purchaseId);
    } catch (error) {
      console.error('Error recalculating amount:', error);
    }
  }

  /**
   * Проверка возможности оформления заказа
   */
  async validateCheckout(
    purchaseId: string,
    userId: string
  ): Promise<{
    canCheckout: boolean;
    message: string;
  }> {
    try {
      const { data: member } = await supabase
        .from('team_purchase_members')
        .select('cart_total, status')
        .eq('team_purchase_id', purchaseId)
        .eq('user_id', userId)
        .single();

      if (!member) {
        return { canCheckout: false, message: 'Вы не участник этой закупки' };
      }

      if (member.cart_total < TEAM_PURCHASE_RULES.finance.MIN_PERSONAL_PURCHASE) {
        return {
          canCheckout: false,
          message: `Минимальная сумма заказа ${TEAM_PURCHASE_RULES.finance.MIN_PERSONAL_PURCHASE.toLocaleString('ru-RU')} ₸`
        };
      }

      return { canCheckout: true, message: 'OK' };
    } catch (error) {
      return { canCheckout: false, message: 'Ошибка проверки' };
    }
  }

  /**
   * Удаление участника из закупки
   */
  async removeMember(
    purchaseId: string,
    memberId: string,
    initiatorId: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const { data: purchase } = await supabase
        .from('team_purchases')
        .select('initiator_id')
        .eq('id', purchaseId)
        .single();

      if (purchase?.initiator_id !== initiatorId) {
        return { success: false, message: 'Только организатор может удалять участников' };
      }

      const { error } = await supabase
        .from('team_purchase_members')
        .update({ status: 'removed' })
        .eq('id', memberId);

      if (error) throw error;

      return { success: true, message: 'Участник удален' };
    } catch (error) {
      return { success: false, message: 'Ошибка удаления участника' };
    }
  }

  /**
   * Обновление настроек закупки
   */
  async updatePurchaseSettings(
    purchaseId: string,
    initiatorId: string,
    settings: {
      title?: string;
      description?: string;
      targetAmount?: number;
      deadline?: string;
    }
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const { data: purchase } = await supabase
        .from('team_purchases')
        .select('initiator_id, status')
        .eq('id', purchaseId)
        .single();

      if (purchase?.initiator_id !== initiatorId) {
        return { success: false, message: 'Только организатор может изменять настройки' };
      }

      if (purchase?.status !== 'forming') {
        return { success: false, message: 'Можно изменять только закупки на этапе сбора' };
      }

      // Обрабатываем пустые строки
      const processedSettings: any = {
        ...settings,
        updated_at: new Date().toISOString()
      };

      if (settings.deadline !== undefined) {
        processedSettings.deadline = settings.deadline && settings.deadline.trim() !== '' 
          ? settings.deadline 
          : null;
      }

      if (settings.description !== undefined) {
        processedSettings.description = settings.description && settings.description.trim() !== ''
          ? settings.description
          : null;
      }

      const { error } = await supabase
        .from('team_purchases')
        .update(processedSettings)
        .eq('id', purchaseId);

      if (error) throw error;

      return { success: true, message: 'Настройки обновлены' };
    } catch (error) {
      return { success: false, message: 'Ошибка обновления настроек' };
    }
  }

  /**
   * Приглашение пользователя по email
   */
  async inviteUser(
    purchaseId: string,
    email: string,
    initiatorId: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (!user) {
        return { success: false, message: 'Пользователь с таким email не найден' };
      }

      const { data: existingMember } = await supabase
        .from('team_purchase_members')
        .select('id')
        .eq('team_purchase_id', purchaseId)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        return { success: false, message: 'Пользователь уже участвует в закупке' };
      }

      const { error } = await supabase
        .from('team_purchase_members')
        .insert({
          team_purchase_id: purchaseId,
          user_id: user.id,
          invited_by: initiatorId,
          role: 'member',
          status: 'invited',
          contribution_target: 0,
          contribution_actual: 0,
          cart_total: 0
        });

      if (error) throw error;

      return { success: true, message: 'Приглашение отправлено' };
    } catch (error) {
      return { success: false, message: 'Ошибка отправки приглашения' };
    }
  }

  /**
   * Отмена закупки с указанием причины
   */
  async cancelPurchase(
    purchaseId: string,
    initiatorId: string,
    reason: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const { data: purchase } = await supabase
        .from('team_purchases')
        .select('initiator_id, status')
        .eq('id', purchaseId)
        .single();

      if (purchase?.initiator_id !== initiatorId) {
        return { success: false, message: 'Только организатор может отменить закупку' };
      }

      if (purchase?.status === 'completed') {
        return { success: false, message: 'Нельзя отменить завершенную закупку' };
      }

      const { error } = await supabase
        .from('team_purchases')
        .update({
          status: 'cancelled',
          cancellation_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', purchaseId);

      if (error) throw error;

      await supabase
        .from('team_purchase_members')
        .update({ status: 'removed' })
        .eq('team_purchase_id', purchaseId);

      return { success: true, message: 'Закупка отменена' };
    } catch (error) {
      return { success: false, message: 'Ошибка отмены закупки' };
    }
  }

  // Алиасы для обратной совместимости
  startPurchase = this.startActivePurchase;
  leaveTeamPurchase = this.leavePurchase;
  completePurchase = this.completeTeamPurchase;
}

export const teamPurchaseLifecycleService = new TeamPurchaseLifecycleService();