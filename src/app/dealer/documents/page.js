'use client';

import React from 'react';
import DashboardSidebar from '@/components/Sidebar';
import Shop from './documents';

export default function documents() {
  return (
    <div className="flex bg-[#f5f5f5] min-h-screen">
      {/* Сайдбар */}
      <DashboardSidebar />

      {/* Контент магазина */}
      <main className="flex-1 ml-[140px] p-6">
        <Shop />
      </main>
    </div>
  );
}
