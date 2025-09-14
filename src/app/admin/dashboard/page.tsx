'use client';

import React from 'react';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { StatisticCard } from '@/components/components_admins_dashboard/StatisticCard';
import { RevenueCard } from '@/components/components_admins_dashboard/RevenueCard';
import { WarehouseCard } from '@/components/components_admins_dashboard/WarehouseCard';
import { TaskCard } from '@/components/components_admins_dashboard/TaskCard';
import Image from 'next/image';
import UserProfileCard from '@/components/profile/UserProfileCard';
import ReferalLink from '@/components/blocks/ReferralLink';
import SponsorCard from '@/components/blocks/SponsorCard';
import TannurButton from '@/components/Button';
import { useTranslate } from '@/hooks/useTranslate';

export default function AdminDashboardPage() {
  const { t } = useTranslate();

  return (
    <div className="flex">
      <div className="w-full mx-auto space-y-6 sm:space-y-8">
        {/* Шапка */}
        <header className="mb-6">
          <MoreHeaderAD title={t('Админ панель')} />
        </header>

        {/* Верхняя секция: статистика и профиль */}
        <section className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
          {/* Левая часть: статистика */}
          <div className="xl:col-span-3 space-y-4 sm:space-y-6">
            {/* Row 1: Диллеры/Звёзды и Выручка */}
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
              {/* Статистика */}
              <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-1 gap-4">
                <StatisticCard
                  iconSrc="/icons/IconUsersAdd.svg"
                  title={t('Диллеры')}
                  count={2588}
                  href="/admin/dealers"
                />
                <StatisticCard
                  iconSrc="/icons/IconStarOrange.svg"
                  title={t('Звёзды')}
                  count={35}
                  href="/admin/dealers"
                />
              </div>
              {/* Выручка */}
              <div className="sm:col-span-4 grid grid-cols-1 gap-4">
                <RevenueCard
                  title={t('Товарооборот магазина')}
                  amount={84213000}
                  href="/admin/revenue"
                  bgColor="bg-[#DADDFF]"
                />
                <RevenueCard
                  title={t('Товарооборот TNBA')}
                  amount={84213000}
                  href="/admin/revenue"
                  bgColor="bg-[#FFE0DA]"
                />
                <RevenueCard
                  title={t('Товарооборот подписки')}
                  amount={84213000}
                  href="/admin/revenue"
                  bgColor="bg-[#F0E4FF]"
                />
              </div>
            </div>

            {/* Row 2: Товары на складе */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <WarehouseCard
                iconSrc="/icons/IconAppsOrange.svg"
                title={t('Товары на складе')}
                quantity={42933}
                price={543213000}
                href="/admin/warehouse"
              />
              <WarehouseCard
                iconSrc="/icons/IconAppsOrange.svg"
                title={t('Внешние дистрибьюторы')}
                quantity={312}
                price={731820}
                href="/admin/warehouse"
              />
              <WarehouseCard
                iconSrc="/icons/IconAppsOrange.svg"
                title={t('Товары на подарки')}
                quantity={456}
                price={643722}
                href="/admin/warehouse"
              />
            </div>
          </div>

          {/* Правая часть: профиль */}
          <div className="xl:col-span-1">
  
            <TannurButton
              href="dashboard/create_event"
              text={t('Создать событие')}
              iconSrc="/icons/userblack.svg"
              arrow="black"
              variant="white"
            />
            <div className="mt-4"></div>
                 <TannurButton
              href="/profile"
              text={t('Моя страница')}
              iconSrc="/icons/userblack.svg"
              arrow="black"
              variant="white"
            />
            <div className="mt-4"></div>
                 <TannurButton
              href="/profile"
              text={t('Моя страница')}
              iconSrc="/icons/userblack.svg"
              arrow="black"
              variant="white"
            />
            <div className="mt-4"></div>
                 <TannurButton
              href="/profile"
              text={t('Моя страница')}
              iconSrc="/icons/userblack.svg"
              arrow="black"
              variant="white"
            />
           

          </div>
        </section>

        {/* Нижняя секция: цели */}
        <section className="space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl font-medium">{t('Стратегия Tannur')}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Краткосрочные цели */}
            <div className="bg-white rounded-2xl p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">{t('Краткосрочные цели')}</h3>
                <button type="button" className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title={t('Добавить')}>
                  <Image src="/icons/IconAddBlack.svg" width={20} height={20} alt={t('Добавить')} />
                </button>
              </div>
              <hr className="border-t border-gray-200 mb-4" />
              <div className="space-y-4">
                <TaskCard
                  title={t('Открыть новый филиал до 18 августа')}
                  statusLabel={t('в процессе')}
                  statusBg="bg-green-200"
                  statusText="text-green-800"
                  settingsUrl="#"
                />
                <TaskCard
                  title={t('Провести ревизию на складе до 6 июля')}
                  statusLabel={t('просрочено')}
                  statusBg="bg-red-200"
                  statusText="text-red-800"
                  settingsUrl="#"
                />
                <TaskCard
                  title={t('Объявить акцию на Август до 1 августа')}
                  statusLabel={t('сделано')}
                  statusBg="bg-blue-200"
                  statusText="text-blue-800"
                  settingsUrl="#"
                />
              </div>
            </div>

            {/* Долгосрочные цели */}
            <div className="bg-white rounded-2xl p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">{t('Долгосрочные цели')}</h3>
                <button type="button" className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title={t('Добавить')}>
                  <Image src="/icons/IconAddBlack.svg" width={20} height={20} alt={t('Добавить')} />
                </button>
              </div>
              <hr className="border-t border-gray-200 mb-4" />
              <div className="space-y-4">
                <TaskCard
                  title={t('Провести ревизию на складе до 6 июля')}
                  statusLabel={t('просрочено')}
                  statusBg="bg-red-200"
                  statusText="text-red-800"
                  settingsUrl="#"
                />
                <TaskCard
                  title={t('Объявить акцию на Август до 1 августа')}
                  statusLabel={t('сделано')}
                  statusBg="bg-blue-200"
                  statusText="text-blue-800"
                  settingsUrl="#"
                />
                <TaskCard
                  title={t('Открыть новый филиал до 18 августа')}
                  statusLabel={t('в процессе')}
                  statusBg="bg-green-200"
                  statusText="text-green-800"
                  settingsUrl="#"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
