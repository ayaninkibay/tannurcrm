// src/app/dealer/layout.tsx
'use client'

import { ReactNode } from 'react'
import Sidebar from '@/components/Sidebar'
import PageTransitionProvider from '@/components/loadingSystem/PageTransitionLoader'

export default function DealerLayout({ children }: { children: ReactNode }) {
  return (
    <PageTransitionProvider>
      <div className="flex bg-[#f5f5f5] min-h-screen">
        <Sidebar />
        <main className="flex-1 p-2 ml-0 lg:ml-30">
          {children}
        </main>
      </div>
    </PageTransitionProvider>
  )
}
