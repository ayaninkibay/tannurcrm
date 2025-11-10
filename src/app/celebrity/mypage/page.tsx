// page.tsx (обновлённый)
'use client'

import MoreHeaderCE from '@/components/header/MoreHeaderCE'
import { TurnoverChart } from '@/components/TurnoverChart';
import React, { useMemo } from 'react';
import UserProfileCard from '@/components/profile/UserProfileCard'
import ReferalLink from '@/components/blocks/ReferralLink'
import BalanceCard from '@/components/blocks/BalanceCard'
import TannurButton from '@/components/Button'
import ReportsSection from '@/components/reports/ReportsSection';
import { useTranslate } from '@/hooks/useTranslate';

export default function CelebrityDashboardPage() {
  const { t } = useTranslate();
  const now = new Date();
  // Пример данных — замените на реальные из API


  return (
    <main className="bg-[#F6F6F6]">
      {/* Заголовок страницы */}
      <MoreHeaderCE title={t('Dashboard Селебрити')} />

      {/* Заглушка контента */}
      <div className="grid grid-cols-4 gap-4 mt-5">
        <div className="grid col-span-1 grid-rows-5 rounded-2xl gap-4">
          <div className="grid row-span-3 h-full w-full bg-white rounded-2xl ">
            <BalanceCard/>
          </div>
          <div className="grid row-span-1 h-full w-full bg-white rounded-2xl ">
            <TannurButton
              href="/profile"
              text={t('Моя страница')}
              iconSrc="/icons/buttom/my_page_orange.svg"
              arrow="black"
              variant="white"
            />
          </div>
          <div className="grid row-span-1 h-full w-full bg-white rounded-2xl ">
            <TannurButton
              href="/profile"
              text={t('Условия работы с Tannur')}
              iconSrc="/icons/buttom/shop_orange.svg"
              arrow="black"
              variant="white"
            />
          </div>
        </div>

        <div className="grid col-span-2 h-full w-full bg-white rounded-2xl p-6">
          <div className="text-2xl font-bold text-gray-800">
            {t('Мои обороты')}
          </div>
          <div className="mt-5">
            <TurnoverChart
              colorBar="#E9D9D6"
              colorLine="#D77E6C"
            />
          </div>
        </div>

        <div className="grid col-span-1 h-full w-full rounded-2xl bg-white p-5">
          <UserProfileCard />
          <TannurButton
            href="/profile"
            text={t('Мой профиль')}
            iconSrc="/icons/userblack.svg"
            arrow="black"
            variant="gray"
          />
          <div className="mt-1">
            <ReferalLink/>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <ReportsSection role="celebrity" />
      </div>
    </main>
  )
}
