'use client';

import React, { useState } from 'react';
import MoreHeader from '@/components/header/MoreHeader';
import Image from 'next/image';

interface Course {
  id: string;
  title: string;
  author: string;
  lessonsCount: number;
  icon: string;
}

export default function AcademyTannur() {
  const [selectedCategory, setSelectedCategory] = useState('courses');

  const courses: Course[] = [
    {
      id: '1',
      title: 'Знакомство с Tannur',
      author: 'Tannur Cosmetics',
      lessonsCount: 6,
      icon: '/icons/IconEducationOrange.svg'
    },
    {
      id: '2',
      title: 'Маркетинговая стратегия',
      author: 'Insy Anuarben',
      lessonsCount: 5,
      icon: '/icons/IconMarketingOrange.svg'
    },
    {
      id: '3',
      title: 'Менеджер по продажам',
      author: 'Сыймова Мариям',
      lessonsCount: 13,
      icon: '/icons/IconSalesOrange.svg'
    },
    {
      id: '4',
      title: 'Как продавать продукцию?',
      author: 'Tannur Cosmetics',
      lessonsCount: 8,
      icon: '/icons/IconProductOrange.svg'
    }
  ];

  const ManagementButton = ({ title, icon }: { title: string; icon: React.ReactNode }) => (
    <button className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50 rounded-xl transition-colors group border border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 text-[#DC7C67]">
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-700">{title}</span>
      </div>
      <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );

  return (
    <div className="p-2 md:p-6">
      <header className="flex">
        <MoreHeader title="Академия Tannur" />
      </header>

      <div className="px-0">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column - Courses Table */}
          <div className="xl:col-span-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Категория курсов
            </h2>
            <div className="bg-white rounded-2xl overflow-hidden">
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-white">
                        ИМЯ
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-white">
                        СПИКЕР
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-white">
                        УРОКИ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {courses.map((course, index) => (
                      <tr key={course.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-orange-100 rounded-md flex items-center justify-center">
                              <span className="text-xs font-bold text-[#DC7C67]">
                                {String(index + 1).padStart(2, '0')}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {course.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {course.author}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {course.lessonsCount} уроков
                          </span>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Add Course Row */}
                    <tr className="hover:bg-gray-50 transition-colors cursor-pointer group">
                      <td colSpan={3} className="px-6 py-4">
                        <div className="flex items-center gap-3 text-gray-400 group-hover:text-[#DC7C67] transition-colors">
                          <div className="w-6 h-6 border-2 border-dashed border-current rounded-md flex items-center justify-center">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium">
                            Добавить курс
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Management */}
          <div className="xl:col-span-1 space-y-6">
            {/* Management Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mt-2">
                Управление
              </h3>
              <div className="space-y-2">
                <ManagementButton
                  title="Добавить курс"
                  icon={
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  }
                />
                <ManagementButton
                  title="Добавить спикера"
                  icon={
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />
                <ManagementButton
                  title="Добавить категорию"
                  icon={
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  }
                />
              </div>
            </div>

            {/* Speakers Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Спикеры
              </h3>
              <div className="space-y-2">
                <ManagementButton
                  title="Список спикеров"
                  icon={
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}