'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/context/UserContext';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { 
  Calendar, 
  Gift, 
  Target, 
  Clock, 
  ChevronRight, 
  Search,
  Filter,
  Sparkles,
  AlertCircle,
  Archive
} from 'lucide-react';
import type { Event } from '@/types/custom.types';

export default function EventsPage() {
  const router = useRouter();
  const { profile } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'upcoming' | 'past'>('all');

  // Загрузка событий из БД
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Загружаем напрямую из таблицы events
      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .order('priority', { ascending: false })
        .order('start_date', { ascending: false });

      if (fetchError) throw fetchError;

      // Вычисляем статусы и дни на клиенте
      const today = new Date().toISOString().split('T')[0];
      const eventsWithStatus = (data || []).map(event => {
        const startDate = event.start_date;
        const endDate = event.end_date;
        
        let eventStatus: 'active' | 'upcoming' | 'past';
        let days_until: number | undefined;
        let days_remaining: number | undefined;
        
        if (startDate > today) {
          eventStatus = 'upcoming';
          days_until = Math.ceil((new Date(startDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
        } else if (today >= startDate && today <= endDate) {
          eventStatus = 'active';
          days_remaining = Math.ceil((new Date(endDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
        } else {
          eventStatus = 'past';
        }
        
        return {
          ...event,
          event_status: eventStatus,
          days_until,
          days_remaining
        };
      });

      setEvents(eventsWithStatus);
    } catch (err: any) {
      console.error('Error loading events:', err);
      setError('Не удалось загрузить события');
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация событий
  const filteredEvents = events.filter(event => {
    // Поиск по тексту
    const matchesSearch = !searchQuery || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.short_description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Фильтр по статусу
    let matchesStatus = true;
    if (filterStatus !== 'all') {
      matchesStatus = event.event_status === filterStatus;
    }

    return matchesSearch && matchesStatus;
  });

  // Группировка событий по статусу
  const activeEvents = filteredEvents.filter(e => e.event_status === 'active');
  const upcomingEvents = filteredEvents.filter(e => e.event_status === 'upcoming');
  const pastEvents = filteredEvents.filter(e => e.event_status === 'past');

  // Компонент карточки события
  const EventCard: React.FC<{ event: Event }> = ({ event }) => {
    const getStatusBadge = () => {
      switch (event.event_status) {
        case 'active':
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Активно {event.days_remaining && `(${event.days_remaining} дн.)`}
            </span>
          );
        case 'upcoming':
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Скоро {event.days_until && `(через ${event.days_until} дн.)`}
            </span>
          );
        case 'past':
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              Завершено
            </span>
          );
        default:
          return null;
      }
    };

    return (
      <Link
        href={`/admin/dashboard/events/event/${event.id}`}
        className="block bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden group"
      >
        {/* Изображение */}
        {event.image_url && (
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {event.badge_icon && (
              <div
                className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg bg-white/90 backdrop-blur-sm z-10"
                style={{ color: event.badge_color || '#DC7C67' }}
              >
                {event.badge_icon}
              </div>
            )}
            {event.is_featured && (
              <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Горячее
              </div>
            )}
          </div>
        )}

        <div className="p-5">
          {/* Статус и дата */}
          <div className="flex items-center justify-between mb-3">
            {getStatusBadge()}
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(event.start_date).toLocaleDateString('ru-RU', { 
                day: 'numeric',
                month: 'short'
              })}
            </div>
          </div>

          {/* Заголовок */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#DC7C67] transition-colors">
            {event.title}
          </h3>

          {/* Описание */}
          {event.short_description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {event.short_description}
            </p>
          )}

          {/* Цели и награды (превью) */}
          <div className="space-y-2 mb-3">
            {event.goals && event.goals.length > 0 && (
              <div className="flex items-start gap-2">
                <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600 line-clamp-1">
                  {event.goals[0]}
                  {event.goals.length > 1 && ` +${event.goals.length - 1}`}
                </p>
              </div>
            )}
            {event.rewards && event.rewards.length > 0 && (
              <div className="flex items-start gap-2">
                <Gift className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600 line-clamp-1">
                  {event.rewards[0]}
                  {event.rewards.length > 1 && ` +${event.rewards.length - 1}`}
                </p>
              </div>
            )}
          </div>

          {/* Теги */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {event.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Кнопка подробнее */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm font-medium text-[#DC7C67] group-hover:text-[#B95F4A] transition-colors flex items-center gap-1">
              Подробнее
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    );
  };

  // Компонент группы событий
  const EventGroup: React.FC<{ 
    title: string; 
    events: Event[]; 
    icon: React.ReactNode;
    color: string;
  }> = ({ title, events, icon, color }) => {
    if (events.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
            {icon}
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            {title}
          </h2>
          <span className="text-sm text-gray-500">
            ({events.length})
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen  to-white">
      {/* Упрощенный заголовок страницы */}
      <div className="flex justify-between items-center p-4">
        <MoreHeaderAD title="События и Новости" showBackButton={true} />
      </div>

      {/* Фильтры и поиск */}
      <div className="px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Поиск */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск событий..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#DC7C67] focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* Фильтр по статусу */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'Все' },
                  { value: 'active', label: 'Активные' },
                  { value: 'upcoming', label: 'Предстоящие' },
                  { value: 'past', label: 'Прошедшие' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFilterStatus(option.value as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterStatus === option.value
                        ? 'bg-[#DC7C67] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Контент */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DC7C67]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет событий</h3>
            <p className="text-gray-500">
              {searchQuery ? 'По вашему запросу ничего не найдено' : 'События появятся здесь позже'}
            </p>
          </div>
        ) : (
          <>
            {/* Активные события */}
            {activeEvents.length > 0 && (
              <EventGroup
                title="Активные события"
                events={activeEvents}
                icon={<Sparkles className="w-4 h-4 text-green-600" />}
                color="bg-green-100"
              />
            )}

            {/* Предстоящие события */}
            {upcomingEvents.length > 0 && (
              <EventGroup
                title="Предстоящие события"
                events={upcomingEvents}
                icon={<Clock className="w-4 h-4 text-yellow-600" />}
                color="bg-yellow-100"
              />
            )}

            {/* Прошедшие события */}
            {pastEvents.length > 0 && (
              <EventGroup
                title="Прошедшие события"
                events={pastEvents}
                icon={<Archive className="w-4 h-4 text-gray-600" />}
                color="bg-gray-100"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}