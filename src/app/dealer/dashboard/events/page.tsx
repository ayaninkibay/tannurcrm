'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslate } from '@/hooks/useTranslate';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';

type Item = {
  id: string;
  title: string;
  description: string;
  badge?: string;
  date?: string;
  icon?: string; // файл в /public/icons
  hot?: boolean;
};

type Filter = 'all' | 'events' | 'news';
type ViewMode = 'grid' | 'list';

export default function EventsAndNewsPage() {
  const { t } = useTranslate();
  const [filter, setFilter] = useState<Filter>('all');
  const [view, setView] = useState<ViewMode>('list');

  // МОКИ
  const events: Item[] = [
    {
      id: 'e1',
      title: 'События на август',
      description:
        'Если купишь 10 кушонов 3-в-1, получишь скидку 10% на все товары. Акция действует при единовременной покупке.',
      badge: 'Акция',
      date: '1–31 августа',
      icon: 'Icon cover 2.png',
      hot: true,
    },
    {
      id: 'e2',
      title: 'Командная закупка недели',
      description:
        'Собери команду из 5 человек и получи дополнительную скидку 5% к текущим акциям.',
      badge: 'Команда',
      date: 'На этой неделе',
      icon: 'Icon cover 3.png',
    },
    {
      id: 'e3',
      title: 'TNBA — интенсив по продажам',
      description: 'Практический воркшоп по скриптам и апселлам. Места ограничены.',
      badge: 'Обучение',
      date: '24 августа',
      icon: 'Icon cover 4.png',
    },
  ];

  const news: Item[] = [
    {
      id: 'n1',
      title: 'Открылся новый филиал в Алматы',
      description: 'Новый пункт выдачи и консультаций на Абая 25. Ждём вас ежедневно.',
      badge: 'Филиал',
      date: 'Сегодня',
      icon: 'Icon cover 1.png',
      hot: true,
    },
    {
      id: 'n2',
      title: 'Живая встреча Tannur Community',
      description: 'Нетворкинг, разбор кейсов и живые демо. Регистрация открыта.',
      badge: 'Событие',
      date: 'Через 3 дня',
      icon: 'Icon cover 4.png',
    },
    {
      id: 'n3',
      title: 'TNBA — новый спикер',
      description: 'Анонс приглашённого эксперта. Следите за расписанием.',
      badge: 'Обучение',
      date: 'На этой неделе',
      icon: 'Icon cover 3.png',
    },
  ];

  const stats = useMemo(
    () => ({
      events: events.length,
      news: news.length,
      total: events.length + news.length,
    }),
    [events, news]
  );

  const SectionCard: React.FC<{ item: Item; kind: 'event' | 'news' }> = ({ item, kind }) => {
    const badgeColor =
      kind === 'event'
        ? 'bg-[#FDEAE5] text-[#C86B56]'
        : 'bg-[#EAF2FF] text-[#3366CC]';

    const href =
      kind === 'event'
        ? `/dealer/dashboard/events/event/${item.id}`
        : `/dealer/dashboard/events/news/${item.id}`;

    return (
      <Link
        href={href}
        className={`relative rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:shadow-md ${
          view === 'list' ? 'flex items-start gap-4 w-full' : 'block'
        }`}
      >
        {item.hot && (
          <div className="absolute -top-2 -right-2 rounded-full bg-[#DC7C67] px-2 py-1 text-xs font-medium text-white shadow-sm">
            🔥 {t('Горячее')}
          </div>
        )}

        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
          {item.icon ? (
            <Image
              src={`/icons/${item.icon}`}
              alt={item.title}
              width={24}
              height={24}
              className="w-6 h-6 object-cover"
            />
          ) : (
            <div className="w-6 h-6" />
          )}
        </div>

        <div className={`min-w-0 ${view === 'list' ? '' : 'mt-3'}`}>
          <div className="flex items-center gap-2 mb-1">
            {item.badge && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${badgeColor}`}>
                {t(item.badge)}
              </span>
            )}
            {item.date && <span className="text-xs text-gray-500">{t(item.date)}</span>}
          </div>
          <h3 className="font-semibold text-gray-900 leading-snug mb-1">{t(item.title)}</h3>
          <p className="text-sm text-gray-600">{t(item.description)}</p>
        </div>
      </Link>
    );
  };

  const FilterTabs = () => (
    <div className="flex items-center gap-2 bg-white/20 rounded-xl p-1">
      {(['all', 'events', 'news'] as Filter[]).map((f) => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === f ? 'bg-white text-[#C2543F] shadow-sm' : 'text-white/90 hover:bg-white/10'
          }`}
        >
          {f === 'all' ? t('Все') : f === 'events' ? t('События') : t('Новости')}
        </button>
      ))}
    </div>
  );

  const ViewSwitch = () => (
    <div className="flex items-center gap-2 bg-white/20 rounded-xl p-1">
      {(['list', 'grid'] as ViewMode[]).map((v) => (
        <button
          key={v}
          onClick={() => setView(v)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            view === v ? 'bg-white text-[#C2543F] shadow-sm' : 'text-white/90 hover:bg-white/10'
          }`}
        >
          {v === 'list' ? t('Список') : t('Сетка')}
        </button>
      ))}
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#F8F1EF] to-white p-2">
      {/* ✅ ВЕРХНИЙ ХЕДЕР */}
      <MoreHeaderDE title={t('Товар')} showBackButton={true} />

      {/* Заголовок страницы */}
      <div className="sticky top-0 z-10 px-4 sm:px-6 lg:px-10 pt-4">
        <div className="border border-[#E7C6BF]/60 bg-gradient-to-r from-[#DC7C67] via-[#C86B56] to-[#B95F4A] rounded-2xl shadow-sm">
          <div className="w-full px-5 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="text-white">
                <div className="flex items-center gap-3">
                  <Link
                    href="/dealer/dashboard"
                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/15 border border-white/25 hover:bg-white/25 transition-colors"
                    aria-label={t('Назад')}
                    title={t('Назад')}
                  >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </Link>
                  <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                    {t('События и новости')}
                  </h1>
                </div>
                <p className="text-white/80 text-sm mt-1">
                  {t('Все активности и обновления Tannur в одном месте')}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs bg-white/15 border border-white/20">
                    {t('Всего: {n}').replace('{n}', String(stats.total))}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs bg-white/15 border border-white/20">
                    {t('События: {n}').replace('{n}', String(stats.events))}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs bg-white/15 border border-white/20">
                    {t('Новости: {n}').replace('{n}', String(stats.news))}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-stretch lg:self-auto">
                <FilterTabs />
                <ViewSwitch />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="w-full px-4 sm:px-6 lg:px-10 py-6">
        {filter === 'all' ? (
          <div className="space-y-6">
            {/* События */}
            <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-[#FFF7F5]">
                <h2 className="text-lg font-semibold text-[#B95F4A]">{t('События')}</h2>
                <p className="text-sm text-gray-500">{t('Актуальные предложения и активности')}</p>
              </div>

              <div
                className={`p-5 ${
                  view === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4'
                    : 'space-y-4'
                }`}
              >
                {events.map((ev) => (
                  <SectionCard key={ev.id} item={ev} kind="event" />
                ))}
              </div>

              <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 text-sm text-gray-600 flex items-center justify-between">
                <span>{t('Всего событий: {n}').replace('{n}', String(stats.events))}</span>
                <Link href="/dealer/dashboard" className="text-[#C86B56] hover:underline">
                  {t('Назад к дэшборду')}
                </Link>
              </div>
            </section>

            {/* Новости */}
            <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-[#FFF2F0]">
                <h2 className="text-lg font-semibold text-[#B95F4A]">{t('Новости')}</h2>
                <p className="text-sm text-gray-500">{t('Анонсы, открытия и важные обновления')}</p>
              </div>

              <div
                className={`p-5 ${
                  view === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4'
                    : 'space-y-4'
                }`}
              >
                {news.map((n) => (
                  <SectionCard key={n.id} item={n} kind="news" />
                ))}
              </div>

              <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 text-sm text-gray-600 flex items-center justify-between">
                <span>{t('Всего новостей: {n}').replace('{n}', String(stats.news))}</span>
                <span>{t('Обновлено только что')}</span>
              </div>
            </section>
          </div>
        ) : (
          <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-[#FFF7F5] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#B95F4A]">
                  {filter === 'events' ? t('События') : t('Новости')}
                </h2>
                <p className="text-sm text-gray-500">
                  {filter === 'events'
                    ? t('Актуальные предложения и активности')
                    : t('Анонсы, открытия и важные обновления')}
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                <span className="px-2.5 py-1 rounded-lg bg-gray-100">
                  {filter === 'events'
                    ? t('Всего событий: {n}').replace('{n}', String(stats.events))
                    : t('Всего новостей: {n}').replace('{n}', String(stats.news))}
                </span>
              </div>
            </div>

            <div
              className={`p-5 ${
                view === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4'
                  : 'space-y-4'
              }`}
            >
              {(filter === 'events' ? events : news).map((it) => (
                <SectionCard key={it.id} item={it} kind={filter === 'events' ? 'event' : 'news'} />
              ))}
            </div>

            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 text-sm text-gray-600 flex items-center justify-between">
              <button onClick={() => setFilter('all')} className="text-[#C86B56] hover:underline">
                {t('Показать всё')}
              </button>
              <span>{t('Обновлено только что')}</span>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
