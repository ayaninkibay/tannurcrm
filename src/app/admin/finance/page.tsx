'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import TotalAmountCard from '@/components/finance/TotalAmountCard';
import PendingTransactionsTable from '@/components/finance/PendingTransactionsTable';
import PaymentHistoryTable from '@/components/finance/PaymentHistoryTable';
import { useTranslate } from '@/hooks/useTranslate';
import { Loader2, Users, CreditCard, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import TeamPurchaseBonusesBlock from '@/components/finance/TeamPurchaseBonusesBlock';

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

const FinanceTransactionsPage = () => {
  const router = useRouter();
  const { t } = useTranslate();
  
  const [subscriptions, setSubscriptions] = useState<SubscriptionPayment[]>([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(true);
  const [totalSubscriptionAmount, setTotalSubscriptionAmount] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string>(t('Все типы'));
  const [periodFilter, setPeriodFilter] = useState<string>(t('Все периоды'));

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
      },
      {
        id: 2,
        name: t('Айгерім Нұрболатқызы'),
        amount: 156420,
        date: '22-08-2025',
        transactionId: 'KZ849125',
        type: t('к. товарооборот'),
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
      },
      {
        id: 2,
        name: t('Тәмірлан Смак'),
        amount: 584370,
        date: '22-08-2025',
        transactionId: 'KZ848971',
        type: t('л. товарооборот'),
        status: t('оплачен')
      }
    ],
    [t]
  );

  // Load subscription payments
  useEffect(() => {
    loadSubscriptionPayments();
  }, []);

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
      
      // Calculate total amount from pending subscriptions
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

  // Quick approve/reject subscription
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
      
      // Reload subscriptions
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
      
      // Reload subscriptions
      loadSubscriptionPayments();
    } catch (error) {
      console.error('Error rejecting subscription:', error);
    }
  };

  // Navigate to subscription details
  const handleViewSubscription = (subscription: SubscriptionPayment) => {
    router.push(`/admin/finance/subscription/${subscription.id}`);
  };

  // Navigate to user page
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

  // Get status badge
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

  // Get payment method name
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

  return (
    <div className="w-full h-full p-2 md:p-4 lg:p-6">
      <MoreHeaderAD title={t('Финансовый отдел Tannur')} />
      <div className="space-y-4 md:space-y-6 lg:space-y-8 mt-4 md:mt-6">
        
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
                  {subscriptions.map((subscription) => (
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
                            {subscription.amount.toLocaleString()} ₸
                          </p>
                          {subscription.sponsor_bonus && (
                            <p className="text-xs text-gray-500">
                              Бонус: {subscription.sponsor_bonus.toLocaleString()} ₸
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

        <TeamPurchaseBonusesBlock />

        {/* Top: Total Amount + Pending Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 lg:items-stretch">
          <div className="lg:col-span-1 lg:min-h-[400px]">
            <TotalAmountCard amount={84213000 + totalSubscriptionAmount} />
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