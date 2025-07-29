// src/app/admin/layout.tsx
'use client'

import React from 'react'
import SidebarAdmin from '@/components/admin/SidebarAdmin'
import { ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex bg-[#f5f5f5] min-h-screen">
      {/* SidebarAdmin: скрыт на <md, виден с md и всегда w-36 */}
      <SidebarAdmin />

      {/* Контент: без отступа на мобилке, с отступом 9rem (= w-36) на md+ */}
      <main
        className="
          flex-1
          p-6
          ml-0
          md:ml-36
        "
      >
        {children}
      </main>
    </div>
  )
}
