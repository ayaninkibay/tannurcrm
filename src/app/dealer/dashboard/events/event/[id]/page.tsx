'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/context/UserContext';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import { 
  Calendar, 
  Gift, 
  Target, 
  Clock,
  AlertCircle,
  CheckCircle,
  Share2,
  Sparkles,
  Tag,
  ChevronRight,
  Users,
  TrendingUp,
  Award,
  Image as ImageIcon
} from 'lucide-react';
import type { Event } from '@/types/custom.types';

export default function EventDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const router = useRouter();
  const { profile } = useUser();
  const { id: eventId } = use(params);
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (eventId) {
      loadEvent();
      loadRelatedEvents();
    }
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (fetchError) throw fetchError;
      
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

  const loadRelatedEvents = async () => {
    try {
      const { data } = await supabase
        .from('events')
        .select('id, title, start_date, short_description, badge_icon, badge_color')
        .eq('status', 'published')
        .neq('id', eventId)
        .limit(3);
      
      setRelatedEvents(data || []);
    } catch (err) {
      console.error('Error loading related events:', err);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusInfo = () => {
    if (!event) return null;

    switch (event.event_status) {
      case 'active':
        return {
          label: 'Активно',
          sublabel: event.days_remaining ? `${event.days_remaining} дней` : '',
          color: 'bg-green-50 text-green-700 border-green-200',
          icon: <CheckCircle className="w-4 h-4" />
        };
      case 'upcoming':
        return {
          label: 'Скоро',
          sublabel: event.days_until ? `через ${event.days_until} дней` : '',
          color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
          icon: <Clock className="w-4 h-4" />
        };
      case 'past':
        return {
          label: 'Завершено',
          sublabel: '',
          color: 'bg-gray-50 text-gray-600 border-gray-200',
          icon: <CheckCircle className="w-4 h-4" />
        };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DC7C67]"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="w-full min-h-screen bg-gray-50">
        <div className="p-4">
          <MoreHeaderDE title="Событие" showBackButton={true} />
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Ошибка</h2>
            <p className="text-gray-600 mb-4">{error || 'Событие не найдено'}</p>
            <Link
              href="/dealer/dashboard/events"
              className="px-6 py-3 bg-[#DC7C67] text-white rounded-xl hover:bg-[#C86B56] transition-colors inline-block"
            >
              Вернуться к событиям
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="p-4">
        <MoreHeaderDE title="Событие" showBackButton={true} />
      </div>

      {/* Hero-блок с изображением на весь блок включая информацию */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl border border-gray-100 overflow-hidden mb-6">
          {/* Фоновое изображение на весь блок */}
          <div className="absolute inset-0">
            {(event.image_url || event.banner_url) ? (
              <img
                src={event.banner_url || event.image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#DC7C67]/20 to-[#DC7C67]/10">
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-24 h-24 text-[#DC7C67]/20" />
                </div>
              </div>
            )}
            {/* Градиент overlay для всего блока */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
          </div>

          {/* Контент поверх изображения */}
          <div className="relative min-h-[400px] sm:min-h-[450px] lg:min-h-[500px] flex flex-col">
            {/* Верхняя часть с бейджами */}
            <div className="flex justify-between items-start p-6 lg:p-8">
              {event.is_featured && (
                <span className="inline-flex items-center gap-1 px-4 py-2 bg-red-500/90 backdrop-blur-sm text-white text-sm font-medium rounded-xl">
                  <Sparkles className="w-4 h-4" />
                  Горячее
                </span>
              )}
              {statusInfo && (
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium backdrop-blur-sm bg-white/90 border border-white/30`}>
                  {statusInfo.icon}
                  <span className="text-gray-800">{statusInfo.label}</span>
                  {statusInfo.sublabel && (
                    <span className="text-xs text-gray-600">{statusInfo.sublabel}</span>
                  )}
                </div>
              )}
            </div>

            {/* Спейсер для центрирования контента */}
            <div className="flex-grow"></div>

            {/* Нижняя часть с заголовком и информацией */}
            <div className="p-6 lg:p-8">
              {/* Заголовок и описание */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  {event.badge_icon && (
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-white/90 backdrop-blur-sm shadow-lg"
                      style={{ color: event.badge_color || '#DC7C67' }}
                    >
                      {event.badge_icon}
                    </div>
                  )}
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-2xl">
                    {event.title}
                  </h1>
                </div>
                {event.short_description && (
                  <p className="text-white/95 text-lg lg:text-xl max-w-3xl drop-shadow-lg">
                    {event.short_description}
                  </p>
                )}
              </div>

              {/* Информационная панель с полупрозрачным фоном */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/70">Период</p>
                    <p className="text-sm font-medium text-white">
                      {new Date(event.start_date).toLocaleDateString('ru-RU', { 
                        day: 'numeric',
                        month: 'short'
                      })} — {new Date(event.end_date).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </p>
                  </div>
                </div>
                
                {event.priority && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-white/70">Приоритет</p>
                      <p className="text-sm font-medium text-white">Уровень {event.priority}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/70">Участники</p>
                    <p className="text-sm font-medium text-white">Все дилеры</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент в табах или аккордеоне */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Основная колонка */}
          <div className="lg:col-span-2 space-y-4">
            {/* Описание */}
            {event.description && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                  Подробности
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </p>
              </div>
            )}

            {/* Компактные блоки в сетке */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Цели */}
              {event.goals && event.goals.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-400" />
                    Цели
                  </h3>
                  <ul className="space-y-2">
                    {event.goals.map((goal, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="flex-shrink-0 w-5 h-5 bg-[#DC7C67]/10 text-[#DC7C67] rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                          {index + 1}
                        </span>
                        <p className="text-gray-700">{goal}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Награды */}
              {event.rewards && event.rewards.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-gray-400" />
                    Награды
                  </h3>
                  <ul className="space-y-2">
                    {event.rewards.map((reward, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Award className="w-4 h-4 text-[#DC7C67] mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700">{reward}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Условия */}
            {event.conditions && event.conditions.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  Условия участия
                </h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {event.conditions.map((condition, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-[#DC7C67] mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">{condition}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Боковая панель */}
          <div className="lg:col-span-1 space-y-4">
            {/* Действия */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <button
                onClick={handleShare}
                className="w-full px-4 py-2.5 bg-[#DC7C67] text-white rounded-lg hover:bg-[#C86B56] transition-colors flex items-center justify-center gap-2 mb-3"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Скопировано
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    Поделиться
                  </>
                )}
              </button>
              <Link
                href="/dealer/dashboard/events"
                className="w-full px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 block text-center"
              >
                Все события
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Теги */}
            {event.tags && event.tags.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  Теги
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {event.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Похожие события */}
            {relatedEvents.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-base font-semibold mb-3">Другие события</h3>
                <div className="space-y-3">
                  {relatedEvents.map((relEvent) => (
                    <Link
                      key={relEvent.id}
                      href={`/dealer/dashboard/events/event/${relEvent.id}`}
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {relEvent.badge_icon && (
                          <span 
                            className="text-lg flex-shrink-0"
                            style={{ color: relEvent.badge_color || '#DC7C67' }}
                          >
                            {relEvent.badge_icon}
                          </span>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 line-clamp-1">
                            {relEvent.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(relEvent.start_date).toLocaleDateString('ru-RU', { 
                              day: 'numeric',
                              month: 'short'
                            })}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Мини-галерея */}
            {event.gallery && event.gallery.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-gray-400" />
                  Галерея
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {event.gallery.slice(0, 6).map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={image}
                        alt={`Фото ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                      {index === 5 && event.gallery.length > 6 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            +{event.gallery.length - 6}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}