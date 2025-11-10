import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';

export interface Sponsor {
  id: string;
  name: string;
  avatar: string;
  status: string;
  profession: string;
  phone: string;
  is_confirmed: boolean;
  referrals_count: number;
}

export interface SponsorResponse {
  sponsor: Sponsor | null;
  has_sponsor: boolean;
}

export class SponsorService {
  /**
   * Получить информацию о спонсоре пользователя по parent_id
   */
  static async getUserSponsor(userId: string): Promise<SponsorResponse> {
    try {
      // Находим пользователя с его parent_id
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('parent_id')
        .eq('id', userId)
        .single();

      if (userError) {
        throw new Error('Не удалось найти пользователя');
      }

      // Если нет parent_id, значит нет спонсора
      if (!user?.parent_id) {
        return {
          sponsor: null,
          has_sponsor: false,
        };
      }

      // Получаем информацию о спонсоре
      const { data: sponsor, error: sponsorError } = await supabase
        .from('users')
        .select(
          `
            id,
            first_name,
            last_name,
            avatar_url,
            role,
            profession,
            phone,
            is_confirmed
          `,
        )
        .eq('id', user.parent_id)
        .single();

      if (sponsorError || !sponsor) {
        return {
          sponsor: null,
          has_sponsor: false,
        };
      }

      // Получаем количество рефералов спонсора
      const { count: referralsCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', sponsor.id);

      // Формируем данные спонсора
      const sponsorData: Sponsor = {
        id: sponsor.id,
        name: `${sponsor.first_name || ''} ${sponsor.last_name || ''}`.trim() || 'Без имени',
        avatar: sponsor.avatar_url || '/icons/default-avatar.png',
        status: this.mapRoleToStatus(sponsor.role || 'user'),
        profession: sponsor.profession || '',
        phone: sponsor.phone || '',
        is_confirmed: sponsor.is_confirmed || false,
        referrals_count: referralsCount || 0,
      };

      return {
        sponsor: sponsorData,
        has_sponsor: true,
      };
    } catch (error) {
      throw new Error('Не удалось получить информацию о спонсоре');
    }
  }

  /**
   * Получить количество рефералов спонсора
   */
  static async getSponsorReferralsCount(sponsorId: string): Promise<number> {
    try {
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', sponsorId);

      return count || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Получить детальную информацию о спонсоре
   */
  static async getSponsorDetails(sponsorId: string): Promise<Sponsor | null> {
    try {
      const { data: sponsor, error } = await supabase
        .from('users')
        .select(
          `
            id,
            first_name,
            last_name,
            avatar_url,
            role,
            profession,
            phone,
            is_confirmed
          `,
        )
        .eq('id', sponsorId)
        .single();

      if (error || !sponsor) {
        return null;
      }

      // Получаем количество рефералов
      const { count: referralsCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', sponsor.id);

      return {
        id: sponsor.id,
        name: `${sponsor.first_name || ''} ${sponsor.last_name || ''}`.trim() || 'Без имени',
        avatar: sponsor.avatar_url || '/icons/default-avatar.png',
        status: this.mapRoleToStatus(sponsor.role || 'user'),
        profession: sponsor.profession || '',
        phone: sponsor.phone || '',
        is_confirmed: sponsor.is_confirmed || false,
        referrals_count: referralsCount || 0,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Маппинг роли в статус
   */
  private static mapRoleToStatus(role: string): string {
    const roleMap: Record<string, string> = {
      admin: 'CEO',
      celebrity: 'Ambassador',
      dealer: 'Partner',
      user: 'Member',
    };

    return roleMap[role] || 'Member';
  }
}

export const sponsorService = new SponsorService();