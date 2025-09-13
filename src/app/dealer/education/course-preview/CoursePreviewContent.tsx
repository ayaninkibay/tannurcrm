'use client';

import React, { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import { BookOpen, Clock, Play, Lock, Award, ArrowLeft } from 'lucide-react';
import { useTranslate } from '@/hooks/useTranslate';
import { useAcademyModule } from '@/lib/academy/AcademyModule';

export default function CoursePreviewContent() {
  const { t } = useTranslate();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams?.get('id');
  
  const { 
    currentCourse,
    lessons,
    loading,
    loadCourse,
    loadLessons
  } = useAcademyModule();

  useEffect(() => {
    if (courseId) {
      loadCourse(courseId);
      loadLessons(courseId);
    }
  }, [courseId]);

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '—';
    if (minutes < 60) return `${minutes} ${t('мин')}`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins ? `${hours} ${t('ч')} ${mins} ${t('мин')}` : `${hours} ${t('ч')}`;
  };

  const getTotalDuration = () => {
    const totalMinutes = lessons.reduce((sum, lesson) => sum + (lesson.duration_minutes || 0), 0);
    return formatDuration(totalMinutes);
  };

  const startCourse = () => {
    if (lessons.length > 0) {
      router.push(`/dealer/education/courses?id=${courseId}&lesson=${lessons[0].id}`);
    }
  };

  if (loading) {
    return (
      <div className="p-2 md:p-6">
        <MoreHeaderDE title={t('Загрузка...')} showBackButton={true} />
        <div className="mt-6 flex justify-center">
          <div className="text-gray-500">{t('Загрузка курса...')}</div>
        </div>
      </div>
    );
  }

  if (!currentCourse) {
    return (
      <div className="p-2 md:p-6">
        <MoreHeaderDE title={t('Курс')} showBackButton={true} />
        <div className="mt-6 bg-white rounded-xl p-6">
          <div className="text-gray-500">{t('Курс не найден')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6">
      <MoreHeaderDE title={t('Курс')} showBackButton={true} />

      {/* Hero Section */}
      <div className="mt-4 bg-gradient-to-r from-[#D77E6C] to-[#E09080] rounded-2xl p-6 md:p-8 text-white mb-6">
        <div className="max-w-3xl">
          <div className="text-sm opacity-90 mb-2">{currentCourse.category}</div>
          <h1 className="text-2xl md:text-3xl font-bold mb-3">{currentCourse.title}</h1>
          <p className="text-white/90 text-sm md:text-base mb-5">
            {currentCourse.short_description || currentCourse.full_description}
          </p>
          <div className="flex flex-wrap gap-4 md:gap-6 mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm">{lessons.length} {t('уроков')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm">{getTotalDuration()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span className="text-sm">{t('Сертификат')}</span>
            </div>
          </div>
          
          {lessons.length > 0 && (
            <button
              onClick={startCourse}
              className="px-6 py-3 bg-white text-[#D77E6C] rounded-lg font-medium hover:bg-gray-100 transition"
            >
              {t('Начать курс')}
            </button>
          )}
        </div>
      </div>

      {/* Course Description */}
      {currentCourse.full_description && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('О курсе')}</h2>
          <div className="text-sm text-gray-700 leading-6 whitespace-pre-wrap">
            {currentCourse.full_description}
          </div>
        </div>
      )}

      {/* Lessons List */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('Программа курса')}</h2>
        
        {lessons.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            {t('В этом курсе пока нет уроков')}
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, index) => {
              const isLocked = !lesson.is_preview && index > 0; // Первый урок всегда доступен
              
              return (
                <Link
                  key={lesson.id}
                  href={isLocked ? '#' : `/dealer/education/courses?id=${courseId}&lesson=${lesson.id}`}
                  onClick={isLocked ? (e) => e.preventDefault() : undefined}
                  className={`block border rounded-xl p-4 transition ${
                    isLocked 
                      ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60' 
                      : 'border-gray-200 hover:border-[#D77E6C]/30 hover:shadow-sm cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isLocked ? 'bg-gray-200' : 'bg-[#D77E6C]/10 text-[#D77E6C]'
                    }`}>
                      {isLocked ? (
                        <Lock className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">
                        {t('Урок')} {index + 1}
                      </div>
                      <h3 className="text-base font-medium text-gray-900 mt-1">
                        {lesson.title}
                      </h3>
                      {lesson.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                          {lesson.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      {formatDuration(lesson.duration_minutes)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Back to courses button */}
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