// services/team.service.ts
import { supabase } from '@/lib/supabase/client';
import type { TeamStatsData } from '../../types/team.types';  // ⭐ ИМПОРТИРУЕМ НОВЫЙ ТИП

export interface TeamMember {
  id: string;
  parentId: string | null;
  name: string;
  avatar?: string;
  profession?: string;
  role?: string;
  verified: boolean;
  teamCount?: number;
  email?: string;
  phone?: string;
  turnover?: number;
  referralCode?: string;
  position?: string;
  hierarchyLevel?: number;
  hierarchyPath?: string[];
}

// ⭐ СТАРЫЙ ТИП - ОСТАВЛЯЕМ ДЛЯ ОБРАТНОЙ СОВМЕСТИМОСТИ
export interface TeamStats {
  totalMembers: number;
  directMembers: number;
  totalTurnover: number;
  activeMembersCount: number;
  maxDepth?: number;
  goal: number;
  remaining: number;
}

export class TeamService {
  // Кэш для команды
  private static teamCache: Map<string, { data: TeamMember[], timestamp: number }> = new Map();
  private static CACHE_TTL = 5 * 60 * 1000; // 5 минут

  // ============================================
  // ОСНОВНЫЕ МЕТОДЫ
  // ============================================

  /**
   * Получить всю команду пользователя (с кэшированием)
   * Использует Recursive CTE для максимальной производительности
   */
  static async getMyTeam(userId: string, useCache: boolean = true): Promise<TeamMember[]> {
    try {
      // Проверяем кэш
      if (useCache) {
        const cached = this.teamCache.get(userId);
        if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
          console.log('📦 Загружено из кэша');
          return cached.data;
        }
      }

      // Запрос к БД через RPC функцию
      const { data, error } = await supabase
        .rpc('get_full_team_hierarchy', { root_user_id: userId });

      if (error) {
        console.error('❌ Ошибка RPC get_full_team_hierarchy:', error);
        // Fallback на старый метод
        return await this.getTeamDirectlyOptimized(userId);
      }

      const teamMembers = await this.transformUsersToTeamMembers(data || []);
      
      // Сохраняем в кэш
      this.teamCache.set(userId, { data: teamMembers, timestamp: Date.now() });
      
      console.log(`✅ Загружено ${teamMembers.length} участников команды`);
      return teamMembers;
    } catch (error) {
      console.error('❌ Ошибка получения команды:', error);
      return [];
    }
  }

  /**
   * ⭐ НОВЫЙ МЕТОД - Получить статистику команды (возвращает TeamStatsData)
   * Использует SQL функцию get_team_stats
   */
  static async getTeamStats(userId: string): Promise<TeamStatsData> {
    try {
      const { data, error } = await supabase
        .rpc('get_team_stats', { root_user_id: userId });

      if (error) {
        console.error('❌ Ошибка получения статистики:', error);
        return this.getDefaultStatsData();
      }

      const stats = data?.[0];
      
      if (!stats) {
        return this.getDefaultStatsData();
      }

      const totalMembers = Number(stats.total_members || 0);
      const { goal, shouldConfirm } = this.calculateGoalAndStatus(totalMembers);
      
      // Автоподтверждение при достижении 10 участников
      if (shouldConfirm) {
        await this.confirmUserStatus(userId);
      }

      // ⭐ ВОЗВРАЩАЕМ TeamStatsData
      return {
        totalMembers,
        directMembers: Number(stats.direct_members || 0),
        totalTurnover: Number(stats.total_turnover || 0),
        activeMembersCount: Number(stats.active_members || 0),
        maxDepth: Number(stats.max_depth || 0),
        goal,
        remaining: Math.max(0, goal - totalMembers)
      };
    } catch (error) {
      console.error('❌ Ошибка получения статистики:', error);
      return this.getDefaultStatsData();
    }
  }

  /**
   * @deprecated Используйте getTeamStats() - возвращает новый тип TeamStatsData
   * Этот метод оставлен для обратной совместимости
   */
  static async getTeamStatsLegacy(userId: string): Promise<TeamStats> {
    const data = await this.getTeamStats(userId);
    return data;  // Типы совместимы
  }

  /**
   * Получить только прямых рефералов (быстрый запрос)
   */
  static async getDirectReferrals(userId: string): Promise<TeamMember[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('parent_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return this.transformUsersToTeamMembers(data || []);
    } catch (error) {
      console.error('❌ Ошибка получения прямых рефералов:', error);
      return [];
    }
  }

  /**
   * Получить прямых рефералов с их статистикой (через RPC)
   */
  static async getDirectReferralsWithStats(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_direct_referrals_with_stats', { root_user_id: userId });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Ошибка получения рефералов со статистикой:', error);
      return [];
    }
  }

  // ============================================
  // ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ
  // ============================================

  /**
   * Получить команду определенного уровня иерархии
   */
  static async getTeamByLevel(userId: string, level: number): Promise<TeamMember[]> {
    try {
      const allTeam = await this.getMyTeam(userId);
      return allTeam.filter(m => m.hierarchyLevel === level);
    } catch (error) {
      console.error('❌ Ошибка получения команды по уровню:', error);
      return [];
    }
  }

  /**
   * Получить статистику по уровням
   */
  static async getTeamStatsByLevel(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_team_stats_by_level', { root_user_id: userId });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Ошибка получения статистики по уровням:', error);
      return [];
    }
  }

  /**
   * Поиск в команде
   */
  static async searchTeam(userId: string, query: string): Promise<any[]> {
    try {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const { data, error } = await supabase
        .rpc('search_in_team', { 
          root_user_id: userId,
          search_query: query.trim()
        });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Ошибка поиска:', error);
      return [];
    }
  }

  /**
   * Получить топ участников по обороту
   */
  static async getTopPerformers(userId: string, limit: number = 10): Promise<TeamMember[]> {
    const team = await this.getMyTeam(userId);
    
    return team
      .filter(m => m.id !== userId)
      .sort((a, b) => (b.turnover || 0) - (a.turnover || 0))
      .slice(0, limit);
  }

  /**
   * Получить информацию о целях пользователя
   */
  static async getUserGoalInfo(userId: string): Promise<{
    currentGoal: number;
    progress: number;
    isConfirmed: boolean;
    goalDescription: string;
  }> {
    try {
      const stats = await this.getTeamStats(userId);
      
      const { data: user, error } = await supabase
        .from('users')
        .select('is_confirmed')
        .eq('id', userId)
        .single();

      const isConfirmed = user?.is_confirmed || false;
      const totalMembers = stats.totalMembers;

      let currentGoal: number;
      let goalDescription: string;

      if (totalMembers < 10) {
        currentGoal = 10;
        goalDescription = 'Пригласите 10 участников для подтверждения статуса';
      } else {
        currentGoal = 100;
        goalDescription = isConfirmed 
          ? 'Увеличивайте команду до 100 участников' 
          : 'Статус будет подтвержден автоматически';
      }

      return {
        currentGoal,
        progress: totalMembers,
        isConfirmed,
        goalDescription
      };
    } catch (error) {
      console.error('❌ Ошибка получения информации о цели:', error);
      return {
        currentGoal: 10,
        progress: 0,
        isConfirmed: false,
        goalDescription: 'Пригласите 10 участников для подтверждения статуса'
      };
    }
  }

  /**
   * Пагинация команды
   */
  static async getTeamPaginated(
    userId: string,
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ data: TeamMember[], total: number, totalPages: number }> {
    const allTeam = await this.getMyTeam(userId);
    const start = (page - 1) * pageSize;
    
    return {
      data: allTeam.slice(start, start + pageSize),
      total: allTeam.length,
      totalPages: Math.ceil(allTeam.length / pageSize)
    };
  }

  /**
   * Очистить кэш
   */
  static clearCache(userId?: string): void {
    if (userId) {
      this.teamCache.delete(userId);
    } else {
      this.teamCache.clear();
    }
  }

  // ============================================
  // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
  // ============================================

  /**
   * Fallback метод (если RPC функции нет)
   */
  private static async getTeamDirectlyOptimized(userId: string): Promise<TeamMember[]> {
    try {
      console.log('⚠️ Используется fallback метод');
      
      // Получаем ВСЕХ пользователей одним запросом
      const { data: allUsers, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (!allUsers) return [];

      // Строим дерево в памяти
      const team: any[] = [];
      const visited = new Set<string>();

      const collectTeam = (currentId: string) => {
        if (visited.has(currentId)) return;
        visited.add(currentId);

        const user = allUsers.find(u => u.id === currentId);
        if (user) {
          team.push(user);

          // Находим всех детей
          allUsers
            .filter(u => u.parent_id === currentId)
            .forEach(child => collectTeam(child.id));
        }
      };

      collectTeam(userId);

      return this.transformUsersToTeamMembers(team);
    } catch (error) {
      console.error('❌ Ошибка fallback метода:', error);
      return [];
    }
  }

  /**
   * Трансформация данных БД в TeamMember
   */
  private static async transformUsersToTeamMembers(users: any[]): Promise<TeamMember[]> {
    if (users.length === 0) return [];

    // Получаем turnover данные одним запросом
    const userIds = users.map(u => u.id);
    const { data: turnoverData } = await supabase
      .from('user_turnover_current')
      .select('user_id, personal_turnover, total_turnover')
      .in('user_id', userIds);
    
    const turnoverMap = new Map(
      (turnoverData || []).map(t => [t.user_id, t])
    );

    // Функция подсчета потомков
    const countDescendants = (userId: string): number => {
      const children = users.filter(u => u.parent_id === userId);
      return children.reduce(
        (sum, child) => sum + 1 + countDescendants(child.id), 
        0
      );
    };

    return users.map(user => {
      const turnover = turnoverMap.get(user.id);
      return {
        id: user.id,
        parentId: user.parent_id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Без имени',
        avatar: user.avatar_url,
        profession: user.profession,
        role: this.mapRoleToPosition(user.role),
        position: user.profession || this.mapRoleToPosition(user.role),
        verified: user.is_confirmed || false,
        teamCount: countDescendants(user.id),
        email: user.email,
        phone: user.phone,
        turnover: turnover?.personal_turnover || 0,
        referralCode: user.referral_code,
        hierarchyLevel: user.hierarchy_level,
        hierarchyPath: user.hierarchy_path
      };
    });
  }

  /**
   * Маппинг ролей на позиции
   */
  private static mapRoleToPosition(role: string | null): string {
    const roleMap: Record<string, string> = {
      admin: 'CEO',
      celebrity: 'Ambassador',
      dealer: 'Partner',
      user: 'Member',
      financier: 'Financier'
    };
    return roleMap[role || ''] || 'Member';
  }

  /**
   * Расчет цели и необходимости подтверждения
   */
  private static calculateGoalAndStatus(totalMembers: number): { 
    goal: number; 
    shouldConfirm: boolean 
  } {
    if (totalMembers < 10) {
      return { goal: 10, shouldConfirm: false };
    } else if (totalMembers === 10) {
      return { goal: 100, shouldConfirm: true };
    } else {
      return { goal: 100, shouldConfirm: false };
    }
  }

  /**
   * Автоматическое подтверждение статуса при достижении 10 участников
   */
  private static async confirmUserStatus(userId: string): Promise<void> {
    try {
      const { data: currentUser } = await supabase
        .from('users')
        .select('is_confirmed')
        .eq('id', userId)
        .single();

      if (currentUser?.is_confirmed) return;

      await supabase
        .from('users')
        .update({ is_confirmed: true })
        .eq('id', userId);

      console.log(`✅ Статус пользователя ${userId} подтвержден (10+ участников)`);
    } catch (error) {
      console.error('❌ Ошибка подтверждения статуса:', error);
    }
  }

  /**
   * ⭐ НОВЫЙ МЕТОД - Статистика по умолчанию (TeamStatsData)
   */
  private static getDefaultStatsData(): TeamStatsData {
    return {
      totalMembers: 0,
      directMembers: 0,
      totalTurnover: 0,
      activeMembersCount: 0,
      maxDepth: 0,
      goal: 10,
      remaining: 10
    };
  }

  /**
   * @deprecated Используйте getDefaultStatsData()
   */
  private static getDefaultStats(): TeamStats {
    return this.getDefaultStatsData();
  }
}