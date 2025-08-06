// Создаём 3 отдельных компонента по структуре твоего кода:
// 1. TotalAmountCard => TotalAmountCard.tsx
// 2. PendingTransactionsTable => PendingTransactionsTable.tsx
// 3. PaymentHistoryTable => PaymentHistoryTable.tsx

// Папка: src/components/finance

// === 1. TotalAmountCard.tsx ===
// путь: src/components/finance/TotalAmountCard.tsx

'use client';
import React, { useState } from 'react';
import { Wallet, ChevronDown, Calendar, ArrowUpRight } from 'lucide-react';

const TotalAmountCard = ({ amount = 152500000 }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('За все время');
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const periodOptions = ['За все время', 'За год', 'Кастомный период'];

  const handlePeriodChange = (e) => {
    const value = e.target.value;
    setSelectedPeriod(value);
    setShowCustomPicker(value === 'Кастомный период');
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-red-100 via-orange-50 to-amber-50 rounded-3xl blur-xl opacity-40"></div>
      <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center" style={{background: 'linear-gradient(135deg, #D77E6C 0%, #E8967A 100%)'}}>
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Общая сумма</h2>
              <p className="text-sm text-gray-500">Ваш текущий баланс</p>
            </div>
          </div>
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={handlePeriodChange}
              className="appearance-none bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:bg-gray-100/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent cursor-pointer"
            >
              {periodOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {showCustomPicker && (
          <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl border border-gray-200/50">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Выберите период</span>
            </div>
            <div className="flex space-x-3">
              <input type="date" className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-200" />
              <input type="date" className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-200" />
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="text-5xl font-black bg-gradient-to-r from-gray-900 via-red-700 to-orange-600 bg-clip-text text-transparent mb-2">
            {amount.toLocaleString()} ₸
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="flex items-center px-3 py-1 bg-emerald-100 rounded-full">
              <ArrowUpRight className="h-3 w-3 text-emerald-600 mr-1" />
              <span className="text-xs font-semibold text-emerald-600">+12.5%</span>
            </div>
            <span className="text-sm text-gray-500">по сравнению с прошлым периодом</span>
          </div>
        </div>

        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-red-200 to-orange-200 rounded-full opacity-20 blur-2xl"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-orange-200 to-amber-200 rounded-full opacity-20 blur-xl"></div>
      </div>
    </div>
  );
};

export default TotalAmountCard;
