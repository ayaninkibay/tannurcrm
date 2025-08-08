"use client";

import React, { useState } from "react";

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

// Пример данных
const sampleSubscriptions: Subscription[] = [
  {
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ayan",
    name: "Аян Инкибай",
    profession: "Доктор",
    date: "22-02-2025",
    id: "KZ84970",
    amount: "25 000₸",
    status: "Зачислен",
  },
  {
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tomiris",
    name: "Томирис Смак",
    profession: "Business",
    date: "22-02-2025",
    id: "KZ84971",
    amount: "30 000₸",
    status: "Зачислен",
  },
  {
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Asel",
    name: "Асель Жаныбек",
    profession: "Designer",
    date: "21-02-2025",
    id: "KZ84972",
    amount: "15 000₸",
    status: "Отменен",
  },
  {
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dauren",
    name: "Даурен Кайрат",
    profession: "Developer",
    date: "20-02-2025",
    id: "KZ84973",
    amount: "45 000₸",
    status: "Зачислен",
  },
  {
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Madina",
    name: "Мадина Ержан",
    profession: "Marketing",
    date: "19-02-2025",
    id: "KZ84974",
    amount: "20 000₸",
    status: "Зачислен",
  },
];

interface Props {
  period?: Period;
  onPeriodChange?: (period: Period) => void;
}

// Иконки в виде SVG компонентов
const CrownIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 16L3 7L8.5 10L12 4L15.5 10L21 7L19 16H5Z" fill="url(#crown-gradient)" stroke="url(#crown-gradient-stroke)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 16V21H5V16" stroke="url(#crown-gradient-stroke)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <linearGradient id="crown-gradient" x1="3" y1="4" x2="21" y2="21">
        <stop stopColor="#fbbf24"/>
        <stop offset="1" stopColor="#f59e0b"/>
      </linearGradient>
      <linearGradient id="crown-gradient-stroke" x1="3" y1="4" x2="21" y2="21">
        <stop stopColor="#f59e0b"/>
        <stop offset="1" stopColor="#d97706"/>
      </linearGradient>
    </defs>
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const periodOptions = [
  { value: "all", label: "За всё время", icon: "📊" },
  { value: "last6", label: "6 месяцев", icon: "📅" },
  { value: "thisYear", label: "Текущий год", icon: "📈" },
  { value: "prevYear", label: "Прошлый год", icon: "📉" },
];

const SubscriptionsReport: React.FC<Props> = ({ 
  period = "all", 
  onPeriodChange = () => {} 
}) => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  
  const handlePeriodChange = (newPeriod: Period) => {
    setSelectedPeriod(newPeriod);
    onPeriodChange(newPeriod);
  };

  // Расчет общей суммы
  const totalAmount = sampleSubscriptions
    .filter(sub => sub.status === "Зачислен")
    .reduce((sum, sub) => sum + parseInt(sub.amount.replace(/[^\d]/g, '')), 0);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 backdrop-blur-lg border border-gray-100">
      {/* Шапка с градиентом */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full blur-3xl"></div>
        
        <div className="flex justify-between items-start flex-wrap gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white rounded-lg shadow-md">
                <CrownIcon />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Отчет по подпискам
              </h3>
            </div>
            <p className="text-gray-600 text-sm ml-11">
              Детальная информация о транзакциях
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-xl px-4 py-2 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Общая сумма</p>
              <p className="text-xl font-bold text-green-600">
                {totalAmount.toLocaleString('ru-KZ')}₸
              </p>
            </div>
            <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              <DownloadIcon />
              <span className="text-sm font-medium">Скачать отчет</span>
            </button>
          </div>
        </div>
      </div>

      {/* Переключатель периода */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl w-fit">
        {periodOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handlePeriodChange(option.value as Period)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              selectedPeriod === option.value
                ? "bg-white text-gray-900 shadow-md transform scale-105"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <span>{option.icon}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      {/* Таблица с современным дизайном */}
      <div className="overflow-hidden rounded-xl bg-white shadow-inner">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                  Клиент
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                  Профессия
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <CalendarIcon />
                    Дата
                  </div>
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                  ID
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                  Сумма
                </th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                  Статус
                </th>
              </tr>
            </thead>
            <tbody>
              {sampleSubscriptions.map((sub, idx) => (
                <tr
                  key={idx}
                  className={`border-t border-gray-100 transition-all duration-300 ${
                    hoveredRow === idx ? "bg-gradient-to-r from-blue-50/50 to-indigo-50/50" : "hover:bg-gray-50"
                  }`}
                  onMouseEnter={() => setHoveredRow(idx)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={sub.avatar}
                          alt={sub.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{sub.name}</p>
                        <p className="text-xs text-gray-500">Активный клиент</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {sub.profession}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600 font-medium">
                    {sub.date}
                  </td>
                  <td className="py-4 px-4">
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-700">
                      {sub.id}
                    </code>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-gray-900 text-lg">
                      {sub.amount}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-center">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase transform transition-all duration-300 hover:scale-110 ${
                          sub.status === "Зачислен"
                            ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg shadow-green-200"
                            : "bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-lg shadow-red-200"
                        }`}
                      >
                        {sub.status === "Зачислен" ? "✓ " : "✕ "}
                        {sub.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Футер с дополнительной информацией */}
      <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
        <p>Показано {sampleSubscriptions.length} записей</p>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors">
            ← Предыдущая
          </button>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded-lg bg-blue-600 text-white font-medium">1</button>
            <button className="w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors">2</button>
            <button className="w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors">3</button>
          </div>
          <button className="px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors">
            Следующая →
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsReport;