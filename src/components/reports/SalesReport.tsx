"use client";

import React, { useState } from "react";
// Import Lucide icons
import { TrendingUp, Download, CalendarDays, XCircle, CheckCircle2 } from 'lucide-react';

export type Period = "all" | "last6" | "thisYear" | "prevYear";

interface Sale {
  avatar: string;
  client: string;
  product: string;
  date: string;
  id: string;
  amount: string;
  status: 'Успешно' | 'Отмена';
}

const sampleSales: Sale[] = [
  {
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sergey',
    client: 'Сергей Сергеев',
    product: 'Product X',
    date: '10-07-2025',
    id: 'SL98765',
    amount: '20 000₸',
    status: 'Успешно',
  },
  {
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
    client: 'Елена Еленова',
    product: 'Product Y',
    date: '05-07-2025',
    id: 'SL98766',
    amount: '12 500₸',
    status: 'Отмена',
  },
  {
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dmitry',
    client: 'Дмитрий Дмитриев',
    product: 'Product Z',
    date: '03-07-2025',
    id: 'SL98767',
    amount: '35 000₸',
    status: 'Успешно',
  },
  {
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
    client: 'Анна Аннова',
    product: 'Product A',
    date: '01-07-2025',
    id: 'SL98768',
    amount: '18 000₸',
    status: 'Успешно',
  },
];

interface SalesReportProps {
  period?: Period;
  onPeriodChange?: (period: Period) => void;
}

const periodOptions = [
  { value: "all", label: "За всё время" },
  { value: "last6", label: "6 месяцев" },
  { value: "thisYear", label: "Текущий год" },
  { value: "prevYear", label: "Прошлый год" },
];

// Мобильная карточка продажи
const MobileSaleCard = ({ sale }: { sale: Sale }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <img
          src={sale.avatar}
          alt={sale.client}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-medium text-sm">{sale.client}</p>
          <p className="text-xs text-gray-500">{sale.product}</p>
        </div>
      </div>
      {sale.status === 'Успешно' ? (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="w-3 h-3 text-green-500" /> {/* Lucide CheckCircle2 */}
          <span className="text-xs font-medium text-green-700">Успешно</span>
        </div>
      ) : (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 rounded-lg">
          <XCircle className="w-3 h-3 text-red-500" /> {/* Lucide XCircle */}
          <span className="text-xs font-medium text-red-700">Отмена</span>
        </div>
      )}
    </div>
    
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">ID</span>
        <span className="font-mono">{sale.id}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">Дата</span>
        <span>{sale.date}</span>
      </div>
      <div className="flex justify-between items-center pt-2 border-t">
        <span className="text-xs text-gray-500">Сумма</span>
        <span className="font-semibold text-base">{sale.amount}</span>
      </div>
    </div>
  </div>
);

export default function SalesReport({ 
  period = "all", 
  onPeriodChange = () => {} 
}: SalesReportProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  
  const handlePeriodChange = (newPeriod: Period) => {
    setSelectedPeriod(newPeriod);
    onPeriodChange(newPeriod);
  };

  // Расчет общей суммы
  const totalAmount = sampleSales
    .filter(s => s.status === 'Успешно')
    .reduce((sum, s) => sum + parseInt(s.amount.replace(/[^\d]/g, '')), 0);

  return (
    <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-4 md:p-6">
      {/* Шапка */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#D77E6C]/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-[#D77E6C]" /> {/* Lucide TrendingUp */}
            </div>
            <h3 className="text-xl md:text-2xl font-medium text-gray-900">
              Отчет по продажам
            </h3>
          </div>
          <p className="text-gray-600 text-sm">
            Аналитика успешных продаж
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">Общая сумма</p>
            <p className="text-lg md:text-xl font-bold text-[#D77E6C]">
              {totalAmount.toLocaleString('ru-KZ')}₸
            </p>
          </div>
          <button className="flex items-center justify-center gap-2 bg-[#D77E6C] hover:bg-[#C66B5A] text-white px-4 py-3 rounded-xl transition-colors">
            <Download className="w-4 h-4" /> {/* Lucide Download */}
            <span className="text-sm font-medium">Скачать</span>
          </button>
        </div>
      </div>

      {/* Переключатель периода */}
      <div className="overflow-x-auto mb-6">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit min-w-full sm:min-w-0">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handlePeriodChange(option.value as Period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                selectedPeriod === option.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Мобильная версия - карточки */}
      <div className="md:hidden">
        {sampleSales.map((sale, idx) => (
          <MobileSaleCard key={idx} sale={sale} />
        ))}
      </div>

      {/* Десктопная версия - таблица */}
      <div className="hidden md:block overflow-hidden rounded-xl bg-white border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">
                  Клиент
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  Товар
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" /> {/* Lucide CalendarDays */}
                    Дата
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  ID
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  Сумма
                </th>
                <th className="text-center py-3 px-6 font-medium text-gray-700 text-sm">
                  Статус
                </th>
              </tr>
            </thead>
            <tbody>
              {sampleSales.map((sale, idx) => (
                <tr
                  key={idx}
                  className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={sale.avatar}
                        alt={sale.client}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <p className="font-medium text-gray-900">{sale.client}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                      {sale.product}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {sale.date}
                  </td>
                  <td className="py-4 px-4">
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-700">
                      {sale.id}
                    </code>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-gray-900">
                      {sale.amount}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-center">
                      {sale.status === 'Успешно' ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle2 className="w-3 h-3 text-green-500" /> {/* Lucide CheckCircle2 */}
                          <span className="text-sm font-medium text-green-700">
                            Успешно
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                          <XCircle className="w-3 h-3 text-red-500" /> {/* Lucide XCircle */}
                          <span className="text-sm font-medium text-red-700">
                            Отмена
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Пагинация */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
        <p className="text-center sm:text-left">Показано {sampleSales.length} записей</p>
        <div className="flex gap-1">
          <button className="px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            ←
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-[#D77E6C] text-white">1</button>
          <button className="px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">2</button>
          <button className="px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">3</button>
          <button className="px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            →
          </button>
        </div>
      </div>
    </div>
  );
}