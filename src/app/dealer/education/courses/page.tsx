'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import { ArrowLeft, BookOpen, Clock, Award, FileDown } from 'lucide-react';
import { useTranslate } from '@/hooks/useTranslate';

type Lesson = { id: number; title: string; durationMin: number; src?: string; summary?: string };
type Course = { id: number; title: string; image: string; totalMin: number; desc: string; lessons: Lesson[] };

const SAMPLE_VIDEO = 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const MOCK: Record<number, Course> = {
  1: {
    id: 1,
    title: 'Знакомство с продуктами Tannur',
    image: '/icons/edu_1.png',
    totalMin: 78,
    desc: 'Базовый курс…',
    lessons: [
      { id: 1, title: 'Введение в линейку', durationMin: 12, src: SAMPLE_VIDEO, summary: 'Что входит в линейку…' },
      { id: 2, title: 'Ключевые преимущества', durationMin: 18, src: SAMPLE_VIDEO, summary: 'УТП бренда…' },
      { id: 3, title: 'Базовые сценарии продаж', durationMin: 22, src: SAMPLE_VIDEO, summary: '3 скрипта…' },
      { id: 4, title: 'Частые вопросы клиентов', durationMin: 16, src: SAMPLE_VIDEO, summary: 'FAQ…' },
      { id: 5, title: 'Итоговый мини-тест', durationMin: 10, src: SAMPLE_VIDEO, summary: 'Короткий тест…' },
      { id: 6, title: 'Доп. материалы и разбор', durationMin: 15, src: SAMPLE_VIDEO, summary: 'Разбор…' }
    ]
  },
  2: {
    id: 2,
    title: 'Маркетинговая стратегия 2.0',
    image: '/icons/edu_2.png',
    totalMin: 131,
    desc: 'Продвинутая стратегия…',
    lessons: [
      { id: 1, title: 'Аудит и позиционирование', durationMin: 25, src: SAMPLE_VIDEO, summary: 'Оцениваем активы…' },
      { id: 2, title: 'Контент-воронка', durationMin: 28, src: SAMPLE_VIDEO, summary: 'Контент от охвата…' },
      { id: 3, title: 'Рекламные связки', durationMin: 31, src: SAMPLE_VIDEO, summary: 'Креативы и офферы…' },
      { id: 4, title: 'Юнит-экономика', durationMin: 26, src: SAMPLE_VIDEO, summary: 'Считать деньги…' },
      { id: 5, title: 'План на 30 дней', durationMin: 21, src: SAMPLE_VIDEO, summary: 'Планирование…' },
      { id: 6, title: 'Метрики и отчётность', durationMin: 19, src: SAMPLE_VIDEO, summary: 'Что мерить…' }
    ]
  }
};

export default function CoursePage() {
  const { t } = useTranslate();
  const sp = useSearchParams();
  const router = useRouter();

  const id = Number(sp?.get('id') ?? '1') || 1;
  const course = MOCK[id] ?? MOCK[1];

  const lessonFromUrl = Number(sp?.get('lesson') ?? NaN);
  const activeLessonId = Number.isFinite(lessonFromUrl) ? lessonFromUrl : course.lessons[0].id;

  const activeLesson = useMemo(
    () => course.lessons.find((l) => l.id === activeLessonId) ?? course.lessons[0],
    [activeLessonId, course.lessons]
  );

  const openLesson = (lessonId: number) => {
    const q = new URLSearchParams(sp?.toString() || '');
    q.set('lesson', String(lessonId));
    router.push(`?${q.toString()}`);
  };

  // локализованный формат времени
  const minToHuman = (min: number) => {
    if (min < 60) return t('{min} мин').replace('{min}', String(min));
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m
      ? t('{h} ч {m} мин').replace('{h}', String(h)).replace('{m}', String(m))
      : t('{h} часа').replace('{h}', String(h));
  };

  const [videoError, setVideoError] = useState(false);
  useEffect(() => setVideoError(false), [activeLessonId]);

  return (
    <div className="p-2 md:p-6">
      <MoreHeaderDE title={t('Курс')} 
      showBackButton={true}
      />

      <div className="mt-4 rounded-2xl p-6 md:p-8 text-white bg-[#D77E6C]">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">
          {t('Урок {n}: {title}')
            .replace('{n}', String(activeLesson.id))
            .replace('{title}', t(activeLesson.title))}
        </h1>
        <p className="text-white/90 text-sm md:text-base">
          {t('Курс: {title}').replace('{title}', t(course.title))}
        </p>
        <div className="flex flex-wrap gap-4 md:gap-6 mt-5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <span className="text-sm">
              {t('Урок {n} из {total}')
                .replace('{n}', String(activeLesson.id))
                .replace('{total}', String(course.lessons.length))}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="text-sm">{minToHuman(activeLesson.durationMin)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            <span className="text-sm">{t('Сертификат после курса')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-3 md:p-4 mb-4">
            <div className="relative w-full rounded-xl overflow-hidden bg-black">
              {!videoError ? (
                <video key={activeLesson.id} className="w-full h-auto" controls poster={course.image}>
                  <source src={activeLesson.src ?? SAMPLE_VIDEO} type="video/mp4" />
                </video>
              ) : (
                <div className="aspect-video flex items-center justify-center bg-gray-900 text-gray-200">
                  <div className="text-sm">{t('Не удалось загрузить видео (заглушка)')}</div>
                </div>
              )}
            </div>
            <div className="mt-2 text-sm text-gray-700">
              {t('Смотрим: {title} • {duration}')
                .replace('{title}', t(activeLesson.title))
                .replace('{duration}', minToHuman(activeLesson.durationMin))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2">{t('О уроке')}</h3>
            <p className="text-sm text-gray-700 leading-6">{t(activeLesson.summary ?? course.desc ?? '')}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">{t('Материалы урока')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[t('Методичка (PDF)'), t('Чек-лист (DOCX)')].map((name, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200 hover:shadow-sm"
                >
                  <span className="text-sm text-gray-800">{name}</span>
                  <FileDown className="w-4 h-4 text-gray-600" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('Уроки')}</h3>
            <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
              {course.lessons.map((l) => (
                <button
                  key={l.id}
                  onClick={() => openLesson(l.id)}
                  className={`w-full text-left flex items-center justify-between gap-3 px-3 py-2 rounded-xl border ${
                    activeLesson.id === l.id ? 'border-[#D77E6C] bg-[#D77E6C]/5' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{t(l.title)}</div>
                    <div className="text-xs text-gray-500">{minToHuman(l.durationMin)}</div>
                  </div>
                  <div className="text-xs text-gray-500">#{l.id}</div>
                </button>
              ))}
            </div>
          </div>

          <Link
            href={`/dealer/education/all_courses?id=${course.id}`}
            className="inline-flex items-center gap-2 text-[#D77E6C] hover:text-[#C66B5A] text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> {t('К списку уроков')}
          </Link>
        </aside>
      </div>
    </div>
  );
}
