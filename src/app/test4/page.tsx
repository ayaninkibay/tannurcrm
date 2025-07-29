// src/app/testpage-fourth/page.tsx
'use client'

import React from 'react'
import MoreHeader from '@/components/header/MoreHeader'
import Sidebar from '@/components/Sidebar'
import { FourthTemplate } from '@/components/layouts/TannurPageTemplates'

export default function TestPageFourth() {
  const topBlock = (
    <div className="w-full h-40 bg-red-200 flex items-center justify-center">
      <span className="text-xl font-semibold">Блок 1 — Full Width</span>
    </div>
  )

  const bottomLeft = (
    <div className="w-full h-32 bg-green-200 flex items-center justify-center">
      <span className="text-lg font-medium">Блок 2 — Left</span>
    </div>
  )

  const bottomRight = (
    <div className="w-full h-32 bg-blue-200 flex items-center justify-center">
      <span className="text-lg font-medium">Блок 3 — Right</span>
    </div>
  )

  return (
    <FourthTemplate
      header={<MoreHeader title="Тестовая 4 — FourthTemplate" />}
      column1={topBlock}
      column2={bottomLeft}
      column3={bottomRight}
    />
  )
}
