'use client'

import React from 'react'
import MoreHeader from '@/components/header/MoreHeader'
import { FirstTemplate } from '@/components/layouts/TannurPageTemplates'

export default function TestPage() {
  return (
    <FirstTemplate
      header={<MoreHeader title="Тест адаптивной сетки" />}
      column1={
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Верхний ряд: 2 блока → в ряд до lg, потом вниз */}
          <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xxl:grid-cols-1 gap-4 md:col-span-6 order-1">
            <div className="bg-yellow-200 h-32 flex justify-center items-center">
              Товарооборот
            </div>
            <div className="bg-green-300 h-32 flex justify-center items-center">
              Моя команда
            </div>
              <div className="bg-green-300 h-32 flex justify-center items-center">
              Мой путь
              </div>
          </div>

          {/* Нижний ряд */}
          <div className="md:col-span-2 order-2 bg-red-400 h-32 flex justify-center items-center">
            Калькулятор
          </div>
          <div className="md:col-span-4 order-3 bg-blue-500 h-32 flex justify-center items-center">
            Информация
          </div>
        </div>
      }
      column2={
        <div className="bg-gray-300 xxl:bg-red-500 border border-black xxl:border-red-500 h-68 flex justify-center items-center">
          Column 2
        </div>
      }
      column3={
        <div className="bg-gray-400 h-32 flex justify-center items-center">
          Column 3
        </div>
      }
    />
  )
}
