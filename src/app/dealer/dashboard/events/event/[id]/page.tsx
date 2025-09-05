'use client';

import Image from 'next/image';
import Link from 'next/link';
import { use } from 'react';
import { useTranslate } from '@/hooks/useTranslate';
import { getEvent, listEvents } from '@/app/dealer/dashboard/events/_data';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';

export default function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { t } = useTranslate();

  // Next 15: params — Promise; распаковываем
  const { id } = use(params);
  const item = getEvent(id);

  if (!item) {
    return (
      <div className="p-6">
        <Link href="/dealer/dashboard/events" className="text-[#C86B56] hover:underline">
          {t('Назад к событиям и новостям')}
        </Link>
        <p className="mt-4 text-gray-600">{t('Событие не найдено')}</p>
      </div>
    );
  }

  const related = listEvents().filter((e) => e.id !== id).slice(0, 2);

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#F8F1EF] to-white p-2">
      {/* ✅ Хедер приложения */}
      <MoreHeaderDE title={t('Событие')} showBackButton={true} />

      {/* Градиентный заголовок во всю ширину */}
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
              <h1 className="text-white text-xl md:text-2xl font-semibold">{t('Событие')}</h1>
            </div>
            {item.date && (
              <span className="px-3 py-1 rounded-lg text-xs bg-white/15 border border-white/20 text-white/90">
                {t(item.date)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Контент: на всю ширину, без max-w ограничений */}
      <article className="px-4 sm:px-6 lg:px-8 xl:px-10 py-6">
        {/* Обложка тянется от края до края контентной области */}
        {item.cover && (
          <div className="relative w-full h-56 md:h-80 rounded-2xl overflow-hidden border border-gray-200 mb-6">
            <Image src={item.cover} alt={item.title} fill className="object-cover" />
          </div>
        )}

        {/* Метаданные */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {item.badge && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#FDEAE5] text-[#C86B56]">
              {t(item.badge)}
            </span>
          )}
          {item.date && <span className="text-xs text-gray-500">{t(item.date)}</span>}
          <span className="text-xs text-gray-500">· {t('Организатор')} — Tannur</span>
          <span className="text-xs text-gray-500">· {t('Уровень')} — {t('для всех')}</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-semibold text-[#111] mb-3">{t(item.title)}</h2>
        <p className="text-gray-700 text-base leading-relaxed mb-6">{t(item.description)}</p>

        {/* Двухколоночная сетка */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Левая часть */}
          <div className="lg:col-span-8">
            {/* Зачем участвовать */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 mb-6">
              <h3 className="text-lg font-semibold text-[#111] mb-2">{t('Зачем участвовать')}</h3>
              <ul className="grid sm:grid-cols-2 gap-2 text-gray-800 text-[15px]">
                <li>• {t('Дополнительная скидка и закрытые предложения')}</li>
                <li>• {t('Рост личных продаж и активности команды')}</li>
                <li>• {t('Новые скрипты/инструменты для апселла')}</li>
                <li>• {t('Нетворкинг и обмен практикой')}</li>
              </ul>
            </div>

            {/* Программа */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 mb-6">
              <h3 className="text-lg font-semibold text-[#111] mb-3">{t('Программа')}</h3>
              <ol className="relative ml-3">
                {[
                  { time: '10:00', text: t('Регистрация и приветствие') },
                  { time: '10:20', text: t('Кейс: как собрать командную закупку за 48 часов') },
                  { time: '11:00', text: t('Практика: апселл и допродажи') },
                  { time: '11:40', text: t('Вопросы, ответы, разбор сделок') },
                ].map((row, i) => (
                  <li key={i} className="pl-6 pb-3">
                    <span className="absolute left-0 top-0 mt-1 w-3 h-3 rounded-full bg-[#DC7C67]" />
                    <div className="text-xs text-gray-500">{row.time}</div>
                    <div className="text-sm text-gray-800">{row.text}</div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Условия — если есть в моках */}
            {item.terms && item.terms.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 mb-6">
                <h3 className="text-lg font-semibold text-[#111] mb-2">{t('Условия участия')}</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {item.terms.map((rule, i) => (
                    <li key={i}>{t(rule)}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Иллюстрация внутри контента */}
            <div className="relative w-full h-60 rounded-2xl overflow-hidden border border-gray-200 my-6">
              <Image
                src="/images/event-inside.jpg"
                alt={t('Иллюстрация события')}
                fill
                className="object-cover"
              />
            </div>

            {/* Шаги участия */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-[#111] mb-3">{t('Как участвовать')}</h3>
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl border border-gray-100 p-4">
                  <div className="text-[#B95F4A] font-semibold mb-1">1</div>
                  <p className="text-gray-700">{t('Ознакомьтесь с условиями акции')}</p>
                </div>
                <div className="rounded-xl border border-gray-100 p-4">
                  <div className="text-[#B95F4A] font-semibold mb-1">2</div>
                  <p className="text-gray-700">{t('Соберите нужное количество заказов/товаров')}</p>
                </div>
                <div className="rounded-xl border border-gray-100 p-4">
                  <div className="text-[#B95F4A] font-semibold mb-1">3</div>
                  <p className="text-gray-700">{t('Подтвердите участие на странице командной закупки')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Правая часть (сайдбар) */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="text-base font-semibold text-[#111] mb-3">{t('Краткая информация')}</h3>
              <div className="space-y-2 text-sm text-gray-700">
                {item.date && (
                  <p>
                    <span className="font-medium">{t('Период')}:</span> {t(item.date)}
                  </p>
                )}
                <p>
                  <span className="font-medium">{t('Формат')}:</span> {t('оффлайн/онлайн')}
                </p>
                <p>
                  <span className="font-medium">{t('Уровень')}:</span> {t('начальный — продвинутый')}
                </p>
              </div>
              <button className="mt-4 w-full px-4 py-2 rounded-xl bg-[#DC7C67] text-white hover:bg-[#C86B56] transition-colors">
                {t('Принять участие')}
              </button>
            </div>

            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 h-40 flex items-center justify-center text-gray-400 text-sm">
                {t('Локация/карта появится здесь')}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-[#111] mb-3">{t('Фото с прошлых активностей')}</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="relative w-full h-20 rounded-lg overflow-hidden bg-gray-100">
                  <Image src="/images/event-1.jpg" alt="img1" fill className="object-cover" />
                </div>
                <div className="relative w-full h-20 rounded-lg overflow-hidden bg-gray-100">
                  <Image src="/images/event-2.jpg" alt="img2" fill className="object-cover" />
                </div>
                <div className="relative w-full h-20 rounded-lg overflow-hidden bg-gray-100">
                  <Image src="/images/event-3.jpg" alt="img3" fill className="object-cover" />
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Похожие события */}
        {related.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-[#111]">{t('Похожие события')}</h3>
              <Link href="/dealer/dashboard/events" className="text-[#C86B56] text-sm hover:underline">
                {t('Ко всем событиям')}
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/dealer/dashboard/events/event/${r.id}`}
                  className="rounded-2xl border border-gray-100 bg-white p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                      {r.icon ? (
                        <Image src={`/icons/${r.icon}`} alt={r.title} width={20} height={20} />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {r.badge && (
                          <span className="px-2 py-0.5 rounded bg-[#FDEAE5] text-[#C86B56]">{t(r.badge)}</span>
                        )}
                        {r.date && <span>{t(r.date)}</span>}
                      </div>
                      <p className="mt-1 font-medium text-[#111] line-clamp-2">{t(r.title)}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{t(r.description)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Действия */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-lg bg-[#FDEAE5] text-[#C86B56] text-xs font-medium">#tannur</span>
            <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium">#event</span>
            <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium">#акция</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dealer/dashboard/events"
              className="px-4 py-2 rounded-xl bg-[#DC7C67] text-white hover:bg-[#C86B56] transition-colors"
            >
              {t('К списку событий')}
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
