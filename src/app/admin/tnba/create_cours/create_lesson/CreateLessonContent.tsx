'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { useTranslate } from '@/hooks/useTranslate';
import { useAcademyModule } from '@/lib/academy/AcademyModule';
import { Upload, X, Save, FileText, Video, Image, Paperclip } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

function CreateLessonForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslate();
  
  const courseId = searchParams?.get('courseId');
  const lessonId = searchParams?.get('lessonId');
  const isEdit = !!lessonId;

  const {
    currentCourse,
    currentLesson,
    loading,
    error,
    loadCourse,
    loadLesson,
    createLesson,
    updateLesson
  } = useAcademyModule();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    videoUrl: '',
    thumbnailUrl: '',
    durationMinutes: '',
    orderIndex: 1,
    isPublished: false,
    isPreview: false,
    homework: '',
    attachments: [] as string[],
    quizData: null as any
  });

  const [attachmentInput, setAttachmentInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  useEffect(() => {
    if (courseId) {
      loadCourse(courseId);
    }
  }, [courseId]);

  useEffect(() => {
    if (isEdit && lessonId) {
      loadLesson(lessonId);
    }
  }, [lessonId]);

  useEffect(() => {
    if (isEdit && currentLesson) {
      setFormData({
        title: currentLesson.title || '',
        description: currentLesson.description || '',
        content: currentLesson.content || '',
        videoUrl: currentLesson.video_url || '',
        thumbnailUrl: currentLesson.thumbnail_url || '',
        durationMinutes: currentLesson.duration_minutes?.toString() || '',
        orderIndex: currentLesson.order_index || 1,
        isPublished: currentLesson.is_published || false,
        isPreview: currentLesson.is_preview || false,
        homework: currentLesson.homework || '',
        attachments: currentLesson.attachments || [],
        quizData: currentLesson.quiz_data || null
      });
    }
  }, [currentLesson]);

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

  // Загрузка обложки
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      setErrors({ thumbnail: 'Можно загружать только изображения' });
      return;
    }

    // Проверка размера (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ thumbnail: 'Размер файла не должен превышать 5MB' });
      return;
    }

    setUploadingThumbnail(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `lesson-thumbnails/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('academy')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('academy')
        .getPublicUrl(filePath);

      handleInputChange('thumbnailUrl', publicUrl);
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      setErrors({ thumbnail: 'Ошибка загрузки изображения' });
    } finally {
      setUploadingThumbnail(false);
    }
  };

  // Загрузка материалов
  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка размера (макс 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setErrors({ attachment: 'Размер файла не должен превышать 50MB' });
      return;
    }

    setUploadingAttachment(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `lesson-materials/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('academy')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('academy')
        .getPublicUrl(filePath);

      // Добавляем файл в список материалов с оригинальным именем
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, `${publicUrl}#${file.name}`]
      }));
    } catch (error) {
      console.error('Error uploading attachment:', error);
      setErrors({ attachment: 'Ошибка загрузки файла' });
    } finally {
      setUploadingAttachment(false);
    }
  };

  const addAttachmentUrl = () => {
    const url = attachmentInput.trim();
    if (url && !formData.attachments.includes(url)) {
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, url]
      }));
      setAttachmentInput('');
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const getAttachmentName = (attachment: string) => {
    // Если это загруженный файл с именем после #
    if (attachment.includes('#')) {
      return attachment.split('#')[1];
    }
    // Иначе показываем последнюю часть URL
    return attachment.split('/').pop() || attachment;
  };

  const getAttachmentUrl = (attachment: string) => {
    // Извлекаем чистый URL без имени файла
    return attachment.split('#')[0];
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Введите название урока';
    }
    if (!courseId) {
      newErrors.general = 'Курс не выбран';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate() || !courseId) return;
    
    setSubmitting(true);
    try {
      const duration = formData.durationMinutes ? parseInt(formData.durationMinutes) : undefined;
      
      const lessonData = {
        courseId,
        title: formData.title,
        description: formData.description,
        content: formData.content,
        videoUrl: formData.videoUrl,
        thumbnailUrl: formData.thumbnailUrl,
        durationMinutes: duration,
        orderIndex: formData.orderIndex,
        isPublished: formData.isPublished,
        isPreview: formData.isPreview,
        homework: formData.homework,
        attachments: formData.attachments.map(a => getAttachmentUrl(a)), // Сохраняем только URL
        quizData: formData.quizData
      };

      if (isEdit && lessonId) {
        await updateLesson(lessonId, lessonData);
      } else {
        await createLesson(lessonData);
      }
      
      router.push(`/admin/tnba/course?id=${courseId}`);
    } catch (err) {
      console.error('Error saving lesson:', err);
      setErrors({ general: 'Ошибка сохранения урока' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-2 md:p-6">
        <MoreHeaderAD title={t('Загрузка...')} showBackButton={true} />
        <div className="mt-6 flex justify-center">
          <div className="text-gray-500">{t('Загрузка...')}</div>
        </div>
      </div>
    );
  }

  const pageTitle = currentCourse 
    ? (isEdit ? t('Редактировать урок') : t('Создать урок')) + `: ${currentCourse.title}`
    : (isEdit ? t('Редактировать урок') : t('Создать урок'));

  return (
    <>
      <MoreHeaderAD title={pageTitle} showBackButton={true} />

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
              <span className="text-sm text-gray-700 font-medium">{t('Название урока')} *</span>
              <input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
                placeholder={t('Например: Введение в маркетинг')}
              />
              {errors.title && <div className="text-xs text-red-500 mt-1">{errors.title}</div>}
            </label>
          </div>

          {/* Duration & Order */}
          <label className="block">
            <span className="text-sm text-gray-700 font-medium">{t('Длительность (минут)')}</span>
            <input
              type="number"
              value={formData.durationMinutes}
              onChange={(e) => handleInputChange('durationMinutes', e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              placeholder="30"
              min="1"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700 font-medium">{t('Порядок в курсе')}</span>
            <input
              type="number"
              value={formData.orderIndex}
              onChange={(e) => handleInputChange('orderIndex', parseInt(e.target.value) || 1)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              min="1"
            />
          </label>

          {/* Video URL */}
          <div className="md:col-span-2">
            <label className="block">
              <span className="text-sm text-gray-700 font-medium">{t('Ссылка на видео')}</span>
              <div className="mt-1 flex gap-2">
                <Video className="w-5 h-5 text-gray-400 mt-2" />
                <input
                  value={formData.videoUrl}
                  onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
                  placeholder="https://youtube.com/watch?v=... или прямая ссылка"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {t('Поддерживаются YouTube и прямые ссылки на видео')}
              </p>
            </label>
          </div>

          {/* Thumbnail - с загрузкой файла */}
          <div className="md:col-span-2">
            <label className="block">
              <span className="text-sm text-gray-700 font-medium">{t('Обложка урока')}</span>
              
              {/* Превью если есть */}
              {formData.thumbnailUrl && (
                <div className="mt-2 mb-3 relative inline-block">
                  <img 
                    src={formData.thumbnailUrl} 
                    alt="Thumbnail" 
                    className="h-32 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleInputChange('thumbnailUrl', '')}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="mt-1 space-y-2">
                {/* URL ввод */}
                <div className="flex gap-2">
                  <Image className="w-5 h-5 text-gray-400 mt-2" />
                  <input
                    value={formData.thumbnailUrl}
                    onChange={(e) => handleInputChange('thumbnailUrl', e.target.value)}
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Загрузка файла */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{t('или')}</span>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                      disabled={uploadingThumbnail}
                    />
                    <div className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm inline-flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {uploadingThumbnail ? t('Загрузка...') : t('Загрузить изображение')}
                    </div>
                  </label>
                </div>
              </div>
              {errors.thumbnail && <div className="text-xs text-red-500 mt-1">{errors.thumbnail}</div>}
            </label>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block">
              <span className="text-sm text-gray-700 font-medium">{t('Краткое описание')}</span>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
                rows={3}
                placeholder={t('О чем этот урок')}
              />
            </label>
          </div>

          {/* Content */}
          <div className="md:col-span-2">
            <label className="block">
              <span className="text-sm text-gray-700 font-medium">{t('Содержание урока')}</span>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
                rows={6}
                placeholder={t('Подробное содержание урока')}
              />
            </label>
          </div>

          {/* Homework */}
          <div className="md:col-span-2">
            <label className="block">
              <span className="text-sm text-gray-700 font-medium">{t('Домашнее задание')}</span>
              <textarea
                value={formData.homework}
                onChange={(e) => handleInputChange('homework', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
                rows={4}
                placeholder={t('Задания для самостоятельной работы')}
              />
            </label>
          </div>

          {/* Attachments - с загрузкой файлов */}
          <div className="md:col-span-2">
            <label className="block">
              <span className="text-sm text-gray-700 font-medium">{t('Материалы урока')}</span>
              
              {/* Список загруженных материалов */}
              {formData.attachments.length > 0 && (
                <div className="mt-2 mb-3 space-y-2">
                  {formData.attachments.map((attachment, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 truncate">
                          {getAttachmentName(attachment)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(i)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                {/* URL ввод */}
                <div className="flex gap-2">
                  <FileText className="w-5 h-5 text-gray-400 mt-2" />
                  <input
                    value={attachmentInput}
                    onChange={(e) => setAttachmentInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAttachmentUrl())}
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
                    placeholder={t('Ссылка на материал')}
                  />
                  <button
                    type="button"
                    onClick={addAttachmentUrl}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                  >
                    {t('Добавить')}
                  </button>
                </div>

                {/* Загрузка файла */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{t('или')}</span>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      onChange={handleAttachmentUpload}
                      className="hidden"
                      disabled={uploadingAttachment}
                    />
                    <div className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm inline-flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {uploadingAttachment ? t('Загрузка...') : t('Загрузить файл')}
                    </div>
                  </label>
                  <span className="text-xs text-gray-500">{t('(макс. 50MB)')}</span>
                </div>
              </div>
              {errors.attachment && <div className="text-xs text-red-500 mt-1">{errors.attachment}</div>}
            </label>
          </div>

          {/* Settings */}
          <div className="md:col-span-2 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">{t('Опубликовать урок')}</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPreview}
                onChange={(e) => handleInputChange('isPreview', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">{t('Доступен для предпросмотра')}</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between">
          <Link
            href={courseId ? `/admin/tnba/course?id=${courseId}` : '/admin/tnba'}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
          >
            {t('Отмена')}
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2.5 bg-[#DC7C67] hover:bg-[#c96d59] disabled:opacity-60 text-white rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {submitting ? t('Сохранение...') : (isEdit ? t('Сохранить изменения') : t('Создать урок'))}
          </button>
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
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateLessonPage() {
  return (
    <div className="p-2 md:p-6">
      <Suspense fallback={<LoadingFallback />}>
        <CreateLessonForm />
      </Suspense>
    </div>
  );
}