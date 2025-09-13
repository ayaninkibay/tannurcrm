'use client';

import React, { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import { BookOpen, Clock, Play } from 'lucide-react';
import { useTranslate } from '@/hooks/useTranslate';

type Lesson = { id: number; title: string; durationMin: number; locked?: boolean };
type Course = { id: number; title: string; desc: string; totalMin: number; lessons: Lesson[]; poster?: string };

const COURSES: Record<number, Course> = {
  1: {
    id: 1,
    title: 'Знакомство с продуктами Tannur',
    desc: 'Базовый курс по линейке продуктов Tannur и ключевым преимуществам.',
    totalMin: 78,
    poster: '/icons/edu_1.png',
    lessons: [
      { id: 1, title: 'Введение в линейку', durationMin: 12 },
      { id: 2, title: 'Ключевые преимущества', durationMin: 18 },
      { id: 3, title: 'Базовые сценарии продаж', durationMin: 22 },
      { id: 4, title: 'Частые вопросы клиентов', durationMin: 16 },
      { id: 5, title: 'Итоговый мини-тест', durationMin: 10 },
      { id: 6, title: 'Доп. материалы и разбор', durationMin: 15 }
    ]
  },
  2: {
    id: 2,
    title: 'Маркетинговая стратегия 2.0',
    desc: 'Продвинутая стратегия: позиционирование, контент-воронка и бюджет.',
    totalMin: 131,
    poster: '/icons/edu_2.png',
    lessons: [
      { id: 1, title: 'Аудит и позиционирование', durationMin: 25 },
      { id: 2, title: 'Контент-воронка', durationMin: 28 },
      { id: 3, title: 'Рекламные связки', durationMin: 31 },
      { id: 4, title: 'Юнит-экономика', durationMin: 26 },
      { id: 5, title: 'План на 30 дней', durationMin: 21 },
      { id: 6, title: 'Метрики и отчётность', durationMin: 19 }
    ]
  }
};

function minToHuman(min: number, t: (k: string) => string) {
  if (min < 60) return `${min} ${t('мин')}`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} ${t('ч')} ${m} ${t('мин')}` : `${h} ${t('ч')}`;
}

export default function CoursePreviewPage() {
  const { t } = useTranslate();
  const sp = useSearchParams();
  const idParam = sp?.get('id');
  const titleHint = (sp?.get('title') ?? '').toLowerCase();

  const resolvedId = useMemo(() => {
    const tryId = Number(idParam);
    if (Number.isFinite(tryId) && COURSES[tryId]) return tryId;
    if (titleHint.includes('маркет')) return 2;
    if (titleHint.includes('знаком')) return 1;
    return 1;
  }, [idParam, titleHint]);

  const course = COURSES[resolvedId];
  const lessons = useMemo(() => course.lessons.slice(0, 6), [course.lessons]); // показываем 6

  return (
    <div className="p-2 md:p-6">
      <MoreHeaderDE title={t('Курс')} 
      showBackButton={true}
      />

      {/* Коралловый заголовок */}
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
              <span className="text-sm">{t('24 курса')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm">{t('120+ часов')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">{t('Сертификаты')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Инфо по выбранному курсу */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6">
        <div className="flex items-start gap-4">
          {course.poster && (
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
              <img src={course.poster} alt={t(course.title)} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">{t(course.title)}</h2>
            <p className="mt-1 text-sm text-gray-600">{t(course.desc)}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" /> {course.lessons.length} {t('уроков')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {minToHuman(course.totalMin, t)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6 уроков на выбор */}
      <div className="mt-4 space-y-3">
        {lessons.map((lesson) => (
          <Link
            key={lesson.id}
            href={`/dealer/education/courses?id=${course.id}&lesson=${lesson.id}`}
            className="block bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#D77E6C]/10 text-[#D77E6C] flex items-center justify-center">
                <Play className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-500">
                  {t('Урок {n} из {total}')
                    .replace('{n}', String(lesson.id))
                    .replace('{total}', String(course.lessons.length))}
                </div>
                <div className="text-base font-semibold text-gray-900 truncate">{t(lesson.title)}</div>
              </div>
              <div className="text-sm text-gray-600">{minToHuman(lesson.durationMin, t)}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Кнопка ко всем урокам курса */}
      <div className="mt-6">
        <Link
          href={`/dealer/education/courses?id=${course.id}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-[#D77E6C] hover:text-white rounded-lg text-sm font-medium transition"
        >
          {t('Открыть страницу курса')}
        </Link>
      </div>
    </div>
  );
}
