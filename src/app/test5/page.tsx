// src/app/testpage-fifth/page.tsx
'use client'

import React from 'react'
import MoreHeader from '@/components/header/MoreHeader'
import Sidebar from '@/components/Sidebar'
import { FifthTemplate } from '@/components/layouts/TannurPageTemplates'

export default function TestPageFifth() {
  const fullBlock = (
    <div className="w-full h-48 bg-purple-200 flex items-center justify-center">
      <span className="text-xl font-semibold">Блок 1 — Full Width</span>
    </div>
  )

  const wideBlock = (
    <div className="w-full h-32 bg-yellow-300 flex items-center justify-center">
      <span className="text-lg font-medium">Блок 2 — 80%</span>
    </div>
  )

  const narrowBlock = (
    <div className="w-full h-32 bg-red-300 flex items-center justify-center">
      <span className="text-lg font-medium">Блок 3 — 20%</span>
    </div>
  )

  return (
    <FifthTemplate
      header={<MoreHeader title="Тестовая 5 — FifthTemplate" />}
      column1={fullBlock}
      column3={wideBlock}
      column2={narrowBlock}
    />
  )
}
