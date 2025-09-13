'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabase/client';
import { 
  Calendar, 
  Gift, 
  Target, 
  AlertCircle, 
  Plus, 
  X, 
  Save, 
  ArrowLeft,
  Image,
  Tag,
  Sparkles,
  FileText,
  Clock,
  Upload
} from 'lucide-react';
import type { CreateEventInput } from '@/types/custom.types';

// Дефолтные цвета для бейджей
const BADGE_COLORS = [
  '#DC7C67', // главный цвет бренда
  '#C86B56',
  '#B95F4A',
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // yellow
  '#8B5CF6', // purple
  '#EC4899', // pink
];

// Дефолтные иконки
const BADGE_ICONS = [
  '🎯', '🏆', '🎁', '💎', '🔥', '⭐', '🚀', '💰', 
  '🎉', '🏅', '✨', '🌟', '💪', '🎊', '🥇', '🎈'
];

export default function CreateEventPage() {
  const router = useRouter();
  const { profile, loading: userLoading } = useUser();
  
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<CreateEventInput>({
    title: '',
    short_description: '',
    description: '',
    start_date: '',
    end_date: '',
    goals: [],
    rewards: [],
    conditions: [],
    badge_color: BADGE_COLORS[0],
    badge_icon: BADGE_ICONS[4], // 🔥
    priority: 0,
    is_featured: false,
    tags: [],
    status: 'draft',
    image_url: '',
    banner_url: '',
    gallery: []
  });

  // Временные поля для добавления элементов
  const [newGoal, setNewGoal] = useState('');
  const [newReward, setNewReward] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newTag, setNewTag] = useState('');

  // Функция загрузки изображения
  const uploadImage = async (file: File, type: 'main' | 'banner') => {
    try {
      // Проверка размера файла (макс 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Размер файла не должен превышать 10MB');
      }

      // Проверка типа файла
      if (!file.type.startsWith('image/')) {
        throw new Error('Пожалуйста, выберите изображение');
      }

      // Генерируем уникальное имя файла
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = type === 'main' 
        ? `events/${fileName}`
        : `events/banners/${fileName}`;

      // Загружаем файл в Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Ошибка при загрузке файла');
      }

      // Получаем публичный URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err: any) {
      console.error('Error in uploadImage:', err);
      throw err;
    }
  };

  // Обработчик загрузки основного изображения
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);

    try {
      const url = await uploadImage(file, 'main');
      setFormData(prev => ({ ...prev, image_url: url }));
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке изображения');
    } finally {
      setUploadingImage(false);
    }
  };

  // Обработчик загрузки баннера
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    setError(null);

    try {
      const url = await uploadImage(file, 'banner');
      setFormData(prev => ({ ...prev, banner_url: url }));
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке баннера');
    } finally {
      setUploadingBanner(false);
    }
  };

  // Удаление изображения
  const removeImage = (type: 'main' | 'banner') => {
    if (type === 'main') {
      setFormData(prev => ({ ...prev, image_url: '' }));
    } else {
      setFormData(prev => ({ ...prev, banner_url: '' }));
    }
  };

  // Проверка прав администратора
  React.useEffect(() => {
    if (!userLoading && !profile) {
      router.push('/signin');
    } else if (!userLoading && profile && profile.role !== 'admin') {
      setError('У вас нет прав администратора для создания событий');
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }
  }, [profile, userLoading, router]);

  // Обработка сохранения
  const handleSave = async (status: 'draft' | 'published' = 'draft') => {
    if (!profile) {
      setError('Необходимо авторизоваться');
      router.push('/signin');
      return;
    }

    if (profile.role !== 'admin') {
      setError('У вас нет прав администратора');
      return;
    }

    if (!formData.title || !formData.start_date || !formData.end_date) {
      setError('Заполните обязательные поля: название, дата начала и окончания');
      return;
    }

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      setError('Дата начала не может быть позже даты окончания');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('events')
        .insert([{
          ...formData,
          status,
          created_by: profile.id
        }]);

      if (insertError) throw insertError;
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/dealer/dashboard/events');
      }, 1500);
    } catch (err: any) {
      console.error('Error creating event:', err);
      
      if (err.code === '42501') {
        setError('Нет прав на создание события. Убедитесь, что вы администратор.');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Произошла ошибка при создании события');
      }
    } finally {
      setSaving(false);
    }
  };

  // Добавление элементов в массивы
  const addArrayItem = (field: 'goals' | 'rewards' | 'conditions' | 'tags', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()]
      }));
      
      if (field === 'goals') setNewGoal('');
      if (field === 'rewards') setNewReward('');
      if (field === 'conditions') setNewCondition('');
      if (field === 'tags') setNewTag('');
    }
  };

  // Удаление элементов из массивов
  const removeArrayItem = (field: 'goals' | 'rewards' | 'conditions' | 'tags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index)
    }));
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DC7C67]"></div>
      </div>
    );
  }

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Доступ запрещен</h2>
          <p className="text-gray-600">У вас нет прав для просмотра этой страницы</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#F8F1EF] to-white">
      {/* Шапка страницы */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-[#DC7C67] via-[#C86B56] to-[#B95F4A] shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/dealer/dashboard/events"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/15 border border-white/25 hover:bg-white/25 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-white" />
              </Link>
              <div className="text-white">
                <h1 className="text-2xl font-semibold">Создание события</h1>
                <p className="text-white/80 text-sm mt-0.5">Заполните информацию о новом событии</p>
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <FileText className="w-4 h-4" />
                Сохранить как черновик
              </button>
              <button
                onClick={() => handleSave('published')}
                disabled={saving || !formData.title}
                className="px-4 py-2 bg-white text-[#C86B56] rounded-lg hover:bg-white/90 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#C86B56]"></div>
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Опубликовать
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Success message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <div className="h-5 w-5">✓</div>
            Событие успешно создано! Перенаправление...
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Левая колонка - основной контент */}
          <div className="lg:col-span-2 space-y-6">
            {/* Основная информация */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-[#FFF7F5] to-[#FFF2F0] border-b border-gray-100">
                <h2 className="text-lg font-semibold text-[#B95F4A]">Основная информация</h2>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название события *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#DC7C67] focus:border-transparent outline-none transition-all"
                    placeholder="Например: Август - месяц рекордов!"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Краткое описание
                  </label>
                  <input
                    type="text"
                    value={formData.short_description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#DC7C67] focus:border-transparent outline-none transition-all"
                    placeholder="Краткое описание для карточки"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.short_description?.length || 0}/500 символов
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Полное описание
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#DC7C67] focus:border-transparent outline-none transition-all resize-none"
                    rows={5}
                    placeholder="Подробное описание события"
                  />
                </div>

                {/* Даты */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      Дата начала *
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#DC7C67] focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="inline w-4 h-4 mr-1" />
                      Дата окончания *
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      min={formData.start_date}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#DC7C67] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Цели */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-[#EAF2FF] to-[#F0F6FF] border-b border-gray-100">
                <h2 className="text-lg font-semibold text-[#3366CC] flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Цели события
                </h2>
              </div>
              
              <div className="p-6 space-y-3">
                {formData.goals && formData.goals.length > 0 && (
                  <div className="space-y-2">
                    {formData.goals.map((goal, index) => (
                      <div key={index} className="flex items-center gap-2 bg-blue-50 p-3 rounded-xl">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="flex-1 text-gray-800">{goal}</span>
                        <button
                          onClick={() => removeArrayItem('goals', index)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('goals', newGoal);
                      }
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Например: Сделать 10 продаж"
                  />
                  <button
                    onClick={() => addArrayItem('goals', newGoal)}
                    className="px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4" />
                    Добавить
                  </button>
                </div>
              </div>
            </div>

            {/* Награды */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-[#F0FFF4] to-[#E6FFED] border-b border-gray-100">
                <h2 className="text-lg font-semibold text-green-700 flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Награды
                </h2>
              </div>
              
              <div className="p-6 space-y-3">
                {formData.rewards && formData.rewards.length > 0 && (
                  <div className="space-y-2">
                    {formData.rewards.map((reward, index) => (
                      <div key={index} className="flex items-center gap-2 bg-green-50 p-3 rounded-xl">
                        <span className="flex-shrink-0 text-2xl">🎁</span>
                        <span className="flex-1 text-gray-800">{reward}</span>
                        <button
                          onClick={() => removeArrayItem('rewards', index)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newReward}
                    onChange={(e) => setNewReward(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('rewards', newReward);
                      }
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    placeholder="Например: Шампунь в подарок"
                  />
                  <button
                    onClick={() => addArrayItem('rewards', newReward)}
                    className="px-4 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4" />
                    Добавить
                  </button>
                </div>
              </div>
            </div>

            {/* Условия участия */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-[#FFFBEB] to-[#FEF3C7] border-b border-gray-100">
                <h2 className="text-lg font-semibold text-yellow-700 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Условия участия
                </h2>
                <p className="text-sm text-gray-600 mt-1">Необязательно</p>
              </div>
              
              <div className="p-6 space-y-3">
                {formData.conditions && formData.conditions.length > 0 && (
                  <div className="space-y-2">
                    {formData.conditions.map((condition, index) => (
                      <div key={index} className="flex items-center gap-2 bg-yellow-50 p-3 rounded-xl">
                        <span className="text-yellow-500">⚠️</span>
                        <span className="flex-1 text-gray-800">{condition}</span>
                        <button
                          onClick={() => removeArrayItem('conditions', index)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('conditions', newCondition);
                      }
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                    placeholder="Например: Для дилеров от 2 уровня"
                  />
                  <button
                    onClick={() => addArrayItem('conditions', newCondition)}
                    className="px-4 py-2.5 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4" />
                    Добавить
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Правая колонка - настройки */}
          <div className="space-y-6">
            {/* Визуальные настройки */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-[#FFF7F5] to-[#FFF2F0] border-b border-gray-100">
                <h2 className="text-lg font-semibold text-[#B95F4A]">Оформление</h2>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Цвет бейджа
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {BADGE_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setFormData(prev => ({ ...prev, badge_color: color }))}
                        className={`w-full aspect-square rounded-xl border-2 transition-all ${
                          formData.badge_color === color 
                            ? 'border-gray-900 scale-110 shadow-lg' 
                            : 'border-gray-200 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Иконка события
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {BADGE_ICONS.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setFormData(prev => ({ ...prev, badge_icon: icon }))}
                        className={`w-full aspect-square rounded-xl border-2 flex items-center justify-center text-2xl transition-all ${
                          formData.badge_icon === icon 
                            ? 'border-[#DC7C67] bg-[#FFF7F5] scale-110' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Изображения */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-[#FFF7F5] to-[#FFF2F0] border-b border-gray-100">
                <h2 className="text-lg font-semibold text-[#B95F4A] flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Изображения
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Основное изображение */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Основное изображение
                  </label>
                  
                  {!formData.image_url ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploadingImage ? (
                          <>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DC7C67] mb-2"></div>
                            <p className="text-sm text-gray-500">Загрузка...</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mb-2 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Нажмите для загрузки</span>
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG до 10MB</p>
                          </>
                        )}
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                  ) : (
                    <div className="relative">
                      <img 
                        src={formData.image_url} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('main')}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Баннер */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Баннер
                  </label>
                  
                  {!formData.banner_url ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploadingBanner ? (
                          <>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DC7C67] mb-2"></div>
                            <p className="text-sm text-gray-500">Загрузка...</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mb-2 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Загрузить баннер</span>
                            </p>
                            <p className="text-xs text-gray-500">Рекомендуемый размер: 1920x400</p>
                          </>
                        )}
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleBannerUpload}
                        disabled={uploadingBanner}
                      />
                    </label>
                  ) : (
                    <div className="relative">
                      <img 
                        src={formData.banner_url} 
                        alt="Banner Preview" 
                        className="w-full h-32 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('banner')}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Дополнительные настройки */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-[#FFF7F5] to-[#FFF2F0] border-b border-gray-100">
                <h2 className="text-lg font-semibold text-[#B95F4A]">Настройки</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Приоритет
                  </label>
                  <input
                    type="number"
                    value={formData.priority || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#DC7C67] focus:border-transparent outline-none transition-all"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Чем выше число, тем выше в списке</p>
                </div>

                <label className="flex items-center gap-3 p-3 bg-[#FFF7F5] rounded-xl cursor-pointer hover:bg-[#FDEAE5] transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.is_featured || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="w-4 h-4 text-[#DC7C67] rounded focus:ring-[#DC7C67]"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Выделить событие</span>
                    <p className="text-xs text-gray-500">Показать с отметкой "Горячее"</p>
                  </div>
                </label>

                {/* Теги */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    Теги
                  </label>
                  {formData.tags && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                          #{tag}
                          <button
                            onClick={() => removeArrayItem('tags', index)}
                            className="text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem('tags', newTag);
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#DC7C67] focus:border-transparent outline-none transition-all text-sm"
                      placeholder="Тег"
                    />
                    <button
                      onClick={() => addArrayItem('tags', newTag)}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}