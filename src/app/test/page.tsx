import React from 'react'
import MoreHeader from '@/components/header/MoreHeader'
import Sidebar from '@/components/Sidebar'
import { FirstTemplate } from '@/components/layouts/TannurPageTemplates'

export default function TestPage() {
  return (
    <FirstTemplate
      header={<MoreHeader title="Тестовая 1" />}
      column1={
        <div className="h-64 bg-gray-200 flex items-center justify-center">
          <span className="text-xl font-semibold">Колонка 1</span>
        </div>
      }
      column2={
        <div className="h-64 bg-gray-300 flex items-center justify-center">
          <span className="text-xl font-semibold">Колонка 2</span>
        </div>
      }
      column3={
        <div className="h-64 bg-gray-400 flex items-center justify-center">
          <span className="text-xl font-semibold">Колонка 3</span>
        </div>
      }
    />
  )
}