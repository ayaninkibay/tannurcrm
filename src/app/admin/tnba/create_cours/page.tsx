'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';

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

export default function CreateCoursPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const editingCourseId = (sp?.get('courseId') ?? '').trim(); // опционально — редактирование

  // ----- FORM STATE -----
  const [id, setId] = useState<string>(''); // держим id, чтобы при редактировании не генерить новый
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [author, setAuthor] = useState('Tannur Cosmetics');
  const [level, setLevel] = useState<CourseDraft['level']>('Новичок');
  const [language, setLanguage] = useState('ru');
  const [thumbnail, setThumbnail] = useState('/icons/IconEducationOrange.svg');
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
      setId(''); // новый курс
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
    <div className="p-2 md:p-6">
<<<<<<< HEAD
      <MoreHeaderAD title={isEdit ? 'Редактировать курс' : 'Создать курс'} showBackButton={true} />
=======
      <MoreHeaderAD title="Создать курс" showBackButton={true}  />
      
>>>>>>> 9359c06ca0f70e9571ce87c70542e7cbc83cf1ff

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
            <span className="text-sm text-gray-700">Название курса *</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              placeholder="Например, Знакомство с Tannur"
            />
            {errors.title && <div className="text-xs text-red-500 mt-1">{errors.title}</div>}
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Категория *</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.category && <div className="text-xs text-red-500 mt-1">{errors.category}</div>}
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Автор / Спикер</span>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              placeholder="Имя спикера"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-gray-700">Уровень</span>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as CourseDraft['level'])}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm text-gray-700">Язык</span>
              <input
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
                placeholder="ru, kz, en…"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm text-gray-700">Обложка (URL)</span>
            <input
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              placeholder="/icons/IconEducationOrange.svg"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Общая длительность (мин)</span>
            <input
              type="number"
              min={0}
              value={totalMinutes}
              onChange={(e) => setTotalMinutes(e.target.value === '' ? '' : Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              placeholder="например, 120"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm text-gray-700">Краткое описание *</span>
            <textarea
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              rows={3}
              placeholder="1–2 предложения — используется в карточках/листах"
            />
            {errors.shortDesc && <div className="text-xs text-red-500 mt-1">{errors.shortDesc}</div>}
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm text-gray-700">Полное описание *</span>
            <textarea
              value={fullDesc}
              onChange={(e) => setFullDesc(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              rows={5}
              placeholder="Детально: для страницы курса"
            />
            {errors.fullDesc && <div className="text-xs text-red-500 mt-1">{errors.fullDesc}</div>}
          </label>
        </div>

        {/* ТЕГИ */}
        <div className="mt-6">
          <div className="text-sm font-semibold text-gray-900 mb-2">Теги</div>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              className="w-full md:w-1/2 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              placeholder="например: skincare, продажи"
            />
            <button type="button" onClick={addTag} className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">
              Добавить
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((t, i) => (
                <span key={i} className="inline-flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-full bg-gray-100">
                  {t}
                  <button type="button" onClick={() => removeTag(i)} className="text-gray-500 hover:text-gray-700">
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* РЕЗУЛЬТАТЫ */}
        <div className="mt-6">
          <div className="text-sm font-semibold text-gray-900 mb-2">Результаты обучения</div>
          <div className="flex gap-2">
            <input
              value={outcomeInput}
              onChange={(e) => setOutcomeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addOutcome();
                }
              }}
              className="w-full md:w-2/3 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              placeholder="Например: научится проводить консультацию…"
            />
            <button type="button" onClick={addOutcome} className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">
              Добавить пункт
            </button>
          </div>
          {outcomes.length > 0 && (
            <ul className="mt-3 space-y-2">
              {outcomes.map((o, i) => (
                <li key={i} className="flex items-start justify-between gap-3 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-800">{o}</span>
                  <button
                    type="button"
                    onClick={() => removeOutcome(i)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Удалить
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ТРЕБОВАНИЯ */}
        <div className="mt-6">
          <div className="text-sm font-semibold text-gray-900 mb-2">Требования</div>
          <div className="flex gap-2">
            <input
              value={prereqInput}
              onChange={(e) => setPrereqInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addPrereq();
                }
              }}
              className="w-full md:w-2/3 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              placeholder="Что нужно знать/иметь заранее"
            />
            <button type="button" onClick={addPrereq} className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">
              Добавить пункт
            </button>
          </div>
          {prereq.length > 0 && (
            <ul className="mt-3 space-y-2">
              {prereq.map((p, i) => (
                <li key={i} className="flex items-start justify-between gap-3 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-800">{p}</span>
                  <button
                    type="button"
                    onClick={() => removePrereq(i)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Удалить
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* СТРУКТУРА */}
        <div className="mt-6">
          <div className="text-sm font-semibold text-gray-900 mb-2">Структура курса (модули)</div>
          <div className="flex gap-2">
            <input
              value={syllabusInput}
              onChange={(e) => setSyllabusInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSyllabus();
                }
              }}
              className="w-full md:w-2/3 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              placeholder="Название модуля/блока"
            />
            <button type="button" onClick={addSyllabus} className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">
              Добавить пункт
            </button>
          </div>
          {syllabus.length > 0 && (
            <ul className="mt-3 space-y-2">
              {syllabus.map((s, i) => (
                <li key={i} className="flex items-start justify-between gap-3 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-800">{s}</span>
                  <button
                    type="button"
                    onClick={() => removeSyllabus(i)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Удалить
                  </button>
                </li>
              ))}
            </ul>
          )}
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
            Опубликовать курс сразу
          </label>
        </div>

        {/* ДЕЙСТВИЯ */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
          >
            Сохранить черновик
          </button>

          <button
            type="submit"
            disabled={!isValid}
            className="px-4 py-2.5 bg-[#DC7C67] hover:bg-[#c96d59] disabled:opacity-60 text-white rounded-lg text-sm font-medium"
            title={!isValid ? 'Заполните обязательные поля' : ''}
          >
            {isEdit ? 'Сохранить и перейти к урокам' : 'Сохранить и перейти к урокам'}
          </button>

          <Link
            href="/admin/tnba"
            className="ml-auto px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
          >
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
}
