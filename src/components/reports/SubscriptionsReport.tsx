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

// Иконки
const CrownIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 16L3 7L8.5 10L12 4L15.5 10L21 7L19 16H5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 16V21H5V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
  { value: "all", label: "За всё время" },
  { value: "last6", label: "6 месяцев" },
  { value: "thisYear", label: "Текущий год" },
  { value: "prevYear", label: "Прошлый год" },
];

// Мобильная карточка подписки
const MobileSubscriptionCard = ({ sub, index }: { sub: Subscription; index: number }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={sub.avatar}
            alt={sub.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <div>
          <p className="font-medium text-sm">{sub.name}</p>
          <p className="text-xs text-gray-500">{sub.profession}</p>
        </div>
      </div>
      {sub.status === "Зачислен" ? (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-green-700">Зачислен</span>
        </div>
      ) : (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 rounded-lg">
          <svg className="w-3 h-3 text-red-500" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM4.7 4.7a.75.75 0 0 1 1.06 0L8 6.94l2.24-2.24a.75.75 0 1 1 1.06 1.06L9.06 8l2.24 2.24a.75.75 0 1 1-1.06 1.06L8 9.06l-2.24 2.24a.75.75 0 0 1-1.06-1.06L6.94 8 4.7 5.76a.75.75 0 0 1 0-1.06z"/>
          </svg>
          <span className="text-xs font-medium text-red-700">Отменен</span>
        </div>
      )}
    </div>
    
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">ID</span>
        <span className="font-mono">{sub.id}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">Дата</span>
        <span>{sub.date}</span>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
        <span className="text-xs text-gray-500">Сумма</span>
        <span className="font-semibold text-base">{sub.amount}</span>
      </div>
    </div>
  </div>
);

const SubscriptionsReport: React.FC<Props> = ({ 
  period = "all", 
  onPeriodChange = () => {} 
}) => {
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
    <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-4 md:p-6">
      {/* Шапка */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#D77E6C]/10 rounded-lg">
              <CrownIcon className="text-[#D77E6C]" />
            </div>
            <h3 className="text-xl md:text-2xl font-medium text-gray-900">
              Отчет по подпискам
            </h3>
          </div>
          <p className="text-gray-600 text-sm">
            Детальная информация о транзакциях
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
            <DownloadIcon />
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
        {sampleSubscriptions.map((sub, idx) => (
          <MobileSubscriptionCard key={idx} sub={sub} index={idx} />
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
                  Профессия
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
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
              {sampleSubscriptions.map((sub, idx) => (
                <tr
                  key={idx}
                  className="border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={sub.avatar}
                          alt={sub.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{sub.name}</p>
                        <p className="text-xs text-gray-500">Активный клиент</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                      {sub.profession}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {sub.date}
                  </td>
                  <td className="py-4 px-4">
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-700">
                      {sub.id}
                    </code>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-gray-900">
                      {sub.amount}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-center">
                      {sub.status === "Зачислен" ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-green-700">
                            Зачислен
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                          <svg className="w-3 h-3 text-red-500" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM4.7 4.7a.75.75 0 0 1 1.06 0L8 6.94l2.24-2.24a.75.75 0 1 1 1.06 1.06L9.06 8l2.24 2.24a.75.75 0 1 1-1.06 1.06L8 9.06l-2.24 2.24a.75.75 0 0 1-1.06-1.06L6.94 8 4.7 5.76a.75.75 0 0 1 0-1.06z"/>
                          </svg>
                          <span className="text-sm font-medium text-red-700">
                            Отменен
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
        <p className="text-center sm:text-left">Показано {sampleSubscriptions.length} записей</p>
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
};

export default SubscriptionsReport;