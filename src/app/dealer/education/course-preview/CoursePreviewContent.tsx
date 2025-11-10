'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import { 
  BookOpen, Clock, Play, Lock, Award, ArrowLeft, Users, 
  Target, CheckCircle, Globe, BarChart3, Star
} from 'lucide-react';
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
    error,
    loadCourse,
    loadLessons
  } = useAcademyModule();

  const [loadingStates, setLoadingStates] = useState({
    course: true,
    lessons: true
  });

  useEffect(() => {
    if (courseId) {
      setLoadingStates({ course: true, lessons: true });

      Promise.all([
        loadCourse(courseId),
        loadLessons(courseId)
      ]).then(() => {
        setLoadingStates({ course: false, lessons: false });
      }).catch(() => {
        setLoadingStates({ course: false, lessons: false });
      });
    }
  }, [courseId, loadCourse, loadLessons]);

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '—';
    if (minutes < 60) return `${minutes}м`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins ? `${hours}ч ${mins}м` : `${hours}ч`;
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

  // Loading skeleton
  if (loadingStates.course || loadingStates.lessons) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 md:p-6">
          <div className="animate-pulse mb-6">
            <div className="h-12 bg-gray-200 rounded-lg w-1/3"></div>
          </div>
          
          {/* Hero skeleton */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200 mb-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-2 mb-6">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="flex gap-4 mb-6">
              <div className="h-6 bg-gray-200 rounded w-24"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="h-6 bg-gray-200 rounded w-28"></div>
            </div>
            <div className="h-12 bg-gray-200 rounded w-32"></div>
          </div>
          
          {/* Stats skeleton */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-8 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-12 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
          
          {/* Lessons skeleton */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if ((!loadingStates.course && !currentCourse) || error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 md:p-6">
          <MoreHeaderDE title={t('Курс')} showBackButton={true} />
          
          <div className="max-w-2xl mx-auto text-center mt-20">
            <div className="bg-white rounded-3xl p-12 border border-gray-200">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('Курс недоступен')}</h2>
              <p className="text-gray-600 mb-8">{error || t('Курс не найден или был удален')}</p>
              <Link 
                href="/dealer/education" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#D77E6C] hover:bg-[#C66B5A] text-white rounded-xl font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('Вернуться к курсам')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if course exists
  if (!currentCourse) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 md:p-6">
          <MoreHeaderDE title={t('Курс')} showBackButton={true} />

          <div className="max-w-2xl mx-auto text-center mt-20">
            <div className="bg-white rounded-3xl p-12 border border-gray-200">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('Курс недоступен')}</h2>
              <p className="text-gray-600 mb-8">{t('Курс не найден или был удален')}</p>
              <Link
                href="/dealer/education"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#D77E6C] hover:bg-[#C66B5A] text-white rounded-xl font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('Вернуться к курсам')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 md:p-6">
        <MoreHeaderDE title={t('Превью курса')} showBackButton={true} />

        <div className="mx-auto px-4">
          {/* Hero Section */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 mb-8 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-[#D77E6C]/5 rounded-full"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-[#D77E6C]/8 rounded-full"></div>

            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                <div className="flex-1">
                  {currentCourse.category && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D77E6C]/10 text-[#D77E6C] rounded-full text-sm font-medium mb-3">
                      <Target className="w-4 h-4" />
                      {currentCourse.category}
                    </div>
                  )}
                  
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                    {currentCourse.title}
                  </h1>
                  
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {currentCourse.short_description || currentCourse.full_description}
                  </p>

                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="p-2 bg-[#D77E6C]/10 rounded-lg">
                        <BookOpen className="w-4 h-4 text-[#D77E6C]" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{lessons.length}</div>
                        <div className="text-sm">{t('уроков')}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="p-2 bg-[#D77E6C]/10 rounded-lg">
                        <Clock className="w-4 h-4 text-[#D77E6C]" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{getTotalDuration()}</div>
                        <div className="text-sm">{t('длительность')}</div>
                      </div>
                    </div>
                  </div>

                  {lessons.length > 0 && (
                    <button
                      onClick={startCourse}
                      className="px-6 py-3 bg-[#D77E6C] hover:bg-[#C66B5A] text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      {t('Начать обучение')}
                    </button>
                  )}
                </div>

                {/* Course Image or Placeholder */}
                <div className="lg:w-64 lg:flex-shrink-0">
                  {currentCourse.cover_image ? (
                    <div className="relative w-full h-48 lg:h-56 rounded-xl overflow-hidden">
                      <Image
                        src={currentCourse.cover_image}
                        alt={currentCourse.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 lg:h-56 bg-gradient-to-br from-[#D77E6C]/20 to-[#C66B5A]/20 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-[#D77E6C]" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Lessons List */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('Программа курса')}</h2>
              
              {lessons.length === 0 ? (
                <div className="text-gray-500 text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>{t('В курсе пока нет уроков')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lessons.map((lesson, index) => {
                    const isLocked = !lesson.is_preview && !lesson.is_published;
                    
                    return (
                      <Link
                        key={lesson.id}
                        href={isLocked ? '#' : `/dealer/education/courses?id=${courseId}&lesson=${lesson.id}`}
                        onClick={isLocked ? (e) => e.preventDefault() : undefined}
                        className={`block border-2 rounded-xl p-4 transition-all duration-200 ${
                          isLocked 
                            ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60' 
                            : 'border-gray-200 hover:border-[#D77E6C]/50 hover:bg-gray-50 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isLocked 
                              ? 'bg-gray-200' 
                              : 'bg-[#D77E6C]/10 text-[#D77E6C]'
                          }`}>
                            {isLocked ? (
                              <Lock className="w-5 h-5 text-gray-400" />
                            ) : (
                              <Play className="w-5 h-5" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs px-2 py-1 rounded font-medium bg-gray-100 text-gray-500">
                                {t('Урок')} {index + 1}
                              </span>
                            </div>
                            <h3 className="text-base font-semibold leading-tight text-gray-900">
                              {lesson.title}
                            </h3>
                            {lesson.description && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {lesson.description}
                              </p>
                            )}
                            <div className="text-sm text-gray-500 mt-2">
                              {formatDuration(lesson.duration_minutes)}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Course Description */}
            {currentCourse.full_description && currentCourse.full_description !== currentCourse.short_description && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
                  <BookOpen className="w-5 h-5 text-[#D77E6C]" />
                  {t('О курсе')}
                </h2>
                <div className="text-gray-700 leading-relaxed">
                  {currentCourse.full_description}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back to courses */}
        <div className="mx-auto px-4 mt-8">
          <Link
            href="/dealer/education"
            className="inline-flex items-center gap-2 px-6 py-3 text-[#D77E6C] hover:text-[#C66B5A] hover:bg-[#D77E6C]/5 rounded-xl font-medium transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('Вернуться к курсам')}
          </Link>
        </div>
      </div>
    </div>
  );
}