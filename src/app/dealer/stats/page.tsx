"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import MoreHeader from '@/components/header/MoreHeader'
import BalanceCard from '@/components//blocks/BalanceCard';
import { TurnoverChart, MonthValue } from '@/components/TurnoverChart';
import { generateMonthlyData } from '@/components/generateData';
import ReportsSection from '@/components/reports/ReportsSection';

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
    <div className="space-y-8 p-1 xl:p-2 bg-gray-100">
              <MoreHeader title="Ваши финансы" />
      {/* Section 1: Товарооборот */}
      <section>
        <div className="
          bg-white p-6 rounded-2xl grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 justify-items-center">
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
      <section className="space-y-4 grid grid-cols-8 gap-4">
        
        <div className="col-span-8 md:col-span-4 xl:col-span-2 bg-white w-full h-full p-4 rounded-2xl">
          <BalanceCard balance="890 020" variant="light" />
          </div>


        <div className="grid col-span-8 md:col-span-4 xl:col-span-2 gap-4 w-full h-full rounded-2xl">

                                        <div className="bg-white w-full p-4 rounded-2xl">
                                            <div>
                                                <h2 className="text-lg font-semibold text-black mb-4">Условия сотрудничества</h2>
                                                <ul className="text-sm text-gray-500 space-y-1">
                                                  <li>8% – с оборота команды</li>
                                                  <li>15% – с покупки в магазине</li>
                                                  <li>50% – с подписки диллеров</li>
                                                  <li>3% – бонусов от Tannur</li>
                                                </ul>
                                              </div>
                                              <div className="flex justify-end">
                                                <button className="flex items-center gap-2 text-black text-sm hover:underline transition">
                                                  <div className="w-[14px] h-[14px] relative">
                                                  <div className="relative w-[14px] h-[14px]">
                                                    <Image
                                                      src="/icons/Icon download.png"
                                                      alt="download"
                                                      fill
                                                      sizes="14px"
                                                      className="object-contain"
                                                    />
                                                  </div>


                                                  </div>

                                                  <span>Скачать договор</span>
                                                </button>
                                              </div>
                                          </div> 

                                          <div className="bg-white w-full h-full p-4 rounded-2xl">
                                                <div className="flex justify-between items-center">
                                                  <h2 className="text-lg font-semibold text-black">Отчеты</h2>
                                                  <button className="flex items-center gap-1 text-sm text-black bg-[#f2f2f2] px-3 py-1 rounded-full hover:opacity-80 transition">
                                                    За всё время
                                                  <div className="relative w-[14px] h-[14px]">
                                                    <Image
                                                      src="/icons/Icon download.png"
                                                      alt="download"
                                                      fill
                                                      sizes="14px"
                                                      className="object-contain"
                                                    />
                                                  </div>

                                                  </button>
                                                </div>
                                                <div className="flex flex-col gap-1 mt-4">
                                                  <button className="flex items-center gap-2 text-black text-sm hover:underline transition">
                                                  <Image src="/icons/Icon download.png" alt="download" width={14} height={14} />
                                                    <span>Скачать отчет за товарооборот</span>
                                                  </button>
                                                  <button className="flex items-center gap-2 text-black text-sm hover:underline transition">
                                                        <div className="relative w-[14px] h-[14px]">
                                                          <Image
                                                            src="/icons/Icon download.png"
                                                            alt="download"
                                                            fill
                                                            sizes="14px"
                                                            className="object-contain"
                                                          />
                                                        </div>

                                                    <span>Скачать отчет за подписки</span>
                                                  </button>
                                                </div>
                                            </div>
          </div>


          <div className=" col-span-8 md:col-span-8 xl:col-span-4 bg-white w-full h-full p-4 rounded-2xl">
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
        {/* Отчёты для дилера */}
        <ReportsSection role="dealer" />
      </div>
    </section>
    </div>
  );
}