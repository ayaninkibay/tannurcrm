// src/app/testpage-third/page.tsx
'use client'

import React from 'react'
import MoreHeader from '@/components/header/MoreHeader'
import Sidebar from '@/components/Sidebar'
import { ThirdTemplate } from '@/components/layouts/TannurPageTemplates'

export default function TestPageThird() {
  const leftBlock = (
    <div className="h-64 bg-yellow-200 flex items-center justify-center">
      <span className="text-xl font-semibold">Блок 1 (Column1)</span>
    </div>
  )

  const rightBlock = (
    <div className="h-64 bg-teal-200 flex items-center justify-center">
      <span className="text-xl font-semibold">Блок 2 (Column2)</span>
    </div>
  )

  return (
    <ThirdTemplate
      header={<MoreHeader title="Тестовая 3 — ThirdTemplate" />}
      column1={leftBlock}
      column2={rightBlock}
    />
  )
}
