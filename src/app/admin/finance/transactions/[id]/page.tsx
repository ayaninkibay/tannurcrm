// app/admin/finance/transactions/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { supabase } from '@/lib/supabase/client';
import {
  ArrowLeft,
  Check,
  X,
  Clock,
  DollarSign,
  User,
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Copy,
  Shield,
  ShieldAlert,
  Wallet,
  MapPin,
  Phone,
  Mail,
  Hash,
  UserCheck,
  Timer,
  FileCheck,
  Ban,
  Fingerprint,
  Instagram,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  Gift,
  Activity
} from 'lucide-react';

interface TransactionDetail {
  transaction_id: string;
  transaction_type: string;
  amount: number;
  created_at: string;
  source_type: string;
  source_id: string;
  notes: string;
  source_details: any;
  source_name: string;
}

interface UserFullData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  created_at: string;
  iin?: number;
  region?: string;
  instagram?: string;
  profession?: string;
  referral_code?: string;
  parent_id?: string;
  personal_level?: number;
  personal_turnover?: number;
}

interface WithdrawalDetailsAdmin {
  // Основные данные
  request_id: string;
  user_id: string;
  amount: number;
  status: string;
  payment_method: string;
  payment_details: any;
  requested_at: string;
  
  // Временные метки
  approved_at?: string;
  completed_at?: string;
  rejected_at?: string;
  cancelled_at?: string;
  
  // Люди
  approved_by?: string;
  rejected_by?: string;
  approver_name?: string;
  approver_email?: string;
  rejector_name?: string;
  rejector_email?: string;
  
  // Данные пользователя
  user_name: string;
  user_email: string;
  user_phone: string;
  user_role: string;
  user_registered_at: string;
  account_age_days: number;
  
  // Балансы
  current_balance: number;
  available_balance: number;
  frozen_balance: number;
  balance_at_request: number;
  balance_total_withdrawn: number;
  
  // Статистика доходов
  total_earned: number;
  income_last_30_days: number;
  recent_income_sources: any;
  income_sources_diversity: number;
  
  // История выводов
  total_withdrawals_count: number;
  total_withdrawn_amount: number;
  avg_withdrawal_amount: number;
  last_withdrawal_date?: string;
  withdrawals_last_24h: number;
  withdrawals_last_week: number;
  withdrawal_percentage: number;
  
  // Риски
  risk_score: number;
  risk_flags: any;
  recommendation: string;
  
  // Время обработки
  processing_time_hours?: number;
  
  // Заметки
  user_notes?: string;
  admin_notes?: string;
  rejection_reason?: string;
  payment_receipt_url?: string;
  
  // Транзакции
  selected_transactions?: string[];
  transactions_details?: TransactionDetail[];
}

export default function WithdrawalDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const withdrawalId = params.id as string;

  const [withdrawal, setWithdrawal] = useState<WithdrawalDetailsAdmin | null>(null);
  const [userFullData, setUserFullData] = useState<UserFullData | null>(null);
  const [transactions, setTransactions] = useState<TransactionDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState('');

  useEffect(() => {
    if (withdrawalId) {
      loadWithdrawalDetails();
    }
  }, [withdrawalId]);

  const loadWithdrawalDetails = async () => {
    setLoading(true);
    try {
      // Получаем детальные данные из v_withdrawal_requests_admin
      const { data: adminData, error: adminError } = await supabase
        .from('v_withdrawal_requests_admin')
        .select('*')
        .eq('request_id', withdrawalId)
        .single();

      if (adminError) {
        console.error('Admin view error:', adminError);
        // Fallback на обычную таблицу
        const { data: basicData, error: basicError } = await supabase
          .from('withdrawal_requests')
          .select('*')
          .eq('id', withdrawalId)
          .single();
          
        if (basicError) throw basicError;
        
        // Получаем полные данные пользователя
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', basicData.user_id)
          .single();
          
        setUserFullData(userData);
        
        setWithdrawal({
          ...basicData,
          request_id: basicData.id,
          user_name: `${userData?.first_name || ''} ${userData?.last_name || ''}`,
          user_email: userData?.email || '',
          user_phone: userData?.phone || '',
          user_role: userData?.role || 'dealer',
          user_registered_at: userData?.created_at || '',
          account_age_days: 0,
          current_balance: 0,
          available_balance: 0,
          frozen_balance: 0,
          total_earned: 0,
          income_last_30_days: 0,
          recent_income_sources: {},
          income_sources_diversity: 0,
          total_withdrawals_count: 0,
          total_withdrawn_amount: 0,
          avg_withdrawal_amount: 0,
          withdrawals_last_24h: 0,
          withdrawals_last_week: 0,
          withdrawal_percentage: 0,
          risk_score: 0,
          risk_flags: {},
          recommendation: '',
          selected_transactions: basicData.payment_details?.selected_transactions || [],
          transactions_details: basicData.payment_details?.transactions_details || []
        } as WithdrawalDetailsAdmin);
      } else {
        setWithdrawal(adminData);
        
        // Получаем полные данные пользователя
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', adminData.user_id)
          .single();
          
        setUserFullData(userData);
        
        // Если есть selected_transactions, получаем детали транзакций
        if (adminData.payment_details?.selected_transactions) {
          const transactionIds = adminData.payment_details.selected_transactions;
          
          const { data: transData } = await supabase
            .from('balance_transactions')
            .select('*')
            .in('id', transactionIds);
            
          if (transData) {
            const enrichedTransactions = transData.map(t => ({
              ...t,
              source_name: getSourceName(t.transaction_type)
            }));
            setTransactions(enrichedTransactions);
          }
        }
      }

      setAdminNotes(adminData?.admin_notes || '');
    } catch (error) {
      console.error('Error loading withdrawal details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSourceName = (type: string) => {
    const sourceMap: Record<string, string> = {
      'order_bonus': 'Бонус от заказа',
      'team_purchase_bonus': 'Командная закупка',
      'referral_subscription': 'Реферальный бонус',
      'adjustment': 'Корректировка',
      'withdrawal': 'Вывод средств'
    };
    return sourceMap[type] || type;
  };

  const getSourceIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      'order_bonus': Package,
      'team_purchase_bonus': Users,
      'referral_subscription': Gift,
      'adjustment': Activity,
      'withdrawal': TrendingDown
    };
    const Icon = iconMap[type] || DollarSign;
    return <Icon size={14} className="text-[#D77E6C]" />;
  };

  const getRiskFlagTranslation = (key: string) => {
    const translations: Record<string, string> = {
      'is_new_account': 'Новый аккаунт',
      'unusual_amount': 'Необычная сумма',
      'first_withdrawal': 'Первый вывод',
      'large_withdrawal': 'Крупный вывод',
      'single_income_source': 'Один источник дохода',
      'withdrawal_percentage': 'Процент вывода',
      'frequent_withdrawals_24h': 'Частые выводы за 24ч',
      'frequent_withdrawals_week': 'Частые выводы за неделю',
      'low_income_activity': 'Низкая активность доходов',
      'account_age_days': 'Возраст аккаунта (дней)'
    };
    return translations[key] || key;
  };

  const handleApprove = async () => {
    setProcessingAction('approve');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Не авторизован');

      const { data, error } = await supabase.rpc('approve_withdrawal_request', {
        p_request_id: withdrawalId,
        p_approver_id: user.id,
        p_admin_notes: adminNotes
      });

      if (error) throw error;
      
      if (data?.success) {
        await loadWithdrawalDetails();
        alert('Заявка успешно одобрена');
      } else {
        throw new Error(data?.error || 'Ошибка при одобрении');
      }
    } catch (error: any) {
      alert(error.message || 'Ошибка при одобрении заявки');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleComplete = async () => {
    setProcessingAction('complete');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Не авторизован');

      const { data, error } = await supabase.rpc('complete_withdrawal', {
        p_request_id: withdrawalId,
        p_completer_id: user.id,
        p_payment_receipt_url: receiptUrl || null,
        p_admin_notes: adminNotes
      });

      if (error) throw error;
      
      if (data?.success) {
        await loadWithdrawalDetails();
        alert('Вывод успешно завершен');
      } else {
        throw new Error(data?.error || 'Ошибка при завершении');
      }
    } catch (error: any) {
      alert(error.message || 'Ошибка при завершении вывода');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Укажите причину отклонения');
      return;
    }

    setProcessingAction('reject');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Не авторизован');

      const { data, error } = await supabase.rpc('reject_withdrawal_request', {
        p_request_id: withdrawalId,
        p_rejector_id: user.id,
        p_rejection_reason: rejectionReason
      });

      if (error) throw error;
      
      if (data?.success) {
        await loadWithdrawalDetails();
        setShowRejectModal(false);
        setRejectionReason('');
        alert('Заявка отклонена');
      } else {
        throw new Error(data?.error || 'Ошибка при отклонении');
      }
    } catch (error: any) {
      alert(error.message || 'Ошибка при отклонении заявки');
    } finally {
      setProcessingAction(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU').format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string; icon: any }> = {
      'pending': { 
        label: 'Ожидает', 
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        icon: Clock
      },
      'approved': { 
        label: 'Одобрено', 
        className: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: CheckCircle
      },
      'processing': { 
        label: 'В обработке', 
        className: 'bg-orange-50 text-orange-700 border-orange-200',
        icon: RefreshCw
      },
      'completed': { 
        label: 'Выполнено', 
        className: 'bg-green-50 text-green-700 border-green-200',
        icon: CheckCircle
      },
      'rejected': { 
        label: 'Отклонено', 
        className: 'bg-red-50 text-red-700 border-red-200',
        icon: XCircle
      },
      'cancelled': { 
        label: 'Отменено', 
        className: 'bg-gray-50 text-gray-700 border-gray-200',
        icon: X
      }
    };
    return statusMap[status] || statusMap.pending;
  };

  if (loading) {
    return (
      <div className="w-full h-full p-2 md:p-4 lg:p-6">
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="animate-spin text-[#D77E6C]" size={32}/>
        </div>
      </div>
    );
  }

  if (!withdrawal) {
    return (
      <div className="w-full h-full p-2 md:p-4 lg:p-6">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto mb-4 text-gray-400" size={48}/>
          <p className="text-gray-600">Заявка не найдена</p>
          <Link href="/admin/finance/transactions" className="mt-4 inline-block text-[#D77E6C] hover:underline">
            Вернуться к списку
          </Link>
        </div>
      </div>
    );
  }

  const status = getStatusBadge(withdrawal.status);
  const StatusIcon = status.icon;

  return (
    <div className="w-full h-full p-2 md:p-4 lg:p-6">
      <MoreHeaderAD
        title={
          <div className="flex items-center gap-3">
            <Link href="/admin/finance/transactions" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#D77E6C] transition-colors">
              <ArrowLeft size={18}/> Все заявки
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">Заявка #{withdrawal.request_id?.slice(0, 8)}</span>
          </div>
        }
        showBackButton={true}
      />

      <div className="mt-6 space-y-5 max-w-7xl mx-auto">
        {/* Верхний блок - компактный */}
        <div className="bg-white rounded-2xl border-2 border-[#D77E6C]/20 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#D77E6C] to-[#E89380] rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{formatAmount(withdrawal.amount)} ₸</div>
                <div className="text-sm text-gray-500 mt-0.5">
                  Заявка от {formatDate(withdrawal.requested_at)}, {formatTime(withdrawal.requested_at)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${status.className}`}>
                <StatusIcon size={16}/>
                {status.label}
              </span>
              
              <div className="text-center px-4 py-2 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#D77E6C]" />
                  <span className="text-2xl font-bold text-gray-900">{withdrawal.risk_score || 0}%</span>
                  <span className="text-xs text-gray-500">риск</span>
                </div>
              </div>
              
              {withdrawal.processing_time_hours && (
                <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-xl">
                  <Timer size={14} className="text-gray-500"/>
                  <span className="text-sm text-gray-600">{withdrawal.processing_time_hours.toFixed(1)}ч обработки</span>
                </div>
              )}
            </div>
            
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">Баланс при запросе</div>
              <div className="text-xl font-bold text-gray-900">{formatAmount(withdrawal.balance_at_request)} ₸</div>
            </div>
          </div>
        </div>

        {/* Блок действий - красивый и заметный */}
        {withdrawal.status === 'pending' && (
          <div className="bg-gradient-to-r from-white via-gray-50 to-white rounded-2xl border border-gray-200 shadow-lg p-5">
            <div className="flex items-center gap-4">
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Комментарий администратора..."
                rows={1}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D77E6C] text-sm resize-none"
              />
              <button
                onClick={handleApprove}
                disabled={processingAction === 'approve'}
                className="group px-8 py-3.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2.5 disabled:opacity-50"
              >
                {processingAction === 'approve' ? (
                  <RefreshCw className="animate-spin" size={18}/>
                ) : (
                  <FileCheck size={18} className="group-hover:scale-110 transition-transform"/>
                )}
                Одобрить
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={processingAction !== null}
                className="group px-8 py-3.5 bg-white border-2 border-red-500 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-600 font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2.5 disabled:opacity-50"
              >
                <Ban size={18} className="group-hover:scale-110 transition-transform"/>
                Отклонить
              </button>
            </div>
          </div>
        )}

        {withdrawal.status === 'approved' && (
          <div className="bg-gradient-to-r from-white via-blue-50/50 to-white rounded-2xl border border-blue-200 shadow-lg p-5">
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
                placeholder="Ссылка на чек (необязательно)..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={handleComplete}
                disabled={processingAction === 'complete'}
                className="group px-8 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2.5 disabled:opacity-50"
              >
                {processingAction === 'complete' ? (
                  <RefreshCw className="animate-spin" size={18}/>
                ) : (
                  <CheckCircle size={18} className="group-hover:scale-110 transition-transform"/>
                )}
                Подтвердить выплату
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Левая колонка - Основная информация */}
          <div className="lg:col-span-2 space-y-5">
            {/* 1. Детали транзакций */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-[#D77E6C]" />
                  Детали транзакции {formatAmount(withdrawal.amount)} ₸
                </span>
                <span className="px-2 py-0.5 bg-[#D77E6C]/10 text-[#D77E6C] rounded-lg text-sm font-semibold">
                  {transactions.length || withdrawal.transactions_details?.length || 0}
                </span>
              </h3>
              
              <div className="space-y-2">
                {(transactions.length > 0 ? transactions : withdrawal.transactions_details || []).map((transaction: any, index: number) => (
                  <div key={transaction.transaction_id || index} 
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-[#D77E6C]/5 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      {getSourceIcon(transaction.transaction_type || transaction.type)}
                      <div>
                        <div className="font-medium text-sm text-gray-900">
                          {transaction.source_name || getSourceName(transaction.transaction_type || transaction.type)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(transaction.created_at || transaction.date)} • ID: {(transaction.transaction_id || transaction.id || '').slice(0, 8)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">+{formatAmount(transaction.amount)} ₸</div>
                      {transaction.source_details?.received_percent && (
                        <div className="text-xs text-[#D77E6C]">{transaction.source_details.received_percent}%</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 pt-3 border-t flex justify-between items-center">
                <span className="text-sm text-gray-500">Итого</span>
                <span className="text-xl font-bold text-[#D77E6C]">{formatAmount(withdrawal.amount)} ₸</span>
              </div>
            </div>

            {/* 2. Реквизиты для вывода */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#D77E6C]" />
                Реквизиты для вывода
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Способ вывода</div>
                  <div className="font-medium text-gray-900">{withdrawal.payment_method}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Банк</div>
                  <div className="font-medium text-gray-900">{withdrawal.payment_details?.bank || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Получатель</div>
                  <div className="font-medium text-gray-900">{withdrawal.payment_details?.cardHolder || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Номер карты / Телефон</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-900">
                      {withdrawal.payment_details?.cardNumber || withdrawal.payment_details?.phone || '—'}
                    </span>
                    <button onClick={() => copyToClipboard(withdrawal.payment_details?.cardNumber || withdrawal.payment_details?.phone || '')}
                      className="p-1 hover:bg-gray-100 rounded">
                      <Copy size={12} className="text-gray-400"/>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Анализ рисков */}
            {withdrawal.risk_flags && Object.keys(withdrawal.risk_flags).length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  Анализ рисков
                  <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${
                    withdrawal.risk_score >= 70 ? 'bg-red-100 text-red-700' :
                    withdrawal.risk_score >= 40 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {withdrawal.risk_score >= 70 ? 'Высокий риск' :
                     withdrawal.risk_score >= 40 ? 'Средний риск' :
                     'Низкий риск'}
                  </span>
                </h3>
                
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(withdrawal.risk_flags).map(([key, value]: [string, any]) => {
                    const isPositive = typeof value === 'boolean' ? !value : value < 50;
                    
                    return (
                      <div key={key} className={`rounded-lg p-2 ${isPositive ? 'bg-green-50' : 'bg-red-50'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">{getRiskFlagTranslation(key)}</span>
                          {isPositive ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-red-500" />
                          )}
                        </div>
                        <div className={`text-xs font-bold ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
                          {typeof value === 'boolean' ? (value ? 'Да' : 'Нет') : value}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {withdrawal.recommendation && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div className="text-xs text-blue-700">
                        <span className="font-medium">Рекомендация системы:</span> {withdrawal.recommendation}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Правая колонка - Информация о пользователе */}
          <div className="space-y-5">
            {/* Полная информация о пользователе */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-[#D77E6C]" />
                Полная информация
              </h3>
              
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">ФИО</div>
                  <div className="font-medium text-gray-900">{withdrawal.user_name}</div>
                </div>
                
                {userFullData?.iin && (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">ИИН</div>
                      <div className="flex items-center gap-2">
                        <Fingerprint className="w-3 h-3 text-gray-400" />
                        <span className="font-mono text-sm">{userFullData.iin}</span>
                      </div>
                    </div>
                    <button onClick={() => copyToClipboard(String(userFullData.iin))} 
                      className="p-1 hover:bg-gray-100 rounded">
                      <Copy size={12} className="text-gray-400"/>
                    </button>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Телефон</div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <span className="text-sm">{withdrawal.user_phone}</span>
                    </div>
                  </div>
                  <button onClick={() => copyToClipboard(withdrawal.user_phone)} 
                    className="p-1 hover:bg-gray-100 rounded">
                    <Copy size={12} className="text-gray-400"/>
                  </button>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500 mb-1">Email</div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <span className="text-sm">{withdrawal.user_email}</span>
                  </div>
                </div>
                
                {userFullData?.region && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Регион</div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-sm">{userFullData.region}</span>
                    </div>
                  </div>
                )}
                
                {userFullData?.profession && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Профессия</div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3 h-3 text-gray-400" />
                      <span className="text-sm">{userFullData.profession}</span>
                    </div>
                  </div>
                )}
                
                {userFullData?.instagram && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Instagram</div>
                    <div className="flex items-center gap-2">
                      <Instagram className="w-3 h-3 text-gray-400" />
                      <span className="text-sm">@{userFullData.instagram}</span>
                    </div>
                  </div>
                )}
                
                <div className="pt-3 border-t grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-gray-500 mb-1">В системе</div>
                    <div className="font-bold text-[#D77E6C]">{withdrawal.account_age_days} дней</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Роль</div>
                    <div className="font-medium">{withdrawal.user_role}</div>
                  </div>
                  {userFullData?.personal_level && (
                    <div>
                      <div className="text-gray-500 mb-1">Уровень</div>
                      <div className="font-medium">{userFullData.personal_level}</div>
                    </div>
                  )}
                  {userFullData?.status && (
                    <div>
                      <div className="text-gray-500 mb-1">Статус</div>
                      <div className="font-medium">{userFullData.status}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Статистика */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#D77E6C]" />
                Статистика
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Заработано всего</span>
                  <span className="font-bold text-green-600">{formatAmount(withdrawal.total_earned || 0)} ₸</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">За 30 дней</span>
                  <span className="font-medium">{formatAmount(withdrawal.income_last_30_days || 0)} ₸</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Выведено всего</span>
                  <span className="font-bold text-red-600">{formatAmount(withdrawal.total_withdrawn_amount || 0)} ₸</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Количество выводов</span>
                  <span className="font-medium">{withdrawal.total_withdrawals_count || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Средний вывод</span>
                  <span className="font-medium">{formatAmount(withdrawal.avg_withdrawal_amount || 0)} ₸</span>
                </div>
                
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">% выведенных средств</span>
                    <span className="text-sm font-bold text-[#D77E6C]">{(withdrawal.withdrawal_percentage || 0).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#D77E6C] to-[#E89380] rounded-full"
                      style={{ width: `${Math.min(withdrawal.withdrawal_percentage || 0, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно отклонения */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowRejectModal(false)}/>
          <div className="relative bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Отклонение заявки</h3>
            <div className="space-y-4">
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-sm text-red-700">
                  Вы отклоняете заявку на <span className="font-bold">{formatAmount(withdrawal.amount)} ₸</span>
                </p>
              </div>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Причина отклонения..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                >
                  Отмена
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || processingAction === 'reject'}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
                >
                  Отклонить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}