'use client';
import React, { useState } from 'react';
import { Wallet, ChevronDown, Calendar, ArrowUpRight } from 'lucide-react';
import { useTranslate } from '@/hooks/useTranslate';

const TotalAmountCard = ({ amount = 152500000 }) => {
  const { t } = useTranslate();

  const [selectedPeriod, setSelectedPeriod] = useState('За все время');
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  // Русские ключи остаются source of truth — сравнения не ломаем
  const periodOptions = ['За все время', 'За год', 'Кастомный период'];

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedPeriod(value);
    setShowCustomPicker(value === 'Кастомный период');
  };

  return (
    <div className="relative h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-red-100 via-orange-50 to-amber-50 rounded-2xl md:rounded-3xl blur-xl opacity-40"></div>
      <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 sm:p-5 lg:p-6 xl:p-8 border border-white/50 shadow h-full flex flex-col">
        {/* Заголовок с адаптивной кнопкой */}
        <div className="flex flex-col gap-3 mb-4 lg:mb-6">
          {/* Верхняя часть с иконкой и заголовком */}
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #D77E6C 0%, #E8967A 100%)' }}
            >
              <Wallet className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base lg:text-lg font-bold text-gray-900 truncate">{t('Общая сумма')}</h2>
              <p className="text-xs lg:text-sm text-gray-500 truncate">{t('Ваш текущий баланс')}</p>
            </div>
          </div>

          {/* Селектор периода - отдельная строка */}
          <div className="relative w-full">
            <select
              value={selectedPeriod}
              onChange={handlePeriodChange}
              className="w-full appearance-none bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-lg lg:rounded-xl px-3 py-1.5 lg:px-4 lg:py-2 pr-8 lg:pr-10 text-xs lg:text-sm font-medium text-gray-700 hover:bg-gray-100/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent cursor-pointer truncate"
            >
              {periodOptions.map((option) => (
                <option key={option} value={option}>
                  {t(option)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 lg:right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 lg:h-4 lg:w-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {showCustomPicker && (
          <div className="mb-4 lg:mb-6 p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl lg:rounded-2xl border border-gray-200/50">
            <div className="flex items-center gap-2 mb-2 lg:mb-3">
              <Calendar className="h-3 w-3 lg:h-4 lg:w-4 text-gray-500" />
              <span className="text-xs lg:text-sm font-medium text-gray-700">{t('Выберите период')}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                type="date"
                className="flex-1 bg-white border border-gray-200 rounded-lg lg:rounded-xl px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-200"
              />
              <input
                type="date"
                className="flex-1 bg-white border border-gray-200 rounded-lg lg:rounded-xl px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        )}

        {/* Центральная часть с суммой */}
        <div className="flex-1 flex flex-col justify-center text-center py-2 lg:py-4 xl:py-8">
          <div className="font-black bg-gradient-to-r from-gray-900 via-red-700 to-orange-600 bg-clip-text text-transparent mb-2 lg:mb-4">
            <span className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl 2xl:text-5xl block">
              {amount.toLocaleString()} ₸
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
            <div className="flex items-center px-2 py-0.5 lg:px-3 lg:py-1 bg-emerald-100 rounded-full">
              <ArrowUpRight className="h-2.5 w-2.5 lg:h-3 lg:w-3 text-emerald-600 mr-0.5 lg:mr-1" />
              <span className="text-[10px] lg:text-xs font-semibold text-emerald-600">+12.5%</span>
            </div>
            <span className="text-[10px] xs:text-xs lg:text-sm text-gray-500 text-center">
              {t('по сравнению с прошлым периодом')}
            </span>
          </div>
        </div>

        {/* Декоративные элементы */}
        <div className="absolute top-4 right-4 w-12 h-12 lg:w-20 lg:h-20 bg-gradient-to-br from-red-200 to-orange-200 rounded-full opacity-20 blur-2xl"></div>
        <div className="absolute bottom-4 left-4 w-10 h-10 lg:w-16 lg:h-16 bg-gradient-to-br from-orange-200 to-amber-200 rounded-full opacity-20 blur-xl"></div>
      </div>
    </div>
  );
};

export default TotalAmountCard;
