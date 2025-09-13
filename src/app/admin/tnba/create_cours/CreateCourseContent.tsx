'use client';


import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { useTranslate } from '@/hooks/useTranslate';
import { useAcademyModule } from '@/lib/academy/AcademyModule';
import { Upload, X, Save, ArrowRight } from 'lucide-react';

// Определяем категории локально с правильным типом
const COURSE_CATEGORIES = [
  'Знакомство с Tannur',
  'Маркетинг', 
  'Продажи',
  'Продукты'
] as const;

function CreateCourseForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslate();
  
  const courseId = searchParams?.get('id');
  const isEdit = !!courseId;

  const {
    currentCourse,
    loading,
    error,
    loadCourse,
    createCourse,
    updateCourse
  } = useAcademyModule();

  // Form state с правильным типом для category
  const [formData, setFormData] = useState<{
    title: string;
    category: string; // Используем string вместо конкретного типа
    language: string;
    shortDescription: string;
    fullDescription: string;
    difficultyLevel: string;
    tags: string[];
    isPublished: boolean;
    coverImage: File | null;
    coverImageUrl: string;
  }>({
    title: '',
    category: COURSE_CATEGORIES[0],
    language: 'ru',
    shortDescription: '',
    fullDescription: '',
    difficultyLevel: 'beginner',
    tags: [],
    isPublished: false,
    coverImage: null,
    coverImageUrl: ''
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Load course data if editing
  useEffect(() => {
    if (isEdit && courseId) {
      loadCourse(courseId);
    }
  }, [courseId]);

  useEffect(() => {
    if (isEdit && currentCourse) {
      setFormData({
        title: currentCourse.title || '',
        category: currentCourse.category || COURSE_CATEGORIES[0],
        language: currentCourse.language || 'ru',
        shortDescription: currentCourse.short_description || '',
        fullDescription: currentCourse.full_description || '',
        difficultyLevel: currentCourse.difficulty_level || 'beginner',
        tags: currentCourse.tags || [],
        isPublished: currentCourse.is_published || false,
        coverImage: null,
        coverImageUrl: currentCourse.cover_image || ''
      });
    }
  }, [currentCourse]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, coverImage: 'Выберите изображение (JPEG, PNG, GIF, WebP)' }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, coverImage: 'Размер файла не должен превышать 5MB' }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      coverImage: file,
      coverImageUrl: URL.createObjectURL(file)
    }));
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      coverImage: null,
      coverImageUrl: ''
    }));
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Введите название курса';
    }
    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = 'Добавьте краткое описание';
    }
    if (!formData.category) {
      newErrors.category = 'Выберите категорию';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setSubmitting(true);
    try {
      const courseData = {
        title: formData.title,
        category: formData.category,
        language: formData.language,
        shortDescription: formData.shortDescription,
        fullDescription: formData.fullDescription,
        difficultyLevel: formData.difficultyLevel,
        tags: formData.tags,
        isPublished: formData.isPublished,
        coverImage: formData.coverImage
      };

      if (isEdit && courseId) {
        await updateCourse(courseId, courseData);
        router.push(`/admin/tnba/course?id=${courseId}`);
      } else {
        const newCourse = await createCourse(courseData);
        if (newCourse) {
          router.push(`/admin/tnba/course?id=${newCourse.id}`);
        }
      }
    } catch (err) {
      console.error('Error saving course:', err);
      setErrors({ general: 'Ошибка сохранения курса' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="p-2 md:p-6">
        <MoreHeaderAD title={t('Загрузка...')} showBackButton={true} />
        <div className="mt-6 flex justify-center">
          <div className="text-gray-500">{t('Загрузка курса...')}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <MoreHeaderAD
        title={isEdit ? t('Редактировать курс') : t('Создать курс')}
        showBackButton={true}
      />

      <form onSubmit={handleSubmit} className="mt-4 bg-white rounded-2xl border border-gray-100 p-6">
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {errors.general}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block">
              <span className="text-sm text-gray-700 font-medium">{t('Название курса')} *</span>
              <input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67] transition-colors"
                placeholder={t('Например: Основы маркетинга')}
              />
              {errors.title && <div className="text-xs text-red-500 mt-1">{errors.title}</div>}
            </label>
          </div>

          {/* Category */}
          <label className="block">
            <span className="text-sm text-gray-700 font-medium">{t('Категория')} *</span>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67] transition-colors"
            >
              {COURSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{t(cat)}</option>
              ))}
            </select>
            {errors.category && <div className="text-xs text-red-500 mt-1">{errors.category}</div>}
          </label>

          {/* Difficulty */}
          <label className="block">
            <span className="text-sm text-gray-700 font-medium">{t('Уровень сложности')}</span>
            <select
              value={formData.difficultyLevel}
              onChange={(e) => handleInputChange('difficultyLevel', e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67] transition-colors"
            >
              <option value="beginner">{t('Начальный')}</option>
              <option value="intermediate">{t('Средний')}</option>
              <option value="advanced">{t('Продвинутый')}</option>
            </select>
          </label>

          {/* Language */}
          <label className="block">
            <span className="text-sm text-gray-700 font-medium">{t('Язык')}</span>
            <select
              value={formData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67] transition-colors"
            >
              <option value="ru">{t('Русский')}</option>
              <option value="kz">{t('Казахский')}</option>
              <option value="en">{t('Английский')}</option>
            </select>
          </label>

          {/* Cover Image */}
          <div className="block">
            <span className="text-sm text-gray-700 font-medium">{t('Обложка курса')}</span>
            <div className="mt-1">
              {formData.coverImageUrl ? (
                <div className="relative inline-block">
                  <img
                    src={formData.coverImageUrl}
                    alt="Cover"
                    className="w-48 h-28 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">{t('Загрузить изображение')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
              {errors.coverImage && <div className="text-xs text-red-500 mt-1">{errors.coverImage}</div>}
            </div>
          </div>

          {/* Short Description */}
          <div className="md:col-span-2">
            <label className="block">
              <span className="text-sm text-gray-700 font-medium">{t('Краткое описание')} *</span>
              <textarea
                value={formData.shortDescription}
                onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67] transition-colors"
                rows={3}
                placeholder={t('Краткое описание для карточки курса')}
              />
              {errors.shortDescription && <div className="text-xs text-red-500 mt-1">{errors.shortDescription}</div>}
            </label>
          </div>

          {/* Full Description */}
          <div className="md:col-span-2">
            <label className="block">
              <span className="text-sm text-gray-700 font-medium">{t('Полное описание')}</span>
              <textarea
                value={formData.fullDescription}
                onChange={(e) => handleInputChange('fullDescription', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67] transition-colors"
                rows={5}
                placeholder={t('Подробное описание курса')}
              />
            </label>
          </div>

          {/* Tags */}
          <div className="md:col-span-2">
            <label className="block">
              <span className="text-sm text-gray-700 font-medium">{t('Теги')}</span>
              <div className="mt-1 flex gap-2">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67] transition-colors"
                  placeholder={t('Введите тег и нажмите Enter')}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                >
                  {t('Добавить')}
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(i)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </label>
          </div>

          {/* Publish */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">{t('Опубликовать курс')}</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between">
          <Link
            href="/admin/tnba"
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            {t('Отмена')}
          </Link>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2.5 bg-[#DC7C67] hover:bg-[#c96d59] disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {submitting ? t('Сохранение...') : (isEdit ? t('Сохранить изменения') : t('Создать курс'))}
            </button>

            {!isEdit && (
              <button
                type="button"
                onClick={() => {
                  if (validate()) {
                    handleSubmit(new Event('submit') as any);
                  }
                }}
                className="px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {t('Сохранить и добавить уроки')}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </form>
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="p-2 md:p-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateCourseContent() {
  return (
    <div className="p-2 md:p-6">
      <Suspense fallback={<LoadingFallback />}>
        <CreateCourseForm />
      </Suspense>
    </div>
  );
}