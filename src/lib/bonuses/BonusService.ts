// src/lib/bonuses/BonusService.ts

import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';
import type { 
  BonusLevel, 
  UserTurnover, 
  MonthlyBonus, 
  DealerHierarchy, 
  TeamMember,
  BonusCalculationPreview,
  UserBonusDetails,
  BonusStatistics,
  OrderHistory,
  TransactionHistory,
  TeamTreeNode
} from '@/types/bonus.types';

export class BonusService {
  // ============= Уровни бонусов =============
  static async getBonusLevels(): Promise<BonusLevel[]> {
    const { data, error } = await supabase
      .from('bonus_levels')
      .select('*')
      .eq('is_active', true)
      .order('min_amount', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getCurrentBonusLevel(amount: number): Promise<BonusLevel | null> {
    const levels = await this.getBonusLevels();
    
    for (const level of levels.reverse()) {
      if (amount >= level.min_amount) {
        if (!level.max_amount || amount <= level.max_amount) {
          return level;
        }
      }
    }
    
    return null;
  }

  // ============= Товарооборот =============
  static async getUserTurnover(userId: string): Promise<UserTurnover | null> {
    const { data, error } = await supabase
      .from('user_turnover_current')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async getAllUsersTurnover(month?: string): Promise<UserTurnover[]> {
    let query = supabase
      .from('user_turnover_current')
      .select(`
        *,
        users!user_turnover_current_user_id_fkey (
          id,
          email,
          first_name,
          last_name,
          phone,
          parent_id,
          role
        )
      `)
      .order('total_turnover', { ascending: false });

    if (month) {
      const monthDate = `${month}-01`;
      query = query.eq('month_start', monthDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return (data || []).map(user => ({
      ...user,
      team_turnover: (user.total_turnover || 0) - (user.personal_turnover || 0)
    }));
  }

  // ============= Работа с историческими данными =============
  static async getTurnoverForMonth(month: string): Promise<{
    data: any[];
    source: 'current' | 'history';
    status?: string;
  }> {
    const currentMonth = this.getCurrentMonth();
    
    if (month === currentMonth) {
      const { data, error } = await supabase
        .from('user_turnover_current')
        .select(`
          *,
          users!user_turnover_current_user_id_fkey (
            id,
            email,
            first_name,
            last_name,
            phone,
            parent_id,
            role,
            status
          )
        `)
        .order('total_turnover', { ascending: false });

      if (error) throw error;
      
      return {
        data: (data || []).map(user => ({
          ...user,
          team_turnover: (user.total_turnover || 0) - (user.personal_turnover || 0)
        })),
        source: 'current'
      };
    } else {
      const monthDate = `${month}-01`;
      
      const { data, error } = await supabase
        .from('user_turnover_history')
        .select(`
          *,
          users!user_turnover_history_user_id_fkey (
            id,
            email,
            first_name,
            last_name,
            phone,
            parent_id,
            role,
            status
          )
        `)
        .eq('month_start', monthDate)
        .order('total_turnover', { ascending: false });

      if (error) throw error;
      
      return {
        data: (data || []).map(record => ({
          user_id: record.user_id,
          month_start: record.month_start,
          personal_turnover: record.personal_turnover || 0,
          team_turnover: record.team_turnover || 0,
          total_turnover: record.total_turnover || 0,
          bonus_percent: record.bonus_percent || 0,
          bonus_amount: record.bonus_amount || 0,
          users: record.users,
          status: record.status
        })),
        source: 'history',
        status: data?.[0]?.status
      };
    }
  }

  // ОБНОВЛЕННЫЙ МЕТОД ПОИСКА - ищет среди ВСЕХ дилеров
  static async searchUsersWithTurnover(query: string, month: string): Promise<any[]> {
    const turnoverData = await this.getTurnoverForMonth(month);
    
    // Если нет запроса - возвращаем только ТОП дилеров
    if (!query.trim()) {
      return turnoverData.data.filter(record => 
        record.users && !record.users.parent_id
      );
    }
    
    // Фильтруем по поисковому запросу среди ВСЕХ пользователей
    const lowerQuery = query.toLowerCase();
    
    const filteredData = turnoverData.data.filter(record => {
      if (!record.users) return false;
      
      const user = record.users;
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
      
      return (
        user.email?.toLowerCase().includes(lowerQuery) ||
        user.first_name?.toLowerCase().includes(lowerQuery) ||
        user.last_name?.toLowerCase().includes(lowerQuery) ||
        fullName.includes(lowerQuery) ||
        user.phone?.includes(query)
      );
    });
    
    return filteredData;
  }

  static async getMonthStatus(month: string): Promise<{
    isCurrentMonth: boolean;
    isHistorical: boolean;
    isFuture: boolean;
    isFinalized: boolean;
    isPaid: boolean;
    canCalculate: boolean;
    canFinalize: boolean;
    hasData: boolean;
    dataCount: number;
  }> {
    const currentMonth = this.getCurrentMonth();
    const isCurrentMonth = month === currentMonth;
    const isHistorical = month < currentMonth;
    const isFuture = month > currentMonth;
    
    let isFinalized = false;
    let isPaid = false;
    let hasData = false;
    let dataCount = 0;
    
    if (isHistorical) {
      const monthDate = `${month}-01`;
      const { data, error } = await supabase
        .from('user_turnover_history')
        .select('status')
        .eq('month_start', monthDate)
        .limit(1);
      
      if (data && data.length > 0) {
        hasData = true;
        isFinalized = data[0].status === 'finalized' || data[0].status === 'paid';
        isPaid = data[0].status === 'paid';
      }
      
      const { count } = await supabase
        .from('user_turnover_history')
        .select('*', { count: 'exact', head: true })
        .eq('month_start', monthDate);
      
      dataCount = count || 0;
    } else if (isCurrentMonth) {
      const { count } = await supabase
        .from('user_turnover_current')
        .select('*', { count: 'exact', head: true });
      
      hasData = (count || 0) > 0;
      dataCount = count || 0;
    }
    
    return {
      isCurrentMonth,
      isHistorical,
      isFuture,
      isFinalized,
      isPaid,
      canCalculate: isCurrentMonth && hasData,
      canFinalize: isCurrentMonth && hasData && !isFinalized,
      hasData,
      dataCount
    };
  }

  static async getUserTurnoverHistory(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_turnover_history')
      .select('*')
      .eq('user_id', userId)
      .order('month_start', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async checkSystemHealthForMonth(month: string): Promise<{
    hasIssues: boolean;
    issuesCount: number;
    canProceed: boolean;
    message: string;
  }> {
    const currentMonth = this.getCurrentMonth();
    
    if (month < currentMonth) {
      return {
        hasIssues: false,
        issuesCount: 0,
        canProceed: true,
        message: 'Исторические данные'
      };
    }
    
    const issues = await this.auditTurnoverCheck();
    const problemsOnly = issues.filter(i => !i.is_correct);
    
    return {
      hasIssues: problemsOnly.length > 0,
      issuesCount: problemsOnly.length,
      canProceed: problemsOnly.length === 0,
      message: problemsOnly.length > 0 
        ? `Найдено ${problemsOnly.length} проблем. Требуется аудит.`
        : 'Система работает корректно'
    };
  }

  // ============= Расчет бонусов =============
  static async calculateMonthlyBonuses(month?: string): Promise<BonusCalculationPreview> {
    const { data, error } = await supabase.rpc('calculate_monthly_bonuses_preview', {
      p_month: month || null
    });

    if (error) throw error;
    return data;
  }

  static async finalizeMonthlyBonuses(month?: string): Promise<any> {
    const { data, error } = await supabase.rpc('finalize_monthly_bonuses', {
      p_month: month || null
    });

    if (error) throw error;
    return data;
  }

  static async finalizeMonthlyTurnover(
    month?: string, 
    userId?: string
  ): Promise<{
    users_processed: number;
    total_bonus_amount: number;
    status: string;
  }> {
    const { data, error } = await supabase.rpc('finalize_monthly_turnover', {
      p_month: month || null,
      p_user_id: userId || null
    });
    
    if (error) throw error;
    return data?.[0];
  }

  static async initializeCurrentMonth(): Promise<void> {
    const { error } = await supabase.rpc('initialize_current_month_turnover');
    
    if (error) throw error;
  }

  static async checkAndResetMonth(): Promise<void> {
    const { error } = await supabase.rpc('check_and_reset_month');
    
    if (error) throw error;
  }

  static async recalculateUserTurnover(userId: string): Promise<void> {
    const { error } = await supabase.rpc('recalculate_user_turnover_current', {
      p_user_id: userId
    });
    
    if (error) throw error;
  }

  // ============= Месячные бонусы =============
  static async getMonthlyBonuses(month: string, userId?: string): Promise<MonthlyBonus[]> {
    let query = supabase
      .from('monthly_bonuses')
      .select(`
        *,
        beneficiary:users!monthly_bonuses_beneficiary_id_fkey (
          id,
          email,
          first_name,
          last_name
        ),
        contributor:users!monthly_bonuses_contributor_id_fkey (
          id,
          email,
          first_name,
          last_name
        )
      `)
      .eq('month_period', month);

    if (userId) {
      query = query.or(`beneficiary_id.eq.${userId},contributor_id.eq.${userId}`);
    }

    const { data, error } = await query.order('bonus_amount', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  // ============= Иерархия команды =============
  static async getDealerHierarchy(month?: string): Promise<DealerHierarchy[]> {
    const { data, error } = await supabase.rpc('get_dealer_hierarchy_with_bonuses', {
      p_month: month || null
    });

    if (error) throw error;
    return data || [];
  }

  static async getUserTeam(userId: string): Promise<TeamMember[]> {
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        phone,
        avatar_url,
        parent_id,
        created_at,
        status
      `);

    if (usersError) throw usersError;

    const { data: turnoverData, error: turnoverError } = await supabase
      .from('user_turnover_current')
      .select('*');

    if (turnoverError) throw turnoverError;

    const turnoverMap = new Map(
      turnoverData?.map(t => [t.user_id, t]) || []
    );

    const usersMap = new Map(allUsers.map(u => [u.id, u]));
    
    const collectTeamMembers = (rootId: string, level: number = 0): TeamMember[] => {
      const result: TeamMember[] = [];
      const directMembers = allUsers.filter(u => u.parent_id === rootId);
      
      for (const member of directMembers) {
        const turnover = turnoverMap.get(member.id);
        const personalTurnover = turnover?.personal_turnover || 0;
        const totalTurnover = turnover?.total_turnover || 0;
        const bonusPercent = turnover?.bonus_percent || 0;
        
        const teamMember: TeamMember = {
          user_id: member.id,
          email: member.email,
          full_name: `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.email,
          phone: member.phone,
          avatar_url: member.avatar_url,
          parent_id: member.parent_id,
          level: level + 1,
          personal_turnover: personalTurnover,
          team_turnover: Math.max(0, totalTurnover - personalTurnover),
          total_turnover: totalTurnover,
          bonus_percent: bonusPercent,
          bonus_amount: personalTurnover * bonusPercent / 100,
          team_size: 0,
          status: member.status,
          joined_date: member.created_at
        };
        
        result.push(teamMember);
        
        const subTeam = collectTeamMembers(member.id, level + 1);
        teamMember.team_size = subTeam.length;
        result.push(...subTeam);
      }
      
      return result;
    };
    
    return collectTeamMembers(userId);
  }

  static async buildTeamTree(userId: string): Promise<TeamTreeNode> {
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        phone,
        avatar_url,
        parent_id,
        created_at,
        status
      `);

    if (usersError) throw usersError;

    const { data: turnoverData, error: turnoverError } = await supabase
      .from('user_turnover_current')
      .select('*');

    if (turnoverError) throw turnoverError;

    const turnoverMap = new Map(
      turnoverData?.map(t => [t.user_id, t]) || []
    );

    const rootUser = allUsers.find(u => u.id === userId);
    if (!rootUser) throw new Error('User not found');

    const buildNode = (user: any, level: number = 0): TeamTreeNode => {
      const children = allUsers
        .filter(u => u.parent_id === user.id)
        .map(child => buildNode(child, level + 1));

      const turnover = turnoverMap.get(user.id);
      const personalTurnover = turnover?.personal_turnover || 0;
      const totalTurnover = turnover?.total_turnover || 0;
      const bonusPercent = turnover?.bonus_percent || 0;
      const teamTurnover = Math.max(0, totalTurnover - personalTurnover);
      const bonusAmount = personalTurnover * bonusPercent / 100;

      return {
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        email: user.email,
        turnover: personalTurnover,
        personal_turnover: personalTurnover,
        team_turnover: teamTurnover,
        total_turnover: totalTurnover,
        bonus_percent: bonusPercent,
        bonus_amount: bonusAmount,
        children,
        expanded: false,
        level: level
      };
    };

    return buildNode(rootUser, 0);
  }

  // ============= АУДИТ И ПРОВЕРКА ДАННЫХ =============
  static async auditTurnoverCheck(
    userId?: string | null, 
    checkTeam: boolean = false
  ): Promise<{
    user_id: string;
    email: string;
    full_name: string;
    check_type: string;
    stored_value: number;
    calculated_value: number;
    difference: number;
    is_correct: boolean;
  }[]> {
    const { data, error } = await supabase.rpc('audit_turnover_check', {
      p_user_id: userId || null,
      p_check_team: checkTeam
    });

    if (error) throw error;
    return data || [];
  }

  static async fixPersonalTurnover(userId: string): Promise<{
    user_id: string;
    old_value: number;
    new_value: number;
    difference: number;
    fixed: boolean;
  }> {
    const { data, error } = await supabase.rpc('fix_personal_turnover', {
      p_user_id: userId
    });

    if (error) throw error;
    return data;
  }

  static async fixTeamTurnover(userId: string): Promise<{
    user_id: string;
    old_team: number;
    new_team: number;
    old_total: number;
    new_total: number;
    fixed: boolean;
  }> {
    const { data, error } = await supabase.rpc('fix_team_turnover', {
      p_user_id: userId
    });

    if (error) throw error;
    return data;
  }

  static async fixUserHierarchy(userId: string): Promise<{
    fixed_users: string[];
    count: number;
    timestamp: string;
  }> {
    const { data, error } = await supabase.rpc('fix_user_hierarchy', {
      p_user_id: userId
    });

    if (error) throw error;
    return data;
  }

  static async fixAllIssues(): Promise<{
    fixed_count: number;
    fixed_users: string[];
    timestamp: string;
  }> {
    const { data, error } = await supabase.rpc('fix_all_issues');

    if (error) throw error;
    return data;
  }

  // ============= Финализация =============
  static async finalizePreviousMonth(): Promise<{
    month_finalized: string;
    users_count: number;
    total_bonuses: number;
    status: string;
  }> {
    const { data, error } = await supabase.rpc('finalize_previous_month');

    if (error) throw error;
    
    return data?.[0] || { 
      month_finalized: '', 
      users_count: 0, 
      total_bonuses: 0, 
      status: 'Error' 
    };
  }

  // ============= Детальная информация =============
  static async getUserBonusDetails(userId: string): Promise<UserBonusDetails> {
    const { data: userInfo } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!userInfo) throw new Error('User not found');

    const turnover = await this.getUserTurnover(userId);
    const bonusLevel = turnover 
      ? await this.getCurrentBonusLevel(turnover.total_turnover)
      : null;

    const currentMonth = new Date().toISOString().substring(0, 7);
    const monthlyBonuses = await this.getMonthlyBonuses(currentMonth, userId);
    const teamStructure = await this.getUserTeam(userId);

    const { data: sponsorChain } = await supabase.rpc('get_sponsor_chain', {
      p_user_id: userId,
      p_levels: 10
    });

    return {
      user_info: {
        id: userInfo.id,
        email: userInfo.email,
        full_name: `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim(),
        phone: userInfo.phone,
        avatar_url: userInfo.avatar_url,
        role: userInfo.role,
        joined_date: userInfo.created_at
      },
      current_turnover: turnover,
      bonus_level: bonusLevel,
      monthly_bonuses: monthlyBonuses,
      team_structure: teamStructure,
      sponsor_chain: sponsorChain || []
    };
  }

  // ============= История =============
  static async getUserOrderHistory(userId: string, limit = 50): Promise<OrderHistory[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        total_amount,
        order_status,
        payment_status,
        created_at,
        order_items (id)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(order => ({
      ...order,
      items_count: order.order_items?.length || 0
    }));
  }

  static async getUserTransactionHistory(userId: string, limit = 100): Promise<TransactionHistory[]> {
    const { data, error } = await supabase
      .from('balance_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // ============= Статистика =============
  static async getUserBonusStatistics(userId: string): Promise<BonusStatistics> {
    const currentMonth = new Date().toISOString().substring(0, 7);
    
    const turnover = await this.getUserTurnover(userId);
    const currentLevel = turnover 
      ? await this.getCurrentBonusLevel(turnover.total_turnover)
      : null;
    
    const levels = await this.getBonusLevels();
    const nextLevel = levels.find(level => 
      level.min_amount > (turnover?.total_turnover || 0)
    );

    const team = await this.getUserTeam(userId);
    const activeMembers = team.filter(m => m.personal_turnover > 0);

    const transactions = await this.getUserTransactionHistory(userId);
    const bonusTransactions = transactions.filter(t => 
      t.transaction_type === 'order_bonus' || 
      t.transaction_type === 'team_purchase_bonus' ||
      t.transaction_type === 'referral_subscription'
    );

    const totalEarned = bonusTransactions
      .filter(t => t.operation === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalPaid = bonusTransactions
      .filter(t => t.status === 'confirmed')
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingAmount = bonusTransactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    const topPerformers = [...team]
      .filter(m => m.level === 1)
      .sort((a, b) => b.total_turnover - a.total_turnover)
      .slice(0, 5);

    return {
      current_month: {
        personal_turnover: turnover?.personal_turnover || 0,
        team_turnover: (turnover?.total_turnover || 0) - (turnover?.personal_turnover || 0),
        total_turnover: turnover?.total_turnover || 0,
        expected_bonus: turnover 
          ? (turnover.personal_turnover * (turnover.bonus_percent / 100))
          : 0,
        bonus_percent: turnover?.bonus_percent || 0,
        current_level: currentLevel,
        next_level: nextLevel || null,
        amount_to_next_level: nextLevel 
          ? nextLevel.min_amount - (turnover?.total_turnover || 0)
          : 0
      },
      history: {
        total_earned: totalEarned,
        total_paid: totalPaid,
        pending_amount: pendingAmount,
        months_active: 0,
        average_monthly_bonus: totalEarned / 12
      },
      team: {
        total_members: team.length,
        active_members: activeMembers.length,
        total_team_turnover: team.reduce((sum, m) => sum + m.total_turnover, 0),
        direct_members: team.filter(m => m.level === 1).length,
        levels_deep: Math.max(0, ...team.map(m => m.level)),
        top_performers: topPerformers
      }
    };
  }

  // ============= Поиск =============
  static async searchUsers(query: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        phone,
        role,
        user_turnover_current (
          total_turnover,
          personal_turnover,
          bonus_percent
        )
      `)
      .or(`email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(20);

    if (error) throw error;
    return data || [];
  }

  // ============= Утилиты для UI =============
  static async checkSystemHealth(): Promise<{
    hasIssues: boolean;
    issuesCount: number;
    details: any[];
  }> {
    const issues = await this.auditTurnoverCheck();
    const problemsOnly = issues.filter(i => !i.is_correct);
    
    return {
      hasIssues: problemsOnly.length > 0,
      issuesCount: problemsOnly.length,
      details: problemsOnly
    };
  }

  static async canFinalize(): Promise<{
    canFinalize: boolean;
    reason?: string;
  }> {
    const health = await this.checkSystemHealth();
    
    if (health.hasIssues) {
      return {
        canFinalize: false,
        reason: `Найдено ${health.issuesCount} проблем. Необходимо исправить перед финализацией.`
      };
    }

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const monthStr = lastMonth.toISOString().substring(0, 7);

    const { data: history } = await supabase
      .from('user_turnover_history')
      .select('id')
      .eq('month_start', `${monthStr}-01`)
      .eq('status', 'finalized')
      .limit(1);

    if (history && history.length > 0) {
      return {
        canFinalize: false,
        reason: 'Месяц уже финализирован'
      };
    }

    return { canFinalize: true };
  }

  static formatAuditResults(results: any[]): {
    byUser: Map<string, any[]>;
    byType: Map<string, any[]>;
    summary: {
      totalIssues: number;
      usersAffected: number;
      types: string[];
    };
  } {
    const byUser = new Map();
    const byType = new Map();
    
    results.forEach(r => {
      if (!byUser.has(r.user_id)) {
        byUser.set(r.user_id, []);
      }
      byUser.get(r.user_id).push(r);
      
      if (!byType.has(r.check_type)) {
        byType.set(r.check_type, []);
      }
      byType.get(r.check_type).push(r);
    });

    return {
      byUser,
      byType,
      summary: {
        totalIssues: results.filter(r => !r.is_correct).length,
        usersAffected: byUser.size,
        types: Array.from(byType.keys())
      }
    };
  }

  // ============= Утилиты =============
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('KZT', '₸');
  }

  static formatPercent(percent: number): string {
    return `${percent}%`;
  }

  static getCurrentMonth(): string {
    return new Date().toISOString().substring(0, 7);
  }

  static getCurrentMonthDate(): string {
    return new Date().toISOString().substring(0, 7) + '-01';
  }

  static getMonthName(month: string): string {
    const date = new Date(month + '-01');
    return date.toLocaleDateString('ru-RU', { 
      year: 'numeric', 
      month: 'long' 
    });
  }
}