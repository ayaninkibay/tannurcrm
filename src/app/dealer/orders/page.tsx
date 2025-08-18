// src/app/dealer/orders/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,
  CreditCard,
  Truck,
  Calendar,
  ChevronRight,
  Filter,
  Search,
  MoreVertical,
  Eye,
  Download,
  DollarSign
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Компоненты
import MoreHeaderDE from '@/components/header/MoreHeaderDE';

// Контекст и сервисы
import { useUser } from '@/context/UserContext';
import { orderService } from '@/lib/order/OrderService';

// Типы
interface Order {
  id: string;
  order_number: string;
  user_id: string;
  total_amount: number;
  order_status: 'new' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  payment_status: 'pending' | 'paid' | 'cancelled' | 'refunded' | 'processing';
  delivery_address: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  total: number;
  product?: {
    name: string;
    image_url: string;
    category: string;
  };
}

export default function OrdersPage() {
  const router = useRouter();
  const { profile: currentUser, loading: userLoading } = useUser();
  
  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Проверка авторизации
  useEffect(() => {
    if (!userLoading && !currentUser) {
      router.push('/signin');
    }
  }, [userLoading, currentUser, router]);

  // Загрузка заказов
  useEffect(() => {
    if (currentUser) {
      loadOrders();
    }
  }, [currentUser]);

  const loadOrders = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const userOrders = await orderService.getUserOrders(currentUser.id);
      // Приводим тип к правильному формату (на случай если в БД еще есть старые данные)
      const normalizedOrders = userOrders.map(order => ({
        ...order,
        user_id: Array.isArray(order.user_id) ? order.user_id[0] : order.user_id
      })) as Order[];
      setOrders(normalizedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Ошибка загрузки заказов');
    } finally {
      setLoading(false);
    }
  };

  // Оплатить заказ (временная функция)
  const handlePayOrder = async (orderId: string) => {
    try {
      await orderService.updatePaymentStatus(orderId, 'paid');
      await orderService.updateOrderStatus(orderId, 'processing');
      
      toast.success('Заказ успешно оплачен');
      loadOrders(); // Перезагружаем список
    } catch (error) {
      console.error('Error paying order:', error);
      toast.error('Ошибка оплаты заказа');
    }
  };

  // Отменить заказ
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Вы уверены, что хотите отменить заказ?')) return;
    
    try {
      await orderService.updateOrderStatus(orderId, 'cancelled');
      toast.success('Заказ отменен');
      loadOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Ошибка отмены заказа');
    }
  };

  // Открыть детали заказа
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  // Форматирование
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

  // Получить статус
  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      'new': { label: 'Новый', color: 'bg-blue-100 text-blue-700', icon: Clock },
      'confirmed': { label: 'Подтвержден', color: 'bg-indigo-100 text-indigo-700', icon: CheckCircle },
      'processing': { label: 'В обработке', color: 'bg-yellow-100 text-yellow-700', icon: Package },
      'shipped': { label: 'Отправлен', color: 'bg-purple-100 text-purple-700', icon: Truck },
      'delivered': { label: 'Доставлен', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      'cancelled': { label: 'Отменен', color: 'bg-red-100 text-red-700', icon: XCircle },
      'returned': { label: 'Возврат', color: 'bg-gray-100 text-gray-700', icon: XCircle }
    };
    
    const config = statusConfig[status] || statusConfig['new'];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  const getPaymentBadge = (status: string) => {
    const statusConfig: any = {
      'pending': { label: 'Ожидает оплаты', color: 'bg-orange-100 text-orange-700' },
      'paid': { label: 'Оплачен', color: 'bg-green-100 text-green-700' },
      'cancelled': { label: 'Отменен', color: 'bg-gray-100 text-gray-700' },
      'refunded': { label: 'Возврат', color: 'bg-gray-100 text-gray-700' },
      'processing': { label: 'Обработка', color: 'bg-blue-100 text-blue-700' }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Фильтрация заказов
  const filteredOrders = orders.filter(order => {
    if (filterStatus !== 'all' && order.order_status !== filterStatus) return false;
    if (searchQuery && !order.order_number.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Статистика
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.payment_status === 'pending').length,
    processing: orders.filter(o => o.order_status === 'processing').length,
    delivered: orders.filter(o => o.order_status === 'delivered').length,
    totalAmount: orders.reduce((sum, o) => sum + o.total_amount, 0)
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D77E6C] border-t-transparent"></div>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <MoreHeaderDE title="Мои заказы" showBackButton={true} />
      
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Package className="w-5 h-5 text-gray-600" />
              </div>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-[#111]">{stats.total}</div>
            <div className="text-sm text-gray-500">Всего заказов</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <div className="text-sm text-gray-500">Ожидают оплаты</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            <div className="text-sm text-gray-500">Доставлено</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-[#D77E6C]/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-[#D77E6C]" />
              </div>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-[#D77E6C]">{formatPrice(stats.totalAmount)}</div>
            <div className="text-sm text-gray-500">Общая сумма</div>
          </div>
        </div>

        {/* Фильтры и поиск */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск по номеру заказа..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C] focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'all' 
                    ? 'bg-[#D77E6C] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Все
              </button>
              <button
                onClick={() => setFilterStatus('new')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'new' 
                    ? 'bg-[#D77E6C] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Новые
              </button>
              <button
                onClick={() => setFilterStatus('processing')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'processing' 
                    ? 'bg-[#D77E6C] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                В обработке
              </button>
              <button
                onClick={() => setFilterStatus('delivered')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'delivered' 
                    ? 'bg-[#D77E6C] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Доставленные
              </button>
            </div>
          </div>
        </div>

        {/* Список заказов */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Заказов не найдено</h3>
            <p className="text-gray-500 mb-6">У вас пока нет заказов или они не соответствуют фильтрам</p>
            <button
              onClick={() => router.push('/dealer/shop')}
              className="px-6 py-3 bg-[#D77E6C] text-white rounded-xl hover:bg-[#C56D5C] transition-colors font-medium"
            >
              Перейти к покупкам
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[#111]">
                        Заказ {order.order_number}
                      </h3>
                      {getStatusBadge(order.order_status)}
                      {getPaymentBadge(order.payment_status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(order.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Truck className="w-4 h-4" />
                        {order.delivery_address}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Сумма заказа</p>
                      <p className="text-xl font-bold text-[#D77E6C]">{formatPrice(order.total_amount)}</p>
                    </div>
                  </div>
                </div>

                {/* Товары в заказе */}
                {order.order_items && order.order_items.length > 0 && (
                  <div className="border-t pt-4 mb-4">
                    <div className="flex items-center gap-2 overflow-x-auto">
                      {order.order_items.slice(0, 4).map(item => (
                        <div key={item.id} className="flex-shrink-0">
                          <img
                            src={item.product?.image_url || '/placeholder.png'}
                            alt={item.product?.name}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.png';
                            }}
                          />
                        </div>
                      ))}
                      {order.order_items.length > 4 && (
                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            +{order.order_items.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Действия */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleViewOrder(order)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Подробнее
                  </button>
                  
                  {order.payment_status === 'pending' && order.order_status !== 'cancelled' && (
                    <>
                      <button
                        onClick={() => handlePayOrder(order.id)}
                        className="flex-1 px-4 py-2 bg-[#D77E6C] text-white rounded-lg hover:bg-[#C56D5C] transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        Оплатить
                      </button>
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                      >
                        Отменить
                      </button>
                    </>
                  )}
                  
                  {order.order_status === 'delivered' && (
                    <button className="flex-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Скачать чек
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно с деталями заказа */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#111]">
                  Заказ {selectedOrder.order_number}
                </h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Информация о заказе */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Статус заказа</p>
                    {getStatusBadge(selectedOrder.order_status)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Статус оплаты</p>
                    {getPaymentBadge(selectedOrder.payment_status)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Дата создания</p>
                    <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Адрес доставки</p>
                    <p className="font-medium">{selectedOrder.delivery_address}</p>
                  </div>
                  {selectedOrder.notes && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 mb-1">Примечание</p>
                      <p className="font-medium">{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>

                {/* Товары */}
                <div>
                  <h3 className="text-lg font-semibold text-[#111] mb-4">Товары в заказе</h3>
                  <div className="space-y-3">
                    {selectedOrder.order_items?.map(item => (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={item.product?.image_url || '/placeholder.png'}
                          alt={item.product?.name}
                          className="w-20 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.png';
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-[#111]">{item.product?.name || 'Товар'}</h4>
                          <p className="text-sm text-gray-500">{item.product?.category}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm">Количество: {item.quantity}</span>
                            <span className="text-sm">×</span>
                            <span className="text-sm">{formatPrice(item.price)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#D77E6C]">{formatPrice(item.total)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Итого */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-[#111]">Итого к оплате</span>
                    <span className="text-2xl font-bold text-[#D77E6C]">
                      {formatPrice(selectedOrder.total_amount)}
                    </span>
                  </div>
                </div>

                {/* Действия */}
                {selectedOrder.payment_status === 'pending' && selectedOrder.order_status !== 'cancelled' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        handlePayOrder(selectedOrder.id);
                        setShowDetails(false);
                      }}
                      className="flex-1 px-6 py-3 bg-[#D77E6C] text-white rounded-xl hover:bg-[#C56D5C] transition-colors font-medium"
                    >
                      Оплатить заказ
                    </button>
                    <button
                      onClick={() => {
                        handleCancelOrder(selectedOrder.id);
                        setShowDetails(false);
                      }}
                      className="px-6 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium"
                    >
                      Отменить заказ
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}