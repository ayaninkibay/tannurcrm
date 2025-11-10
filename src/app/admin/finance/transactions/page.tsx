// app/admin/finance/transactions/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { supabase } from '@/lib/supabase/client';
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Check,
  X,
  Clock,
  DollarSign,
  TrendingDown,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  payment_method: string;
  payment_details: any;
  requested_at: string;
  approved_at?: string;
  completed_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  balance_at_request: number;
  user_notes?: string;
  admin_notes?: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  transactions_details?: any[];
}

export default function AdminTransactionsPage() {
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Статистика
  const [stats, setStats] = useState({
    totalPending: 0,
    totalPendingAmount: 0,
    totalCompleted: 0,
    totalCompletedAmount: 0,
    todayRequests: 0,
    monthRequests: 0
  });

  const loadWithdrawals = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) throw error;

      // Получаем данные пользователей из таблицы users (НЕ profiles!)
      const userIds = data?.map(w => w.user_id) || [];
      if (userIds.length > 0) {
        const { data: usersData } = await supabase
          .from('users') // Используем правильную таблицу users
          .select('id, first_name, last_name, email, phone')
          .in('id', userIds);

        // Объединяем данные
        const enrichedData = (data || []).map(item => ({
          ...item,
          user: usersData?.find(u => u.id === item.user_id),
          transactions_details: item.payment_details?.transactions_details || []
        }));

        setWithdrawals(enrichedData as WithdrawalRequest[]);
        calculateStats(enrichedData);
      } else {
        setWithdrawals([]);
        calculateStats([]);
      }

    } catch (error) {
      console.error('Error loading withdrawals:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWithdrawals();
  }, [loadWithdrawals]);

  const calculateStats = (data: any[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const pending = data.filter(w => w.status === 'pending');
    const completed = data.filter(w => w.status === 'completed');
    const todayReqs = data.filter(w => new Date(w.requested_at) >= today);
    const monthReqs = data.filter(w => new Date(w.requested_at) >= monthAgo);

    setStats({
      totalPending: pending.length,
      totalPendingAmount: pending.reduce((sum, w) => sum + w.amount, 0),
      totalCompleted: completed.length,
      totalCompletedAmount: completed.reduce((sum, w) => sum + w.amount, 0),
      todayRequests: todayReqs.length,
      monthRequests: monthReqs.length
    });
  };

  const handleQuickApprove = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Не авторизован');

      const { data, error } = await supabase.rpc('approve_withdrawal_request', {
        p_request_id: requestId,
        p_approver_id: user.id,
        p_admin_notes: 'Быстрое одобрение'
      });

      if (error) throw error;
      
      if (data?.success) {
        await loadWithdrawals();
      }
    } catch (error: any) {
      alert(error.message || 'Ошибка при одобрении заявки');
    } finally {
      setProcessingId(null);
    }
  };

  const handleQuickReject = async (requestId: string) => {
    const reason = prompt('Укажите причину отклонения:');
    if (!reason) return;

    setProcessingId(requestId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Не авторизован');

      const { data, error } = await supabase.rpc('reject_withdrawal_request', {
        p_request_id: requestId,
        p_rejector_id: user.id,
        p_rejection_reason: reason
      });

      if (error) throw error;
      
      if (data?.success) {
        await loadWithdrawals();
      }
    } catch (error: any) {
      alert(error.message || 'Ошибка при отклонении заявки');
    } finally {
      setProcessingId(null);
    }
  };

  const handleExportData = () => {
    // Экспорт данных в CSV
    const csv = [
      ['ID', 'Дата', 'Пользователь', 'Сумма', 'Статус', 'Банк', 'Реквизиты'],
      ...filteredWithdrawals.map(w => [
        w.id.slice(0, 8),
        new Date(w.requested_at).toLocaleDateString('ru-RU'),
        `${w.user?.first_name || ''} ${w.user?.last_name || ''}`,
        w.amount,
        w.status,
        w.payment_details?.bank || '',
        w.payment_details?.cardNumber || w.payment_details?.phone || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `withdrawals_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Фильтрация заявок
  const filteredWithdrawals = withdrawals.filter(w => {
    // Фильтр по статусу
    if (filterStatus !== 'all' && w.status !== filterStatus) return false;
    
    // Фильтр по периоду
    if (filterPeriod !== 'all') {
      const date = new Date(w.requested_at);
      const now = new Date();
      
      switch (filterPeriod) {
        case 'today':
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (date < today) return false;
          break;
        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (date < weekAgo) return false;
          break;
        case 'month':
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          if (date < monthAgo) return false;
          break;
      }
    }
    
    // Поиск
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const userName = `${w.user?.first_name || ''} ${w.user?.last_name || ''}`.toLowerCase();
      const id = w.id.toLowerCase();
      const phone = w.user?.phone?.toLowerCase() || '';
      const email = w.user?.email?.toLowerCase() || '';
      
      return userName.includes(search) || 
             id.includes(search) || 
             phone.includes(search) ||
             email.includes(search);
    }
    
    return true;
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU').format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
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

  return (
    <div className="w-full h-full p-2 md:p-4 lg:p-6">
<MoreHeaderAD title="Управление выводами" showBackButton={true} />

      <div className="space-y-6 mt-6">
        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold">{stats.totalPending}</span>
            </div>
            <p className="text-xs text-gray-500">В ожидании</p>
            <p className="text-sm font-semibold text-gray-900">{formatAmount(stats.totalPendingAmount)} ₸</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold">{stats.totalCompleted}</span>
            </div>
            <p className="text-xs text-gray-500">Выполнено</p>
            <p className="text-sm font-semibold text-gray-900">{formatAmount(stats.totalCompletedAmount)} ₸</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold">{stats.todayRequests}</span>
            </div>
            <p className="text-xs text-gray-500">Сегодня</p>
            <p className="text-sm text-gray-600">новых заявок</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold">{stats.monthRequests}</span>
            </div>
            <p className="text-xs text-gray-500">За месяц</p>
            <p className="text-sm text-gray-600">всего заявок</p>
          </div>

          <div className="bg-gradient-to-r from-[#D77E6C] to-[#E09080] text-white rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8" />
              <span className="text-2xl font-bold">{formatAmount(stats.totalPendingAmount)}</span>
            </div>
            <p className="text-xs opacity-80">К выплате</p>
            <p className="text-sm font-semibold">₸ KZT</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-8 h-8 text-gray-400" />
              <span className="text-2xl font-bold">{withdrawals.length}</span>
            </div>
            <p className="text-xs text-gray-500">Всего</p>
            <p className="text-sm text-gray-600">заявок</p>
          </div>
        </div>

        {/* Фильтры */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500"/>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C] text-sm"
              >
                <option value="all">Все статусы</option>
                <option value="pending">Ожидает</option>
                <option value="approved">Одобрено</option>
                <option value="processing">В обработке</option>
                <option value="completed">Выполнено</option>
                <option value="rejected">Отклонено</option>
                <option value="cancelled">Отменено</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-gray-500"/>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C] text-sm"
              >
                <option value="all">Все время</option>
                <option value="today">Сегодня</option>
                <option value="week">Неделя</option>
                <option value="month">Месяц</option>
              </select>
            </div>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Поиск по имени, ID, телефону или email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C] text-sm"
              />
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleExportData}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
              >
                <Download size={16}/>
                Экспорт
              </button>
              
              <button
                onClick={loadWithdrawals}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
              >
                <RefreshCw size={16}/>
                Обновить
              </button>
            </div>
          </div>
        </div>

        {/* Таблица */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-6 text-left">ID</th>
                  <th className="py-4 px-6 text-left">Пользователь</th>
                  <th className="py-4 px-6 text-left">Банк</th>
                  <th className="py-4 px-6 text-right">Сумма</th>
                  <th className="py-4 px-6 text-left">Транзакции</th>
                  <th className="py-4 px-6 text-left">Дата</th>
                  <th className="py-4 px-6 text-center">Статус</th>
                  <th className="py-4 px-6 text-center">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                      <RefreshCw className="animate-spin mx-auto mb-2" size={24}/>
                      Загрузка...
                    </td>
                  </tr>
                ) : filteredWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                      <AlertCircle className="mx-auto mb-2" size={24}/>
                      Заявок не найдено
                    </td>
                  </tr>
                ) : (
                  filteredWithdrawals.map(withdrawal => {
                    const status = getStatusBadge(withdrawal.status);
                    const StatusIcon = status.icon;
                    
                    return (
                      <tr key={withdrawal.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <span className="text-xs font-mono text-gray-600">
                            #{withdrawal.id.slice(0, 8)}
                          </span>
                        </td>
                        
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-gray-900">
                              {withdrawal.user?.first_name || '—'} {withdrawal.user?.last_name || '—'}
                            </p>
                            <p className="text-xs text-gray-500">{withdrawal.user?.phone || '—'}</p>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div>
                            <p className="text-sm text-gray-900">{withdrawal.payment_details?.bank || '—'}</p>
                            <p className="text-xs text-gray-500">
                              {withdrawal.payment_details?.cardNumber || withdrawal.payment_details?.phone || '—'}
                            </p>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <p className="font-semibold text-gray-900">
                            {formatAmount(withdrawal.amount)} ₸
                          </p>
                        </td>

                        <td className="py-4 px-6">
                          <p className="text-xs text-gray-600">
                            {withdrawal.payment_details?.selected_transactions?.length || 0} шт.
                          </p>
                        </td>

                        <td className="py-4 px-6">
                          <p className="text-xs text-gray-600">
                            {formatDate(withdrawal.requested_at)}
                          </p>
                        </td>

                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${status.className}`}>
                            <StatusIcon size={14}/>
                            {status.label}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => router.push(`/admin/finance/transactions/${withdrawal.id}`)}
                              className="p-1.5 text-gray-400 hover:text-[#D77E6C] hover:bg-[#D77E6C]/10 rounded-lg transition-colors"
                              title="Подробнее"
                            >
                              <Eye size={16}/>
                            </button>
                            
                            {withdrawal.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleQuickApprove(withdrawal.id)}
                                  disabled={processingId === withdrawal.id}
                                  className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Одобрить"
                                >
                                  <Check size={16}/>
                                </button>
                                <button
                                  onClick={() => handleQuickReject(withdrawal.id)}
                                  disabled={processingId === withdrawal.id}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Отклонить"
                                >
                                  <X size={16}/>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}