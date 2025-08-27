// src/app/admin/finance/user/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import {
  ArrowLeft, User as UserIcon, Wallet, CreditCard, Calendar,
  Check, X, Eye, Search, Filter, ChevronDown, Shield
} from 'lucide-react';

/* ===================== Типы ===================== */
type TxType = 'л. товарооборот' | 'к. товарооборот' | 'за подписку' | 'покупка';
type TxStatus = 'ожидает' | 'оплачен' | 'отклонён' | 'блок';

interface Transaction {
  id: number;
  userId: number;
  name: string;
  amount: number;
  date: string;         // DD-MM-YYYY
  transactionId: string;
  type: TxType;
  method?: string;
  status: TxStatus;
}

interface User {
  id: number;
  name: string;
  phone: string;
  email: string;
  role: string;
  tariff: string;
  joinDate: string;
  balance: number;
  blocked: boolean;
}

/* ===================== Моки ===================== */
const USERS: User[] = [
  { id: 101, name: 'Әли Нысанбай', phone: '+7 700 111 22 33', email: 'ali@tannur.kz', role: 'Дилер', tariff: 'Base', joinDate: '05-02-2024', balance: 213000, blocked: false },
  { id: 102, name: 'Айгерім Нұрболатқызы', phone: '+7 701 222 33 44', email: 'aigerim@tannur.kz', role: 'Дилер', tariff: 'Pro',  joinDate: '19-05-2024', balance: 156420, blocked: false },
  { id: 103, name: 'Ерлан Серікбайұлы',   phone: '+7 702 333 44 55', email: 'erlan@tannur.kz', role: 'Менеджер', tariff: 'Pro', joinDate: '11-09-2024', balance: 67890,  blocked: false },
  { id: 104, name: 'Динара Қалиева',       phone: '+7 705 444 55 66', email: 'dinara@tannur.kz', role: 'Дилер', tariff: 'Base', joinDate: '21-01-2025', balance: 127650, blocked: false },
  { id: 105, name: 'Сыймова Мариям',       phone: '+7 706 555 66 77', email: 'mariyam@tannur.kz', role: 'Куратор', tariff: 'Pro', joinDate: '04-03-2025', balance: 412300, blocked: false },
  { id: 106, name: 'Тәмірлан Смак',        phone: '+7 707 666 77 88', email: 'temirlan@tannur.kz', role: 'Дилер', tariff: 'Pro', joinDate: '12-03-2024', balance: 842130, blocked: false },
];

const PENDING_ALL_INIT: Transaction[] = [
  { id: 1,  userId: 106, name: 'Тәмірлан Смак',        amount: 84370,  date: '22-08-2025', transactionId: 'KZ848970', type: 'л. товарооборот', status: 'ожидает', method: 'Kaspi' },
  { id: 2,  userId: 102, name: 'Айгерім Нұрболатқызы', amount: 156420, date: '22-08-2025', transactionId: 'KZ849125', type: 'к. товарооборот', status: 'ожидает', method: 'Halyk' },
  { id: 3,  userId: 103, name: 'Ерлан Серікбайұлы',   amount: 67890,  date: '22-08-2025', transactionId: 'KZ849247', type: 'за подписку',    status: 'ожидает', method: 'Kaspi' },
];

const HISTORY_ALL_INIT: Transaction[] = [
  { id: 11, userId: 101, name: 'Әли Нысанбай',   amount: 213000, date: '22-08-2025', transactionId: 'KZ848970', type: 'за подписку',    status: 'блок',     method: 'Банк' },
  { id: 12, userId: 106, name: 'Тәмірлан Смак',  amount: 584370, date: '22-08-2025', transactionId: 'KZ848971', type: 'л. товарооборот', status: 'оплачен', method: 'Kaspi' },
  { id: 13, userId: 106, name: 'Тәмірлан Смак',  amount: 84370,  date: '22-08-2025', transactionId: 'KZ848972', type: 'к. товарооборот', status: 'оплачен', method: 'Kaspi' },
  { id: 14, userId: 104, name: 'Динара Қалиева', amount: 127650, date: '21-08-2025', transactionId: 'KZ848751', type: 'за подписку',    status: 'отклонён', method: 'Банк' },
];

const PURCHASES_ALL_INIT: Transaction[] = [
  { id: 21, userId: 106, name: 'Тәмірлан Смак', amount: 49990, date: '17-08-2025', transactionId: 'ORD-9921', type: 'покупка', status: 'оплачен', method: 'Kaspi' },
  { id: 22, userId: 101, name: 'Әли Нысанбай',  amount: 22490, date: '03-08-2025', transactionId: 'ORD-9734', type: 'покупка', status: 'оплачен', method: 'Card' },
];

/* ===================== Хелперы ===================== */
const money = (v: number) => v.toLocaleString('ru-RU');
const parseDDMMYYYY = (s: string) => {
  const [dd, mm, yyyy] = s.split('-').map(Number);
  return new Date(yyyy, (mm ?? 1) - 1, dd ?? 1).getTime();
};

/* ===================== Мелкие компоненты ===================== */
function StatBadge({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 border">
      <div className="flex items-center gap-2">
        <Icon size={18} />
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <span className="font-semibold text-[#111]">{value}</span>
    </div>
  );
}

function StickyTable({
  title,
  rows,
  emptyText,
  actions,
}: {
  title: string;
  rows: React.ReactNode[];
  emptyText: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="font-medium text-[#111]">{title}</div>
        {actions}
      </div>
      <div className="max-h-[420px] overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="text-xs text-gray-500">
              <th className="py-3 px-4 text-left">Дата</th>
              <th className="py-3 px-4 text-left">Транзакция</th>
              <th className="py-3 px-4 text-left">Тип</th>
              <th className="py-3 px-4 text-center">Сумма</th>
              <th className="py-3 px-4 text-left">Метод</th>
              <th className="py-3 px-4 text-center">Статус</th>
              <th className="py-3 px-4 text-center">Действия</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? rows : (
              <tr>
                <td colSpan={7} className="py-6 text-center text-gray-400">{emptyText}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===================== Страница ===================== */
export default function FinanceUserTemplatePage() {
  // Глобальные состояния моков (как будто БД)
  const [pendingAll, setPendingAll]   = useState<Transaction[]>(PENDING_ALL_INIT);
  const [historyAll, setHistoryAll]   = useState<Transaction[]>(HISTORY_ALL_INIT);
  const [purchasesAll]                = useState<Transaction[]>(PURCHASES_ALL_INIT);

  // Выбранный пользователь (без маршрута с [id])
  const [selectedUserId, setSelectedUserId] = useState<number>(USERS[USERS.length - 1].id); // по умолчанию Тәмірлан
  const selectedUser = useMemo(() => USERS.find(u => u.id === selectedUserId)!, [selectedUserId]);

  // Фильтры
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'Все' | TxType>('Все');
  const [periodFilter, setPeriodFilter] = useState<'Все' | '7д' | '30д' | '90д'>('Все');

  // Детальная панель
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Применение фильтров к любому списку
  const applyFilters = (list: Transaction[]) => {
    let res = list.filter(r => r.userId === selectedUserId);
    if (typeFilter !== 'Все') res = res.filter(r => r.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(r => r.transactionId.toLowerCase().includes(q) || r.name.toLowerCase().includes(q));
    }
    if (periodFilter !== 'Все') {
      const now = Date.now();
      const days = periodFilter === '7д' ? 7 : periodFilter === '30д' ? 30 : 90;
      const from = now - days * 24 * 60 * 60 * 1000;
      res = res.filter(r => parseDDMMYYYY(r.date) >= from);
    }
    return res;
  };

  const filteredPending   = useMemo(() => applyFilters(pendingAll), [pendingAll, selectedUserId, search, typeFilter, periodFilter]);
  const filteredHistory   = useMemo(() => applyFilters(historyAll), [historyAll, selectedUserId, search, typeFilter, periodFilter]);
  const filteredPurchases = useMemo(() => applyFilters(purchasesAll), [purchasesAll, selectedUserId, search, typeFilter, periodFilter]);

  // Действия
  const approveTx = (id: number) => {
    setPendingAll(prev => {
      const tx = prev.find(t => t.id === id);
      if (!tx) return prev;
      setHistoryAll(h => [{ ...tx, status: 'оплачен' }, ...h]);
      return prev.filter(t => t.id !== id);
    });
  };

  const rejectTx = (id: number) => {
    setPendingAll(prev => {
      const tx = prev.find(t => t.id === id);
      if (!tx) return prev;
      setHistoryAll(h => [{ ...tx, status: 'отклонён' }, ...h]);
      return prev.filter(t => t.id !== id);
    });
  };

  const currentDate = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

  return (
    <div className="w-full h-full p-2 md:p-4 lg:p-6">
      <MoreHeaderAD
        title={
          <div className="flex items-center gap-2">
            <Link href="/admin/finance" className="inline-flex items-center gap-1 text-gray-500 hover:text-[#111]">
              <ArrowLeft size={18} /> Назад
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-[#111]">Профиль пользователя — Финансовый отдел</span>
          </div>
        }
      />

      <div className="mt-4 grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Левая колонка: список пользователей */}
        <aside className="xl:col-span-4">
          <div className="bg-white rounded-2xl border overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="font-medium text-[#111]">Пользователи</div>
              <div className="text-xs text-gray-500">{USERS.length}</div>
            </div>

            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} />
                <input
                  placeholder="Поиск по имени…"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border"
                  onChange={(e) => {
                    const q = e.target.value.toLowerCase();
                    const found = USERS.find(u => u.name.toLowerCase().includes(q));
                    if (found) setSelectedUserId(found.id);
                  }}
                />
              </div>
            </div>

            <div className="max-h-[520px] overflow-y-auto">
              {USERS.map((u) => {
                const isActive = u.id === selectedUserId;
                return (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className={`w-full text-left px-4 py-3 border-t first:border-t-0 hover:bg-gray-50 ${isActive ? 'bg-gray-50' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserIcon size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-[#111]">{u.name}</div>
                        <div className="text-xs text-gray-500">ID: {u.id} · {u.role} · {u.tariff}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{money(u.balance)} ₸</div>
                        <div className={`text-[11px] ${u.blocked ? 'text-red-600' : 'text-green-600'}`}>
                          {u.blocked ? 'Блок' : 'Активен'}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Правая колонка: профиль и таблицы */}
        <section className="xl:col-span-8 space-y-4">
          {/* Профиль */}
          <div className="bg-white rounded-2xl border p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserIcon />
                </div>
                <div>
                  <div className="text-lg font-semibold text-[#111]">{selectedUser.name}</div>
                  <div className="text-sm text-gray-500">ID: {selectedUser.id} · Роль: {selectedUser.role} · Тариф: {selectedUser.tariff}</div>
                  <div className="text-xs text-gray-400">В системе с {selectedUser.joinDate}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full md:w-auto">
                <StatBadge label="Баланс"  value={`${money(selectedUser.balance)} ₸`} icon={Wallet} />
                <StatBadge label="Период"  value={currentDate} icon={Calendar} />
                <StatBadge label="Статус"  value={selectedUser.blocked ? 'Заблокирован' : 'Активен'} icon={Shield} />
                <StatBadge label="Контакты" value="Показать" icon={UserIcon} />
              </div>
            </div>

            {/* Фильтры */}
            <div className="mt-4 flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск по ID транзакции или имени…"
                  className="w-full pl-10 pr-3 py-2 rounded-xl border"
                />
              </div>

              <div className="flex items-center gap-2">
                <button className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border">
                  <Filter size={16} /> Фильтр
                </button>

                <div className="relative">
                  <button className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border">
                    Тип <ChevronDown size={16} />
                  </button>
                  <select
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                  >
                    <option value="Все">Все типы</option>
                    <option value="л. товарооборот">Личный товарооборот</option>
                    <option value="к. товарооборот">Командный товарооборот</option>
                    <option value="за подписку">Подписка</option>
                    <option value="покупка">Покупки</option>
                  </select>
                </div>

                <div className="relative">
                  <button className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border">
                    Период <ChevronDown size={16} />
                  </button>
                  <select
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    value={periodFilter}
                    onChange={(e) => setPeriodFilter(e.target.value as any)}
                  >
                    <option value="Все">Все периоды</option>
                    <option value="7д">За 7 дней</option>
                    <option value="30д">За 30 дней</option>
                    <option value="90д">За 90 дней</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Таблицы */}
          <StickyTable
            title="Запросы на одобрение"
            actions={<div className="text-xs text-gray-500">Всего: {filteredPending.length}</div>}
            rows={filteredPending.map((tx) => (
              <tr key={tx.id} className="border-b last:border-0">
                <td className="py-3 px-4">{tx.date}</td>
                <td className="py-3 px-4">{tx.transactionId}</td>
                <td className="py-3 px-4">{tx.type}</td>
                <td className="py-3 px-4 text-center font-semibold">{money(tx.amount)} ₸</td>
                <td className="py-3 px-4">{tx.method ?? '-'}</td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex rounded-full border px-2 py-0.5 text-xs">ожидает</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="inline-flex gap-2">
                    <button onClick={() => setSelectedTx(tx)} className="rounded-lg border px-2 py-1 hover:bg-gray-50" title="Просмотр">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => approveTx(tx.id)} className="rounded-lg border px-2 py-1 hover:bg-gray-50" title="Одобрить">
                      <Check size={16} />
                    </button>
                    <button onClick={() => rejectTx(tx.id)} className="rounded-lg border px-2 py-1 hover:bg-gray-50" title="Отклонить">
                      <X size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            emptyText="Нет запросов."
          />

          <StickyTable
            title="История выплат"
            actions={<div className="text-xs text-gray-500">Всего: {filteredHistory.length}</div>}
            rows={filteredHistory.map((tx) => (
              <tr key={tx.id} className="border-b last:border-0">
                <td className="py-3 px-4">{tx.date}</td>
                <td className="py-3 px-4">{tx.transactionId}</td>
                <td className="py-3 px-4">{tx.type}</td>
                <td className="py-3 px-4 text-center font-semibold">{money(tx.amount)} ₸</td>
                <td className="py-3 px-4">{tx.method ?? '-'}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${
                    tx.status === 'оплачен' ? 'text-green-700' : tx.status === 'отклонён' ? 'text-red-600' : 'text-gray-700'
                  }`}>{tx.status}</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <button onClick={() => setSelectedTx(tx)} className="rounded-lg border px-2 py-1 hover:bg-gray-50" title="Просмотр">
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
            emptyText="История пуста."
          />

          <StickyTable
            title="Покупки пользователя"
            actions={<div className="text-xs text-gray-500">Всего: {filteredPurchases.length}</div>}
            rows={filteredPurchases.map((tx) => (
              <tr key={tx.id} className="border-b last:border-0">
                <td className="py-3 px-4">{tx.date}</td>
                <td className="py-3 px-4">{tx.transactionId}</td>
                <td className="py-3 px-4">{tx.type}</td>
                <td className="py-3 px-4 text-center font-semibold">{money(tx.amount)} ₸</td>
                <td className="py-3 px-4">{tx.method ?? '-'}</td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex rounded-full border px-2 py-0.5 text-xs">оплачен</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <button onClick={() => setSelectedTx(tx)} className="rounded-lg border px-2 py-1 hover:bg-gray-50" title="Просмотр">
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
            emptyText="Покупок нет."
          />
        </section>
      </div>

      {/* Детали транзакции (сайдпанель) */}
      {selectedTx && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedTx(null)} />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-white shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold text-[#111]">Транзакция {selectedTx.transactionId}</div>
              <button onClick={() => setSelectedTx(null)} className="rounded-xl border px-3 py-1">Закрыть</button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between"><span className="text-gray-500">Дата</span><span className="font-medium">{selectedTx.date}</span></div>
              <div className="flex items-center justify-between"><span className="text-gray-500">Пользователь</span><span className="font-medium">{selectedTx.name}</span></div>
              <div className="flex items-center justify-between"><span className="text-gray-500">Сумма</span><span className="font-semibold">{money(selectedTx.amount)} ₸</span></div>
              <div className="flex items-center justify-between"><span className="text-gray-500">Тип</span><span className="font-medium">{selectedTx.type}</span></div>
              <div className="flex items-center justify-between"><span className="text-gray-500">Метод</span><span className="font-medium">{selectedTx.method ?? '-'}</span></div>
              <div className="flex items-center justify-between"><span className="text-gray-500">Статус</span><span className="font-medium">{selectedTx.status}</span></div>
            </div>

            {selectedTx.status === 'ожидает' && (
              <div className="mt-6 grid grid-cols-2 gap-2">
                <button onClick={() => { approveTx(selectedTx.id); setSelectedTx(null); }} className="inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 hover:bg-gray-50">
                  <Check size={16} /> Одобрить
                </button>
                <button onClick={() => { rejectTx(selectedTx.id); setSelectedTx(null); }} className="inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 hover:bg-gray-50">
                  <X size={16} /> Отклонить
                </button>
              </div>
            )}

            <div className="mt-6">
              <div className="text-sm text-gray-500 mb-2">Комментарий (внутренний)</div>
              <textarea className="w-full rounded-xl border p-3 min-h-[120px]" placeholder="Добавить заметку по транзакции…" />
              <div className="mt-3 flex justify-end">
                <button onClick={() => {}} className="rounded-xl border px-3 py-2 hover:bg-gray-50">Сохранить</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
