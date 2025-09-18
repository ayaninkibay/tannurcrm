'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  Check,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  ShoppingBag,
  Users,
  Star,
  Clock,
  Calendar,
  Phone,
  MapPin,
  Hash,
  ChevronDown,
  CalendarDays,
  AlertTriangle,
  MoreVertical
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { useTranslate } from '@/hooks/useTranslate';
import { useOrderModule } from '@/lib/orders/useOrderModule';

// Типы
type OrderStatus = 'new' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
type OrderType = 'shop' | 'dealers' | 'star';
type DateFilter = 'week' | 'month' | 'custom';

// Стат карточка
const StatCard = ({
  icon: Icon, title, count, amount, subtitle, iconColor, iconBg
}: {
  icon: React.ElementType; title: string; count: number; amount?: number; subtitle: string; iconColor: string; iconBg: string;
}) => {
  const { t } = useTranslate();
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-100 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className={`flex items-center gap-2 md:gap-3 mb-3 md:mb-4 ${iconColor}`}>
          <Icon className="w-4 h-4 md:w-5 md:h-5" />
          <span className="text-xs sm:text-sm font-medium text-gray-700">{title}</span>
        </div>
        <div className="absolute top-3 right-3 md:top-4 md:right-4">
          <div className={`w-1.5 h-1.5 md:w-2 md:h-2 ${iconBg} rounded-full`} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
            {count}
            <span className="text-xs sm:text-sm font-normal text-gray-600 ml-2">
              {t(count === 1 ? 'заказ' : 'заказов')}
            </span>
          </div>
          {amount !== undefined && amount > 0 && (
            <div className="text-base sm:text-lg font-semibold text-gray-900">
              {amount.toLocaleString()} ₸
            </div>
          )}
          <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
        </div>
        <div className="hidden sm:grid grid-cols-3 md:grid-cols-4 gap-1 opacity-10">
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 md:w-2 md:h-2 ${iconBg} rounded-sm`} />
          ))}
        </div>
      </div>
    </div>
  );
};

const OrdersManagementPage = () => {
  const router = useRouter();
  const { t } = useTranslate();

  const {
    orders,
    stats,
    loading,
    error,
    loadActiveOrders,
    loadOrdersStats,
    clearError
  } = useOrderModule();

  const [activeTab, setActiveTab] = useState<OrderType>('shop');
  const [dateFilter, setDateFilter] = useState<DateFilter>('week');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ 
    isOpen: boolean; 
    orderId: string; 
    newStatus: OrderStatus; 
    action: string; 
  }>({
    isOpen: false, 
    orderId: '', 
    newStatus: 'new', 
    action: ''
  });

  // Загружаем данные при монтировании
  useEffect(() => {
    loadActiveOrders();
    loadOrdersStats();
  }, [loadActiveOrders, loadOrdersStats]);

  // переход на просмотр
 const openOrder = (order: any) => {
  try {
    console.log('Saving order to localStorage:', order.id);
    localStorage.setItem('selected_order', JSON.stringify(order));
  } catch (e) {
    console.error('Error saving order:', e);
  }
  router.push('/admin/store/view_order');
};

  // Вспомогательные функции для работы со статусами
  const getStatusColor = (status: string | null) => {
    const statusMap = {
      new: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      processing: 'bg-purple-100 text-purple-700',
      shipped: 'bg-orange-100 text-orange-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      returned: 'bg-gray-100 text-gray-700'
    };
    return statusMap[status as keyof typeof statusMap] || 'bg-gray-100 text-gray-700';
  };

  const getStatusText = (status: string | null) => {
    const statusMap = {
      new: t('Новый'),
      confirmed: t('Подтвержден'),
      processing: t('Обработка'),
      shipped: t('Отправлен'),
      delivered: t('Доставлен'),
      cancelled: t('Отменен'),
      returned: t('Возврат')
    };
    return statusMap[status as keyof typeof statusMap] || t('Неизвестно');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Фильтрация заказов
  const activeOrders = orders.filter(o => {
    const status = o.order_status;
    return status && !['delivered', 'cancelled'].includes(status);
  });
  
  const completedOrders = orders.filter(o => {
    const status = o.order_status;
    return status && ['delivered', 'cancelled'].includes(status);
  });

  // Статистика
  const todayOrders = orders.filter(o => {
    const today = new Date().toISOString().split('T')[0];
    return o.created_at.startsWith(today);
  });
  const todayTotal = todayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  
  const shippedOrders = orders.filter(o => o.order_status === 'shipped');
  const shippedTotal = shippedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  
  const newOrders = orders.filter(o => o.order_status === 'new');
  const newTotal = newOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

  // Обновление статуса заказа
  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    console.log(`Updating order ${orderId} to status ${newStatus}`);
    setConfirmModal({ isOpen: false, orderId: '', newStatus: 'new', action: '' });
    await loadActiveOrders();
  };

  const openConfirmModal = (orderId: string, newStatus: OrderStatus, action: string) => {
    setConfirmModal({ isOpen: true, orderId, newStatus, action });
  };

  // Мобильная карточка
  const MobileOrderCard = ({
    order,
    onStatusChange,
    type,
    onOpen,
  }: {
    order: any;
    onStatusChange: (orderId: string, newStatus: OrderStatus, action: string) => void;
    type: 'active' | 'completed';
    onOpen: (o: any) => void;
  }) => {
    const [showActions, setShowActions] = useState(false);

    return (
      <div
        className="bg-white rounded-xl border border-gray-100 p-4 mb-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => onOpen(order)}
        role="button"
        aria-label={`${t('Открыть заказ')} ${order.id}`}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-gray-500">#{order.id.slice(-8)}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                {getStatusText(order.order_status)}
              </span>
            </div>
            <p className="font-medium text-sm">{order.user?.first_name} {order.user?.last_name}</p>
            <p className="text-xs text-gray-500">{order.user?.email}</p>
          </div>
          {type === 'active' && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowActions(!showActions); }}
              className="p-1.5 hover:bg-gray-100 rounded-lg"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <Phone className="w-3 h-3 text-gray-400" />
            <span>{order.user?.phone || 'Не указан'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-gray-400" />
            <span>{formatDate(order.created_at)}</span>
          </div>
          {order.delivery_address && (
            <div className="flex items-start gap-2">
              <MapPin className="w-3 h-3 text-gray-400 mt-0.5" />
              <span>{order.delivery_address}</span>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
          <div className="text-xs text-gray-600">
            {order.order_items?.length || 0} {t('товаров')}
          </div>
          <div className="font-semibold text-sm">{(order.total_amount || 0).toLocaleString()} ₸</div>
        </div>

        {showActions && type === 'active' && (
          <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-2" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => onStatusChange(order.id, 'confirmed', t('подтвердить'))} className="flex flex-col items-center gap-1 p-2 hover:bg-blue-50 rounded-lg text-xs">
              <Check className="w-4 h-4 text-blue-600" />
              <span>{t('Подтвердить')}</span>
            </button>
            <button onClick={() => onStatusChange(order.id, 'shipped', t('отправить'))} className="flex flex-col items-center gap-1 p-2 hover:bg-orange-50 rounded-lg text-xs">
              <Truck className="w-4 h-4 text-orange-600" />
              <span>{t('Отправить')}</span>
            </button>
            <button onClick={() => onStatusChange(order.id, 'cancelled', t('отменить'))} className="flex flex-col items-center gap-1 p-2 hover:bg-red-50 rounded-lg text-xs">
              <XCircle className="w-4 h-4 text-red-600" />
              <span>{t('Отменить')}</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  // Кнопки действий (десктоп)
  const ActionButtons = ({ order }: { order: any }) => {
    const buttons = [
      { icon: Check, status: 'confirmed' as OrderStatus, tooltip: t('Подтвердить заказ'), action: t('подтвердить'), color: 'hover:bg-blue-50 hover:text-blue-600' },
      { icon: Package, status: 'processing' as OrderStatus, tooltip: t('Начать обработку'), action: t('начать обработку'), color: 'hover:bg-purple-50 hover:text-purple-600' },
      { icon: Truck, status: 'shipped' as OrderStatus, tooltip: t('Отправить'), action: t('отправить'), color: 'hover:bg-orange-50 hover:text-orange-600' },
      { icon: CheckCircle, status: 'delivered' as OrderStatus, tooltip: t('Отметить доставленным'), action: t('отметить доставленным'), color: 'hover:bg-green-50 hover:text-green-600' },
      { icon: XCircle, status: 'cancelled' as OrderStatus, tooltip: t('Отменить заказ'), action: t('отменить'), color: 'hover:bg-red-50 hover:text-red-600' }
    ];

    return (
      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
        {buttons.map(({ icon: Icon, status, tooltip, action, color }) => (
          <div key={status} className="relative group">
            <button
              onClick={() => openConfirmModal(order.id, status, action)}
              className={`p-2 rounded-lg transition-all ${color} ${order.order_status === status ? 'bg-gray-100' : ''}`}
              disabled={order.order_status === status}
              title={tooltip}
            >
              <Icon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex">
        <div className="grid w-full h-full">
          <MoreHeaderAD title={t('Управление заказами')} />
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#DC7C67] border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (

    <div className="flex">

      <div className="grid w-full h-full">
        <MoreHeaderAD title={t('Управление заказами')} />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between mt-6">
            <span className="text-red-700">{error}</span>
            <button onClick={clearError} className="text-red-500 hover:text-red-700">×</button>
          </div>
        )}

        {/* Статистика */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mt-6 md:mt-10 mb-4 md:mb-6">
          <StatCard 
            icon={Calendar} 
            title={t('Заказы за сегодня')} 
            count={todayOrders.length} 
            amount={todayTotal} 
            subtitle={t('Заказы за сегодня')} 
            iconColor="text-[#D77E6C]" 
            iconBg="bg-[#D77E6C]" 
          />
          <StatCard 
            icon={Truck} 
            title={t('Отправлены')} 
            count={shippedOrders.length} 
            amount={shippedTotal} 
            subtitle={t('В пути к клиентам')} 
            iconColor="text-[#D77E6C]" 
            iconBg="bg-[#D77E6C]" 
          />
          <StatCard 
            icon={AlertTriangle} 
            title={t('Требуют внимания')} 
            count={newOrders.length} 
            amount={newTotal} 
            subtitle={t('Новые заказы')} 
            iconColor="text-[#D77E6C]" 
            iconBg="bg-[#D77E6C]" 
          />
        </div>

        {/* Табы */}
        <div className="overflow-x-auto mb-4 md:mb-6">
          <div className="bg-gray-100/50 backdrop-blur-sm rounded-2xl p-1.5 inline-flex min-w-full sm:min-w-0">
            <button 
              onClick={() => setActiveTab('shop')} 
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'shop' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-base font-medium">{t('Все заказы')}</span>
            </button>
          </div>
        </div>

        {/* Активные — мобильные */}
        <div className="md:hidden">
          <div className="mb-4">
            <h2 className="text-base font-medium mb-3">{t('Активные заказы')} ({activeOrders.length})</h2>
            {activeOrders.length > 0 ? (
              activeOrders.map((order) => (
                <MobileOrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={(id, st, act) => setConfirmModal({ isOpen: true, orderId: id, newStatus: st, action: act })}
                  type="active"
                  onOpen={openOrder}
                />
              ))
            ) : (
              <div className="text-center text-gray-500 py-8 bg-white rounded-xl">{t('Нет активных заказов')}</div>
            )}
          </div>
        </div>

        {/* Активные — десктоп */}
        <div className="hidden md:block bg-white rounded-2xl border border-gray-100 mb-6">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-medium">{t('Активные заказы')}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('Клиент')}</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('Дата')}</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('Товары')}</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('Сумма')}</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('Статус')}</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">{t('Действия')}</th>
                </tr>
              </thead>
              <tbody>
                {activeOrders.length > 0 ? (
                  activeOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => openOrder(order)}
                      role="button"
                      aria-label={`${t('Открыть заказ')} ${order.id}`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <span className="font-mono text-sm">{order.id.slice(-8)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{order.user?.first_name} {order.user?.last_name}</p>
                          <p className="text-xs text-gray-500">{order.user?.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{formatDate(order.created_at)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          {order.order_items?.length || 0} {t('товаров')}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold">{(order.total_amount || 0).toLocaleString()} ₸</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                          {getStatusText(order.order_status)}
                        </span>
                      </td>
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        <ActionButtons order={order} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      {t('Нет активных заказов')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ЗАВЕРШЕННЫЕ — мобильные */}
        <div className="md:hidden">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-medium">
              {t('Завершенные заказы')}
              <span className="ml-2 text-gray-500">({completedOrders.length})</span>
            </h2>
            <button
              onClick={() => setShowCompleted(v => !v)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors"
            >
              <span>{showCompleted ? t('Свернуть') : t('Показать')}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showCompleted ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showCompleted && (
            <>
              {completedOrders.length > 0 ? (
                completedOrders.map((order) => (
                  <MobileOrderCard
                    key={order.id}
                    order={order}
                    onStatusChange={(id, st, act) => setConfirmModal({ isOpen: true, orderId: id, newStatus: st, action: act })}
                    type="completed"
                    onOpen={openOrder}
                  />
                ))
              ) : (
                <div className="text-center text-gray-500 py-8 bg-white rounded-xl">
                  {t('Нет завершенных заказов')}
                </div>
              )}
            </>
          )}
        </div>

        {/* ЗАВЕРШЕННЫЕ — десктоп */}
        <div className="hidden md:block bg-white rounded-2xl border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-medium">
                {t('Завершенные заказы')}
                <span className="ml-2 text-gray-500 text-base">({completedOrders.length})</span>
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCompleted(v => !v)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                <span>{showCompleted ? t('Свернуть') : t('Показать')}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showCompleted ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {showCompleted && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">{t('ID')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('Клиент')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('Дата')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('Товары')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('Сумма')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('Статус')}</th>
                  </tr>
                </thead>
                <tbody>
                  {completedOrders.length > 0 ? (
                    completedOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                        onClick={() => openOrder(order)}
                        role="button"
                        aria-label={`${t('Открыть заказ')} ${order.id}`}
                      >
                        <td className="py-4 px-6"><span className="font-mono text-sm">{order.id.slice(-8)}</span></td>
                        <td className="py-4 px-4 font-medium">{order.user?.first_name} {order.user?.last_name}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{formatDate(order.created_at)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm">{order.order_items?.length || 0} {t('товаров')}</td>
                        <td className="py-4 px-4 font-semibold">{(order.total_amount || 0).toLocaleString()} ₸</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                            {getStatusText(order.order_status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        {t('Нет завершенных заказов')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Модалка подтверждения */}
        {confirmModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
              <div className="flex items-center justify-center w-12 h-12 bg-[#D77E6C]/10 rounded-full mb-4 mx-auto">
                <AlertTriangle className="w-6 h-6 text-[#D77E6C]" />
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">{t('Подтверждение действия')}</h3>
              <p className="text-gray-600 text-center mb-6">
                {t('Вы действительно хотите')} <strong>{confirmModal.action}</strong> {t('заказ')}{' '}
                <span className="font-mono text-sm">#{confirmModal.orderId.slice(-8)}</span>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal({ isOpen: false, orderId: '', newStatus: 'new', action: '' })}
                  className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  {t('Отмена')}
                </button>
                <button
                  onClick={() => updateOrderStatus(confirmModal.orderId, confirmModal.newStatus)}
                  className="flex-1 py-2.5 px-4 bg-[#D77E6C] hover:bg-[#C66B5A] text-white rounded-lg font-medium transition-colors"
                >
                  {t('Подтвердить')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersManagementPage;