// src/lib/useredit/user-edit.service.ts

import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';
import type { TeamStatsData } from '@/types/team.types';

type UserRow = Database['public']['Tables']['users']['Row'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export interface UserEditData {
  id: string;
  email: string | null;
  role: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  iin: number | null;
  instagram: string | null;
  region: string | null;
  profession: string | null;
  avatar_url: string | null;
  created_at: string;
  is_confirmed: boolean;
  referral_code: string | null;
  parent_id: string | null;
  star_id: string | null;
  status: string | null;
  permissions: string[] | null;
  temp_bonus_percent: number | null;
  temp_bonus_until: string | null;
}

export interface UpdateUserPayload {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  email?: string | null;
  iin?: number | null;
  region?: string | null;
  profession?: string | null;
  instagram?: string | null;
  role?: string | null;
  status?: string | null;
  is_confirmed?: boolean;
  permissions?: string[] | null;
  parent_id?: string | null;
  star_id?: string | null;
  referral_code?: string | null;
  temp_bonus_percent?: number | null;
  temp_bonus_until?: string | null;
}

export interface UserBalance {
  available_balance: number | null;
  current_balance: number | null;
  frozen_balance: number | null;
  pending_balance: number | null;
  total_earned: number | null;
  total_withdrawn: number | null;
}

export interface UserStats {
  personal_turnover: number;
  total_turnover: number;
  team_size: number;
  orders_count: number;
  bonus_percent: number | null;
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class UserEditService {
  /**
   * Получить данные пользователя по ID
   */
  async getUserById(userId: string): Promise<ServiceResponse<UserEditData>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        return { success: false, error: error.message };
      }

      if (!data) {
        return { success: false, error: 'Пользователь не найден' };
      }

      return { success: true, data: data as UserEditData };
    } catch (error) {
      console.error('Service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }

  /**
   * Обновить данные пользователя
   */
  async updateUser(
    userId: string,
    payload: UpdateUserPayload
  ): Promise<ServiceResponse<UserEditData>> {
    try {
      // Валидация перед обновлением
      if (payload.iin && (payload.iin < 0 || payload.iin > 999999999999)) {
        return { success: false, error: 'Некорректный ИИН' };
      }

      if (payload.temp_bonus_percent && (payload.temp_bonus_percent < 0 || payload.temp_bonus_percent > 100)) {
        return { success: false, error: 'Процент бонуса должен быть от 0 до 100' };
      }

      // Используем RPC функцию с SECURITY DEFINER для обхода RLS
      const { data, error } = await supabase.rpc('admin_update_user', {
        p_user_id: userId,
        p_first_name: payload.first_name ?? null,
        p_last_name: payload.last_name ?? null,
        p_phone: payload.phone ?? null,
        p_email: payload.email ?? null,
        p_iin: payload.iin ?? null,
        p_region: payload.region ?? null,
        p_profession: payload.profession ?? null,
        p_instagram: payload.instagram ?? null,
        p_role: payload.role ?? null,
        p_status: payload.status ?? null,
        p_is_confirmed: payload.is_confirmed ?? null,
        p_parent_id: payload.parent_id ?? null,
        p_referral_code: payload.referral_code ?? null,
        p_temp_bonus_percent: payload.temp_bonus_percent ?? null,
        p_temp_bonus_until: payload.temp_bonus_until ?? null
      });

      if (error) {
        console.error('Error updating user:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as UserEditData };
    } catch (error) {
      console.error('Service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка обновления'
      };
    }
  }

  /**
   * Получить баланс пользователя
   */
  async getUserBalance(userId: string): Promise<ServiceResponse<UserBalance>> {
    try {
      const { data, error } = await supabase
        .from('v_dealer_balances')
        .select('available_balance, current_balance, frozen_balance, pending_balance, total_earned, total_withdrawn')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching balance:', error);
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        data: data as UserBalance
      };
    } catch (error) {
      console.error('Service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка получения баланса'
      };
    }
  }

  /**
   * Получить статистику пользователя (обороты, команда)
   */
  async getUserStats(userId: string): Promise<ServiceResponse<UserStats>> {
    try {
      // Получаем текущий оборот
      const { data: turnoverData, error: turnoverError } = await supabase
        .from('user_turnover_current')
        .select('personal_turnover, total_turnover, bonus_percent')
        .eq('user_id', userId)
        .maybeSingle();

      if (turnoverError) {
        console.error('Error fetching turnover:', turnoverError);
      }

      // Получаем размер команды
      const { data: teamData, error: teamError } = await supabase
        .rpc('get_team_stats', { root_user_id: userId })
        .maybeSingle<TeamStatsData>();

      if (teamError) {
        console.error('Error fetching team stats:', teamError);
      }

      // Получаем количество заказов
      const { count: ordersCount, error: ordersError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (ordersError) {
        console.error('Error fetching orders count:', ordersError);
      }

      return {
        success: true,
        data: {
          personal_turnover: turnoverData?.personal_turnover || 0,
          total_turnover: turnoverData?.total_turnover || 0,
          bonus_percent: turnoverData?.bonus_percent || null,
          team_size: teamData?.totalMembers || 0,
          orders_count: ordersCount || 0
        }
      };
    } catch (error) {
      console.error('Service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка получения статистики'
      };
    }
  }

  /**
   * Получить информацию о спонсоре (parent)
   */
  async getParentInfo(parentId: string | null): Promise<ServiceResponse<{ id: string; name: string; phone: string } | null>> {
    if (!parentId) {
      return { success: true, data: null };
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, phone')
        .eq('id', parentId)
        .single();

      if (error || !data) {
        return { success: true, data: null };
      }

      return {
        success: true,
        data: {
          id: data.id,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Без имени',
          phone: data.phone || '-'
        }
      };
    } catch (error) {
      return { success: true, data: null };
    }
  }

  /**
   * Поиск пользователя для назначения спонсором
   */
  async searchUserForParent(query: string): Promise<ServiceResponse<Array<{ id: string; name: string; phone: string; role: string }>>> {
    try {
      if (!query.trim()) {
        return { success: true, data: [] };
      }

      const searchPattern = `%${query}%`;

      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, phone, role')
        .or(`first_name.ilike.${searchPattern},last_name.ilike.${searchPattern},phone.ilike.${searchPattern}`)
        .limit(10);

      if (error) {
        return { success: false, error: error.message };
      }

      const results = (data || []).map(user => ({
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Без имени',
        phone: user.phone || '-',
        role: user.role || '-'
      }));

      return { success: true, data: results };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка поиска'
      };
    }
  }
}