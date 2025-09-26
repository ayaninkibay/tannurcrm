// src/lib/transactions/withdrawalService.ts

import { Database } from '@/types/supabase';
import { supabase } from '@/lib/supabase/client';

export interface Transaction {
  transaction_id: string;
  transaction_type: 'order_bonus' | 'team_purchase_bonus' | 'referral_subscription' | 'adjustment';
  amount: number;
  created_at: string;
  source_type: string;
  source_id: string;
  notes: string;
  source_details: any;
  is_withdrawn: boolean;
  source_name: string;
}

export interface TransactionHistory extends Transaction {
  operation: 'credit' | 'debit';
  withdrawal_id?: string;
  withdrawal_status?: string;
  withdrawal_date?: string;
  can_withdraw: boolean;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected' | 'cancelled';
  payment_method: string;
  payment_details: any;
  requested_at: string;
  approved_at?: string;
  approved_by?: string;
  completed_at?: string;
  rejected_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
  transaction_id?: string;
  payment_receipt_url?: string;
  balance_at_request: number;
  user_notes?: string;
  admin_notes?: string;
}

export interface Balance {
  current_balance: number;
  available_balance: number;
  frozen_balance: number;
  total_earned: number;
  total_withdrawn: number;
  can_withdraw: boolean;
}

class WithdrawalService {
  // ========== ПОЛЬЗОВАТЕЛЬСКИЕ ФУНКЦИИ ==========
  
  // Получить доступные для вывода транзакции
  async getAvailableTransactions(userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase.rpc('get_available_transactions_for_withdrawal', {
      p_user_id: userId
    });

    if (error) throw error;
    return data || [];
  }

  // Получить историю всех транзакций
  async getTransactionHistory(userId: string, limit = 100): Promise<TransactionHistory[]> {
    const { data, error } = await supabase.rpc('get_user_transactions_history', {
      p_user_id: userId,
      p_limit: limit
    });

    if (error) throw error;
    return data || [];
  }

  // Получить баланс пользователя
  async getUserBalance(userId: string): Promise<Balance> {
    const { data, error } = await supabase
      .from('v_dealer_balances')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  // Создать заявку на вывод
  async createWithdrawalRequest(
    userId: string,
    selectedTransactionIds: string[],
    paymentMethod: string,
    paymentDetails: any,
    userNotes?: string
  ) {
    const { data, error } = await supabase.rpc('create_withdrawal_request', {
      p_user_id: userId,
      p_selected_transactions: selectedTransactionIds,
      p_payment_method: paymentMethod,
      p_payment_details: paymentDetails,
      p_user_notes: userNotes
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    
    return data;
  }

  // Получить мои заявки на вывод
  async getMyWithdrawals(userId: string): Promise<WithdrawalRequest[]> {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('user_id', userId)
      .order('requested_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Отменить заявку
  async cancelWithdrawal(requestId: string, userId: string) {
    const { data, error } = await supabase.rpc('cancel_withdrawal_request', {
      p_request_id: requestId,
      p_user_id: userId
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    
    return data;
  }

  // Проверить возможность вывода
  async checkCanWithdraw(userId: string, amount: number) {
    const { data, error } = await supabase.rpc('check_can_withdraw', {
      p_user_id: userId,
      p_amount: amount
    });

    if (error) throw error;
    return data;
  }

  // ========== АДМИНСКИЕ ФУНКЦИИ ==========

  // Получить все заявки для админа
  async getWithdrawalRequestsAdmin(filters?: {
    status?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
    minAmount?: number;
  }) {
    const { data, error } = await supabase
      .from('v_withdrawal_requests_admin')
      .select('*')
      .order('requested_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Одобрить заявку
  async approveWithdrawal(requestId: string, approverId: string, adminNotes?: string) {
    const { data, error } = await supabase.rpc('approve_withdrawal_request', {
      p_request_id: requestId,
      p_approver_id: approverId,
      p_admin_notes: adminNotes
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    
    return data;
  }

  // Завершить вывод
  async completeWithdrawal(
    requestId: string,
    completerId: string,
    receiptUrl?: string,
    adminNotes?: string
  ) {
    const { data, error } = await supabase.rpc('complete_withdrawal', {
      p_request_id: requestId,
      p_completer_id: completerId,
      p_payment_receipt_url: receiptUrl,
      p_admin_notes: adminNotes
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    
    return data;
  }

  // Отклонить заявку
  async rejectWithdrawal(requestId: string, rejectorId: string, reason: string) {
    const { data, error } = await supabase.rpc('reject_withdrawal_request', {
      p_request_id: requestId,
      p_rejector_id: rejectorId,
      p_rejection_reason: reason
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    
    return data;
  }

  // Получить статистику
  async getWithdrawalStats() {
    const { data, error } = await supabase
      .from('v_withdrawal_statistics')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  // Подписка на изменения (real-time)
  subscribeToWithdrawals(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('withdrawals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'withdrawal_requests',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }
}

export const withdrawalService = new WithdrawalService();