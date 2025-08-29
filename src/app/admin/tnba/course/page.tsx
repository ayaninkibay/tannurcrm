'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import {
  ArrowLeft,
  Plus,
  Clock,
  Users,
  BookOpen,
  BadgeCheck,
  Pencil,
  Eye,
  Layers,
} from 'lucide-react';
import { useTranslate } from '@/hooks/useTranslate';

type LessonStatus = 'draft' | 'published';
interface Lesson {
  id: string;
  order: number;
  title: string;
  duration: string;
  status: LessonStatus;
  updatedAt: string;
}

interface Course {
  slug: string;
  title: string;
  author: string;
  category: string;
  lessonsCount: number;
  totalDuration: string;
  students: number;
  status: 'draft' | 'published';
  description: string;
  color?: string;
}

const COURSE_LIST: Course[] = [
  {
    slug: 'znakomstvo-tannur',
    title: 'Знакомство с Tannur',
    author: 'Tannur Cosmetics',
    category: 'Введение',
    lessonsCount: 6,
    totalDuration: '1ч 45м',
    students: 1240,
    status: 'published',
    description:
      'Быстрый курс, который познакомит вас с философией Tannur, линейками продуктов и базовыми принципами работы с клиентами.',
    color: '#D77E6C',
  },
  {
    slug: 'marketing-strategy',
    title: 'Маркетинговая стратегия',
    author: 'Insy Anuarben',
    category: 'Маркетинг',
    lessonsCount: 5,
    totalDuration: '2ч 30м',
    students: 860,
    status: 'draft',
    description:
      'Пошаговый план продвижения и упаковки личного бренда для роста продаж и команды.',
    color: '#E09080',
  },
];

const LESSONS_BY_SLUG: Record<string, Lesson[]> = {
  'znakomstvo-tannur': [
    { id: 'l1', order: 1, title: 'Что такое Tannur?', duration: '12 мин', status: 'published', updatedAt: '2025-01-20 10:15' },
    { id: 'l2', order: 2, title: 'Линейки продуктов и их ключевые эффекты', duration: '18 мин', status: 'published', updatedAt: '2025-01-20 11:00' },
    { id: 'l3', order: 3, title: 'Как провести первое знакомство с клиентом', duration: '22 мин', status: 'published', updatedAt: '2025-01-20 12:30' },
    { id: 'l4', order: 4, title: 'Частые вопросы и работа с возражениями', duration: '16 мин', status: 'published', updatedAt: '2025-01-21 09:40' },
    { id: 'l5', order: 5, title: 'Мини-чеклист по старту', duration: '8 мин', status: 'published', updatedAt: '2025-01-21 10:05' },
    { id: 'l6', order: 6, title: 'Куда двигаться дальше', duration: '9 мин', status: 'published', updatedAt: '2025-01-21 12:10' },
  ],
  'marketing-strategy': [
    { id: 'm1', order: 1, title: 'Целевая аудитория и позиционирование', duration: '25 мин', status: 'draft', updatedAt: '2025-01-18 14:05' },
    { id: 'm2', order: 2, title: 'Контент-план на 30 дней', duration: '19 мин', status: 'draft', updatedAt: '2025-01-18 15:22' },
    { id: 'm3', order: 3, title: 'Воронка продаж в Direct', duration: '21 мин', status: 'draft', updatedAt: '2025-01-19 10:03' },
    { id: 'm4', order: 4, title: 'Виральные механики и розыгрыши', duration: '17 мин', status: 'draft', updatedAt: '2025-01-19 12:48' },
    { id: 'm5', order: 5, title: 'Метрики и аналитика', duration: '28 мин', status: 'draft', updatedAt: '2025-01-19 15:30' },
  ],
};

const STORAGE_KEY = 'tnba:selectedCourseSlug';
const LESSON_EDIT_KEY = 'tnba:selectedLessonId';

export default function AdminCoursePage() {
  const { t } = useTranslate();
  const router = useRouter();
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    let s: string | null = null;
    try {
      if (typeof window !== 'undefined') {
        s = window.sessionStorage.getItem(STORAGE_KEY);
      }
    } catch {}
    if (!s) s = COURSE_LIST[0]?.slug ?? null;
    setSlug(s);
  }, []);

  const course = useMemo(() => {
    if (!slug) return null;
    return COURSE_LIST.find((c) => c.slug === slug) ?? null;
  }, [slug]);

  const lessons = useMemo<Lesson[]>(() => {
    if (!slug) return [];
    return LESSONS_BY_SLUG[slug] ?? [];
  }, [slug]);

  if (!course) {
    return (
      <div className="p-2 md:p-6">
        <MoreHeaderAD title={t('Курс')} showBackButton={true} />
        <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-6">
          <div className="text-gray-700">{t('Курс не найден.')}</div>
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

  const brandColor = course.color ?? '#D77E6C';

  const statCards = [
    { icon: BookOpen, label: 'Уроков', value: course.lessonsCount ?? lessons.length },
    { icon: Clock, label: 'Длительность', value: course.totalDuration ?? '—' },
    { icon: Layers, label: 'Статус', value: course.status === 'published' ? 'Опубликован' : 'Черновик' },
  ];

  const goAddLesson = () => {
    try {
      if (typeof window !== 'undefined' && slug) {
        window.sessionStorage.setItem(STORAGE_KEY, slug);
        window.sessionStorage.removeItem(LESSON_EDIT_KEY);
      }
    } catch {}
    router.push('/admin/tnba/create_cours/create_lesson');
  };

  const goEditCourse = () => {
    try {
      if (typeof window !== 'undefined' && slug) {
        window.sessionStorage.setItem(STORAGE_KEY, slug);
      }
    } catch {}
    router.push('/admin/tnba/create_cours');
  };

  const togglePublish = () => {
    alert(
      course.status === 'published'
        ? t('Курс снят с публикации (заглушка)')
        : t('Курс опубликован (заглушка)')
    );
  };

  const editLesson = (lessonId: string) => {
    try {
      if (typeof window !== 'undefined') {
        if (slug) window.sessionStorage.setItem(STORAGE_KEY, slug);
        window.sessionStorage.setItem(LESSON_EDIT_KEY, lessonId);
      }
    } catch {}
    router.push('/admin/tnba/create_cours/create_lesson');
  };

  return (
    <div className="p-2 md:p-6">
      <MoreHeaderAD title={t('Курс')} showBackButton={true} />

      {/* Шапка */}
      <div
        className="mt-6 rounded-2xl p-6 md:p-8 text-white"
        style={{ background: `linear-gradient(90deg, ${brandColor} 0%, #E09080 100%)` }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/15 px-2.5 py-1 rounded-full text-xs font-medium mb-3">
              <BadgeCheck className="w-4 h-4" />
              {t(course.category)}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">{t(course.title)}</h1>
            <p className="mt-2 text-white/90 text-sm md:text-base">{t(course.description)}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{t(course.author)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{course.totalDuration}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>
                  {t('{n} уроков').replace('{n}', String(course.lessonsCount))}
                </span>
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
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg.white/15 hover:bg-white/20 text-white font-medium"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <BadgeCheck className="w-4 h-4" />
              {course.status === 'published' ? t('Снять с публикации') : t('Опубликовать курс')}
            </button>
          </div>
        </div>
      </div>

      {/* Статкарточки */}
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

      {/* Уроки */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold">{t('Уроки курса')}</h2>
          <button
            onClick={goAddLesson}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#D77E6C] hover:bg-[#C66B5A] text.white text-sm font-medium"
            style={{ color: '#fff' }}
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
              {(LESSONS_BY_SLUG[course.slug] ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    {t('В этом курсе пока нет уроков.')}
                  </td>
                </tr>
              ) : (
                (LESSONS_BY_SLUG[course.slug] ?? []).map((l) => (
                  <tr key={l.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-5 font-mono text-sm text-gray-700">{l.order}</td>
                    <td className="py-3 px-5">
                      <div className="font-medium text-gray-900">{t(l.title)}</div>
                    </td>
                    <td className="py-3 px-5 text-sm text-gray-700">{t(l.duration)}</td>
                    <td className="py-3 px-5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          l.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {l.status === 'published' ? t('Опубликован') : t('Черновик')}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-sm text-gray-600">{l.updatedAt}</td>
                    <td className="py-3 px-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => editLesson(l.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-medium"
                          title={t('Редактировать')}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          {t('Редактировать')}
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-xs font-medium"
                          title={t('Открыть')}
                          onClick={() => alert(t('Открыть предпросмотр урока (заглушка)'))}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {t('Открыть')}
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
