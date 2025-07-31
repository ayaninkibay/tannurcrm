// src/components/reports/ReportsSection.tsx
'use client';

import React, { useState } from 'react';
import SubscriptionsReport, { Period } from './SubscriptionsReport';
import PurchasesReport from './PurchasesReport';
import SalesReport from './SalesReport';
import UsersReport from './UsersReport';
import Image from 'next/image';

const tabIcons: Record<string, string> = {
  subscriptions: '/icons/icon-subscription.svg',
  purchases: '/icons/icon-purchase.svg',
  sales: '/icons/icon-sales.svg',
  users: '/icons/icon-users.svg',
};
type Role = 'dealer' | 'admin' | 'celebrity';

interface ReportItem {
  key: string;
  label: string;
}

const reportsConfig: Record<Role, ReportItem[]> = {
  dealer: [
    { key: 'subscriptions', label: 'Подписки' },
    { key: 'purchases', label: 'Покупки' },
  ],
  admin: [
    { key: 'subscriptions', label: 'Подписки' },
    { key: 'purchases', label: 'Покупки' },
    { key: 'sales', label: 'Продажи' },
    { key: 'users', label: 'Пользователи' },
  ],
  celebrity: [
    { key: 'sales', label: 'Продажи' },
    { key: 'purchases', label: 'Покупки' },
  ],
};

interface ReportsSectionProps {
  role: Role;
}

const ReportsSection: React.FC<ReportsSectionProps> = ({ role }) => {
  const tabs = reportsConfig[role];
  const [active, setActive] = useState<string>(tabs[0].key);
  const [period, setPeriod] = useState<Period>('all');

  const activeIndex = tabs.findIndex((t) => t.key === active);
  const tabCount = tabs.length;

  const tabWidthPercent = 100 / tabCount;

  return (
    <div className="flex flex-col gap-6">
      {/* Заголовок и табы */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Отчеты</h2>

        <div className="relative overflow-x-auto w-70 max-w-md">
          {/* Табы через flex */}
          <div className="flex bg-white rounded-full p-1 relative">
            {/* Индикатор */}
            <span
              className="absolute top-1 bottom-1 bg-[#DC7C67] rounded-full transition-all z-10"
              style={{
                left: `${tabWidthPercent * activeIndex}%`,
                width: `${tabWidthPercent}%`,
              }}
            />

            {tabs.map((tab) => (
  <button
    key={tab.key}
    onClick={() => setActive(tab.key)}
    className={`flex items-center justify-center gap-2 flex-1 relative z-20 min-w-[80px] py-2 text-sm font-medium rounded-full transition-colors ${
      active === tab.key ? 'text-white' : 'text-black'
    }`}
  >
    <Image
      src={tabIcons[tab.key]}
      alt={tab.label}
      width={20}
      height={20}
      className="object-contain"
    />
    <span>{tab.label}</span>
  </button>
))}

          </div>
        </div>
      </div>

      {/* Контент отчётов */}
      <div className="bg-white rounded-2xl p-6 w-full overflow-auto">
        {active === 'subscriptions' && (
          <SubscriptionsReport period={period} onPeriodChange={setPeriod} />
        )}
        {active === 'purchases' && (
          <PurchasesReport period={period} onPeriodChange={setPeriod} />
        )}
        {active === 'sales' && (
          <SalesReport period={period} onPeriodChange={setPeriod} />
        )}
        {active === 'users' && (
          <UsersReport period={period} onPeriodChange={setPeriod} />
        )}
      </div>
    </div>
  );
};

export default ReportsSection;
