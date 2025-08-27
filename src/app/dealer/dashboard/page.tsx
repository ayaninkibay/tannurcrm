'use client'

import React from 'react'
import MoreHeaderDE from '@/components/header/MoreHeaderDE'
import BalanceCard from '@/components/blocks/BalanceCard'
import TeamCard from '@/components/blocks/TeamCard'
import BonusCard from '@/components/blocks/BonusCard'
import UserProfileCard from '@/components/profile/UserProfileCard'
import TannurButton from '@/components/Button'
import ReferalLink from '@/components/blocks/ReferralLink'
import SponsorCard from '@/components/blocks/SponsorCard'
import { TurnoverChart, MonthValue } from '@/components/TurnoverChart'
import { generateMonthlyData } from '@/components/generateData'
import Lottie from 'lottie-react'
import moneyAnimation from '@/components/lotties/reports_gray.json'
import NewsEventsCard from '@/components/events/NewsEventsCard';
import Link from 'next/link';

const rawData: MonthValue[] = generateMonthlyData(new Date(2024, 8, 1), 12)

export default function DashboardPage() {
 return (
   <div className=" p-2 md:p-6 space-y-6">
     {/* Хидер */}
     <MoreHeaderDE title="Дэшборд" />

     {/* Приветствие */}
     <div className="bg-white p-6 rounded-2xl flex justify-between items-center">
       <span className="text-gray-700 font-medium text-base">С возвращением, Інжу</span>
       <Link
         href="/dealer/dashboard/shop/"
         className="flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium text-white bg-[#DC7C67] hover:opacity-90 transition"
         role="button"
       >
         <img src="/icons/IconShoppingWhite.png" className="w-3.5 h-3.5" alt="shop" />
         Мои покупки
       </Link>
     </div>

     {/* Основной контент */}
     <div className="grid xl:grid-cols-[2fr_1fr] gap-6">
       {/* Левая колонка */}
       <div className="space-y-6">
         {/* Верх: 3 карточки - фиксированная высота */}
         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
           <div className="h-full">
             <BalanceCard balance={890020} size="normal" variant="dark" />
           </div>
           <div className="h-full]">
             <TeamCard title="Моя команда" count={68} goal={100} showButton variant="color" />
           </div>
           <div className="h-full">
             <BonusCard 
  turnover={2500000}    // Текущий оборот в тенге
  goal={5000000}        // Цель для следующего уровня
  remaining={2500000}   // Сколько осталось до цели
  variant="turnover"       // Тип карточки
/>
           </div>
         </div>

         {/* Низ: график и новости - одинаковая высота */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* График */}
           <div className="h-full">
             <TurnoverChart
               data={rawData}
               colorBar="#E9D7D6"
               colorLine="#DB6A56"
               lineOffset={300000}
               showStats={true}
             />
           </div>

           {/* Новости */}
           <div className="min-h-[400px]  overflow-hidden flex flex-col">
              <NewsEventsCard/>
           </div>
         </div>
       </div>

       {/* Правая колонка - фиксированная высота для выравнивания */}
       <div className="h-fit xl:sticky xl:top-6">
         <div className="bg-white rounded-2xl overflow-hidden p-6 space-y-4">
           <UserProfileCard />
           
           {/* Кнопки навигации */}
           <div className="space-y-3 hidden md:block">
             <TannurButton 
               href="/dealer/profile_dealer" 
               text="Моя страница" 
               iconSrc="/icons/IconGroupBlack.png" 
               arrow="black" 
               variant="gray" 
             />
             <TannurButton 
               href="/notifications" 
               text="Уведомления" 
               iconSrc="/icons/Icon notifications.png" 
               arrow="black" 
               variant="gray" 
             />
           </div>
           
           {/* Реферальная ссылка */}
           <div className="pt-2">
             <ReferalLink variant="orange" />
           </div>
           
           {/* Карточка спонсора */}
           <div className="pt-2">
             <SponsorCard variant="gray" />
           </div>
         </div>
       </div>
     </div>
   </div>
 )
}