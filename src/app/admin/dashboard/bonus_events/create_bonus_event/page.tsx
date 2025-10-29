// src/app/admin/dashboard/bonus_events/create_bonus_event/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { useTranslate } from '@/hooks/useTranslate';
import { bonusEventService, BonusEventTarget } from '@/lib/bonus_event/BonusEventService';
import { supabase } from '@/lib/supabase/client';

export default function CreateBonusEventPage() {
  const { t } = useTranslate();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams?.get('id');
  const isEditMode = !!eventId;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    priority: 0
  });

  const [targets, setTargets] = useState<BonusEventTarget[]>([
    {
      target_amount: 10000000,
      reward_title: 'Бонус 1 млн тенге',
      reward_description: 'Денежный бонус за достижение первой цели',
      reward_icon: 'money',
      sort_order: 0
    }
  ]);

  // Load existing event data if in edit mode
  useEffect(() => {
    if (isEditMode && eventId) {
      loadEventData(eventId);
    }
  }, [eventId, isEditMode]);

  const loadEventData = async (id: string) => {
    setInitialLoading(true);
    try {
      const event = await bonusEventService.getBonusEventById(id);
      if (event) {
        setFormData({
          title: event.title,
          description: event.description || '',
          start_date: event.start_date,
          end_date: event.end_date,
          priority: event.priority || 0
        });
        
        if (event.targets && event.targets.length > 0) {
          setTargets(event.targets);
        }
      } else {
        showNotification('Событие не найдено', 'error');
        router.push('/admin/dashboard/bonus_events');
      }
    } catch (error) {
      console.error('Error loading event:', error);
      showNotification('Ошибка загрузки события', 'error');
    } finally {
      setInitialLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const addTarget = () => {
    setTargets([...targets, {
      target_amount: 0,
      reward_title: '',
      reward_description: '',
      reward_icon: 'gift',
      sort_order: targets.length
    }]);
  };

  const removeTarget = (index: number) => {
    if (targets.length > 1) {
      setTargets(targets.filter((_, i) => i !== index));
    }
  };

  const updateTarget = (index: number, field: keyof BonusEventTarget, value: any) => {
    const updatedTargets = [...targets];
    updatedTargets[index] = {
      ...updatedTargets[index],
      [field]: value
    };
    setTargets(updatedTargets);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.title || !formData.start_date || !formData.end_date) {
      showNotification('Заполните все обязательные поля', 'error');
      return;
    }

    if (targets.some(t => !t.reward_title || t.target_amount <= 0)) {
      showNotification('Заполните все поля целей корректно', 'error');
      return;
    }

    // Сортируем цели по сумме
    const sortedTargets = [...targets].sort((a, b) => a.target_amount - b.target_amount);
    sortedTargets.forEach((target, index) => {
      target.sort_order = index;
    });

    setLoading(true);

    try {
      if (isEditMode && eventId) {
        // UPDATE MODE: Update event and targets
        
        // 1. Update main event
        const updateSuccess = await bonusEventService.updateBonusEvent(eventId, {
          title: formData.title,
          description: formData.description,
          start_date: formData.start_date,
          end_date: formData.end_date,
          priority: formData.priority
        });

        if (!updateSuccess) {
          throw new Error('Не удалось обновить событие');
        }

        // 2. Delete old targets
        const { error: deleteError } = await supabase
          .from('bonus_event_targets')
          .delete()
          .eq('event_id', eventId);

        if (deleteError) {
          console.error('Error deleting old targets:', deleteError);
          throw deleteError;
        }

        // 3. Insert new targets
        const targetsWithEventId = sortedTargets.map(target => ({
          ...target,
          event_id: eventId
        }));

        const { error: insertError } = await supabase
          .from('bonus_event_targets')
          .insert(targetsWithEventId);

        if (insertError) {
          console.error('Error inserting new targets:', insertError);
          throw insertError;
        }

        showNotification('Событие успешно обновлено!', 'success');
        
        setTimeout(() => {
          router.push(`/admin/dashboard/bonus_events/event/${eventId}`);
        }, 1500);

      } else {
        // CREATE MODE: Create new event
        const result = await bonusEventService.createBonusEvent(formData, sortedTargets);
        
        console.log('Bonus event created:', result);
        showNotification('Бонусное событие успешно создано!', 'success');
        
        setTimeout(() => {
          router.push('/admin/dashboard/bonus_events');
        }, 1500);
      }
      
    } catch (error: any) {
      console.error('Error saving bonus event:', error);
      showNotification(error.message || 'Не удалось сохранить событие', 'error');
    } finally {
      setLoading(false);
    }
  };

  const iconOptions = [
    { value: 'money', label: '💰 Деньги' },
    { value: 'plane', label: '✈️ Путешествие' },
    { value: 'car', label: '🚗 Автомобиль' },
    { value: 'home', label: '🏠 Недвижимость' },
    { value: 'gift', label: '🎁 Подарок' },
    { value: 'trophy', label: '🏆 Трофей' },
    { value: 'star', label: '⭐ Звезда' },
    { value: 'vacation', label: '🏖️ Отпуск' },
    { value: 'diamond', label: '💎 Алмаз' },
    { value: 'crown', label: '👑 Корона' },
    { value: 'medal', label: '🏅 Медаль' },
    { value: 'rocket', label: '🚀 Ракета' }
  ];

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('Загрузка данных события...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Уведомление */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
          notification.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
          <div className={`${
            notification.type === 'success' 
              ? 'bg-gradient-to-r from-emerald-500 to-green-600' 
              : 'bg-gradient-to-r from-red-500 to-rose-600'
          } text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 min-w-[300px]`}>
            {notification.type === 'success' ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="white"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="white"/>
              </svg>
            )}
            <p className="font-medium">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mx-auto">
        <MoreHeaderAD 
          title={isEditMode ? t('Редактирование события') : t('Создание бонусного события')}
          showBackButton={true}
        />
      </div>

      <form onSubmit={handleSubmit} className="mt-8">
        <div className="mx-auto">
          {/* Основная информация */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D77E6C] to-[#C66B5A] rounded-xl flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{t('Основная информация')}</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  {t('Название события')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D77E6C]/50 focus:border-[#D77E6C] transition-all text-base font-medium placeholder:text-gray-400"
                  placeholder={t('Например: Весенний марафон 2025')}
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  {t('Описание')}
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D77E6C]/50 focus:border-[#D77E6C] transition-all text-base resize-none placeholder:text-gray-400"
                  placeholder={t('Опишите суть события и правила участия')}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              {/* Сроки и приоритет */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200/50">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    {t('Дата начала')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2.5 bg-white border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-base font-medium"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  />
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200/50">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    {t('Дата окончания')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2.5 bg-white border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-base font-medium"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  />
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-100/50 rounded-xl p-4 border border-amber-200/50">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    {t('Приоритет')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    className="w-full px-4 py-2.5 bg-white border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-base font-medium"
                    placeholder="0"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: Number(e.target.value)})}
                  />
                  <p className="text-xs text-gray-600 mt-1.5 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    {t('1 = главное событие')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Цели и награды */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{t('Цели и награды')}</h3>
                  <p className="text-sm text-gray-500">{targets.length} {t('целей настроено')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addTarget}
                className="px-5 py-2.5 bg-gradient-to-r from-[#D77E6C] to-[#C66B5A] text-white rounded-xl hover:shadow-lg transition-all font-semibold text-sm flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {t('Добавить цель')}
              </button>
            </div>
            
            <div className="space-y-6">
              {targets.map((target, index) => (
                <div key={index} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#D77E6C]/5 to-[#C66B5A]/5 rounded-2xl transform group-hover:scale-[1.02] transition-transform"></div>
                  <div className="relative border-2 border-gray-200 group-hover:border-[#D77E6C]/30 rounded-2xl p-6 transition-all">
                    {targets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTarget(index)}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-lg transition-all"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    )}

                    <div className="mb-5">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D77E6C] to-[#C66B5A] text-white rounded-xl shadow-sm">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span className="text-sm font-bold">{t('Цель')} #{index + 1}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          {t('Целевая сумма')} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            className="w-full px-4 py-3.5 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D77E6C]/50 focus:border-[#D77E6C] transition-all text-base font-bold text-gray-900 placeholder:text-gray-400"
                            placeholder="10000000"
                            value={target.target_amount}
                            onChange={(e) => updateTarget(index, 'target_amount', Number(e.target.value))}
                          />
                          <span className="absolute right-4 top-4 text-gray-500 font-semibold">₸</span>
                        </div>
                        <div className="mt-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg">
                          <p className="text-sm font-semibold text-emerald-700">
                            {bonusEventService.formatAmount(target.target_amount || 0)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          {t('Иконка награды')}
                        </label>
                        <div className="relative">
                          <select
                            className="w-full px-4 py-3.5 pr-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D77E6C]/50 focus:border-[#D77E6C] transition-all text-base font-medium appearance-none bg-white cursor-pointer"
                            value={target.reward_icon}
                            onChange={(e) => updateTarget(index, 'reward_icon', e.target.value)}
                          >
                            {iconOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-4 pointer-events-none">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        {t('Название награды')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D77E6C]/50 focus:border-[#D77E6C] transition-all text-base font-medium placeholder:text-gray-400"
                        placeholder={t('Например: Бонус 1 млн тенге')}
                        value={target.reward_title}
                        onChange={(e) => updateTarget(index, 'reward_title', e.target.value)}
                      />
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        {t('Описание награды')}
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D77E6C]/50 focus:border-[#D77E6C] transition-all text-base resize-none placeholder:text-gray-400"
                        placeholder={t('Детально опишите награду')}
                        value={target.reward_description}
                        onChange={(e) => updateTarget(index, 'reward_description', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="w-full px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('Отмена')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-[#D77E6C] to-[#C66B5A] text-white rounded-xl hover:shadow-xl transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading && (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              )}
              {loading 
                ? (isEditMode ? t('Сохранение...') : t('Создание...'))
                : (isEditMode ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="currentColor"/>
                    </svg>
                    {t('Сохранить изменения')}
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    {t('Создать событие')}
                  </>
                ))
              }
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}