'use client'

import React from 'react'
import { useUser } from '@/context/UserContext'
import { useTranslate } from '@/hooks/useTranslate' 
import MoreHeaderDE from '@/components/header/MoreHeaderDE'
import BalanceCard from '@/components/blocks/BalanceCard'
import BonusCard from '@/components/blocks/BonusCard'
import UserProfileCard from '@/components/profile/UserProfileCard'
import TannurButton from '@/components/Button'
import ReferalLink from '@/components/blocks/ReferralLink'
import SponsorCard from '@/components/blocks/SponsorCard'
import { TurnoverChart, MonthValue } from '@/components/TurnoverChart'
import { generateMonthlyData } from '@/components/generateData'
import NewsEventsCard from '@/components/events/NewsEventsCard'
import { TeamCardModule } from '@/lib/team'

import Link from 'next/link'

const rawData: MonthValue[] = generateMonthlyData(new Date(2024, 8, 1), 12)

export default function DashboardPage() {
  const { t } = useTranslate()
  const { profile: user } = useUser()

  return (
    <div className="p-2 md:p-6 space-y-6">
      {/* Хидер */}
      <div className="flex justify-between items-center">
        <MoreHeaderDE title={t('Дэшборд')} />
      </div>

      {/* Основной контент */}
      <div className="grid xl:grid-cols-[2fr_1fr] gap-6">
        {/* Левая колонка */}
        <div className="space-y-6">
          {/* Верх: 3 карточки */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-6">
            <div className="h-full">
              <BalanceCard balance={890020} size="normal" variant="dark" />
            </div>
            <div className="h-full">
              <TeamCardModule 
                userId={user?.id}
                title={t('Моя команда')} 
                variant="White" 
                showButton={true}
              />
            </div>
          </div>

          {/* Низ: график и новости */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-full">
<TurnoverChart 
  title="Личный товарооборот"
  dataType="personal"
/>
            </div>
            <div className="max-h-[600px] overflow-hidden flex flex-col">
              <NewsEventsCard />
            </div>
          </div>
        </div>

        {/* Правая колонка */}
        <div className="h-fit xl:sticky xl:top-6">
          <div className="bg-white rounded-2xl overflow-hidden p-6 space-y-4">
            <UserProfileCard />

            <div className="space-y-3 hidden md:block">
              <TannurButton
                href="/dealer/profile_dealer"
                text={t('Моя страница')}
                iconSrc="/icons/IconGroupBlack.png"
                arrow="black"
                variant="gray"
              />
              <TannurButton
                href="/notifications"
                text={t('Уведомления')}
                iconSrc="/icons/Icon notifications.png"
                arrow="black"
                variant="gray"
              />
            </div>

            <div className="pt-2">
              <ReferalLink variant="orange" />
            </div>

            <div className="pt-2">
              <SponsorCard 
                variant="minimal" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}