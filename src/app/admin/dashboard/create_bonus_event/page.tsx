'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { useTranslate } from '@/hooks/useTranslate';
import { bonusEventService, BonusEventTarget } from '@/lib/bonus_event/BonusEventService';

export default function CreateBonusEventPage() {
  const { t } = useTranslate();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: ''
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
      const result = await bonusEventService.createBonusEvent(formData, sortedTargets);
      
      console.log('Bonus event created:', result);
      showNotification('Бонусное событие успешно создано!', 'success');
      
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 1500);
      
    } catch (error: any) {
      console.error('Error creating bonus event:', error);
      showNotification(error.message || 'Не удалось создать событие', 'error');
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
    { value: 'vacation', label: '🏖️ Отпуск' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Уведомление */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
          notification.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
          <div className={`${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`}>
            {notification.type === 'success' ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="white"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="white"/>
              </svg>
            )}
            <p className="font-medium">{notification.message}</p>
          </div>
        </div>
      )}

      <div className="px-4 md:px-6 py-6">
        <MoreHeaderAD title={t('Создание бонусного события')} />
      </div>

      <form onSubmit={handleSubmit} className="px-4 md:px-6 pb-8">
        <div className="max-w-full">
          {/* Основная информация */}
          <div className="bg-white rounded-2xl p-6 md:p-8 mb-6">
            <h3 className="text-lg font-semibold mb-6">{t('Основная информация')}</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Название события')} *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                  placeholder={t('Например: Весенний марафон 2025')}
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Описание')}
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base resize-none"
                  placeholder={t('Опишите суть события и правила участия')}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              {/* Сроки */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('Дата начала')} *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('Дата окончания')} *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Цели и награды */}
          <div className="bg-white rounded-2xl p-6 md:p-8 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">{t('Цели и награды')}</h3>
              <button
                type="button"
                onClick={addTarget}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium text-sm"
              >
                + {t('Добавить цель')}
              </button>
            </div>
            
            <div className="space-y-6">
              {targets.map((target, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-xl p-6 relative">
                  {targets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTarget(index)}
                      className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                      </svg>
                    </button>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('Целевая сумма товарооборота')} *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                          placeholder="10000000"
                          value={target.target_amount}
                          onChange={(e) => updateTarget(index, 'target_amount', Number(e.target.value))}
                        />
                        <span className="absolute right-4 top-3.5 text-gray-500">₸</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('Иконка награды')}
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                        value={target.reward_icon}
                        onChange={(e) => updateTarget(index, 'reward_icon', e.target.value)}
                      >
                        {iconOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('Название награды')} *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                      placeholder={t('Например: Бонус 1 млн тенге')}
                      value={target.reward_title}
                      onChange={(e) => updateTarget(index, 'reward_title', e.target.value)}
                    />
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('Описание награды')}
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base resize-none"
                      placeholder={t('Детально опишите награду')}
                      value={target.reward_description}
                      onChange={(e) => updateTarget(index, 'reward_description', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
            >
              {t('Отмена')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              )}
              {loading ? t('Создание...') : t('Создать событие')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}