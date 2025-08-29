'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import TotalAmountCard from '@/components/finance/TotalAmountCard';
import PendingTransactionsTable from '@/components/finance/PendingTransactionsTable';
import PaymentHistoryTable from '@/components/finance/PaymentHistoryTable';
import { useTranslate } from '@/hooks/useTranslate';

type TxBase = {
  id: number;
  name: string;
  amount: number;
  date: string;           // "DD-MM-YYYY"
  transactionId: string;  // e.g., "KZ848970"
  type: string;           // "л. товарооборот" | "к. товарооборот" | "за подписку"
  status: string;         // "одобрить" | "отклонить" | "блок" | "оплачен" | "отклонен банком"
};

const FinanceTransactionsPage = () => {
  const router = useRouter();
  const { t } = useTranslate();

  const [typeFilter, setTypeFilter] = useState<string>(t('Все типы'));
  const [periodFilter, setPeriodFilter] = useState<string>(t('Все периоды'));

  const currentDate = useMemo(
    () => new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }),
    []
  );

  // == МОКИ: оборачиваем ИМЕНА, ТИПЫ, СТАТУСЫ в t(...) ==
  const pendingTransactions: TxBase[] = useMemo(
    () => [
      {
        id: 1,
        name: t('Тәмірлан Смак'),
        amount: 84370,
        date: '22-08-2025',
        transactionId: 'KZ848970',
        type: t('л. товарооборот'),
        status: t('одобрить')
      },
      {
        id: 2,
        name: t('Айгерім Нұрболатқызы'),
        amount: 156420,
        date: '22-08-2025',
        transactionId: 'KZ849125',
        type: t('к. товарооборот'),
        status: t('одобрить')
      },
      {
        id: 3,
        name: t('Ерлан Серікбайұлы'),
        amount: 67890,
        date: '22-08-2025',
        transactionId: 'KZ849247',
        type: t('за подписку'),
        status: t('отклонить')
      }
    ],
    [t]
  );

  const paymentHistory: TxBase[] = useMemo(
    () => [
      {
        id: 1,
        name: t('Әли Нысанбай'),
        amount: 213000,
        date: '22-08-2025',
        transactionId: 'KZ848970',
        type: t('за подписку'),
        status: t('блок')
      },
      {
        id: 2,
        name: t('Тәмірлан Смак'),
        amount: 584370,
        date: '22-08-2025',
        transactionId: 'KZ848971',
        type: t('л. товарооборот'),
        status: t('оплачен')
      },
      {
        id: 3,
        name: t('Тәмірлан Смак'),
        amount: 84370,
        date: '22-08-2025',
        transactionId: 'KZ848972',
        type: t('к. товарооборот'),
        status: t('оплачен')
      },
      {
        id: 4,
        name: t('Динара Қалиева'),
        amount: 127650,
        date: '21-08-2025',
        transactionId: 'KZ848751',
        type: t('за подписку'),
        status: t('отклонен банком')
      }
    ],
    [t]
  );

  // === Навигация на страницу пользователя (без id) ===
  const handleOpenUser = (userName: string) => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('tannur_fin_user_name', userName);
      }
    } catch {}
    router.push('/admin/finance/user');
  };

  const handleApprove = (id: number) => { /* TODO: интеграция */ };
  const handleReject  = (id: number) => { /* TODO: интеграция */ };

  return (
    <div className="w-full h-full p-2 md:p-4 lg:p-6">
      <MoreHeaderAD title={t('Финансовый отдел Tannur')} />
      <div className="space-y-4 md:space-y-6 lg:space-y-8 mt-4 md:mt-6">
        {/* Верх: Общая сумма + На одобрение */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 lg:items-stretch">
          <div className="lg:col-span-1 lg:min-h-[400px]">
            <TotalAmountCard amount={84213000} />
          </div>
          <div className="lg:col-span-3 lg:min-h-[400px]">
            <PendingTransactionsTable
              transactions={pendingTransactions}
              currentDate={currentDate}
              onApprove={handleApprove}
              onReject={handleReject}
              onView={(tx) => handleOpenUser(tx.name)}              // клик по «глазу»
              onRowUserClick={(tx) => handleOpenUser(tx.name)}       // клик по строке/карточке
            />
          </div>
        </div>

        {/* Низ: История */}
        <PaymentHistoryTable
          payments={paymentHistory}
          typeFilter={typeFilter}
          periodFilter={periodFilter}
          onTypeChange={setTypeFilter}
          onPeriodChange={setPeriodFilter}
          onRowUserClick={(tx) => handleOpenUser(tx.name)}           // клик по строке истории
        />
      </div>
    </div>
  );
};

export default FinanceTransactionsPage;
