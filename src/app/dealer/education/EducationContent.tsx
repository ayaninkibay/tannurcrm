'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const EducationContent = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');

  return (
    <div className="min-h-screen bg-[#F3F3F3] flex flex-col px-10 pt-6">
      {/* Верхняя панель */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-black">Академия Tannur</h1>

        <div className="flex items-center gap-4">
                    <button
                      type="button"
                      className="relative w-12 h-12 rounded-full bg-white flex items-center justify-center hover:opacity-80 transition cursor-pointer"
                      onClick={() => console.log('Уведомления нажаты')}
                    >
                      <img
                        src="/icons/Icon notifications.png"
                        alt="Уведомления"
                        className="w-5 h-5"
                      />
                      <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-600 rounded-full" />
                    </button>
                    <button
                      type="button"
                      className="flex items-center bg-white px-3 py-2 rounded-full hover:opacity-80 transition cursor-pointer"
                      onClick={() => console.log('Профиль нажат')}
                    >
                      <Image
                        src="/icons/Users avatar 1.png"
                        alt="Avatar"
                        width={40}
                        height={40}
                        className="rounded-full mr-4 object-cover"
                      />
                      <span className="font-medium text-black">Інжу Ануарбек</span>
                      <img
                        src="/icons/Icon arow botom.png"
                        alt="Стрелка"
                        className="w-4 h-4 ml-2"
                      />
                    </button>
                  </div>
      </div>

      {/* Разделитель */}
      <div className="h-[2px] bg-gray-900 rounded-full my-4" />


      {/* Переключатель вкладок */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[16px] font-medium text-[#111]">Знакомство с Tannur</h2>

        <div className="relative flex items-center bg-white rounded-full p-0 ">
          {/* Все курсы */}
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-10 py-2 text-sm font-medium rounded-full transition-all z-10 ${
              activeTab === 'all' ? 'bg-[#DC7C67] text-white ' : 'text-black'
            }`}
            style={{
              marginRight: activeTab === 'all' ? '-10px' : '0',
              zIndex: activeTab === 'all' ? 20 : 10,
            }}
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
            className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-full transition-all z-10 ${
              activeTab === 'saved' ? 'bg-[#DC7C67] text-white ' : 'text-black'
            }`}
            style={{
              marginLeft: activeTab === 'saved' ? '-10px' : '0',
              zIndex: activeTab === 'saved' ? 20 : 10,
            }}
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

{/* Курсы */}
<div className="grid grid-cols-4 gap-4">
  {/* Карточка 1 */}
  <div className="bg-white rounded-2xl overflow-hidden transition w-full p-2">
    <img src="/icons/preview 1.png" alt="..." className="w-full h-[180px] object-cover rounded-t-xl" />
    <div className="px-4 pt-3 pb-4 relative">
      <span className="absolute -top-3 left-4 bg-black text-white text-xs px-3 py-1 rounded-full">
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
    <img src="/icons/preview 2.png" alt="..." className="w-full h-[180px] object-cover rounded-t-xl" />
    <div className="px-4 pt-3 pb-4 relative">
      <span className="absolute -top-3 left-4 bg-black text-white text-xs px-3 py-1 rounded-full">
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
    <img src="/icons/preview 3.png" alt="..." className="w-full h-[180px] object-cover rounded-t-xl" />
    <div className="px-4 pt-3 pb-4 relative">
      <span className="absolute -top-3 left-4 bg-black text-white text-xs px-3 py-1 rounded-full">
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
      <span className="absolute -top-3 left-4 bg-black text-white text-xs px-3 py-1 rounded-full">
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





      {/* Категории курсов */}
      <div className="mt-10">
        <div className="flex items-center gap-2 mb-4">
          <img src="/icons/Icon apps.png" alt="apps" className="w- h-4" />
          <h2 className="text-sm font-semibold text-black">Категория курсов</h2>
        </div>

   <div className="grid grid-cols-4 gap-4">
  {/* Категория 1 */}
  <div className="relative bg-[#2E2E2E] text-white rounded-2xl p-5 cursor-pointer hover:opacity-90 transition min-h-[120px] flex flex-col justify-end">
    {/* Декоративная иконка в углу */}
    <img
      src="/icons/Icon tannur top gray.png"
      alt="Tannur logo"
      className="absolute bottom-3 right-3 w-[85px] h-[50px] opacity-20 pointer-events-none"
    />

    {/* Контент, сдвинутый вниз */}
    <div>
      <p className="text-base font-semibold">Знакомство с Tannur</p>
      <div className="flex items-center gap-1 mt-1 text-sm text-white">
        <img src="/icons/Icon folder white.png" alt="icon" className="w-4 h-4" />
        <span>3 программы</span>
      </div>
    </div>
  </div>
   <div className="relative bg-[#36544E] text-white rounded-2xl p-5 cursor-pointer hover:opacity-90 transition min-h-[120px] flex flex-col justify-end">
   

    {/* Контент, сдвинутый вниз */}
    <div>
      <p className="text-base font-semibold">Маркетинговая стратегия</p>
      <div className="flex items-center gap-1 mt-1 text-sm text-white">
        <img src="/icons/Icon folder white.png" alt="icon" className="w-4 h-4" />
        <span>7 программы</span>
      </div>
    </div>
  </div>
   <div className="relative bg-[#5C4761] text-white rounded-2xl p-5 cursor-pointer hover:opacity-90 transition min-h-[120px] flex flex-col justify-end">


    {/* Контент, сдвинутый вниз */}
    <div>
      <p className="text-base font-semibold">Менеджер по продажам</p>
      <div className="flex items-center gap-1 mt-1 text-sm text-white">
        <img src="/icons/Icon folder white.png" alt="icon" className="w-4 h-4" />
        <span>3 программы</span>
      </div>
    </div>
  </div>
   <div className="relative bg-[#734344] text-white rounded-2xl p-5 cursor-pointer hover:opacity-90 transition min-h-[120px] flex flex-col justify-end">


    {/* Контент, сдвинутый вниз */}
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
    </div>
  );
};

export default EducationContent;
