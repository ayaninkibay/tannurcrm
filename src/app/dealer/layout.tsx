// src/app/dealer/layout.tsx
'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import { ReactNode } from 'react';

export default function DealerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex bg-[#f5f5f5] min-h-screen">
      {/* Сайдбар: скрыт ниже md, виден с md+ */}
      <Sidebar />

      {/* Основной контент:
          • flex-1 — занимает всё оставшееся
          • p-6    — внутренние паддинги
          • ml-0   — без смещения на <md
          • md:ml-36 — ровно 9rem отступ, когда показываем Sidebar */}
      <main className="flex-1 p-0 ml-0 lg:ml-36">
        {children}
      </main>
    </div>
  );
}
