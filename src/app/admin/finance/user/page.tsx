// src/app/admin/finance/user/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import {
  ArrowLeft,
  User as UserIcon,
  Search,
  Eye,
  Check,
  X,
  Mail,
  Phone,
  TrendingUp,
  Clock,
  CreditCard,
  PlusCircle,
  Gift
} from 'lucide-react';
import { useTranslate } from '@/hooks/useTranslate';

/* ===== Типы ===== */
type TxType   = 'л. товарооборот' | 'к. товарооборот' | 'за подписку' | 'покупка';
type TxStatus = 'ожидает' | 'оплачен' | 'отклонён' | 'блок';

interface Tx {
  id: number;
  name: string;
  amount: number;
  date: string;            // DD-MM-YYYY
  transactionId: string;
  type: TxType;
  status: TxStatus;
  method?: string;
  payoutCard?: string;
  sourceLabel?: string;
}

interface UserInfo {
  name: string;
  phone: string;
  email: string;
  role: string;
  tariff: string;
  balance: number;
  blocked: boolean;
}

type LedgerKind = 'пополнение' | 'бонус';
interface LedgerEntry {
  id: number;
  name: string;
  date: string;     // DD-MM-YYYY
  kind: LedgerKind;
  amount: number;
  method: string;   // Kaspi QR / Halyk Card / Система
  source?: string;  // комментарий/источник
}

/* ===== Моки ===== */
const USERS: UserInfo[] = [
  { name: 'Тәмірлан Смак',        phone: '+7 707 666 77 88', email: 'temirlan@tannur.kz', role: 'Дилер',    tariff: 'Pro',  balance: 842130, blocked: false },
  { name: 'Айгерім Нұрболатқызы', phone: '+7 701 222 33 44', email: 'aigerim@tannur.kz',  role: 'Дилер',    tariff: 'Pro',  balance: 156420, blocked: false },
  { name: 'Ерлан Серікбайұлы',    phone: '+7 702 333 44 55', email: 'erlan@tannur.kz',    role: 'Менеджер', tariff: 'Pro',  balance: 67890,  blocked: false },
];

const PENDING_INIT: Tx[] = [
  {
    id: 1,
    name: 'Тәмірлан Смак',
    amount: 84370,
    date: '22-08-2025',
    transactionId: 'KZ848970',
    type: 'л. товарооборот',
    status: 'ожидает',
    method: 'Kaspi',
    payoutCard: 'Kaspi Gold **** 2311',
    sourceLabel: 'Личный товарооборот'
  },
  {
    id: 2,
    name: 'Айгерім Нұрболатқызы',
    amount: 156420,
    date: '22-08-2025',
    transactionId: 'KZ849125',
    type: 'к. товарооборот',
    status: 'ожидает',
    method: 'Halyk',
    payoutCard: 'Halyk Visa **** 8842',
    sourceLabel: 'Командный товарооборот'
  },
  {
    id: 3,
    name: 'Ерлан Серікбайұлы',
    amount: 67890,
    date: '22-08-2025',
    transactionId: 'KZ849247',
    type: 'за подписку',
    status: 'ожидает',
    method: 'Kaspi',
    payoutCard: 'Kaspi Red **** 1022',
    sourceLabel: 'Подписка'
  }
];

const HISTORY_INIT: Tx[] = [
  { id: 10, name: 'Тәмірлан Смак', amount: 584370, date: '22-08-2025', transactionId: 'KZ848971', type: 'л. товарооборот', status: 'оплачен',  method: 'Kaspi' },
  { id: 11, name: 'Тәмірлан Смак', amount: 84370,  date: '22-08-2025', transactionId: 'KZ848972', type: 'к. товарооборот', status: 'оплачен',  method: 'Kaspi' },
  { id: 12, name: 'Динара Қалиева',amount: 127650, date: '21-08-2025', transactionId: 'KZ848751', type: 'за подписку',     status: 'отклонён', method: 'Банк'  }
];

const LEDGER_INIT: LedgerEntry[] = [
  { id: 100, name: 'Тәмірлан Смак',        date: '20-08-2025', kind: 'пополнение', amount: 300000, method: 'Kaspi QR',      source: 'Карта KZ****2311' },
  { id: 101, name: 'Тәмірлан Смак',        date: '05-08-2025', kind: 'бонус',      amount: 15000,  method: 'Система',       source: 'Реферальный бонус' },
  { id: 102, name: 'Айгерім Нұрболатқызы', date: '18-08-2025', kind: 'пополнение', amount: 120000, method: 'Halyk Card',    source: '**** 8842' },
  { id: 103, name: 'Айгерім Нұрболатқызы', date: '02-08-2025', kind: 'бонус',      amount: 8000,   method: 'Система',       source: 'Промокод SUMMER' },
  { id: 104, name: 'Ерлан Серікбайұлы',    date: '15-08-2025', kind: 'пополнение', amount: 70000,  method: 'Kaspi Перевод', source: 'IBAN KZ**...247' }
];

/* ===== Хелперы ===== */
const money = (v:number)=>v.toLocaleString('ru-RU');
const parseDDMMYYYY = (s:string)=>{ const [d,m,y]=s.split('-').map(Number); return new Date(y,(m??1)-1,(d??1)).getTime(); };

const getStatusStyle = (s:TxStatus)=>{
  if (s==='оплачен') return 'text-green-700 bg-green-50 border-green-200';
  if (s==='отклонён') return 'text-red-700 bg-red-50 border-red-200';
  if (s==='блок')     return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-gray-700 bg-gray-50 border-gray-200';
};

const getTypeIcon = (type: TxType) => {
  if (type === 'л. товарооборот' || type === 'к. товарооборот') return TrendingUp;
  if (type === 'за подписку') return Clock;
  return CreditCard;
};

const Card = ({children, className='' }:{children:React.ReactNode; className?:string}) =>
  <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm ${className}`}>{children}</div>;

/* ===== Страница ===== */
export default function FinanceUserPage() {
  const { t } = useTranslate();

  const [userName, setUserName] = useState<string>(USERS[0].name);
  useEffect(()=>{
    try {
      const n = typeof window !== 'undefined' ? sessionStorage.getItem('tannur_fin_user_name') : null;
      if (n) setUserName(n);
    } catch {}
  },[]);
  const user = useMemo(()=> USERS.find(u=>u.name===userName) ?? USERS[0], [userName]);

  const [pending, setPending]   = useState<Tx[]>(PENDING_INIT);
  const [history, setHistory]   = useState<Tx[]>(HISTORY_INIT);
  const [ledger]                = useState<LedgerEntry[]>(LEDGER_INIT);

  const [search, setSearch] = useState('');
  const [selectedTx, setSelectedTx] = useState<Tx|null>(null);

  const allByUser = useMemo(
    () => [...pending, ...history].filter(t => t.name === user.name),
    [pending, history, user]
  );

  const sortedAll = useMemo(() => {
    const order = (s:TxStatus)=> s==='ожидает' ? 0 : 1;
    return [...allByUser].sort((a,b)=>{
      const st = order(a.status) - order(b.status);
      if (st !== 0) return st;
      return parseDDMMYYYY(b.date) - parseDDMMYYYY(a.date);
    });
  }, [allByUser]);

  const filtered = useMemo(()=>{
    if (!search.trim()) return sortedAll;
    const q = search.toLowerCase();
    return sortedAll.filter(t => t.transactionId.toLowerCase().includes(q));
  }, [sortedAll, search]);

  const waitingRows  = useMemo(()=> filtered.filter(t => t.status==='ожидает'), [filtered]);
  const paidRows     = useMemo(()=> filtered.filter(t => t.status==='оплачен'), [filtered]);
  const rejectedRows = useMemo(()=> filtered.filter(t => t.status!=='ожидает' && t.status!=='оплачен'), [filtered]);
  const flatRows     = useMemo(()=> [...waitingRows, ...paidRows, ...rejectedRows], [waitingRows, paidRows, rejectedRows]);

  const approve = (id:number)=>{
    setPending(prev=>{
      const tx = prev.find(t=>t.id===id); if (!tx) return prev;
      setHistory(h=>[{...tx, status:'оплачен'}, ...h]);
      return prev.filter(t=>t.id!==id);
    });
  };
  const reject = (id:number)=>{
    setPending(prev=>{
      const tx = prev.find(t=>t.id===id); if (!tx) return prev;
      setHistory(h=>[{...tx, status:'отклонён'}, ...h]);
      return prev.filter(t=>t.id!==id);
    });
  };

  const userLedger = useMemo(
    () => ledger.filter(l => l.name === user.name).sort((a,b)=>parseDDMMYYYY(b.date)-parseDDMMYYYY(a.date)),
    [ledger, user]
  );

  const displayUserName = t(user.name);
  return (
    <div className="w-full h-full p-2 md:p-4 lg:p-6 ">
      <MoreHeaderAD
        title={
          <div className="flex items-center gap-3">
            <Link href="/admin/finance" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
              <ArrowLeft size={18}/> {t('Назад')}
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">{t('Финансы пользователя')}</span>
          </div>
        }
        showBackButton={true}
      />

      <div className="space-y-6 mt-6">
        {/* ПРОФИЛЬ — брендовый блок */}
        <Card className="bg-gradient-to-r from-[#D77E6C] to-[#c66857] text-white border-0 shadow-md">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
                  <UserIcon className="text-white" size={20}/>
                </div>
                <div>
                  <div className="text-xl font-semibold">{displayUserName}</div>

                  <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-white/90">
                    <span className="inline-flex items-center gap-1">
                      <Phone size={14} className="text-white/80"/>{user.phone}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Mail size={14} className="text-white/80"/>{user.email}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <span className="px-2 py-1 rounded-full border border-white/25 bg-white/10 text-white">
                      {t(user.role)}
                    </span>
                    <span className="px-2 py-1 rounded-full border border-white/25 bg-white/15 text-white">
                      {t(user.tariff)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-white/80">{t('Баланс')}</div>
                <div className="text-2xl font-bold">{money(user.balance)} ₸</div>
              </div>
            </div>
          </div>
        </Card>

        {/* НА РАССМОТРЕНИИ */}
        <Card className="overflow-hidden">
          <div className="px-4 md:px-6 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-[#111] font-medium">{t('На рассмотрении')}</div>
              <div className="text-xs text-gray-500">{t('Всего заявок: {n}').replace('{n}', String(waitingRows.length))}</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-6 text-left">{t('Пользователь')}</th>
                  <th className="py-4 px-6 text-left">{t('Дата')}</th>
                  <th className="py-4 px-6 text-left">{t('ID Транзакции')}</th>
                  <th className="py-4 px-6 text-left">{t('Источник денег')}</th>
                  <th className="py-4 px-6 text-left">{t('Вывод на карту')}</th>
                  <th className="py-4 px-6 text-right">{t('Сумма')}</th>
                  <th className="py-4 px-6 text-center">{t('Действия')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {waitingRows.map(tx=>{
                  const displayName = t(tx.name);
                  const firstName = displayName.split(' ')[0];
                  return (
                    <tr key={`r_${tx.id}`} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">{displayName}</div>
                        <div className="text-xs text-gray-500">{t(tx.type)}</div>
                      </td>
                      <td className="py-4 px-6">{tx.date}</td>
                      <td className="py-4 px-6">
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded-md">{tx.transactionId}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-900">{tx.sourceLabel ? t(tx.sourceLabel) : '—'}</div>
                        <div className="text-xs text-gray-500">{tx.method ? t(tx.method) : ''}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-900">{tx.payoutCard ?? '—'}</div>
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-gray-900">{money(tx.amount)} ₸</td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-2">
                          <button
                            onClick={()=>approve(tx.id)}
                            className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg bg-[#2eb85c] text-white hover:bg-[#29a551] active:scale-[.98] w-full sm:w-auto"
                            title={t('Одобрить выплату для {name}').replace('{name}', displayName)}
                          >
                            <Check size={14}/> {t('Одобрить выплату')}
                          </button>
                          <button
                            onClick={()=>reject(tx.id)}
                            className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border border-red-200 text-red-700 hover:bg-red-50 active:scale-[.98] w-full sm:w-auto"
                            title={t('Отклонить выплату для {name}').replace('{name}', displayName)}
                          >
                            <X size={14}/> {t('Отклонить')}
                          </button>
                          <button
                            className="inline-flex items-center justify-center gap-2 px-2.5 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
                            title={t('Позвонить {name}').replace('{name}', displayName)}
                          >
                            <Phone size={14}/> {t('Позвонить')} {firstName}
                          </button>
                          <button
                            className="inline-flex items-center justify-center gap-2 px-2.5 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
                            title={t('Написать {name}').replace('{name}', displayName)}
                          >
                            <Mail size={14}/> {t('Написать')} {firstName}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!waitingRows.length && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">{t('Заявок нет.')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ТРАНЗАКЦИИ */}
        <Card className="overflow-hidden">
          <div className="px-4 md:px-6 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
            <div className="text-[#111] font-medium">{t('Транзакции')}</div>
            <div className="relative w-full max-w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('Поиск по ID…')}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#D77E6C] focus:border-transparent"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-6 text-left">{t('Транзакция')}</th>
                  <th className="py-4 px-6 text-left">{t('Тип')}</th>
                  <th className="py-4 px-6 text-right">{t('Сумма')}</th>
                  <th className="py-4 px-6 text-center">{t('Статус')}</th>
                  <th className="py-4 px-6 text-center">{t('Действия')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {flatRows.map(tx => {
                  const TypeIcon = getTypeIcon(tx.type);
                  return (
                    <tr key={`tx_${tx.id}`} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded-md">{tx.transactionId}</span>
                        <div className="text-xs text-gray-500 mt-1">{tx.date}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <TypeIcon size={14} className="text-gray-400"/>
                          <span className="text-sm text-gray-900">{t(tx.type)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-gray-900">{money(tx.amount)} ₸</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(tx.status)}`}>
                          {t(tx.status)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedTx(tx)}
                            className="p-1.5 text-gray-400 hover:text-[#D77E6C] hover:bg-[#D77E6C]/10 rounded-lg transition-colors"
                            title={t('Просмотр')}
                          >
                            <Eye size={16}/>
                          </button>
                          {tx.status === 'ожидает' && (
                            <>
                              <button
                                onClick={() => approve(tx.id)}
                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title={t('Одобрить выплату')}
                              >
                                <Check size={16}/>
                              </button>
                              <button
                                onClick={() => reject(tx.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title={t('Отклонить')}
                              >
                                <X size={16}/>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {flatRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="text-gray-400" size={24}/>
                        <div>{t('Нет транзакций')}</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ПОПОЛНЕНИЯ И БОНУСЫ */}
        <Card className="overflow-hidden">
          <div className="px-4 md:px-6 py-3 border-b border-gray-100">
            <div className="text-[#111] font-medium">{t('Пополнения баланса и бонусы')}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-6 text-left">{t('Дата')}</th>
                  <th className="py-4 px-6 text-left">{t('Операция')}</th>
                  <th className="py-4 px-6 text-right">{t('Сумма')}</th>
                  <th className="py-4 px-6 text-left">{t('Метод')}</th>
                  <th className="py-4 px-6 text-left">{t('Источник')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {userLedger.map((e)=>(
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">{e.date}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-2">
                        {e.kind === 'пополнение' ? <PlusCircle size={16} className="text-blue-600"/> : <Gift size={16} className="text-purple-600"/>}
                        <span className="text-sm text-gray-900">
                          {e.kind === 'пополнение' ? t('Пополнение баланса') : t('Бонус')}
                        </span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-gray-900">{money(e.amount)} ₸</td>
                    <td className="py-4 px-6">{t(e.method)}</td>
                    <td className="py-4 px-6">{e.source ? t(e.source) : '—'}</td>
                  </tr>
                ))}
                {userLedger.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-500">{t('Записей нет.')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Сайд-панель деталей */}
      {selectedTx && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedTx(null)} />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div className="text-lg font-semibold text-gray-900">{t('Детали транзакции')}</div>
              <button onClick={() => setSelectedTx(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">{t('ID Транзакции')}</div>
                <div className="font-mono text-lg font-semibold text-gray-900">{selectedTx.transactionId}</div>
              </div>

              <div className="bg-white border rounded-xl p-4 text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">{t('Сумма')}</div>
                <div className="text-2xl font-bold text-gray-900">{money(selectedTx.amount)} ₸</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border rounded-xl p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">{t('Тип')}</div>
                  <div className="font-medium text-gray-900">{t(selectedTx.type)}</div>
                </div>
                <div className="bg-white border rounded-xl p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">{t('Метод')}</div>
                  <div className="font-medium text-gray-900">{selectedTx.method ? t(selectedTx.method) : '—'}</div>
                </div>
                {selectedTx.payoutCard && (
                  <div className="bg-white border rounded-xl p-4 col-span-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">{t('Вывод на карту')}</div>
                    <div className="font-medium text-gray-900">{selectedTx.payoutCard}</div>
                  </div>
                )}
                {selectedTx.sourceLabel && (
                  <div className="bg-white border rounded-xl p-4 col-span-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">{t('Источник денег')}</div>
                    <div className="font-medium text-gray-900">{t(selectedTx.sourceLabel)}</div>
                  </div>
                )}
              </div>

              <div className="bg-white border rounded-xl p-4 text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">{t('Статус')}</div>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusStyle(selectedTx.status)}`}>
                  {t(selectedTx.status)}
                </span>
              </div>

              {selectedTx.status === 'ожидает' && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { approve(selectedTx.id); setSelectedTx(null); }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2eb85c] text-white hover:bg-[#29a551] active:scale-[.98]"
                  >
                    <Check size={16}/> {t('Одобрить выплату')}
                  </button>
                  <button
                    onClick={() => { reject(selectedTx.id); setSelectedTx(null); }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 active:scale-[.98]"
                  >
                    <X size={16}/> {t('Отклонить')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
