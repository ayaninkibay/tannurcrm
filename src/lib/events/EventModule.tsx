

"use client";

import React from 'react';
import Image from 'next/image';
import { Calendar, Gift, Target, Clock, ChevronRight, Edit, Trash2, Eye, Copy, Archive } from 'lucide-react';
import type { Event } from '@/types/custom.types';

// ========================================
// КАРТОЧКА СОБЫТИЯ
// ========================================

interface EventCardProps {
  event: Event;
  onClick?: () => void;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onArchive?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  onClick, 
  showActions = false,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive
}) => {
  // Определяем статус и цвет
  const getStatusInfo = () => {
    if (!event.event_status) {
      const today = new Date().toISOString().split('T')[0];
      const startDate = event.start_date;
      const endDate = event.end_date;
      
      if (startDate > today) {
        return { 
          status: 'upcoming', 
          label: 'Ожидается', 
          color: 'bg-yellow-100 text-yellow-800',
          borderColor: 'border-yellow-300'
        };
      } else if (today >= startDate && today <= endDate) {
        return { 
          status: 'active', 
          label: 'Активно', 
          color: 'bg-green-100 text-green-800',
          borderColor: 'border-green-300'
        };
      } else {
        return { 
          status: 'past', 
          label: 'Завершено', 
          color: 'bg-gray-100 text-gray-600',
          borderColor: 'border-gray-300'
        };
      }
    }

    switch (event.event_status) {
      case 'active':
        return { 
          status: 'active', 
          label: `Активно (осталось ${event.days_remaining} дн.)`, 
          color: 'bg-green-100 text-green-800',
          borderColor: 'border-green-300'
        };
      case 'upcoming':
        return { 
          status: 'upcoming', 
          label: `Начнется через ${event.days_until} дн.`, 
          color: 'bg-yellow-100 text-yellow-800',
          borderColor: 'border-yellow-300'
        };
      case 'past':
        return { 
          status: 'past', 
          label: 'Завершено', 
          color: 'bg-gray-100 text-gray-600',
          borderColor: 'border-gray-300'
        };
      default:
        return { 
          status: 'unknown', 
          label: 'Неизвестно', 
          color: 'bg-gray-100 text-gray-600',
          borderColor: 'border-gray-300'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const isPast = statusInfo.status === 'past';

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border-2 ${statusInfo.borderColor} ${isPast ? 'opacity-75' : ''}`}
      onClick={onClick}
    >
      {/* Изображение */}
      {event.image_url && (
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover"
          />
          {event.badge_icon && (
            <div
              className="absolute top-3 right-3 w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg"
              style={{ backgroundColor: event.badge_color || '#3B82F6' }}
            >
              {event.badge_icon}
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        {/* Статус и даты */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          {event.is_featured && (
            <span className="text-yellow-500">⭐</span>
          )}
        </div>

        {/* Заголовок */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {event.title}
        </h3>

        {/* Описание */}
        {event.short_description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {event.short_description}
          </p>
        )}

        {/* Период */}
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <Calendar className="h-4 w-4 mr-1" />
          {new Date(event.start_date).toLocaleDateString('ru-RU')} - {new Date(event.end_date).toLocaleDateString('ru-RU')}
        </div>

        {/* Цели и награды (превью) */}
        <div className="space-y-2">
          {event.goals && event.goals.length > 0 && (
            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 text-blue-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Цели:</p>
                <p className="text-sm text-gray-700 line-clamp-1">
                  {event.goals[0]}
                  {event.goals.length > 1 && ` и еще ${event.goals.length - 1}`}
                </p>
              </div>
            </div>
          )}

          {event.rewards && event.rewards.length > 0 && (
            <div className="flex items-start gap-2">
              <Gift className="h-4 w-4 text-green-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Награды:</p>
                <p className="text-sm text-gray-700 line-clamp-1">
                  {event.rewards[0]}
                  {event.rewards.length > 1 && ` и еще ${event.rewards.length - 1}`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Теги */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {event.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Действия для админа */}
        {showActions && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
              className="flex-1 flex items-center justify-center gap-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <Edit className="h-4 w-4" />
              Изменить
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate?.();
              }}
              className="flex-1 flex items-center justify-center gap-1 text-sm text-gray-600 hover:text-gray-800"
            >
              <Copy className="h-4 w-4" />
              Копия
            </button>
            {event.status !== 'archived' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive?.();
                }}
                className="flex-1 flex items-center justify-center gap-1 text-sm text-yellow-600 hover:text-yellow-800"
              >
                <Archive className="h-4 w-4" />
                Архив
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              className="flex-1 flex items-center justify-center gap-1 text-sm text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4" />
              Удалить
            </button>
          </div>
        )}

        {/* Кнопка "Подробнее" для пользователей */}
        {!showActions && (
          <button className="mt-4 w-full flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800">
            Подробнее
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// ========================================
// ГРУППА СОБЫТИЙ
// ========================================

interface EventGroupProps {
  title: string;
  events: Event[];
  icon?: React.ReactNode;
  emptyMessage?: string;
  onEventClick?: (event: Event) => void;
  showActions?: boolean;
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
  onDuplicate?: (event: Event) => void;
  onArchive?: (event: Event) => void;
}

export const EventGroup: React.FC<EventGroupProps> = ({
  title,
  events,
  icon,
  emptyMessage = 'Нет событий',
  onEventClick,
  showActions = false,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive
}) => {
  if (events.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          {icon}
          {title}
        </h2>
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        {icon}
        {title}
        <span className="text-sm font-normal text-gray-500">({events.length})</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onClick={() => onEventClick?.(event)}
            showActions={showActions}
            onEdit={() => onEdit?.(event)}
            onDelete={() => onDelete?.(event)}
            onDuplicate={() => onDuplicate?.(event)}
            onArchive={() => onArchive?.(event)}
          />
        ))}
      </div>
    </div>
  );
};

// ========================================
// ДЕТАЛЬНЫЙ ВИД СОБЫТИЯ
// ========================================

interface EventDetailProps {
  event: Event;
  onBack?: () => void;
  showAdminActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const EventDetail: React.FC<EventDetailProps> = ({
  event,
  onBack,
  showAdminActions = false,
  onEdit,
  onDelete
}) => {
  const getStatusInfo = () => {
    const today = new Date().toISOString().split('T')[0];
    if (event.start_date > today) {
      return { label: 'Ожидается', color: 'bg-yellow-100 text-yellow-800' };
    } else if (today >= event.start_date && today <= event.end_date) {
      return { label: 'Активно', color: 'bg-green-100 text-green-800' };
    } else {
      return { label: 'Завершено', color: 'bg-gray-100 text-gray-600' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Хлебные крошки */}
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          ← Назад к событиям
        </button>
      )}

      {/* Баннер */}
      {event.banner_url && (
        <div className="relative h-64 rounded-lg overflow-hidden mb-6">
          <Image
            src={event.banner_url}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Заголовок и статус */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {event.badge_icon && (
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center text-3xl"
                  style={{ backgroundColor: event.badge_color || '#3B82F6' }}
                >
                  {event.badge_icon}
                </div>
              )}
              <h1 className="text-3xl font-bold text-gray-900">
                {event.title}
              </h1>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>

          {showAdminActions && (
            <div className="flex gap-2">
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Редактировать
              </button>
              <button
                onClick={onDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Удалить
              </button>
            </div>
          )}
        </div>

        {/* Период */}
        <div className="flex items-center text-gray-600 mb-4">
          <Calendar className="h-5 w-5 mr-2" />
          <span>
            {new Date(event.start_date).toLocaleDateString('ru-RU', { 
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })} — {new Date(event.end_date).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </span>
        </div>

        {/* Описание */}
        {event.description && (
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
          </div>
        )}
      </div>

      {/* Цели */}
      {event.goals && event.goals.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Цели события
          </h2>
          <ul className="space-y-3">
            {event.goals.map((goal, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <span className="text-gray-700">{goal}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Награды */}
      {event.rewards && event.rewards.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Gift className="h-5 w-5 text-green-500" />
            Награды
          </h2>
          <ul className="space-y-3">
            {event.rewards.map((reward, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 text-2xl">🎁</span>
                <span className="text-gray-700">{reward}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Условия */}
      {event.conditions && event.conditions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Условия участия</h2>
          <ul className="space-y-2">
            {event.conditions.map((condition, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-yellow-500">⚠️</span>
                <span className="text-gray-700">{condition}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Галерея */}
      {event.gallery && event.gallery.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Галерея</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {event.gallery.map((image, index) => (
              <div key={index} className="relative rounded-lg overflow-hidden w-full h-48">
                <Image
                  src={image}
                  alt={`Галерея ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ========================================
// ПУСТОЕ СОСТОЯНИЕ
// ========================================

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EventEmptyState: React.FC<EmptyStateProps> = ({
  title = 'Нет событий',
  description = 'События появятся здесь после создания',
  actionLabel,
  onAction
}) => {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
        <Calendar className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};