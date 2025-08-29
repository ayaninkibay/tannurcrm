"use client";

import React, { useState } from "react";
import { Users, Download, CalendarDays, XCircle, CheckCircle2 } from "lucide-react";
import { useTranslate } from "@/hooks/useTranslate";

export type Period = "all" | "last6" | "thisYear" | "prevYear";

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
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    name: 'Алиса Алиева',
    email: 'alice@example.com',
    registered: '15-01-2025',
    role: 'Дилер',
    status: 'Активен',
  },
  {
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    name: 'Боб Бобов',
    email: 'bob@example.com',
    registered: '20-02-2025',
    role: 'Админ',
    status: 'Заблокирован',
  },
  {
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Viktor',
    name: 'Виктор Викторов',
    email: 'viktor@example.com',
    registered: '10-01-2025',
    role: 'Дилер',
    status: 'Активен',
  },
  {
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana',
    name: 'Диана Дианова',
    email: 'diana@example.com',
    registered: '05-02-2025',
    role: 'Модератор',
    status: 'Активен',
  },
];

interface UsersReportProps {
  period?: Period;
  onPeriodChange?: (period: Period) => void;
}

const periodOptions = [
  { value: "all", label: "За всё время" },
  { value: "last6", label: "6 месяцев" },
  { value: "thisYear", label: "Текущий год" },
  { value: "prevYear", label: "Прошлый год" },
];

// Мобильная карточка пользователя
const MobileUserCard = ({ user }: { user: User }) => {
  const { t } = useTranslate();
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar}
            alt={user.name} // имена людей не переводим
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-medium text-sm">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
        {user.status === 'Активен' ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            <span className="text-xs font-medium text-green-700">{t('Активен')}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 rounded-lg">
            <XCircle className="w-3 h-3 text-red-500" />
            <span className="text-xs font-medium text-red-700">{t('Заблокирован')}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">{t('Роль')}</span>
          <span className="font-medium">{user.role}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">{t('Зарегистрирован')}</span>
          <span>{user.registered}</span>
        </div>
      </div>
    </div>
  );
};

export default function UsersReport({
  period = "all",
  onPeriodChange = () => {}
}: UsersReportProps) {
  const { t } = useTranslate();
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  const handlePeriodChange = (newPeriod: Period) => {
    setSelectedPeriod(newPeriod);
    onPeriodChange(newPeriod);
  };

  const activeUsers = sampleUsers.filter(u => u.status === 'Активен').length;
  const totalUsers = sampleUsers.length;

  return (
    <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-4 md:p-6">
      {/* Шапка */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#D77E6C]/10 rounded-lg">
              <Users className="w-5 h-5 text-[#D77E6C]" />
            </div>
            <h3 className="text-xl md:text-2xl font-medium text-gray-900">
              {t('Отчет по пользователям')}
            </h3>
          </div>
          <p className="text-gray-600 text-sm">
            {t('Управление пользователями системы')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">{t('Активные')}</p>
            <p className="text-lg md:text-xl font-bold text-[#D77E6C]">
              {t('{n} из {total}')
                .replace('{n}', String(activeUsers))
                .replace('{total}', String(totalUsers))}
            </p>
          </div>
          <button className="flex items-center justify-center gap-2 bg-[#D77E6C] hover:bg-[#C66B5A] text-white px-4 py-3 rounded-xl transition-colors">
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">{t('Скачать')}</span>
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
              {t(option.label)}
            </button>
          ))}
        </div>
      </div>

      {/* Мобильная версия - карточки */}
      <div className="md:hidden">
        {sampleUsers.map((user, idx) => (
          <MobileUserCard key={idx} user={user} />
        ))}
      </div>

      {/* Десктопная версия - таблица */}
      <div className="hidden md:block overflow-hidden rounded-xl bg-white border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">
                  {t('Пользователь')}
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  {t('Email')}
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    {t('Регистрация')}
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  {t('Роль')}
                </th>
                <th className="text-center py-3 px-6 font-medium text-gray-700 text-sm">
                  {t('Статус')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sampleUsers.map((user, idx) => (
                <tr
                  key={idx}
                  className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <p className="font-medium text-gray-900">{user.name}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-600">{user.email}</span>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {user.registered}
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-center">
                      {user.status === 'Активен' ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          <span className="text-sm font-medium text-green-700">
                            {t('Активен')}
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                          <XCircle className="w-3 h-3 text-red-500" />
                          <span className="text-sm font-medium text-red-700">
                            {t('Заблокирован')}
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
        <p className="text-center sm:text-left">
          {t('Показано {n} пользователей').replace('{n}', String(sampleUsers.length))}
        </p>
        <div className="flex gap-1">
          <button className="px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Prev">
            ←
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-[#D77E6C] text-white" aria-current="page">1</button>
          <button className="px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">2</button>
          <button className="px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">3</button>
          <button className="px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Next">
            →
          </button>
        </div>
      </div>
    </div>
  );
}
