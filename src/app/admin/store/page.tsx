'use client';

import React, { useMemo, useState } from 'react';
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

// Типы
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

// Моки (ключи оставляем русскими — показываем через t(...))
const mockOrders: Order[] = [
  { id:'ORD-001', clientId:'TN82732', name:'Айгерим Нурланова', phone:'+7 777 123 45 67', date:'2025-01-20 14:30', products:['Товар 1','Товар 2'], address:'ул. Абая 150, кв. 45', status:'pending',   amount:45000,  type:'shop' },
  { id:'ORD-002', clientId:'TN82733', name:'Ерлан Сериков',    phone:'+7 708 987 65 43', date:'2025-01-20 15:45', products:['Товар 3'],         address:'пр. Достык 89',       status:'delivery',  amount:25000,  type:'shop' },
  { id:'DLR-001', clientId:'TN82734', name:'Мадина Касымова',  phone:'+7 701 555 44 33', date:'2025-01-20 10:15', products:['Товар A','Товар B','Товар C'], status:'accepted',  amount:120000, type:'dealers' },
  { id:'STR-001', clientId:'TN82735', name:'Данияр Жумабек',   phone:'+7 775 222 11 00', date:'2025-01-20 16:20', products:['Премиум товар 1'], address:'мкр. Самал-2, д. 15', status:'collecting',amount:85000,  type:'star' },
  { id:'ORD-003', clientId:'TN82736', name:'Алия Сатыбалды',   phone:'+7 747 888 99 00', date:'2025-01-15 11:20', products:['Товар 4','Товар 5'], address:'ул. Жандосова 58',  status:'delivered', amount:67000,  type:'shop' }
];

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

// Мобильная карточка
const MobileOrderCard = ({
  order,
  onStatusChange,
  type,
  onOpen,
}: {
  order: Order;
  onStatusChange: (orderId: string, newStatus: OrderStatus, action: string) => void;
  type: 'active' | 'completed';
  onOpen: (o: Order) => void;
}) => {
  const { t } = useTranslate();
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status: OrderStatus) => ({
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-blue-100 text-blue-700',
    collecting: 'bg-purple-100 text-purple-700',
    delivery: 'bg-orange-100 text-orange-700',
    delivered: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
  }[status]);

  const getStatusText = (status: OrderStatus) => ({
    pending: t('Ожидает'),
    accepted: t('Принят'),
    collecting: t('Сборка'),
    delivery: t('Доставка'),
    delivered: t('Доставлен'),
    rejected: t('Отклонен')
  }[status]);

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
            <span className="font-mono text-xs text-gray-500">#{order.id}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>
          <p className="font-medium text-sm">{t(order.name)}</p>
          <p className="text-xs text-gray-500">{order.clientId}</p>
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
          <span>{order.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-gray-400" />
          <span>{order.date}</span>
        </div>
        {order.address && (
          <div className="flex items-start gap-2">
            <MapPin className="w-3 h-3 text-gray-400 mt-0.5" />
            <span>{t(order.address)}</span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
        <div className="text-xs text-gray-600">
          {order.products.length} {t('товаров')}
        </div>
        <div className="font-semibold text-sm">{order.amount.toLocaleString()} ₸</div>
      </div>

      {showActions && type === 'active' && (
        <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onStatusChange(order.id, 'accepted', t('принять'))} className="flex flex-col items-center gap-1 p-2 hover:bg-blue-50 rounded-lg text-xs">
            <Check className="w-4 h-4 text-blue-600" />
            <span>{t('Принять')}</span>
          </button>
          <button onClick={() => onStatusChange(order.id, 'delivery', t('доставить'))} className="flex flex-col items-center gap-1 p-2 hover:bg-orange-50 rounded-lg text-xs">
            <Truck className="w-4 h-4 text-orange-600" />
            <span>{t('Доставка')}</span>
          </button>
          <button onClick={() => onStatusChange(order.id, 'rejected', t('отклонить'))} className="flex flex-col items-center gap-1 p-2 hover:bg-red-50 rounded-lg text-xs">
            <XCircle className="w-4 h-4 text-red-600" />
            <span>{t('Отклонить')}</span>
          </button>
        </div>
      )}
    </div>
  );
};

const OrdersManagementPage = () => {
  const router = useRouter();
  const { t } = useTranslate();

  const [activeTab, setActiveTab] = useState<OrderType>('shop');
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [dateFilter, setDateFilter] = useState<DateFilter>('week');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; orderId: string; newStatus: OrderStatus; action: string; }>({
    isOpen: false, orderId: '', newStatus: 'pending', action: ''
  });

  // NEW: свертка «Завершенные»
  const [showCompleted, setShowCompleted] = useState(false); // по умолчанию свернуто

  // --- переход на просмотр ---
  const openOrder = (order: Order) => {
    try {
      localStorage.setItem('last_order', JSON.stringify(order));
    } catch {}
    router.push('/admin/store/view_order');
  };

  // Статы
  const todayOrders = orders.filter(o => o.date.includes('2025-01-20'));
  const todayTotal = todayOrders.reduce((sum, order) => sum + order.amount, 0);
  const deliveryOrders = orders.filter(o => o.status === 'delivery');
  const deliveryTotal = deliveryOrders.reduce((sum, order) => sum + order.amount, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const pendingTotal = pendingOrders.reduce((sum, order) => sum + order.amount, 0);

  // Фильтры
  const activeOrders = orders.filter(o => o.type === activeTab && !['delivered', 'rejected'].includes(o.status));
  const completedOrders = orders.filter(o => o.type === activeTab && ['delivered', 'rejected'].includes(o.status));

  // Статус
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o)));
    setConfirmModal({ isOpen: false, orderId: '', newStatus: 'pending', action: '' });
  };
  const openConfirmModal = (orderId: string, newStatus: OrderStatus, action: string) => {
    setConfirmModal({ isOpen: true, orderId, newStatus, action });
  };

  const getStatusColor = (status: OrderStatus) => ({
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-blue-100 text-blue-700',
    collecting: 'bg-purple-100 text-purple-700',
    delivery: 'bg-orange-100 text-orange-700',
    delivered: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
  }[status]);

  const getStatusText = (status: OrderStatus) => ({
    pending: t('Ожидает'),
    accepted: t('Принят'),
    collecting: t('Сборка'),
    delivery: t('Доставка'),
    delivered: t('Доставлен'),
    rejected: t('Отклонен')
  }[status]);

  // Кнопки действий (десктоп)
  const ActionButtons = ({ order }: { order: Order }) => {
    const { t } = useTranslate();
    const buttons = [
      { icon: Check,       status: 'accepted' as OrderStatus,  tooltip: t('Принять заказ'),           action: t('принять'),                 color: 'hover:bg-blue-50 hover:text-blue-600' },
      { icon: Package,     status: 'collecting' as OrderStatus,tooltip: t('Собрать заказ'),           action: t('начать сборку'),           color: 'hover:bg-purple-50 hover:text-purple-600' },
      { icon: Truck,       status: 'delivery' as OrderStatus,  tooltip: t('Отправить на доставку'),   action: t('отправить на доставку'),   color: 'hover:bg-orange-50 hover:text-orange-600' },
      { icon: CheckCircle, status: 'delivered' as OrderStatus, tooltip: t('Отметить доставленным'),   action: t('отметить доставленным'),   color: 'hover:bg-green-50 hover:text-green-600' },
      { icon: XCircle,     status: 'rejected' as OrderStatus,  tooltip: t('Отклонить заказ'),         action: t('отклонить'),               color: 'hover:bg-red-50 hover:text-red-600' }
    ];

    return (
      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
        {buttons.map(({ icon: Icon, status, tooltip, action, color }) => (
          <div key={status} className="relative group">
            <button
              onClick={() => openConfirmModal(order.id, status, action)}
              className={`p-2 rounded-lg transition-all ${color} ${order.status === status ? 'bg-gray-100' : ''}`}
              disabled={order.status === status}
              title={tooltip}
            >
              <Icon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex ">
      <div className="grid w-full h-full">
        <MoreHeaderAD title={t('Управление заказами')} />

        {/* Статистика */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mt-6 md:mt-10 mb-4 md:mb-6">
          <StatCard icon={Calendar} title={t('Заказы за сегодня')} count={todayOrders.length} amount={todayTotal} subtitle={t('Заказы за сегодня')} iconColor="text-[#D77E6C]" iconBg="bg-[#D77E6C]" />
          <StatCard icon={Truck}    title={t('На доставке')}        count={deliveryOrders.length} amount={deliveryTotal} subtitle={t('В пути к клиентам')} iconColor="text-[#D77E6C]" iconBg="bg-[#D77E6C]" />
          <StatCard icon={AlertTriangle} title={t('Требуют внимания')} count={pendingOrders.length} amount={pendingTotal} subtitle={t('Ожидают обработки')} iconColor="text-[#D77E6C]" iconBg="bg-[#D77E6C]" />
        </div>

        {/* Табы */}
        <div className="overflow-x-auto mb-4 md:mb-6">
          <div className="bg-gray-100/50 backdrop-blur-sm rounded-2xl p-1.5 inline-flex min-w-full sm:min-w-0">
            <button onClick={() => setActiveTab('shop')} className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === 'shop' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" /><span className="text-xs sm:text-base font-medium">{t('Магазин')}</span>
            </button>
            <button onClick={() => setActiveTab('dealers')} className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === 'dealers' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              <Users className="w-4 h-4 sm:w-5 sm:h-5" /><span className="text-xs sm:text-base font-medium">{t('Дилеры')}</span>
            </button>
            <button onClick={() => setActiveTab('star')} className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === 'star' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              <Star className="w-4 h-4 sm:w-5 sm:h-5" /><span className="text-xs sm:text-base font-medium">{t('Звезды')}</span>
            </button>
          </div>
        </div>

        {/* Активные — мобильные */}
        <div className="md:hidden">
          <div className="mb-4">
            <h2 className="text-base font-medium mb-3">{t('Активные заказы')} ({activeOrders.length})</h2>
            {activeOrders.map((order) => (
              <MobileOrderCard
                key={order.id}
                order={order}
                onStatusChange={(id, st, act) => setConfirmModal({ isOpen: true, orderId: id, newStatus: st, action: act })}
                type="active"
                onOpen={openOrder}
              />
            ))}
            {activeOrders.length === 0 && (
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
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('Телефон')}</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('Товары')}</th>
                  {activeTab !== 'dealers' && <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('Адрес')}</th>}
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
                          <span className="font-mono text-sm">{order.id}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{t(order.name)}</p>
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
                          {order.products.slice(0, 2).map(p => t(p)).join(', ')}
                          {order.products.length > 2 && <span className="text-gray-500"> +{order.products.length - 2}</span>}
                        </div>
                      </td>
                      {activeTab !== 'dealers' && (
                        <td className="py-4 px-4">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                            <span className="text-sm">{t(order.address || '')}</span>
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
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        <ActionButtons order={order} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={activeTab === 'dealers' ? 7 : 8} className="py-8 text-center text-gray-500">
                      {t('Нет активных заказов')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ЗАВЕРШЕННЫЕ — мобильные (свернутые/раскрываемые) */}
        <div className="md:hidden">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-medium">
              {t('Завершенные заказы')}
              <span className="ml-2 text-gray-500">({completedOrders.length})</span>
            </h2>

            <div className="flex items-center gap-2">
              {/* Фильтр периода — рядом */}
              <div className="relative">
                <button
                  onClick={() => setShowDateDropdown(v => !v)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors"
                >
                  <CalendarDays className="w-3 h-3" />
                  <span>{t('Период')}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showDateDropdown && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 min-w-[120px]">
                    <button onClick={() => { setShowDateDropdown(false); }} className="w-full px-3 py-1.5 text-left hover:bg-gray-100 text-xs">{t('Неделя')}</button>
                    <button onClick={() => { setShowDateDropdown(false); }} className="w-full px-3 py-1.5 text-left hover:bg-gray-100 text-xs">{t('Месяц')}</button>
                    <button onClick={() => { setShowDateDropdown(false); }} className="w-full px-3 py-1.5 text-left hover:bg-gray-100 text-xs">{t('Выбрать период')}</button>
                  </div>
                )}
              </div>

              {/* Кнопка свернуть/развернуть */}
              <button
                onClick={() => setShowCompleted(v => !v)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors"
              >
                <span>{showCompleted ? t('Свернуть') : t('Показать')}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showCompleted ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {showCompleted && (
            <>
              {completedOrders.map((order) => (
                <MobileOrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={(id, st, act) => setConfirmModal({ isOpen: true, orderId: id, newStatus: st, action: act })}
                  type="completed"
                  onOpen={openOrder}
                />
              ))}
              {completedOrders.length === 0 && (
                <div className="text-center text-gray-500 py-8 bg-white rounded-xl">
                  {t('Нет завершенных заказов за выбранный период')}
                </div>
              )}
            </>
          )}
        </div>

        {/* ЗАВЕРШЕННЫЕ — десктоп (свернутые/раскрываемые) */}
        <div className="hidden md:block bg-white rounded-2xl border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-medium">
                {t('Завершенные заказы')}
                <span className="ml-2 text-gray-500 text-base">({completedOrders.length})</span>
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {/* Фильтр периода */}
              <div className="relative">
                <button
                  onClick={() => setShowDateDropdown(v => !v)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>{t('Период')}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showDateDropdown && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 min-w-[160px]">
                    <button onClick={() => { setShowDateDropdown(false); }} className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm">{t('Неделя')}</button>
                    <button onClick={() => { setShowDateDropdown(false); }} className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm">{t('Месяц')}</button>
                    <button onClick={() => { setShowDateDropdown(false); }} className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm">{t('Выбрать период')}</button>
                  </div>
                )}
              </div>
              {/* Свернуть/развернуть */}
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
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">{t('ID клиента')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('Имя Фамилия')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('Дата')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('Телефон')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('Товар')}</th>
                    {activeTab !== 'dealers' && <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('Адрес')}</th>}
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
                        <td className="py-4 px-6"><span className="font-mono text-sm">{order.clientId}</span></td>
                        <td className="py-4 px-4 font-medium">{t(order.name)}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{order.date}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm">{order.phone}</td>
                        <td className="py-4 px-4 text-sm">{order.products.map(p => t(p)).join(', ')}</td>
                        {activeTab !== 'dealers' && <td className="py-4 px-4 text-sm">{t(order.address || '')}</td>}
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
                        {t('Нет завершенных заказов за выбранный период')}
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
                <span className="font-mono text-sm">#{confirmModal.orderId}</span>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal({ isOpen: false, orderId: '', newStatus: 'pending', action: '' })}
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
