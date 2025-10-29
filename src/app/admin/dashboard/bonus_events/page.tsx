// src/app/admin/dashboard/bonus_events/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslate } from '@/hooks/useTranslate';
import { useBonusModule } from '@/lib/bonus_event/useBonusModule';
import { BonusEvent } from '@/lib/bonus_event/BonusEventService';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { 
  Trophy, 
  Plus, 
  Calendar,
  Users,
  TrendingUp,
  Eye,
  Edit2,
  Trash2,
  Star,
  Clock,
  Target,
  Award,
  ChevronRight
} from 'lucide-react';

export default function BonusEventsPage() {
  const router = useRouter();
  const { t } = useTranslate();
  const [mounted, setMounted] = useState(false);
  
  const {
    events,
    loading,
    error,
    loadActiveEvents,
    deactivateEvent,
    getRewardIcon,
    formatAmount
  } = useBonusModule();

  useEffect(() => {
    setMounted(true);
    loadActiveEvents();
  }, []);

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm(t('Вы уверены, что хотите деактивировать это событие?'))) {
      const success = await deactivateEvent(eventId);
      if (success) {
        loadActiveEvents();
      }
    }
  };

  const getDaysRemaining = (endDate: string): number => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getEventStatus = (event: BonusEvent): { text: string; color: string } => {
    const now = new Date();
    const start = new Date(event.start_date);
    const end = new Date(event.end_date);

    if (now < start) {
      return { text: t('Запланировано'), color: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200' };
    }
    if (now > end) {
      return { text: t('Завершено'), color: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200' };
    }
    return { text: t('Активно'), color: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' };
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Stats calculation
  const activeEvents = events.filter(e => {
    const now = new Date();
    const end = new Date(e.end_date);
    return now <= end && e.is_active;
  }).length;

  const upcomingEvents = events.filter(e => {
    const now = new Date();
    const start = new Date(e.start_date);
    return now < start && e.is_active;
  }).length;

  const totalTargets = events.reduce((sum, event) => sum + (event.targets?.length || 0), 0);

  if (!mounted) {
    return (
      <div className="p-2 md:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-48 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (loading && events.length === 0) {
    return (
      <div className="min-h-screen">
        <MoreHeaderAD title={t('Бонусные события')} showBackButton={true} />
        <div className="mt-6 flex justify-center">
          <div className="text-gray-500 text-sm">{t('Загрузка...')}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <MoreHeaderAD title={t('Бонусные события')} showBackButton={true}/>
        <div className="mt-6 bg-red-50 rounded-lg p-4">
          <div className="text-red-600 text-sm">Ошибка: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="flex">
        <MoreHeaderAD title={t('Бонусные события')} showBackButton={true} />
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8 mt-4 md:mt-6">
        <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 bg-[#D77E6C]/10 rounded-lg">
              <Trophy className="w-4 h-4 md:w-5 md:h-5 text-[#D77E6C]" />
            </div>
            <div>
              <div className="text-lg md:text-xl font-semibold text-gray-900">{events.length}</div>
              <div className="text-xs md:text-sm text-gray-500">{t('Всего событий')}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
            </div>
            <div>
              <div className="text-lg md:text-xl font-semibold text-gray-900">{activeEvents}</div>
              <div className="text-xs md:text-sm text-gray-500">{t('Активных')}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-lg md:text-xl font-semibold text-gray-900">{upcomingEvents}</div>
              <div className="text-xs md:text-sm text-gray-500">{t('Запланировано')}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-lg md:text-xl font-semibold text-gray-900">{totalTargets}</div>
              <div className="text-xs md:text-sm text-gray-500">{t('Целей')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#D77E6C] rounded-lg">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">{t('Все события')}</h2>
        </div>
        <button
          onClick={() => router.push('/admin/dashboard/bonus_events/create_bonus_event')}
          className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-[#D77E6C] hover:bg-[#C66B5A] text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">{t('Создать событие')}</span>
          <span className="md:hidden">{t('Создать')}</span>
        </button>
      </div>

      {/* Events Grid */}
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {events.map((event) => {
            const status = getEventStatus(event);
            const daysRemaining = getDaysRemaining(event.end_date);
            const isActive = status.text === t('Активно');

            return (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
                onClick={() => router.push(`/admin/dashboard/bonus_events/event/${event.id}`)}
              >
                {/* Header with gradient */}
                <div className="h-32 bg-gradient-to-br from-[#D77E6C] to-[#C66B5A] p-4 relative overflow-hidden">
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full"></div>
                  <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full"></div>
                  
                  <div className="relative z-10 flex items-start justify-between">
                    <div>
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${status.color}`}>
                        {status.text}
                      </span>
                      {isActive && daysRemaining > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-white text-xs">
                          <Clock className="w-3 h-3" />
                          <span>{daysRemaining} {t('дней осталось')}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/dashboard/bonus_events/event/${event.id}`);
                        }}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                        title={t('Просмотр')}
                      >
                        <Eye className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/dashboard/bonus_events/create_bonus_event?id=${event.id}`);
                        }}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                        title={t('Редактировать')}
                      >
                        <Edit2 className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(event.id!);
                        }}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                        title={t('Удалить')}
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[48px] group-hover:text-[#C66B5A] transition-colors">
                    {event.title}
                  </h3>

                  {event.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  {/* Dates */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(event.start_date)} - {formatDate(event.end_date)}</span>
                  </div>

                  {/* Targets */}
                  {event.targets && event.targets.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {t('Цели события')}:
                        </span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {event.targets.slice(0, 3).map((target, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg"
                          >
                            <span className="text-sm">{getRewardIcon(target.reward_icon)}</span>
                            <span className="text-xs text-gray-600">
                              {formatAmount(target.target_amount)}
                            </span>
                          </div>
                        ))}
                        {event.targets.length > 3 && (
                          <div className="flex items-center px-2.5 py-1.5 bg-gray-50 rounded-lg">
                            <span className="text-xs text-gray-500">
                              +{event.targets.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Priority Badge */}
                  {event.priority && event.priority > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-medium text-gray-600">
                        {t('Приоритет')}: {event.priority}
                      </span>
                    </div>
                  )}

                  {/* View Details Button */}
                  <button
                    onClick={() => router.push(`/admin/dashboard/bonus_events/event/${event.id}`)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-[#D77E6C]/10 text-gray-700 hover:text-[#D77E6C] rounded-lg text-sm font-medium transition-all group-hover:bg-[#D77E6C]/10 group-hover:text-[#D77E6C]"
                  >
                    {t('Подробнее')}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12 text-center">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('Пока нет событий')}</h3>
            <p className="text-sm text-gray-500 mb-6">{t('Создайте первое бонусное событие для мотивации дилеров')}</p>
            <button
              onClick={() => router.push('/admin/dashboard/create_event')}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#D77E6C] hover:bg-[#C66B5A] text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('Создать событие')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}