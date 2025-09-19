'use client'

import React from 'react'
import { useUser } from '@/context/UserContext'
import { useTranslate } from '@/hooks/useTranslate' 
import MoreHeaderDE from '@/components/header/MoreHeaderDE'
import BalanceCard from '@/components/blocks/BalanceCard'
import { BonusProgressCard } from '@/components/blocks/BonusProgressCard' // НОВЫЙ ИМПОРТ
import UserProfileCard from '@/components/profile/UserProfileCard'
import ReferalLink from '@/components/blocks/ReferralLink'
import SponsorCard from '@/components/blocks/SponsorCard'
import { TurnoverChart } from '@/components/TurnoverChart'
import { generateMonthlyData } from '@/components/generateData'
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
          <ReferalLink variant="orange" />
        </div>
        
        {/* Спонсор */}
        <div className="flex-1 w-full">
          <SponsorCard variant="minimal" />
        </div>
      </div>

      {/* Основной контент */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Карточки баланса и бонусного прогресса */}
        <div className="h-full">
          <BalanceCard balance={890020} size="normal" variant="dark" />
        </div>
        <div className="h-full">
          <BonusProgressCard userId={user?.id} /> {/* ЗАМЕНИЛИ НА БОНУСНЫЙ ПРОГРЕСС */}
        </div>
      </div>

      {/* График и новости */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-full">
          <TurnoverChart 
            title="Личный товарооборот"
            dataType="personal"
          />
        </div>
        <div className="h-full overflow-hidden flex flex-col">
          <NewsEventsCard />
        </div>
      </div>
    </div>
  )
}