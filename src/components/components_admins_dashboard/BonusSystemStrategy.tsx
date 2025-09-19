'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslate } from '@/hooks/useTranslate';
import { eventsService, EventWithStats } from '@/lib/events/EventService';

// Модальное окно подтверждения удаления
const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  eventTitle 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  eventTitle: string;
}) => {
  const { t } = useTranslate();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold mb-2">{t('Подтверждение удаления')}</h3>
        <p className="text-gray-600 mb-6">
          {t('Вы уверены, что хотите удалить событие')} "<strong>{eventTitle}</strong>"? 
          {t(' Это действие нельзя отменить.')}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            {t('Отмена')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            {t('Удалить')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Компонент карточки события
// Обновленный EventCard компонент
const EventCard = ({ 
  event,
  isPlaceholder = false,
  onDelete
}: {
  event?: EventWithStats;
  isPlaceholder?: boolean;
  onDelete?: (event: EventWithStats) => void;
}) => {
  const { t } = useTranslate();
  const router = useRouter();
  
  if (isPlaceholder) {
    return (
      <div 
        onClick={() => router.push('/admin/dashboard/create-event')}
        className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[400px] cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-all"
      >
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14m-7-7h14" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-gray-900 font-medium text-center mb-2">{t('Создать новое событие')}</p>
        <p className="text-sm text-gray-500 text-center">{t('Добавьте новое событие или цель')}</p>
      </div>
    );
  }

  if (!event) return null;

  const progressPercent = event.participants_count > 0 
    ? Math.round((event.achieved_count / event.participants_count) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full min-h-[400px]">
      {/* Header - фиксированная высота */}
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" fill="#EA580C"/>
          </svg>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button 
            onClick={() => router.push(`/admin/dashboard/events/${event.id}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title={t('Просмотр')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#9CA3AF"/>
            </svg>
          </button>
          <button 
            onClick={() => onDelete && onDelete(event)}
            className="p-2 hover:bg-red-50 rounded-lg transition group"
            title={t('Удалить')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" 
                fill="#9CA3AF" 
                className="group-hover:fill-red-500 transition-colors"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Контент - растягивается */}
      <div className="flex-1 flex flex-col">
        {/* Заголовок и описание */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{event.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]">
            {event.description || ''}
          </p>
        </div>

        {/* Статистика */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{t('Участников')}</span>
            <span className="font-medium text-sm">{event.participants_count}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{t('Достигли цели')}</span>
            <span className="font-medium text-sm text-green-600">{event.achieved_count}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{t('Общий товарооборот')}</span>
            <span className="font-medium text-sm">{(event.total_turnover || 0).toLocaleString('ru-RU')} ₸</span>
          </div>
        </div>

        {/* Прогресс-бар */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">{t('Прогресс достижения')}</span>
            <span className="font-medium">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Цель и награда */}
        <div className="space-y-2 mb-4 flex-1">
          <div>
            <p className="text-xs text-gray-500">{t('Цель')}</p>
            <p className="font-semibold text-sm text-gray-900">
              {(event.target_amount !== null && event.target_amount !== undefined) 
                ? `${Number(event.target_amount).toLocaleString('ru-RU')} ₸` 
                : '0 ₸'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">{t('Награда')}</p>
            <p className="font-medium text-sm text-orange-600 line-clamp-1">{event.reward || '-'}</p>
          </div>
        </div>
      </div>

      {/* Кнопка - всегда внизу */}
      <button 
        onClick={() => router.push(`/admin/dashboard/events/${event.id}`)}
        className="w-full py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-2 mt-auto"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="white"/>
        </svg>
        {t('Подробнее')}
      </button>
    </div>
  );
};

// Основной компонент
export const BonusSystemStrategy = () => {
  const { t } = useTranslate();
  const router = useRouter();
  const [events, setEvents] = useState<EventWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    event: EventWithStats | null;
  }>({ isOpen: false, event: null });
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadEvents = async () => {
    try {
      console.log('Loading events...');
      const data = await eventsService.getEventsWithStats();
      console.log('Events loaded:', data);
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    loadEvents();
  };

  const handleDeleteClick = (event: EventWithStats) => {
    setDeleteModal({ isOpen: true, event });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.event) return;
    
    try {
      const success = await eventsService.deleteEvent(deleteModal.event.id);
      if (success) {
        showNotification('Событие успешно удалено', 'success');
        loadEvents(); // Перезагружаем список
      } else {
        showNotification('Ошибка при удалении события', 'error');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      showNotification('Не удалось удалить событие', 'error');
    }
    
    setDeleteModal({ isOpen: false, event: null });
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <section className="space-y-6 relative">
      {/* Уведомление */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white px-6 py-3 rounded-lg shadow-lg`}>
          <p>{notification.message}</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" fill="#EA580C"/>
            </svg>
          </div>
          <h2 className="text-xl font-medium">{t('Управление событиями')}</h2>
        </div>
        <button 
          onClick={handleRefresh}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title={t('Обновить')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="#6B7280"/>
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <EventCard key={event.id} event={event} onDelete={handleDeleteClick} />
        ))}
        <EventCard isPlaceholder={true} />
      </div>

      {/* Модальное окно подтверждения */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, event: null })}
        onConfirm={handleDeleteConfirm}
        eventTitle={deleteModal.event?.title || ''}
      />
    </section>
  );
};