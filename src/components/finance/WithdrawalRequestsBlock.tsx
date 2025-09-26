// components/finance/WithdrawalRequestsBlock.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { 
  TrendingDown, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  CheckCircle,
  XCircle,
  DollarSign
} from 'lucide-react';

interface WithdrawalStats {
  pendingCount: number;
  pendingAmount: number;
  todayCount: number;
  completedToday: number;
  recentRequests: WithdrawalRequest[];
}

interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  requested_at: string;
  payment_details: any;
  user?: {
    first_name: string;
    last_name: string;
    phone: string;
  };
}

const WithdrawalRequestsBlock = () => {
  const router = useRouter();
  const [stats, setStats] = useState<WithdrawalStats>({
    pendingCount: 0,
    pendingAmount: 0,
    todayCount: 0,
    completedToday: 0,
    recentRequests: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWithdrawalStats();
  }, []);

  const loadWithdrawalStats = async () => {
    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Получаем статистику по заявкам
      const { data: pendingData, error: pendingError } = await supabase
        .from('withdrawal_requests')
        .select('amount')
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      const { data: todayData, error: todayError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .gte('requested_at', today.toISOString());

      if (todayError) throw todayError;

      const { data: completedTodayData, error: completedError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('status', 'completed')
        .gte('completed_at', today.toISOString());

      if (completedError) throw completedError;

      // Получаем последние заявки БЕЗ join, а затем отдельно данные пользователей
      const { data: recentData, error: recentError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('requested_at', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;

      // Если есть заявки, получаем данные пользователей из таблицы users
      let enrichedRecentData = recentData || [];
      if (recentData && recentData.length > 0) {
        const userIds = recentData.map(r => r.user_id);
        
        const { data: usersData } = await supabase
          .from('users') // Используем правильную таблицу users
          .select('id, first_name, last_name, phone')
          .in('id', userIds);

        // Объединяем данные
        enrichedRecentData = recentData.map(request => ({
          ...request,
          user: usersData?.find(u => u.id === request.user_id)
        }));
      }

      setStats({
        pendingCount: pendingData?.length || 0,
        pendingAmount: pendingData?.reduce((sum, item) => sum + item.amount, 0) || 0,
        todayCount: todayData?.length || 0,
        completedToday: completedTodayData?.length || 0,
        recentRequests: enrichedRecentData
      });

    } catch (error) {
      console.error('Error loading withdrawal stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU').format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Сегодня, ${date.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Вчера, ${date.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Ожидает
          </span>
        );
      case 'approved':
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Одобрено
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Выполнено
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Отклонено
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  const handleQuickApprove = async (requestId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('approve_withdrawal_request', {
        p_request_id: requestId,
        p_approver_id: user.id,
        p_admin_notes: 'Быстрое одобрение'
      });

      if (error) throw error;
      
      if (data?.success) {
        await loadWithdrawalStats();
      }
    } catch (error) {
      console.error('Error approving withdrawal:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#D77E6C] to-[#E09080] rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Заявки на вывод средств</h2>
              <p className="text-sm text-gray-500">Вывод бонусов и комиссий дилеров</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/admin/finance/transactions')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#D77E6C] hover:bg-[#D77E6C]/5 rounded-lg transition-colors"
          >
            Все заявки
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Clock className="w-4 h-4" />
            В ожидании
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.pendingCount}</div>
          <div className="text-xs text-gray-500">заявок</div>
        </div>
        
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <DollarSign className="w-4 h-4" />
            К выплате
          </div>
          <div className="text-2xl font-bold text-[#D77E6C]">{formatAmount(stats.pendingAmount)} ₸</div>
          <div className="text-xs text-gray-500">сумма</div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <AlertCircle className="w-4 h-4" />
            Сегодня
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.todayCount}</div>
          <div className="text-xs text-gray-500">новых заявок</div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <CheckCircle className="w-4 h-4" />
            Выполнено
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.completedToday}</div>
          <div className="text-xs text-gray-500">сегодня</div>
        </div>
      </div>

      {/* Последние заявки */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Пользователь
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Банк
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Сумма
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {stats.recentRequests.map((request) => (
              <tr
                key={request.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push(`/admin/finance/transactions/${request.id}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {request.user?.first_name || '—'} {request.user?.last_name || '—'}
                    </p>
                    <p className="text-xs text-gray-500">{request.user?.phone || '—'}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm text-gray-900">
                    {request.payment_details?.bank || '—'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {request.payment_details?.cardNumber || request.payment_details?.phone || '—'}
                  </p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatAmount(request.amount)} ₸
                  </p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-xs text-gray-600">
                    {formatDate(request.requested_at)}
                  </p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {getStatusBadge(request.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {request.status === 'pending' && (
                    <button
                      onClick={(e) => handleQuickApprove(request.id, e)}
                      className="p-1.5 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors"
                      title="Быстрое одобрение"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {stats.recentRequests.length === 0 && (
          <div className="py-12 text-center">
            <TrendingDown className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Нет активных заявок на вывод</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawalRequestsBlock;