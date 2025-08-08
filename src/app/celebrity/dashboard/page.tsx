'use client'

import MoreHeaderCE from '@/components/header/MoreHeaderCE'
import { TurnoverChart, MonthValue } from '@/components/TurnoverChart';
import React, { useMemo } from 'react';




export default function CelebrityDashboardPage() {
  const now = new Date();
  // Пример данных — замените на реальные из API
  const sampleData: MonthValue[] = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        date: new Date(now.getFullYear(), i, 1),
        value: Math.floor(Math.random() * 5_000_000) + 5_000_000,
      })),
    [now.getFullYear()]
  );



  return (
    <main className="min-h-screen bg-[#F6F6F6]">
      {/* Заголовок страницы */}
      <MoreHeaderCE title="Dashboard Селебрити" />

      {/* Заглушка контента */}
      <div className="grid grid-cols-4 gap-4 mt-15">
                    <div className="grid col-span-1 grid-rows-5 gap-4">
                                    <div className="grid row-span-3 h-full w-full bg-white "></div>
                                    <div className="grid row-span-1 h-full w-full bg-white "></div>
                                    <div className="grid row-span-1 h-full w-full bg-white "></div>
                    </div>


                      <div className="grid col-span-2 h-full w-full bg-white rounded-2xl">

                                 <div className="bg-white rounded-2xl p-3 ">
                                                <TurnoverChart
                                                  data={sampleData}
                                                  colorBar="#E9D9D6"
                                                  colorLine="#D77E6C"
                                                />
                                </div>

                      </div>
                      <div className="grid col-span-1 h-100 w-full bg-white"></div>
                        
      </div>
    </main>
  )
}
