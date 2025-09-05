'use client';

import Image from 'next/image';
import Link from 'next/link';
import { use } from 'react';
import { useTranslate } from '@/hooks/useTranslate';
import { getNews, listNews } from '@/app/dealer/dashboard/events/_data';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';

export default function NewsDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { t } = useTranslate();

  const { id } = use(params);
  const item = getNews(id);

  if (!item) {
    return (
      <div className="p-6">
        <Link href="/dealer/dashboard/events" className="text-[#C86B56] hover:underline">
          {t('Назад к событиям и новостям')}
        </Link>
        <p className="mt-4 text-gray-600">{t('Новость не найдена')}</p>
      </div>
    );
  }

  const related = listNews().filter((n) => n.id !== id).slice(0, 3);

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#F8F1EF] to-white p-2">
      {/* ✅ Хедер приложения */}
      <MoreHeaderDE title={t('Новость')} showBackButton={true} />

      {/* Заголовок */}
      <div className="px-4 sm:px-6 lg:px-8 xl:px-10 pt-4">
        <div className="border border-[#E7C6BF]/60 bg-gradient-to-r from-[#DC7C67] via-[#C86B56] to-[#B95F4A] rounded-2xl shadow-sm">
          <div className="px-5 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/dealer/dashboard/events"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/15 border border-white/25 hover:bg-white/25 transition-colors"
                aria-label={t('Назад')}
                title={t('Назад')}
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-white text-xl md:text-2xl font-semibold">{t('Новость')}</h1>
            </div>
            {item.date && (
              <span className="px-3 py-1 rounded-lg text-xs bg-white/15 border border-white/20 text-white/90">
                {t(item.date)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Контент: во всю ширину */}
      <article className="px-4 sm:px-6 lg:px-8 xl:px-10 py-6">
        {/* Обложка во всю ширину */}
        {item.cover && (
          <div className="relative w-full h-56 md:h-80 rounded-2xl overflow-hidden border border-gray-200 mb-6">
            <Image src={item.cover} alt={item.title} fill className="object-cover" />
          </div>
        )}

        {/* Метаданные */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {item.badge && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#EAF2FF] text-[#3366CC]">
              {t(item.badge)}
            </span>
          )}
          {item.date && <span className="text-xs text-gray-500">{t(item.date)}</span>}
          <span className="text-xs text-gray-500">· {t('Источник')} — Tannur Media</span>
          <span className="text-xs text-gray-500">· {t('Время чтения')} — 3 {t('мин')}</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-semibold text-[#111] mb-3">{t(item.title)}</h2>
        <p className="text-gray-700 text-base leading-relaxed mb-6">{t(item.description)}</p>

        {/* Основной текст + сайдбар новостей */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 mb-6">
              <h3 className="text-lg font-semibold text-[#111] mb-2">{t('Что произошло')}</h3>
              <p className="text-gray-700 leading-relaxed">
                {t('Мы открыли новый филиал для удобства клиентов: просторный шоурум, пункт самовывоза, зона консультаций и обучения.')}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 mb-6">
              <h3 className="text-lg font-semibold text-[#111] mb-2">{t('Что это даёт клиентам')}</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>{t('Быстрый самовывоз и обмен')}</li>
                <li>{t('Очные консультации и подбор продукции')}</li>
                <li>{t('Мини-мероприятия и живые демонстрации')}</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-[#111] mb-2">{t('Как нас найти')}</h3>
              <p className="text-gray-700">
                {t('Адрес: г. Алматы, пр. Абая 25. Ежедневно с 10:00 до 20:00. Парковка рядом.')}
              </p>
            </div>
          </div>

          {/* Сайдбар: ещё новости */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="text-base font-semibold text-[#111] mb-3">{t('Ещё по теме')}</h3>
              <div className="space-y-3">
                {related.map((n) => (
                  <Link
                    key={n.id}
                    href={`/dealer/dashboard/events/news/${n.id}`}
                    className="flex items-start gap-3 rounded-xl border border-gray-100 p-3 hover:shadow-sm transition-shadow"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                      {n.icon && <Image src={`/icons/${n.icon}`} alt={n.title} width={20} height={20} />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-[#111] line-clamp-2">{t(n.title)}</p>
                      <p className="text-xs text-gray-500">{n.date ? t(n.date) : ''}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 h-40 flex items-center justify-center text-gray-400 text-sm">
                {t('Здесь может быть карта/баннер')}
              </div>
            </div>
          </aside>
        </div>

        {/* Действия */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-lg bg-[#EAF2FF] text-[#3366CC] text-xs font-medium">#tannur</span>
            <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium">#news</span>
            <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium">#обновления</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dealer/dashboard/events"
              className="px-4 py-2 rounded-xl bg-[#DC7C67] text-white hover:bg-[#C86B56] transition-colors"
            >
              {t('К списку новостей')}
            </Link>
            <button
              onClick={() => {
                if (typeof navigator !== 'undefined' && 'clipboard' in navigator) {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
            >
              {t('Скопировать ссылку')}
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
