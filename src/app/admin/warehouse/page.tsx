// src/app/admin/warehouse/page.tsx

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Hash,
  Phone,
  MapPin,
  Loader2,
  ShoppingBag,
  Search,
  ChevronLeft,
  ChevronRight,
  Check,
  RefreshCw,
  Warehouse,
  PackageCheck,
  Truck,
  Settings,
  Box,
  FileText // 👈 НОВАЯ ИКОНКА
} from 'lucide-react';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { useTranslate } from '@/hooks/useTranslate';
import { useOrderModule } from '@/lib/admin_orders/useOrderModule';
import ReportModal from '@/components/warehouse/ReportModal'; // 👈 ИМПОРТ МОДАЛКИ

type TabType = 'warehouse' | 'packed' | 'ready_for_pickup' | 'shipped' | 'completed';

const WarehouseOrdersPage = () => {
  const router = useRouter();
  const { t } = useTranslate();

  const {
    activeOrders,
    completedOrders,
    loading,
    loadingCompleted,
    error,
    completedPagination,
    loadAllActiveOrders,
    loadCompletedOrders,
    clearError,
    refreshOrders
  } = useOrderModule();

  const [activeTab, setActiveTab] = useState<TabType>('warehouse');
  const [searchQuery, setSearchQuery] = useState('');
  const [completedOrdersLoaded, setCompletedOrdersLoaded] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false); // 👈 СОСТОЯНИЕ МОДАЛКИ
  
  const initialLoadStarted = React.useRef(false);

  useEffect(() => {
    if (!initialLoadStarted.current) {
      initialLoadStarted.current = true;
      loadAllActiveOrders().then(() => {
        setInitialLoadDone(true);
      });
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'completed' && !completedOrdersLoaded) {
      loadCompletedOrders(1, 50);
      setCompletedOrdersLoaded(true);
    }
  }, [activeTab, completedOrdersLoaded, loadCompletedOrders]);

  const getStatusConfig = (status: string | null) => {
    const configs: any = {
      'new': {
        label: t('Новый'),
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-200'
      },
      'confirmed': {
        label: t('Подтвержден'),
        color: 'text-green-700',
        bg: 'bg-green-50',
        border: 'border-green-200'
      },
      'processing': {
        label: t('В обработке'),
        color: 'text-yellow-700',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200'
      },
      'transferred_to_warehouse': {
        label: t('Передан в склад'),
        color: 'text-purple-700',
        bg: 'bg-purple-50',
        border: 'border-purple-200'
      },
      'packed': {
        label: t('Упакован'),
        color: 'text-teal-700',
        bg: 'bg-teal-50',
        border: 'border-teal-200'
      },
      'ready_for_pickup': {
        label: t('Готов к выдаче'),
        color: 'text-indigo-700',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200'
      },
      'shipped': {
        label: t('Отправлен'),
        color: 'text-cyan-700',
        bg: 'bg-cyan-50',
        border: 'border-cyan-200'
      },
      'delivered': {
        label: t('Доставлен'),
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200'
      },
      'cancelled': {
        label: t('Отменен'),
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200'
      },
      'returned': {
        label: t('Возврат'),
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-200'
      }
    };
    return configs[status as string] || configs['new'];
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

  const openOrder = (order: any) => {
    try {
      router.push(`/admin/warehouse/warehouse_control/view_order/${order.id}`);
    } catch (e) {
      console.error('Error opening order:', e);
    }
  };

  // 📊 Статистика для склада
  const stats = useMemo(() => {
    const warehouseOrders = activeOrders.filter(o => 
      o.order_status === 'transferred_to_warehouse'
    );
    
    const packedOrders = activeOrders.filter(o => 
      o.order_status === 'packed'
    );
    
    const readyOrders = activeOrders.filter(o => 
      o.order_status === 'ready_for_pickup'
    );
    
    const shippedOrders = activeOrders.filter(o => 
      o.order_status === 'shipped'
    );
    
    const completedCount = completedOrdersLoaded ? completedPagination.total : 0;
    
    return {
      warehouse: { count: warehouseOrders.length },
      packed: { count: packedOrders.length },
      ready_for_pickup: { count: readyOrders.length },
      shipped: { count: shippedOrders.length },
      completed: { count: completedCount }
    };
  }, [activeOrders, completedOrdersLoaded, completedPagination.total]);

  // Фильтрация по вкладкам
  const getTabOrders = (tab: TabType) => {
    switch(tab) {
      case 'warehouse':
        return activeOrders.filter(o => o.order_status === 'transferred_to_warehouse');
      case 'packed':
        return activeOrders.filter(o => o.order_status === 'packed');
      case 'ready_for_pickup':
        return activeOrders.filter(o => o.order_status === 'ready_for_pickup');
      case 'shipped':
        return activeOrders.filter(o => o.order_status === 'shipped');
      case 'completed':
        return completedOrders;
      default:
        return [];
    }
  };

  // Поиск
  const filteredOrders = useMemo(() => {
    let result = getTabOrders(activeTab);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(order => {
        const fullName = `${order.user?.first_name || ''} ${order.user?.last_name || ''}`.toLowerCase();
        const phone = (order.user?.phone || '').toLowerCase();
        const email = (order.user?.email || '').toLowerCase();
        const orderNumber = (order.order_number || order.id).toLowerCase();
        
        return (
          fullName.includes(query) ||
          phone.includes(query) ||
          email.includes(query) ||
          orderNumber.includes(query)
        );
      });
    }

    return result;
  }, [activeOrders, completedOrders, activeTab, searchQuery]);

  const MobileOrderCard = ({ order }: { order: any }) => {
    const config = getStatusConfig(order.order_status);

    return (
      <div 
        className="bg-white rounded-xl border border-gray-200 p-3 mb-2 hover:shadow-md transition-all cursor-pointer"
        onClick={() => openOrder(order)}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="font-mono text-xs font-semibold text-gray-700">
                #{order.order_number || order.id.slice(-8)}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color} border ${config.border}`}>
                {config.label}
              </span>
            </div>
            <p className="font-semibold text-sm text-gray-900">
              {order.user?.first_name} {order.user?.last_name}
            </p>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span>{order.user?.phone || t('Не указан')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span>{formatDate(order.created_at)}</span>
          </div>
          {order.delivery_address && (
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{order.delivery_address}</span>
            </div>
          )}
          {order.department_notes && (
            <div className="flex items-start gap-2 mt-2 pt-2 border-t border-purple-100">
              <Package className="w-3.5 h-3.5 text-purple-600 mt-0.5 flex-shrink-0" />
              <span className="text-purple-700 font-medium line-clamp-2">{order.department_notes}</span>
            </div>
          )}
        </div>

        <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
          <div className="text-xs text-gray-600">
            {order.order_items?.length || 0} {t('товаров')}
          </div>
          <div className="font-bold text-sm text-[#D77E6C]">
            {(order.total_amount || 0).toLocaleString()} ₸
          </div>
        </div>
      </div>
    );
  };

  if (!initialLoadDone && loading) {
    return (
      <div className="flex">
        <div className="grid w-full h-full">
          <MoreHeaderAD title={t('Склад')} />
          <div className="flex flex-col justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-[#D77E6C] animate-spin mb-4" />
            <p className="text-gray-600 font-medium">{t('Загрузка заказов...')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="grid w-full h-full">
        <MoreHeaderAD title={t('Складские заказы')} />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between mt-6 md:mx-0">
            <span className="text-red-700">{error}</span>
            <button onClick={clearError} className="text-red-500 hover:text-red-700 text-xl">×</button>
          </div>
        )}

        {/* ШАПКА С КНОПКАМИ - ОБНОВЛЕНО! 👇 */}
        <div className="mt-6 md:mt-10 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t('Управление заказами')}</h2>
            <p className="text-sm text-gray-600 mt-1">{t('Ежедневные заказы')}</p>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto flex-wrap">
            {/* 🆕 КНОПКА СОЗДАТЬ ОТЧЕТ */}
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all shadow-md"
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm font-semibold">{t('Создать отчет')}</span>
            </button>

            <button
              onClick={refreshOrders}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium hidden sm:inline">{t('Обновить')}</span>
            </button>
            
            <button
              onClick={() => router.push('/admin/warehouse/warehouse_control')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm font-semibold">{t('Управление складом')}</span>
            </button>
          </div>
        </div>

        {/* ТАБЫ */}
        <div className="mb-4 md:mb-6">
          <div className="bg-gray-100/50 backdrop-blur-sm rounded-2xl p-1.5 inline-flex w-full sm:w-auto overflow-x-auto">
            <button 
              onClick={() => setActiveTab('warehouse')} 
              className={`flex items-center gap-2 px-2.5 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all whitespace-nowrap flex-1 sm:flex-initial justify-center sm:justify-start ${
                activeTab === 'warehouse' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Warehouse className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium">
                <span className="hidden lg:inline">{t('В складе')}</span>
                <span className="inline lg:hidden">({stats.warehouse.count})</span>
                <span className="hidden lg:inline"> ({stats.warehouse.count})</span>
              </span>
            </button>
            
            <button 
              onClick={() => setActiveTab('packed')} 
              className={`flex items-center gap-2 px-2.5 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all whitespace-nowrap flex-1 sm:flex-initial justify-center sm:justify-start ${
                activeTab === 'packed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Box className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium">
                <span className="hidden lg:inline">{t('Упакован')}</span>
                <span className="inline lg:hidden">({stats.packed.count})</span>
                <span className="hidden lg:inline"> ({stats.packed.count})</span>
              </span>
            </button>
            
            <button 
              onClick={() => setActiveTab('ready_for_pickup')} 
              className={`flex items-center gap-2 px-2.5 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all whitespace-nowrap flex-1 sm:flex-initial justify-center sm:justify-start ${
                activeTab === 'ready_for_pickup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium">
                <span className="hidden lg:inline">{t('Готов к выдаче')}</span>
                <span className="inline lg:hidden">({stats.ready_for_pickup.count})</span>
                <span className="hidden lg:inline"> ({stats.ready_for_pickup.count})</span>
              </span>
            </button>
            
            <button 
              onClick={() => setActiveTab('shipped')} 
              className={`flex items-center gap-2 px-2.5 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all whitespace-nowrap flex-1 sm:flex-initial justify-center sm:justify-start ${
                activeTab === 'shipped' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium">
                <span className="hidden lg:inline">{t('Доставка')}</span>
                <span className="inline lg:hidden">({stats.shipped.count})</span>
                <span className="hidden lg:inline"> ({stats.shipped.count})</span>
              </span>
            </button>
            
            <button 
              onClick={() => setActiveTab('completed')} 
              className={`flex items-center gap-2 px-2.5 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all whitespace-nowrap flex-1 sm:flex-initial justify-center sm:justify-start ${
                activeTab === 'completed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <PackageCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium">
                <span className="hidden lg:inline">{t('Завершено')}</span>
                {completedOrdersLoaded ? (
                  <>
                    <span className="inline lg:hidden">({stats.completed.count})</span>
                    <span className="hidden lg:inline"> ({stats.completed.count})</span>
                  </>
                ) : ''}
              </span>
            </button>
          </div>
        </div>

        {/* ПОИСК */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('Поиск по имени, телефону, номеру заказа...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Лоадер для завершенных */}
        {activeTab === 'completed' && loadingCompleted && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-10 h-10 text-[#D77E6C] animate-spin" />
          </div>
        )}

        {/* МОБИЛЬНАЯ ВЕРСИЯ */}
        <div className="md:hidden mb-6">
          {!loadingCompleted && filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <MobileOrderCard key={order.id} order={order} />
            ))
          ) : !loadingCompleted ? (
            <div className="text-center text-gray-500 py-12 bg-white rounded-xl border border-gray-200">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="font-medium">{t('Заказов не найдено')}</p>
            </div>
          ) : null}
        </div>

        {/* ДЕСКТОПНАЯ ТАБЛИЦА */}
        <div className="hidden md:block mb-6">
          {!loadingCompleted && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">{t('Номер')}</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t('Клиент')}</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t('Дата')}</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t('Адрес')}</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t('Заметки склада')}</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t('Товары')}</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t('Сумма')}</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t('Статус')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => {
                        const config = getStatusConfig(order.order_status);
                        
                        return (
                          <tr
                            key={order.id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => openOrder(order)}
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <Hash className="w-4 h-4 text-gray-400" />
                                <span className="font-mono text-sm font-semibold text-gray-900">
                                  {order.order_number || order.id.slice(-8)}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">
                                  {order.user?.first_name} {order.user?.last_name}
                                </p>
                                <p className="text-xs text-gray-500">{order.user?.phone}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4 text-gray-400" />
                                {formatDate(order.created_at)}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-start gap-2 max-w-xs">
                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-600 line-clamp-1">
                                  {order.delivery_address || t('Самовывоз')}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              {order.department_notes ? (
                                <div className="flex items-start gap-2 max-w-xs">
                                  <Package className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-purple-700 font-medium line-clamp-2">
                                    {order.department_notes}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">—</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm font-medium text-gray-900">
                                {order.order_items?.length || 0} {t('шт')}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-bold text-[#D77E6C]">
                                {(order.total_amount || 0).toLocaleString()} ₸
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${config.bg} ${config.color} border ${config.border}`}
                              >
                                {config.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-12 text-center">
                          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 font-medium">{t('Заказов не найдено')}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ПАГИНАЦИЯ ДЛЯ ЗАВЕРШЕННЫХ */}
        {activeTab === 'completed' && completedPagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-6">
            <button
              onClick={() => {
                const prevPage = Math.max(1, completedPagination.page - 1);
                loadCompletedOrders(prevPage, completedPagination.pageSize);
              }}
              disabled={completedPagination.page === 1 || loadingCompleted}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {t('Страница')} {completedPagination.page} {t('из')} {completedPagination.totalPages}
              </span>
            </div>
            
            <button
              onClick={() => {
                const nextPage = Math.min(completedPagination.totalPages, completedPagination.page + 1);
                loadCompletedOrders(nextPage, completedPagination.pageSize);
              }}
              disabled={completedPagination.page === completedPagination.totalPages || loadingCompleted}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="ml-4 text-sm text-gray-400">
              ({completedPagination.total} {t('всего')})
            </div>
          </div>
        )}

        {/* 🆕 МОДАЛКА ОТЧЕТА */}
        <ReportModal 
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          t={t}
        />
      </div>
    </div>
  );
};

export default WarehouseOrdersPage;