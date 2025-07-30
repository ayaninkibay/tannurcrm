'use client'

import React from 'react'
import MoreHeader from '@/components/header/MoreHeader'
import { FirstTemplate } from '@/components/layouts/TannurPageTemplates'

export default function TestPage() {
  return (
    <FirstTemplate
      header={<MoreHeader title="Тест адаптивной сетки" />}
      column1={
        <div className="grid grid-cols-3 gap-4">
          {/* Верхний ряд: 2 блока*/}
            <div className="bg-yellow-200  md:col-span-2 h-32 flex justify-center items-center">
              Товарооборот
            </div>
              <div className="md:col-span-1  bg-green-300 h-32 flex justify-center items-center">
              Мой путь
              </div>

          {/* Нижний ряд */}
          <div className="md:col-span-1  bg-red-400 h-32 flex justify-center items-center">
            Калькулятор
          </div>
          <div className="md:col-span-2  bg-blue-500 h-32 flex justify-center items-center">
            Информация
          </div>
        </div>
      }
      column2={
        <div className="bg-gray-300 h-68 flex justify-center items-center">
          Column 2
        </div>
      }
column3={
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
    <div className="order-1 sm:order-1 sm:col-span-1 md:col-span-3 lg:col-span-2 bg-gray-400 flex justify-center items-center h-32">
      Блок 1
    </div>
    <div className="order-2 sm:order-3 sm:col-span-1 md:col-span-2 lg:col-span-2 bg-gray-200 flex justify-center items-center h-32">
      Блок 2
    </div>
    <div className="order-3 sm:order-2 sm:col-span-2 md:col-span-1 lg:col-span-2 bg-amber-50 flex justify-center items-center h-32">
      Блок 3
    </div>
    
  </div>
}

    />
  )
}