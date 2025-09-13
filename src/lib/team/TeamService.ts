import { supabase } from '@/lib/supabase/client';
import type { User } from '@/types/custom.types';

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
  level?: number;
  turnover?: number;
  referralCode?: string;
  position?: string;
}

export interface TeamStats {
  totalMembers: number;
  directMembers: number;
  totalTurnover: number;
  activeMembersCount: number;
  goal: number;
  remaining: number;
}

export class TeamService {
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

  static async getDealerTeam(dealerId: string): Promise<TeamMember[]> {
    try {
      return await this.getTeamDirectly(dealerId);
    } catch (error) {
      console.error('Ошибка получения команды дилера:', error);
      return [];
    }
  }

  static async getAllMembers(): Promise<TeamMember[]> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return this.transformUsersToTeamMembers(users || []);
    } catch (error) {
      console.error('Ошибка получения всех пользователей:', error);
      return [];
    }
  }

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

  static async getTeamStats(userId: string): Promise<TeamStats> {
    try {
      const members = await this.getMyTeam(userId);
      
      const totalMembers = members.filter(m => m.id !== userId).length;
      const directMembers = members.filter(m => m.parentId === userId).length;
      const totalTurnover = members.reduce((sum, member) => sum + (member.turnover || 0), 0);
      const activeMembersCount = members.filter(m => m.verified && m.id !== userId).length;
      
      const { goal, shouldConfirm } = this.calculateGoalAndStatus(totalMembers);
      
      if (shouldConfirm) {
        await this.confirmUserStatus(userId);
      }
      
      const remaining = Math.max(0, goal - totalMembers);

      return {
        totalMembers,
        directMembers,
        totalTurnover,
        activeMembersCount,
        goal,
        remaining
      };
    } catch (error) {
      console.error('Ошибка получения статистики:', error);
      return {
        totalMembers: 0,
        directMembers: 0,
        totalTurnover: 0,
        activeMembersCount: 0,
        goal: 10,
        remaining: 10
      };
    }
  }

  private static calculateGoalAndStatus(totalMembers: number): { goal: number; shouldConfirm: boolean } {
    if (totalMembers < 10) {
      return { goal: 10, shouldConfirm: false };
    } else if (totalMembers === 10) {
      return { goal: 100, shouldConfirm: true };
    } else {
      return { goal: 100, shouldConfirm: false };
    }
  }

  private static async confirmUserStatus(userId: string): Promise<void> {
    try {
      const { data: currentUser, error: fetchError } = await supabase
        .from('users')
        .select('is_confirmed')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Ошибка получения статуса пользователя:', fetchError);
        return;
      }

      if (currentUser.is_confirmed) {
        return;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ is_confirmed: true })
        .eq('id', userId);

      if (updateError) {
        console.error('Ошибка подтверждения статуса пользователя:', updateError);
      } else {
        console.log(`Статус пользователя ${userId} автоматически подтвержден при достижении 10 участников команды`);
      }
    } catch (error) {
      console.error('Ошибка в процессе подтверждения статуса:', error);
    }
  }

  static async getUserGoalInfo(userId: string): Promise<{
    currentGoal: number;
    progress: number;
    isConfirmed: boolean;
    goalDescription: string;
  }> {
    try {
      const members = await this.getMyTeam(userId);
      const totalMembers = members.filter(m => m.id !== userId).length;
      
      const { data: user, error } = await supabase
        .from('users')
        .select('is_confirmed')
        .eq('id', userId)
        .single();

      const isConfirmed = user?.is_confirmed || false;

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
      console.error('Ошибка получения информации о цели:', error);
      return {
        currentGoal: 10,
        progress: 0,
        isConfirmed: false,
        goalDescription: 'Пригласите 10 участников для подтверждения статуса'
      };
    }
  }

  private static transformUsersToTeamMembers(users: any[]): TeamMember[] {
    const members: TeamMember[] = users.map(user => ({
      id: user.id,
      parentId: user.parent_id,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Без имени',
      avatar: user.avatar_url,
      profession: user.profession,
      role: this.mapRoleToPosition(user.role),
      position: user.profession || this.mapRoleToPosition(user.role),
      verified: user.is_confirmed || false,
      teamCount: 0,
      email: user.email,
      phone: user.phone,
      level: user.personal_level,
      turnover: user.personal_turnover,
      referralCode: user.referral_code
    }));

    members.forEach(member => {
      member.teamCount = this.countTeamMembers(member.id, members);
    });

    return members;
  }

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

  private static countTeamMembers(userId: string, allMembers: TeamMember[]): number {
    let count = 0;
    const children = allMembers.filter(m => m.parentId === userId);
    
    count += children.length;
    
    children.forEach(child => {
      count += this.countTeamMembers(child.id, allMembers);
    });
    
    return count;
  }
}