'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { useTranslate } from '@/hooks/useTranslate';
import { useTeamModule } from '@/lib/teamcontent/team.module';
import { TeamMemberData } from '@/lib/teamcontent/team.service';

type TabId = 'dealers' | 'stars' | 'employees';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number; 
  totalPages: number; 
  onPageChange: (page: number) => void;
}) => {
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const showPages = 5;

    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-xl border-2 border-[#DC7C67]/20 text-sm font-semibold text-[#DC7C67] hover:bg-[#DC7C67]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        ← Назад
      </button>
      
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, idx) => (
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`min-w-[40px] h-10 rounded-xl text-sm font-bold transition-all ${
                currentPage === page
                  ? 'bg-gradient-to-br from-[#DC7C67] to-[#E89580] text-white shadow-lg shadow-[#DC7C67]/30'
                  : 'bg-white border-2 border-gray-100 text-gray-600 hover:border-[#DC7C67]/30 hover:text-[#DC7C67]'
              }`}
            >
              {page}
            </button>
          )
        ))}
      </div>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-xl border-2 border-[#DC7C67]/20 text-sm font-semibold text-[#DC7C67] hover:bg-[#DC7C67]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        Вперед →
      </button>
    </div>
  );
};

const TableRow = ({ member, onClick }: { member: TeamMemberData; onClick?: (member: TeamMemberData) => void }) => {
  const getInitials = (name: string) => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return words[0][0] + words[1][0];
    }
    return name.substring(0, 2);
  };

  return (
    <tr 
      className="group hover:bg-gradient-to-r hover:from-[#DC7C67]/5 hover:to-transparent transition-all cursor-pointer"
      onClick={() => onClick?.(member)}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          {member.avatar_url ? (
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image
                src={member.avatar_url}
                alt={member.name}
                width={48}
                height={48}
                className="w-12 h-12 object-cover rounded-2xl ring-2 ring-white shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-[#DC7C67] to-[#E89580] rounded-full ring-2 ring-white"></div>
            </div>
          ) : (
            <div className="relative w-12 h-12 flex-shrink-0 rounded-2xl bg-gradient-to-br from-[#DC7C67] to-[#E89580] flex items-center justify-center text-white font-bold text-base shadow-lg shadow-[#DC7C67]/30">
              {getInitials(member.name)}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full ring-2 ring-[#DC7C67]/20"></div>
            </div>
          )}
          <div>
            <div className="text-sm font-bold text-gray-900 group-hover:text-[#DC7C67] transition-colors">{member.name}</div>
            <div className="text-xs text-gray-500 mt-0.5">ID: {member.id.substring(0, 8)}</div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 text-sm font-medium text-gray-700 hidden sm:table-cell">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#DC7C67] to-[#E89580]"></div>
          {member.profession}
        </div>
      </td>

      <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#DC7C67]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          {member.phone}
        </div>
      </td>

      <td className="px-6 py-4 hidden lg:table-cell">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#DC7C67]/10 to-[#E89580]/10 border border-[#DC7C67]/20">
          <svg className="w-3.5 h-3.5 text-[#DC7C67]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
          </svg>
          <span className="text-xs font-bold text-[#DC7C67]">{member.referralCode}</span>
        </div>
      </td>

      <td className="px-6 py-4 text-sm text-gray-500 hidden xl:table-cell">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {member.date}
        </div>
      </td>

      <td className="px-6 py-4">
        {member.status ? (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse"></div>
            <span className="text-xs font-bold text-emerald-700">Подтвержден</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-rose-500"></div>
            <span className="text-xs font-bold text-red-700">Не подтвержден</span>
          </div>
        )}
      </td>
    </tr>
  );
};

export default function Team() {
  const router = useRouter();
  const { t } = useTranslate();
  const [selectedTab, setSelectedTab] = useState<TabId>('dealers');
  
  const {
    dealers,
    celebrities,
    employees,
    statistics,
    pagination,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    searchUsers,
    refreshData,
    goToPage,
  } = useTeamModule(selectedTab);

  const tabTitle: Record<TabId, string> = {
    dealers: 'Дилеры',
    stars: 'Звезды',
    employees: 'Сотрудники',
  };

  const statsData = [
    {
      id: 'dealers' as const,
      title: 'Дилеры',
      count: statistics.dealers,
      icon: '👥',
      gradient: 'from-[#DC7C67] to-[#E89580]',
      bgGradient: 'from-[#DC7C67]/10 to-[#E89580]/10',
      borderColor: 'border-[#DC7C67]/30',
    },
    {
      id: 'stars' as const,
      title: 'Звезды',
      count: statistics.celebrities,
      icon: '⭐',
      gradient: 'from-amber-500 to-yellow-500',
      bgGradient: 'from-amber-50 to-yellow-50',
      borderColor: 'border-amber-300',
    },
    {
      id: 'employees' as const,
      title: 'Сотрудники',
      count: statistics.employees,
      icon: '💼',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-300',
    },
  ];

  const currentData = useMemo(() => {
    switch (selectedTab) {
      case 'stars': return celebrities;
      case 'employees': return employees;
      default: return dealers;
    }
  }, [selectedTab, dealers, celebrities, employees]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, searchUsers]);

  const handleMemberClick = (member: TeamMemberData) => {
    // Переход на страницу редактирования пользователя
    router.push(`/admin/teamcontent/users/${member.id}`);
  };

  const StatCard = ({
    data,
    isActive = false,
  }: {
    data: typeof statsData[number];
    isActive?: boolean;
  }) => (
    <div
      className={`relative overflow-hidden rounded-3xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
        isActive 
          ? `bg-gradient-to-br ${data.gradient} shadow-2xl shadow-[#DC7C67]/30` 
          : `bg-gradient-to-br ${data.bgGradient} border-2 ${data.borderColor} hover:shadow-xl`
      }`}
      onClick={() => setSelectedTab(data.id)}
    >
      {/* Декоративные элементы */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${isActive ? 'bg-white/10' : 'bg-white/50'} blur-2xl`}></div>
      <div className={`absolute -bottom-10 -left-10 w-32 h-32 rounded-full ${isActive ? 'bg-white/10' : 'bg-white/50'} blur-2xl`}></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`text-4xl ${isActive ? 'animate-bounce' : ''}`}>{data.icon}</div>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            isActive ? 'border-white bg-white' : 'border-gray-300'
          }`}>
            {isActive && <div className="w-3 h-3 bg-gradient-to-br from-[#DC7C67] to-[#E89580] rounded-full"></div>}
          </div>
        </div>

        <div className={`text-sm font-semibold mb-2 ${isActive ? 'text-white' : 'text-gray-600'}`}>
          {t(data.title)}
        </div>

        <div className={`text-4xl font-black mb-1 ${isActive ? 'text-white' : 'text-gray-900'}`}>
          {data.count.toLocaleString()}
        </div>
        
        <div className={`text-xs font-medium ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
          Общее количество
        </div>
      </div>
    </div>
  );

  if (loading && currentData.length === 0) {
    return (
      <div className="w-full min-h-screen">
        <header className="w-full mb-8">
          <MoreHeaderAD title={t('Команда Tannur')} />
        </header>
        <div className="flex flex-col justify-center items-center py-20">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-[#DC7C67]/20 border-t-[#DC7C67] animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-[#DC7C67] to-[#E89580]"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Загрузка команды...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen">
        <header className="w-full mb-8">
          <MoreHeaderAD title={t('Команда Tannur')} />
        </header>
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-900">Ошибка загрузки</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <button 
              onClick={refreshData}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-[#DC7C67] to-[#E89580] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#DC7C67] to-[#E89580] flex items-center justify-center shadow-lg shadow-[#DC7C67]/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900">Команда Tannur</h1>
              <p className="text-sm text-gray-500 mt-1">Управление пользователями и статистика</p>
            </div>
          </div>
        </header>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statsData.map((data) => (
            <StatCard key={data.id} data={data} isActive={selectedTab === data.id} />
          ))}
        </div>

        {/* Поиск и действия */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#DC7C67]/10 to-[#E89580]/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#DC7C67]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Поиск пользователя</h3>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Введите имя, телефон или реферальный код..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-gray-50 to-[#DC7C67]/5 border-2 border-transparent focus:border-[#DC7C67] rounded-2xl text-sm font-medium placeholder-gray-400 transition-all focus:outline-none"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#DC7C67] to-[#E89580] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">Быстрые действия</h3>
            </div>
            <button 
              onClick={() => router.push('/admin/teamcontent/create_dealer')}
              className="w-full px-6 py-4 bg-white text-[#DC7C67] rounded-2xl font-bold  transition-all transform hover:scale-105"
            >
              + Создать дилера
            </button>
          </div>
        </div>

        {/* Таблица */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-[#DC7C67]/5 px-8 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-gray-900">
                  {t(tabTitle[selectedTab])}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Всего {currentData.length} • Страница {pagination.page} из {pagination.totalPages}
                </p>
              </div>
              <button 
                onClick={refreshData}
                className="p-3 rounded-xl bg-white border-2 border-gray-200 text-gray-600 hover:border-[#DC7C67] hover:text-[#DC7C67] transition-all"
                title="Обновить"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-transparent">
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Пользователь</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider hidden sm:table-cell">Профессия</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider hidden md:table-cell">Телефон</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider hidden lg:table-cell">Реф. код</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider hidden xl:table-cell">Дата</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Статус</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full border-4 border-[#DC7C67]/20 border-t-[#DC7C67] animate-spin"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-[#DC7C67] to-[#E89580]"></div>
                        </div>
                        <p className="text-sm font-medium text-gray-600">Загрузка данных...</p>
                      </div>
                    </td>
                  </tr>
                ) : currentData.length > 0 ? (
                  currentData.map((member, i) => (
                    <TableRow 
                      key={`${member.id}-${i}`} 
                      member={member} 
                      onClick={handleMemberClick}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
                          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <p className="text-lg font-bold text-gray-900 mb-2">Участники не найдены</p>
                        <p className="text-sm text-gray-500">Попробуйте изменить критерии поиска</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="bg-gradient-to-r from-gray-50 to-transparent px-8 py-6 border-t border-gray-100">
              <Pagination 
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={goToPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}