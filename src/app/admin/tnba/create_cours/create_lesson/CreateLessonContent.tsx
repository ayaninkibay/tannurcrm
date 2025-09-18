'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { useTranslate } from '@/hooks/useTranslate';
import { useAcademyModule } from '@/lib/academy/AcademyModule';
import { 
  Upload, X, Save, FileText, Video, Image, Paperclip, Play, Clock,
  BookOpen, Eye, Link as LinkIcon, File, Download, AlertCircle,
  CheckCircle, Settings, Globe
} from 'lucide-react';

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
    attachments: [] as { name: string; url: string; type: 'file' | 'link'; size?: number }[],
    quizData: null as any
  });

  const [attachmentInput, setAttachmentInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  // Загрузка данных
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
        attachments: parseAttachments(currentLesson.attachments || []),
        quizData: currentLesson.quiz_data || null
      });
    }
  }, [currentLesson]);

  // Парсинг вложений для совместимости
  const parseAttachments = (attachments: string[]) => {
    return attachments.map((att, index) => {
      if (att.includes('#')) {
        const [url, name] = att.split('#');
        return { name, url, type: 'file' as const };
      }
      return { 
        name: `Material ${index + 1}`, 
        url: att, 
        type: 'link' as const 
      };
    });
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

  // Определение типа видео по URL
  const getVideoType = (url: string) => {
    if (!url) return null;
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    if (url.includes('rutube.ru')) return 'rutube';
    if (url.match(/\.(mp4|webm|ogg)$/i)) return 'direct';
    return 'unknown';
  };

  // Извлечение ID видео YouTube
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  // Загрузка обложки
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, thumbnail: 'Можно загружать только изображения' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, thumbnail: 'Размер файла не должен превышать 5MB' });
      return;
    }

    setUploadingThumbnail(true);
    try {
      // Здесь должна быть реальная загрузка в облако
      // Для демо создаем локальный URL
      const localUrl = URL.createObjectURL(file);
      handleInputChange('thumbnailUrl', localUrl);
      
      // Очищаем ошибки
      const { thumbnail, ...restErrors } = errors;
      setErrors(restErrors);
    } catch (error) {
      setErrors({ ...errors, thumbnail: 'Ошибка загрузки изображения' });
    } finally {
      setUploadingThumbnail(false);
    }
  };

  // Загрузка материалов
  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setErrors({ ...errors, attachment: 'Размер файла не должен превышать 50MB' });
      return;
    }

    setUploadingAttachment(true);
    try {
      // Здесь должна быть реальная загрузка в облако
      const localUrl = URL.createObjectURL(file);
      
      const newAttachment = {
        name: file.name,
        url: localUrl,
        type: 'file' as const,
        size: file.size
      };

      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, newAttachment]
      }));
      
      // Очищаем ошибки
      const { attachment, ...restErrors } = errors;
      setErrors(restErrors);
    } catch (error) {
      setErrors({ ...errors, attachment: 'Ошибка загрузки файла' });
    } finally {
      setUploadingAttachment(false);
    }
  };

  const addAttachmentUrl = () => {
    const url = attachmentInput.trim();
    if (!url) return;

    // Проверка валидности URL
    try {
      new URL(url);
    } catch {
      setErrors({ ...errors, attachment: 'Введите корректную ссылку' });
      return;
    }

    // Проверка на дубликаты
    if (formData.attachments.some(att => att.url === url)) {
      setErrors({ ...errors, attachment: 'Эта ссылка уже добавлена' });
      return;
    }

    const newAttachment = {
      name: url.split('/').pop()?.split('?')[0] || 'External Link',
      url,
      type: 'link' as const
    };

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, newAttachment]
    }));
    
    setAttachmentInput('');
    const { attachment, ...restErrors } = errors;
    setErrors(restErrors);
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  // Форматирование размера файла
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Получение иконки по типу файла
  const getFileIcon = (attachment: { name: string; type: string }) => {
    const ext = attachment.name.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <Image className="w-4 h-4 text-blue-500" />;
    }
    if (['pdf'].includes(ext || '')) {
      return <FileText className="w-4 h-4 text-red-500" />;
    }
    if (['doc', 'docx'].includes(ext || '')) {
      return <FileText className="w-4 h-4 text-blue-600" />;
    }
    if (attachment.type === 'link') {
      return <LinkIcon className="w-4 h-4 text-green-500" />;
    }
    return <File className="w-4 h-4 text-gray-500" />;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Введите название урока';
    }
    if (!courseId) {
      newErrors.general = 'Курс не выбран';
    }
    if (formData.videoUrl && !getVideoType(formData.videoUrl)) {
      newErrors.video = 'Неподдерживаемый формат видео';
    }
    if (formData.durationMinutes && parseInt(formData.durationMinutes) < 1) {
      newErrors.duration = 'Длительность должна быть больше 0';
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
        attachments: formData.attachments.map(att => 
          att.type === 'file' ? `${att.url}#${att.name}` : att.url
        ),
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

  const videoType = getVideoType(formData.videoUrl);
  const youtubeId = videoType === 'youtube' ? getYouTubeId(formData.videoUrl) : null;

  return (
    <>
      <MoreHeaderAD title={pageTitle} showBackButton={true} />

      <div className="mt-4 bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {errors.general && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-600 text-sm">{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <BookOpen className="w-4 h-4 text-[#D77E6C]" />
                  {t('Название урока')} <span className="text-red-500">*</span>
                </label>
                <input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D77E6C]/20 focus:border-[#D77E6C] outline-none transition-all"
                  placeholder={t('Например: Введение в маркетинг Tannur')}
                />
                {errors.title && (
                  <div className="flex items-center gap-2 text-xs text-red-500">
                    <AlertCircle className="w-3 h-3" />
                    {errors.title}
                  </div>
                )}
              </div>

              {/* Video URL with Preview */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Video className="w-4 h-4 text-[#D77E6C]" />
                  {t('Видео урока')}
                </label>
                <div className="space-y-3">
                  <input
                    value={formData.videoUrl}
                    onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D77E6C]/20 focus:border-[#D77E6C] outline-none transition-all"
                    placeholder="https://youtube.com/watch?v=... или прямая ссылка на видео"
                  />
                  
                  {/* Video Preview */}
                  {formData.videoUrl && videoType && (
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Play className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          {videoType === 'youtube' && 'YouTube видео'}
                          {videoType === 'vimeo' && 'Vimeo видео'}
                          {videoType === 'rutube' && 'RuTube видео'}
                          {videoType === 'direct' && 'Прямая ссылка'}
                        </span>
                      </div>
                      {youtubeId && (
                        <img 
                          src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                          alt="Video preview"
                          className="w-32 h-24 object-cover rounded-lg"
                        />
                      )}
                    </div>
                  )}
                  
                  {formData.videoUrl && !videoType && (
                    <div className="p-3 bg-red-50 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600">Неподдерживаемый формат видео</span>
                    </div>
                  )}
                </div>
                {errors.video && (
                  <div className="flex items-center gap-2 text-xs text-red-500">
                    <AlertCircle className="w-3 h-3" />
                    {errors.video}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">{t('Описание урока')}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D77E6C]/20 focus:border-[#D77E6C] outline-none transition-all resize-none"
                  rows={4}
                  placeholder={t('Краткое описание содержания урока')}
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">{t('Подробное содержание')}</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D77E6C]/20 focus:border-[#D77E6C] outline-none transition-all resize-none"
                  rows={8}
                  placeholder={t('Детальное содержание урока, план и ключевые моменты')}
                />
              </div>

              {/* Homework */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">{t('Домашнее задание')}</label>
                <textarea
                  value={formData.homework}
                  onChange={(e) => handleInputChange('homework', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#D77E6C]/20 focus:border-[#D77E6C] outline-none transition-all resize-none"
                  rows={4}
                  placeholder={t('Задания для самостоятельной работы и закрепления материала')}
                />
              </div>
            </div>

            {/* Right Column - Settings & Media */}
            <div className="space-y-6">
              {/* Lesson Settings */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Settings className="w-5 h-5 text-[#D77E6C]" />
                  {t('Настройки урока')}
                </h3>

                {/* Duration & Order */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Clock className="w-4 h-4" />
                      {t('Минут')}
                    </label>
                    <input
                      type="number"
                      value={formData.durationMinutes}
                      onChange={(e) => handleInputChange('durationMinutes', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#D77E6C]/20 focus:border-[#D77E6C] outline-none"
                      placeholder="30"
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{t('Порядок')}</label>
                    <input
                      type="number"
                      value={formData.orderIndex}
                      onChange={(e) => handleInputChange('orderIndex', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#D77E6C]/20 focus:border-[#D77E6C] outline-none"
                      min="1"
                    />
                  </div>
                </div>

                {/* Status Toggles */}
                <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-[#D77E6C] border-gray-300 rounded focus:ring-[#D77E6C]"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{t('Опубликовать урок')}</div>
                      <div className="text-xs text-gray-500">{t('Урок будет доступен студентам')}</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPreview}
                      onChange={(e) => handleInputChange('isPreview', e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-[#D77E6C] border-gray-300 rounded focus:ring-[#D77E6C]"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{t('Предпросмотр')}</div>
                      <div className="text-xs text-gray-500">{t('Доступен без регистрации')}</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Thumbnail */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">{t('Обложка урока')}</label>
                {formData.thumbnailUrl ? (
                  <div className="relative group">
                    <img
                      src={formData.thumbnailUrl}
                      alt="Thumbnail"
                      className="w-full h-40 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => handleInputChange('thumbnailUrl', '')}
                      className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      value={formData.thumbnailUrl}
                      onChange={(e) => handleInputChange('thumbnailUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#D77E6C]/20 focus:border-[#D77E6C] outline-none"
                      placeholder="https://example.com/image.jpg"
                    />
                    
                    <div className="text-center">
                      <span className="text-xs text-gray-500">{t('или')}</span>
                    </div>
                    
                    <label className="cursor-pointer block">
                      <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-[#D77E6C] hover:bg-[#D77E6C]/5 transition-all">
                        <Upload className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500">
                          {uploadingThumbnail ? t('Загрузка...') : t('Загрузить')}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        disabled={uploadingThumbnail}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
                {errors.thumbnail && (
                  <div className="flex items-center gap-2 text-xs text-red-500">
                    <AlertCircle className="w-3 h-3" />
                    {errors.thumbnail}
                  </div>
                )}
              </div>

              {/* Attachments */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-900">{t('Материалы урока')}</label>
                
                {/* Attachments List */}
                {formData.attachments.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {formData.attachments.map((attachment, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        {getFileIcon(attachment)}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {attachment.name}
                          </div>
                          {attachment.size && (
                            <div className="text-xs text-gray-500">
                              {formatFileSize(attachment.size)}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-gray-200 rounded text-blue-600"
                            title={t('Открыть')}
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          <button
                            type="button"
                            onClick={() => removeAttachment(i)}
                            className="p-1 hover:bg-red-100 rounded text-red-500"
                            title={t('Удалить')}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Attachment */}
                <div className="space-y-2">
                  <input
                    value={attachmentInput}
                    onChange={(e) => setAttachmentInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAttachmentUrl())}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#D77E6C]/20 focus:border-[#D77E6C] outline-none"
                    placeholder={t('Ссылка на материал')}
                  />
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={addAttachmentUrl}
                      className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                    >
                      {t('Добавить ссылку')}
                    </button>
                    
                    <label className="cursor-pointer">
                      <div className="px-3 py-2 bg-[#D77E6C] hover:bg-[#C66B5A] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        {uploadingAttachment ? t('Загрузка...') : t('Файл')}
                      </div>
                      <input
                        type="file"
                        onChange={handleAttachmentUpload}
                        disabled={uploadingAttachment}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                
                {errors.attachment && (
                  <div className="flex items-center gap-2 text-xs text-red-500">
                    <AlertCircle className="w-3 h-3" />
                    {errors.attachment}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
            <Link
              href={courseId ? `/admin/tnba/course?id=${courseId}` : '/admin/tnba'}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors"
            >
              {t('Отмена')}
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-[#D77E6C] hover:bg-[#C66B5A] disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {submitting ? t('Сохранение...') : (isEdit ? t('Сохранить изменения') : t('Создать урок'))}
            </button>
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
              <div className="h-40 bg-gray-200 rounded"></div>
            </div>
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