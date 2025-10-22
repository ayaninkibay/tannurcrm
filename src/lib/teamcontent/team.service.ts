// src/lib/teamcontent/team.service.ts

import { supabase } from '@/lib/supabase/client';

export type UserRole = 'dealer' | 'celebrity' | 'admin' | 'financier' | 'user';

export interface User {
  id: string;
  email: string | null;
  role: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  created_at: string;
  is_confirmed: boolean;
  referral_code: string | null;
  parent_id: string | null;
  star_id: string | null;
  instagram: string | null;
  region: string | null;
  avatar_url: string | null;
  profession: string | null;
}

export interface TeamMemberData {
  id: string;
  name: string;
  profession: string;
  date: string;
  status: boolean;
  commands: number;
  referralCode: string;
  email: string;
  phone: string;
  avatar_url: string | null;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data?: T[];
  error?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export class TeamService {
  private readonly DEFAULT_PAGE_SIZE = 50;

  private async getTotalCount(roles: string[]): Promise<number> {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .in('role', roles);

    if (error) {
      console.error('Error getting count:', error);
      return 0;
    }

    return count || 0;
  }

  async getUsersByRole(
    roles: string[],
    params: PaginationParams = { page: 1, pageSize: this.DEFAULT_PAGE_SIZE }
  ): Promise<PaginatedResponse<User>> {
    try {
      const { page, pageSize } = params;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const total = await this.getTotalCount(roles);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('role', roles)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error loading users:', error);
        return { success: false, error: error.message };
      }

      const users: User[] = data || [];

      return {
        success: true,
        data: users,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      };
    } catch (error) {
      console.error('Service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }

async searchUsers(
  query: string,
  params: PaginationParams = { page: 1, pageSize: this.DEFAULT_PAGE_SIZE }
): Promise<PaginatedResponse<User>> {
  try {
    if (!query.trim()) {
      return { success: true, data: [] };
    }

    const { page, pageSize } = params;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Разбиваем запрос на слова
    const searchWords = query.trim().split(/\s+/);
    const searchPattern = `%${query}%`;
    
    // Базовый запрос
    let queryBuilder = supabase
      .from('users')
      .select('*', { count: 'exact' });

    // Если одно слово - ищем по всем полям
    if (searchWords.length === 1) {
      queryBuilder = queryBuilder.or(
        `first_name.ilike.${searchPattern},last_name.ilike.${searchPattern},email.ilike.${searchPattern},phone.ilike.${searchPattern},referral_code.ilike.${searchPattern},instagram.ilike.${searchPattern}`
      );
    } else {
      // Если несколько слов - ищем комбинации имени и фамилии
      const word1Pattern = `%${searchWords[0]}%`;
      const word2Pattern = `%${searchWords[1]}%`;
      
      queryBuilder = queryBuilder.or(
        `and(first_name.ilike.${word1Pattern},last_name.ilike.${word2Pattern}),and(first_name.ilike.${word2Pattern},last_name.ilike.${word1Pattern}),first_name.ilike.${searchPattern},last_name.ilike.${searchPattern},email.ilike.${searchPattern},phone.ilike.${searchPattern},referral_code.ilike.${searchPattern}`
      );
    }

    // Подсчет
    const { count } = await queryBuilder;

    // Получение данных
    queryBuilder = supabase
      .from('users')
      .select('*');

    if (searchWords.length === 1) {
      queryBuilder = queryBuilder.or(
        `first_name.ilike.${searchPattern},last_name.ilike.${searchPattern},email.ilike.${searchPattern},phone.ilike.${searchPattern},referral_code.ilike.${searchPattern},instagram.ilike.${searchPattern}`
      );
    } else {
      const word1Pattern = `%${searchWords[0]}%`;
      const word2Pattern = `%${searchWords[1]}%`;
      
      queryBuilder = queryBuilder.or(
        `and(first_name.ilike.${word1Pattern},last_name.ilike.${word2Pattern}),and(first_name.ilike.${word2Pattern},last_name.ilike.${word1Pattern}),first_name.ilike.${searchPattern},last_name.ilike.${searchPattern},email.ilike.${searchPattern},phone.ilike.${searchPattern},referral_code.ilike.${searchPattern}`
      );
    }

    const { data, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Search error:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: data || [],
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка поиска'
    };
  }
}

  async getDealers(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    return this.getUsersByRole(['dealer'], params);
  }

  async getCelebrities(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    return this.getUsersByRole(['celebrity'], params);
  }

  async getEmployees(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    return this.getUsersByRole(['admin', 'financier', 'user'], params);
  }

  transformToTeamMember(user: User): TeamMemberData {
    const roleToPosition: Record<string, string> = {
      'dealer': 'Дилер',
      'celebrity': 'Знаменитость',
      'admin': 'Администратор',
      'financier': 'Финансист',
      'user': 'Пользователь'
    };

    const date = new Date(user.created_at);
    const formattedDate = date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    return {
      id: user.id,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Без имени',
      profession: user.profession || roleToPosition[user.role || ''] || 'Не указано',
      date: formattedDate,
      status: user.is_confirmed,
      commands: 0,
      referralCode: user.referral_code || '-',
      email: user.email || '-',
      phone: user.phone || '-',
      avatar_url: user.avatar_url
    };
  }

  async getUsersStatistics(): Promise<{
    success: boolean;
    data?: {
      dealers: number;
      celebrities: number;
      employees: number;
    };
    error?: string;
  }> {
    try {
      const [dealersCount, celebritiesCount, employeesCount] = await Promise.all([
        this.getTotalCount(['dealer']),
        this.getTotalCount(['celebrity']),
        this.getTotalCount(['admin', 'financier', 'user'])
      ]);

      return {
        success: true,
        data: {
          dealers: dealersCount,
          celebrities: celebritiesCount,
          employees: employeesCount
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
}