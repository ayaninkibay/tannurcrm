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
             <TeamCard title="Моя команда" count={68} goal={100} showButton variant="purple" />
           </div>
           <div className="h-full">
             <BonusCard variant="color" turnover={7412000} goal={9800000} remaining={2388000} />
           </div>
         </div>

         {/* Низ: график и новости - одинаковая высота */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* График */}
           <div className="h-[400px]">
             <TurnoverChart
               data={rawData}
               colorBar="#E9D7D6"
               colorLine="#DB6A56"
               lineOffset={300000}
               showStats={false}
             />
           </div>

           {/* Новости */}
           <div className="h-[400px] rounded-2xl bg-white p-6 overflow-hidden flex flex-col">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-semibold text-gray-900">События за Август</h2>
               <button className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-100 transition">
                 <img src="/icons/Icon long arrow white.png" className="w-3.5 h-3.5" alt="Перейти" />
               </button>
             </div>
             <div className="border-t border-gray-200 mb-4" />
             <div className="flex-1 overflow-y-auto space-y-3">
               {[
                 { title: 'Новый филиал в Алматы', icon: 'Icon cover 1.png' },
                 { title: 'Путевка в Египет за 50 человек', icon: 'Icon cover 2.png' },
                 { title: 'TNBA – Новый спикер в Академии', icon: 'Icon cover 3.png' },
                 { title: 'Мероприятие Tannur Event 08 в Astana Arena', icon: 'Icon cover 4.png' },
               ].map(({ title, icon }, idx) => (
                 <div key={idx} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition">
                   <div className="flex items-center gap-3">
                     <img src={`/icons/${icon}`} className="w-12 h-12 rounded-xl object-cover" alt="Иконка" />
                     <div className="flex flex-col">
                       <span className="text-sm font-semibold text-gray-900">{title}</span>
                       <span className="text-xs text-gray-500">новости</span>
                     </div>
                   </div>
                   <img src="/icons/buttom/DoubleIconArrowOrange.svg" className="w-6 h-6" alt="Подробнее" />
                 </div>
               ))}
             </div>
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