// src/app/admin/finance/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import TotalAmountCard from '@/components/finance/TotalAmountCard';
import PendingTransactionsTable from '@/components/finance/PendingTransactionsTable';
import PaymentHistoryTable from '@/components/finance/PaymentHistoryTable';

const FinanceTransactionsPage = () => {
  const router = useRouter();

  const [typeFilter, setTypeFilter] = useState('Все типы');
  const [periodFilter, setPeriodFilter] = useState('Все периоды');

  const currentDate = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

  const pendingTransactions = [
    { id: 1, name: 'Тәмірлан Смак',        amount: 84370,  date: '22-08-2025', transactionId: 'KZ848970', type: 'л. товарооборот', status: 'одобрить'  },
    { id: 2, name: 'Айгерім Нұрболатқызы', amount: 156420, date: '22-08-2025', transactionId: 'KZ849125', type: 'к. товарооборот', status: 'одобрить'  },
    { id: 3, name: 'Ерлан Серікбайұлы',   amount: 67890,  date: '22-08-2025', transactionId: 'KZ849247', type: 'за подписку',    status: 'отклонить' },
  ];

  const paymentHistory = [
    { id: 1, name: 'Әли Нысанбай',   amount: 213000, date: '22-08-2025', transactionId: 'KZ848970', type: 'за подписку',    status: 'блок'         },
    { id: 2, name: 'Тәмірлан Смак',  amount: 584370, date: '22-08-2025', transactionId: 'KZ848971', type: 'л. товарооборот', status: 'оплачен'      },
    { id: 3, name: 'Тәмірлан Смак',  amount: 84370,  date: '22-08-2025', transactionId: 'KZ848972', type: 'к. товарооборот', status: 'оплачен'      },
    { id: 4, name: 'Динара Қалиева', amount: 127650, date: '21-08-2025', transactionId: 'KZ848751', type: 'за подписку',    status: 'отклонен банком' },
  ];

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
      <MoreHeaderAD title="Финансовый отдел Tannur" />
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
              onView={(tx) => handleOpenUser(tx.name)}   // клик по «глазу»
              onRowUserClick={(tx) => handleOpenUser(tx.name)} // клик по строке/карточке
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
          onRowUserClick={(tx) => handleOpenUser(tx.name)} // клик по строке истории
        />
      </div>
    </div>
  );
};

export default FinanceTransactionsPage;
