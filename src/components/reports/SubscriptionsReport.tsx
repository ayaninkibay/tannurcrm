"use client";

import React from "react";
import Image from "next/image";

/**
 * Период для отчета
 */
export type Period = "all" | "last6" | "thisYear" | "prevYear";

/**
 * Структура одной записи отчёта по подпискам
 */
interface Subscription {
  avatar: string;
  name: string;
  profession: string;
  date: string;
  id: string;
  amount: string;
  status: "Зачислен" | "Отменен";
}

// Пример данных — замените реальными
const sampleSubscriptions: Subscription[] = [
  {
    avatar: "/icons/Users avatar 3.png",
    name: "Аян Инкибай",
    profession: "Доктор",
    date: "22-02-2025",
    id: "KZ84970",
    amount: "25 000₸",
    status: "Зачислен",
  },
  {
    avatar: "/icons/Users avatar 2.png",
    name: "Томирис Смак",
    profession: "Business",
    date: "22-02-2025",
    id: "KZ84971",
    amount: "30 000₸",
    status: "Зачислен",
  },
];

interface Props {
  period: Period;
  onPeriodChange?: (period: Period) => void;
}

const SubscriptionsReport: React.FC<Props> = ({ period, onPeriodChange }) => {
  return (
    <div>
      {/* Заголовок и кнопка «Скачать отчет» */}
<div className="flex justify-between items-center flex-wrap gap-4 mb-4">
  {/* Заголовок */}
  <h3 className="text-xs md:text-lg font-semibold flex items-center gap-2">
    <Image
      src="/icons/IconCrownBlack.png"
      alt="icon"
      width={20}
      height={20}
    />
    Отчет по подпискам
  </h3>

  {/* Селект периода */}
  <select
    value={period}
    onChange={(e) => onPeriodChange?.(e.target.value as Period)}
    className="bg-gray-100 text-gray-700 text-sm rounded-full py-1 px-3"
  >
    <option value="all">За всё время</option>
    <option value="last6">Последние 6 мес.</option>
    <option value="thisYear">Текущий год</option>
    <option value="prevYear">Прошлый год</option>
  </select>
</div>


      {/* Обёртка для горизонтального скролла на мобильных */}
      <div className="overflow-x-auto">
        <table className="min-w-[600px] w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="flex py-2 pl-15">Имя</th>
              <th className="py-2 md:table-cell">Профессия</th>
              <th className="py-2 lg:table-cell">Дата</th>
              <th className="py-2 lg:table-cell">ID</th>
              <th className="py-2">Сумма</th>
              <th className="flex py-2 justify-end pr-5">Статус</th>
            </tr>
          </thead>
          <tbody className="text-black">
            {sampleSubscriptions.map((sub, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="py-3 flex items-center gap-2 min-w-[150px]">
                  <img
                    src={sub.avatar}
                    alt={sub.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  {sub.name}
                </td>
                <td className="py-3 md:table-cell">{sub.profession}</td>
                <td className="py-3 lg:table-cell">{sub.date}</td>
                <td className="py-3 lg:table-cell">{sub.id}</td>
                <td className="py-3 font-medium">{sub.amount}</td>
                <td className="py-3 flex justify-end">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      sub.status === "Зачислен"
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {sub.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubscriptionsReport;
