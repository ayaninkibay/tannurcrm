'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import TotalAmountCard from '@/components/finance/TotalAmountCard';
import PendingTransactionsTable from '@/components/finance/PendingTransactionsTable';
import PaymentHistoryTable from '@/components/finance/PaymentHistoryTable';
import WithdrawalRequestsBlock from '@/components/finance/WithdrawalRequestsBlock';
import { useTranslate } from '@/hooks/useTranslate';
import { 
  Loader2, Users, CreditCard, Clock, CheckCircle, XCircle, 
  AlertCircle, TrendingUp, DollarSign, ArrowRight, Calendar
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
  sponsor_bonus: number | null;
  ceo_bonus: number | null;
  approved_by: string | null;
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

type TxBase = {
  id: number;
  name: string;
  amount: number;
  date: string;
  transactionId: string;
  type: string;
  status: string;
};

type BonusStats = {
  totalTurnover: number;
  totalBonuses: number;
  pendingBonuses: number;
  paidBonuses: number;
  topDealers: Array<{
    id: string;
    name: string;
    turnover: number;
    bonus: number;
    percent: number;
  }>;
  currentMonth: string;
  lastMonth: string;
};

const FinanceTransactionsPage = () => {
  const router = useRouter();
  const { t } = useTranslate();
  
  const [subscriptions, setSubscriptions] = useState<SubscriptionPayment[]>([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(true);
  const [totalSubscriptionAmount, setTotalSubscriptionAmount] = useState(0);
  const [totalWithdrawalAmount, setTotalWithdrawalAmount] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string>(t('Все типы'));
  const [periodFilter, setPeriodFilter] = useState<string>(t('Все периоды'));
  const [bonusStats, setBonusStats] = useState<BonusStats | null>(null);
  const [isLoadingBonuses, setIsLoadingBonuses] = useState(true);

  const currentDate = useMemo(
    () => new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }),
    []
  );

  // Mock data for transactions
  const pendingTransactions: TxBase[] = useMemo(
    () => [
      {
        id: 1,
        name: t('Тәмірлан Смак'),
        amount: 84370,
        date: '22-08-2025',
        transactionId: 'KZ848970',
        type: t('л. товарооборот'),
        status: t('одобрить')
      }
    ],
    [t]
  );

  const paymentHistory: TxBase[] = useMemo(
    () => [
      {
        id: 1,
        name: t('Әли Нысанбай'),
        amount: 213000,
        date: '22-08-2025',
        transactionId: 'KZ848970',
        type: t('за подписку'),
        status: t('блок')
      }
    ],
    [t]
  );

  // Load all data
  useEffect(() => {
    loadSubscriptionPayments();
    loadWithdrawalStats();
    loadBonusStats();
  }, []);

  // Load bonus statistics
  const loadBonusStats = async () => {
    try {
      setIsLoadingBonuses(true);
      
      const currentMonth = new Date().toISOString().substring(0, 7);
      const lastMonthDate = new Date();
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
      const lastMonth = lastMonthDate.toISOString().substring(0, 7);
      
      // Загружаем текущий товарооборот
      const { data: turnoverData, error: turnoverError } = await supabase
        .from('user_turnover_current')
        .select('*')
        .order('total_turnover', { ascending: false })
        .limit(5);
      
      if (turnoverError) throw turnoverError;
      
      // Загружаем данные о пользователях
      const userIds = turnoverData?.map(t => t.user_id) || [];
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name')
        .in('id', userIds);
        
      if (usersError) throw usersError;
      
      // Объединяем данные
      const topDealers = turnoverData?.map(t => {
        const user = usersData?.find(u => u.id === t.user_id);
        return {
          id: t.user_id,
          name: user ? `${user.first_name} ${user.last_name}` : 'Неизвестный',
          turnover: t.total_turnover || 0,
          bonus: (t.personal_turnover || 0) * (t.bonus_percent || 0) / 100,
          percent: t.bonus_percent || 0
        };
      }) || [];
      
      // Считаем общие суммы
      const totalTurnover = turnoverData?.reduce((sum, t) => sum + (t.total_turnover || 0), 0) || 0;
      const totalBonuses = turnoverData?.reduce((sum, t) => 
        sum + ((t.personal_turnover || 0) * (t.bonus_percent || 0) / 100), 0
      ) || 0;
      
      // Загружаем выплаченные бонусы за прошлый месяц
      const { data: paidBonuses, error: paidError } = await supabase
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
        topDealers,
        currentMonth,
        lastMonth
      });
      
    } catch (error) {
      console.error('Error loading bonus stats:', error);
    } finally {
      setIsLoadingBonuses(false);
    }
  };

  const loadSubscriptionPayments = async () => {
    try {
      setIsLoadingSubscriptions(true);
      
      const { data, error } = await supabase
        .from('subscription_payments')
        .select(`
          *,
          user:user_id (
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          parent:parent_id (
            id,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSubscriptions(data || []);
      
      const pendingTotal = (data || [])
        .filter(s => s.status === 'pending')
        .reduce((sum, s) => sum + (s.amount || 0), 0);
      
      setTotalSubscriptionAmount(pendingTotal);
      
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setIsLoadingSubscriptions(false);
    }
  };

  const loadWithdrawalStats = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('amount')
        .eq('status', 'pending');

      if (error) throw error;
      
      const pendingTotal = (data || []).reduce((sum, item) => sum + item.amount, 0);
      setTotalWithdrawalAmount(pendingTotal);
      
    } catch (error) {
      console.error('Error loading withdrawal stats:', error);
    }
  };

  const handleQuickApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subscription_payments')
        .update({ 
          status: 'paid',
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id);

      if (error) throw error;
      
      loadSubscriptionPayments();
    } catch (error) {
      console.error('Error approving subscription:', error);
    }
  };

  const handleQuickReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subscription_payments')
        .update({ 
          status: 'rejected',
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id);

      if (error) throw error;
      
      loadSubscriptionPayments();
    } catch (error) {
      console.error('Error rejecting subscription:', error);
    }
  };

  const handleViewSubscription = (subscription: SubscriptionPayment) => {
    router.push(`/admin/finance/subscription/${subscription.id}`);
  };

  const handleOpenUser = (userName: string) => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('tannur_fin_user_name', userName);
      }
    } catch {}
    router.push('/admin/finance/user');
  };

  const handleApprove = (id: number) => { /* TODO: интеграция */ };
  const handleReject = (id: number) => { /* TODO: интеграция */ };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-xs font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Ожидает
          </span>
        );
      case 'paid':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Оплачено
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-lg text-xs font-medium flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Отклонено
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-lg text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'kaspi_transfer':
        return 'Kaspi перевод';
      case 'kaspi_qr':
        return 'Kaspi QR';
      case 'bank_transfer':
        return 'Банк. перевод';
      case 'bank_card':
        return 'Банк. карта';
      default:
        return method;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ₸';
  };

  const getMonthName = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  };

  // Общая сумма всех ожидающих операций
  const totalPendingAmount = totalSubscriptionAmount + totalWithdrawalAmount + 84370; // Добавляем mock данные

  return (
    <div className="w-full h-full">
      <MoreHeaderAD title={t('Финансовый отдел Tannur')} />
      <div className="space-y-4 md:space-y-6 lg:space-y-8 mt-4 md:mt-6">
        
        {/* Блок заявок на вывод средств */}
        <WithdrawalRequestsBlock />
        
        {/* Блок месячных бонусов - НОВЫЙ */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Месячные бонусы дилеров</h2>
                  <p className="text-sm text-gray-500">Товарооборот и начисления за {getMonthName(bonusStats?.currentMonth || '')}</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/admin/finance/bonuses')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              >
                <span>Управление бонусами</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isLoadingBonuses ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : bonusStats ? (
            <div className="p-6">
              {/* Статистика */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-gray-600">Общий товарооборот</p>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(bonusStats.totalTurnover)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Текущий месяц</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <p className="text-sm text-gray-600">К начислению</p>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(bonusStats.pendingBonuses)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Ожидает финализации</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    <p className="text-sm text-gray-600">Выплачено в прошлом месяце</p>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(bonusStats.paidBonuses)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{getMonthName(bonusStats.lastMonth)}</p>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <p className="text-sm text-gray-600">Активный период</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {getMonthName(bonusStats.currentMonth)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Расчет после окончания месяца</p>
                </div>
              </div>

              {/* ТОП дилеров */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">ТОП-5 дилеров по товарообороту</h3>
                <div className="space-y-2">
                  {bonusStats.topDealers.map((dealer, index) => (
                    <div key={dealer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white
                          ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 
                            index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                            'bg-gray-400'}`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{dealer.name}</p>
                          <p className="text-xs text-gray-500">
                            Товарооборот: {formatCurrency(dealer.turnover)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-purple-600">
                          {formatCurrency(dealer.bonus)}
                        </p>
                        <p className="text-xs text-gray-500">{dealer.percent}% бонус</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Информационный блок */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Расчет бонусов производится ежемесячно</p>
                    <p className="text-xs">
                      Финализация и выплата бонусов за текущий месяц будет доступна с 1-го числа следующего месяца.
                      Для детального просмотра и управления бонусами используйте кнопку "Управление бонусами".
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Нет данных о бонусах</p>
            </div>
          )}
        </div>
        
        {/* Subscription Payments Block */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Подписки дилеров</h2>
                  <p className="text-sm text-gray-500">Заявки на активацию дилерских аккаунтов</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Ожидает одобрения</p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalSubscriptionAmount.toLocaleString()} ₸
                </p>
              </div>
            </div>
          </div>

          {isLoadingSubscriptions ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дилер
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Спонсор
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Сумма
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Способ оплаты
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {subscriptions.slice(0, 5).map((subscription) => (
                    <tr 
                      key={subscription.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleViewSubscription(subscription)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {subscription.user?.first_name} {subscription.user?.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{subscription.user?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900">
                          {subscription.parent ? 
                            `${subscription.parent.first_name} ${subscription.parent.last_name}` : 
                            '-'
                          }
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {(subscription.amount || 0).toLocaleString()} ₸
                          </p>
                          {subscription.sponsor_bonus && (
                            <p className="text-xs text-gray-500">
                              Бонус: {(subscription.sponsor_bonus || 0).toLocaleString()} ₸
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {getPaymentMethodName(subscription.method)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900">
                          {new Date(subscription.paid_at).toLocaleDateString('ru-RU')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(subscription.paid_at).toLocaleTimeString('ru-RU', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(subscription.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {subscription.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuickApprove(subscription.id)}
                              className="p-1.5 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors"
                              title="Одобрить"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleQuickReject(subscription.id)}
                              className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                              title="Отклонить"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {subscriptions.length === 0 && (
                <div className="py-12 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Нет заявок на подписку</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Top: Total Amount + Pending Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 lg:items-stretch">
          <div className="lg:col-span-1 lg:min-h-[400px]">
            <TotalAmountCard amount={totalPendingAmount} />
          </div>
          <div className="lg:col-span-3 lg:min-h-[400px]">
            <PendingTransactionsTable
              transactions={pendingTransactions}
              currentDate={currentDate}
              onApprove={handleApprove}
              onReject={handleReject}
              onView={(tx) => handleOpenUser(tx.name)}
              onRowUserClick={(tx) => handleOpenUser(tx.name)}
            />
          </div>
        </div>

        {/* Bottom: History */}
        <PaymentHistoryTable
          payments={paymentHistory}
          typeFilter={typeFilter}
          periodFilter={periodFilter}
          onTypeChange={setTypeFilter}
          onPeriodChange={setPeriodFilter}
          onRowUserClick={(tx) => handleOpenUser(tx.name)}
        />
      </div>
    </div>
  );
};

export default FinanceTransactionsPage;