"use client";

import React from "react";
import Image from "next/image";
import type { Period } from '@/components/reports/SubscriptionsReport';

interface User {
  avatar: string;
  name: string;
  email: string;
  registered: string;
  role: string;
  status: 'Активен' | 'Заблокирован';
}

const sampleUsers: User[] = [
  {
    avatar: '/icons/Users avatar 1.png',
    name: 'Алиса Алиева',
    email: 'alice@example.com',
    registered: '15-01-2025',
    role: 'Дилер',
    status: 'Активен',
  },
  {
    avatar: '/icons/Users avatar 2.png',
    name: 'Боб Бобов',
    email: 'bob@example.com',
    registered: '20-02-2025',
    role: 'Админ',
    status: 'Заблокирован',
  },
];

interface UsersReportProps {
  period: Period;
  onPeriodChange?: (period: Period) => void;
}

export default function UsersReport({ period, onPeriodChange }: UsersReportProps) {
  return (
    <div>
      {/* Заголовок и кнопка */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Image src="/icons/Users avatar 3.png" alt="icon" width={20} height={20} />
          Отчет по пользователям
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
        <table className="min-w-[500px] w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-2">Имя</th>
              <th className="py-2 md:table-cell">Email</th>
              <th className="py-2 lg:table-cell">Зарегистрирован</th>
              <th className="py-2 lg:table-cell">Роль</th>
              <th className="py-2">Статус</th>
            </tr>
          </thead>
          <tbody className="text-black">
            {sampleUsers.map((u, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="py-3 flex items-center gap-2 min-w-[120px]">
                  <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                  {u.name}
                </td>
                <td className="py-3 md:table-cell">{u.email}</td>
                <td className="py-3 lg:table-cell">{u.registered}</td>
                <td className="py-3 lg:table-cell">{u.role}</td>
                <td className="py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    u.status === 'Активен' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                  }`}>
                    {u.status}
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
