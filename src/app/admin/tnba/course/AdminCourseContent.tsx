'use client';

import React, { useEffect } from 'react';
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
} from 'lucide-react';

export default function AdminCoursePage() {
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
        <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-6">
          <div className="text-gray-700">{error || t('Курс не найден')}</div>
          <div className="mt-4 flex gap-2">
            <Link
              href="/admin/tnba"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('Назад к Академии')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    { icon: BookOpen, label: 'Уроков', value: lessons.length },
    { icon: Clock, label: 'Длительность', value: `${currentCourse.duration_hours || 0} ч` },
    { icon: Layers, label: 'Статус', value: currentCourse.is_published ? 'Опубликован' : 'Черновик' },
  ];

  return (
    <div className="p-2 md:p-6">
      <MoreHeaderAD title={t('Курс')} showBackButton={true} />

      {/* Header */}
      <div className="mt-6 rounded-2xl p-6 md:p-8 text-white bg-gradient-to-r from-[#D77E6C] to-[#E09080]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/15 px-2.5 py-1 rounded-full text-xs font-medium mb-3">
              <BadgeCheck className="w-4 h-4" />
              {t(currentCourse.category)}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">{currentCourse.title}</h1>
            <p className="mt-2 text-white/90 text-sm md:text-base">
              {currentCourse.short_description || currentCourse.full_description}
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{currentCourse.duration_hours || 0} {t('часов')}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{lessons.length} {t('уроков')}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={goEditCourse}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-gray-900 hover:bg-gray-100 font-medium"
            >
              <Pencil className="w-4 h-4" />
              {t('Редактировать курс')}
            </button>
            <button
              onClick={togglePublish}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/15 hover:bg-white/20 text-white font-medium"
            >
              <BadgeCheck className="w-4 h-4" />
              {currentCourse.is_published ? t('Снять с публикации') : t('Опубликовать курс')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mt-6">
        {statCards.map((c, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-700 mb-1">
              <c.icon className="w-4 h-4 text-[#D77E6C]" />
              <span className="text-xs font-medium">{t(c.label)}</span>
            </div>
            <div className="text-xl font-semibold text-gray-900">
              {typeof c.value === 'string' ? t(c.value) : c.value}
            </div>
          </div>
        ))}
      </div>

      {/* Lessons */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold">{t('Уроки курса')}</h2>
          <button
            onClick={goAddLesson}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#D77E6C] hover:bg-[#C66B5A] text-white text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            {t('Добавить урок')}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-5 text-xs font-medium text-gray-600">#</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-gray-600">{t('Название')}</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-gray-600">{t('Длительность')}</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-gray-600">{t('Статус')}</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-gray-600">{t('Обновлён')}</th>
                <th className="text-center py-3 px-5 text-xs font-medium text-gray-600">{t('Действия')}</th>
              </tr>
            </thead>
            <tbody>
              {lessons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    {t('В этом курсе пока нет уроков.')}
                  </td>
                </tr>
              ) : (
                lessons.map((lesson, index) => (
                  <tr key={lesson.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-5 font-mono text-sm text-gray-700">{index + 1}</td>
                    <td className="py-3 px-5">
                      <div className="font-medium text-gray-900">{lesson.title}</div>
                    </td>
                    <td className="py-3 px-5 text-sm text-gray-700">
                      {lesson.duration_minutes ? `${lesson.duration_minutes} ${t('мин')}` : '—'}
                    </td>
                    <td className="py-3 px-5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        lesson.is_published 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {lesson.is_published ? t('Опубликован') : t('Черновик')}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-sm text-gray-600">
                      {new Date(lesson.updated_at || lesson.created_at || '').toLocaleDateString()}
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => editLesson(lesson.id)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title={t('Редактировать')}
                        >
                          <Pencil className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => router.push(`/dealer/education/courses?id=${courseId}&lesson=${lesson.id}`)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title={t('Просмотр')}
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                          title={t('Удалить')}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}