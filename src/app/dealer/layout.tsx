// src/app/dealer/layout.tsx
'use client'

import React from 'react'
import Sidebar from '@/components/Sidebar'
import { ReactNode } from 'react'

export default function DealerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex bg-[#f5f5f5] min-h-screen">
      {/* Sidebar: скрыт на <md, виден с md и всегда w-36 */}
      <Sidebar />

      {/* Контент: без отступа на мобильных, с отступом 9rem (= w-36) на md+ */}
      <main
        className={`
          flex-1 p-6
          ml-0
          md:ml-36
        `}
      >
        {children}
      </main>
    </div>
  )
}
