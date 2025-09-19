'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { useTranslate } from '@/hooks/useTranslate';
import { eventsService } from '@/lib/events/EventService';

export default function CreateEventPage() {
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
    event_type: 'turnover' as 'turnover' | 'sales' | 'team',
    target_amount: '',
    reward: '',
    reward_description: '',
    start_date: '',
    end_date: '',
    max_participants: ''
  });

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        event_type: formData.event_type,
        target_amount: Number(formData.target_amount) || 0,
        reward: formData.reward,
        reward_description: formData.reward_description,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        max_participants: formData.max_participants ? Number(formData.max_participants) : null,
        status: 'active'
      };

      console.log('Creating event with data:', eventData);
      
      const result = await eventsService.createEvent(eventData);
      
      console.log('Event created successfully:', result);
      
      showNotification('Событие успешно создано!', 'success');
      
      setTimeout(() => {
        router.push('/admin/dashboard');
        router.refresh();
      }, 1500);
      
    } catch (error: any) {
      console.error('Error creating event:', error);
      showNotification(error.message || 'Не удалось создать событие', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Встроенное уведомление */}
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
        <MoreHeaderAD title={t('Создание нового события')} />
      </div>

      <form onSubmit={handleSubmit} className="px-4 md:px-6 pb-8">
        <div className="max-w-full">
          {/* Основная информация */}
          <div className="bg-white rounded-2xl p-6 md:p-8 mb-6">
            <h3 className="text-lg font-semibold mb-6">{t('Основная информация')}</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Название события')}
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                  placeholder={t('Например: Зимний марафон продаж')}
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
                  placeholder={t('Опишите суть события и условия участия')}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Тип события')}
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base appearance-none bg-white"
                  value={formData.event_type}
                  onChange={(e) => setFormData({...formData, event_type: e.target.value as 'turnover' | 'sales' | 'team'})}
                >
                  <option value="turnover">{t('По товарообороту')}</option>
                  <option value="sales">{t('По количеству продаж')}</option>
                  <option value="team">{t('Командное')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Цели и награды */}
          <div className="bg-white rounded-2xl p-6 md:p-8 mb-6">
            <h3 className="text-lg font-semibold mb-6">{t('Цели и награды')}</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Целевая сумма товарооборота')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                    placeholder="50000000"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
                  />
                  <span className="absolute right-4 top-3.5 text-gray-500">₸</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Максимум участников')}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                  placeholder={t('Без ограничений')}
                  value={formData.max_participants}
                  onChange={(e) => setFormData({...formData, max_participants: e.target.value})}
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Награда')}
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                placeholder={t('Например: iPhone 15 Pro или Путёвка на двоих')}
                value={formData.reward}
                onChange={(e) => setFormData({...formData, reward: e.target.value})}
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Описание награды')}
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base resize-none"
                placeholder={t('Детально опишите, что получит победитель')}
                value={formData.reward_description}
                onChange={(e) => setFormData({...formData, reward_description: e.target.value})}
              />
            </div>
          </div>

          {/* Сроки */}
          <div className="bg-white rounded-2xl p-6 md:p-8 mb-8">
            <h3 className="text-lg font-semibold mb-6">{t('Сроки проведения')}</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Дата начала')}
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
                  {t('Дата окончания')}
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