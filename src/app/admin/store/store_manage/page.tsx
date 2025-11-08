// src/app/admin/store/store_manage/page.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { supabase } from '@/lib/supabase/client';
import { useOrderDelete } from '@/lib/order/useOrderDelete';
import { useTranslate } from '@/hooks/useTranslate';
import {
  Search,
  Trash2,
  Loader2,
  AlertTriangle,
  Package,
  User,
  Calendar,
  DollarSign,
  CheckSquare,
  Square,
  Eye,
  X,
  UserSearch,
  ShoppingCart,
  Filter,
  CalendarRange,
  Users
} from 'lucide-react';
import { toast } from 'react-toastify';

// ==========================================
// ТИПЫ
// ==========================================

interface UserResult {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;
}

interface OrderWithUser {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  payment_status: string;
  user_id: string;
  order_items: Array<{
    id: string;
    quantity: number;
  }>;
  user: UserResult;
}

type SearchMode = 'single' | 'period';

export default function OrdersManagePage() {
  const router = useRouter();
  const { t } = useTranslate();
  const { deleteOrders, deleteOrder, isDeleting } = useOrderDelete();

  // Режим поиска
  const [searchMode, setSearchMode] = useState<SearchMode>('single');

  // State для поиска одного пользователя
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [foundUsers, setFoundUsers] = useState<UserResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);

  // State для поиска по периоду
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loadingPeriodOrders, setLoadingPeriodOrders] = useState(false);
  const [periodOrders, setPeriodOrders] = useState<OrderWithUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]); // Для фильтрации пользователей

  // State для заказов
  const [orders, setOrders] = useState<OrderWithUser[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  // ==========================================
  // ПОИСК ОДНОГО ПОЛЬЗОВАТЕЛЯ
  // ==========================================

  const handleSearchUsers = async () => {
    if (!userSearchQuery.trim()) {
      toast.error('Введите имя, email или телефон');
      return;
    }

    setSearchingUsers(true);
    setFoundUsers([]);
    setSelectedUser(null);
    setOrders([]);
    setSelectedOrders([]);

    try {
      const query = userSearchQuery.toLowerCase().trim();

      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, phone, role')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error('Пользователи не найдены');
        setFoundUsers([]);
      } else {
        setFoundUsers(data);
        toast.success(`Найдено пользователей: ${data.length}`);
      }

    } catch (error: any) {
      console.error('❌ Error searching users:', error);
      toast.error('Ошибка поиска пользователей');
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchUsers();
    }
  };

  // ==========================================
  // ЗАГРУЗКА ЗАКАЗОВ ОДНОГО ПОЛЬЗОВАТЕЛЯ
  // ==========================================

  const handleSelectUser = async (user: UserResult) => {
    setSelectedUser(user);
    setSelectedOrders([]);
    setLoadingOrders(true);

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          total_amount,
          created_at,
          payment_status,
          user_id,
          order_items (
            id,
            quantity
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const ordersWithUser = (data || []).map(order => ({
        ...order,
        user: user
      }));

      setOrders(ordersWithUser);
      
      if (!data || data.length === 0) {
        toast.info('У пользователя нет заказов');
      } else {
        toast.success(`Найдено заказов: ${data.length}`);
      }

    } catch (error: any) {
      console.error('❌ Error loading orders:', error);
      toast.error('Ошибка загрузки заказов');
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  // ==========================================
  // ПОИСК ЗАКАЗОВ ЗА ПЕРИОД
  // ==========================================

  const handleSearchByPeriod = async () => {
    if (!startDate || !endDate) {
      toast.error('Выберите начальную и конечную дату');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Начальная дата не может быть больше конечной');
      return;
    }

    setLoadingPeriodOrders(true);
    setPeriodOrders([]);
    setSelectedOrders([]);
    setSelectedUsers([]);

    try {
      // Добавляем время к датам для корректного поиска
      const startDateTime = `${startDate}T00:00:00`;
      const endDateTime = `${endDate}T23:59:59`;

      // ✅ ПРАВИЛЬНЫЙ FOREIGN KEY: fk_orders_user
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          total_amount,
          created_at,
          payment_status,
          user_id,
          order_items (
            id,
            quantity
          ),
          users!fk_orders_user (
            id,
            first_name,
            last_name,
            email,
            phone,
            role
          )
        `)
        .gte('created_at', startDateTime)
        .lte('created_at', endDateTime)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setPeriodOrders([]);
        setOrders([]);
        toast.info(`Заказов за выбранный период не найдено`);
        return;
      }

      // Преобразуем данные
      const ordersWithUser = data.map((order: any) => ({
        ...order,
        user: order.users as UserResult
      })) as OrderWithUser[];

      setPeriodOrders(ordersWithUser);
      setOrders(ordersWithUser);

      const uniqueUsers = new Set(data.map((o: any) => o.user_id)).size;
      toast.success(`Найдено: ${data.length} заказов от ${uniqueUsers} пользователей`);

    } catch (error: any) {
      console.error('❌ Error searching by period:', error);
      toast.error('Ошибка поиска заказов за период');
    } finally {
      setLoadingPeriodOrders(false);
    }
  };

  // ==========================================
  // ФИЛЬТРАЦИЯ ПО ПОЛЬЗОВАТЕЛЯМ
  // ==========================================

  const getUniqueUsers = (): UserResult[] => {
    const userMap = new Map<string, UserResult>();
    periodOrders.forEach(order => {
      if (!userMap.has(order.user_id)) {
        userMap.set(order.user_id, order.user);
      }
    });
    return Array.from(userMap.values());
  };

  const handleToggleUserFilter = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAllUsers = () => {
    const allUserIds = getUniqueUsers().map(u => u.id);
    if (selectedUsers.length === allUserIds.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(allUserIds);
    }
  };

  // Отфильтрованные заказы
  const filteredOrders = searchMode === 'period' && selectedUsers.length > 0
    ? periodOrders.filter(order => selectedUsers.includes(order.user_id))
    : orders;

  // ==========================================
  // ДЕЙСТВИЯ С ЗАКАЗАМИ
  // ==========================================

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id));
    }
  };

  const handleToggleOrder = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedOrders.length === 0) {
      toast.error('Выберите заказы для удаления');
      return;
    }

    const success = await deleteOrders(selectedOrders, {
      onSuccess: () => {
        setSelectedOrders([]);
        // Перезагружаем заказы
        if (searchMode === 'single' && selectedUser) {
          handleSelectUser(selectedUser);
        } else if (searchMode === 'period') {
          handleSearchByPeriod();
        }
      }
    });
  };

  const handleDeleteSingle = async (orderId: string) => {
    await deleteOrder(orderId, {
      onSuccess: () => {
        // Перезагружаем заказы
        if (searchMode === 'single' && selectedUser) {
          handleSelectUser(selectedUser);
        } else if (searchMode === 'period') {
          handleSearchByPeriod();
        }
      }
    });
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/admin/store/view_order/${orderId}`);
  };

  const handleClearSearch = () => {
    setUserSearchQuery('');
    setFoundUsers([]);
    setSelectedUser(null);
    setOrders([]);
    setSelectedOrders([]);
    setStartDate('');
    setEndDate('');
    setPeriodOrders([]);
    setSelectedUsers([]);
  };

  // ==========================================
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // ==========================================

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('ru-RU')} ₸`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      processing: 'bg-yellow-100 text-yellow-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800',
      returned: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new: t('Новый'),
      confirmed: t('Подтвержден'),
      processing: t('В обработке'),
      shipped: t('Отправлен'),
      delivered: t('Доставлен'),
      cancelled: t('Отменен'),
      returned: t('Возврат')
    };
    return labels[status] || status;
  };

  const getUserDisplayName = (user: UserResult) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user.email || user.phone || 'Без имени';
  };

  const getTotalStats = () => {
    return {
      selected: selectedOrders.length,
      totalAmount: filteredOrders
        .filter(order => selectedOrders.includes(order.id))
        .reduce((sum, order) => sum + (order.total_amount || 0), 0),
      totalItems: filteredOrders
        .filter(order => selectedOrders.includes(order.id))
        .reduce((sum, order) => sum + (order.order_items?.length || 0), 0)
    };
  };

  const stats = getTotalStats();

  // ==========================================
  // РЕНДЕР
  // ==========================================

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <MoreHeaderAD 
        title={t('Управление заказами')} 
        showBackButton={true}
      />

      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        
        {/* ПЕРЕКЛЮЧАТЕЛЬ РЕЖИМОВ */}
        <div className="mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-1.5 inline-flex gap-1 shadow-sm">
            <button
              onClick={() => {
                setSearchMode('single');
                handleClearSearch();
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
                searchMode === 'single'
                  ? 'bg-[#D77E6C] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <UserSearch className="w-4 h-4" />
              <span className="font-medium">{t('Один пользователь')}</span>
            </button>
            <button
              onClick={() => {
                setSearchMode('period');
                handleClearSearch();
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
                searchMode === 'period'
                  ? 'bg-[#D77E6C] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <CalendarRange className="w-4 h-4" />
              <span className="font-medium">{t('По периоду')}</span>
            </button>
          </div>
        </div>

        {/* РЕЖИМ: ОДИН ПОЛЬЗОВАТЕЛЬ */}
        {searchMode === 'single' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <UserSearch className="w-5 h-5 text-[#D77E6C]" />
              <h2 className="text-lg font-semibold text-gray-900">
                {t('Найдите пользователя')}
              </h2>
            </div>

            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('Введите имя, email или телефон пользователя...')}
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:border-[#D77E6C] focus:outline-none transition-colors"
                  autoComplete="off"
                  data-form-type="other"
                />
                {userSearchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
              <button
                onClick={handleSearchUsers}
                disabled={searchingUsers || !userSearchQuery.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-[#D77E6C] text-white rounded-lg hover:bg-[#C56D5C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {searchingUsers ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('Поиск...')}
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    {t('Найти')}
                  </>
                )}
              </button>
            </div>

            {/* Результаты поиска пользователей */}
            {foundUsers.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  {t('Найдено пользователей:')} {foundUsers.length}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {foundUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                        selectedUser?.id === user.id
                          ? 'border-[#D77E6C] bg-[#D77E6C]/5'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="w-10 h-10 bg-[#D77E6C]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-[#D77E6C]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {getUserDisplayName(user)}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {user.email || user.phone}
                        </p>
                      </div>
                      {selectedUser?.id === user.id && (
                        <CheckSquare className="w-5 h-5 text-[#D77E6C] flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* РЕЖИМ: ПО ПЕРИОДУ */}
        {searchMode === 'period' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarRange className="w-5 h-5 text-[#D77E6C]" />
              <h2 className="text-lg font-semibold text-gray-900">
                {t('Поиск заказов за период')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Начальная дата')}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:border-[#D77E6C] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Конечная дата')}
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:border-[#D77E6C] focus:outline-none transition-colors"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleSearchByPeriod}
                  disabled={loadingPeriodOrders || !startDate || !endDate}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#D77E6C] text-white rounded-lg hover:bg-[#C56D5C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loadingPeriodOrders ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('Поиск...')}
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      {t('Найти заказы')}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Фильтр по пользователям */}
            {periodOrders.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#D77E6C]" />
                    <h3 className="text-sm font-semibold text-gray-900">
                      {t('Фильтр по пользователям')} ({getUniqueUsers().length})
                    </h3>
                  </div>
                  <button
                    onClick={handleSelectAllUsers}
                    className="text-sm text-[#D77E6C] hover:text-[#C56D5C] font-medium"
                  >
                    {selectedUsers.length === getUniqueUsers().length 
                      ? t('Снять все') 
                      : t('Выбрать всех')
                    }
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                  {getUniqueUsers().map((user) => {
                    const userOrdersCount = periodOrders.filter(o => o.user_id === user.id).length;
                    const isSelected = selectedUsers.includes(user.id);

                    return (
                      <button
                        key={user.id}
                        onClick={() => handleToggleUserFilter(user.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                          isSelected
                            ? 'border-[#D77E6C] bg-[#D77E6C]/5'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#D77E6C] flex-shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {getUserDisplayName(user)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {userOrdersCount} {t('заказов')}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ИНФОРМАЦИЯ О ВЫБРАННОМ ПОЛЬЗОВАТЕЛЕ (только для single mode) */}
        {searchMode === 'single' && selectedUser && (
          <div className="bg-gradient-to-r from-[#D77E6C]/10 to-[#E09080]/10 border border-[#D77E6C]/20 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#D77E6C]/20 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-[#D77E6C]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('Выбран пользователь:')}</p>
                  <p className="font-semibold text-gray-900">
                    {getUserDisplayName(selectedUser)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedUser.email} • {selectedUser.phone}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClearSearch}
                className="p-2 text-gray-600 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ИНФОРМАЦИЯ О ПЕРИОДЕ (только для period mode) */}
        {searchMode === 'period' && periodOrders.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CalendarRange className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('Период:')}</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(startDate).toLocaleDateString('ru-RU')} - {new Date(endDate).toLocaleDateString('ru-RU')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {filteredOrders.length} {t('заказов')} • {getUniqueUsers().length} {t('пользователей')}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClearSearch}
                className="p-2 text-gray-600 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ПАНЕЛЬ МАССОВЫХ ДЕЙСТВИЙ */}
        {selectedOrders.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-900">
                    {t('Выбрано заказов:')} {stats.selected}
                  </p>
                  <p className="text-sm text-red-700">
                    {t('Позиций:')} {stats.totalItems} • {t('Сумма:')} {formatPrice(stats.totalAmount)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedOrders([])}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('Отменить')}
                </button>
                <button
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('Удаление...')}
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      {t('Удалить выбранные')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ТАБЛИЦА ЗАКАЗОВ */}
        {((searchMode === 'single' && selectedUser) || (searchMode === 'period' && periodOrders.length > 0)) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* Заголовок */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#D77E6C]" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    {t('Заказы')} ({filteredOrders.length})
                  </h2>
                </div>

                {/* Выбрать все */}
                {filteredOrders.length > 0 && (
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {selectedOrders.length === filteredOrders.length ? (
                      <CheckSquare className="w-4 h-4 text-[#D77E6C]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    <span>{t('Выбрать все')}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Список заказов */}
            <div className="divide-y divide-gray-200">
              {loadingOrders || loadingPeriodOrders ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-[#D77E6C] animate-spin" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">{t('Заказов не найдено')}</p>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      selectedOrders.includes(order.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      
                      {/* Чекбокс */}
                      <button
                        onClick={() => handleToggleOrder(order.id)}
                        className="mt-1 flex-shrink-0"
                      >
                        {selectedOrders.includes(order.id) ? (
                          <CheckSquare className="w-5 h-5 text-[#D77E6C]" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>

                      {/* Основная информация */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {order.order_number || t('Без номера')}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                          {searchMode === 'period' && (
                            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              {getUserDisplayName(order.user)}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span>{formatDate(order.created_at)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="font-medium text-gray-900">
                              {formatPrice(order.total_amount)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span>
                              {order.order_items?.length || 0} {t('поз.')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Действия */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleViewOrder(order.id)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title={t('Просмотр')}
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSingle(order.id)}
                          disabled={isDeleting}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title={t('Удалить')}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}