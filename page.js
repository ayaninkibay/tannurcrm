'use client';

import React from 'react';

import Shop from './Dashboard';

export default function MainContent() {
  return (
    <div className="flex bg-[#f5f5f5] min-h-screen">
      {/* Сайдбар */}
      <Sidebar />

      {/* Контент магазина */}
      <main className="flex-1 ml-[140px] p-6">
        <Shop />
      </main>
    </div>
  );
}
