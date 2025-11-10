'use client'

import React from 'react'
import { useUser } from '@/context/UserContext'
import { useTranslate } from '@/hooks/useTranslate' 
import MoreHeaderDE from '@/components/header/MoreHeaderDE'
import BalanceCard from '@/components/blocks/BalanceCard'
import { BonusProgressCard } from '@/components/blocks/BonusProgressCard'
import UserProfileCard from '@/components/profile/UserProfileCard'
import ReferalLink from '@/components/blocks/ReferralLink'
import SponsorCard from '@/components/blocks/SponsorCard'
import { TurnoverChart } from '@/components/TurnoverChart'
import NewsEventsCard from '@/components/events/NewsEventsCard'

export default function DashboardPage() {
  const { t } = useTranslate()
  const { profile: user } = useUser()

  return (
    <div className="p-2 md:p-6 space-y-6">
      {/* Хидер */}
      <div className="flex justify-between items-center">
        <MoreHeaderDE title={t('Дэшборд')} />
      </div>

      {/* Верхний блок с профилем, реферальной ссылкой и спонсором */}
      <div className="flex flex-col lg:flex-row items-center gap-4 md:gap-6">
        {/* Профиль */}
        <div className="flex-1 w-full">
          <UserProfileCard />
        </div>
        
        {/* Реферальная ссылка */}
        <div className="flex-1 w-full">
          <ReferalLink />
        </div>

        {/* Спонсор */}
        <div className="flex-1 w-full">
          <SponsorCard />
        </div>
      </div>

      {/* Основной контент */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Карточка баланса с реальными данными из withdrawalService */}
        <div className="h-full">
          <BalanceCard 
            userId={user?.id}     // Передаем ID пользователя для загрузки реальных данных
            size="normal"         // Размер карточки
            variant="light"       // Светлая тема (вместо "white" используем "light")
          />
        </div>
        {/* Карточка бонусного прогресса */}
        <div className="h-full">
          <BonusProgressCard userId={user?.id} />
        </div>
      </div>

      {/* График и новости */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-full">
        <TurnoverChart
          userId={user?.id}
          title="Мой товарооборот"
          subtitle="Личные продажи"
        />
        </div>
        <div className="min-h-[400px] overflow-hidden flex flex-col">
          <NewsEventsCard />
        </div>
      </div>
    </div>
  )
}