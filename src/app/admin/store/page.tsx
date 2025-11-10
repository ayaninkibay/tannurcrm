'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  Settings,
  FileEdit,
  Gift,
  Trash2,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { useTranslate } from '@/hooks/useTranslate';
import { useOrderModule } from '@/lib/admin_orders/useOrderModule';
import { useUser } from '@/context/UserContext';
import { hasPermission } from '@/lib/permissions/permissions';

type TabType = 'new' | 'processing' | 'transferred_to_warehouse' | 'completed';
type SortField = 'date' | 'amount' | 'items' | 'customer' | 'status';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

// Ключи для localStorage
const STORAGE_KEYS = {
  SORT_CONFIG: 'orders_sort_config',
  ACTIVE_TAB: 'orders_active_tab'
};

// ✅ ВЫНЕСЛИ КОМПОНЕНТ ИКОНКИ НАРУЖУ
const SortIcon = React.memo(({ field, sortConfig }: { field: SortField; sortConfig: SortConfig }) => {
  if (sortConfig.field !== field) {
    return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
  }
  return sortConfig.direction === 'asc' 
    ? <ArrowUp className="w-4 h-4 text-[#D77E6C]" />
    : <ArrowDown className="w-4 h-4 text-[#D77E6C]" />;
});

SortIcon.displayName = 'SortIcon';

const OrdersManagementPage = () => {
  const router = useRouter();
  const { t } = useTranslate();
  const { profile } = useUser();

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

  // Загружаем сохраненные настройки
  const loadSavedSettings = () => {
    try {
      const savedSort = localStorage.getItem(STORAGE_KEYS.SORT_CONFIG);
      const savedTab = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
      return {
        sort: savedSort ? JSON.parse(savedSort) : { field: 'date', direction: 'desc' },
        tab: (savedTab as TabType) || 'new'
      };
    } catch {
      return {
        sort: { field: 'date', direction: 'desc' },
        tab: 'new'
      };
    }
  };

  const savedSettings = loadSavedSettings();

  const [activeTab, setActiveTab] = useState<TabType>(savedSettings.tab);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [completedOrdersLoaded, setCompletedOrdersLoaded] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>(savedSettings.sort as SortConfig);
  
  const initialLoadStarted = useRef(false);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const canAccessSettings = hasPermission(profile?.role, profile?.permissions, 'all');

  // 🔥 Дебаунс для поиска (500ms)
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

  // Сохранение настроек
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SORT_CONFIG, JSON.stringify(sortConfig));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  }, [sortConfig, activeTab]);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
    };

    if (showSettingsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettingsMenu]);

  const getStatusConfig = (status: string | null) => {
    const configs: any = {
      'new': {
        label: t('Новый'),
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        dotColor: 'bg-blue-500'
      },
      'confirmed': {
        label: t('Подтвержден'),
        color: 'text-green-700',
        bg: 'bg-green-50',
        border: 'border-green-200',
        dotColor: 'bg-green-500'
      },
      'processing': {
        label: t('В обработке'),
        color: 'text-yellow-700',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        dotColor: 'bg-yellow-500'
      },
      'transferred_to_warehouse': {
        label: t('Передан в склад'),
        color: 'text-purple-700',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        dotColor: 'bg-purple-500'
      },
      'ready_for_pickup': {
        label: t('Готов к получению'),
        color: 'text-indigo-700',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        dotColor: 'bg-indigo-500'
      },
      'shipped': {
        label: t('Отправлен'),
        color: 'text-cyan-700',
        bg: 'bg-cyan-50',
        border: 'border-cyan-200',
        dotColor: 'bg-cyan-500'
      },
      'delivered': {
        label: t('Доставлен'),
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        dotColor: 'bg-emerald-500'
      },
      'cancelled': {
        label: t('Отменен'),
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
        dotColor: 'bg-red-500'
      },
      'returned': {
        label: t('Возврат'),
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        dotColor: 'bg-orange-500'
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
      router.push(`/admin/store/view_order/${order.id}`);
    } catch (e) {
      console.error('Error opening order:', e);
    }
  };

  const handleManualOrder = () => {
    setShowSettingsMenu(false);
    router.push('/admin/store/manual_order');
  };

  const handleGiftSettings = () => {
    setShowSettingsMenu(false);
    router.push('/admin/store/gift-promotions');
  };

  const handleDeleteOrders = () => {
    setShowSettingsMenu(false);
    router.push('/admin/store/store_manage');
  };

  // 🔥 Функция сортировки
  const handleSort = useCallback((field: SortField) => {
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
  }, []);

  const stats = useMemo(() => {
    const newOrders = activeOrders.filter(o => 
      o.order_status === 'new' || o.order_status === 'confirmed'
    );
    
    const processingOrders = activeOrders.filter(o => 
      o.order_status === 'processing'
    );
    
    const warehouseOrders = activeOrders.filter(o => 
      o.order_status === 'transferred_to_warehouse'
    );
    
    const completedCount = completedOrdersLoaded ? completedPagination.total : 0;

    const calculateStats = (orders: any[]) => {
      const total = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const average = orders.length > 0 ? total / orders.length : 0;
      return { total, average };
    };

    const newStats = calculateStats(newOrders);
    const processingStats = calculateStats(processingOrders);
    const warehouseStats = calculateStats(warehouseOrders);
    
    return {
      new: { 
        count: newOrders.length,
        total: newStats.total,
        average: newStats.average
      },
      processing: { 
        count: processingOrders.length,
        total: processingStats.total,
        average: processingStats.average
      },
      transferred_to_warehouse: { 
        count: warehouseOrders.length,
        total: warehouseStats.total,
        average: warehouseStats.average
      },
      completed: { count: completedCount }
    };
  }, [activeOrders, completedOrdersLoaded, completedPagination.total]);

  const getTabOrders = useCallback((tab: TabType) => {
    switch(tab) {
      case 'new':
        return activeOrders.filter(o => 
          o.order_status === 'new' || o.order_status === 'confirmed'
        );
      case 'processing':
        return activeOrders.filter(o => o.order_status === 'processing');
      case 'transferred_to_warehouse':
        return activeOrders.filter(o => o.order_status === 'transferred_to_warehouse');
      case 'completed':
        return completedOrders;
      default:
        return [];
    }
  }, [activeOrders, completedOrders]);

  // 🔥 Мемоизированная фильтрация и сортировка
  const filteredOrders = useMemo(() => {
    let result = getTabOrders(activeTab);

    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase().trim();
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

    result.sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1;

      switch (sortConfig.field) {
        case 'date':
          return direction * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        
        case 'amount':
          return direction * ((a.total_amount || 0) - (b.total_amount || 0));
        
        case 'items':
          const aItems = a.order_items?.length || 0;
          const bItems = b.order_items?.length || 0;
          return direction * (aItems - bItems);
        
        case 'customer':
          const aName = `${a.user?.first_name || ''} ${a.user?.last_name || ''}`.toLowerCase();
          const bName = `${b.user?.first_name || ''} ${b.user?.last_name || ''}`.toLowerCase();
          return direction * aName.localeCompare(bName);
        
        case 'status':
          const aStatus = a.order_status || '';
          const bStatus = b.order_status || '';
          return direction * aStatus.localeCompare(bStatus);
        
        default:
          return 0;
      }
    });

    return result;
  }, [activeOrders, completedOrders, activeTab, debouncedSearch, sortConfig, getTabOrders]);

  const MobileOrderCard = ({ order }: { order: any }) => {
    const config = getStatusConfig(order.order_status);

    return (
      <div 
        className="bg-white rounded-xl border border-gray-200 p-4 mb-3 hover:shadow-lg hover:border-[#D77E6C]/30 transition-all duration-200 cursor-pointer transform hover:scale-[1.01]"
        onClick={() => openOrder(order)}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                #{order.order_number || order.id.slice(-8)}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color} border ${config.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`}></span>
                {config.label}
              </span>
            </div>
            <p className="font-bold text-base text-gray-900">
              {order.user?.first_name} {order.user?.last_name}
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>{order.user?.phone || t('Не указан')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>{formatDate(order.created_at)}</span>
          </div>
          {order.delivery_address && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{order.delivery_address}</span>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {order.order_items?.length || 0} {t('товаров')}
            </span>
          </div>
          <div className="font-bold text-lg text-[#D77E6C]">
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
          <MoreHeaderAD title={t('Управление заказами')} />
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
        <MoreHeaderAD title={t('Управление заказами')} />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between mt-6 md:mx-0">
            <span className="text-red-700">{error}</span>
            <button onClick={clearError} className="text-red-500 hover:text-red-700 text-xl">×</button>
          </div>
        )}

        {/* КНОПКИ ОБНОВЛЕНИЯ И НАСТРОЕК */}
        <div className="mt-6 md:mt-10 mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{t('Статистика заказов')}</h2>
          <div className="flex items-center gap-2">
            {canAccessSettings && (
              <div className="relative" ref={settingsMenuRef}>
                <button
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#D77E6C] text-white rounded-lg hover:bg-[#C66D5C] transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline">{t('Настройки Tannur Store')}</span>
                  <span className="text-sm font-medium sm:hidden">{t('Настройки')}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showSettingsMenu ? 'rotate-180' : ''}`} />
                </button>

                {showSettingsMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={handleManualOrder}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <FileEdit className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{t('Ручной заказ')}</p>
                        <p className="text-xs text-gray-500">{t('Создать заказ вручную')}</p>
                      </div>
                    </button>

                    <button
                      onClick={handleGiftSettings}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Gift className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{t('Настройки подарков')}</p>
                        <p className="text-xs text-gray-500">{t('Управление промо-акциями')}</p>
                      </div>
                    </button>

                    <button
                      onClick={handleDeleteOrders}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100 mt-1"
                    >
                      <div className="p-2 bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{t('Управление заказами')}</p>
                        <p className="text-xs text-gray-500">{t('Удаление и редактирование')}</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <button
              onClick={refreshOrders}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium hidden sm:inline">{t('Обновить')}</span>
            </button>
          </div>
        </div>

        {/* СТАТИСТИКА */}
        <div className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-200">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">{t('Новые')}</span>
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {stats.new.count}
              </div>
              {stats.new.count > 0 && (
                <div className="text-xs text-gray-600">
                  <div>Σ {stats.new.total.toLocaleString()} ₸</div>
                  <div className="text-gray-500">~{Math.round(stats.new.average).toLocaleString()} ₸</div>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-xl p-4 border border-yellow-200 hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-200">
                  <Package className="w-5 h-5 text-yellow-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">{t('В обработке')}</span>
              </div>
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {stats.processing.count}
              </div>
              {stats.processing.count > 0 && (
                <div className="text-xs text-gray-600">
                  <div>Σ {stats.processing.total.toLocaleString()} ₸</div>
                  <div className="text-gray-500">~{Math.round(stats.processing.average).toLocaleString()} ₸</div>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200 hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-200">
                  <Warehouse className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">{t('Передан в склад')}</span>
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {stats.transferred_to_warehouse.count}
              </div>
              {stats.transferred_to_warehouse.count > 0 && (
                <div className="text-xs text-gray-600">
                  <div>Σ {stats.transferred_to_warehouse.total.toLocaleString()} ₸</div>
                  <div className="text-gray-500">~{Math.round(stats.transferred_to_warehouse.average).toLocaleString()} ₸</div>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-200">
                  <PackageCheck className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">{t('Завершенные')}</span>
              </div>
              <div className="text-3xl font-bold text-gray-600">
                {stats.completed.count}
              </div>
            </div>

          </div>
        </div>

        {/* ТАБЫ */}
        <div className="mb-4 md:mb-6">
          <div className="bg-gray-100/80 backdrop-blur-sm rounded-2xl p-1.5 inline-flex w-full sm:w-auto overflow-x-auto shadow-sm">
            <button 
              onClick={() => setActiveTab('new')} 
              className={`flex items-center gap-2 px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all whitespace-nowrap flex-1 sm:flex-initial justify-center sm:justify-start ${
                activeTab === 'new' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-base font-medium">
                <span className="hidden sm:inline">{t('Новые')}</span>
                <span className="inline sm:hidden">({stats.new.count})</span>
                <span className="hidden sm:inline"> ({stats.new.count})</span>
              </span>
            </button>
            
            <button 
              onClick={() => setActiveTab('processing')} 
              className={`flex items-center gap-2 px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all whitespace-nowrap flex-1 sm:flex-initial justify-center sm:justify-start ${
                activeTab === 'processing' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-base font-medium">
                <span className="hidden sm:inline">{t('В обработке')}</span>
                <span className="inline sm:hidden">({stats.processing.count})</span>
                <span className="hidden sm:inline"> ({stats.processing.count})</span>
              </span>
            </button>
            
            <button 
              onClick={() => setActiveTab('transferred_to_warehouse')} 
              className={`flex items-center gap-2 px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all whitespace-nowrap flex-1 sm:flex-initial justify-center sm:justify-start ${
                activeTab === 'transferred_to_warehouse' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Warehouse className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-base font-medium">
                <span className="hidden sm:inline">{t('Передан в склад')}</span>
                <span className="inline sm:hidden">({stats.transferred_to_warehouse.count})</span>
                <span className="hidden sm:inline"> ({stats.transferred_to_warehouse.count})</span>
              </span>
            </button>
            
            <button 
              onClick={() => setActiveTab('completed')} 
              className={`flex items-center gap-2 px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all whitespace-nowrap flex-1 sm:flex-initial justify-center sm:justify-start ${
                activeTab === 'completed' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <PackageCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-base font-medium">
                <span className="hidden sm:inline">{t('Завершенные')}</span>
                {completedOrdersLoaded ? (
                  <>
                    <span className="inline sm:hidden">({stats.completed.count})</span>
                    <span className="hidden sm:inline"> ({stats.completed.count})</span>
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
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D77E6C]/50 focus:border-[#D77E6C] transition-all text-sm shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
            {searchQuery !== debouncedSearch && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 text-[#D77E6C] animate-spin" />
              </div>
            )}
          </div>
        </div>

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
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                        {t('Номер')}
                      </th>
                      <th 
                        className="text-left py-4 px-4 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100/80 transition-colors select-none group"
                        onClick={() => handleSort('customer')}
                      >
                        <div className="flex items-center gap-2">
                          {t('Клиент')}
                          <SortIcon field="customer" sortConfig={sortConfig} />
                        </div>
                      </th>
                      <th 
                        className="text-left py-4 px-4 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100/80 transition-colors select-none group"
                        onClick={() => handleSort('date')}
                      >
                        <div className="flex items-center gap-2">
                          {t('Дата')}
                          <SortIcon field="date" sortConfig={sortConfig} />
                        </div>
                      </th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">
                        {t('Адрес')}
                      </th>
                      <th 
                        className="text-left py-4 px-4 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100/80 transition-colors select-none group"
                        onClick={() => handleSort('items')}
                      >
                        <div className="flex items-center gap-2">
                          {t('Товары')}
                          <SortIcon field="items" sortConfig={sortConfig} />
                        </div>
                      </th>
                      <th 
                        className="text-left py-4 px-4 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100/80 transition-colors select-none group"
                        onClick={() => handleSort('amount')}
                      >
                        <div className="flex items-center gap-2">
                          {t('Сумма')}
                          <SortIcon field="amount" sortConfig={sortConfig} />
                        </div>
                      </th>
                      <th 
                        className="text-left py-4 px-4 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100/80 transition-colors select-none group"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-2">
                          {t('Статус')}
                          <SortIcon field="status" sortConfig={sortConfig} />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order, index) => {
                        const config = getStatusConfig(order.order_status);
                        
                        return (
                          <tr
                            key={order.id}
                            className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-all duration-150 cursor-pointer group ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                            }`}
                            onClick={() => openOrder(order)}
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <Hash className="w-4 h-4 text-gray-400 group-hover:text-[#D77E6C] transition-colors" />
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
                                  {order.delivery_address || t('Не указан')}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-1.5">
                                <Package className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-900">
                                  {order.order_items?.length || 0}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-bold text-[#D77E6C]">
                                {(order.total_amount || 0).toLocaleString()} ₸
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${config.bg} ${config.color} border ${config.border}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`}></span>
                                {config.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-12 text-center">
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

        {/* ПАГИНАЦИЯ */}
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
      </div>
    </div>
  );
};

export default OrdersManagementPage;