"use client";

import React, { useMemo } from 'react';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import BalanceCard from '@/components/blocks/BalanceCard';
import { TurnoverChart, MonthValue } from '@/components/TurnoverChart';
import { generateMonthlyData } from '@/components/generateData';
import ReportsSection from '@/components/reports/ReportsSection';
import CooperationTerms from '@/components/blocks/CooperationTerms';
import { useTranslate } from '@/hooks/useTranslate';
import { useUser } from '@/context/UserContext';



export default function StatsContent() {
  const { t } = useTranslate();
  const { profile: user } = useUser();



  return (
    <div className="space-y-8 p-2 md:p-6 bg-gray-100">
      <MoreHeaderDE title={t('Ваши финансы')} />



      {/* Section 2: Финансы */}
      <section className="grid grid-cols-8 gap-4">
        {/* Левая колонка */}
        <div className="col-span-8 md:col-span-4 xl:col-span-3 space-y-4">
          {/* BalanceCard с реальными данными */}
          <div className="bg-white rounded-2xl">
            <BalanceCard 
              userId={user?.id}     // Передаем ID пользователя для загрузки реальных данных
              size="large"          // Большой размер для отображения полной статистики
              variant="light"       // Светлая тема
            />
          </div>

          {/* CooperationTerms */}
          <div className="bg-white rounded-2xl">
            <CooperationTerms variant="light" />
          </div>
        </div>

        {/* Правая колонка - График */}
        <div className="col-span-8 md:col-span-4 xl:col-span-5 bg-white p-2 rounded-2xl">
          <TurnoverChart 
            title="Личный товарооборот"
            dataType="personal"
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