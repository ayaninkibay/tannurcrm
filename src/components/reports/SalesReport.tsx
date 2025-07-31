"use client";

import React from "react";
import Image from "next/image";
import type { Period } from '@/components/reports/SubscriptionsReport';

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
    avatar: '/icons/Users avatar 3.png',
    client: 'Сергей Сергеев',
    product: 'Product X',
    date: '10-07-2025',
    id: 'SL98765',
    amount: '20 000₸',
    status: 'Успешно',
  },
  {
    avatar: '/icons/Users avatar 2.png',
    client: 'Елена Еленова',
    product: 'Product Y',
    date: '05-07-2025',
    id: 'SL98766',
    amount: '12 500₸',
    status: 'Отмена',
  },
];

interface SalesReportProps {
  period: Period;
  onPeriodChange?: (period: Period) => void;
}

export default function SalesReport({ period, onPeriodChange }: SalesReportProps) {
  return (
    <div>
      {/* Заголовок и кнопка */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Image src="/icons/IconShoppingBlack.png" alt="icon" width={20} height={20} />
          Отчет по продажам
        </h3>
        <button className="text-sm font-semibold hover:underline self-start sm:self-auto">
          Скачать отчет
        </button>
      </div>

      {/* Селект периода */}
      <div className="flex justify-end mb-2">
        <select
          value={period}
          onChange={e => onPeriodChange?.(e.target.value as Period)}
          className="bg-gray-100 text-gray-700 text-sm rounded-full py-1 px-3"
        >
          <option value="all">За всё время</option>
          <option value="last6">Последние 6 мес.</option>
          <option value="thisYear">Текущий год</option>
          <option value="prevYear">Прошлый год</option>
        </select>
      </div>

      {/* Обёртка для скролла на мобильных */}
      <div className="overflow-x-auto">
        <table className="min-w-[600px] w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-2">Клиент</th>
              <th className="py-2">Товар</th>
              <th className="py-2">Дата</th>
              <th className="py-2">ID</th>
              <th className="py-2">Сумма</th>
              <th className="py-2">Статус</th>
            </tr>
          </thead>
          <tbody className="text-black">
            {sampleSales.map((s, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="py-3 flex items-center gap-2 min-w-[150px]">
                  <img src={s.avatar} alt={s.client} className="w-6 h-6 rounded-full object-cover" />
                  {s.client}
                </td>
                <td className="py-3">{s.product}</td>
                <td className="py-3">{s.date}</td>
                <td className="py-3">{s.id}</td>
                <td className="py-3 font-medium">{s.amount}</td>
                <td className="py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      s.status === 'Успешно' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
