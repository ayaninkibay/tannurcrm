// lib/tree/TreeService.ts

import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';

export interface TeamMember {
  id: string;
  parentId: string | null;
  name: string;
  avatar?: string;
  tariff?: string;
  profession?: string;
  role?: string;
  verified: boolean;
  teamCount?: number;
  email?: string;
  phone?: string;
  level?: number;
  turnover?: number;
}

export class TreeService {
  /**
   * Получить команду текущего пользователя
   */
  static async getMyTeam(userId: string): Promise<TeamMember[]> {
    try {
      const { data: teamData, error: teamError } = await supabase
        .rpc('get_team_members', { dealer_id: userId });

      if (teamError) {
        return await this.getTeamDirectly(userId);
      }

      const teamIds = teamData?.map((item: any) => item) || [];
      const allIds = teamIds.length > 0 ? [...teamIds, userId] : [userId];

      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .in('id', allIds);

      if (usersError) {
        throw usersError;
      }

      return this.transformUsersToTeamMembers(users || []);
    } catch (error) {
      console.error('Ошибка получения команды:', error);
      return [];
    }
  }

  /**
   * Альтернативный метод получения команды напрямую из БД
   */
  static async getTeamDirectly(userId: string): Promise<TeamMember[]> {
    try {
      const allMembers: any[] = [];
      const processed = new Set<string>();
      
      const fetchDescendants = async (parentId: string) => {
        if (processed.has(parentId)) return;
        processed.add(parentId);

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('parent_id', parentId);

        if (error) throw error;

        if (data && data.length > 0) {
          allMembers.push(...data);
          for (const user of data) {
            await fetchDescendants(user.id);
          }
        }
      };

      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      
      allMembers.push(currentUser);
      await fetchDescendants(userId);

      if (currentUser.parent_id) {
        const { data: parent, error: parentError } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.parent_id)
          .single();

        if (!parentError && parent) {
          allMembers.push(parent);
        }
      }

      return this.transformUsersToTeamMembers(allMembers);
    } catch (error) {
      console.error('Ошибка прямого получения команды:', error);
      return [];
    }
  }

  /**
   * Получить только данные пользователя как члена команды
   */
  static async getUserAsTeamMember(userId: string): Promise<TeamMember[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return this.transformUsersToTeamMembers([data]);
    } catch (error) {
      console.error('Ошибка получения пользователя:', error);
      return [];
    }
  }

  /**
   * Преобразовать данные пользователей в формат TeamMember
   */
  private static transformUsersToTeamMembers(users: any[]): TeamMember[] {
    const members: TeamMember[] = users.map(user => ({
      id: user.id,
      parentId: user.parent_id,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Без имени',
      avatar: user.avatar_url,
      tariff: this.getTariffByLevel(user.personal_level),
      profession: this.mapRoleToProfession(user.role),
      role: this.mapRoleToPosition(user.role),
      verified: user.is_confirmed || false,
      teamCount: 0,
      email: user.email,
      phone: user.phone,
      level: user.personal_level,
      turnover: user.personal_turnover
    }));

    members.forEach(member => {
      member.teamCount = this.countTeamMembers(member.id, members);
    });

    return members;
  }

  /**
   * Определить тариф по уровню пользователя
   */
  private static getTariffByLevel(level: number): string {
    if (level >= 30) return 'Enterprise';
    if (level >= 20) return 'Premium';
    if (level >= 10) return 'Business';
    return 'Basic';
  }

  /**
   * Маппинг роли на профессию
   */
  private static mapRoleToProfession(role: string | null): string {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'celebrity':
        return 'Знаменитость';
      case 'dealer':
        return 'Дилер';
      case 'user':
        return 'Пользователь';
      default:
        return 'Участник';
    }
  }

  /**
   * Маппинг роли на должность
   */
  private static mapRoleToPosition(role: string | null): string {
    switch (role) {
      case 'admin':
        return 'CEO';
      case 'celebrity':
        return 'Ambassador';
      case 'dealer':
        return 'Partner';
      case 'user':
        return 'Member';
      default:
        return 'Member';
    }
  }

  /**
   * Подсчет количества членов в команде
   */
  private static countTeamMembers(userId: string, allMembers: TeamMember[]): number {
    let count = 0;
    const children = allMembers.filter(m => m.parentId === userId);
    
    count += children.length;
    
    children.forEach(child => {
      count += this.countTeamMembers(child.id, allMembers);
    });
    
    return count;
  }

  /**
   * Получить статистику команды для карточек
   */
  static async getTeamStats(userId: string): Promise<{
    totalMembers: number;
    totalTurnover: number;
    goal: number;
    remaining: number;
  }> {
    try {
      const members = await this.getMyTeam(userId);
      
      const totalMembers = members.filter(m => m.id !== userId).length;
      const totalTurnover = members.reduce((sum, member) => sum + (member.turnover || 0), 0);
      const goal = 9800000;
      const remaining = Math.max(0, goal - totalTurnover);

      return {
        totalMembers,
        totalTurnover,
        goal,
        remaining
      };
    } catch (error) {
      console.error('Ошибка получения статистики:', error);
      return {
        totalMembers: 0,
        totalTurnover: 0,
        goal: 9800000,
        remaining: 9800000
      };
    }
  }
}