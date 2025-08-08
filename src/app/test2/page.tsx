// src/app/testpage-second/page.tsx
'use client'

import React from 'react'
import MoreHeaderAD from '@/components/header/MoreHeaderAD'
import Sidebar from '@/components/Sidebar'
import { SecondTemplate } from '@/components/layouts/TannurPageTemplates'

export default function TestPageSecond() {
  const hero = (
    <div className="w-full h-48 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
      Большой баннер или Hero-блок
    </div>
  )

  const contentCards = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="p-4 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <h3 className="text-lg font-semibold mb-2">Карточка {i + 1}</h3>
          <p className="text-sm text-gray-600">
            Описание карточки {i + 1}. Здесь может быть произвольный контент.
          </p>
        </div>
      ))}
    </div>
  )

  return (
    <SecondTemplate
      header={<MoreHeaderAD title="Тестовая 2 — Two Blocks" />}
      column1={
        <div className="bg-red-100 p-6 rounded-lg">
          {hero}
        </div>
      }
      column2={
        <div className="bg-blue-100 p-6 rounded-lg">
          {contentCards}
        </div>
      }
    />
  )
}
