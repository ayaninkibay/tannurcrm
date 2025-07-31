"use client";

import React from "react";
import Image from "next/image";
import type { Period } from '@/components/reports/SubscriptionsReport';

interface Purchase {
  avatar: string;
  name: string;
  product: string;
  date: string;
  id: string;
  amount: string;
  status: 'Оплачен' | 'Возврат';
}

const samplePurchases: Purchase[] = [
  {
    avatar: '/icons/Users avatar 1.png',
    name: 'Иван Иванов',
    product: 'Product A',
    date: '01-07-2025',
    id: 'PR12345',
    amount: '10 000₸',
    status: 'Оплачен',
  },
  {
    avatar: '/icons/Users avatar 2.png',
    name: 'Мария Петрова',
    product: 'Product B',
    date: '15-06-2025',
    id: 'PR12346',
    amount: '15 500₸',
    status: 'Возврат',
  },
];

interface PurchasesReportProps {
  period: Period;
  onPeriodChange?: (period: Period) => void;
}

export default function PurchasesReport({ period, onPeriodChange }: PurchasesReportProps) {
  return (
    <div>
      {/* Заголовок и кнопка */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Image src="/icons/IconShoppingBlack.png" alt="icon" width={20} height={20} />
          Отчет по покупкам
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
              <th className="py-2">Имя</th>
              <th className="py-2">Товар</th>
              <th className="py-2">Дата</th>
              <th className="py-2">ID</th>
              <th className="py-2">Сумма</th>
              <th className="py-2">Статус</th>
            </tr>
          </thead>
          <tbody className="text-black">
            {samplePurchases.map((p, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="py-3 flex items-center gap-2 min-w-[150px]">
                  <img src={p.avatar} alt={p.name} className="w-6 h-6 rounded-full object-cover" />
                  {p.name}
                </td>
                <td className="py-3">{p.product}</td>
                <td className="py-3">{p.date}</td>
                <td className="py-3">{p.id}</td>
                <td className="py-3 font-medium">{p.amount}</td>
                <td className="py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      p.status === 'Оплачен' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                    }`}
                  >
                    {p.status}
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
