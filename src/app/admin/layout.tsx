// src/app/admin/layout.tsx
'use client';

import React from 'react';
import SidebarAdmin from '@/components/admin/SidebarAdmin';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex bg-[#f5f5f5] min-h-screen">
      {/* Сайдбар: скрыт на <lg, виден с lg+ */}
      <SidebarAdmin />

      {/* Основной контент:
          • flex-1 — занимает всё оставшееся
          • p-6    — внутренние паддинги
          • ml-0   — без смещения на <lg
          • lg:ml-36 — отступ, когда показываем Sidebar */}
      <main className="flex-1 p-6 ml-0 lg:ml-36">
        {children}
      </main>
    </div>
  );
}
