'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useTranslate } from '@/hooks/useTranslate';

interface NewsEvent {
  id: string;
  title: string;
  icon?: string;
  image_url?: string;
  badge_icon?: string;
  badge_color?: string;
  start_date?: string;
  event_status?: 'active' | 'upcoming' | 'past';
  short_description?: string;
  is_featured?: boolean;
  priority?: number;
}

interface NewsEventsCardProps {
  title?: string;
  linkUrl?: string;
  maxItems?: number;
}

export default function NewsEventsCard({
  title = 'События и новости',
  linkUrl = '/dealer/dashboard/events',
  maxItems = 10,
}: NewsEventsCardProps) {
  const { t } = useTranslate();
  const [events, setEvents] = useState<NewsEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      // Загружаем события из Supabase
      const { data, error } = await supabase
        .from('events')
        .select('id, title, image_url, badge_icon, badge_color, start_date, short_description, is_featured, priority, end_date')
        .eq('status', 'published')
        .order('priority', { ascending: false })
        .order('start_date', { ascending: false })
        .limit(maxItems);

      if (error) {
        console.error('Error loading events:', error);
        setEvents([]);
        return;
      }

      // Вычисляем статус для каждого события
      const today = new Date().toISOString().split('T')[0];
      const eventsWithStatus = (data || []).map(event => {
        let eventStatus: 'active' | 'upcoming' | 'past';
        
        if (event.start_date > today) {
          eventStatus = 'upcoming';
        } else if (event.end_date && today <= event.end_date) {
          eventStatus = 'active';
        } else {
          eventStatus = 'past';
        }
        
        return {
          ...event,
          event_status: eventStatus
        };
      });

      setEvents(eventsWithStatus);
    } catch (err) {
      console.error('Error:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return { text: 'Активно', color: 'bg-green-100 text-green-700' };
      case 'upcoming':
        return { text: 'Скоро', color: 'bg-yellow-100 text-yellow-700' };
      case 'past':
        return { text: 'Завершено', color: 'bg-gray-100 text-gray-600' };
      default:
        return null;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric',
      month: 'short'
    });
  };

  // Создаем пустые слоты для заполнения места
  const emptySlots = maxItems - events.length;
  const placeholders = Array.from({ length: Math.max(0, emptySlots) }, (_, i) => i);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-full flex flex-col">
      {/* Header - фиксированная высота */}
      <div className="relative px-6 py-5 bg-gradient-to-r from-[#DC7C67] to-[#C86B56] flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">{t(title)}</h2>
            <p className="text-white/80 text-sm">{t('Будьте в курсе всех событий')}</p>
          </div>
          <Link
            href={linkUrl}
            className="group bg-white/10 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all hover:bg-white/20 hover:scale-105 border border-white/20"
            aria-label={t('Все события')}
            title={t('Все события')}
          >
            <span className="flex items-center gap-2">
              {t('Все события')}
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </Link>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
        <div className="absolute -bottom-2 -right-8 w-8 h-8 bg-white/5 rounded-full" />
      </div>

      {/* Events List - растягивается и заполняет пространство */}
      <div className="flex-1 p-6 flex flex-col justify-between min-h-[300px] md:min-h-[350px]">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DC7C67]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-gray-500">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">{t('Нет доступных событий')}</p>
                  <Link href={linkUrl} className="text-xs text-[#DC7C67] hover:underline mt-2 inline-block">
                    {t('Создать первое событие')}
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Отображаем события */}
                {events.map((event) => {
                  const statusBadge = getStatusBadge(event.event_status);
                  
                  return (
                    <Link
                      key={event.id}
                      href={`/dealer/dashboard/events/event/${event.id}`}
                      className="group relative bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer block"
                    >
                      {/* Hot indicator */}
                      {event.is_featured && (
                        <div className="absolute -top-2 -right-2 bg-[#DC7C67] text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm z-10">
                          <span aria-hidden="true">🔥</span> {t('Горячее')}
                        </div>
                      )}

                      <div className="flex items-start gap-4">
                        {/* Icon/Image */}
                        <div className="relative">
                          <div className="w-12 h-12 rounded-xl bg-gray-50 border-2 border-gray-100 flex items-center justify-center group-hover:border-[#DC7C67]/20 transition-colors overflow-hidden">
                            {event.image_url ? (
                              <img
                                src={event.image_url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : event.badge_icon ? (
                              <span 
                                className="text-2xl"
                                style={{ color: event.badge_color || '#DC7C67' }}
                              >
                                {event.badge_icon}
                              </span>
                            ) : (
                              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 text-base leading-snug group-hover:text-[#DC7C67] transition-colors line-clamp-2">
                              {t(event.title)}
                            </h3>
                            <svg
                              className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0 group-hover:text-[#DC7C67] group-hover:translate-x-1 transition-all"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              aria-hidden="true"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>

                          {event.short_description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                              {t(event.short_description)}
                            </p>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {statusBadge && (
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${statusBadge.color}`}>
                                  {t(statusBadge.text)}
                                </span>
                              )}
                              {event.start_date && (
                                <span className="text-sm text-gray-500">
                                  {formatDate(event.start_date)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
                
                {/* Добавляем пустые placeholder'ы если событий мало */}
                {placeholders.map((index) => (
                  <div 
                    key={`placeholder-${index}`} 
                    className="relative bg-gray-50 rounded-xl p-4 border border-gray-100 opacity-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 animate-pulse" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-100 rounded w-3/4 mb-2 animate-pulse" />
                        <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer - фиксированная высота */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {loading ? t('Загрузка...') : t(`Всего событий: ${events.length}`)}
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#DC7C67] rounded-full animate-pulse" />
            <span className="text-xs text-gray-500">{t('Обновлено только что')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}