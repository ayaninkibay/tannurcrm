'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import MoreHeader from '@/components/header/MoreHeader';

export default function EducationContent() {
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');

  return (
    <div className="min-h-screen bg-[#F3F3F3] flex p-2 md:p-6 flex-col ">
      <MoreHeader title="Академия TNBA" />

      {/* Категории курсов */}
        <div className="mt-8">
         {/* Категории курсов */}
<div className="">
  {/* Заголовок и переключатель на одной линии */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
    <div className="flex items-center gap-2">
      <img src="/icons/Icon apps.png" alt="apps" className="w-4 h-4" />
      <h2 className="text-lg font-medium text-black">Категория курсов</h2>
    </div>

    {/* Переключатель вкладок */}
    <div className="relative flex items-center bg-white rounded-full overflow-hidden">
      {/* Все курсы */}
      <button
        onClick={() => setActiveTab('all')}
        className={`flex items-center gap-2 px-6 py-2 text-sm font-medium transition-all ${
          activeTab === 'all'
            ? 'bg-[#DC7C67] text-white z-20'
            : 'text-black z-10'
        }`}
      >
        <img
          src={
            activeTab === 'all'
              ? '/icons/Icon vector white.png'
              : '/icons/Icon vector black.png'
          }
          alt="Все курсы"
          className="w-3 h-3"
        />
        Все курсы
      </button>

      {/* Мои сохраненные */}
      <button
        onClick={() => setActiveTab('saved')}
        className={`flex items-center gap-2 px-6 py-2 text-sm font-medium transition-all ${
          activeTab === 'saved'
            ? 'bg-[#DC7C67] text-white z-20'
            : 'text-black z-10'
        }`}
      >
        <img
          src={
            activeTab === 'saved'
              ? '/icons/Icon apps white.png'
              : '/icons/Icon apps black.png'
          }
          alt="Мои сохраненные"
          className="w-3 h-3"
        />
        Мои сохраненные
      </button>
    </div>
  </div>
</div>


        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Категория 1 */}
          <div className="relative bg-[#2E2E2E] text-white rounded-2xl p-5 cursor-pointer hover:opacity-90 transition min-h-[120px] flex flex-col justify-end">
            <div>
              <p className="text-base font-semibold">Знакомство с Tannur</p>
              <div className="flex items-center gap-1 mt-1 text-sm text-white">
                <img src="/icons/Icon folder white.png" alt="icon" className="w-4 h-4" />
                <span>3 программы</span>
              </div>
            </div>
          </div>

          <div className="relative bg-[#36544E] text-white rounded-2xl p-5 cursor-pointer hover:opacity-90 transition min-h-[120px] flex flex-col justify-end">
            <div>
              <p className="text-base font-semibold">Маркетинговая стратегия</p>
              <div className="flex items-center gap-1 mt-1 text-sm text-white">
                <img src="/icons/Icon folder white.png" alt="icon" className="w-4 h-4" />
                <span>7 программы</span>
              </div>
            </div>
          </div>

          <div className="relative bg-[#5C4761] text-white rounded-2xl p-5 cursor-pointer hover:opacity-90 transition min-h-[120px] flex flex-col justify-end">
            <div>
              <p className="text-base font-semibold">Менеджер по продажам</p>
              <div className="flex items-center gap-1 mt-1 text-sm text-white">
                <img src="/icons/Icon folder white.png" alt="icon" className="w-4 h-4" />
                <span>3 программы</span>
              </div>
            </div>
          </div>

          <div className="relative bg-[#734344] text-white rounded-2xl p-5 cursor-pointer hover:opacity-90 transition min-h-[120px] flex flex-col justify-end">
            <div>
              <p className="text-base font-semibold">Как продвать продукцию?</p>
              <div className="flex items-center gap-1 mt-1 text-sm text-white">
                <img src="/icons/Icon folder white.png" alt="icon" className="w-4 h-4" />
                <span>3 программы</span>
              </div>
            </div>
          </div>
        </div>
      </div>

       <h2 className="text-[18px] font-medium mb-5 mt-5 text-[#111]">Знакомство с Tannur</h2>


      {/* Курсы */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Карточка 1 */}
        <div className="bg-white rounded-2xl overflow-hidden transition w-full p-2">
          <img src="/icons/preview 1.png" alt="..." className="w-full h-[180px] rounded-2xl object-cover rounded-t-xl" />
          <div className="px-4 pt-3 pb-4 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-3 py-1 rounded-full">
              Знакомство
            </span>
            <h3 className="text-base font-medium text-[#111] mt-2">
              Знакомство с продуктами Tannur
            </h3>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <img src="/icons/Icon docs gray.png" alt="Lessons" className="w-4 h-4" />
                8 уроков
              </div>
              <button className="w-8 h-8 rounded-lg bg-[#DC7C67] flex items-center justify-center">
                <img src="/icons/Icon arow botom white.png" alt="Перейти" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Карточка 2 */}
        <div className="bg-white rounded-2xl overflow-hidden transition w-full p-2">
          <img src="/icons/preview 2.png" alt="..." className="w-full h-[180px] object-cover rounded-2xl rounded-t-xl" />
          <div className="px-4 pt-3 pb-4 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-3 py-1 rounded-full">
              Знакомство
            </span>
            <h3 className="text-base font-medium text-[#111] mt-2">
              Маркетинговая стратегия 2.0
            </h3>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <img src="/icons/Icon docs gray.png" alt="Lessons" className="w-4 h-4" />
                8 уроков
              </div>
              <button className="w-8 h-8 rounded-lg bg-[#DC7C67] flex items-center justify-center">
                <img src="/icons/Icon arow botom white.png" alt="Перейти" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Карточка 3 */}
        <div className="bg-white rounded-2xl overflow-hidden transition w-full p-2">
          <img src="/icons/preview 3.png" alt="..." className="w-full h-[180px] object-cover rounded-2xlrounded-t-xl" />
          <div className="px-4 pt-3 pb-4 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-3 py-1 rounded-full">
              Знакомство
            </span>
            <h3 className="text-base font-medium text-[#111] mt-2">
              Уходовый набор вместе с Інжу Ануарбек
            </h3>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <img src="/icons/Icon docs gray.png" alt="Lessons" className="w-4 h-4" />
                8 уроков
              </div>
              <button className="w-8 h-8 rounded-lg bg-[#DC7C67] flex items-center justify-center">
                <img src="/icons/Icon arow botom white.png" alt="Перейти" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Карточка 4 */}
        <div className="bg-white rounded-2xl overflow-hidden transition w-full p-2">
          <img src="/icons/preview 4.png" alt="..." className="w-full h-[180px] object-cover rounded-t-xl" />
          <div className="px-4 pt-3 pb-4 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-3 py-1 rounded-full">
              Знакомство
            </span>
            <h3 className="text-base font-medium text-[#111] mt-2">
              Уходовый набор вместе с Інжу Ануарбек
            </h3>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <img src="/icons/Icon docs gray.png" alt="Lessons" className="w-4 h-4" />
                8 уроков
              </div>
              <button className="w-8 h-8 rounded-lg bg-[#DC7C67] flex items-center justify-center">
                <img src="/icons/Icon arow botom white.png" alt="Перейти" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
