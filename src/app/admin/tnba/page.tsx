'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import TannurButton from '@/components/Button';
import { useTranslate } from '@/hooks/useTranslate';
import { AcademyProvider, useAcademyModule } from '@/lib/academy/AcademyModule';
import { BookOpen, Edit2, Eye, Trash2 } from 'lucide-react';

export default function AcademyTannurPage() {
  return (
    <AcademyProvider>
      <AcademyContent />
    </AcademyProvider>
  );
}

function AcademyContent() {
  const router = useRouter();
  const { t } = useTranslate();
  const [mounted, setMounted] = useState(false);
  
  const { 
    courses, 
    loading, 
    error,
    loadCourses,
    deleteCourse 
  } = useAcademyModule();

  useEffect(() => {
    setMounted(true);
    loadCourses();
  }, []);

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm(t('Вы уверены, что хотите удалить этот курс?'))) {
      await deleteCourse(courseId);
      loadCourses();
    }
  };

  // Предотвращаем рендеринг до монтирования на клиенте
  if (!mounted) {
    return (
      <div className="p-2 md:p-6">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-2 md:p-6">
        <MoreHeaderAD title="Академия Tannur" />
        <div className="mt-6 flex justify-center">
          <div className="text-gray-500">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2 md:p-6">
        <MoreHeaderAD title="Академия Tannur" />
        <div className="mt-6 bg-red-50 rounded-xl p-4">
          <div className="text-red-600">Ошибка: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="flex">
        <MoreHeaderAD title={t('Академия Tannur')} />
      </header>

      <div className="px-0">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Таблица курсов */}
          <div className="xl:col-span-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Все курсы
            </h2>

            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        НАЗВАНИЕ
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        КАТЕГОРИЯ
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        АВТОР
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        УРОКИ
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        СТАТУС
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ДЕЙСТВИЯ
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
                            {course.category}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            Tannur Cosmetics
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {course.lessons_count || 0} уроков
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            course.is_published 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {course.is_published ? 'Опубликован' : 'Черновик'}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => router.push(`/admin/tnba/course?id=${course.id}`)}
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Просмотр"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => router.push(`/admin/tnba/create_cours?id=${course.id}`)}
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Редактировать"
                            >
                              <Edit2 className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course.id)}
                              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                              title="Удалить"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {courses.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          Курсы не найдены
                        </td>
                      </tr>
                    )}

                    {/* Добавить курс */}
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td colSpan={6} className="px-6 py-4">
                        <Link
                          href="/admin/tnba/create_cours"
                          className="flex items-center gap-3 text-gray-400 hover:text-[#DC7C67] transition-colors"
                        >
                          <span className="w-6 h-6 border-2 border-dashed border-current rounded-md flex items-center justify-center">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" />
                            </svg>
                          </span>
                          <span className="text-sm font-medium">Добавить курс</span>
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#DC7C67]/10 rounded-lg">
                    <BookOpen className="w-5 h-5 text-[#DC7C67]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{courses.length}</div>
                    <div className="text-sm text-gray-500">Всего курсов</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Eye className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {courses.filter(c => c.is_published).length}
                    </div>
                    <div className="text-sm text-gray-500">Опубликовано</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Edit2 className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {courses.filter(c => !c.is_published).length}
                    </div>
                    <div className="text-sm text-gray-500">Черновики</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Кнопки управления */}
          <div className="xl:col-span-1 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mt-2">
                Управление
              </h3>

              <div className="space-y-2">
                <TannurButton
                  text="Добавить курс"
                  href="/admin/tnba/create_cours"
                  iconSrc="/icons/iconusersorange.svg"
                  variant="white"
                  arrow="black"
                />
                <TannurButton
                  text="Категории"
                  href="/admin/tnba/categories"
                  iconSrc="/icons/iconusersorange.svg"
                  variant="white"
                  arrow="black"
                />
                <TannurButton
                  text="Студенты"
                  href="/admin/tnba/students"
                  iconSrc="/icons/iconusersorange.svg"
                  variant="white"
                  arrow="black"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Отчеты
              </h3>
              <div className="space-y-2">
                <TannurButton
                  text="Статистика"
                  href="/admin/tnba/statistics"
                  iconSrc="/icons/iconusersorange.svg"
                  variant="white"
                  arrow="black"
                />
                <TannurButton
                  text="Прогресс студентов"
                  href="/admin/tnba/progress"
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