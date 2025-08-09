"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import MoreHeaderDE from '@/components/header/MoreHeaderDE'
import BalanceCard from '@/components//blocks/BalanceCard';
import { TurnoverChart, MonthValue } from '@/components/TurnoverChart';
import { generateMonthlyData } from '@/components/generateData';
import ReportsSection from '@/components/reports/ReportsSection';
import CooperationTerms from '@/components/blocks/CooperationTerms';

const stats = [
 { label: 'Выплаты за подписки', amount: '1 984 321 ₸', dotColor: 'bg-green-500' },
 { label: 'Бонус за Личный Тов.Оборот', amount: '273 980 ₸', dotColor: 'bg-blue-500' },
 { label: 'Бонус за Командный Тов.Оборот', amount: '273 980 ₸', dotColor: 'bg-yellow-400' },
 { label: 'Личный товарооборот', amount: '7 412 000 ₸', dotColor: 'bg-pink-500' },
 { label: 'Командный товарооборот', amount: '29 412 000 ₸', dotColor: 'bg-purple-500' },
];

const rawData: MonthValue[] = generateMonthlyData(
 new Date(2023, 8, 1), 
 12
);

export default function StatsContent() {
 return (
   <div className="space-y-8 p-2 md:p-6 bg-gray-100">
     <MoreHeaderDE title="Ваши финансы" />
     
     {/* Section 1: Товарооборот */}
     <section>
       <div className="bg-white p-6 rounded-2xl grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 justify-items-center">
         {stats.map((stat, index) => (
           <div
             key={index}
             className="flex flex-col items-start justify-center gap-1 w-full"
           >
             <div className="flex items-center gap-2">
               <span className={`w-2.5 h-2.5 rounded-full ${stat.dotColor}`} />
               <span className="text-sm text-gray-600">{stat.label}</span>
             </div>
             <span className="text-lg font-semibold text-black">
               {stat.amount}
             </span>
           </div>
         ))}
       </div>
     </section>

     {/* Section 2: Финансы */}
     <section className="grid grid-cols-8 gap-4">
       {/* Левая колонка */}
       <div className="col-span-8 md:col-span-4 xl:col-span-3 space-y-4">
         {/* BalanceCard */}
         <div className="bg-white rounded-2xl">
           <BalanceCard balance={890020} size="large" variant="light" />
         </div>
         
         {/* CooperationTerms */}
         <div className="bg-white rounded-2xl">
           <CooperationTerms variant="light" />
         </div>
       </div>

       {/* Правая колонка - График */}
       <div className="col-span-8 md:col-span-4 xl:col-span-5 bg-white p-2 rounded-2xl">
         <TurnoverChart
           data={rawData}
           colorBar="#E9D7D6"
           colorLine="#DB6A56"
           lineOffset={300000}
         />
       </div>
     </section>

     {/* Section 3: Отчет */}
     <section>
       <div className="w-full rounded-2xl grid grid-cols-1 gap-4">
         <ReportsSection role="dealer" />
       </div>
     </section>
   </div>
 );
}