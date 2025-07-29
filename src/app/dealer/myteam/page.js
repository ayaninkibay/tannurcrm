'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import Shop from './myteam';

export default function myteam() {
  return (
    <div className="flex bg-[#f5f5f5] min-h-screen">
      {/* Сайдбар */}
      <Sidebar/>

      {/* Контент магазина */}
      <main className="flex-1 ml-[140px] p-6">
        <Shop />
      </main>
    </div>
  );
}
