'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import { BookOpen, Clock, Play, ArrowRight, Users, Award } from 'lucide-react';
import { useTranslate } from '@/hooks/useTranslate';
import { useAcademyModule } from '@/lib/academy/AcademyModule';

export default function AllCoursesContent() {
  const { t } = useTranslate();
  const searchParams = useSearchParams();
  const categoryTitle = searchParams?.get('title');
  
  const { courses, loading, loadCourses } = useAcademyModule();
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);

  useEffect(() => {
    loadCourses({ isPublished: true });
  }, []);

  useEffect(() => {
    if (categoryTitle) {
      const filtered = courses.filter(course => 
        course.category?.toLowerCase().includes(categoryTitle.toLowerCase()) ||
        categoryTitle.toLowerCase().includes(course.category?.toLowerCase())
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  }, [courses, categoryTitle]);

  const getCategoryName = () => {
    if (categoryTitle?.includes('Знакомство')) return 'Знакомство с Tannur';
    if (categoryTitle?.includes('Маркет')) return 'Маркетинговая стратегия';
    if (categoryTitle?.includes('продаж')) return 'Менеджер по продажам';
    if (categoryTitle?.includes('продавать')) return 'Как продавать продукцию?';
    return 'Все курсы';
  };

  const formatDuration = (hours: number | null) => {
    if (!hours) return '—';
    if (hours < 1) return `${Math.round(hours * 60)} ${t('мин')}`;
    return `${hours} ${t('ч')}`;
  };

  if (loading) {
    return (
      <div className="p-2 md:p-6">
        <MoreHeaderDE title={t('Загрузка...')} showBackButton={true} />
        <div className="mt-6 flex justify-center">
          <div className="text-gray-500">{t('Загрузка курсов...')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6">
      <MoreHeaderDE title={t(getCategoryName())} showBackButton={true} />

      {/* Hero Section */}
      <div className="mt-4 bg-[#D77E6C] rounded-2xl p-6 md:p-8 text-white mb-6">
        <div className="max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {t('Развивайте навыки вместе с Tannur')}
          </h1>
          <p className="text-white/90 text-sm md:text-base">
            {t('Пройдите обучение и станьте экспертом в продажах косметики')}
          </p>
          <div className="flex flex-wrap gap-4 md:gap-6 mt-5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm">{filteredCourses.length} {t('курсов')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">{t('Экспертные преподаватели')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span className="text-sm">{t('Сертификаты')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="max-w-sm mx-auto">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('Курсы не найдены')}</h3>
            <p className="text-sm text-gray-500">{t('В этой категории пока нет доступных курсов')}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <Link
              key={course.id}
              href={`/dealer/education/courses?id=${course.id}`}
              className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-200 group block"
            >
              <div className="relative h-48 overflow-hidden bg-gray-100">
                {course.cover_image ? (
                  <img 
                    src={course.cover_image} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-[#D77E6C] ml-1" />
                  </div>
                </div>
              </div>

              <div className="p-4">
                <span className="inline-block text-xs text-[#D77E6C] font-medium mb-2">
                  {course.category}
                </span>
                <h3 className="text-base font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[48px]">
                  {course.title}
                </h3>
                
                {course.short_description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {course.short_description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{course.lessons_count || 0} {t('уроков')}</span>
                    </div>
                    {course.duration_hours && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(course.duration_hours)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full bg-gray-100 group-hover:bg-[#D77E6C] text-gray-700 group-hover:text-white py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2">
                  <span>{t('Начать курс')}</span>
                  <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}