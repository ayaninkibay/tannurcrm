'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import {
  Hash,
  Phone,
  MapPin,
  Clock,
  Package,
  Check,
  CheckCircle2,
  Truck,
  XCircle,
  CreditCard,
  User,
  Receipt,
  Printer,
  MessageSquareText,
  Copy,
  MapPinned,
  BadgeCheck,
  AlertTriangle
} from 'lucide-react';

/* ===== Типы ===== */
type OrderStatus = 'pending' | 'accepted' | 'collecting' | 'delivery' | 'delivered' | 'rejected';
type OrderType = 'shop' | 'dealers' | 'star';
type PayStatus = 'paid' | 'unpaid' | 'partial';

interface Order {
  id: string;
  clientId: string;
  name: string;
  phone: string;
  date: string;              // "YYYY-MM-DD HH:mm"
  products: string[];
  address?: string;
  status: OrderStatus;
  amount: number;            // сумма по товарам
  type: OrderType;
}

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface ExtendedOrder extends Order {
  items: OrderItem[];
  deliveryMethod: 'courier' | 'pickup';
  shippingPrice: number;
  discount: number;
  payment: {
    method: 'card' | 'cash' | 'transfer';
    status: PayStatus;
    paidAmount: number;
  };
  createdAt: string;
  updatedAt: string;
}

/* ===== Fallback моки по id (на всякий случай) ===== */
const fallbackOrders: Order[] = [
  { id: 'ORD-001', clientId: 'TN82732', name: 'Айгерим Нурланова', phone: '+7 777 123 45 67', date: '2025-01-20 14:30', products: ['Товар 1', 'Товар 2'], address: 'ул. Абая 150, кв. 45', status: 'pending', amount: 45000, type: 'shop' },
  { id: 'ORD-002', clientId: 'TN82733', name: 'Ерлан Сериков', phone: '+7 708 987 65 43', date: '2025-01-20 15:45', products: ['Товар 3'], address: 'пр. Достык 89', status: 'delivery', amount: 25000, type: 'shop' },
  { id: 'DLR-001', clientId: 'TN82734', name: 'Мадина Касымова', phone: '+7 701 555 44 33', date: '2025-01-20 10:15', products: ['Товар A', 'Товар B', 'Товар C'], status: 'accepted', amount: 120000, type: 'dealers' },
  { id: 'STR-001', clientId: 'TN82735', name: 'Данияр Жумабек', phone: '+7 775 222 11 00', date: '2025-01-20 16:20', products: ['Премиум товар 1'], address: 'мкр. Самал-2, д. 15', status: 'collecting', amount: 85000, type: 'star' },
  { id: 'ORD-003', clientId: 'TN82736', name: 'Алия Сатыбалды', phone: '+7 747 888 99 00', date: '2025-01-15 11:20', products: ['Товар 4', 'Товар 5'], address: 'ул. Жандосова 58', status: 'delivered', amount: 67000, type: 'shop' },
];

/* ===== Маппинги ===== */
const statusText: Record<OrderStatus, string> = {
  pending: 'Ожидает',
  accepted: 'Принят',
  collecting: 'Сборка',
  delivery: 'Доставка',
  delivered: 'Доставлен',
  rejected: 'Отклонен',
};

const statusColor: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-blue-100 text-blue-700',
  collecting: 'bg-purple-100 text-purple-700',
  delivery: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const statusFlow: OrderStatus[] = ['pending', 'accepted', 'collecting', 'delivery', 'delivered'];

/* ===== Утилиты ===== */
const money = (n: number) => `${n.toLocaleString('ru-RU')} ₸`;

/** Преобразуем базовый заказ в расширенный (как будто пришло из БД) */
function hydrate(order: Order): ExtendedOrder {
  const priceOf = (name: string) => {
    const base = Math.abs([...name].reduce((s, c) => s + c.charCodeAt(0), 0));
    const rounded = (base % 9) * 500 + 5000; // 5 000..9 500
    return Math.round(rounded / 100) * 100;
  };

  const items: OrderItem[] = (order.products || []).map((p) => ({
    name: p,
    qty: 1,
    price: priceOf(p),
  }));

  const deliveryMethod: ExtendedOrder['deliveryMethod'] =
    order.address ? 'courier' : 'pickup';

  const shippingPrice = deliveryMethod === 'courier' ? 1500 : 0;

  return {
    ...order,
    items,
    deliveryMethod,
    shippingPrice,
    discount: 0,
    payment: {
      method: 'card',
      status: order.status === 'delivered' ? 'paid' : 'unpaid',
      paidAmount: order.status === 'delivered' ? order.amount + shippingPrice : 0,
    },
    createdAt: order.date,
    updatedAt: order.date,
  };
}

/* ===== UI блоки ===== */
const Badge = ({ status }: { status: OrderStatus }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[status]}`}>
    {statusText[status]}
  </span>
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

export default function ViewOrderPage() {
  const sp = useSearchParams();

  const [order, setOrder] = useState<ExtendedOrder | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [noteText, setNoteText] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<{
    open: boolean;
    to: OrderStatus | null;
    title: string;
  }>({ open: false, to: null, title: '' });

  /* загрузка заказа: сначала localStorage, затем fallback по id */
  useEffect(() => {
    try {
      const raw = localStorage.getItem('selected_order');
      if (raw) {
        setOrder(hydrate(JSON.parse(raw)));
        return;
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (order) return;
    const id = sp?.get('id');
    if (id) {
      const found = fallbackOrders.find(o => o.id === id);
      if (found) setOrder(hydrate(found));
    }
  }, [sp, order]);

  /* вычисления сумм */
  const totals = useMemo(() => {
    if (!order) return { items: 0, shipping: 0, discount: 0, grand: 0 };
    const items = order.items.reduce((s, i) => s + i.qty * i.price, 0);
    const shipping = order.shippingPrice;
    const discount = order.discount;
    const grand = items + shipping - discount;
    return { items, shipping, discount, grand };
  }, [order]);

  /* действия */
  const requestStatusChange = (to: OrderStatus) => {
    if (!order) return;
    const title = `Подтвердите: ${statusText[order.status]} → ${statusText[to]}`;
    setConfirm({ open: true, to, title });
  };

  const applyStatusChange = () => {
    if (!order || !confirm.to) return;
    const to = confirm.to as OrderStatus; // сужаем тип

    const next: ExtendedOrder = {
      ...order,
      status: to,
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    if (to === 'delivered') {
      next.payment = { ...next.payment, status: 'paid', paidAmount: totals.grand };
    }

    setOrder(next);
    try { localStorage.setItem('selected_order', JSON.stringify(next)); } catch {}

    setLog((prev) => [`Статус изменён на «${statusText[to]}»`, ...prev]);
    setConfirm({ open: false, to: null, title: '' });
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    setNotes((prev) => [noteText.trim(), ...prev]);
    setNoteText('');
  };

  const copyAddress = async () => {
    if (!order?.address) return;
    try { await navigator.clipboard.writeText(order.address); } catch {}
  };

  const callClientHref = order?.phone ? `tel:${order.phone.replace(/\s+/g,'')}` : '#';
  const openInMapsHref = order?.address ? `https://maps.google.com/?q=${encodeURIComponent(order.address)}` : '#';

  const currentStep = order ? statusFlow.indexOf(order.status) : -1;
  const nextAllowed: OrderStatus | null = useMemo(() => {
    if (!order) return null;
    if (order.status === 'rejected' || order.status === 'delivered') return null;
    const idx = statusFlow.indexOf(order.status);
    return statusFlow[idx + 1] ?? null;
  }, [order]);

  if (!order) {
    return (
      <div className="p-2 md:p-6">
        <MoreHeaderAD title="Просмотр заказа" />
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="text-gray-700">Данные заказа не найдены.</div>
       showBackButton={true}
        </div>
      </div>
      
    );
 
  }

  return (
    <div className="p-2 md:p-6">
      <MoreHeaderAD title={`Просмотр заказа #${order.id}`} showBackButton={true} />

      {/* Шапка с быстрыми действиями */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-50 rounded-xl">
              <Hash className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <div className="font-mono text-sm text-gray-700">{order.id}</div>
                <Badge status={order.status} />
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Создан: {order.createdAt} • Обновлён: {order.updatedAt}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {nextAllowed && (
              <button
                onClick={() => requestStatusChange(nextAllowed)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#D77E6C] hover:bg-[#C66B5A] text-white text-sm font-medium"
              >
                {order.status === 'pending' && <Check className="w-4 h-4" />}
                {order.status === 'accepted' && <Package className="w-4 h-4" />}
                {order.status === 'collecting' && <Truck className="w-4 h-4" />}
                {order.status === 'delivery' && <CheckCircle2 className="w-4 h-4" />}
                Продолжить → {statusText[nextAllowed as OrderStatus]}
              </button>
            )}
            <button
              onClick={() => requestStatusChange('rejected')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium"
              disabled={order.status === 'rejected' || order.status === 'delivered'}
              title="Отклонить заказ"
            >
              <XCircle className="w-4 h-4" /> Отклонить
            </button>
            <a href={callClientHref} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium">
              <Phone className="w-4 h-4" /> Позвонить
            </a>
            <a href={openInMapsHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium">
              <MapPinned className="w-4 h-4" /> Открыть в картах
            </a>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium"
            >
              <Printer className="w-4 h-4" /> Печать
            </button>
          </div>
        </div>

        {/* Таймлайн статусов */}
        <div className="mt-6 flex items-center gap-2 sm:gap-4">
          {statusFlow.map((st, idx) => (
            <React.Fragment key={st}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                    ${idx <= currentStep ? 'bg-[#D77E6C] text-white' : 'bg-gray-100 text-gray-400'}
                  `}
                >
                  {idx + 1}
                </div>
                <div className={`text-xs sm:text-sm ${idx <= currentStep ? 'text-gray-900' : 'text-gray-400'}`}>
                  {statusText[st]}
                </div>
              </div>
              {idx < statusFlow.length - 1 && (
                <div className={`flex-1 h-[2px] ${idx < currentStep ? 'bg-[#D77E6C]' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Контент: 2 колонки */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Левая (широкая) */}
        <div className="lg:col-span-2 space-y-6">
          <Section title="Товары" icon={Package}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-xs text-gray-500">
                  <tr>
                    <th className="text-left py-2">Наименование</th>
                    <th className="text-right py-2">Цена</th>
                    <th className="text-center py-2">Кол-во</th>
                    <th className="text-right py-2">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((it, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="py-3 pr-4">
                        <div className="text-sm font-medium text-gray-900">{it.name}</div>
                      </td>
                      <td className="py-3 text-right text-sm">{money(it.price)}</td>
                      <td className="py-3 text-center text-sm">{it.qty}</td>
                      <td className="py-3 text-right text-sm font-medium">{money(it.qty * it.price)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-gray-200">
                  <tr>
                    <td colSpan={3} className="py-2 text-right text-sm text-gray-500">Товары</td>
                    <td className="py-2 text-right text-sm font-medium">{money(totals.items)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-2 text-right text-sm text-gray-500">Доставка</td>
                    <td className="py-2 text-right text-sm font-medium">{money(totals.shipping)}</td>
                  </tr>
                  {totals.discount > 0 && (
                    <tr>
                      <td colSpan={3} className="py-2 text-right text-sm text-gray-500">Скидка</td>
                      <td className="py-2 text-right text-sm font-medium">− {money(totals.discount)}</td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={3} className="py-2 text-right text-sm text-gray-900 font-semibold">Итого к оплате</td>
                    <td className="py-2 text-right text-base font-bold text-gray-900">{money(totals.grand)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Section>

          <Section title="Заметки" icon={MessageSquareText}>
            <div className="flex gap-2 mb-3">
              <input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Добавить заметку для команды…"
                className="flex-1 h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#D77E6C]/30"
              />
              <button
                onClick={addNote}
                className="px-4 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium"
              >
                Добавить
              </button>
            </div>
            {notes.length === 0 ? (
              <div className="text-sm text-gray-500">Заметок пока нет.</div>
            ) : (
              <ul className="space-y-2">
                {notes.map((n, i) => (
                  <li key={i} className="bg-gray-50 rounded-xl px-3 py-2 text-sm">{n}</li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Журнал действий" icon={Receipt}>
            {log.length === 0 ? (
              <div className="text-sm text-gray-500">Пока пусто.</div>
            ) : (
              <ul className="space-y-2">
                {log.map((l, i) => (
                  <li key={i} className="text-sm text-gray-700">• {l}</li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        {/* Правая колонка */}
        <div className="space-y-6">
          <Section title="Клиент" icon={User}>
            <div className="space-y-2 text-sm">
              <div className="font-medium text-gray-900">{order.name}</div>
              <div className="text-gray-500">{order.clientId}</div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <a className="hover:underline" href={callClientHref}>{order.phone}</a>
              </div>
            </div>
          </Section>

          <Section title="Доставка" icon={MapPin}>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-gray-400" />
                <span className="font-medium">
                  {order.deliveryMethod === 'courier' ? 'Курьер' : 'Самовывоз'}
                </span>
              </div>
              {order.address ? (
                <>
                  <div className="text-gray-700">{order.address}</div>
                  <div className="flex gap-2 mt-2">
                    <a
                      href={openInMapsHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-medium"
                    >
                      <MapPinned className="w-3.5 h-3.5" /> Карты
                    </a>
                    <button
                      onClick={copyAddress}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-medium"
                    >
                      <Copy className="w-3.5 h-3.5" /> Скопировать
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-gray-500">Адрес не указан</div>
              )}
            </div>
          </Section>

          <Section title="Оплата" icon={CreditCard}>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Метод</span>
                <span className="font-medium">
                  {order.payment.method === 'card' && 'Банковская карта'}
                  {order.payment.method === 'cash' && 'Наличные'}
                  {order.payment.method === 'transfer' && 'Перевод'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Статус</span>
                <span className={`font-medium ${
                  order.payment.status === 'paid' ? 'text-green-600' :
                  order.payment.status === 'partial' ? 'text-orange-600' : 'text-gray-800'
                }`}>
                  {order.payment.status === 'paid' && 'Оплачен'}
                  {order.payment.status === 'partial' && 'Частично оплачен'}
                  {order.payment.status === 'unpaid' && 'Не оплачен'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">К оплате</span>
                <span className="font-semibold">{money(totals.grand)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Оплачено</span>
                <span>{money(order.payment.paidAmount)}</span>
              </div>
            </div>
          </Section>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/admin/store"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium"
              >
                ← Назад к заказам
              </Link>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white hover:bg-black text-sm font-medium"
              >
                <Printer className="w-4 h-4" /> Печать счёта
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
              Это действие изменит статус заказа и будет записано в журнал.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm({ open: false, to: null, title: '' })}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={applyStatusChange}
                className="flex-1 py-2.5 px-4 bg-[#D77E6C] hover:bg-[#C66B5A] text-white rounded-lg font-medium transition-colors"
              >
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
