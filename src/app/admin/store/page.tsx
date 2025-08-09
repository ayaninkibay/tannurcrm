'use client';

import React, { useState } from 'react';
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
  MoreVertical,
  Eye
} from 'lucide-react';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';

// Типы для заказов
type OrderStatus = 'pending' | 'accepted' | 'collecting' | 'delivery' | 'delivered' | 'rejected';
type OrderType = 'shop' | 'dealers' | 'star';
type DateFilter = 'week' | 'month' | 'custom';

interface Order {
  id: string;
  clientId: string;
  name: string;
  phone: string;
  date: string;
  products: string[];
  address?: string;
  status: OrderStatus;
  amount: number;
  type: OrderType;
}

// Примеры данных
const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    clientId: 'TN82732',
    name: 'Айгерим Нурланова',
    phone: '+7 777 123 45 67',
    date: '2025-01-20 14:30',
    products: ['Товар 1', 'Товар 2'],
    address: 'ул. Абая 150, кв. 45',
    status: 'pending',
    amount: 45000,
    type: 'shop'
  },
  {
    id: 'ORD-002',
    clientId: 'TN82733',
    name: 'Ерлан Сериков',
    phone: '+7 708 987 65 43',
    date: '2025-01-20 15:45',
    products: ['Товар 3'],
    address: 'пр. Достык 89',
    status: 'delivery',
    amount: 25000,
    type: 'shop'
  },
  {
    id: 'DLR-001',
    clientId: 'TN82734',
    name: 'Мадина Касымова',
    phone: '+7 701 555 44 33',
    date: '2025-01-20 10:15',
    products: ['Товар A', 'Товар B', 'Товар C'],
    status: 'accepted',
    amount: 120000,
    type: 'dealers'
  },
  {
    id: 'STR-001',
    clientId: 'TN82735',
    name: 'Данияр Жумабек',
    phone: '+7 775 222 11 00',
    date: '2025-01-20 16:20',
    products: ['Премиум товар 1'],
    address: 'мкр. Самал-2, д. 15',
    status: 'collecting',
    amount: 85000,
    type: 'star'
  },
  {
    id: 'ORD-003',
    clientId: 'TN82736',
    name: 'Алия Сатыбалды',
    phone: '+7 747 888 99 00',
    date: '2025-01-15 11:20',
    products: ['Товар 4', 'Товар 5'],
    address: 'ул. Жандосова 58',
    status: 'delivered',
    amount: 67000,
    type: 'shop'
  }
];

// Компонент статистической карточки
const StatCard = ({ 
  icon: Icon, 
  title, 
  count, 
  amount, 
  subtitle, 
  iconColor,
  iconBg 
}: {
  icon: React.ElementType;
  title: string;
  count: number;
  amount?: number;
  subtitle: string;
  iconColor: string;
  iconBg: string;
}) => (
  <div className="bg-white rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-100 relative overflow-hidden">
    <div className="flex items-start justify-between">
      <div className={`flex items-center gap-2 md:gap-3 mb-3 md:mb-4 ${iconColor}`}>
        <Icon className="w-4 h-4 md:w-5 md:h-5" />
        <span className="text-xs sm:text-sm font-medium text-gray-700">{title}</span>
      </div>
      <div className="absolute top-3 right-3 md:top-4 md:right-4">
        <div className={`w-1.5 h-1.5 md:w-2 md:h-2 ${iconBg} rounded-full`}></div>
      </div>
    </div>
    
    <div className="flex items-end justify-between">
      <div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
          {count}
          <span className="text-xs sm:text-sm font-normal text-gray-600 ml-2">
            {count === 1 ? 'заказ' : 'заказов'}
          </span>
        </div>
        {amount !== undefined && amount > 0 && (
          <div className="text-base sm:text-lg font-semibold text-gray-900">
            {amount.toLocaleString()} ₸
          </div>
        )}
        <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
      </div>
      
      {/* Декоративная сетка */}
      <div className="hidden sm:grid grid-cols-3 md:grid-cols-4 gap-1 opacity-10">
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`w-1.5 h-1.5 md:w-2 md:h-2 ${iconBg} rounded-sm`}></div>
        ))}
      </div>
    </div>
  </div>
);

// Мобильная карточка заказа
const MobileOrderCard = ({ 
  order, 
  onStatusChange,
  type 
}: { 
  order: Order;
  onStatusChange: (orderId: string, newStatus: OrderStatus, action: string) => void;
  type: 'active' | 'completed';
}) => {
  const [showActions, setShowActions] = useState(false);
  
  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-blue-100 text-blue-700',
      collecting: 'bg-purple-100 text-purple-700',
      delivery: 'bg-orange-100 text-orange-700',
      delivered: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return colors[status];
  };

  const getStatusText = (status: OrderStatus) => {
    const texts = {
      pending: 'Ожидает',
      accepted: 'Принят',
      collecting: 'Сборка',
      delivery: 'Доставка',
      delivered: 'Доставлен',
      rejected: 'Отклонен'
    };
    return texts[status];
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-gray-500">#{order.id}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>
          <p className="font-medium text-sm">{order.name}</p>
          <p className="text-xs text-gray-500">{order.clientId}</p>
        </div>
        {type === 'active' && (
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1.5 hover:bg-gray-100 rounded-lg"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <Phone className="w-3 h-3 text-gray-400" />
          <span>{order.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-gray-400" />
          <span>{order.date}</span>
        </div>
        {order.address && (
          <div className="flex items-start gap-2">
            <MapPin className="w-3 h-3 text-gray-400 mt-0.5" />
            <span>{order.address}</span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
        <div className="text-xs text-gray-600">
          {order.products.length} товаров
        </div>
        <div className="font-semibold text-sm">
          {order.amount.toLocaleString()} ₸
        </div>
      </div>

      {showActions && type === 'active' && (
        <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-2">
          <button
            onClick={() => onStatusChange(order.id, 'accepted', 'принять')}
            className="flex flex-col items-center gap-1 p-2 hover:bg-blue-50 rounded-lg text-xs"
          >
            <Check className="w-4 h-4 text-blue-600" />
            <span>Принять</span>
          </button>
          <button
            onClick={() => onStatusChange(order.id, 'delivery', 'доставить')}
            className="flex flex-col items-center gap-1 p-2 hover:bg-orange-50 rounded-lg text-xs"
          >
            <Truck className="w-4 h-4 text-orange-600" />
            <span>Доставка</span>
          </button>
          <button
            onClick={() => onStatusChange(order.id, 'rejected', 'отклонить')}
            className="flex flex-col items-center gap-1 p-2 hover:bg-red-50 rounded-lg text-xs"
          >
            <XCircle className="w-4 h-4 text-red-600" />
            <span>Отклонить</span>
          </button>
        </div>
      )}
    </div>
  );
};

const OrdersManagementPage = () => {
  const [activeTab, setActiveTab] = useState<OrderType>('shop');
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [dateFilter, setDateFilter] = useState<DateFilter>('week');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    orderId: string;
    newStatus: OrderStatus;
    action: string;
  }>({
    isOpen: false,
    orderId: '',
    newStatus: 'pending',
    action: ''
  });

  // Статистика
  const todayOrders = orders.filter(o => o.date.includes('2025-01-20'));
  const todayTotal = todayOrders.reduce((sum, order) => sum + order.amount, 0);
  const deliveryOrders = orders.filter(o => o.status === 'delivery');
  const deliveryTotal = deliveryOrders.reduce((sum, order) => sum + order.amount, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const pendingTotal = pendingOrders.reduce((sum, order) => sum + order.amount, 0);

  // Фильтрация заказов
  const activeOrders = orders.filter(o => 
    o.type === activeTab && 
    !['delivered', 'rejected'].includes(o.status)
  );
  const completedOrders = orders.filter(o => 
    o.type === activeTab && 
    ['delivered', 'rejected'].includes(o.status)
  );

  // Обновление статуса
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    setConfirmModal({ isOpen: false, orderId: '', newStatus: 'pending', action: '' });
  };

  const openConfirmModal = (orderId: string, newStatus: OrderStatus, action: string) => {
    setConfirmModal({
      isOpen: true,
      orderId,
      newStatus,
      action
    });
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-blue-100 text-blue-700',
      collecting: 'bg-purple-100 text-purple-700',
      delivery: 'bg-orange-100 text-orange-700',
      delivered: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return colors[status];
  };

  const getStatusText = (status: OrderStatus) => {
    const texts = {
      pending: 'Ожидает',
      accepted: 'Принят',
      collecting: 'Сборка',
      delivery: 'Доставка',
      delivered: 'Доставлен',
      rejected: 'Отклонен'
    };
    return texts[status];
  };

  // Кнопки действий для десктопа
  const ActionButtons = ({ order }: { order: Order }) => {
    const buttons = [
      { 
        icon: Check, 
        status: 'accepted' as OrderStatus, 
        tooltip: 'Принять заказ',
        action: 'принять',
        color: 'hover:bg-blue-50 hover:text-blue-600'
      },
      { 
        icon: Package, 
        status: 'collecting' as OrderStatus, 
        tooltip: 'Собрать заказ',
        action: 'начать сборку',
        color: 'hover:bg-purple-50 hover:text-purple-600'
      },
      { 
        icon: Truck, 
        status: 'delivery' as OrderStatus, 
        tooltip: 'Отправить на доставку',
        action: 'отправить на доставку',
        color: 'hover:bg-orange-50 hover:text-orange-600'
      },
      { 
        icon: CheckCircle, 
        status: 'delivered' as OrderStatus, 
        tooltip: 'Отметить доставленным',
        action: 'отметить доставленным',
        color: 'hover:bg-green-50 hover:text-green-600'
      },
      { 
        icon: XCircle, 
        status: 'rejected' as OrderStatus, 
        tooltip: 'Отклонить заказ',
        action: 'отклонить',
        color: 'hover:bg-red-50 hover:text-red-600'
      }
    ];

    return (
      <div className="flex gap-1">
        {buttons.map(({ icon: Icon, status, tooltip, action, color }) => (
          <div key={status} className="relative group">
            <button
              onClick={() => openConfirmModal(order.id, status, action)}
              className={`p-2 rounded-lg transition-all ${color} ${
                order.status === status ? 'bg-gray-100' : ''
              }`}
              disabled={order.status === status}
            >
              <Icon className="w-4 h-4" />
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              {tooltip}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex p-2 md:p-4 lg:p-6">
      <div className="grid w-full h-full">
        {/* Заголовок */}
        <MoreHeaderAD title="Управление заказами" />

        {/* Статистические карточки */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mt-6 md:mt-10 mb-4 md:mb-6">
          <StatCard
            icon={Calendar}
            title="Заказы за сегодня"
            count={todayOrders.length}
            amount={todayTotal}
            subtitle="Заказы за сегодня"
            iconColor="text-[#D77E6C]"
            iconBg="bg-[#D77E6C]"
          />
          <StatCard
            icon={Truck}
            title="На доставке"
            count={deliveryOrders.length}
            amount={deliveryTotal}
            subtitle="В пути к клиентам"
            iconColor="text-[#D77E6C]"
            iconBg="bg-[#D77E6C]"
          />
          <StatCard
            icon={AlertTriangle}
            title="Требуют внимания"
            count={pendingOrders.length}
            amount={pendingTotal}
            subtitle="Ожидают обработки"
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
                activeTab === 'shop' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-base font-medium">Магазин</span>
            </button>
            <button
              onClick={() => setActiveTab('dealers')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'dealers' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-base font-medium">Дилеры</span>
            </button>
            <button
              onClick={() => setActiveTab('star')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'star' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Star className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-base font-medium">Звезды</span>
            </button>
          </div>
        </div>

        {/* Активные заказы - Мобильная версия */}
        <div className="md:hidden">
          <div className="mb-4">
            <h2 className="text-base font-medium mb-3">Активные заказы ({activeOrders.length})</h2>
            {activeOrders.map((order) => (
              <MobileOrderCard 
                key={order.id} 
                order={order} 
                onStatusChange={openConfirmModal}
                type="active"
              />
            ))}
            {activeOrders.length === 0 && (
              <div className="text-center text-gray-500 py-8 bg-white rounded-xl">
                Нет активных заказов
              </div>
            )}
          </div>
        </div>

        {/* Активные заказы - Десктоп версия */}
        <div className="hidden md:block bg-white rounded-2xl border border-gray-100 mb-6">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-medium">Активные заказы</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Клиент</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Телефон</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Товары</th>
                  {activeTab !== 'dealers' && (
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Адрес</th>
                  )}
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Сумма</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Статус</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Действия</th>
                </tr>
              </thead>
              <tbody>
                {activeOrders.length > 0 ? (
                  activeOrders.map((order) => (
                    <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <span className="font-mono text-sm">{order.id}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{order.name}</p>
                          <p className="text-xs text-gray-500">{order.clientId}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{order.phone}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          {order.products.slice(0, 2).join(', ')}
                          {order.products.length > 2 && (
                            <span className="text-gray-500"> +{order.products.length - 2}</span>
                          )}
                        </div>
                      </td>
                      {activeTab !== 'dealers' && (
                        <td className="py-4 px-4">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                            <span className="text-sm">{order.address}</span>
                          </div>
                        </td>
                      )}
                      <td className="py-4 px-4">
                        <span className="font-semibold">{order.amount.toLocaleString()} ₸</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <ActionButtons order={order} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={activeTab === 'dealers' ? 7 : 8} className="py-8 text-center text-gray-500">
                      Нет активных заказов
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Завершенные заказы - Мобильная версия */}
        <div className="md:hidden">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-medium">Завершенные заказы</h2>
            <div className="relative">
              <button
                onClick={() => setShowDateDropdown(!showDateDropdown)}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors"
              >
                <CalendarDays className="w-3 h-3" />
                <span>
                  {dateFilter === 'week' && 'Неделя'}
                  {dateFilter === 'month' && 'Месяц'}
                  {dateFilter === 'custom' && 'Период'}
                </span>
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {showDateDropdown && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 min-w-[120px]">
                  <button
                    onClick={() => {
                      setDateFilter('week');
                      setShowDateDropdown(false);
                    }}
                    className="w-full px-3 py-1.5 text-left hover:bg-gray-100 text-xs"
                  >
                    Неделя
                  </button>
                  <button
                    onClick={() => {
                      setDateFilter('month');
                      setShowDateDropdown(false);
                    }}
                    className="w-full px-3 py-1.5 text-left hover:bg-gray-100 text-xs"
                  >
                    Месяц
                  </button>
                  <button
                    onClick={() => {
                      setDateFilter('custom');
                      setShowDateDropdown(false);
                    }}
                    className="w-full px-3 py-1.5 text-left hover:bg-gray-100 text-xs"
                  >
                    Выбрать период
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {completedOrders.map((order) => (
            <MobileOrderCard 
              key={order.id} 
              order={order} 
              onStatusChange={openConfirmModal}
              type="completed"
            />
          ))}
          {completedOrders.length === 0 && (
            <div className="text-center text-gray-500 py-8 bg-white rounded-xl">
              Нет завершенных заказов за выбранный период
            </div>
          )}
        </div>

        {/* Завершенные заказы - Десктоп версия */}
        <div className="hidden md:block bg-white rounded-2xl border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-medium">Завершенные заказы</h2>
            
            <div className="relative">
              <button
                onClick={() => setShowDateDropdown(!showDateDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                <CalendarDays className="w-4 h-4" />
                <span>
                  {dateFilter === 'week' && 'Неделя'}
                  {dateFilter === 'month' && 'Месяц'}
                  {dateFilter === 'custom' && 'Выбрать период'}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showDateDropdown && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 min-w-[160px]">
                  <button
                    onClick={() => {
                      setDateFilter('week');
                      setShowDateDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                  >
                    Неделя
                  </button>
                  <button
                    onClick={() => {
                      setDateFilter('month');
                      setShowDateDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                  >
                    Месяц
                  </button>
                  <button
                    onClick={() => {
                      setDateFilter('custom');
                      setShowDateDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                  >
                    Выбрать период
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">ID клиента</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Имя Фамилия</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Дата</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Телефон</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Товар</th>
                  {activeTab !== 'dealers' && (
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Адрес</th>
                  )}
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Статус</th>
                </tr>
              </thead>
              <tbody>
                {completedOrders.length > 0 ? (
                  completedOrders.map((order) => (
                    <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm">{order.clientId}</span>
                      </td>
                      <td className="py-4 px-4 font-medium">{order.name}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{order.date}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm">{order.phone}</td>
                      <td className="py-4 px-4 text-sm">{order.products.join(', ')}</td>
                      {activeTab !== 'dealers' && (
                        <td className="py-4 px-4 text-sm">{order.address}</td>
                      )}
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={activeTab === 'dealers' ? 6 : 7} className="py-8 text-center text-gray-500">
                      Нет завершенных заказов за выбранный период
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Модальное окно подтверждения */}
        {confirmModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
              <div className="flex items-center justify-center w-12 h-12 bg-[#D77E6C]/10 rounded-full mb-4 mx-auto">
                <AlertTriangle className="w-6 h-6 text-[#D77E6C]" />
              </div>
              
              <h3 className="text-lg font-semibold text-center mb-2">
                Подтверждение действия
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                Вы действительно хотите <strong>{confirmModal.action}</strong> заказ{' '}
                <span className="font-mono text-sm">#{confirmModal.orderId}</span>?
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal({ isOpen: false, orderId: '', newStatus: 'pending', action: '' })}
                  className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={() => updateOrderStatus(confirmModal.orderId, confirmModal.newStatus)}
                  className="flex-1 py-2.5 px-4 bg-[#D77E6C] hover:bg-[#C66B5A] text-white rounded-lg font-medium transition-colors"
                >
                  Подтвердить
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