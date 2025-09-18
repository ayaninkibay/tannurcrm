'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { useTranslate } from '@/hooks/useTranslate';
import { useAcademyModule } from '@/lib/academy/AcademyModule';
import {
  ArrowLeft,
  Plus,
  Clock,
  BookOpen,
  BadgeCheck,
  Pencil,
  Eye,
  Trash2,
  Layers,
  Users,
  Calendar,
} from 'lucide-react';

// Вынесем основную логику в отдельный компонент
function CoursePageContent() {
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
    loadLessons,
    deleteLesson,
    updateCourse
  } = useAcademyModule();

  useEffect(() => {
    if (courseId) {
      loadCourse(courseId);
      loadLessons(courseId);
    }
  }, [courseId]);

  const handleDeleteLesson = async (lessonId: string) => {
    if (confirm(t('Вы уверены, что хотите удалить этот урок?'))) {
      await deleteLesson(lessonId);
      if (courseId) loadLessons(courseId);
    }
  };

  const goEditCourse = () => {
    router.push(`/admin/tnba/create_cours?id=${courseId}`);
  };

  const goAddLesson = () => {
    router.push(`/admin/tnba/create_cours/create_lesson?courseId=${courseId}`);
  };

  const editLesson = (lessonId: string) => {
    router.push(`/admin/tnba/create_cours/create_lesson?courseId=${courseId}&lessonId=${lessonId}`);
  };

  const togglePublish = async () => {
    if (!currentCourse || !courseId) return;
    
    try {
      await updateCourse(courseId, {
        isPublished: !currentCourse.is_published
      });
      loadCourse(courseId);
    } catch (err) {
      console.error('Error toggling publish:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-2 md:p-6">
        <MoreHeaderAD title={t('Загрузка...')} showBackButton={true} />
        <div className="mt-6 flex justify-center">
          <div className="text-gray-500">{t('Загрузка курса...')}</div>
        </div>
      </div>
    );
  }

  if (error || !currentCourse) {
    return (
      <div className="p-2 md:p-6">
        <MoreHeaderAD title={t('Курс')} showBackButton={true} />
        <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('Курс не найден')}</h3>
          <p className="text-gray-500 mb-6">{error || t('Проверьте правильность ссылки')}</p>
          <Link
            href="/admin/tnba"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#D77E6C] hover:bg-[#C66B5A] text-white font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('Назад к академии')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6">
      <MoreHeaderAD title={t('Курс')} showBackButton={true} />

      {/* Course Header */}
      <div className="mt-4 md:mt-6 bg-white rounded-2xl border border-gray-200 p-6 md:p-8 relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#D77E6C]/5 rounded-full"></div>
        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-[#D77E6C]/8 rounded-full"></div>
        <div className="absolute top-1/2 right-4 w-12 h-12 bg-[#D77E6C]/10 rounded-full"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-[#D77E6C] to-[#C66B5A] rounded-xl">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                  currentCourse.is_published 
                    ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200' 
                    : 'bg-amber-100 text-amber-800 ring-1 ring-amber-200'
                }`}>
                  {currentCourse.is_published ? (
                    <>
                      <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                      {t('Опубликован')}
                    </>
                  ) : (
                    <>
                      <span className="inline-block w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                      {t('Черновик')}
                    </>
                  )}
                </span>
              </div>

              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 leading-tight">
                {currentCourse.title}
              </h1>
              
              {currentCourse.short_description && (
                <p className="text-gray-600 text-sm md:text-base mb-6 leading-relaxed">
                  {currentCourse.short_description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full">
                  <Clock className="w-4 h-4 text-[#D77E6C]" />
                  <span>{currentCourse.duration_hours || 0} {t('часов')}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full">
                  <BookOpen className="w-4 h-4 text-[#D77E6C]" />
                  <span>{lessons.length} {t('уроков')}</span>
                </div>
                {currentCourse.category && (
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full">
                    <Layers className="w-4 h-4 text-[#D77E6C]" />
                    <span>{currentCourse.category}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 lg:flex-col lg:w-56">
              <button
                onClick={goEditCourse}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#D77E6C] hover:bg-[#C66B5A] text-white rounded-xl font-medium transition-colors"
              >
                <Pencil className="w-4 h-4" />
                {t('Редактировать')}
              </button>
              
              <div className="flex flex-col gap-2">
                <button
                  onClick={togglePublish}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
                    currentCourse.is_published
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200'
                      : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  <BadgeCheck className="w-4 h-4" />
                  {currentCourse.is_published ? t('Снять с публикации') : t('Опубликовать курс')}
                </button>
                
                <div className="text-xs text-gray-500 px-2">
                  {currentCourse.is_published 
                    ? t('Курс виден всем дилерам в академии')
                    : t('Курс скрыт от дилеров, работа в черновике')
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4 md:mt-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-700 mb-2">
            <BookOpen className="w-4 h-4 text-[#D77E6C]" />
            <span className="text-xs font-medium">{t('Уроков')}</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{lessons.length}</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-700 mb-2">
            <Clock className="w-4 h-4 text-[#D77E6C]" />
            <span className="text-xs font-medium">{t('Длительность')}</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{currentCourse.duration_hours || 0} ч</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-700 mb-2">
            <Users className="w-4 h-4 text-[#D77E6C]" />
            <span className="text-xs font-medium">{t('Просмотров')}</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">—</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-700 mb-2">
            <Calendar className="w-4 h-4 text-[#D77E6C]" />
            <span className="text-xs font-medium">{t('Обновлен')}</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {new Date(currentCourse.updated_at || currentCourse.created_at || '').toLocaleDateString('ru')}
          </div>
        </div>
      </div>

      {/* Lessons Section */}
      <div className="mt-4 md:mt-6 bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{t('Уроки курса')}</h2>
          <button
            onClick={goAddLesson}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D77E6C] hover:bg-[#C66B5A] text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('Добавить урок')}
          </button>
        </div>

        {lessons.length === 0 ? (
          <div className="p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('В курсе пока нет уроков')}</h3>
            <p className="text-gray-500 mb-6">{t('Добавьте первый урок, чтобы начать обучение')}</p>
            <button
              onClick={goAddLesson}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#D77E6C] hover:bg-[#C66B5A] text-white rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t('Создать урок')}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {lessons.map((lesson, index) => (
              <div key={lesson.id} className="p-4 md:p-6 hover:bg-gray-50 transition-colors group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-[#D77E6C]/10 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-semibold text-[#D77E6C]">{index + 1}</span>
                      </div>
                      <h3 className="font-medium text-gray-900 group-hover:text-[#C66B5A] transition-colors">
                        {lesson.title}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 ml-11">
                      {lesson.duration_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{lesson.duration_minutes} {t('мин')}</span>
                        </div>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        lesson.is_published 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {lesson.is_published ? t('Опубликован') : t('Черновик')}
                      </span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(lesson.updated_at || lesson.created_at || '').toLocaleDateString('ru')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => editLesson(lesson.id)}
                      className="p-2 hover:bg-[#D77E6C]/10 rounded-lg transition-colors"
                      title={t('Редактировать')}
                    >
                      <Pencil className="w-4 h-4 text-[#D77E6C]" />
                    </button>
                    <button
                      onClick={() => router.push(`/dealer/education/courses?id=${courseId}&lesson=${lesson.id}`)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      title={t('Просмотр')}
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteLesson(lesson.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title={t('Удалить')}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Главный компонент с Suspense
export default function AdminCoursePage() {
  return (
    <Suspense 
      fallback={
        <div className="p-2 md:p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="h-48 bg-gray-100 rounded-2xl mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="h-20 bg-gray-100 rounded-xl"></div>
              <div className="h-20 bg-gray-100 rounded-xl"></div>
              <div className="h-20 bg-gray-100 rounded-xl"></div>
              <div className="h-20 bg-gray-100 rounded-xl"></div>
            </div>
            <div className="h-64 bg-gray-100 rounded-2xl"></div>
          </div>
        </div>
      }
    >
      <CoursePageContent />
    </Suspense>
  );
}