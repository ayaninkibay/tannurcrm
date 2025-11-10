// app/admin/finance/subscription/page.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { useTranslate } from '@/hooks/useTranslate';
import { 
  Loader2, Users, Clock, CheckCircle, XCircle, 
  Search, Filter, Download, RefreshCw, Calendar,
  User, CreditCard, ArrowUpDown, ArrowUp, ArrowDown,
  Eye, ChevronDown, UserCheck, Phone, Mail, Hash,
  TrendingUp, DollarSign
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
  approved_by: string | null;
  notes: string | null;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    role: string;
  };
  parent?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  approver?: {
    first_name: string;
    last_name: string;
    email: string;
  };
};

type SortField = 'date' | 'amount' | 'user' | 'status';
type SortDirection = 'asc' | 'desc';
type StatusFilter = 'all' | 'pending' | 'paid' | 'rejected';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

const STORAGE_KEYS = {
  SORT_CONFIG: 'subscriptions_sort_config',
  STATUS_FILTER: 'subscriptions_status_filter'
};

// ✅ Компонент иконки сортировки
const SortIcon = React.memo(({ field, sortConfig }: { field: SortField; sortConfig: SortConfig }) => {
  if (sortConfig.field !== field) {
    return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
  }
  return sortConfig.direction === 'asc' 
    ? <ArrowUp className="w-4 h-4 text-[#D77E6C]" />
    : <ArrowDown className="w-4 h-4 text-[#D77E6C]" />;
});

SortIcon.displayName = 'SortIcon';

const SubscriptionsListPage = () => {
  const router = useRouter();
  const { t } = useTranslate();
  
  const [subscriptions, setSubscriptions] = useState<SubscriptionPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'date', direction: 'desc' });
  const [showFilters, setShowFilters] = useState(false);

  const searchTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  // Загрузка сохраненных настроек
  useEffect(() => {
    try {
      const savedSort = localStorage.getItem(STORAGE_KEYS.SORT_CONFIG);
      const savedFilter = localStorage.getItem(STORAGE_KEYS.STATUS_FILTER);
      
      if (savedSort) setSortConfig(JSON.parse(savedSort));
      if (savedFilter) setStatusFilter(savedFilter as StatusFilter);
    } catch (e) {
      console.error('Error loading settings:', e);
    }
  }, []);

  // Сохранение настроек
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SORT_CONFIG, JSON.stringify(sortConfig));
      localStorage.setItem(STORAGE_KEYS.STATUS_FILTER, statusFilter);
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  }, [sortConfig, statusFilter]);

  // Дебаунс поиска
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setLoading(true);
    const loadingToast = toast.loading('Загрузка подписок...');
    
    try {
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('subscription_payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (subscriptionsError) throw subscriptionsError;

      if (subscriptionsData && subscriptionsData.length > 0) {
        const userIds = subscriptionsData.map(s => s.user_id).filter(Boolean);
        const parentIds = subscriptionsData.map(s => s.parent_id).filter(Boolean);
        const approverIds = subscriptionsData.map(s => s.approved_by).filter(Boolean);
        const allUserIds = [...new Set([...userIds, ...parentIds, ...approverIds])];

        const { data: usersData } = await supabase
          .from('users')
          .select('id, first_name, last_name, email, phone, role')
          .in('id', allUserIds);

        const enrichedSubscriptions = subscriptionsData.map(sub => ({
          ...sub,
          user: usersData?.find(u => u.id === sub.user_id),
          parent: usersData?.find(u => u.id === sub.parent_id),
          approver: usersData?.find(u => u.id === sub.approved_by)
        }));

        setSubscriptions(enrichedSubscriptions);
        toast.success(`Загружено ${enrichedSubscriptions.length} подписок`, { id: loadingToast });
      } else {
        setSubscriptions([]);
        toast.success('Подписок не найдено', { id: loadingToast });
      }
      
    } catch (error: any) {
      console.error('Error loading subscriptions:', error);
      toast.error(error.message || 'Ошибка загрузки подписок', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    setSortConfig(prev => {
      if (prev.field === field) {
        return {
          field,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return {
        field,
        direction: 'desc'
      };
    });
  };

  const handleViewDetails = (subscription: SubscriptionPayment) => {
    router.push(`/admin/finance/subscription/${subscription.id}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-medium border border-yellow-200">
            <Clock className="w-3.5 h-3.5" />
            Ожидает
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium border border-green-200">
            <CheckCircle className="w-3.5 h-3.5" />
            Оплачено
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium border border-red-200">
            <XCircle className="w-3.5 h-3.5" />
            Отклонено
          </span>
        );
      default:
        return <span className="text-xs text-gray-500">{status}</span>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ₸';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { 
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Фильтрация и сортировка
  const filteredSubscriptions = useMemo(() => {
    let result = [...subscriptions];

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      result = result.filter(sub => sub.status === statusFilter);
    }

    // Поиск
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase().trim();
      result = result.filter(sub => {
        const userName = `${sub.user?.first_name || ''} ${sub.user?.last_name || ''}`.toLowerCase();
        const parentName = `${sub.parent?.first_name || ''} ${sub.parent?.last_name || ''}`.toLowerCase();
        const email = (sub.user?.email || '').toLowerCase();
        const phone = (sub.user?.phone || '').toLowerCase();
        
        return (
          userName.includes(query) ||
          parentName.includes(query) ||
          email.includes(query) ||
          phone.includes(query) ||
          sub.id.toLowerCase().includes(query)
        );
      });
    }

    // Сортировка
    result.sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1;

      switch (sortConfig.field) {
        case 'date':
          return direction * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        
        case 'amount':
          return direction * (a.amount - b.amount);
        
        case 'user':
          const aName = `${a.user?.first_name || ''} ${a.user?.last_name || ''}`.toLowerCase();
          const bName = `${b.user?.first_name || ''} ${b.user?.last_name || ''}`.toLowerCase();
          return direction * aName.localeCompare(bName);
        
        case 'status':
          return direction * a.status.localeCompare(b.status);
        
        default:
          return 0;
      }
    });

    return result;
  }, [subscriptions, statusFilter, debouncedSearch, sortConfig]);

  // Статистика
  const stats = useMemo(() => {
    const pending = subscriptions.filter(s => s.status === 'pending');
    const paid = subscriptions.filter(s => s.status === 'paid');
    const rejected = subscriptions.filter(s => s.status === 'rejected');

    return {
      total: subscriptions.length,
      pending: {
        count: pending.length,
        amount: pending.reduce((sum, s) => sum + s.amount, 0)
      },
      paid: {
        count: paid.length,
        amount: paid.reduce((sum, s) => sum + s.amount, 0)
      },
      rejected: {
        count: rejected.length,
        amount: rejected.reduce((sum, s) => sum + s.amount, 0)
      }
    };
  }, [subscriptions]);

  const MobileSubscriptionCard = ({ subscription }: { subscription: SubscriptionPayment }) => (
    <div 
      onClick={() => handleViewDetails(subscription)}
      className="bg-white rounded-xl border border-gray-200 p-4 mb-3 hover:shadow-lg hover:border-[#D77E6C]/30 transition-all duration-200 cursor-pointer transform hover:scale-[1.01]"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900">
              {subscription.user?.first_name} {subscription.user?.last_name}
            </p>
            <p className="text-xs text-gray-500">{subscription.user?.email}</p>
          </div>
        </div>
        {getStatusBadge(subscription.status)}
      </div>

      {subscription.parent && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded-lg">
          <UserCheck className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span>
            Спонсор: <span className="font-medium">{subscription.parent.first_name} {subscription.parent.last_name}</span>
          </span>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{subscription.method || 'Не указан'}</span>
        </div>
        <div className="font-bold text-lg text-[#D77E6C]">
          {formatCurrency(subscription.amount)}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
        <Clock className="w-3.5 h-3.5" />
        <span>{formatDate(subscription.created_at)}</span>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full p-2 md:p-6">
      <MoreHeaderAD title="Все подписки дилеров" showBackButton={true} />

      {/* Статистика */}
      <div className="mt-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">Всего</span>
            </div>
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-xl p-4 border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-semibold text-gray-700">Ожидают</span>
            </div>
            <div className="text-3xl font-bold text-yellow-600 mb-1">{stats.pending.count}</div>
            <div className="text-xs text-gray-600">{formatCurrency(stats.pending.amount)}</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-gray-700">Оплачено</span>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">{stats.paid.count}</div>
            <div className="text-xs text-gray-600">{formatCurrency(stats.paid.amount)}</div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl p-4 border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-semibold text-gray-700">Отклонено</span>
            </div>
            <div className="text-3xl font-bold text-red-600 mb-1">{stats.rejected.count}</div>
            <div className="text-xs text-gray-600">{formatCurrency(stats.rejected.amount)}</div>
          </div>
        </div>
      </div>

      {/* Фильтры и поиск */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Поиск */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по имени, email, телефону, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D77E6C]/50 focus:border-[#D77E6C] transition-all text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Кнопки */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Фильтры</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={loadSubscriptions}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium hidden sm:inline">Обновить</span>
            </button>
          </div>
        </div>

        {/* Панель фильтров */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 animate-in fade-in slide-in-from-top-2">
            <p className="text-sm font-semibold text-gray-700 mb-3">Статус</p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'Все', icon: Users },
                { value: 'pending', label: 'Ожидают', icon: Clock },
                { value: 'paid', label: 'Оплачено', icon: CheckCircle },
                { value: 'rejected', label: 'Отклонено', icon: XCircle }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value as StatusFilter)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === value
                      ? 'bg-[#D77E6C] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Список */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-[#D77E6C] animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Загрузка подписок...</p>
        </div>
      ) : (
        <>
          {/* Мобильная версия */}
          <div className="md:hidden">
            {filteredSubscriptions.length > 0 ? (
              filteredSubscriptions.map((subscription) => (
                <MobileSubscriptionCard key={subscription.id} subscription={subscription} />
              ))
            ) : (
              <div className="text-center text-gray-500 py-12 bg-white rounded-xl border border-gray-200">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="font-medium">Подписок не найдено</p>
              </div>
            )}
          </div>

          {/* Десктопная таблица */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                      ID
                    </th>
                    <th 
                      className="text-left py-4 px-4 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100/80 transition-colors select-none group"
                      onClick={() => handleSort('user')}
                    >
                      <div className="flex items-center gap-2">
                        Дилер
                        <SortIcon field="user" sortConfig={sortConfig} />
                      </div>
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">
                      Спонсор
                    </th>
                    <th 
                      className="text-left py-4 px-4 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100/80 transition-colors select-none group"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center gap-2">
                        Сумма
                        <SortIcon field="amount" sortConfig={sortConfig} />
                      </div>
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">
                      Способ
                    </th>
                    <th 
                      className="text-left py-4 px-4 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100/80 transition-colors select-none group"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-2">
                        Статус
                        <SortIcon field="status" sortConfig={sortConfig} />
                      </div>
                    </th>
                    <th 
                      className="text-left py-4 px-4 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100/80 transition-colors select-none group"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center gap-2">
                        Дата
                        <SortIcon field="date" sortConfig={sortConfig} />
                      </div>
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.length > 0 ? (
                    filteredSubscriptions.map((subscription, index) => (
                      <tr
                        key={subscription.id}
                        className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-all duration-150 cursor-pointer group ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        }`}
                        onClick={() => handleViewDetails(subscription)}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4 text-gray-400 group-hover:text-[#D77E6C] transition-colors" />
                            <span className="font-mono text-sm font-semibold text-gray-900">
                              {subscription.id.slice(-8)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {subscription.user?.first_name} {subscription.user?.last_name}
                            </p>
                            <p className="text-xs text-gray-500">{subscription.user?.email}</p>
                            <p className="text-xs text-gray-500">{subscription.user?.phone}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {subscription.parent ? (
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {subscription.parent.first_name} {subscription.parent.last_name}
                              </p>
                              <p className="text-xs text-gray-500">{subscription.parent.email}</p>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-bold text-[#D77E6C]">
                            {formatCurrency(subscription.amount)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {subscription.method || 'Не указан'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(subscription.status)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {formatDate(subscription.created_at)}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(subscription);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-[#D77E6C] text-white rounded-lg hover:bg-[#C56D5C] transition-colors text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            Открыть
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Подписок не найдено</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Результаты поиска */}
          {(debouncedSearch || statusFilter !== 'all') && (
            <div className="mt-4 text-center text-sm text-gray-600">
              Найдено: <span className="font-bold text-[#D77E6C]">{filteredSubscriptions.length}</span> из {subscriptions.length}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SubscriptionsListPage;