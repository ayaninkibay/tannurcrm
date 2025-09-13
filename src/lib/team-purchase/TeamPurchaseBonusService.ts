// TeamPurchaseBonusService.ts
import { supabase } from '@/lib/supabase/client';

class TeamPurchaseBonusService {
  /**
   * Расчет бонусов для закупки
   */
  async calculateBonuses(purchaseId: string) {
    const { data, error } = await supabase.rpc('calculate_team_purchase_bonuses', {
      p_team_purchase_id: purchaseId
    });

    if (error) {
      console.error('Error calculating bonuses:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }

    return data; // {success, team_level, team_percent, total_bonuses, bonus_count, bonuses}
  }

  /**
   * Одобрение бонусов администратором
   */
  async approveBonuses(purchaseId: string, approverId: string) {
    const { data, error } = await supabase.rpc('approve_team_bonuses', {
      p_team_purchase_id: purchaseId,
      p_approver_id: approverId
    });

    if (error) {
      console.error('Error approving bonuses:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }

    return data; // {success, message, approved_count, total_amount}
  }

  /**
   * Выплата бонусов (создание записей в bonus_payots)
   */
  async payoutBonuses(purchaseId: string) {
    const { data, error } = await supabase.rpc('payout_team_bonuses', {
      p_team_purchase_id: purchaseId
    });

    if (error) {
      console.error('Error paying out bonuses:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }

    return data; // {success, message, paid_count, total_paid}
  }

  /**
   * Получение списка рассчитанных бонусов
   */
  async getBonusList(purchaseId: string) {
    const { data, error } = await supabase
      .from('team_purchase_bonuses')
      .select(`
        *,
        beneficiary:users!team_purchase_bonuses_beneficiary_id_fkey(
          id, email, first_name, last_name
        ),
        contributor:users!team_purchase_bonuses_contributor_id_fkey(
          id, email, first_name, last_name
        )
      `)
      .eq('team_purchase_id', purchaseId)
      .order('hierarchy_level', { ascending: true });

    if (error) {
      console.error('Error fetching bonuses:', error);
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data };
  }

  /**
   * Получение статистики по бонусам закупки
   */
  async getBonusStats(purchaseId: string) {
    const { data: purchase } = await supabase
      .from('team_purchases')
      .select(`
        bonuses_calculated,
        bonuses_calculated_at,
        bonuses_approved,
        bonuses_approved_at,
        bonuses_approved_by
      `)
      .eq('id', purchaseId)
      .single();

    const { data: bonuses } = await supabase
      .from('team_purchase_bonuses')
      .select('bonus_amount, calculation_status, payment_status')
      .eq('team_purchase_id', purchaseId);

    const stats = {
      isCalculated: purchase?.bonuses_calculated || false,
      isApproved: purchase?.bonuses_approved || false,
      calculatedAt: purchase?.bonuses_calculated_at,
      approvedAt: purchase?.bonuses_approved_at,
      totalBonuses: bonuses?.reduce((sum, b) => sum + (b.bonus_amount || 0), 0) || 0,
      bonusCount: bonuses?.length || 0,
      paidCount: bonuses?.filter(b => b.payment_status === 'paid').length || 0,
      pendingCount: bonuses?.filter(b => b.payment_status === 'pending').length || 0
    };

    return stats;
  }

  /**
   * Обновление целевого вклада участника
   */
  async updateMemberContribution(
    purchaseId: string, 
    userId: string, 
    newAmount: number
  ) {
    const { data: member } = await supabase
      .from('team_purchase_members')
      .select('id, status')
      .eq('team_purchase_id', purchaseId)
      .eq('user_id', userId)
      .single();

    if (!member) {
      return { success: false, message: 'Участник не найден' };
    }

    // Нельзя менять после оплаты
    if (member.status === 'purchased') {
      return { success: false, message: 'Нельзя изменить после оплаты' };
    }

    const { error } = await supabase
      .from('team_purchase_members')
      .update({
        contribution_target: newAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', member.id);

    if (error) {
      return { success: false, message: error.message };
    }

    // Обновляем общую сумму закупки
    await this.updatePurchaseTotals(purchaseId);

    return { success: true, message: 'Вклад обновлен' };
  }

  /**
   * Пересчет сумм закупки
   */
  private async updatePurchaseTotals(purchaseId: string) {
    const { data: members } = await supabase
      .from('team_purchase_members')
      .select('contribution_target, contribution_actual, status')
      .eq('team_purchase_id', purchaseId)
      .in('status', ['accepted', 'purchased']);

    const targetTotal = members?.reduce((sum, m) => 
      sum + (m.contribution_target || 0), 0) || 0;
    
    const paidTotal = members
      ?.filter(m => m.status === 'purchased')
      .reduce((sum, m) => sum + (m.contribution_actual || 0), 0) || 0;

    await supabase
      .from('team_purchases')
      .update({
        collected_amount: targetTotal,
        paid_amount: paidTotal
      })
      .eq('id', purchaseId);
  }
}

export const teamPurchaseBonusService = new TeamPurchaseBonusService();