'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { useTranslate } from '@/hooks/useTranslate';
import { 
  Loader2, Users, Clock, CheckCircle, XCircle, 
  AlertCircle, TrendingUp, DollarSign, ArrowRight, Calendar,
  Mail, Eye, ArrowDownToLine, Wallet, CreditCard, User
} from 'lucide-react';

type SubscriptionPayment = {
  id: string;
  user_id: string;
  parent_id: string | null;
  amount: number;
  method: string;
  status: string;
  paid_at: string;
  created_at: string;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  parent?: {
    first_name: string;
    last_name: string;
  };
};

type WithdrawalRequest = {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  requested_at: string;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
};

type BonusStats = {
  totalTurnover: number;
  totalBonuses: number;
  pendingBonuses: number;
  paidBonuses: number;
  currentMonth: string;
  lastMonth: string;
};

const FinanceTransactionsPage = () => {
  const router = useRouter();
  const { t } = useTranslate();
  
  const [subscriptions, setSubscriptions] = useState<SubscriptionPayment[]>([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(true);
  const [totalSubscriptionAmount, setTotalSubscriptionAmount] = useState(0);
  const [pendingSubCount, setPendingSubCount] = useState(0);
  const [paidSubCount, setPaidSubCount] = useState(0);
  const [rejectedSubCount, setRejectedSubCount] = useState(0);

  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [isLoadingWithdrawals, setIsLoadingWithdrawals] = useState(true);
  const [totalWithdrawalAmount, setTotalWithdrawalAmount] = useState(0);
  const [pendingWithCount, setPendingWithCount] = useState(0);
  const [approvedWithCount, setApprovedWithCount] = useState(0);
  const [completedWithCount, setCompletedWithCount] = useState(0);

  const [bonusStats, setBonusStats] = useState<BonusStats | null>(null);
  const [isLoadingBonuses, setIsLoadingBonuses] = useState(true);

  useEffect(() => {
    loadSubscriptionPayments();
    loadWithdrawalRequests();
    loadBonusStats();
  }, []);

  const loadBonusStats = async () => {
    try {
      setIsLoadingBonuses(true);
      
      const currentMonth = new Date().toISOString().substring(0, 7);
      const lastMonthDate = new Date();
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
      const lastMonth = lastMonthDate.toISOString().substring(0, 7);
      
      const { data: turnoverData, error: turnoverError } = await supabase
        .from('user_turnover_current')
        .select('*');
      
      if (turnoverError) throw turnoverError;
      
      const totalTurnover = turnoverData?.reduce((sum, t) => sum + (t.total_turnover || 0), 0) || 0;
      const totalBonuses = turnoverData?.reduce((sum, t) => 
        sum + ((t.personal_turnover || 0) * (t.bonus_percent || 0) / 100), 0
      ) || 0;
      
      const { data: paidBonuses } = await supabase
        .from('monthly_bonuses')
        .select('bonus_amount')
        .eq('month_period', lastMonth)
        .eq('status', 'paid');
        
      const paidAmount = paidBonuses?.reduce((sum, b) => sum + b.bonus_amount, 0) || 0;
      
      setBonusStats({
        totalTurnover,
        totalBonuses,
        pendingBonuses: totalBonuses,
        paidBonuses: paidAmount,
        currentMonth,
        lastMonth
      });
      
    } catch (error) {
      console.error('Error loading bonus stats:', error);
    } finally {
      setIsLoadingBonuses(false);
    }
  };

  const loadWithdrawalRequests = async () => {
    try {
      setIsLoadingWithdrawals(true);
      
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('requested_at', { ascending: false })
        .limit(5);

      if (withdrawalsError) throw withdrawalsError;

      if (withdrawalsData && withdrawalsData.length > 0) {
        const userIds = withdrawalsData.map(w => w.user_id).filter(Boolean);
        const { data: usersData } = await supabase
          .from('users')
          .select('id, first_name, last_name, email')
          .in('id', userIds);

        const enrichedWithdrawals = withdrawalsData.map(w => ({
          ...w,
          user: usersData?.find(u => u.id === w.user_id)
        }));

        setWithdrawals(enrichedWithdrawals);

        const pending = enrichedWithdrawals.filter(w => w.status === 'pending');
        const approved = enrichedWithdrawals.filter(w => w.status === 'approved');
        const completed = enrichedWithdrawals.filter(w => w.status === 'completed');

        setPendingWithCount(pending.length);
        setApprovedWithCount(approved.length);
        setCompletedWithCount(completed.length);

        const pendingTotal = pending.reduce((sum, w) => sum + w.amount, 0);
        setTotalWithdrawalAmount(pendingTotal);
      } else {
        setWithdrawals([]);
        setPendingWithCount(0);
        setApprovedWithCount(0);
        setCompletedWithCount(0);
        setTotalWithdrawalAmount(0);
      }
      
    } catch (error) {
      console.error('Error loading withdrawals:', error);
    } finally {
      setIsLoadingWithdrawals(false);
    }
  };

  const loadSubscriptionPayments = async () => {
    try {
      setIsLoadingSubscriptions(true);
      
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('subscription_payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (subscriptionsError) throw subscriptionsError;

      if (subscriptionsData && subscriptionsData.length > 0) {
        const userIds = subscriptionsData.map(s => s.user_id).filter(Boolean);
        const parentIds = subscriptionsData.map(s => s.parent_id).filter(Boolean);
        const allUserIds = [...new Set([...userIds, ...parentIds])];

        const { data: usersData } = await supabase
          .from('users')
          .select('id, first_name, last_name, email, phone')
          .in('id', allUserIds);

        const enrichedSubscriptions = subscriptionsData.map(sub => ({
          ...sub,
          user: usersData?.find(u => u.id === sub.user_id),
          parent: usersData?.find(u => u.id === sub.parent_id)
        }));

        setSubscriptions(enrichedSubscriptions);

        const pending = enrichedSubscriptions.filter(s => s.status === 'pending');
        const paid = enrichedSubscriptions.filter(s => s.status === 'paid');
        const rejected = enrichedSubscriptions.filter(s => s.status === 'rejected');

        setPendingSubCount(pending.length);
        setPaidSubCount(paid.length);
        setRejectedSubCount(rejected.length);

        const pendingTotal = pending.reduce((sum, s) => sum + (s.amount || 0), 0);
        setTotalSubscriptionAmount(pendingTotal);
      } else {
        setSubscriptions([]);
        setPendingSubCount(0);
        setPaidSubCount(0);
        setRejectedSubCount(0);
        setTotalSubscriptionAmount(0);
      }
      
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setIsLoadingSubscriptions(false);
    }
  };

  const handleViewSubscription = (subscription: SubscriptionPayment) => {
    router.push(`/admin/finance/subscription/${subscription.id}`);
  };

  const handleViewWithdrawal = (withdrawal: WithdrawalRequest) => {
    router.push(`/admin/finance/withdrawals`);
  };

  const getStatusBadge = (status: string, type: 'subscription' | 'withdrawal' = 'subscription') => {
    if (type === 'withdrawal') {
      switch (status) {
        case 'pending':
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded text-[10px] sm:text-xs font-medium border border-yellow-200">
              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Ожидает</span>
            </span>
          );
        case 'approved':
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] sm:text-xs font-medium border border-blue-200">
              <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Одобрено</span>
            </span>
          );
        case 'completed':
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded text-[10px] sm:text-xs font-medium border border-green-200">
              <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Выплачено</span>
            </span>
          );
        case 'rejected':
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded text-[10px] sm:text-xs font-medium border border-red-200">
              <XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Отклонено</span>
            </span>
          );
        default:
          return <span className="text-xs text-gray-500">{status}</span>;
      }
    }

    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded text-[10px] sm:text-xs font-medium border border-yellow-200">
            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="hidden sm:inline">Ожидает</span>
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded text-[10px] sm:text-xs font-medium border border-green-200">
            <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="hidden sm:inline">Оплачено</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded text-[10px] sm:text-xs font-medium border border-red-200">
            <XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="hidden sm:inline">Отклонено</span>
          </span>
        );
      default:
        return <span className="text-xs text-gray-500">{status}</span>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ₸';
  };

  const getMonthName = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full h-full min-h-screen">
      <MoreHeaderAD title={t('Финансовый отдел Tannur')} />
      
      <div className="mx-auto mt-5">
        
        {/* ДВА БЛОКА В РЯД - Заявки на вывод и Подписки дилеров */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          
          {/* БЛОК 1: Заявки на вывод средств */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 p-4 sm:p-6 text-white border-b border-gray-200">
              <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3 sm:gap-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white border border-gray-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <ArrowDownToLine className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-black">Заявки на вывод</h2>
                    <p className="text-xs sm:text-sm text-black">Запросы на вывод средств</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <p className="text-xs sm:text-sm text-gray-400 mb-1">Ожидает обработки</p>
                <p className="text-2xl sm:text-3xl font-semibold text-black">{formatCurrency(totalWithdrawalAmount)}</p>
              </div>
            </div>

            <div className="p-3 sm:p-4">
              {/* Мини-статистика */}
              <div className="grid grid-cols-3 gap-2 mb-3 sm:mb-4">
                <div className="bg-yellow-50 rounded-lg p-2 sm:p-3 text-center border border-yellow-100">
                  <p className="text-[10px] sm:text-xs text-yellow-600 mb-0.5 sm:mb-1 font-medium">Ожидают</p>
                  <p className="text-lg sm:text-xl font-semibold text-yellow-700">{pendingWithCount}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-2 sm:p-3 text-center border border-blue-100">
                  <p className="text-[10px] sm:text-xs text-blue-600 mb-0.5 sm:mb-1 font-medium">Одобрено</p>
                  <p className="text-lg sm:text-xl font-semibold text-blue-700">{approvedWithCount}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-2 sm:p-3 text-center border border-green-100">
                  <p className="text-[10px] sm:text-xs text-green-600 mb-0.5 sm:mb-1 font-medium">Выплачено</p>
                  <p className="text-lg sm:text-xl font-semibold text-green-700">{completedWithCount}</p>
                </div>
              </div>

              {/* Список последних заявок */}
              {isLoadingWithdrawals ? (
                <div className="flex items-center justify-center py-8 sm:py-12">
                  <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-[#D77E6C]" />
                </div>
              ) : withdrawals.length > 0 ? (
                <div className="space-y-2.5">
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase mb-2 sm:mb-3">Последние заявки</p>
                  {withdrawals.map((withdrawal) => (
                    <div
                      key={withdrawal.id}
                      onClick={() => handleViewWithdrawal(withdrawal)}
                      className="group relative bg-gradient-to-br from-white to-gray-50 hover:from-yellow-50 hover:to-orange-50 border border-gray-200 hover:border-yellow-300 rounded-xl p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-md"
                    >
                      {/* Декоративный элемент */}
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-100/50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="relative flex items-start gap-3">
                        {/* Аватар */}
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {/* Имя и статус в одной строке */}
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                              {withdrawal.user?.first_name} {withdrawal.user?.last_name}
                            </p>
                            {getStatusBadge(withdrawal.status, 'withdrawal')}
                          </div>
                          
                          {/* Email */}
                          <p className="text-[10px] sm:text-xs text-gray-500 truncate mb-2">{withdrawal.user?.email}</p>
                          
                          {/* Сумма и дата */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Wallet className="w-3.5 h-3.5 text-yellow-600" />
                              <p className="text-sm sm:text-base font-bold text-gray-900">{formatCurrency(withdrawal.amount)}</p>
                            </div>
                            <p className="text-[10px] sm:text-xs text-gray-400">{formatDate(withdrawal.requested_at)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 sm:py-8 text-center">
                  <Wallet className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm text-gray-500">Нет заявок на вывод</p>
                </div>
              )}

              <button
                onClick={() => router.push('/admin/finance/withdrawals')}
                className="w-full mt-3 sm:mt-4 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm sm:text-base shadow-md hover:shadow-lg"
              >
                <span>Все заявки на вывод</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* БЛОК 2: Подписки дилеров */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3 sm:gap-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white border border-gray-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Подписки дилеров</h2>
                    <p className="text-xs sm:text-sm text-gray-600">Заявки на активацию</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Ожидает одобрения</p>
                <p className="text-2xl sm:text-3xl font-semibold text-gray-800">{formatCurrency(totalSubscriptionAmount)}</p>
              </div>
            </div>

            <div className="p-3 sm:p-4">
              {/* Мини-статистика */}
              <div className="grid grid-cols-3 gap-2 mb-3 sm:mb-4">
                <div className="bg-yellow-50 rounded-lg p-2 sm:p-3 text-center border border-yellow-100">
                  <p className="text-[10px] sm:text-xs text-yellow-600 mb-0.5 sm:mb-1 font-medium">Ожидают</p>
                  <p className="text-lg sm:text-xl font-semibold text-yellow-700">{pendingSubCount}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-2 sm:p-3 text-center border border-green-100">
                  <p className="text-[10px] sm:text-xs text-green-600 mb-0.5 sm:mb-1 font-medium">Одобрено</p>
                  <p className="text-lg sm:text-xl font-semibold text-green-700">{paidSubCount}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-2 sm:p-3 text-center border border-red-100">
                  <p className="text-[10px] sm:text-xs text-red-600 mb-0.5 sm:mb-1 font-medium">Отклонено</p>
                  <p className="text-lg sm:text-xl font-semibold text-red-700">{rejectedSubCount}</p>
                </div>
              </div>

              {/* Список последних подписок */}
              {isLoadingSubscriptions ? (
                <div className="flex items-center justify-center py-8 sm:py-12">
                  <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-gray-600" />
                </div>
              ) : subscriptions.length > 0 ? (
                <div className="space-y-2.5">
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase mb-2 sm:mb-3">Последние заявки</p>
                  {subscriptions.map((subscription) => (
                    <div
                      key={subscription.id}
                      onClick={() => handleViewSubscription(subscription)}
                      className="group relative bg-gradient-to-br from-white to-gray-50 hover:from-blue-50 hover:to-indigo-50 border border-gray-200 hover:border-blue-300 rounded-xl p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-md"
                    >
                      {/* Декоративный элемент */}
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-100/50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="relative flex items-start gap-3">
                        {/* Аватар */}
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {/* Имя и статус в одной строке */}
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                              {subscription.user?.first_name} {subscription.user?.last_name}
                            </p>
                            {getStatusBadge(subscription.status, 'subscription')}
                          </div>
                          
                          {/* Email */}
                          <p className="text-[10px] sm:text-xs text-gray-500 truncate mb-2">{subscription.user?.email}</p>
                          
                          {/* Сумма и дата */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                              <p className="text-sm sm:text-base font-bold text-gray-900">{formatCurrency(subscription.amount)}</p>
                            </div>
                            <p className="text-[10px] sm:text-xs text-gray-400">{formatDate(subscription.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 sm:py-8 text-center">
                  <CreditCard className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm text-gray-500">Нет заявок на подписку</p>
                </div>
              )}

              <button
                onClick={() => router.push('/admin/finance/subscriptions')}
                className="w-full mt-3 sm:mt-4 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm sm:text-base shadow-md hover:shadow-lg"
              >
                <span>Все подписки</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* БЛОК 3: Месячные бонусы (полная ширина, упрощенный) */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-7">
          <div className="bg-[#DC7C67] p-4 sm:p-6 text-white border-b border-[#D77E6C]">
            <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold">Месячные бонусы дилеров</h2>
                  <p className="text-xs sm:text-sm text-white/80">
                    {bonusStats ? getMonthName(bonusStats.currentMonth) : '...'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push('/admin/finance/bonuses')}
                className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 border border-white/20 text-sm sm:text-base"
              >
                <span>Подробнее</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {isLoadingBonuses ? (
            <div className="flex items-center justify-center py-12 sm:py-16">
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-[#D77E6C]" />
            </div>
          ) : bonusStats ? (
            <div className="p-4 sm:p-6">
              {/* Статистика в 4 карточки */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-5 border border-gray-200">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </div>
                    <p className="text-[10px] sm:text-sm font-medium text-gray-700 leading-tight">Общий товарооборот</p>
                  </div>
                  <p className="text-lg sm:text-2xl font-semibold text-gray-900 mb-0.5 sm:mb-1">
                    {formatCurrency(bonusStats.totalTurnover)}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500">Текущий месяц</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-5 border border-gray-200">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </div>
                    <p className="text-[10px] sm:text-sm font-medium text-gray-700 leading-tight">К начислению</p>
                  </div>
                  <p className="text-lg sm:text-2xl font-semibold text-gray-900 mb-0.5 sm:mb-1">
                    {formatCurrency(bonusStats.pendingBonuses)}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500">Ожидает</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-5 border border-gray-200">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </div>
                    <p className="text-[10px] sm:text-sm font-medium text-gray-700 leading-tight">Выплачено</p>
                  </div>
                  <p className="text-lg sm:text-2xl font-semibold text-gray-900 mb-0.5 sm:mb-1">
                    {formatCurrency(bonusStats.paidBonuses)}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500">{getMonthName(bonusStats.lastMonth)}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-5 border border-gray-200">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </div>
                    <p className="text-[10px] sm:text-sm font-medium text-gray-700 leading-tight">Период</p>
                  </div>
                  <p className="text-base sm:text-xl font-semibold text-gray-900 mb-0.5 sm:mb-1">
                    {getMonthName(bonusStats.currentMonth)}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500">Активный</p>
                </div>
              </div>

              {/* Информационный блок */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200">
                <div className="flex items-start gap-2 sm:gap-3">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-gray-700">
                    <p className="font-semibold mb-1">Расчет бонусов производится ежемесячно</p>
                    <p className="text-[10px] sm:text-xs leading-relaxed text-gray-600">
                      Финализация и выплата бонусов за текущий месяц будет доступна с 1-го числа следующего месяца.
                      Для детального просмотра рейтинга дилеров нажмите "Подробнее".
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 sm:py-16 text-center">
              <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-gray-500 font-medium">Нет данных о бонусах</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FinanceTransactionsPage;