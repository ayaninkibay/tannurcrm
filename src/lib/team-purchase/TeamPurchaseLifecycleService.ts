import { supabase } from '@/lib/supabase/client';
import { TEAM_PURCHASE_RULES, canStartPurchase } from '@/lib/team-purchase/BusinessRules';
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
      targetAmount: number;
      minContribution?: number; // Опционально
      deadline?: string; // Опционально
    }
  ): Promise<TeamPurchase> {
    try {
      // Генерируем уникальный код приглашения
      const inviteCode = this.generateInviteCode();

      // Создаем закупку БЕЗ лишних ограничений
      const { data: purchase, error: purchaseError } = await supabase
        .from('team_purchases')
        .insert({
          title: data.title,
          description: data.description,
          initiator_id: initiatorId,
          target_amount: data.targetAmount,
          min_contribution: data.minContribution || TEAM_PURCHASE_RULES.finance.DEFAULT_MIN_CONTRIBUTION,
          deadline: data.deadline, // Может быть null
          max_members: null, // Без ограничений
          invite_code: inviteCode,
          status: 'forming',
          collected_amount: 0,
          paid_amount: 0
        })
        .select()
        .single();

      if (purchaseError) {
        throw new Error(`Ошибка создания закупки: ${purchaseError.message}`);
      }

      // Добавляем организатора как первого участника
      // БЕЗ автоматического определения суммы вклада
      const { error: memberError } = await supabase
        .from('team_purchase_members')
        .insert({
          team_purchase_id: purchase.id,
          user_id: initiatorId,
          role: 'organizer',
          status: 'accepted',
          contribution_target: 0, // Организатор сам определит свой вклад
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
   * Участник САМ определяет сумму вклада
   */
  async joinByInviteCode(
    inviteCode: string,
    userId: string,
    contributionTarget: number // Участник сам выбирает
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

      // Проверяем только статус (без временных ограничений)
      if (purchase.status !== 'forming') {
        return {
          success: false,
          message: 'Закупка уже началась, присоединение невозможно'
        };
      }

      // Проверяем минимальный вклад (если установлен)
      if (contributionTarget < purchase.min_contribution) {
        return {
          success: false,
          message: `Минимальный вклад: ${purchase.min_contribution.toLocaleString('ru-RU')} ₸`
        };
      }

      // Проверяем, не участвует ли уже
      const { data: existingMember } = await supabase
        .from('team_purchase_members')
        .select('*')
        .eq('team_purchase_id', purchase.id)
        .eq('user_id', userId)
        .single();

      if (existingMember && existingMember.status !== 'left') {
        return {
          success: false,
          message: 'Вы уже участвуете в этой закупке'
        };
      }

      // Добавляем участника
      if (existingMember) {
        await supabase
          .from('team_purchase_members')
          .update({
            status: 'accepted',
            contribution_target: contributionTarget,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingMember.id);
      } else {
        await supabase
          .from('team_purchase_members')
          .insert({
            team_purchase_id: purchase.id,
            user_id: userId,
            role: 'member',
            status: 'accepted',
            contribution_target: contributionTarget,
            contribution_actual: 0,
            cart_total: 0
          });
      }

      // Обновляем собранную сумму
      await this.updateCollectedAmount(purchase.id);

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
   * Обновление планируемого вклада участника
   */
  async updateMemberContribution(
    purchaseId: string,
    userId: string,
    newAmount: number
  ): Promise<void> {
    await supabase
      .from('team_purchase_members')
      .update({
        contribution_target: newAmount,
        updated_at: new Date().toISOString()
      })
      .eq('team_purchase_id', purchaseId)
      .eq('user_id', userId);

    await this.updateCollectedAmount(purchaseId);
  }

  /**
   * Старт закупки - проверяем только минимум 300к
   */
  async startPurchase(purchaseId: string): Promise<{
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

      // Получаем количество участников
      const { data: members } = await supabase
        .from('team_purchase_members')
        .select('id')
        .eq('team_purchase_id', purchaseId)
        .eq('status', 'accepted');

      const membersCount = members?.length || 0;

      // Проверяем минимальные условия
      if (!canStartPurchase(purchase.collected_amount, membersCount)) {
        return { 
          success: false, 
          message: `Не выполнены условия: минимум ${TEAM_PURCHASE_RULES.finance.MIN_TOTAL_AMOUNT.toLocaleString('ru-RU')} ₸ и ${TEAM_PURCHASE_RULES.participants.MIN_MEMBERS} участника` 
        };
      }

      // Меняем статус на активный
      await supabase
        .from('team_purchases')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', purchaseId);

      return { success: true, message: 'Закупка успешно запущена' };
    } catch (error) {
      console.error('Error starting purchase:', error);
      return { success: false, message: 'Ошибка запуска закупки' };
    }
  }

  /**
   * Смена статуса закупки (организатор управляет вручную)
   */
  async changeStatus(
    purchaseId: string,
    newStatus: string,
    initiatorId: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Проверяем, что это организатор
      const { data: purchase } = await supabase
        .from('team_purchases')
        .select('initiator_id')
        .eq('id', purchaseId)
        .single();

      if (purchase?.initiator_id !== initiatorId) {
        return { success: false, message: 'Только организатор может менять статус' };
      }

      // Меняем статус
      await supabase
        .from('team_purchases')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', purchaseId);

      return { success: true, message: 'Статус успешно изменен' };
    } catch (error) {
      console.error('Error changing status:', error);
      return { success: false, message: 'Ошибка изменения статуса' };
    }
  }

  /**
   * Обновление собранной суммы
   */
  private async updateCollectedAmount(purchaseId: string): Promise<void> {
    const { data: members } = await supabase
      .from('team_purchase_members')
      .select('contribution_target')
      .eq('team_purchase_id', purchaseId)
      .in('status', ['accepted', 'purchased']);

    const total = members?.reduce((sum, m) => sum + (m.contribution_target || 0), 0) || 0;

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