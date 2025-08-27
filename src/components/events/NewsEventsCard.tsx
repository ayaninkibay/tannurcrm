'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface NewsEvent {
  id: string;
  title: string;
  icon: string;
  date?: string;
  category?: string;
  isHot?: boolean;
}

interface NewsEventsCardProps {
  title?: string;
  events?: NewsEvent[];
  linkUrl?: string;
}

const defaultEvents: NewsEvent[] = [
  { 
    id: '1', 
    title: 'Новый филиал в Алматы открыт для клиентов', 
    icon: 'Icon cover 1.png',
    date: '2 часа назад',
    category: 'Открытие',
    isHot: true
  },
  { 
    id: '2', 
    title: 'Путевка в Египет за 50 рефералов', 
    icon: 'Icon cover 2.png',
    date: '1 день назад', 
    category: 'Акция'
  },
  { 
    id: '3', 
    title: 'TNBA – Новый спикер в Академии', 
    icon: 'Icon cover 3.png',
    date: '3 дня назад',
    category: 'Обучение'
  },
  { 
    id: '4', 
    title: 'Tannur Event 08 в Astana Arena', 
    icon: 'Icon cover 4.png',
    date: '1 неделя назад',
    category: 'Событие'
  },
];

export default function NewsEventsCard({
  title = 'События и новости',
  events = defaultEvents,
  linkUrl = '/dealer/dashboard/events'
}: NewsEventsCardProps) {

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="relative px-6 py-5 bg-gradient-to-r from-[#DC7C67] to-[#C86B56]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
            <p className="text-white/80 text-sm">Будьте в курсе всех событий</p>
          </div>
          <Link 
            href={linkUrl}
            className="group bg-white/10 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all hover:bg-white/20 hover:scale-105 border border-white/20"
          >
            <span className="flex items-center gap-2">
              Все события
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </Link>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-2 -right-8 w-8 h-8 bg-white/5 rounded-full"></div>
      </div>

      {/* Events List */}
      <div className="p-6 space-y-4">
        {events.map((event, index) => (
          <div 
            key={event.id} 
            className="group relative bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer"
          >
            {/* Hot indicator */}
            {event.isHot && (
              <div className="absolute -top-2 -right-2 bg-[#DC7C67] text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                🔥 Горячее
              </div>
            )}
            
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gray-50 border-2 border-gray-100 flex items-center justify-center group-hover:border-[#DC7C67]/20 transition-colors">
                  <Image 
                    src={`/icons/${event.icon}`}
                    width={24}
                    height={24}
                    alt=""
                    className="w-6 h-6 object-cover"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-base leading-snug group-hover:text-[#DC7C67] transition-colors line-clamp-2">
                    {event.title}
                  </h3>
                  <svg className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0 group-hover:text-[#DC7C67] group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                      {event.category}
                    </span>
                    <span className="text-sm text-gray-500">{event.date}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Всего событий: <span className="font-semibold text-[#DC7C67]">{events.length}</span>
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#DC7C67] rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">Обновлено только что</span>
          </div>
        </div>
      </div>
    </div>
  );
}