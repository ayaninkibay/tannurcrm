'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import { BookOpen, Clock, Play, ArrowRight, Award, ArrowLeft } from 'lucide-react';
import { useTranslate } from '@/hooks/useTranslate';
import { useAcademyModule } from '@/lib/academy/AcademyModule';
import { supabase } from '@/lib/supabase/client';

export default function CourseCategoryContent() {
  const { t } = useTranslate();
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams?.get('category');
  
  const { courses, loading, loadCourses } = useAcademyModule();
  const [categoryLessons, setCategoryLessons] = useState<any[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);

  useEffect(() => {
    loadCourses({ isPublished: true });
  }, []);

  useEffect(() => {
    const loadCategoryLessons = async () => {
      setLoadingLessons(true);
      
      // Фильтруем курсы по категории
      const categoryCourses = courses.filter(course => course.category === category);
      
      const allLessons: any[] = [];
      for (const course of categoryCourses) {
        // Загружаем уроки напрямую из Supabase
        const { data: lessons } = await supabase
          .from('course_lessons')
          .select('*')
          .eq('course_id', course.id)
          .eq('is_published', true)
          .order('order_index', { ascending: true });
        
        if (lessons) {
          const courseLessons = lessons.map(lesson => ({
            ...lesson,
            courseId: course.id,
            courseTitle: course.title,
            courseCategory: course.category
          }));
          allLessons.push(...courseLessons);
        }
      }
      setCategoryLessons(allLessons);
      setLoadingLessons(false);
    };

    if (courses.length > 0 && category) {
      loadCategoryLessons();
    }
  }, [courses, category]);

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '—';
    if (minutes < 60) return `${minutes} ${t('мин')}`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins ? `${hours} ${t('ч')} ${mins} ${t('мин')}` : `${hours} ${t('ч')}`;
  };

  if (loading || loadingLessons) {
    return (
      <div className="p-2 md:p-6">
        <MoreHeaderDE title={t('Загрузка...')} showBackButton={true} />
        <div className="mt-6 flex justify-center">
          <div className="text-gray-500">{t('Загрузка уроков...')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6">
      <MoreHeaderDE title={t(category || 'Курс')} showBackButton={true} />

      {/* Hero Section */}
      <div className="mt-4 bg-gradient-to-r from-[#D77E6C] to-[#E09080] rounded-2xl p-6 md:p-8 text-white mb-6">
        <div className="max-w-3xl">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">{category}</h1>
          <p className="text-white/90 text-sm md:text-base mb-5">
            {t('Изучайте материалы курса и развивайте свои навыки')}
          </p>
          <div className="flex flex-wrap gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm">{categoryLessons.length} {t('уроков')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm">
                {formatDuration(categoryLessons.reduce((sum, l) => sum + (l.duration_minutes || 0), 0))}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span className="text-sm">{t('Сертификат')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('Уроки курса')}</h2>
        
        {categoryLessons.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            {t('В этом курсе пока нет уроков')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryLessons.map((lesson, index) => (
              <Link
                key={lesson.id}
                href={`/dealer/education/courses?id=${lesson.courseId}&lesson=${lesson.id}`}
                className="border border-gray-200 rounded-xl p-4 hover:border-[#D77E6C]/30 hover:shadow-sm transition group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#D77E6C]/10 text-[#D77E6C] flex items-center justify-center flex-shrink-0">
                    <Play className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-1">
                      {t('Урок')} {index + 1}
                    </div>
                    <h3 className="text-base font-medium text-gray-900 mb-2 line-clamp-2">
                      {lesson.title}
                    </h3>
                    {lesson.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {lesson.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {formatDuration(lesson.duration_minutes)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#D77E6C] transition" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Back button */}
      <div className="mt-6">
        <Link
          href="/dealer/education"
          className="inline-flex items-center gap-2 text-[#D77E6C] hover:text-[#C66B5A] text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('Вернуться к курсам')}
        </Link>
      </div>
    </div>
  );
}