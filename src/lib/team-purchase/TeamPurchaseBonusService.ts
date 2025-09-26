// TeamPurchaseBonusService.ts
import { supabase } from '@/lib/supabase/client';

class TeamPurchaseBonusService {
  /**
   * Расчет/обновление preview бонусов для закупки
   */
  async calculatePreviewBonuses(purchaseId: string) {
    const { data, error } = await supabase.rpc('calculate_team_purchase_bonuses_preview', {
      p_team_purchase_id: purchaseId
    });

    if (error) {
      console.error('Error calculating preview bonuses:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }

    // Получаем статистику после расчета
    const { data: stats } = await this.getPreviewStats(purchaseId);
    
    return { 
      success: true, 
      message: 'Preview бонусов обновлен',
      ...stats
    };
  }

  /**
   * Финализация бонусов (создание записей в team_purchase_bonuses_final)
   */
async finalizeBonuses(purchaseId: string) {
  // Сначала обязательно рассчитываем preview
  const { data: calcResult, error: calcError } = await supabase.rpc('calculate_team_purchase_bonuses_preview', {
    p_team_purchase_id: purchaseId
  });

  if (calcError) {
    return { 
      success: false, 
      error: `Ошибка расчета preview: ${calcError.message}` 
    };
  }

  // Теперь финализируем
  const { data, error } = await supabase.rpc('finalize_team_purchase_bonuses', {
    p_team_purchase_id: purchaseId
  });

  if (error) {
    console.error('Error finalizing bonuses:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }

  return data;
}

  /**
   * Получение preview бонусов
   */
  async getPreviewBonuses(purchaseId: string) {
    const { data, error } = await supabase
      .from('team_purchase_bonuses_preview')
      .select(`
        *,
        beneficiary:users!team_purchase_bonuses_preview_beneficiary_id_fkey(
          id, email, first_name, last_name
        ),
        contributor:users!team_purchase_bonuses_preview_contributor_id_fkey(
          id, email, first_name, last_name
        )
      `)
      .eq('team_purchase_id', purchaseId)
      .order('hierarchy_level', { ascending: true });

    // Дополняем данными о текущем товарообороте
    const { data: turnoverData } = await supabase
      .from('user_turnover_current')
      .select('user_id, personal_turnover, bonus_percent');

    const enrichedData = (data || []).map(bonus => {
      const beneficiaryTurnover = turnoverData?.find(t => t.user_id === bonus.beneficiary_id);
      const contributorTurnover = turnoverData?.find(t => t.user_id === bonus.contributor_id);
      
      return {
        ...bonus,
        beneficiary_current_turnover: beneficiaryTurnover?.personal_turnover || 0,
        beneficiary_current_percent: beneficiaryTurnover?.bonus_percent || 0,
        contributor_current_turnover: contributorTurnover?.personal_turnover || 0,
        contributor_current_percent: contributorTurnover?.bonus_percent || 0
      };
    });

    if (error) {
      console.error('Error fetching preview bonuses:', error);
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: enrichedData };
  }

  /**
   * Получение финальных бонусов
   */
  async getFinalBonuses(purchaseId: string, monthYear?: string) {
    const currentMonth = monthYear || new Date().toISOString().slice(0, 7);
    
    const { data, error } = await supabase
      .from('team_purchase_bonuses_final')
      .select(`
        *,
        beneficiary:users!team_purchase_bonuses_final_beneficiary_id_fkey(
          id, email, first_name, last_name
        ),
        contributor:users!team_purchase_bonuses_final_contributor_id_fkey(
          id, email, first_name, last_name
        )
      `)
      .eq('team_purchase_id', purchaseId)
      .eq('month_year', currentMonth)
      .order('hierarchy_level', { ascending: true });

    if (error) {
      console.error('Error fetching final bonuses:', error);
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data };
  }

  /**
   * Получение статистики preview бонусов
   */
  async getPreviewStats(purchaseId: string) {
    const { data: bonuses } = await supabase
      .from('team_purchase_bonuses_preview')
      .select('bonus_amount, updated_at')
      .eq('team_purchase_id', purchaseId);

    const stats = {
      totalBonuses: bonuses?.reduce((sum, b) => sum + (b.bonus_amount || 0), 0) || 0,
      bonusCount: bonuses?.length || 0,
      lastUpdated: bonuses?.[0]?.updated_at || null,
      isPreview: true
    };

    return { data: stats };
  }

  /**
   * Получение статистики финальных бонусов
   */
  async getFinalStats(purchaseId: string, monthYear?: string) {
    const currentMonth = monthYear || new Date().toISOString().slice(0, 7);
    
    const { data: bonuses } = await supabase
      .from('team_purchase_bonuses_final')
      .select('bonus_amount, calculation_status, payment_status, balance_transaction_id')
      .eq('team_purchase_id', purchaseId)
      .eq('month_year', currentMonth);

    const { data: hasFinalized } = await supabase
      .from('team_purchase_bonuses_final')
      .select('id')
      .eq('team_purchase_id', purchaseId)
      .eq('month_year', currentMonth)
      .limit(1);

    const stats = {
      isFinalized: (hasFinalized?.length || 0) > 0,
      totalBonuses: bonuses?.reduce((sum, b) => sum + (b.bonus_amount || 0), 0) || 0,
      bonusCount: bonuses?.length || 0,
      approvedCount: bonuses?.filter(b => b.calculation_status === 'approved').length || 0,
      paidCount: bonuses?.filter(b => b.payment_status === 'paid').length || 0,
      transferredCount: bonuses?.filter(b => b.balance_transaction_id !== null).length || 0,
      pendingCount: bonuses?.filter(b => b.payment_status === 'pending').length || 0,
      monthYear: currentMonth
    };

    return { data: stats };
  }

  /**
   * Одобрение финальных бонусов администратором
   */
async approveFinalBonuses(purchaseId: string, approverId: string) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  // Обновляем статус в team_purchase_bonuses_final
  const { data, error } = await supabase
    .from('team_purchase_bonuses_final')
    .update({
      calculation_status: 'approved',
      approved_by: approverId,
      approved_at: new Date().toISOString()
    })
    .eq('team_purchase_id', purchaseId)
    .eq('month_year', currentMonth)
    .eq('calculation_status', 'calculated')
    .select();

  if (error) {
    console.error('Error approving bonuses:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }

  // Также обновляем статус в основной таблице team_purchases
  await supabase
    .from('team_purchases')
    .update({
      bonuses_approved: true,
      bonuses_approved_at: new Date().toISOString(),
      bonuses_approved_by: approverId
    })
    .eq('id', purchaseId);

  return { 
    success: true, 
    message: `Одобрено ${data?.length || 0} бонусов`,
    approved_count: data?.length || 0
  };
}

  /**
   * Выплата финальных бонусов (начисление на баланс)
   */
  async payoutFinalBonuses(purchaseId: string) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Сначала проверяем, есть ли одобренные бонусы
    const { data: bonusesToPay, error: checkError } = await supabase
      .from('team_purchase_bonuses_final')
      .select('id, bonus_amount')
      .eq('team_purchase_id', purchaseId)
      .eq('month_year', currentMonth)
      .eq('calculation_status', 'approved')
      .eq('payment_status', 'pending');

    if (checkError) {
      return { 
        success: false, 
        error: checkError.message 
      };
    }

    if (!bonusesToPay || bonusesToPay.length === 0) {
      return { 
        success: false, 
        error: 'Нет одобренных бонусов для выплаты' 
      };
    }

    // Обновляем статус на paid
    const { error: updateError } = await supabase
      .from('team_purchase_bonuses_final')
      .update({
        payment_status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('team_purchase_id', purchaseId)
      .eq('month_year', currentMonth)
      .eq('calculation_status', 'approved')
      .eq('payment_status', 'pending');

    if (updateError) {
      return { 
        success: false, 
        error: `Ошибка обновления статуса: ${updateError.message}` 
      };
    }

    // Вызываем функцию начисления на баланс
    const { data, error } = await supabase.rpc('process_team_purchase_bonuses_to_balance', {
      p_team_purchase_id: purchaseId
    });

    if (error) {
      // Откатываем статус если не удалось начислить
      await supabase
        .from('team_purchase_bonuses_final')
        .update({
          payment_status: 'pending',
          paid_at: null
        })
        .eq('team_purchase_id', purchaseId)
        .eq('month_year', currentMonth)
        .in('id', bonusesToPay.map(b => b.id));

      return { 
        success: false, 
        error: `Ошибка начисления на баланс: ${error.message}` 
      };
    }

    if (!data.success) {
      // Откатываем статус если функция вернула ошибку
      await supabase
        .from('team_purchase_bonuses_final')
        .update({
          payment_status: 'pending',
          paid_at: null
        })
        .eq('team_purchase_id', purchaseId)
        .eq('month_year', currentMonth)
        .in('id', bonusesToPay.map(b => b.id));

      return { 
        success: false, 
        error: data.error || 'Ошибка при начислении на баланс' 
      };
    }

    return { 
      success: true, 
      message: data.message,
      transactions_created: data.transactions_created,
      already_processed: data.already_processed,
      total_amount: data.total_amount,
      errors: data.errors
    };
  }

  /**
   * Проверка статуса начисления на баланс
   */
  async checkBalanceTransferStatus(purchaseId: string) {
    const { data, error } = await supabase
      .from('v_team_purchase_bonus_status')
      .select('*')
      .eq('team_purchase_id', purchaseId);

    if (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }

    const summary = {
      total: data?.length || 0,
      transferred: data?.filter(d => d.balance_transaction_id !== null).length || 0,
      pending_transfer: data?.filter(d => d.payment_status === 'paid' && !d.balance_transaction_id).length || 0,
      not_paid: data?.filter(d => d.payment_status !== 'paid').length || 0
    };

    return { 
      success: true, 
      data,
      summary
    };
  }

  /**
   * Получение комбинированной статистики (preview + final)
   */
  async getCombinedStats(purchaseId: string) {
    const previewStats = await this.getPreviewStats(purchaseId);
    const finalStats = await this.getFinalStats(purchaseId);
    const balanceStatus = await this.checkBalanceTransferStatus(purchaseId);
    
    return {
      preview: previewStats.data,
      final: finalStats.data,
      balance: balanceStatus.summary,
      currentMode: finalStats.data?.isFinalized ? 'final' : 'preview'
    };
  }

  /**
   * Повторная попытка начисления на баланс (если были ошибки)
   */
  async retryBalanceTransfer(purchaseId: string) {
    // Вызываем функцию начисления еще раз
    const { data, error } = await supabase.rpc('process_team_purchase_bonuses_to_balance', {
      p_team_purchase_id: purchaseId
    });

    if (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }

    return data;
  }
}

export const teamPurchaseBonusService = new TeamPurchaseBonusService();