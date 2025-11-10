// src/app/dealer/shop/orders/page.tsx
// ФИНАЛЬНАЯ ВЕРСИЯ: новая система статусов

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,
  Truck,
  Calendar,
  Search,
  Eye,
  Loader2,
  ShoppingBag,
  TrendingUp,
  Filter,
  X,
  MapPin,
  Box,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import { useUser } from '@/context/UserContext';
import { orderService, type OrderWithItems } from '@/lib/order/OrderService';

export default function OrdersPage() {
  const router = useRouter();
  const { profile: currentUser, loading: userLoading } = useUser();
  
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>(''); // Пустой - будет автоопределение
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<OrderWithItems | null>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    activeOrders: 0,
    completedOrders: 0
  });

  const loadOrders = useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      console.log('📦 Loading orders...');

      const result = await orderService.getUserOrders(currentUser.id);

      if (!result.success) {
        toast.error(result.error || 'Ошибка загрузки заказов');
        return;
      }

      setOrders(result.data || []);
      console.log('✅ Orders loaded:', result.data?.length);

      // Умное определение фильтра по умолчанию
      if (result.data && result.data.length > 0) {
        const hasNew = result.data.some(o => o.order_status === 'new');
        const hasProcessing = result.data.some(o => o.order_status === 'processing');
        const hasReady = result.data.some(o => o.order_status === 'ready_for_pickup');
        const hasDelivered = result.data.some(o => o.order_status === 'delivered');

        if (hasNew) {
          setFilterStatus('new');
        } else if (hasProcessing) {
          setFilterStatus('processing');
        } else if (hasReady) {
          setFilterStatus('ready_for_pickup');
        } else if (hasDelivered) {
          setFilterStatus('delivered');
        } else {
          setFilterStatus('new'); // Если только отмененные - покажем "новые" с пустым списком
        }
      }

    } catch (error: any) {
      console.error('❌ Error loading orders:', error);
      toast.error('Ошибка загрузки заказов');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const loadStats = useCallback(async () => {
    if (!currentUser) return;

    try {
      const result = await orderService.getUserOrdersStats(currentUser.id);

      if (result.success && result.data) {
        setStats({
          totalOrders: result.data.totalOrders,
          totalSpent: result.data.totalSpent,
          activeOrders: result.data.activeOrders,
          completedOrders: result.data.completedOrders
        });
      }
    } catch (error) {
      console.error('❌ Error loading stats:', error);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!userLoading && !currentUser) {
      router.push('/signin');
    }
  }, [userLoading, currentUser, router]);

  useEffect(() => {
    if (currentUser) {
      loadOrders();
      loadStats();
    }
  }, [currentUser, loadOrders, loadStats]);

  const handleCancelOrder = async (orderId: string) => {
    if (!currentUser) return;
    
    try {
      console.log('❌ Cancelling order:', orderId);
      
      const result = await orderService.cancelOrder(orderId, currentUser.id);
      
      if (!result.success) {
        toast.error(result.error || 'Ошибка отмены заказа');
        return;
      }
      
      toast.success(result.message || 'Заказ отменен');
      
      await loadOrders();
      await loadStats();
      
      if (showDetails) {
        setShowDetails(false);
      }
      
      setShowCancelModal(false);
      setOrderToCancel(null);
      
    } catch (error: any) {
      console.error('❌ Error cancelling order:', error);
      toast.error(error.message || 'Ошибка отмены заказа');
    }
  };

  const openCancelModal = (order: OrderWithItems) => {
    setOrderToCancel(order);
    setShowCancelModal(true);
  };

  const handleViewOrder = async (order: OrderWithItems) => {
    if (!currentUser) return;
    
    try {
      const result = await orderService.getOrderById(order.id, currentUser.id);
      
      if (result.success && result.data) {
        setSelectedOrder(result.data);
        setShowDetails(true);
      } else {
        toast.error(result.error || 'Не удалось загрузить детали заказа');
      }
    } catch (error: any) {
      console.error('❌ Error loading order details:', error);
      toast.error('Ошибка загрузки деталей заказа');
    }
  };

  const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} ₸`;
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getStatusConfig = (status: string) => {
    const configs: any = {
      'new': { 
        label: 'Новый', 
        color: 'bg-blue-50 text-blue-700 border-blue-200', 
        icon: Clock,
        gradient: 'from-blue-500 to-blue-600'
      },
      'confirmed': { 
        label: 'Подтвержден', 
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200', 
        icon: CheckCircle,
        gradient: 'from-indigo-500 to-indigo-600'
      },
      'processing': { 
        label: 'В обработке', 
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200', 
        icon: Package,
        gradient: 'from-yellow-500 to-yellow-600'
      },
      'ready_for_pickup': { 
        label: 'Готов к получению', 
        color: 'bg-green-50 text-green-700 border-green-200', 
        icon: CheckCircle,
        gradient: 'from-green-500 to-green-600'
      },
      'shipped': { 
        label: 'Отправлен', 
        color: 'bg-purple-50 text-purple-700 border-purple-200', 
        icon: Truck,
        gradient: 'from-purple-500 to-purple-600'
      },
      'delivered': { 
        label: 'Завершен', 
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
        icon: CheckCircle,
        gradient: 'from-emerald-500 to-emerald-600'
      },
      'cancelled': { 
        label: 'Отменен', 
        color: 'bg-red-50 text-red-700 border-red-200', 
        icon: XCircle,
        gradient: 'from-red-500 to-red-600'
      },
      'refund_pending': { 
        label: 'Возврат средств', 
        color: 'bg-orange-50 text-orange-700 border-orange-200', 
        icon: AlertCircle,
        gradient: 'from-orange-500 to-orange-600'
      }
    };
    
    return configs[status] || configs['new'];
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config = getStatusConfig(status);
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  // ФИЛЬТРАЦИЯ (только по order_status, без 'all')
  const filteredOrders = orders.filter(order => {
    // Фильтр по статусу заказа (без опции 'all')
    if (filterStatus && order.order_status !== filterStatus) {
      return false;
    }
    
    // Поиск
    if (searchQuery && !order.order_number.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#D77E6C] animate-spin" />
          <p className="text-gray-500 font-medium">Загружаем заказы...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  if (orders.length === 0 && !loading) {
    return (
      <div className="min-h-screen p-2 md:p-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <MoreHeaderDE title="Мои заказы" showBackButton={true} />
        
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 max-w-md w-full">
            <div className="relative mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-[#D77E6C]/10 to-[#E09080]/10 rounded-full mx-auto flex items-center justify-center">
                <ShoppingBag className="w-16 h-16 text-[#D77E6C]" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              У вас еще нет заказов
            </h2>
            <p className="text-gray-500 mb-8 text-center">
              Самое время сделать первый заказ!
            </p>
            
            <button 
              onClick={() => router.push('/dealer/shop')}
              className="w-full py-3 bg-gradient-to-r from-[#D77E6C] to-[#E09080] text-white rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
            >
              Перейти в магазин
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 md:p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <MoreHeaderDE title="Мои заказы" showBackButton={true} />
      
      <div className="mt-4 space-y-6">
        
        {/* СТАТИСТИКА */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Package className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
            </div>
            <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
            <div className="text-xs md:text-sm text-gray-500 mt-1">Всего заказов</div>
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-gradient-to-br from-[#D77E6C] to-[#E09080] rounded-xl">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
            </div>
            <div className="text-lg md:text-2xl font-bold text-[#D77E6C]">
              {formatPrice(stats.totalSpent)}
            </div>
            <div className="text-xs md:text-sm text-gray-500 mt-1">Потрачено</div>
          </div>
        </div>

        {/* КНОПКА СВЯЗИ С МЕНЕДЖЕРОМ */}
        <a
          href="https://wa.me/77478828987"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-green-200 shadow-sm hover:shadow-lg hover:border-green-300 transition-all group relative overflow-hidden"
        >
          {/* Декоративный фон */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 to-emerald-400/5 group-hover:from-green-400/10 group-hover:to-emerald-400/10 transition-all" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="font-bold text-lg text-gray-900 mb-0.5">Связаться с менеджером</p>
                <p className="text-sm text-gray-600">Поможем с любым вопросом по заказу</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-green-200 shadow-sm">
              <span className="text-green-700 font-semibold text-sm">Открыть WhatsApp</span>
              <svg className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </a>

        {/* ПОИСК И ФИЛЬТРЫ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="space-y-4">
            
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск по номеру заказа..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D77E6C] focus:border-transparent transition-all"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            {/* Фильтры - БЕЗ "Все заказы" */}
            <div className={`${showFilters ? 'flex' : 'hidden'} lg:flex flex-wrap gap-2`}>
              <button
                onClick={() => setFilterStatus('new')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  filterStatus === 'new' 
                    ? 'bg-gradient-to-r from-[#D77E6C] to-[#E09080] text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Новые
              </button>
              <button
                onClick={() => setFilterStatus('processing')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  filterStatus === 'processing' 
                    ? 'bg-gradient-to-r from-[#D77E6C] to-[#E09080] text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                В обработке
              </button>
              <button
                onClick={() => setFilterStatus('ready_for_pickup')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  filterStatus === 'ready_for_pickup' 
                    ? 'bg-gradient-to-r from-[#D77E6C] to-[#E09080] text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Готовы к получению
              </button>
              <button
                onClick={() => setFilterStatus('delivered')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  filterStatus === 'delivered' 
                    ? 'bg-gradient-to-r from-[#D77E6C] to-[#E09080] text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Завершенные
              </button>
              <button
                onClick={() => setFilterStatus('cancelled')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  filterStatus === 'cancelled' 
                    ? 'bg-gradient-to-r from-[#D77E6C] to-[#E09080] text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Отмененные
              </button>
            </div>
          </div>
        </div>

        {/* СПИСОК ЗАКАЗОВ */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <Box className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Заказов не найдено</h3>
            <p className="text-gray-500 mb-6">Попробуйте изменить фильтры или поиск</p>
            <button
              onClick={() => {
                setFilterStatus('new');
                setSearchQuery('');
              }}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => {
              const config = getStatusConfig(order.order_status);
              
              return (
                <div 
                  key={order.id} 
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
                >
                  <div className={`h-1.5 bg-gradient-to-r ${config.gradient}`} />
                  
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg md:text-xl font-bold text-gray-900">
                            {order.order_number}
                          </h3>
                          <StatusBadge status={order.order_status} />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {formatShortDate(order.created_at)}
                          </span>
                          {order.paid_at && (
                            <span className="flex items-center gap-1.5 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              Оплачен {formatShortDate(order.paid_at)}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate max-w-[200px]">{order.delivery_address}</span>
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-left md:text-right">
                        <p className="text-sm text-gray-500 mb-1">Сумма заказа</p>
                        <p className="text-2xl font-bold text-[#D77E6C]">
                          {formatPrice(order.total_amount)}
                        </p>
                      </div>
                    </div>

                    {order.order_items && order.order_items.length > 0 && (
                      <div className="border-t border-gray-100 pt-4 mb-4">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                          {order.order_items.slice(0, 5).map((item, idx) => (
                            <div key={idx} className="flex-shrink-0 relative group w-14 h-14 md:w-16 md:h-16">
                              <Image
                                src={item.product?.image_url || '/placeholder.png'}
                                alt={item.product?.name || 'Product'}
                                fill
                                className="object-cover rounded-xl border-2 border-gray-100 group-hover:border-[#D77E6C] transition-all"
                              />
                              {item.quantity > 1 && (
                                <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#D77E6C] text-white text-xs font-bold rounded-full flex items-center justify-center">
                                  {item.quantity}
                                </span>
                              )}
                            </div>
                          ))}
                          {order.order_items.length > 5 && (
                            <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-gray-200">
                              <span className="text-sm font-bold text-gray-600">
                                +{order.order_items.length - 5}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ДЕЙСТВИЯ */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-100 transition-all font-medium flex items-center justify-center gap-2 border border-gray-200"
                      >
                        <Eye className="w-4 h-4" />
                        Подробнее
                      </button>
                      
                      {/* Отмена только для new */}
                      {order.order_status === 'new' && (
                        <button
                          onClick={() => openCancelModal(order)}
                          className="px-4 py-2.5 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-all font-medium border border-red-200"
                        >
                          Отменить
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* МОДАЛЬНОЕ ОКНО */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedOrder.order_number}
                  </h2>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={selectedOrder.order_status} />
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Дата создания</p>
                  <p className="font-semibold text-gray-900">{formatDate(selectedOrder.created_at)}</p>
                </div>
                {selectedOrder.paid_at && (
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <p className="text-sm text-green-600 mb-1">Дата оплаты</p>
                    <p className="font-semibold text-gray-900">{formatDate(selectedOrder.paid_at)}</p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Адрес доставки</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.delivery_address}</p>
                </div>
                {selectedOrder.notes && (
                  <div className="md:col-span-2 bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-sm text-blue-600 mb-1">Примечание</p>
                    <p className="font-medium text-gray-900">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#D77E6C]" />
                  Товары в заказе
                </h3>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map(item => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={item.product?.image_url || '/placeholder.png'}
                          alt={item.product?.name || 'Product'}
                          fill
                          className="object-cover rounded-xl border-2 border-gray-200"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {item.product?.name || 'Товар'}
                        </h4>
                        <p className="text-sm text-gray-500">{item.product?.category}</p>
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                          <span className="font-medium">×{item.quantity}</span>
                          <span>•</span>
                          <span>{formatPrice(item.price)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#D77E6C]">
                          {formatPrice(item.total)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#D77E6C]/5 to-[#E09080]/5 rounded-2xl p-6 border-2 border-[#D77E6C]/20">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Итого</span>
                  <span className="text-3xl font-bold text-[#D77E6C]">
                    {formatPrice(selectedOrder.total_amount)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Заказ оплачен
                </p>
              </div>

              {/* Кнопки действий */}
              <div className="flex flex-col gap-3 pt-4 border-t">
                {/* Кнопка отмены (только для new) */}
                {selectedOrder.order_status === 'new' && (
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      openCancelModal(selectedOrder);
                    }}
                    className="w-full px-6 py-3 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors font-semibold border border-red-200"
                  >
                    Отменить заказ
                  </button>
                )}

                {/* Связаться с менеджером */}
                <a
                  href="https://wa.me/77478828987"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-6 py-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors font-semibold border border-green-200 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Связаться с менеджером
                </a>
                <p className="text-sm text-gray-500 text-center">
                  Если нужна помощь с заказом
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКА ОТМЕНЫ ЗАКАЗА */}
      {showCancelModal && orderToCancel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Отмена заказа</h3>
                  <p className="text-sm text-gray-500">{orderToCancel.order_number}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  {orderToCancel.paid_at ? (
                    <>
                      <span className="font-semibold text-orange-600">Заказ был оплачен.</span>
                      <br />
                      После отмены статус изменится на <span className="font-semibold">&ldquo;Возврат средств&rdquo;</span>.
                      <br />
                      Менеджер свяжется с вами для возврата денег.
                    </>
                  ) : (
                    <>
                      Заказ не был оплачен, он будет удален из системы.
                    </>
                  )}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setOrderToCancel(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                >
                  Отменить
                </button>
                <button
                  onClick={() => handleCancelOrder(orderToCancel.id)}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
                >
                  Подтвердить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}