// src/app/admin/tnba/page.tsx  (или ваш фактический путь)
'use client';

import React, { useState } from 'react';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import TannurButton from '@/components/Button';

interface Course {
  id: string;
  title: string;
  author: string;
  lessonsCount: number;
  icon: string;
}

export default function AcademyTannur() {
  const [selectedCategory] = useState('courses');

  const courses: Course[] = [
    {
      id: '1',
      title: 'Знакомство с Tannur',
      author: 'Tannur Cosmetics',
      lessonsCount: 6,
      icon: '/icons/IconEducationOrange.svg',
    },
    {
      id: '2',
      title: 'Маркетинговая стратегия',
      author: 'Insy Anuarben',
      lessonsCount: 5,
      icon: '/icons/IconMarketingOrange.svg',
    },
    {
      id: '3',
      title: 'Менеджер по продажам',
      author: 'Сыймова Мариям',
      lessonsCount: 13,
      icon: '/icons/IconSalesOrange.svg',
    },
    {
      id: '4',
      title: 'Как продавать продукцию?',
      author: 'Tannur Cosmetics',
      lessonsCount: 8,
      icon: '/icons/IconProductOrange.svg',
    },
  ];

  return (
    <div className="p-2 md:p-6">
      <header className="flex">
        <MoreHeaderAD title="Академия Tannur" />
      </header>

      <div className="px-0">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Левая колонка — таблица курсов */}
          <div className="xl:col-span-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Категория курсов</h2>

            <div className="bg-white rounded-2xl overflow-hidden">
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
                      <tr
                        key={course.id}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-orange-100 rounded-md flex items-center justify-center">
                              <span className="text-xs font-bold text-[#DC7C67]">
                                {String(index + 1).padStart(2, '0')}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{course.title}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{course.author}</span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{course.lessonsCount} уроков</span>
                        </td>
                      </tr>
                    ))}

                    {/* Добавить курс */}
                    <tr className="hover:bg-gray-50 transition-colors cursor-pointer group">
                      <td colSpan={3} className="px-6 py-4">
                        <div className="flex items-center gap-3 text-gray-400 group-hover:text-[#DC7C67] transition-colors">
                          <div className="w-6 h-6 border-2 border-dashed border-current rounded-md flex items-center justify-center">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                          </div>
                          <span className="text-sm font-medium">Добавить курс</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Правая колонка — кнопки управления на TannurButton */}
          <div className="xl:col-span-1 space-y-6">
            {/* Управление */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mt-2">Управление</h3>

              <div className="space-y-2">
                <TannurButton
                  text="Добавить курс"
                  href="#"
                  iconSrc="/icons/iconusersorange.svg"
                  variant="white"
                  arrow="black"
                />
                <TannurButton
                  text="Добавить спикера"
                  href="#"
                  iconSrc="/icons/iconusersorange.svg"
                  variant="white"
                  arrow="black"
                />
                <TannurButton
                  text="Добавить категорию"
                  href="#"
                  iconSrc="/icons/iconusersorange.svg"
                  variant="white"
                  arrow="black"
                />
              </div>
            </div>

            {/* Спикеры */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Спикеры</h3>

              <div className="space-y-2">
                <TannurButton
                  text="Список спикеров"
                  href="#"
                  iconSrc="/icons/iconusersorange.svg"
                  variant="white"
                  arrow="black"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
