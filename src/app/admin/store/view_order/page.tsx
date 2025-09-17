'use client';

import React, { useMemo, useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import {
  Hash, Phone, MapPin, Clock, Package, Check, CheckCircle2, Truck, XCircle,
  CreditCard, User, Receipt, Printer, MessageSquareText, Copy, MapPinned,
  BadgeCheck, AlertTriangle
} from 'lucide-react';
import { useTranslate } from '@/hooks/useTranslate';
import { OrderService, OrderWithItems } from '@/lib/orders/OrderService';

/* ===== Типы ===== */
type OrderStatus = 'new' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
type PayStatus = 'paid' | 'unpaid' | 'partial';

/* ===== Fallback моки ===== */
const fallbackOrders: OrderWithItems[] = [
  { 
    id: 'ORD-001', 
    user: { first_name: 'Айгерим', last_name: 'Нурланова', email: 'aigerim@mail.ru', phone: '+7 777 123 45 67' },
    created_at: '2025-01-20T14:30:00Z', 
    updated_at: '2025-01-20T14:30:00Z',
    order_status: 'new', 
    total_amount: 45000, 
    delivery_address: 'ул. Абая 150, кв. 45',
    payment_status: 'unpaid',
    order_items: [
      { product: { name: 'Крем для лица Tannur', price: 15000 }, quantity: 2, price: 15000 },
      { product: { name: 'Сыворотка антивозрастная', price: 15000 }, quantity: 1, price: 15000 }
    ],
    order_number: null,
    paid_at: null,
    referrer_star_id: null,
    delivery_date: null,
    notes: null,
    user_id: 'test-user-id'
  }
];

/* ===== Цвета статусов (классы) ===== */
const statusColor: Record<string, string> = {
  new: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  returned: 'bg-gray-100 text-gray-700'
};

const statusFlow: string[] = ['new', 'confirmed', 'processing', 'shipped', 'delivered'];

/* ===== Утилиты ===== */
const money = (n: number) => `${n.toLocaleString('ru-RU')} ₸`;

/* ===== UI блоки ===== */
const Badge = ({ label, status }: { label: string; status: string }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[status] || 'bg-gray-100 text-gray-700'}`}>{label}</span>
);

const Section = ({ title, icon: Icon, children }:{
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6">
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-5 h-5 text-[#D77E6C]" />
      <h3 className="text-base font-semibold">{title}</h3>
    </div>
    {children}
  </div>
);

/* ===== Основной компонент ===== */
function ViewOrderContent() {
  const { t } = useTranslate();
  const sp = useSearchParams();

  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [noteText, setNoteText] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<{ open: boolean; to: string | null; title: string; }>({ open: false, to: null, title: '' });

  // локализация текстов статусов
  const statusText = useMemo<Record<string, string>>(() => ({
    new: t('Новый'),
    confirmed: t('Подтвержден'),
    processing: t('Обработка'),
    shipped: t('Отправлен'),
    delivered: t('Доставлен'),
    cancelled: t('Отменен'),
    returned: t('Возврат')
  }), [t]);

  /* загрузка заказа */
  useEffect(() => {
    const loadOrder = async () => {
      try {
        // Сначала пробуем загрузить из localStorage
        const raw = localStorage.getItem('selected_order');
        if (raw) { 
          const orderData = JSON.parse(raw);
          
          // Если есть ID, загружаем полные данные из базы
          if (orderData.id) {
            const orderService = new OrderService();
            const result = await orderService.getOrderById(orderData.id);
            
            if (result.success && result.data) {
              console.log('Loaded full order data:', result.data);
              setOrder(result.data);
              return;
            }
          }
          
          // Иначе используем данные из localStorage
          setOrder(orderData); 
          return; 
        }
      } catch (error) {
        console.error('Error loading order:', error);
      }
    };

    loadOrder();
  }, []);
  
  useEffect(() => {
    if (order) return;
    const id = sp?.get('id');
    if (id) {
      const found = fallbackOrders.find(o => o.id === id);
      if (found) setOrder(found);
    }
  }, [sp, order]);

  /* суммы */
  const totals = useMemo(() => {
    if (!order) return { items: 0, shipping: 0, discount: 0, grand: 0 };
    
    const items = order.order_items?.reduce((sum, item) => {
      const price = item.price || item.product?.price || 0;
      const qty = item.quantity || 1;
      return sum + (price * qty);
    }, 0) || order.total_amount || 0;
    
    const shipping = order.delivery_address ? 1500 : 0;
    const discount = 0;
    const grand = items + shipping - discount;
    
    return { items, shipping, discount, grand };
  }, [order]);

  /* действия */
  const requestStatusChange = (to: string) => {
    if (!order || !order.order_status) return;
    const title = t('Подтвердите: {from} → {to}')
      .replace('{from}', statusText[order.order_status])
      .replace('{to}', statusText[to]);
    setConfirm({ open: true, to, title });
  };

  const applyStatusChange = () => {
    if (!order || !confirm.to) return;
    const to = confirm.to as string;

    const next: OrderWithItems = {
      ...order,
      order_status: to,
      updated_at: new Date().toISOString()
    };
    if (to === 'delivered') {
      next.payment_status = 'paid';
    }

    setOrder(next);
    try { localStorage.setItem('selected_order', JSON.stringify(next)); } catch {}
    setLog((prev) => [t('Статус изменён на «{status}»').replace('{status}', statusText[to]), ...prev]);
    setConfirm({ open: false, to: null, title: '' });
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    setNotes((prev) => [noteText.trim(), ...prev]);
    setNoteText('');
  };

  const copyAddress = async () => {
    if (!order?.delivery_address) return;
    try { await navigator.clipboard.writeText(order.delivery_address); } catch {}
  };

  const callClientHref = order?.user?.phone ? `tel:${order.user.phone.replace(/\s+/g,'')}` : '#';
  const openInMapsHref = order?.delivery_address ? `https://maps.google.com/?q=${encodeURIComponent(order.delivery_address)}` : '#';

  const currentStep = order && order.order_status ? statusFlow.indexOf(order.order_status) : -1;
  const nextAllowed: string | null = useMemo(() => {
    if (!order || !order.order_status) return null;
    if (order.order_status === 'cancelled' || order.order_status === 'delivered') return null;
    const idx = statusFlow.indexOf(order.order_status);
    return statusFlow[idx + 1] ?? null;
  }, [order]);

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

  if (!order) {
    return (
      <div className="p-2 md:p-6">
        <MoreHeaderAD title={t('Просмотр заказа')} showBackButton={true} />
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="text-gray-700">{t('Данные заказа не найдены.')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6">
      <MoreHeaderAD title={`${t('Просмотр заказа')} #${order.id.slice(-8)}`} showBackButton={true} />

      {/* Шапка */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-50 rounded-xl"><Hash className="w-5 h-5 text-gray-500" /></div>
            <div>
              <div className="flex items-center gap-3">
                <div className="font-mono text-sm text-gray-700">{order.id.slice(-8)}</div>
                <Badge status={order.order_status || 'new'} label={statusText[order.order_status || 'new']} />
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                {t('Создан:')} {formatDate(order.created_at)} 
                {order.updated_at && ` • ${t('Обновлён:')} ${formatDate(order.updated_at)}`}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {nextAllowed && (
              <button
                onClick={() => requestStatusChange(nextAllowed)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#D77E6C] hover:bg-[#C66B5A] text-white text-sm font-medium"
                title={t('Продолжить → {status}').replace('{status}', statusText[nextAllowed])}
              >
                {order.order_status === 'new' && <Check className="w-4 h-4" />}
                {order.order_status === 'confirmed' && <Package className="w-4 h-4" />}
                {order.order_status === 'processing' && <Truck className="w-4 h-4" />}
                {order.order_status === 'shipped' && <CheckCircle2 className="w-4 h-4" />}
                {t('Продолжить → {status}').replace('{status}', statusText[nextAllowed])}
              </button>
            )}
            <button
              onClick={() => requestStatusChange('cancelled')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium"
              disabled={order.order_status === 'cancelled' || order.order_status === 'delivered'}
              title={t('Отклонить заказ')}
            >
              <XCircle className="w-4 h-4" /> {t('Отклонить')}
            </button>
            {order.user?.phone && (
              <a href={callClientHref} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium">
                <Phone className="w-4 h-4" /> {t('Позвонить')}
              </a>
            )}
            {order.delivery_address && (
              <a href={openInMapsHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium">
                <MapPinned className="w-4 h-4" /> {t('Открыть в картах')}
              </a>
            )}
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium">
              <Printer className="w-4 h-4" /> {t('Печать')}
            </button>
          </div>
        </div>

        {/* Таймлайн */}
        <div className="mt-6 flex items-center gap-2 sm:gap-4">
          {statusFlow.map((st, idx) => (
            <React.Fragment key={st}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${idx <= (statusFlow.indexOf(order.order_status || 'new')) ? 'bg-[#D77E6C] text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {idx + 1}
                </div>
                <div className={`text-xs sm:text-sm ${idx <= (statusFlow.indexOf(order.order_status || 'new')) ? 'text-gray-900' : 'text-gray-400'}`}>
                  {statusText[st]}
                </div>
              </div>
              {idx < statusFlow.length - 1 && (
                <div className={`flex-1 h-[2px] ${idx < (statusFlow.indexOf(order.order_status || 'new')) ? 'bg-[#D77E6C]' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Контент */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Левая колонка */}
        <div className="lg:col-span-2 space-y-6">
          <Section title={t('Товары')} icon={Package}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-xs text-gray-500">
                  <tr>
                    <th className="text-left py-2">{t('Наименование')}</th>
                    <th className="text-right py-2">{t('Цена')}</th>
                    <th className="text-center py-2">{t('Кол-во')}</th>
                    <th className="text-right py-2">{t('Сумма')}</th>
                  </tr>
                </thead>
                <tbody>
                  {order.order_items && order.order_items.length > 0 ? (
                    order.order_items.map((item, i) => {
                      const price = item.price || item.product?.price || 0;
                      const qty = item.quantity || 1;
                      const name = item.product?.name || `Товар ${i + 1}`;
                      
                      return (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="py-3 pr-4"><div className="text-sm font-medium text-gray-900">{name}</div></td>
                          <td className="py-3 text-right text-sm">{money(price)}</td>
                          <td className="py-3 text-center text-sm">{qty}</td>
                          <td className="py-3 text-right text-sm font-medium">{money(qty * price)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-gray-500">{t('Товары не указаны')}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="border-t border-gray-200">
                  <tr>
                    <td colSpan={3} className="py-2 text-right text-sm text-gray-500">{t('Товары')}</td>
                    <td className="py-2 text-right text-sm font-medium">{money(totals.items)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-2 text-right text-sm text-gray-500">{t('Доставка')}</td>
                    <td className="py-2 text-right text-sm font-medium">{money(totals.shipping)}</td>
                  </tr>
                  {totals.discount > 0 && (
                    <tr>
                      <td colSpan={3} className="py-2 text-right text-sm text-gray-500">{t('Скидка')}</td>
                      <td className="py-2 text-right text-sm font-medium">− {money(totals.discount)}</td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={3} className="py-2 text-right text-sm text-gray-900 font-semibold">{t('Итого к оплате')}</td>
                    <td className="py-2 text-right text-base font-bold text-gray-900">{money(totals.grand)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Section>

          <Section title={t('Заметки')} icon={MessageSquareText}>
            <div className="flex gap-2 mb-3">
              <input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={t('Добавить заметку для команды…')}
                className="flex-1 h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#D77E6C]/30"
              />
              <button onClick={addNote} className="px-4 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium">
                {t('Добавить')}
              </button>
            </div>
            {notes.length === 0 ? (
              <div className="text-sm text-gray-500">{t('Заметок пока нет.')}</div>
            ) : (
              <ul className="space-y-2">
                {notes.map((n, i) => (<li key={i} className="bg-gray-50 rounded-xl px-3 py-2 text-sm">{n}</li>))}
              </ul>
            )}
          </Section>

          <Section title={t('Журнал действий')} icon={Receipt}>
            {log.length === 0 ? (
              <div className="text-sm text-gray-500">{t('Пока пусто.')}</div>
            ) : (
              <ul className="space-y-2">{log.map((l, i) => (<li key={i} className="text-sm text-gray-700">• {l}</li>))}</ul>
            )}
          </Section>
        </div>

        {/* Правая колонка */}
        <div className="space-y-6">
          <Section title={t('Клиент')} icon={User}>
            <div className="space-y-2 text-sm">
              <div className="font-medium text-gray-900">
                {order.user?.first_name} {order.user?.last_name}
              </div>
              {order.user?.email && <div className="text-gray-500">{order.user.email}</div>}
              {order.user?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a className="hover:underline" href={callClientHref}>{order.user.phone}</a>
                </div>
              )}
            </div>
          </Section>

          <Section title={t('Доставка')} icon={MapPin}>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-gray-400" />
                <span className="font-medium">
                  {order.delivery_address ? t('Курьер') : t('Самовывоз')}
                </span>
              </div>
              {order.delivery_address ? (
                <>
                  <div className="text-gray-700">{order.delivery_address}</div>
                  <div className="flex gap-2 mt-2">
                    <a href={openInMapsHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-medium">
                      <MapPinned className="w-3.5 h-3.5" /> {t('Карты')}
                    </a>
                    <button onClick={copyAddress} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-medium">
                      <Copy className="w-3.5 h-3.5" /> {t('Скопировать')}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-gray-500">{t('Адрес не указан')}</div>
              )}
            </div>
          </Section>

          <Section title={t('Оплата')} icon={CreditCard}>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{t('Статус')}</span>
                <span className={`font-medium ${
                  order.payment_status === 'paid' ? 'text-green-600' :
                  order.payment_status === 'partial' ? 'text-orange-600' : 'text-gray-800'
                }`}>
                  {order.payment_status === 'paid' && t('Оплачен')}
                  {order.payment_status === 'partial' && t('Частично оплачен')}
                  {(!order.payment_status || order.payment_status === 'unpaid') && t('Не оплачен')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{t('К оплате')}</span>
                <span className="font-semibold">{money(totals.grand)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{t('Оплачено')}</span>
                <span>{money(order.payment_status === 'paid' ? totals.grand : 0)}</span>
              </div>
            </div>
          </Section>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="grid grid-cols-2 gap-2">
              <Link href="/admin/store" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium">
                {t('← Назад к заказам')}
              </Link>
              <button onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white hover:bg-black text-sm font-medium">
                <Printer className="w-4 h-4" /> {t('Печать счёта')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Модалка подтверждения */}
      {confirm.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-center w-12 h-12 bg-[#D77E6C]/10 rounded-full mb-4 mx-auto">
              <AlertTriangle className="w-6 h-6 text-[#D77E6C]" />
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">{confirm.title}</h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              {t('Это действие изменит статус заказа и будет записано в журнал.')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm({ open: false, to: null, title: '' })}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                {t('Отмена')}
              </button>
              <button
                onClick={applyStatusChange}
                className="flex-1 py-2.5 px-4 bg-[#D77E6C] hover:bg-[#C66B5A] text-white rounded-lg font-medium transition-colors"
              >
                {t('Подтвердить')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== Fallback на время загрузки ===== */
function LoadingFallback() {
  const { t } = useTranslate();
  return (
    <div className="p-2 md:p-6">
      <MoreHeaderAD title={t('Просмотр заказа')} showBackButton={true} />
      <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
}

/* ===== Экспорт с Suspense ===== */
export default function ViewOrderPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ViewOrderContent />
    </Suspense>
  );
}