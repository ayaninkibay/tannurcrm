'use client';

import React, { useEffect, useMemo, useState, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { useTranslate } from '@/hooks/useTranslate';

type CourseDraft = {
  id: string;
  title: string;
  category: string;
  author: string;
  level: 'Новичок' | 'Средний' | 'Продвинутый';
  language: string;
  thumbnail: string;
  shortDesc: string;
  fullDesc: string;
  tags: string[];
  outcomes: string[];
  prerequisites: string[];
  syllabus: string[];
  totalMinutes?: number;
  isPublished: boolean;
};

const CATEGORY_OPTIONS = [
  'Знакомство с Tannur',
  'Маркетинговая стратегия',
  'Менеджер по продажам',
  'Как продавать продукцию?',
];

const LEVELS: CourseDraft['level'][] = ['Новичок', 'Средний', 'Продвинутый'];

// Separate component that uses useSearchParams
function CreateCourseForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const { t } = useTranslate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editingCourseId = (sp?.get('courseId') ?? '').trim();

  // ----- FORM STATE -----
  const [id, setId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [author, setAuthor] = useState('Tannur Cosmetics');
  const [level, setLevel] = useState<CourseDraft['level']>('Новичок');
  const [language, setLanguage] = useState('ru');
  const [thumbnail, setThumbnail] = useState('/icons/IconEducationOrange.svg');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [outcomes, setOutcomes] = useState<string[]>([]);
  const [outcomeInput, setOutcomeInput] = useState('');
  const [prereq, setPrereq] = useState<string[]>([]);
  const [prereqInput, setPrereqInput] = useState('');
  const [syllabus, setSyllabus] = useState<string[]>([]);
  const [syllabusInput, setSyllabusInput] = useState('');
  const [totalMinutes, setTotalMinutes] = useState<number | ''>('');
  const [isPublished, setIsPublished] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // загрузка курса для редактирования
  const isEdit = useMemo(() => !!editingCourseId, [editingCourseId]);

  useEffect(() => {
    if (!isEdit) {
      setId('');
      return;
    }
    try {
      const raw = localStorage.getItem('admin_courses');
      const list: CourseDraft[] = raw ? JSON.parse(raw) : [];
      const found = list.find((c) => c.id === editingCourseId);
      if (!found) return;

      setId(found.id);
      setTitle(found.title);
      setCategory(found.category);
      setAuthor(found.author);
      setLevel(found.level);
      setLanguage(found.language);
      setThumbnail(found.thumbnail);
      setThumbnailPreview(found.thumbnail);
      setShortDesc(found.shortDesc);
      setFullDesc(found.fullDesc);
      setTags(found.tags ?? []);
      setOutcomes(found.outcomes ?? []);
      setPrereq(found.prerequisites ?? []);
      setSyllabus(found.syllabus ?? []);
      setTotalMinutes(typeof found.totalMinutes === 'number' ? found.totalMinutes : '');
      setIsPublished(!!found.isPublished);
    } catch {}
  }, [isEdit, editingCourseId]);

  // ----- FILE UPLOAD HANDLER -----
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, thumbnail: 'Пожалуйста, выберите изображение (JPEG, PNG, GIF, SVG, WebP)' }));
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, thumbnail: 'Размер файла не должен превышать 5MB' }));
      return;
    }

    // Clear error
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.thumbnail;
      return newErrors;
    });

    setThumbnailFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setThumbnailPreview(result);
      setThumbnail(result); // Store as base64 for localStorage
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
    setThumbnail('/icons/IconEducationOrange.svg');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ----- HELPERS -----
  function addTag() {
    const v = tagInput.trim();
    if (!v) return;
    setTags((prev) => Array.from(new Set([...prev, v])));
    setTagInput('');
  }
  function removeTag(idx: number) {
    setTags((prev) => prev.filter((_, i) => i !== idx));
  }

  function addOutcome() {
    const v = outcomeInput.trim();
    if (!v) return;
    setOutcomes((p) => [...p, v]);
    setOutcomeInput('');
  }
  function removeOutcome(idx: number) {
    setOutcomes((p) => p.filter((_, i) => i !== idx));
  }

  function addPrereq() {
    const v = prereqInput.trim();
    if (!v) return;
    setPrereq((p) => [...p, v]);
    setPrereqInput('');
  }
  function removePrereq(idx: number) {
    setPrereq((p) => p.filter((_, i) => i !== idx));
  }

  function addSyllabus() {
    const v = syllabusInput.trim();
    if (!v) return;
    setSyllabus((p) => [...p, v]);
    setSyllabusInput('');
  }
  function removeSyllabus(idx: number) {
    setSyllabus((p) => p.filter((_, i) => i !== idx));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = 'Введите название курса';
    if (!shortDesc.trim()) next.shortDesc = 'Добавьте краткое описание';
    if (!fullDesc.trim()) next.fullDesc = 'Добавьте подробное описание';
    if (!category.trim()) next.category = 'Выберите категорию';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function saveToLocalStorage(draft: CourseDraft) {
    try {
      const key = 'admin_courses';
      const raw = localStorage.getItem(key);
      const list: CourseDraft[] = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex((c) => c.id === draft.id);
      if (idx >= 0) list[idx] = draft;
      else list.push(draft);
      localStorage.setItem(key, JSON.stringify(list));
    } catch {}
  }

  function handleSave(goToLessons: boolean) {
    if (!validate()) return;

    const finalId = id || Date.now().toString();
    const draft: CourseDraft = {
      id: finalId,
      title: title.trim(),
      category,
      author: author.trim(),
      level,
      language,
      thumbnail: thumbnail.trim(),
      shortDesc: shortDesc.trim(),
      fullDesc: fullDesc.trim(),
      tags,
      outcomes,
      prerequisites: prereq,
      syllabus,
      totalMinutes: totalMinutes === '' ? undefined : Number(totalMinutes),
      isPublished,
    };

    saveToLocalStorage(draft);

    if (goToLessons) {
      router.push(`/admin/tnba/create_cours/create_lesson?courseId=${finalId}`);
    }
  }

  const isValid = useMemo(
    () => !!(title.trim() && shortDesc.trim() && fullDesc.trim()),
    [title, shortDesc, fullDesc]
  );

  return (
    <>
      <MoreHeaderAD
        title={isEdit ? t('Редактировать курс') : t('Создать курс')}
        showBackButton={true}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave(true);
        }}
        className="mt-4 bg-white rounded-2xl border border-gray-100 p-6"
      >
        {/* БАЗОВЫЕ ПОЛЯ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-gray-700">{t('Название курса *')}</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              placeholder={t('Например, Знакомство с Tannur')}
            />
            {errors.title && <div className="text-xs text-red-500 mt-1">{t(errors.title)}</div>}
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">{t('Категория *')}</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {t(c)}
                </option>
              ))}
            </select>
            {errors.category && <div className="text-xs text-red-500 mt-1">{t(errors.category)}</div>}
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">{t('Язык')}</span>
            <input
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              placeholder={t('ru, kz, en…')}
            />
          </label>

          {/* IMAGE UPLOAD FIELD */}
          <div className="block">
            <span className="text-sm text-gray-700">{t('Обложка')}</span>
            
            <div className="mt-1 flex items-start gap-4">
              {/* Upload button and info */}
              <div className="flex-1">
                {/* File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/svg+xml,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="thumbnail-upload"
                />
                
                <label
                  htmlFor="thumbnail-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors text-sm"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  {thumbnailPreview ? t('Изменить изображение') : t('Загрузить изображение')}
                </label>

                <div className="mt-2 text-xs text-gray-500">
                  {t('Максимальный размер: 5MB. Форматы: JPEG, PNG, GIF, SVG, WebP')}
                </div>
                
                {errors.thumbnail && (
                  <div className="text-xs text-red-500 mt-1">{t(errors.thumbnail)}</div>
                )}
              </div>

              {/* Preview */}
              {thumbnailPreview && (
                <div className="relative inline-block">
                  <div className="relative w-48 h-28 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={thumbnailPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs shadow-md"
                      title={t('Удалить изображение')}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <label className="block md:col-span-2">
            <span className="text-sm text-gray-700">{t('Краткое описание *')}</span>
            <textarea
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              rows={3}
              placeholder={t('1–2 предложения — используется в карточках/листах')}
            />
            {errors.shortDesc && <div className="text-xs text-red-500 mt-1">{t(errors.shortDesc)}</div>}
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm text-gray-700">{t('Полное описание *')}</span>
            <textarea
              value={fullDesc}
              onChange={(e) => setFullDesc(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              rows={5}
              placeholder={t('Детально: для страницы курса')}
            />
            {errors.fullDesc && <div className="text-xs text-red-500 mt-1">{t(errors.fullDesc)}</div>}
          </label>
        </div>

        {/* ПУБЛИКАЦИЯ */}
        <div className="mt-6 flex items-center gap-2">
          <input
            id="publish"
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          <label htmlFor="publish" className="text-sm text-gray-700">
            {t('Опубликовать курс сразу')}
          </label>
        </div>

        {/* ДЕЙСТВИЯ */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
          >
            {t('Сохранить черновик')}
          </button>

          <button
            type="submit"
            disabled={!isValid}
            className="px-4 py-2.5 bg-[#DC7C67] hover:bg-[#c96d59] disabled:opacity-60 text-white rounded-lg text-sm font-medium"
            title={!isValid ? t('Заполните обязательные поля') : ''}
          >
            {t('Сохранить и перейти к урокам')}
          </button>

          <Link
            href="/admin/tnba"
            className="ml-auto px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
          >
            {t('Отмена')}
          </Link>
        </div>
      </form>
    </>
  );
}

// Loading component for Suspense
function CreateCourseLoading() {
  return (
    <div className="p-2 md:p-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense wrapper
export default function CreateCoursePage() {
  return (
    <div className="p-2 md:p-6">
      <Suspense fallback={<CreateCourseLoading />}>
        <CreateCourseForm />
      </Suspense>
    </div>
  );
}