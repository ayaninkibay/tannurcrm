'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { TeamMember } from '@/components/product/TeamMemberRow';
import TannurButton from '@/components/Button';

import DealerRow from '@/components/reports/teamtannur/dealer';
import CelebrityRow from '@/components/reports/teamtannur/celebrity';
import EmployeeRow from '@/components/reports/teamtannur/employee';
import { useTranslate } from '@/hooks/useTranslate';

type TabId = 'dealers' | 'stars' | 'employees';

export default function Team() {
  const { t } = useTranslate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<TabId>('dealers');

  // ======= ДАННЫЕ (моки выводим через t(...)) =======
  const dealers: TeamMember[] = [
    { id: 'KZ868970', name: 'Ани Иманбай',   profession: 'Доктор',   date: '22-02-2025', status: 'active',  commands: 8  },
    { id: 'KZ868971', name: 'Томирис Снок',  profession: 'Business', date: '22-02-2025', status: 'active',  commands: 23 },
    { id: 'KZ868972', name: 'Ани Иманбай',   profession: 'Доктор',   date: '22-02-2025', status: 'blocked', commands: 12 },
    { id: 'KZ868973', name: 'Томирис Снок',  profession: 'Business', date: '22-02-2025', status: 'active',  commands: 84 },
  ];

  const stars: TeamMember[] = [
    { id: 'KZ900001', name: 'Інжу Ануарбек', profession: 'Певица',     date: '05-01-2025', status: 'active', commands: 5  },
    { id: 'KZ900002', name: 'Самал Толеп',   profession: 'Актриса',    date: '10-01-2025', status: 'active', commands: 2  },
    { id: 'KZ900003', name: 'Ержан Бек',     profession: 'Блогер',     date: '12-01-2025', status: 'active', commands: 11 },
    { id: 'HR0001',   name: 'Айдос Нурсеитов', profession: 'HR',       date: '15-01-2025', status: 'active', commands: 1  },
  ];

  const employees: TeamMember[] = [
    { id: 'HR0001', name: 'Айдос Нурсеитов', profession: 'HR',           date: '15-01-2025', status: 'active',  commands: 1 },
    { id: 'FN0002', name: 'Асел Абдуллина',  profession: 'Финансист',    date: '18-01-2025', status: 'active',  commands: 1 },
    { id: 'WH0003', name: 'Берик Тулеген',   profession: 'Складовщик',   date: '20-01-2025', status: 'blocked', commands: 1 },
    { id: 'MG0004', name: 'Жанар Садыкова',  profession: 'Менеджер',     date: '21-01-2025', status: 'active',  commands: 4 },
  ];

  const tabTitle: Record<TabId, string> = {
    dealers: 'Дилеры',
    stars: 'Звезды',
    employees: 'Сотрудники',
  };

  const statsData = [
    {
      id: 'dealers' as const,
      title: 'Дилеры',
      count: dealers.length,
      subtitle: 'Общее количество',
      icon: '/icons/IconUsersOrange.svg',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      activeColor: 'ring-orange-500',
    },
    {
      id: 'stars' as const,
      title: 'Звезды',
      count: stars.length,
      subtitle: 'Общее количество',
      icon: '/icons/IconStarOrange.svg',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      activeColor: 'ring-yellow-500',
    },
    {
      id: 'employees' as const,
      title: 'Сотрудники',
      count: employees.length,
      subtitle: 'Общее количество',
      icon: '/icons/IconStarOrange.svg',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      activeColor: 'ring-blue-500',
    },
  ];

  // текущий набор по табу
  const currentData: TeamMember[] = useMemo(() => {
    switch (selectedTab) {
      case 'stars': return stars;
      case 'employees': return employees;
      default: return dealers;
    }
  }, [selectedTab]);

  // фильтрация поиска (safe для undefined)
  const filteredMembers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return currentData.filter((m) => {
      const name = (m.name ?? '').toLowerCase();
      const prof = (m.profession ?? '').toLowerCase();
      const id   = (m.id ?? '').toLowerCase();
      return name.includes(q) || prof.includes(q) || id.includes(q);
    });
  }, [currentData, searchQuery]);

  // отображаемые данные — моки через t() (safe для undefined)
  const displayedMembers = useMemo(
    () =>
      filteredMembers.map((m) => ({
        ...m,
        name: t(m.name ?? ''),
        profession: t(m.profession ?? ''),
      })),
    [filteredMembers, t]
  );

  const handleMemberClick = (member: TeamMember) => {
    console.log('Clicked member:', member);
  };

  const StatCard = ({
    data,
    isActive = false,
  }: {
    data: typeof statsData[number];
    isActive?: boolean;
  }) => (
    <div
      className={`bg-white rounded-2xl p-4 sm:p-6 cursor-pointer transition-all hover:shadow-md border ${
        isActive ? `ring-2 ${data.activeColor} shadow-lg ${data.borderColor}` : 'border-gray-200'
      }`}
      onClick={() => setSelectedTab(data.id)}
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
              isActive ? data.bgColor : 'bg-gray-100'
            }`}
          >
            <Image src={data.icon} alt={t(data.title)} width={16} height={16} className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
          <span className="text-gray-600 text-xs sm:text-sm font-medium">{t(data.title)}</span>
        </div>
        <div
          className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center ${
            isActive ? `${data.borderColor} ${data.bgColor}` : 'border-gray-300'
          }`}
        >
          {isActive && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#DC7C67] rounded-full" />}
        </div>
      </div>

      <div className="text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4 bg-gray-50 rounded-full flex items-center justify-center">
          <Image src={data.icon} alt={t(data.title)} width={24} height={24} className="w-5 h-5 sm:w-6 sm:h-6 opacity-40" />
        </div>
        <div className="text-lg sm:text-2xl font-bold text-gray-900 mb-1">
          {data.count.toLocaleString()}{' '}
          <span className="text-xs sm:text-sm font-normal text-gray-500">{t('человек')}</span>
        </div>
        <div className="text-xs text-gray-400">{t(data.subtitle)}</div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full">
      <header className="w-full mb-4">
        <MoreHeaderAD title={t('Команда Tannur')} />
      </header>

      <div className="w-full">
        {/* Верх: поиск + карточки статов + действия */}
        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
          {/* Поиск + статы */}
          <div className="lg:col-span-3 xl:col-span-2 space-y-3 sm:space-y-6">
            <div className="bg-white rounded-2xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">{t('Поиск пользователя')}</h3>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder={t('Имя, номер, email')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-gray-50 border-0 rounded-xl text-sm placeholder-gray-500 focus:ring-2 focus:ring-[#DC7C67] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {statsData.map((data) => (
                <StatCard key={data.id} data={data} isActive={selectedTab === data.id} />
              ))}
            </div>
          </div>

          {/* Действия */}
          <div className="lg:col-span-1 xl:col-span-1">
            <div className="h-full w-full sm:p-3">
              <div className="space-y-2 sm:space-y-3 mt-3">
                <TannurButton
                  text={t('Создать дилера')}
                  href="/admin/teamcontent/create_dealer"
                  iconSrc="/icons/iconusersorange.svg"
                  variant="white"
                  arrow="black"
                />
                <TannurButton
                  text={t('Создать знаменитость')}
                  href="/admin/teamcontent/create_star"
                  iconSrc="/icons/iconusersorange.svg"
                  variant="white"
                  arrow="black"
                />
                <TannurButton
                  text={t('Создать менеджера')}
                  href="/admin/teamcontent/create_manager"
                  iconSrc="/icons/iconusersorange.svg"
                  variant="white"
                  arrow="black"
                />
                <TannurButton
                  text={t('Создать финансиста')}
                  href="/admin/teamcontent/create_financier"
                  iconSrc="/icons/iconusersorange.svg"
                  variant="white"
                  arrow="black"
                />
                <TannurButton
                  text={t('Создать складовщика')}
                  href="/admin/teamcontent/create_rockmaker"
                  iconSrc="/icons/iconusersorange.svg"
                  variant="white"
                  arrow="black"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Табличный блок */}
        <div className="bg-white rounded-2xl overflow-hidden">
          {/* Заголовок таблицы */}
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                {t(tabTitle[selectedTab])} {filteredMembers.length} {t('человек')}
              </h3>
              <div className="flex items-center gap-2">
                <button className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors" aria-label="filter">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707л-6.414 6.414a1 1 0 00-.293.707V17л-4 4v-6.586a1 1 0 00-.293-.707Л3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Таблица */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Имя')}
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    {t('Профессия')}
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    {t('Дата')}
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    {t('ID')}
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Команда')}
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Статус')}
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {displayedMembers.length > 0 ? (
                  displayedMembers.map((member, i) => {
                    const key = `${member.id}-${i}`;
                    if (selectedTab === 'dealers')
                      return <DealerRow key={key} member={member} onClick={handleMemberClick} />;
                    if (selectedTab === 'stars')
                      return <CelebrityRow key={key} member={member} onClick={handleMemberClick} />;
                    return <EmployeeRow key={key} member={member} onClick={handleMemberClick} />;
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 sm:px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg
                          className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 mb-2 sm:mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <p className="text-sm">{t('Участники не найдены')}</p>
                        <p className="text-xs text-gray-400 mt-1">{t('Попробуйте изменить критерии поиска')}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
