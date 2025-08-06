'use client';
import React, { useState } from 'react';
import TotalAmountCard from './TotalAmountCard';
import PendingTransactionsTable from './PendingTransactionsTable';
import PaymentHistoryTable from './PaymentHistoryTable';

const FinanceTabs = () => {
  const [typeFilter, setTypeFilter] = useState('Все типы');
  const [periodFilter, setPeriodFilter] = useState('Все периоды');

  const currentDate = new Date().toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'long' 
  });

  const pendingTransactions = [
    {
      id: 1,
      name: 'Тәмірлан Смак',
      amount: 84370,
      date: '22-08-2025',
      transactionId: 'KZ848970',
      type: 'л. товарооборот',
      status: 'одобрить'
    },
    {
      id: 2,
      name: 'Айгерім Нұрболатқызы',
      amount: 156420,
      date: '22-08-2025',
      transactionId: 'KZ849125',
      type: 'к. товарооборот',
      status: 'одобрить'
    },
    {
      id: 3,
      name: 'Ерлан Серікбайұлы',
      amount: 67890,
      date: '22-08-2025',
      transactionId: 'KZ849247',
      type: 'за подписку',
      status: 'отклонить'
    }
  ];

  const paymentHistory = [
    {
      id: 1,
      name: 'Әли Нысанбай',
      amount: 213000,
      date: '22-08-2025',
      transactionId: 'KZ848970',
      type: 'за подписку',
      status: 'блок'
    },
    {
      id: 2,
      name: 'Тәмірлан Смак',
      amount: 584370,
      date: '22-08-2025',
      transactionId: 'KZ848970',
      type: 'л. товарооборот',
      status: 'оплачен'
    },
    {
      id: 3,
      name: 'Тәмірлан Смак',
      amount: 84370,
      date: '22-08-2025',
      transactionId: 'KZ848970',
      type: 'к. товарооборот',
      status: 'оплачен'
    },
    {
      id: 4,
      name: 'Динара Қалиева',
      amount: 127650,
      date: '21-08-2025',
      transactionId: 'KZ848751',
      type: 'за подписку',
      status: 'отклонен банком'
    }
  ];

  const handleApprove = (id: number) => {
    console.log(`Одобрить транзакцию ${id}`);
  };

  const handleReject = (id: number) => {
    console.log(`Отклонить транзакцию ${id}`);
  };

  const handleView = (id: number) => {
    console.log(`Просмотр транзакции ${id}`);
  };

  return (
    <div className="space-y-8 mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <TotalAmountCard amount={84213000} />
        </div>
        <div className="lg:col-span-3">
          <PendingTransactionsTable
            transactions={pendingTransactions}
            onApprove={handleApprove}
            onReject={handleReject}
            onView={handleView}
            currentDate={currentDate}
          />
        </div>
      </div>

      <PaymentHistoryTable
        payments={paymentHistory}
        typeFilter={typeFilter}
        periodFilter={periodFilter}
        onTypeChange={setTypeFilter}
        onPeriodChange={setPeriodFilter}
      />
    </div>
  );
};

export default FinanceTabs;
