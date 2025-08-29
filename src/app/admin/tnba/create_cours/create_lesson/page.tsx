// src/app/admin/tnba/lesson_create/page.tsx (обновлённый)
'use client';

import React, { useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { useTranslate } from '@/hooks/useTranslate';

type LessonDraft = {
  id: string;
  title: string;
  durationMin: number | string;
  videoUrl: string;
  summary: string;
  files: string[];
};

type Course = {
  id: string;
  title: string;
};

function CreateLessonContent() {
  const { t } = useTranslate();
  const sp = useSearchParams();
  const courseId = (sp?.get('courseId') ?? '').trim();
  const editLessonId = (sp?.get('editLessonId') ?? '').trim();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<LessonDraft[]>([]);

  const [title, setTitle] = useState('');
  const [durationMin, setDurationMin] = useState<number | string>('');
  const [videoUrl, setVideoUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [fileInput, setFileInput] = useState('');
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('admin_courses');
      const list = raw ? JSON.parse(raw) : [];
      const found = list.find((c: any) => c.id === courseId);
      if (found) setCourse({ id: found.id, title: found.title });
    } catch {}
  }, [courseId]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`admin_lessons_${courseId}`);
      const list: LessonDraft[] = raw ? JSON.parse(raw) : [];
      setLessons(Array.isArray(list) ? list : []);
    } catch {}
  }, [courseId]);

  const isEdit = useMemo(() => !!editLessonId, [editLessonId]);

  useEffect(() => {
    if (!isEdit) return;
    const found = lessons.find((l) => l.id === editLessonId);
    if (!found) return;
    setTitle(found.title);
    setDurationMin(found.durationMin);
    setVideoUrl(found.videoUrl);
    setSummary(found.summary);
    setFiles(found.files ?? []);
  }, [isEdit, editLessonId, lessons]);

  function addFile() {
    const v = fileInput.trim();
    if (!v) return;
    setFiles((p) => [...p, v]);
    setFileInput('');
  }
  function removeFile(i: number) {
    setFiles((p) => p.filter((_, idx) => idx !== i));
  }

  function resetForm() {
    setTitle('');
    setDurationMin('');
    setVideoUrl('');
    setSummary('');
    setFiles([]);
    setFileInput('');
  }

  function saveLessons(next: LessonDraft[]) {
    setLessons(next);
    localStorage.setItem(`admin_lessons_${courseId}`, JSON.stringify(next));
  }

  function onSubmit() {
    if (!title.trim()) return;

    if (isEdit) {
      const next = lessons.map((l) =>
        l.id === editLessonId
          ? {
              ...l,
              title: title.trim(),
              durationMin: durationMin === '' ? '' : Number(durationMin),
              videoUrl: videoUrl.trim(),
              summary: summary.trim(),
              files: files.slice()
            }
          : l
      );
      saveLessons(next);
    } else {
      const l: LessonDraft = {
        id: Date.now().toString(),
        title: title.trim(),
        durationMin: durationMin === '' ? '' : Number(durationMin),
        videoUrl: videoUrl.trim(),
        summary: summary.trim(),
        files: files.slice()
      };
      saveLessons([...lessons, l]);
      resetForm();
    }
  }

  const heading = useMemo(() => {
    if (course) {
      return isEdit
        ? t('Редактировать урок: {title}').replace('{title}', course.title)
        : t('Создать урок: {title}').replace('{title}', course.title);
    }
    return isEdit ? t('Редактировать урок') : t('Создать урок');
  }, [course, isEdit, t]);

  return (
    <div className="p-2 md:p-6">
      <MoreHeaderAD title={heading} showBackButton={true} />

      {/* форма урока */}
      <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-gray-700">{t('Название урока *')}</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              placeholder={t('Например: Введение в линейку')}
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">{t('Длительность (мин)')}</span>
            <input
              type="number"
              min={0}
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value === '' ? '' : Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              placeholder={t('12')}
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm text-gray-700">{t('Видео (URL)')}</span>
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              placeholder={t('https://...')}
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm text-gray-700">{t('Описание урока')}</span>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              rows={4}
              placeholder={t('Короткое описание содержания урока')}
            />
          </label>
        </div>

        {/* материалы */}
        <div className="mt-6">
          <div className="text-sm font-semibold text-gray-900 mb-2">{t('Материалы')}</div>
          <div className="flex gap-2">
            <input
              value={fileInput}
              onChange={(e) => setFileInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFile(); } }}
              className="w-full md:w-2/3 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              placeholder={t('Имя файла или URL (pdf, docx, ...)')}
            />
            <button type="button" onClick={addFile} className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">
              {t('Добавить файл')}
            </button>
          </div>
          {files.length > 0 && (
            <ul className="mt-3 space-y-2">
              {files.map((f, i) => (
                <li key={i} className="flex items-center justify-between gap-3 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-800 truncate">{f}</span>
                  <button type="button" onClick={() => removeFile(i)} className="text-xs text-gray-500 hover:text-gray-700">
                    {t('Удалить')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* действия */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onSubmit}
            className="px-4 py-2.5 bg-[#DC7C67] hover:bg-[#c96d59] text-white rounded-lg text-sm font-medium"
          >
            {isEdit ? t('Сохранить изменения') : t('Добавить урок')}
          </button>

          <Link href="/admin/tnba" className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
            {t('Готово')}
          </Link>
        </div>
      </div>

      {/* список добавленных уроков */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6">
        <div className="text-sm font-semibold text-gray-900 mb-3">{t('Добавленные уроки')}</div>
        {lessons.length === 0 ? (
          <div className="text-sm text-gray-500">{t('Пока пусто')}</div>
        ) : (
          <ul className="space-y-3">
            {lessons.map((l) => (
              <li key={l.id} className="bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{l.title}</div>
                    <div className="text-xs text-gray-500">
                      {l.durationMin ? `${l.durationMin} ${t('мин')}` : '—'} {l.videoUrl ? `• ${t('Видео добавлено')}` : ''}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">#{l.id.slice(-5)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function LoadingFallback() {
  const { t } = useTranslate();
  return (
    <div className="p-2 md:p-6">
      <MoreHeaderAD title={t('Создать урок')} showBackButton={true} />
      <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default function CreateLessonPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CreateLessonContent />
    </Suspense>
  );
}
