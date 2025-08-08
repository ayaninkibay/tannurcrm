// src/components/reports/ReportsSection.tsx
'use client';

import React, { useState } from 'react';
import SubscriptionsReport, { Period } from './SubscriptionsReport';
import PurchasesReport from './PurchasesReport';
import SalesReport from './SalesReport';
import UsersReport from './UsersReport';

type Role = 'dealer' | 'admin' | 'celebrity';

interface ReportItem {
  key: string;
  label: string;
  icon: (isActive: boolean) => React.ReactNode;
}

// SVG иконки как компоненты
const SubscriptionIcon = ({ isActive }: { isActive: boolean }) => (
  <svg className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-500'}`} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PurchaseIcon = ({ isActive }: { isActive: boolean }) => (
  <svg className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-500'}`} viewBox="0 0 24 24" fill="none">
    <path d="M9 2L3 12V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V12L15 2H9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 12V6C8 5.46957 8.21071 4.96086 8.58579 4.58579C8.96086 4.21071 9.46957 4 10 4H14C14.5304 4 15.0391 4.21071 15.4142 4.58579C15.7893 4.96086 16 5.46957 16 6V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SalesIcon = ({ isActive }: { isActive: boolean }) => (
  <svg className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-500'}`} viewBox="0 0 24 24" fill="none">
    <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 8L18.29 5.71C18.9 5.1 19.9 5.1 20.5 5.71C21.11 6.32 21.11 7.31 20.5 7.92L18.21 10.21M16 8L11 13M16 8L18.21 10.21M11 13L5.92 18.08C5.31 18.69 4.32 18.69 3.71 18.08C3.1 17.47 3.1 16.48 3.71 15.87L8.79 10.79M11 13L8.79 10.79" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GiftIcon = ({ isActive }: { isActive: boolean }) => (
  <svg className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-500'}`} viewBox="0 0 24 24" fill="none">
    <path d="M20 12V22H4V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 7H2V12H22V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 22V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 7H7.5C6.83696 7 6.20107 6.73661 5.73223 6.26777C5.26339 5.79893 5 5.16304 5 4.5C5 3.83696 5.26339 3.20107 5.73223 2.73223C6.20107 2.26339 6.83696 2 7.5 2C11 2 12 7 12 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 7H16.5C17.163 7 17.7989 6.73661 18.2678 6.26777C18.7366 5.79893 19 5.16304 19 4.5C19 3.83696 18.7366 3.20107 18.2678 2.73223C17.7989 2.26339 17.163 2 16.5 2C13 2 12 7 12 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const reportsConfig: Record<Role, ReportItem[]> = {
  dealer: [
    { key: 'subscriptions', label: 'Подписки', icon: (isActive: boolean) => <SubscriptionIcon isActive={isActive} /> },
    { key: 'purchases', label: 'Покупки', icon: (isActive: boolean) => <PurchaseIcon isActive={isActive} /> },
  ],
  admin: [
    { key: 'subscriptions', label: 'Подписки', icon: (isActive: boolean) => <SubscriptionIcon isActive={isActive} /> },
    { key: 'purchases', label: 'Покупки', icon: (isActive: boolean) => <PurchaseIcon isActive={isActive} /> },
    { key: 'sales', label: 'Продажи', icon: (isActive: boolean) => <SalesIcon isActive={isActive} /> },
    { key: 'users', label: 'Подарки', icon: (isActive: boolean) => <GiftIcon isActive={isActive} /> },
  ],
  celebrity: [
    { key: 'sales', label: 'Продажи', icon: (isActive: boolean) => <SalesIcon isActive={isActive} /> },
    { key: 'purchases', label: 'Покупки', icon: (isActive: boolean) => <PurchaseIcon isActive={isActive} /> },
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

  return (
    <div className="flex flex-col gap-6">
      {/* Заголовок с тонкой линией */}
      <div className="flex items-center gap-4 ">
        <h2 className="text-md lg:text-2xl font-light text-gray-900 tracking-tight">
          Отчеты
        </h2>
        <div className="h-px bg-gradient-to-r from-gray-200 to-transparent flex-1"></div>
      </div>

      {/* Минималистичные табы справа */}
      <div className="flex justify-end mb-4">
        <div className="bg-gray-100/50 backdrop-blur-sm rounded-2xl p-1.5 shadow-sm">
          <div className="flex gap-1 relative">
            {/* Активный индикатор с градиентом в цвете D77E6C */}
            <div
              className="absolute top-0 bottom-0 bg-gradient-to-r from-[#D77E6C] to-[#E09080] rounded-xl transition-all duration-500 ease-out shadow-lg"
              style={{
                left: `${(100 / tabs.length) * activeIndex}%`,
                width: `${100 / tabs.length}%`,
                transform: `translateX(${activeIndex * 4}px)`,
              }}
            />

            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                className={`
                  relative z-10 flex items-center gap-2.5 px-6 py-3 rounded-xl
                  transition-all duration-300 min-w-[140px] group
                  ${active === tab.key 
                    ? 'text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {/* Иконка с анимацией */}
                <div className={`transition-transform duration-300 ${
                  active === tab.key ? 'scale-110' : 'group-hover:scale-105'
                }`}>
                  {tab.icon(active === tab.key)}
                </div>
                
                {/* Текст */}
                <span className={`font-medium text-sm tracking-wide transition-all duration-300 ${
                  active === tab.key ? 'translate-x-0.5' : ''
                }`}>
                  {tab.label}
                </span>

                {/* Точка-индикатор для активного таба */}
                {active === tab.key && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full shadow-md animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Контент с плавным появлением */}
      <div className="relative">
        {/* Декоративный элемент */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-[#D77E6C]/5 to-[#E09080]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 animate-fadeIn p-2 w-full overflow-auto">
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

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ReportsSection;