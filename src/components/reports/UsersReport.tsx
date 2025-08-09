"use client";

import React, { useState } from "react";

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

// Иконки
const UsersIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

// Мобильная карточка пользователя
const MobileUserCard = ({ user }: { user: User }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-medium text-sm">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      </div>
      {user.status === 'Активен' ? (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-green-700">Активен</span>
        </div>
      ) : (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 rounded-lg">
          <svg className="w-3 h-3 text-red-500" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM4.7 4.7a.75.75 0 0 1 1.06 0L8 6.94l2.24-2.24a.75.75 0 1 1 1.06 1.06L9.06 8l2.24 2.24a.75.75 0 1 1-1.06 1.06L8 9.06l-2.24 2.24a.75.75 0 0 1-1.06-1.06L6.94 8 4.7 5.76a.75.75 0 0 1 0-1.06z"/>
          </svg>
          <span className="text-xs font-medium text-red-700">Заблокирован</span>
        </div>
      )}
    </div>
    
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">Роль</span>
        <span className="font-medium">{user.role}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">Зарегистрирован</span>
        <span>{user.registered}</span>
      </div>
    </div>
  </div>
);

export default function UsersReport({ 
  period = "all", 
  onPeriodChange = () => {} 
}: UsersReportProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  
  const handlePeriodChange = (newPeriod: Period) => {
    setSelectedPeriod(newPeriod);
    onPeriodChange(newPeriod);
  };

  // Подсчет активных пользователей
  const activeUsers = sampleUsers.filter(u => u.status === 'Активен').length;
  const totalUsers = sampleUsers.length;

  return (
    <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-4 md:p-6">
      {/* Шапка */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#D77E6C]/10 rounded-lg">
              <UsersIcon className="text-[#D77E6C]" />
            </div>
            <h3 className="text-xl md:text-2xl font-medium text-gray-900">
              Отчет по подаркам
            </h3>
          </div>
          <p className="text-gray-600 text-sm">
            Управление пользователями системы
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">Активные</p>
            <p className="text-lg md:text-xl font-bold text-[#D77E6C]">
              {activeUsers} из {totalUsers}
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
                  Пользователь
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  Email
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Регистрация
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  Роль
                </th>
                <th className="text-center py-3 px-6 font-medium text-gray-700 text-sm">
                  Статус
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
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-green-700">
                            Активен
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                          <svg className="w-3 h-3 text-red-500" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM4.7 4.7a.75.75 0 0 1 1.06 0L8 6.94l2.24-2.24a.75.75 0 1 1 1.06 1.06L9.06 8l2.24 2.24a.75.75 0 1 1-1.06 1.06L8 9.06l-2.24 2.24a.75.75 0 0 1-1.06-1.06L6.94 8 4.7 5.76a.75.75 0 0 1 0-1.06z"/>
                          </svg>
                          <span className="text-sm font-medium text-red-700">
                            Заблокирован
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
        <p className="text-center sm:text-left">Показано {sampleUsers.length} пользователей</p>
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