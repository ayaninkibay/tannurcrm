'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/context/UserContext';
import { 
  Calendar, 
  Gift, 
  Target, 
  Clock, 
  ArrowLeft,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Share2,
  Sparkles,
  Tag,
  Archive
} from 'lucide-react';
import type { Event } from '@/types/custom.types';

// Для Next.js 15 params теперь Promise
export default function EventDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const router = useRouter();
  const { profile } = useUser();
  
  // В Next.js 15 используем use() для распаковки Promise
  const { id: eventId } = use(params);
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Загрузка события
  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading event with ID:', eventId);

      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (fetchError) {
        console.error('Supabase error:', fetchError);
        throw fetchError;
      }
      
      console.log('Event data loaded:', data);
      
      // Вычисляем статус и дни
      if (data) {
        const today = new Date().toISOString().split('T')[0];
        const startDate = data.start_date;
        const endDate = data.end_date;
        
        if (startDate > today) {
          data.event_status = 'upcoming';
          data.days_until = Math.ceil((new Date(startDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
        } else if (today >= startDate && today <= endDate) {
          data.event_status = 'active';
          data.days_remaining = Math.ceil((new Date(endDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
        } else {
          data.event_status = 'past';
        }
      }

      setEvent(data);
    } catch (err: any) {
      console.error('Error loading event:', err);
      setError('Не удалось загрузить событие');
    } finally {
      setLoading(false);
    }
  };

  // Удаление события (для админа)
  const handleDelete = async () => {
    if (!event || !confirm('Вы уверены, что хотите удалить это событие?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);

      if (deleteError) throw deleteError;

      router.push('/dealer/dashboard/events');
    } catch (err: any) {
      console.error('Error deleting event:', err);
      alert('Не удалось удалить событие');
    }
  };

  // Архивирование события
  const handleArchive = async () => {
    if (!event) return;

    try {
      const { error: updateError } = await supabase
        .from('events')
        .update({ status: 'archived' })
        .eq('id', event.id);

      if (updateError) throw updateError;

      await loadEvent();
    } catch (err: any) {
      console.error('Error archiving event:', err);
      alert('Не удалось архивировать событие');
    }
  };

  // Копирование ссылки
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Получение информации о статусе
  const getStatusInfo = () => {
    if (!event) return null;

    switch (event.event_status) {
      case 'active':
        return {
          label: 'Активно',
          description: event.days_remaining ? `Осталось ${event.days_remaining} дней` : 'Активно',
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="w-4 h-4" />
        };
      case 'upcoming':
        return {
          label: 'Предстоящее',
          description: event.days_until ? `Начнется через ${event.days_until} дней` : 'Скоро',
          color: 'bg-yellow-100 text-yellow-800',
          icon: <Clock className="w-4 h-4" />
        };
      case 'past':
        return {
          label: 'Завершено',
          description: 'Событие завершено',
          color: 'bg-gray-100 text-gray-600',
          icon: <Archive className="w-4 h-4" />
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DC7C67]"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Ошибка</h2>
          <p className="text-gray-600 mb-4">{error || 'Событие не найдено'}</p>
          <p className="text-sm text-gray-500 mb-4">ID: {eventId}</p>
          <Link
            href="/dealer/dashboard/events"
            className="px-4 py-2 bg-[#DC7C67] text-white rounded-lg hover:bg-[#C86B56] transition-colors inline-block"
          >
            Вернуться к событиям
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#F8F1EF] to-white">
      {/* Шапка с навигацией */}
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
                <h1 className="text-2xl font-semibold">Событие</h1>
                <p className="text-white/80 text-sm mt-0.5">{event.title}</p>
              </div>
            </div>

            {/* Действия для админа */}
            {profile?.role === 'admin' && (
              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/events/edit/${event.id}`}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Edit className="w-4 h-4" />
                  Редактировать
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500/20 text-white rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Удалить
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Баннер */}
      {event.banner_url && (
        <div className="relative h-64 md:h-96 overflow-hidden">
          <img 
            src={event.banner_url} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      {/* Контент */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основной контент */}
          <div className="lg:col-span-2 space-y-6">
            {/* Заголовок и статус */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-start gap-4 mb-4">
                {event.badge_icon && (
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-sm"
                    style={{ backgroundColor: event.badge_color || '#DC7C67' }}
                  >
                    {event.badge_icon}
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {event.title}
                  </h1>
                  {statusInfo && (
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                      {statusInfo.icon}
                      <span>{statusInfo.label}</span>
                      <span className="text-xs opacity-75">• {statusInfo.description}</span>
                    </div>
                  )}
                </div>
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
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Цели события
                </h2>
                <div className="space-y-3">
                  {event.goals.map((goal, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <p className="text-gray-700 pt-1">{goal}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Награды */}
            {event.rewards && event.rewards.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-green-500" />
                  Награды
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {event.rewards.map((reward, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
                      <span className="text-2xl">🎁</span>
                      <p className="text-gray-700">{reward}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Условия */}
            {event.conditions && event.conditions.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  Условия участия
                </h2>
                <ul className="space-y-3">
                  {event.conditions.map((condition, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-yellow-500 mt-0.5">⚠️</span>
                      <p className="text-gray-700">{condition}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Галерея */}
            {event.gallery && event.gallery.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-xl font-semibold mb-4">Галерея</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {event.gallery.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Галерея ${index + 1}`}
                      className="rounded-xl w-full h-48 object-cover"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Информация о событии */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold mb-4">Информация</h3>
              
              <div className="space-y-4">
                {/* Период */}
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Период</p>
                    <p className="text-gray-900">
                      {new Date(event.start_date).toLocaleDateString('ru-RU', { 
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })} — {new Date(event.end_date).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Приоритет */}
                {event.priority && event.priority > 0 && (
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Приоритет</p>
                      <p className="text-gray-900">{event.priority}</p>
                    </div>
                  </div>
                )}

                {/* Избранное */}
                {event.is_featured && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl">
                    <Sparkles className="w-5 h-5 text-red-500" />
                    <p className="text-sm font-medium text-red-700">Горячее событие</p>
                  </div>
                )}
              </div>

              {/* Действия */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleShare}
                  className="w-full px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Ссылка скопирована
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      Поделиться
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Теги */}
            {event.tags && event.tags.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Теги
                </h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Админские действия */}
            {profile?.role === 'admin' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold mb-4">Управление</h3>
                <div className="space-y-3">
                  {event.status !== 'archived' && (
                    <button
                      onClick={handleArchive}
                      className="w-full px-4 py-2 border border-yellow-200 text-yellow-700 rounded-xl hover:bg-yellow-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Archive className="w-4 h-4" />
                      Архивировать
                    </button>
                  )}
                  <Link
                    href={`/admin/events/duplicate/${event.id}`}
                    className="w-full px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 inline-block text-center"
                  >
                    Создать копию
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}