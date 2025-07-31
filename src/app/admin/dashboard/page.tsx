'use client';

import React from 'react';
import MoreHeader from '@/components/header/MoreHeader';
import { StatisticCard } from '@/components/components_admins_dashboard/StatisticCard';
import { RevenueCard } from '@/components/components_admins_dashboard/RevenueCard';
import { WarehouseCard } from '@/components/components_admins_dashboard/WarehouseCard';
import { TaskCard } from '@/components/components_admins_dashboard/TaskCard';
import Image from 'next/image';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 p-1 xl:p-6 bg-gray-100">
      {/* Шапка */}
      <header>
        <MoreHeader title="Админ панель" />
      </header>

      {/* Верхняя секция */}
      <section className="grid grid-cols-8 gap-4"> {/* родак 1 */}
        {/* Левая часть */}
        <div className="col-span-6 grid gap-4"> {/* родак 2 */} 
          {/* Row 1: Statistic + Revenue */}
          <div className="grid grid-cols-6 gap-4"> {/* родак 3 */}
            {/* Stat column */}
            <div className="col-span-1 grid grid-rows-2 gap-4"> {/* родак 4 */}
              <StatisticCard
                iconSrc="/icons/IconUsersAdd.svg"
                title="Диллеры"
                count={2588}
                href="/admin/dealers"
              />
              <StatisticCard
                iconSrc="/icons/IconStarOrange.svg"
                title="Звёзды"
                count={35}
                href="/admin/dealers"
              />
            </div>
            {/* Revenue column */}
            <div className="col-span-5 grid grid-rows-3 gap-4">
              <RevenueCard
                title="Товарооборот магазина"
                amount={84213000}
                href="/admin/revenue"
                bgColor="bg-[#DADDFF]"
              />
              <RevenueCard
                title="Товарооборот магазина"
                amount={84213000}
                href="/admin/revenue"
                bgColor="bg-[#FFE0DA]"
              />
              <RevenueCard
                title="Товарооборот магазина"
                amount={84213000}
                href="/admin/revenue"
                bgColor="bg-[#F0E4FF]"
              />
            </div>
          </div>

          {/* Row 2: Warehouse */}
          <div className="grid grid-cols-3 gap-4">
            <WarehouseCard
              iconSrc="/icons/IconAppsOrange.svg"
              title="Товары на складе"
              quantity={42933}
              price={543213000}
              href="/admin/warehouse"
            />
            <WarehouseCard
              iconSrc="/icons/IconAppsOrange.svg"
              title="Товары на складе"
              quantity={42933}
              price={543213000}
              href="/admin/warehouse"
            />
            <WarehouseCard
              iconSrc="/icons/IconAppsOrange.svg"
              title="Товары на складе"
              quantity={42933}
              price={543213000}
              href="/admin/warehouse"
            />
          </div>
        </div>

        {/* Аян вот этот блок профиля твой */}
        <div className="col-span-2">
          <div className="bg-white h-20 sm:h-[170px] w-full rounded-2xl"></div>
        </div>
      </section>

      {/* Нижняя секция */}
      <section>
        <div className="text-2xl font-medium mb-6">
          <p>Стратегия Tannur
          </p>
        </div>
<div className="col-span-2 grid grid-cols-2 gap-4">
<div className="bg-white rounded-2xl w-full p-4">
                           {/* Заголовок + кнопка сверху */}
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Краткосрочные цели</h3>
                            <button type="button" className="p-2">
                              <Image
                                src="/icons/IconAddBlack.svg"
                                width={20}
                                height={20}
                                alt="Добавить"
                              />
                            </button>
                          </div>

  {/* Разделитель */}
  <hr className="border-t border-gray-200 mb-4" />

  {/* Список задач */}
  <div className="space-y-4">
                              <TaskCard
                                title="Открыть новый филиал до 18 августа"
                                statusLabel="в процессе"
                                statusBg="bg-green-200"
                                statusText="text-green-800"
                                settingsUrl="#"
                              />
                              <TaskCard
                                title="Провести ревизию на складе до 6 июля"
                                statusLabel="просрочено"
                                statusBg="bg-red-200"
                                statusText="text-red-800"
                                settingsUrl="#"
                              />
                              <TaskCard
                                title="Объявить акцию на Август до 1 августа"
                                statusLabel="сделано"
                                statusBg="bg-blue-200"
                                statusText="text-blue-800"
                                settingsUrl="#"
                              />
  </div>
</div>
          <div className="bg-white rounded-2xl w-full p-4">
  {/* Заголовок + кнопка сверху */}
  <div className="flex justify-between items-start mb-4">
    <h3 className="text-lg font-medium text-gray-900">Долгосрочные цели</h3>
    <button type="button" className="p-2">
      <Image
        src="/icons/IconAddBlack.svg"
        width={20}
        height={20}
        alt="Добавить"
      />
    </button>
  </div>

  {/* Разделитель */}
  <hr className="border-t border-gray-200 mb-4" />

  {/* Список задач */}
  <div className="space-y-4">
    <TaskCard
      title="Провести ревизию на складе до 6 июля"
      statusLabel="просрочено"
      statusBg="bg-red-200"
      statusText="text-red-800"
      settingsUrl="#"
    />
    <TaskCard
      title="Объявить акцию на Август до 1 августа"
      statusLabel="сделано"
      statusBg="bg-blue-200"
      statusText="text-blue-800"
      settingsUrl="#"
    />
      <TaskCard
      title="Открыть новый филиал до 18 августа"
      statusLabel="в процессе"
      statusBg="bg-green-200"
      statusText="text-green-800"
      settingsUrl="#"
    />
  </div>
</div>
        </div>
      </section>
    </div>
  );
}