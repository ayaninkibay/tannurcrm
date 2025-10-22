// //src/lib/teamcontent/team.service.ts

import { supabase } from '@/lib/supabase/client';

export type UserRole = 'manager' | 'financier' | 'warehouseman' | 'admin' | 'dealer' | 'celebrity';

export interface User {
  id: string;
  email: string | null;
  role: UserRole | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  created_at: string;
  status?: 'active' | 'blocked';
  team_count?: number;
}

export interface TeamMemberData {
  id: string;
  name: string;
  profession: string;
  date: string;
  status: 'active' | 'blocked';
  commands: number;
}

export class TeamService {
  // Получить пользователей по ролям
  async getUsersByRole(roles: UserRole[]): Promise<{ success: boolean; data?: User[]; error?: string }> {
    try {
      console.log('Loading users with roles:', roles);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('role', roles)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading users:', error);
        return { success: false, error: error.message };
      }

      // Приводим типы и фильтруем невалидные роли
      const users: User[] = (data || []).map((user: any) => ({
        ...user,
        role: roles.includes(user.role as UserRole) ? user.role as UserRole : null
      }));

      return { success: true, data: users };
    } catch (error) {
      console.error('Service error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка' 
      };
    }
  }

  // Получить всех дилеров
  async getDealers(): Promise<{ success: boolean; data?: User[]; error?: string }> {
    return this.getUsersByRole(['dealer']);
  }

  // Получить всех звезд
  async getCelebrities(): Promise<{ success: boolean; data?: User[]; error?: string }> {
    return this.getUsersByRole(['celebrity']);
  }

  // Получить всех сотрудников
  async getEmployees(): Promise<{ success: boolean; data?: User[]; error?: string }> {
    return this.getUsersByRole(['manager', 'financier', 'warehouseman', 'admin']);
  }

  // Преобразовать пользователя в формат для таблицы
  transformToTeamMember(user: User): TeamMemberData {
    const roleToPosition: Record<UserRole, string> = {
      'manager': 'Менеджер',
      'financier': 'Финансист',
      'warehouseman': 'Складовщик',
      'admin': 'Администратор',
      'dealer': 'Дилер',
      'celebrity': 'Знаменитость'
    };

    // Форматируем дату
    const date = new Date(user.created_at);
    const formattedDate = date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\./g, '-');

    return {
      id: user.id.slice(0, 8).toUpperCase(), // Показываем только первые 8 символов ID
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Без имени',
      profession: roleToPosition[user.role as UserRole] || 'Не указано',
      date: formattedDate,
      status: user.status || 'active',
      commands: user.team_count || 0
    };
  }

  // Получить статистику по ролям
  async getUsersStatistics(): Promise<{ 
    success: boolean; 
    data?: {
      dealers: number;
      celebrities: number;
      employees: number;
    }; 
    error?: string 
  }> {
    try {
      const [dealersResult, celebritiesResult, employeesResult] = await Promise.all([
        this.getDealers(),
        this.getCelebrities(),
        this.getEmployees()
      ]);

      return {
        success: true,
        data: {
          dealers: dealersResult.data?.length || 0,
          celebrities: celebritiesResult.data?.length || 0,
          employees: employeesResult.data?.length || 0
        }
      };
    } catch (error) {
      console.error('Statistics error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка получения статистики' 
      };
    }
  }

  // Поиск пользователей
  async searchUsers(query: string): Promise<{ success: boolean; data?: User[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      // Приводим типы для role
      const validRoles: UserRole[] = ['manager', 'financier', 'warehouseman', 'admin', 'dealer', 'celebrity'];
      const users: User[] = (data || []).map((user: any) => ({
        ...user,
        role: validRoles.includes(user.role as UserRole) ? user.role as UserRole : null
      }));

      return { success: true, data: users };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка поиска' 
      };
    }
  }
}