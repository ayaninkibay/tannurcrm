'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import {
  Hash, Phone, MapPin, Clock, Package, Check, CheckCircle2, Truck, XCircle,
  CreditCard, User, Receipt, Printer, MessageSquareText, Copy, MapPinned,
  BadgeCheck, AlertTriangle, Save, Edit2, X, FileText
} from 'lucide-react';
import { useTranslate } from '@/hooks/useTranslate';
import { useOrderModule } from '@/lib/admin_orders/useOrderModule';
import { OrderStatus } from '@/lib/admin_orders/OrderService';

/* ===== Цвета статусов (классы) ===== */
const statusColor: Record<string, string> = {
  new: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  returned: 'bg-gray-100 text-gray-700',
  ready_for_pickup: 'bg-green-100 text-green-700'
};

// Статусы для самовывоза
const pickupStatusFlow: string[] = ['new', 'processing', 'ready_for_pickup', 'delivered'];

// Статусы для доставки курьером
const deliveryStatusFlow: string[] = ['new', 'processing', 'shipped', 'delivered'];

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
  <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-5 h-5 text-[#D77E6C]" />
      <h3 className="text-base font-semibold">{title}</h3>
    </div>
    {children}
  </div>
);

/* ===== Основной компонент ===== */
export default function ViewOrderPage() {
  const { t } = useTranslate();
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;

  const {
    currentOrder,
    actionLog,
    loading,
    error,
    loadOrderById,
    loadActionLog,
    updateOrderStatus,
    updateNotes,
    updateDeliveryAddress,
    updateDeliveryMethod,
    clearError,
    clearCurrentOrder
  } = useOrderModule();

  // Локальные состояния
  const [noteText, setNoteText] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressValue, setAddressValue] = useState('');
  const [editingMethod, setEditingMethod] = useState(false);
  const [confirm, setConfirm] = useState<{ open: boolean; to: string | null; title: string; }>({ 
    open: false, 
    to: null, 
    title: '' 
  });

  // Загрузка данных
  useEffect(() => {
    if (orderId) {
      loadOrderById(orderId);
      loadActionLog(orderId);
    }
    return () => {
      clearCurrentOrder();
    };
  }, [orderId]);

  // Синхронизация с загруженным заказом
  useEffect(() => {
    if (currentOrder) {
      setNotesValue(currentOrder.notes || '');
      setAddressValue(currentOrder.delivery_address || '');
    }
  }, [currentOrder]);

  // локализация текстов статусов
  const statusText = useMemo<Record<string, string>>(() => ({
    new: t('Новый'),
    confirmed: t('Подтвержден'),
    processing: t('В обработке'),
    shipped: t('Отправлен'),
    delivered: t('Завершен'),
    cancelled: t('Отменен'),
    returned: t('Возврат'),
    ready_for_pickup: t('Готов к выдаче')
  }), [t]);

  // локализация типов действий
  const actionTypeText = useMemo<Record<string, string>>(() => ({
    status_changed: t('Изменение статуса'),
    note_added: t('Добавлена заметка'),
    note_updated: t('Заметка обновлена'),
    note_deleted: t('Заметка удалена'),
    delivery_address_updated: t('Адрес доставки обновлен'),
    delivery_date_updated: t('Дата доставки обновлена'),
    delivery_method_updated: t('Тип доставки изменен'),
    order_created: t('Заказ создан')
  }), [t]);

  // Выбор правильного flow в зависимости от типа доставки
  const statusFlow = useMemo(() => {
    if (!currentOrder) return pickupStatusFlow;
    return currentOrder.delivery_method === 'delivery' ? deliveryStatusFlow : pickupStatusFlow;
  }, [currentOrder]);

  /* суммы */
  const totals = useMemo(() => {
    if (!currentOrder) return { items: 0, shipping: 0, discount: 0, grand: 0 };
    
    const items = currentOrder.order_items?.reduce((sum, item) => {
      const price = item.price || item.product?.price || 0;
      const qty = item.quantity || 1;
      return sum + (price * qty);
    }, 0) || currentOrder.total_amount || 0;
    
    const shipping = currentOrder.delivery_cost || 0;
    const discount = 0;
    const grand = items + shipping - discount;
    
    return { items, shipping, discount, grand };
  }, [currentOrder]);

  /* действия */
  const requestStatusChange = (to: string) => {
    if (!currentOrder || !currentOrder.order_status) return;
    const title = t('Подтвердите: {from} → {to}')
      .replace('{from}', statusText[currentOrder.order_status])
      .replace('{to}', statusText[to]);
    setConfirm({ open: true, to, title });
  };

  const applyStatusChange = async () => {
    if (!currentOrder || !confirm.to || !orderId) return;
    await updateOrderStatus(orderId, confirm.to as OrderStatus);
    setConfirm({ open: false, to: null, title: '' });
  };

  const handleSaveNotes = async () => {
    if (!orderId) return;
    const success = await updateNotes(orderId, notesValue);
    if (success) {
      setEditingNotes(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!orderId) return;
    const success = await updateDeliveryAddress(orderId, addressValue);
    if (success) {
      setEditingAddress(false);
    }
  };

  const handleChangeDeliveryMethod = async (method: 'pickup' | 'delivery') => {
    if (!orderId) return;
    const success = await updateDeliveryMethod(orderId, method);
    if (success) {
      setEditingMethod(false);
      if (method === 'pickup') {
        setAddressValue('');
      }
    }
  };

  const copyAddress = async () => {
    if (!currentOrder?.delivery_address) return;
    try { 
      await navigator.clipboard.writeText(currentOrder.delivery_address); 
    } catch {}
  };

  // Форматирование телефона для звонка
  const formatPhoneForCall = (phone: string | null | undefined): string => {
    if (!phone) return '#';
    
    let cleaned = phone.replace(/\s+/g, '');
    
    if (cleaned.startsWith('8')) {
      return `tel:${cleaned}`;
    }
    
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    return `tel:${cleaned}`;
  };

  const callClientHref = formatPhoneForCall(currentOrder?.user?.phone);
  const openInMapsHref = currentOrder?.delivery_address ? `https://maps.google.com/?q=${encodeURIComponent(currentOrder.delivery_address)}` : '#';

  const nextAllowed: string | null = useMemo(() => {
    if (!currentOrder || !currentOrder.order_status) return null;
    if (currentOrder.order_status === 'cancelled' || currentOrder.order_status === 'delivered') return null;
    
    const idx = statusFlow.indexOf(currentOrder.order_status);
    return statusFlow[idx + 1] ?? null;
  }, [currentOrder, statusFlow]);

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

  if (loading && !currentOrder) {
    return (
      <div className="">
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

  if (!currentOrder) {
    return (
      <div className="">
        <MoreHeaderAD title={t('Просмотр заказа')} showBackButton={true} />
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="text-gray-700">{t('Данные заказа не найдены.')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 sm:pb-6">
      <MoreHeaderAD title={`${t('Заказ')} #${currentOrder.order_number || currentOrder.id.slice(-8)}`} showBackButton={true} />

      {/* Ошибка */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 flex items-center justify-between">
          <span className="text-red-700 text-sm">{error}</span>
          <button onClick={clearError} className="text-red-500 hover:text-red-700 text-xl">×</button>
        </div>
      )}

      {/* Шапка */}
      <div className="mt-4 sm:mt-6 bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          {/* Верхняя часть */}
          <div className="flex items-start gap-3">
            <div className="p-2 sm:p-3 bg-gray-50 rounded-xl flex-shrink-0">
              <Hash className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <div className="font-mono text-sm sm:text-base font-semibold text-gray-900">
                  #{currentOrder.order_number || currentOrder.id.slice(-8)}
                </div>
                <Badge status={currentOrder.order_status || 'new'} label={statusText[currentOrder.order_status || 'new']} />
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                <span>{formatDate(currentOrder.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Таймлайн - на мобилке вертикальный, на десктопе горизонтальный */}
          <div className="sm:hidden space-y-2">
            {statusFlow.map((st, idx) => {
              const isActive = idx <= statusFlow.indexOf(currentOrder.order_status || 'new');
              const isCurrent = st === currentOrder.order_status;
              
              return (
                <div key={st} className="flex items-start gap-3">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isActive ? 'bg-[#D77E6C] text-white' : 'bg-gray-100 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-[#D77E6C]/20' : ''}`}>
                      {idx + 1}
                    </div>
                    {idx < statusFlow.length - 1 && (
                      <div className={`w-0.5 h-8 my-1 ${isActive ? 'bg-[#D77E6C]' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'} ${isCurrent ? 'text-[#D77E6C]' : ''}`}>
                      {statusText[st]}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Таймлайн десктоп */}
          <div className="hidden sm:flex items-center gap-2 md:gap-4 overflow-x-auto pb-2">
            {statusFlow.map((st, idx) => (
              <React.Fragment key={st}>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx <= statusFlow.indexOf(currentOrder.order_status || 'new') 
                      ? 'bg-[#D77E6C] text-white' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className={`text-sm whitespace-nowrap ${
                    idx <= statusFlow.indexOf(currentOrder.order_status || 'new') 
                      ? 'text-gray-900' 
                      : 'text-gray-400'
                  }`}>
                    {statusText[st]}
                  </div>
                </div>
                {idx < statusFlow.length - 1 && (
                  <div className={`flex-1 h-[2px] min-w-[20px] ${
                    idx < statusFlow.indexOf(currentOrder.order_status || 'new') 
                      ? 'bg-[#D77E6C]' 
                      : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Кнопки действий - мобильная оптимизация */}
          <div className="flex flex-col sm:flex-row gap-2">
            {nextAllowed && (
              <button
                onClick={() => requestStatusChange(nextAllowed)}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl bg-[#D77E6C] hover:bg-[#C66B5A] active:bg-[#B65A48] text-white text-sm font-semibold shadow-sm transition-colors"
              >
                {nextAllowed === 'processing' && <Package className="w-4 h-4" />}
                {nextAllowed === 'ready_for_pickup' && <Check className="w-4 h-4" />}
                {nextAllowed === 'shipped' && <Truck className="w-4 h-4" />}
                {nextAllowed === 'delivered' && <CheckCircle2 className="w-4 h-4" />}
                <span>{statusText[nextAllowed]}</span>
              </button>
            )}
            
            <div className="grid grid-cols-3 sm:flex gap-2">
              <button
                onClick={() => requestStatusChange('cancelled')}
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 active:bg-red-200 text-sm font-medium transition-colors"
                disabled={currentOrder.order_status === 'cancelled' || currentOrder.order_status === 'delivered'}
              >
                <XCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{t('Отменить')}</span>
              </button>
              
              {currentOrder.user?.phone && (
                <a 
                  href={callClientHref} 
                  className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 active:bg-green-200 text-sm font-medium transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('Позвонить')}</span>
                </a>
              )}
              
              {currentOrder.delivery_address && (
                <a 
                  href={openInMapsHref} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 active:bg-blue-200 text-sm font-medium transition-colors"
                >
                  <MapPinned className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('Карты')}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
        {/* Левая колонка */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          
          {/* Товары */}
          <Section title={t('Товары')} icon={Package}>
            {/* Мобильная версия - улучшенные карточки */}
            <div className="block sm:hidden space-y-2">
              {currentOrder.order_items && currentOrder.order_items.length > 0 ? (
                currentOrder.order_items.map((item, i) => {
                  const price = item.price || item.product?.price || 0;
                  const qty = item.quantity || 1;
                  const name = item.product?.name || `Товар ${i + 1}`;
                  
                  return (
                    <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 mb-1.5 line-clamp-2">{name}</div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span>{money(price)}</span>
                            <span className="text-gray-400">×</span>
                            <span className="font-medium">{qty} {t('шт')}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-semibold text-gray-900">{money(qty * price)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-500 py-8 text-sm">{t('Товары не указаны')}</div>
              )}
            </div>

            {/* Десктопная версия - таблица */}
            <div className="hidden sm:block overflow-x-auto">
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
                  {currentOrder.order_items && currentOrder.order_items.length > 0 ? (
                    currentOrder.order_items.map((item, i) => {
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
                    <td colSpan={3} className="py-2 text-right text-sm text-gray-900 font-semibold">{t('Итого')}</td>
                    <td className="py-2 text-right text-base font-bold text-gray-900">{money(totals.grand)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Итого для мобилки */}
            <div className="block sm:hidden mt-4 pt-4 border-t border-gray-200 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{t('Товары')}</span>
                <span className="font-medium text-gray-900">{money(totals.items)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{t('Доставка')}</span>
                <span className="font-medium text-gray-900">{money(totals.shipping)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{t('Скидка')}</span>
                  <span className="font-medium text-green-600">− {money(totals.discount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-base font-semibold text-gray-900">{t('Итого')}</span>
                <span className="text-xl font-bold text-gray-900">{money(totals.grand)}</span>
              </div>
            </div>
          </Section>

          {/* Заметки */}
          <Section title={t('Заметки (Отображается у клиента)')} icon={MessageSquareText}>
            {editingNotes ? (
              <div className="space-y-3">
                <textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D77E6C] focus:border-transparent resize-none"
                  placeholder={t('Добавьте заметки...')}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNotes}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-[#D77E6C] text-white rounded-xl hover:bg-[#c96e5c] active:bg-[#b85e4c] disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {t('Сохранить')}
                  </button>
                  <button
                    onClick={() => {
                      setEditingNotes(false);
                      setNotesValue(currentOrder.notes || '');
                    }}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 active:bg-gray-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed mb-3 min-h-[60px]">
                  {currentOrder.notes || (
                    <p className="text-gray-400 italic">{t('Заметок пока нет')}</p>
                  )}
                </div>
                <button
                  onClick={() => setEditingNotes(true)}
                  className="text-[#D77E6C] hover:text-[#c96e5c] active:text-[#b85e4c] flex items-center gap-1.5 text-sm font-medium transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  {t('Редактировать')}
                </button>
              </>
            )}
          </Section>

          {/* Журнал - скрыт на мобилке, показывается внизу */}
          <div className="hidden lg:block">
            <Section title={t('Журнал действий')} icon={Receipt}>
              {actionLog && actionLog.length > 0 ? (
                <ul className="space-y-3">
                  {actionLog.map((log) => (
                    <li key={log.id} className="text-sm pb-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-start gap-2 mb-1">
                        <div className="font-medium text-gray-900 flex-1">
                          {log.description}
                        </div>
                      </div>
                      
                      {(log.action_type === 'status_changed' || 
                        log.action_type === 'delivery_address_updated' || 
                        log.action_type === 'delivery_method_updated') && (
                        <div className="text-xs space-y-0.5 mb-2">
                          {log.old_value && (
                            <div className="text-gray-500">
                              <span className="font-medium">{t('Было')}:</span> {log.old_value}
                            </div>
                          )}
                          {log.new_value && (
                            <div className="text-gray-700">
                              <span className="font-medium">{t('Стало')}:</span> {log.new_value}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        {log.user?.first_name && log.user?.last_name ? (
                          <>
                            {log.user.first_name} {log.user.last_name}
                          </>
                        ) : (
                          log.user?.email || t('Система')
                        )}
                        {' • '}
                        {formatDate(log.created_at)}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-gray-500">{t('Пока пусто.')}</div>
              )}
            </Section>
          </div>
        </div>

        {/* Правая колонка */}
        <div className="space-y-4 sm:space-y-6">
          
          {/* Клиент */}
          <Section title={t('Клиент')} icon={User}>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">{t('Имя')}</div>
                <div className="font-medium text-sm text-gray-900">
                  {currentOrder.user?.first_name} {currentOrder.user?.last_name}
                </div>
              </div>
              
              {currentOrder.user?.email && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">{t('Email')}</div>
                  <a 
                    href={`mailto:${currentOrder.user.email}`}
                    className="text-sm text-[#D77E6C] hover:text-[#c96e5c] active:text-[#b85e4c] font-medium break-all transition-colors"
                  >
                    {currentOrder.user.email}
                  </a>
                </div>
              )}
              
              {currentOrder.user?.phone && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">{t('Телефон')}</div>
                  <a 
                    href={callClientHref}
                    className="flex items-center gap-2 text-sm text-gray-900 hover:text-[#D77E6C] active:text-[#c96e5c] font-medium transition-colors"
                  >
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{currentOrder.user.phone}</span>
                  </a>
                </div>
              )}
            </div>
          </Section>

          {/* Доставка */}
          <Section title={t('Доставка')} icon={MapPin}>
            <div className="space-y-4 text-sm">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">{t('Тип доставки')}</span>
                  {!editingMethod && (
                    <button
                      onClick={() => setEditingMethod(true)}
                      className="text-[#D77E6C] hover:text-[#c96e5c] active:text-[#b85e4c] flex items-center gap-1 text-xs font-medium transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      {t('Изменить')}
                    </button>
                  )}
                </div>
                
                {editingMethod ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleChangeDeliveryMethod('pickup')}
                      disabled={loading}
                      className={`w-full px-4 py-3 rounded-xl border-2 text-left transition-all ${
                        currentOrder?.delivery_method === 'pickup'
                          ? 'border-[#D77E6C] bg-[#D77E6C]/5'
                          : 'border-gray-200 hover:border-gray-300 active:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <BadgeCheck className={`w-5 h-5 flex-shrink-0 ${
                          currentOrder?.delivery_method === 'pickup' ? 'text-[#D77E6C]' : 'text-gray-400'
                        }`} />
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-gray-900">{t('Самовывоз')}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{t('Бесплатно')}</div>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleChangeDeliveryMethod('delivery')}
                      disabled={loading}
                      className={`w-full px-4 py-3 rounded-xl border-2 text-left transition-all ${
                        currentOrder?.delivery_method === 'delivery'
                          ? 'border-[#D77E6C] bg-[#D77E6C]/5'
                          : 'border-gray-200 hover:border-gray-300 active:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Truck className={`w-5 h-5 flex-shrink-0 ${
                          currentOrder?.delivery_method === 'delivery' ? 'text-[#D77E6C]' : 'text-gray-400'
                        }`} />
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-gray-900">{t('Курьер')}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{money(currentOrder?.delivery_cost || 0)}</div>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => setEditingMethod(false)}
                      className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 active:bg-gray-300 text-sm font-medium transition-colors"
                    >
                      {t('Отмена')}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                    {currentOrder?.delivery_method === 'delivery' ? (
                      <>
                        <Truck className="w-5 h-5 text-gray-600 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-gray-900">{t('Курьер')}</div>
                          {totals.shipping > 0 && (
                            <div className="text-xs text-gray-500 mt-0.5">{money(totals.shipping)}</div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <BadgeCheck className="w-5 h-5 text-gray-600 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-gray-900">{t('Самовывоз')}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{t('Бесплатно')}</div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {currentOrder?.delivery_method === 'delivery' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">{t('Адрес доставки')}</span>
                    {!editingAddress && (
                      <button
                        onClick={() => setEditingAddress(true)}
                        className="text-[#D77E6C] hover:text-[#c96e5c] active:text-[#b85e4c] flex items-center gap-1 text-xs font-medium transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        {t('Изменить')}
                      </button>
                    )}
                  </div>
                  
                  {editingAddress ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={addressValue}
                        onChange={(e) => setAddressValue(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D77E6C] focus:border-transparent"
                        placeholder={t('Введите адрес доставки')}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveAddress}
                          disabled={loading}
                          className="flex-1 px-4 py-2.5 bg-[#D77E6C] text-white rounded-xl hover:bg-[#c96e5c] active:bg-[#b85e4c] disabled:opacity-50 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          {t('Сохранить')}
                        </button>
                        <button
                          onClick={() => {
                            setEditingAddress(false);
                            setAddressValue(currentOrder.delivery_address || '');
                          }}
                          className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 active:bg-gray-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 mb-3">
                        <div className="text-sm text-gray-900 leading-relaxed">
                          {currentOrder.delivery_address || (
                            <span className="text-gray-400 italic">{t('Адрес не указан')}</span>
                          )}
                        </div>
                      </div>
                      {currentOrder.delivery_address && (
                        <div className="grid grid-cols-2 gap-2">
                          <a 
                            href={openInMapsHref} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 active:bg-blue-200 text-sm font-medium transition-colors"
                          >
                            <MapPinned className="w-4 h-4" /> 
                            {t('Открыть')}
                          </a>
                          <button 
                            onClick={copyAddress} 
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 text-sm font-medium transition-colors"
                          >
                            <Copy className="w-4 h-4" /> 
                            {t('Копировать')}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </Section>

          {/* Оплата */}
          <Section title={t('Оплата')} icon={CreditCard}>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-xs text-gray-500">{t('Статус')}</span>
                <span className={`text-sm font-semibold ${
                  currentOrder.payment_status === 'paid' ? 'text-green-600' :
                  currentOrder.payment_status === 'partial' ? 'text-orange-600' : 'text-gray-600'
                }`}>
                  {currentOrder.payment_status === 'paid' && t('Оплачен')}
                  {currentOrder.payment_status === 'partial' && t('Частично')}
                  {(!currentOrder.payment_status || currentOrder.payment_status === 'unpaid') && t('Не оплачен')}
                </span>
              </div>
              
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{t('К оплате')}</span>
                  <span className="font-semibold text-gray-900">{money(totals.grand)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{t('Оплачено')}</span>
                  <span className={`font-medium ${currentOrder.payment_status === 'paid' ? 'text-green-600' : 'text-gray-600'}`}>
                    {money(currentOrder.payment_status === 'paid' ? totals.grand : 0)}
                  </span>
                </div>
              </div>
            </div>
          </Section>

          {/* Кнопки действий */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex gap-2">
              <button 
                onClick={() => router.push('/admin/store/orders')}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-sm font-medium transition-colors"
              >
                {t('← Назад')}
              </button>
              <button 
                onClick={() => window.print()} 
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-900 text-white hover:bg-black active:bg-gray-800 text-sm font-medium transition-colors"
              >
                <Printer className="w-4 h-4" /> 
                <span className="hidden sm:inline">{t('Печать')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Журнал на мобилке - внизу */}
        <div className="lg:hidden">
          <Section title={t('Журнал действий')} icon={Receipt}>
            {actionLog && actionLog.length > 0 ? (
              <ul className="space-y-4">
                {actionLog.map((log) => (
                  <li key={log.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 mb-1">
                          {log.description}
                        </div>
                        
                        {(log.action_type === 'status_changed' || 
                          log.action_type === 'delivery_address_updated' || 
                          log.action_type === 'delivery_method_updated') && (
                          <div className="space-y-1.5 mb-2">
                            {log.old_value && (
                              <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1.5 rounded-lg">
                                <span className="font-medium">{t('Было')}:</span> {log.old_value}
                              </div>
                            )}
                            {log.new_value && (
                              <div className="text-xs text-gray-700 bg-green-50 px-2 py-1.5 rounded-lg">
                                <span className="font-medium">{t('Стало')}:</span> {log.new_value}
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <span>
                            {log.user?.first_name && log.user?.last_name ? (
                              `${log.user.first_name} ${log.user.last_name}`
                            ) : (
                              log.user?.email || t('Система')
                            )}
                          </span>
                          <span>•</span>
                          <span>{formatDate(log.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-gray-400" />
                </div>
                <div className="text-sm text-gray-500">{t('Пока нет записей')}</div>
              </div>
            )}
          </Section>
        </div>
      </div>

      {/* Модалка подтверждения */}
      {confirm.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 max-w-md w-full shadow-xl animate-slide-up sm:animate-none">
            <div className="flex items-center justify-center w-14 h-14 bg-[#D77E6C]/10 rounded-full mb-4 mx-auto">
              <AlertTriangle className="w-7 h-7 text-[#D77E6C]" />
            </div>
            <h3 className="text-lg font-semibold text-center mb-2 text-gray-900">{confirm.title}</h3>
            <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed px-2">
              {t('Это действие изменит статус заказа и будет записано в журнал.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setConfirm({ open: false, to: null, title: '' })}
                className="sm:flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors order-2 sm:order-1"
              >
                {t('Отмена')}
              </button>
              <button
                onClick={applyStatusChange}
                disabled={loading}
                className="sm:flex-1 py-3 px-4 bg-[#D77E6C] hover:bg-[#C66B5A] active:bg-[#B65A48] text-white rounded-xl font-medium transition-colors disabled:opacity-50 order-1 sm:order-2"
              >
                {t('Подтвердить')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}