'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import TannurButton from '@/components/Button';
import { useTranslate } from '@/hooks/useTranslate';

interface Course {
  id: string;
  slug: string;
  title: string;
  author: string;
  lessonsCount: number;
  icon: string;
}

const STORAGE_KEY = 'tnba:selectedCourseSlug';

export default function AcademyTannur() {
  const router = useRouter();
  const { t } = useTranslate();

  const courses: Course[] = [
    {
      id: '1',
      slug: 'znakomstvo-tannur',
      title: 'Знакомство с Tannur',
      author: 'Tannur Cosmetics',
      lessonsCount: 6,
      icon: '/icons/IconEducationOrange.svg'
    },
    {
      id: '2',
      slug: 'marketing-strategy',
      title: 'Маркетинговая стратегия',
      author: 'Insy Anuarben',
      lessonsCount: 5,
      icon: '/icons/IconMarketingOrange.svg'
    },
    {
      id: '3',
      slug: 'sales-manager',
      title: 'Менеджер по продажам',
      author: 'Сыймова Мариям',
      lessonsCount: 13,
      icon: '/icons/IconSalesOrange.svg'
    },
    {
      id: '4',
      slug: 'how-to-sell-products',
      title: 'Как продавать продукцию?',
      author: 'Tannur Cosmetics',
      lessonsCount: 8,
      icon: '/icons/IconProductOrange.svg'
    }
  ];

  const openCourse = (slug: string) => {
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(STORAGE_KEY, slug);
      }
    } catch {}
    router.push('/admin/tnba/course');
  };

  return (
    <div className="p-2 md:p-6">
      <header className="flex">
        <MoreHeaderAD title={t('Академия Tannur')} />
      </header>

      <div className="px-0">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Левая колонка — таблица курсов */}
          <div className="xl:col-span-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              {t('Категория курсов')}
            </h2>

            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-white">
                        {t('ИМЯ')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-white">
                        {t('СПИКЕР')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-white">
                        {t('УРОКИ')}
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white">
                    {courses.map((course, index) => (
                      <tr
                        key={course.id}
                        onClick={() => openCourse(course.slug)}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                        title={t('Открыть курс')}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-orange-100 rounded-md flex items-center justify-center">
                              <span className="text-xs font-bold text-[#DC7C67]">
                                {String(index + 1).padStart(2, '0')}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {t(course.title)}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {t(course.author)}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {t('{count} уроков').replace('{count}', String(course.lessonsCount))}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {/* Добавить курс */}
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td colSpan={3} className="px-6 py-4">
                        <Link
                          href="/admin/tnba/create_cours"
                          className="flex items-center gap-3 text-gray-400 hover:text-[#DC7C67] transition-colors"
                          title={t('Добавить курс')}
                        >
                          <span className="w-6 h-6 border-2 border-dashed border-current rounded-md flex items-center justify-center">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" />
                            </svg>
                          </span>
                          <span className="text-sm font-medium">{t('Добавить курс')}</span>
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Правая колонка — кнопки управления */}
          <div className="xl:col-span-1 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mt-2">
                {t('Управление')}
              </h3>

              <div className="space-y-2">
                <TannurButton
                  text={t('Добавить курс')}
                  href="/admin/tnba/create_cours"
                  iconSrc="/icons/iconusersorange.svg"
                  variant="white"
                  arrow="black"
                />
                <TannurButton
                  text={t('Добавить урок')}
                  href="/admin/tnba/create_cours/create_lesson"
                  iconSrc="/icons/iconusersorange.svg"
                  variant="white"
                  arrow="black"
                />
                <TannurButton
                  text={t('Добавить категорию')}
                  href="#"
                  iconSrc="/icons/iconusersorange.svg"
                  variant="white"
                  arrow="black"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('Спикеры')}
              </h3>
              <div className="space-y-2">
                <TannurButton
                  text={t('Список спикеров')}
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
