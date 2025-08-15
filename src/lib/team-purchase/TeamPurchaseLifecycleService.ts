import { supabase } from '@/lib/supabase/client';
import { TEAM_PURCHASE_RULES, canCheckout } from '@/lib/team-purchase/BusinessRules';
import type { TeamPurchase, TeamPurchaseMember } from '@/types';

class TeamPurchaseLifecycleService {
  /**
   * Создание новой командной закупки
   */
  async createTeamPurchase(
    initiatorId: string,
    data: {
      title: string;
      description?: string;
      targetAmount: number;  // Это просто план, не ограничение
      deadline?: string;
    }
  ): Promise<TeamPurchase> {
    try {
      // Генерируем уникальный код приглашения
      const inviteCode = this.generateInviteCode();

      // Создаем закупку
      const { data: purchase, error: purchaseError } = await supabase
        .from('team_purchases')
        .insert({
          title: data.title,
          description: data.description,
          initiator_id: initiatorId,
          target_amount: data.targetAmount, // План сбора
          min_contribution: 0, // Не используется
          deadline: data.deadline,
          max_members: null,
          invite_code: inviteCode,
          status: 'forming', // Начинаем с формирования
          collected_amount: 0,
          paid_amount: 0
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
          contribution_target: 0, // Не используется
          contribution_actual: 0,
          cart_total: 0
        });

      if (memberError) {
        await supabase
          .from('team_purchases')
          .delete()
          .eq('id', purchase.id);
        throw new Error('Ошибка добавления организатора');
      }

      return purchase;
    } catch (error) {
      console.error('Error in createTeamPurchase:', error);
      throw error;
    }
  }

  /**
   * Присоединение к закупке по коду
   */
  async joinByInviteCode(
    inviteCode: string,
    userId: string,
    contribution?: number // Добавляем опциональный параметр contribution
  ): Promise<{
    success: boolean;
    message: string;
    purchaseId?: string;
  }> {
    try {
      // Находим закупку по коду
      const { data: purchase } = await supabase
        .from('team_purchases')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();

      if (!purchase) {
        return {
          success: false,
          message: 'Закупка не найдена'
        };
      }

      // Можно присоединиться только на этапе формирования или активной закупки
      if (!['forming', 'active'].includes(purchase.status)) {
        return {
          success: false,
          message: 'К этой закупке уже нельзя присоединиться'
        };
      }

      // Проверяем, не участвует ли уже
      const { data: existingMember } = await supabase
        .from('team_purchase_members')
        .select('*')
        .eq('team_purchase_id', purchase.id)
        .eq('user_id', userId)
        .single();

      if (existingMember) {
        if (existingMember.status === 'invited') {
          // Если был приглашен, принимаем приглашение
          await supabase
            .from('team_purchase_members')
            .update({
              status: 'accepted',
              contribution_target: contribution || 0,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingMember.id);
            
          return {
            success: true,
            message: 'Приглашение принято',
            purchaseId: purchase.id
          };
        } else if (existingMember.status === 'accepted') {
          return {
            success: false,
            message: 'Вы уже участвуете в этой закупке'
          };
        } else if (existingMember.status === 'left') {
          // Возвращаемся в закупку
          await supabase
            .from('team_purchase_members')
            .update({
              status: 'accepted',
              contribution_target: contribution || 0,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingMember.id);
            
          return {
            success: true,
            message: 'Вы снова участвуете в закупке',
            purchaseId: purchase.id
          };
        }
      }

      // Добавляем нового участника
      await supabase
        .from('team_purchase_members')
        .insert({
          team_purchase_id: purchase.id,
          user_id: userId,
          role: 'member',
          status: 'accepted',
          contribution_target: contribution || 0,
          contribution_actual: 0,
          cart_total: 0
        });

      return {
        success: true,
        message: 'Вы успешно присоединились к закупке',
        purchaseId: purchase.id
      };
    } catch (error) {
      console.error('Error joining purchase:', error);
      return {
        success: false,
        message: 'Ошибка присоединения к закупке'
      };
    }
  }

  /**
   * Пригласить участника (создает запись со статусом invited)
   */
  async inviteUser(
    purchaseId: string,
    userEmail: string,
    invitedBy: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Находим пользователя по email
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (!user) {
        return { success: false, message: 'Пользователь не найден' };
      }

      // Проверяем, не участвует ли уже
      const { data: existingMember } = await supabase
        .from('team_purchase_members')
        .select('*')
        .eq('team_purchase_id', purchaseId)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        return { success: false, message: 'Пользователь уже приглашен или участвует' };
      }

      // Создаем приглашение
      await supabase
        .from('team_purchase_members')
        .insert({
          team_purchase_id: purchaseId,
          user_id: user.id,
          role: 'member',
          status: 'invited',
          contribution_target: 0,
          contribution_actual: 0,
          cart_total: 0
        });

      // TODO: Отправить email уведомление

      return { success: true, message: 'Приглашение отправлено' };
    } catch (error) {
      console.error('Error inviting user:', error);
      return { success: false, message: 'Ошибка отправки приглашения' };
    }
  }

  /**
   * Старт активной фазы закупки (переход из формирования в активную)
   */
  async startActivePurchase(purchaseId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const { data: purchase } = await supabase
        .from('team_purchases')
        .select('*')
        .eq('id', purchaseId)
        .single();

      if (!purchase) {
        return { success: false, message: 'Закупка не найдена' };
      }

      if (purchase.status !== 'forming') {
        return { success: false, message: 'Закупка уже активна или завершена' };
      }

      // Переводим в активный статус
      const { error } = await supabase
        .from('team_purchases')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', purchaseId);

      if (error) {
        return { success: false, message: 'Ошибка активации закупки' };
      }

      return { success: true, message: 'Закупка активирована! Участники могут собирать корзины' };
    } catch (error) {
      console.error('Error starting purchase:', error);
      return { success: false, message: 'Ошибка запуска закупки' };
    }
  }

  /**
   * Алиас для startActivePurchase для совместимости
   */
  async startPurchase(purchaseId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.startActivePurchase(purchaseId);
  }

  /**
   * Выход участника из закупки
   */
  async leavePurchase(
    purchaseId: string,
    userId: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Проверяем статус закупки
      const { data: purchase } = await supabase
        .from('team_purchases')
        .select('status, initiator_id')
        .eq('id', purchaseId)
        .single();

      if (!purchase) {
        return { success: false, message: 'Закупка не найдена' };
      }

      // Организатор не может выйти
      if (purchase.initiator_id === userId) {
        return { success: false, message: 'Организатор не может покинуть закупку' };
      }

      // Можно выйти только на этапах forming и active
      if (!['forming', 'active'].includes(purchase.status)) {
        return { success: false, message: 'На данном этапе выход невозможен' };
      }

      // Обновляем статус участника
      await supabase
        .from('team_purchase_members')
        .update({
          status: 'left',
          updated_at: new Date().toISOString()
        })
        .eq('team_purchase_id', purchaseId)
        .eq('user_id', userId);

      // Очищаем корзину участника
      await supabase
        .from('team_purchase_carts')
        .update({ status: 'removed' })
        .eq('team_purchase_id', purchaseId)
        .eq('user_id', userId);

      // Обновляем общую сумму
      await this.updateCollectedAmount(purchaseId);

      return { success: true, message: 'Вы покинули закупку' };
    } catch (error) {
      console.error('Error leaving purchase:', error);
      return { success: false, message: 'Ошибка выхода из закупки' };
    }
  }

  /**
   * Алиас для leavePurchase для совместимости
   */
  async leaveTeamPurchase(
    purchaseId: string,
    userId: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.leavePurchase(purchaseId, userId);
  }

  /**
   * Удаление участника организатором
   */
  async removeMember(
    purchaseId: string,
    memberId: string,
    organizerId: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Проверяем, что это организатор
      const { data: purchase } = await supabase
        .from('team_purchases')
        .select('initiator_id, status')
        .eq('id', purchaseId)
        .single();

      if (!purchase || purchase.initiator_id !== organizerId) {
        return { success: false, message: 'Только организатор может удалять участников' };
      }

      if (!['forming', 'active'].includes(purchase.status)) {
        return { success: false, message: 'На данном этапе удаление невозможно' };
      }

      // Получаем данные участника
      const { data: member } = await supabase
        .from('team_purchase_members')
        .select('user_id, role')
        .eq('id', memberId)
        .single();

      if (!member) {
        return { success: false, message: 'Участник не найден' };
      }

      if (member.role === 'organizer') {
        return { success: false, message: 'Нельзя удалить организатора' };
      }

      // Удаляем участника
      await supabase
        .from('team_purchase_members')
        .update({
          status: 'removed',
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId);

      // Очищаем корзину
      await supabase
        .from('team_purchase_carts')
        .update({ status: 'removed' })
        .eq('team_purchase_id', purchaseId)
        .eq('user_id', member.user_id);

      await this.updateCollectedAmount(purchaseId);

      return { success: true, message: 'Участник удален' };
    } catch (error) {
      console.error('Error removing member:', error);
      return { success: false, message: 'Ошибка удаления участника' };
    }
  }

  /**
   * Обновление настроек закупки
   */
  async updatePurchaseSettings(
    purchaseId: string,
    organizerId: string,
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
      // Проверяем права
      const { data: purchase } = await supabase
        .from('team_purchases')
        .select('initiator_id, status')
        .eq('id', purchaseId)
        .single();

      if (!purchase || purchase.initiator_id !== organizerId) {
        return { success: false, message: 'Только организатор может изменять настройки' };
      }

      if (!['forming', 'active'].includes(purchase.status)) {
        return { success: false, message: 'Настройки можно изменять только на этапе формирования или активной закупки' };
      }

      // Обновляем настройки
      const { error } = await supabase
        .from('team_purchases')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', purchaseId);

      if (error) {
        return { success: false, message: 'Ошибка обновления настроек' };
      }

      return { success: true, message: 'Настройки обновлены' };
    } catch (error) {
      console.error('Error updating settings:', error);
      return { success: false, message: 'Ошибка сохранения настроек' };
    }
  }

  /**
   * Обновление вклада участника
   */
  async updateMemberContribution(
    purchaseId: string,
    userId: string,
    newAmount: number
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const { error } = await supabase
        .from('team_purchase_members')
        .update({
          contribution_target: newAmount,
          updated_at: new Date().toISOString()
        })
        .eq('team_purchase_id', purchaseId)
        .eq('user_id', userId);

      if (error) {
        return { success: false, message: 'Ошибка обновления вклада' };
      }

      await this.updateCollectedAmount(purchaseId);

      return { success: true, message: 'Вклад обновлен' };
    } catch (error) {
      console.error('Error updating contribution:', error);
      return { success: false, message: 'Ошибка обновления' };
    }
  }

  /**
   * Подтверждение оплаты участника
   */
  async confirmMemberPayment(
    purchaseId: string,
    memberId: string,
    orderId: string,
    amount: number
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Обновляем статус участника
      const { error } = await supabase
        .from('team_purchase_members')
        .update({
          status: 'purchased',
          contribution_actual: amount,
          order_id: orderId,
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId)
        .eq('team_purchase_id', purchaseId);

      if (error) {
        return { success: false, message: 'Ошибка подтверждения оплаты' };
      }

      // Обновляем общую оплаченную сумму
      const { data: members } = await supabase
        .from('team_purchase_members')
        .select('contribution_actual')
        .eq('team_purchase_id', purchaseId)
        .eq('status', 'purchased');

      const paidAmount = members?.reduce((sum, m) => sum + (m.contribution_actual || 0), 0) || 0;

      await supabase
        .from('team_purchases')
        .update({
          paid_amount: paidAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', purchaseId);

      return { success: true, message: 'Оплата подтверждена' };
    } catch (error) {
      console.error('Error confirming payment:', error);
      return { success: false, message: 'Ошибка подтверждения' };
    }
  }

  /**
   * Проверка возможности оплаты (минимум 300К)
   */
  async validateCheckout(
    purchaseId: string,
    userId: string
  ): Promise<{
    canCheckout: boolean;
    message: string;
    cartTotal: number;
    minRequired: number;
  }> {
    try {
      // Получаем сумму корзины
      const { data: member } = await supabase
        .from('team_purchase_members')
        .select('cart_total')
        .eq('team_purchase_id', purchaseId)
        .eq('user_id', userId)
        .single();

      const cartTotal = member?.cart_total || 0;
      const minRequired = TEAM_PURCHASE_RULES.finance.MIN_PERSONAL_PURCHASE;

      if (cartTotal < minRequired) {
        return {
          canCheckout: false,
          message: `Минимальная сумма заказа ${minRequired.toLocaleString('ru-RU')} ₸. Добавьте товаров на ${(minRequired - cartTotal).toLocaleString('ru-RU')} ₸`,
          cartTotal,
          minRequired
        };
      }

      return {
        canCheckout: true,
        message: 'Можно оформить заказ',
        cartTotal,
        minRequired
      };
    } catch (error) {
      console.error('Error validating checkout:', error);
      return {
        canCheckout: false,
        message: 'Ошибка проверки',
        cartTotal: 0,
        minRequired: TEAM_PURCHASE_RULES.finance.MIN_PERSONAL_PURCHASE
      };
    }
  }

  /**
   * Завершение закупки
   */
  async completePurchase(purchaseId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      await supabase
        .from('team_purchases')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', purchaseId);

      return { success: true, message: 'Закупка завершена' };
    } catch (error) {
      console.error('Error completing purchase:', error);
      return { success: false, message: 'Ошибка завершения' };
    }
  }

  /**
   * Отмена закупки
   */
  async cancelPurchase(
    purchaseId: string,
    organizerId: string,
    reason: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Проверяем права
      const { data: purchase } = await supabase
        .from('team_purchases')
        .select('initiator_id')
        .eq('id', purchaseId)
        .single();

      if (!purchase || purchase.initiator_id !== organizerId) {
        return { success: false, message: 'Только организатор может отменить закупку' };
      }

      await supabase
        .from('team_purchases')
        .update({
          status: 'cancelled',
          cancellation_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', purchaseId);

      return { success: true, message: 'Закупка отменена' };
    } catch (error) {
      console.error('Error cancelling purchase:', error);
      return { success: false, message: 'Ошибка отмены' };
    }
  }

  /**
   * Обновление собранной суммы
   */
  private async updateCollectedAmount(purchaseId: string): Promise<void> {
    const { data: members } = await supabase
      .from('team_purchase_members')
      .select('cart_total')
      .eq('team_purchase_id', purchaseId)
      .in('status', ['accepted', 'purchased']);

    const total = members?.reduce((sum, m) => sum + (m.cart_total || 0), 0) || 0;

    await supabase
      .from('team_purchases')
      .update({
        collected_amount: total,
        updated_at: new Date().toISOString()
      })
      .eq('id', purchaseId);
  }

  /**
   * Генерация кода приглашения
   */
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

export const teamPurchaseLifecycleService = new TeamPurchaseLifecycleService();