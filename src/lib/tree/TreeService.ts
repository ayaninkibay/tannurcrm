// services/TreeService.ts

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Интерфейс совместимый с вашим TeamTree компонентом
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
  // Дополнительные поля из БД
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
      console.log('🔍 TreeService.getMyTeam для userId:', userId);
      
      // Получаем членов команды пользователя (функция возвращает SETOF uuid)
      const { data: teamData, error: teamError } = await supabase
        .rpc('get_team_members', { dealer_id: userId });

      console.log('🔍 RPC результат:', { teamData, teamError });

      if (teamError) {
        console.error('❌ Ошибка получения ID команды:', teamError);
        // Если функции нет, пробуем получить напрямую
        return await this.getTeamDirectly(userId);
      }

      // teamData приходит как массив UUID
      const teamIds = teamData?.map((item: any) => item) || [];
      console.log('🔍 Team IDs из функции:', teamIds);

      // Всегда включаем самого пользователя
      const allIds = teamIds.length > 0 ? [...teamIds, userId] : [userId];
      console.log('🔍 Все ID для запроса:', allIds);

      // Получаем детальную информацию о членах команды
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .in('id', allIds);

      console.log('🔍 Результат запроса users:', { users, usersError, count: users?.length });

      if (usersError) {
        console.error('❌ Ошибка получения пользователей:', usersError);
        throw usersError;
      }

      // Всегда возвращаем массив, даже если пустой
      const result = this.transformUsersToTeamMembers(users || []);
      console.log('🔍 Финальный результат после трансформации:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Ошибка получения команды:', error);
      // В случае ошибки возвращаем пустой массив
      return [];
    }
  }

  /**
   * Альтернативный метод получения команды напрямую из БД
   */
  static async getTeamDirectly(userId: string): Promise<TeamMember[]> {
    try {
      console.log('🔍 getTeamDirectly для userId:', userId);
      
      const allMembers: any[] = [];
      const processed = new Set<string>();
      
      // Рекурсивная функция для получения всех подчиненных
      const fetchDescendants = async (parentId: string) => {
        if (processed.has(parentId)) return;
        processed.add(parentId);

        console.log('🔍 Ищем подчиненных для parentId:', parentId);

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('parent_id', parentId);

        console.log('🔍 Найдено подчиненных:', data?.length || 0);

        if (error) throw error;

        if (data && data.length > 0) {
          allMembers.push(...data);
          // Рекурсивно получаем подчиненных каждого найденного пользователя
          for (const user of data) {
            await fetchDescendants(user.id);
          }
        }
      };

      // Получаем самого пользователя
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      
      console.log('🔍 Текущий пользователь:', currentUser?.first_name, currentUser?.last_name);
      allMembers.push(currentUser);
      
      // Получаем всех подчиненных
      await fetchDescendants(userId);

      // Если у пользователя есть parent_id, получаем и родителя
      if (currentUser.parent_id) {
        console.log('🔍 Получаем родителя:', currentUser.parent_id);
        const { data: parent, error: parentError } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.parent_id)
          .single();

        if (!parentError && parent) {
          allMembers.push(parent);
        }
      }

      console.log('🔍 Всего участников найдено:', allMembers.length);
      return this.transformUsersToTeamMembers(allMembers);
    } catch (error) {
      console.error('❌ Ошибка прямого получения команды:', error);
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
    console.log('🔍 transformUsersToTeamMembers получил пользователей:', users.length);
    
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

    // Подсчитываем количество членов команды для каждого участника
    members.forEach(member => {
      member.teamCount = this.countTeamMembers(member.id, members);
    });

    console.log('🔍 Трансформированные участники:', members.map(m => ({ id: m.id, name: m.name, parentId: m.parentId })));
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
    
    // Рекурсивно считаем потомков
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
      const goal = 9800000; // Можно сделать динамическим из настроек
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