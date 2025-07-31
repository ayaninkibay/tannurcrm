// src/app/dealer/stats/page.tsx
'use client';

import React, { useMemo } from 'react';
import MoreHeader from '@/components/header/MoreHeader';
import { TurnoverChart, MonthValue } from '@/components/TurnoverChart';
import ReportsSection from '@/components/reports/ReportsSection';

export default function DealerStatsPage() {
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
    <div className="space-y-8 p-6 bg-gray-100">
      {/* Заголовок */}
      <header>
        <MoreHeader title="Статистика дилера" />
      </header>

      {/* Два графика */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 ">
          <TurnoverChart
            data={sampleData}
            colorBar="#FEEBC8"
            colorLine="#D69E2E"
          />
        </div>
        <div className="bg-white rounded-2xl p-6 ">
          <TurnoverChart
            data={sampleData}
            colorBar="#FAE1F2"
            colorLine="#D53F8C"
          />
        </div>
         <div className="bg-white rounded-2xl p-6 ">
          <TurnoverChart
            data={sampleData}
            colorBar="#DBE1F6"
            colorLine="#94acffff"
          />
        </div>
         <div className="bg-white rounded-2xl p-6 ">
          <TurnoverChart
            data={sampleData}
            colorBar="#E9D9D6"
            colorLine="#D77E6C"
          />
        </div>
      </section>

      {/* Секция отчётов */}
      <section>
       <div className="w-full p-1 rounded-2xl grid grid-cols-1 gap-4">
        {/* Отчёты для дилера */}
        <ReportsSection role="admin" />
      </div>
      </section>
    </div>
  );
}
