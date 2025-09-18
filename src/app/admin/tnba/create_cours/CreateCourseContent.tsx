'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { useTranslate } from '@/hooks/useTranslate';
import { useAcademyModule } from '@/lib/academy/AcademyModule';
import { Upload, X, Save, ArrowRight, Plus, Edit2, Trash2, BookOpen, Tag, Globe, BarChart3 } from 'lucide-react';

// Интерфейс для категории
interface CourseCategory {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
}

// Моковые категории (замените на реальные из API)
const DEFAULT_CATEGORIES: CourseCategory[] = [
  { id: '1', name: 'Знакомство с Tannur', is_active: true },
  { id: '2', name: 'Маркетинг', is_active: true },
  { id: '3', name: 'Продажи', is_active: true },
  { id: '4', name: 'Продукты', is_active: true }
];

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

  // Состояния
  const [categories, setCategories] = useState<CourseCategory[]>(DEFAULT_CATEGORIES);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<CourseCategory | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    language: 'ru',
    shortDescription: '',
    fullDescription: '',
    difficultyLevel: 'beginner',
    tags: [] as string[],
    isPublished: false,
    coverImage: null as File | null,
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
        category: currentCourse.category || '',
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

  // Функции для управления категориями
  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const newCategory: CourseCategory = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      is_active: true
    };
    
    setCategories(prev => [...prev, newCategory]);
    setNewCategoryName('');
  };

  const updateCategory = () => {
    if (!editingCategory || !editingCategory.name.trim()) return;
    
    setCategories(prev => prev.map(cat => 
      cat.id === editingCategory.id ? editingCategory : cat
    ));
    setEditingCategory(null);
  };

  const deleteCategory = (categoryId: string) => {
    if (confirm(t('Удалить категорию?'))) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, coverImage: 'Выберите изображение (JPEG, PNG, GIF, WebP)' }));
      return;
    }

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

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">{t('Управление категориями')}</h3>
              <button
                onClick={() => setShowCategoryManager(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add New Category */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium mb-3">{t('Добавить категорию')}</h4>
              <div className="flex gap-2">
                <input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder={t('Название категории')}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
                <button
                  onClick={addCategory}
                  className="px-4 py-2 bg-[#D77E6C] hover:bg-[#C66B5A] text-white rounded-lg text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Categories List */}
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                  {editingCategory?.id === category.id ? (
                    <input
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                      className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && updateCategory()}
                    />
                  ) : (
                    <span className="flex-1 text-sm font-medium">{category.name}</span>
                  )}
                  
                  <div className="flex items-center gap-1">
                    {editingCategory?.id === category.id ? (
                      <>
                        <button
                          onClick={updateCategory}
                          className="p-1 hover:bg-green-50 rounded text-green-600"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingCategory(null)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingCategory(category)}
                          className="p-1 hover:bg-blue-50 rounded text-blue-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCategory(category.id)}
                          className="p-1 hover:bg-red-50 rounded text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="mt-4 bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {errors.general && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <BookOpen className="w-4 h-4 text-[#D77E6C]" />
                  {t('Название курса')} <span className="text-red-500">*</span>
                </label>
                <input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D77E6C]/20 focus:border-[#D77E6C] outline-none transition-all"
                  placeholder={t('Например: Основы маркетинга Tannur')}
                />
                {errors.title && <div className="text-xs text-red-500">{errors.title}</div>}
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Tag className="w-4 h-4 text-[#D77E6C]" />
                  {t('Краткое описание')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D77E6C]/20 focus:border-[#D77E6C] outline-none transition-all resize-none"
                  rows={3}
                  placeholder={t('Краткое описание для карточки курса')}
                />
                {errors.shortDescription && <div className="text-xs text-red-500">{errors.shortDescription}</div>}
              </div>

              {/* Full Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">{t('Полное описание')}</label>
                <textarea
                  value={formData.fullDescription}
                  onChange={(e) => handleInputChange('fullDescription', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D77E6C]/20 focus:border-[#D77E6C] outline-none transition-all resize-none"
                  rows={6}
                  placeholder={t('Подробное описание курса, цели и задачи обучения')}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">{t('Теги курса')}</label>
                <div className="flex gap-2">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D77E6C]/20 focus:border-[#D77E6C] outline-none transition-all"
                    placeholder={t('Введите тег и нажмите Enter')}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors"
                  >
                    {t('Добавить')}
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#D77E6C]/10 text-[#D77E6C] rounded-full text-sm font-medium"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(i)}
                          className="text-[#D77E6C] hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Settings */}
            <div className="space-y-6">
              {/* Category */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-sm font-semibold text-gray-900">
                  <span className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#D77E6C]" />
                    {t('Категория')} <span className="text-red-500">*</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCategoryManager(true)}
                    className="text-xs text-[#D77E6C] hover:text-[#C66B5A] font-medium"
                  >
                    {t('Управление')}
                  </button>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D77E6C]/20 focus:border-[#D77E6C] outline-none transition-all"
                >
                  <option value="">{t('Выберите категорию')}</option>
                  {categories.filter(cat => cat.is_active).map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                {errors.category && <div className="text-xs text-red-500">{errors.category}</div>}
              </div>

              {/* Language */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Globe className="w-4 h-4 text-[#D77E6C]" />
                  {t('Язык курса')}
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D77E6C]/20 focus:border-[#D77E6C] outline-none transition-all"
                >
                  <option value="ru">{t('Русский')}</option>
                  <option value="kz">{t('Казахский')}</option>
                  <option value="en">{t('Английский')}</option>
                </select>
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <BarChart3 className="w-4 h-4 text-[#D77E6C]" />
                  {t('Уровень сложности')}
                </label>
                <select
                  value={formData.difficultyLevel}
                  onChange={(e) => handleInputChange('difficultyLevel', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D77E6C]/20 focus:border-[#D77E6C] outline-none transition-all"
                >
                  <option value="beginner">{t('Начальный')}</option>
                  <option value="intermediate">{t('Средний')}</option>
                  <option value="advanced">{t('Продвинутый')}</option>
                </select>
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">{t('Обложка курса')}</label>
                {formData.coverImageUrl ? (
                  <div className="relative group">
                    <img
                      src={formData.coverImageUrl}
                      alt="Cover"
                      className="w-full h-40 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <div className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-[#D77E6C] hover:bg-[#D77E6C]/5 transition-all">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">{t('Загрузить обложку')}</span>
                      <span className="text-xs text-gray-400 mt-1">{t('до 5MB')}</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
                {errors.coverImage && <div className="text-xs text-red-500">{errors.coverImage}</div>}
              </div>

              {/* Publish Toggle */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#D77E6C] border-gray-300 rounded focus:ring-[#D77E6C]"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{t('Опубликовать курс')}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {t('Курс будет доступен всем дилерам в академии')}
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
            <Link
              href={isEdit ? `/admin/tnba/course?id=${courseId}` : "/admin/tnba"}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors"
            >
              {t('Отмена')}
            </Link>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-[#D77E6C] hover:bg-[#C66B5A] disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {submitting ? t('Сохранение...') : (isEdit ? t('Сохранить изменения') : t('Создать курс'))}
              </button>

              {!isEdit && (
                <button
                  type="button"
                  onClick={async () => {
                    if (validate()) {
                      await handleSubmit(new Event('submit') as any);
                    }
                  }}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {t('Создать и добавить уроки')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="p-2 md:p-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
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