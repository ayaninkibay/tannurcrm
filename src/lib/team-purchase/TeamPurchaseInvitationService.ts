// lib/team-purchase/TeamPurchaseInvitationService.ts

import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

export interface InvitableUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  parent_id?: string;
  isDirectDealer?: boolean;  // Прямой дилер
  isSubDealer?: boolean;     // Поддилер (через иерархию)
  level?: number;             // Уровень в иерархии
  invited?: boolean;          // Уже приглашен
  joined?: boolean;           // Уже присоединился
}

export interface InvitationStats {
  totalInvitable: number;
  directDealers: number;
  subDealers: number;
  alreadyInvited: number;
  alreadyJoined: number;
}

class TeamPurchaseInvitationService {
  /**
   * Получить список всех доступных для приглашения пользователей
   * включая прямых дилеров и поддилеров
   */
  async getInvitableUsers(
    purchaseId: string,
    currentUserId: string
  ): Promise<{
    users: InvitableUser[];
    stats: InvitationStats;
  }> {
    try {
      // 1. Получаем всех существующих участников закупки
      const { data: existingMembers } = await supabase
        .from('team_purchase_members')
        .select('user_id, status')
        .eq('team_purchase_id', purchaseId);

      const existingUserIds = new Set(existingMembers?.map(m => m.user_id) || []);
      const joinedUserIds = new Set(
        existingMembers?.filter(m => m.status === 'accepted' || m.status === 'purchased')
          .map(m => m.user_id) || []
      );

      // 2. Получаем ПРЯМЫХ дилеров текущего пользователя
      const { data: directDealers } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, role, parent_id')
        .eq('parent_id', currentUserId)
        .in('role', ['dealer', 'admin']);

      // 3. Получаем ВСЕХ поддилеров через рекурсивную функцию
      const { data: subDealerIds } = await supabase
        .rpc('get_team_members', { dealer_id: currentUserId });

      // 4. Получаем данные поддилеров
      let subDealers: any[] = [];
      if (subDealerIds && subDealerIds.length > 0) {
        const { data } = await supabase
          .from('users')
          .select('id, email, first_name, last_name, role, parent_id')
          .in('id', subDealerIds)
          .in('role', ['dealer', 'admin']);
        subDealers = data || [];
      }

      // 5. Формируем единый список с метками
      const invitableUsers: InvitableUser[] = [];

      // Добавляем прямых дилеров
      directDealers?.forEach(dealer => {
        invitableUsers.push({
          ...dealer,
          isDirectDealer: true,
          isSubDealer: false,
          level: 1,
          invited: existingUserIds.has(dealer.id),
          joined: joinedUserIds.has(dealer.id)
        });
      });

      // Добавляем поддилеров (исключая прямых)
      const directDealerIds = new Set(directDealers?.map(d => d.id) || []);
      
      for (const subDealer of subDealers) {
        if (!directDealerIds.has(subDealer.id)) {
          // Вычисляем уровень в иерархии
          const level = await this.calculateHierarchyLevel(subDealer.id, currentUserId);
          
          invitableUsers.push({
            ...subDealer,
            isDirectDealer: false,
            isSubDealer: true,
            level,
            invited: existingUserIds.has(subDealer.id),
            joined: joinedUserIds.has(subDealer.id)
          });
        }
      }

      // 6. Считаем статистику
      const stats: InvitationStats = {
        totalInvitable: invitableUsers.filter(u => !u.joined).length,
        directDealers: invitableUsers.filter(u => u.isDirectDealer && !u.joined).length,
        subDealers: invitableUsers.filter(u => u.isSubDealer && !u.joined).length,
        alreadyInvited: invitableUsers.filter(u => u.invited && !u.joined).length,
        alreadyJoined: invitableUsers.filter(u => u.joined).length
      };

      // Сортируем: сначала прямые дилеры, потом по уровню
      invitableUsers.sort((a, b) => {
        if (a.joined !== b.joined) return a.joined ? 1 : -1;
        if (a.isDirectDealer !== b.isDirectDealer) return a.isDirectDealer ? -1 : 1;
        return (a.level || 0) - (b.level || 0);
      });

      return { users: invitableUsers, stats };
    } catch (error) {
      console.error('Error getting invitable users:', error);
      throw error;
    }
  }

  /**
   * Вычислить уровень пользователя в иерархии
   */
  private async calculateHierarchyLevel(
    userId: string,
    rootUserId: string,
    maxDepth: number = 10
  ): Promise<number> {
    let level = 0;
    let currentUserId = userId;

    while (level < maxDepth) {
      const { data: user } = await supabase
        .from('users')
        .select('parent_id')
        .eq('id', currentUserId)
        .single();

      if (!user || !user.parent_id) break;
      
      level++;
      
      if (user.parent_id === rootUserId) {
        return level;
      }
      
      currentUserId = user.parent_id;
    }

    return level;
  }

  /**
   * Пригласить выбранных пользователей
   */
  async inviteUsers(
    purchaseId: string,
    userIds: string[],
    inviterId: string
  ): Promise<{
    success: boolean;
    invited: number;
    failed: number;
    errors: string[];
  }> {
    const results = {
      success: true,
      invited: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const userId of userIds) {
      try {
        // Проверяем, не приглашен ли уже
        const { data: existing } = await supabase
          .from('team_purchase_members')
          .select('id, status')
          .eq('team_purchase_id', purchaseId)
          .eq('user_id', userId)
          .single();

        if (existing) {
          if (existing.status === 'left' || existing.status === 'removed') {
            // Восстанавливаем участника
            await supabase
              .from('team_purchase_members')
              .update({
                status: 'invited',
                invited_by: inviterId,
                joined_at: null,
                left_at: null
              })
              .eq('id', existing.id);
            results.invited++;
          } else {
            results.errors.push(`Пользователь уже приглашен`);
          }
          continue;
        }

        // Создаем новое приглашение
        const { error } = await supabase
          .from('team_purchase_members')
          .insert({
            team_purchase_id: purchaseId,
            user_id: userId,
            invited_by: inviterId,
            role: 'member',
            status: 'invited',
            contribution_target: 0,
            contribution_actual: 0,
            cart_total: 0
          });

        if (error) {
          results.failed++;
          results.errors.push(error.message);
        } else {
          results.invited++;
        }

        // Отправляем уведомление (если есть система уведомлений)
        await this.sendInvitationNotification(purchaseId, userId, inviterId);

      } catch (error) {
        results.failed++;
        results.errors.push(String(error));
      }
    }

    results.success = results.failed === 0;
    return results;
  }

  /**
   * Пригласить ВСЕХ доступных дилеров
   */
  async inviteAllDealers(
    purchaseId: string,
    currentUserId: string,
    includeSubDealers: boolean = true
  ): Promise<{
    success: boolean;
    invited: number;
    failed: number;
  }> {
    const { users } = await this.getInvitableUsers(purchaseId, currentUserId);
    
    // Фильтруем только тех, кто еще не присоединился
    const toInvite = users
      .filter(u => !u.joined)
      .filter(u => includeSubDealers || u.isDirectDealer)
      .map(u => u.id);

    if (toInvite.length === 0) {
      return { success: true, invited: 0, failed: 0 };
    }

    return this.inviteUsers(purchaseId, toInvite, currentUserId);
  }

  /**
   * Отправить уведомление о приглашении
   */
  private async sendInvitationNotification(
    purchaseId: string,
    userId: string,
    inviterId: string
  ): Promise<void> {
    try {
      // Получаем информацию о закупке
      const { data: purchase } = await supabase
        .from('team_purchases')
        .select('title, description')
        .eq('id', purchaseId)
        .single();

      // Получаем информацию о приглашающем
      const { data: inviter } = await supabase
        .from('users')
        .select('first_name, last_name, email')
        .eq('id', inviterId)
        .single();

      // Создаем уведомление в БД (если есть таблица notifications)
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'team_purchase_invitation',
          title: `Приглашение в командную закупку`,
          message: `${inviter?.first_name || inviter?.email} приглашает вас в закупку "${purchase?.title}"`,
          data: {
            purchase_id: purchaseId,
            inviter_id: inviterId
          },
          is_read: false
        });

      // TODO: Отправка email/push уведомления
    } catch (error) {
      console.error('Error sending notification:', error);
      // Не прерываем процесс при ошибке уведомления
    }
  }

  /**
   * Получить список приглашений для текущего пользователя
   */
  async getMyInvitations(userId: string): Promise<any[]> {
    const { data } = await supabase
      .from('team_purchase_members')
      .select(`
        *,
        team_purchase:team_purchases(*),
        inviter:users!team_purchase_members_invited_by_fkey(
          id, email, first_name, last_name
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'invited')
      .order('created_at', { ascending: false });

    return data || [];
  }

  /**
   * Принять приглашение
   */
async acceptInvitation(
  purchaseId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('team_purchase_members')
    .update({
      status: 'accepted',
      joined_at: new Date().toISOString()
      // УБРАЛИ contribution_target - он всегда 0
    })
    .eq('team_purchase_id', purchaseId)
    .eq('user_id', userId)
    .eq('status', 'invited');

  if (error) throw error;
  // Триггер автоматически обновит collected_amount когда участник сделает заказ
}

  /**
   * Отклонить приглашение
   */
  async declineInvitation(
    purchaseId: string,
    userId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('team_purchase_members')
      .delete()
      .eq('team_purchase_id', purchaseId)
      .eq('user_id', userId)
      .eq('status', 'invited');

    if (error) throw error;
  }
}

export const teamPurchaseInvitationService = new TeamPurchaseInvitationService();