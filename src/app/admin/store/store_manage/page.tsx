// src/app/admin/orders/manage/page.tsx

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
  ShoppingCart
} from 'lucide-react';
import { toast } from 'react-hot-toast';

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

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  payment_status: string;
  order_items: Array<{
    id: string;
    quantity: number;
  }>;
}

export default function OrdersManagePage() {
  const router = useRouter();
  const { t } = useTranslate();
  const { deleteOrders, deleteOrder, isDeleting } = useOrderDelete();

  // State для поиска пользователей
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [foundUsers, setFoundUsers] = useState<UserResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);

  // State для заказов
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  // ==========================================
  // ПОИСК ПОЛЬЗОВАТЕЛЕЙ
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
  // ЗАГРУЗКА ЗАКАЗОВ ПОЛЬЗОВАТЕЛЯ
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
          order_items (
            id,
            quantity
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
      
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
  // ДЕЙСТВИЯ С ЗАКАЗАМИ
  // ==========================================

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order.id));
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
        if (selectedUser) {
          handleSelectUser(selectedUser);
        }
      }
    });
  };

  const handleDeleteSingle = async (orderId: string) => {
    await deleteOrder(orderId, {
      onSuccess: () => {
        // Перезагружаем заказы
        if (selectedUser) {
          handleSelectUser(selectedUser);
        }
      }
    });
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/admin/orders/${orderId}`);
  };

  const handleClearSearch = () => {
    setUserSearchQuery('');
    setFoundUsers([]);
    setSelectedUser(null);
    setOrders([]);
    setSelectedOrders([]);
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
      totalAmount: orders
        .filter(order => selectedOrders.includes(order.id))
        .reduce((sum, order) => sum + (order.total_amount || 0), 0),
      totalItems: orders
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
        
        {/* ШАГ 1: Поиск пользователя */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <UserSearch className="w-5 h-5 text-[#D77E6C]" />
            <h2 className="text-lg font-semibold text-gray-900">
              {t('Шаг 1: Найдите пользователя')}
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

        {/* ШАГ 2: Заказы пользователя */}
        {selectedUser && (
          <>
            {/* Информация о выбранном пользователе */}
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

            {/* Панель массовых действий */}
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

            {/* Таблица заказов */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              
              {/* Заголовок */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-[#D77E6C]" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      {t('Заказы пользователя')} ({orders.length})
                    </h2>
                  </div>

                  {/* Выбрать все */}
                  {orders.length > 0 && (
                    <button
                      onClick={handleSelectAll}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      {selectedOrders.length === orders.length ? (
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
                {loadingOrders ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-[#D77E6C] animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">{t('У пользователя нет заказов')}</p>
                  </div>
                ) : (
                  orders.map((order) => (
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
          </>
        )}
      </div>
    </div>
  );
}