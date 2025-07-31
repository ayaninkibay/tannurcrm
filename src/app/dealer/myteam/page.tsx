'use client'

import { useState } from 'react'
import React from 'react'
import { FirstTemplate } from '@/components/layouts/TannurPageTemplates'
import Image from 'next/image'
import BonusTableBlock from '@/components/blocks/BonusTableBlock'
import Footer from '@/components/Footer';
import MoreHeader from '@/components/header/MoreHeader'





export default function TeamPage() {
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'products'>('subscriptions')



  return (
    <FirstTemplate
      header={<MoreHeader title="Моя команда" />}
      column1={
        <div className="w-full flex flex-col lg:flex-row gap-4">
          {/* Левая колонка */}
          <div className="flex flex-col gap-4 w-full lg:w-2/5">
            {/* Команда */}
<div className="bg-white rounded-xl p-6 flex-1 h-full flex flex-col justify-between">
  {/* Верхняя часть */}
  <div className="flex justify-between items-start">
    <div className="flex flex-col justify-start">
      <p className="text-sm text-gray-500 mb-1">Инжу, в вашей команде</p>
      <h2 className="text-4xl font-bold text-black mb-2">68 человек</h2>
    </div>
    <div className="relative w-[200px] h-[130px]">
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
        <line x1="100" y1="15" x2="80" y2="50" stroke="#e38c8c" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="80" y1="50" x2="110" y2="70" stroke="#e38c8c" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="60" y1="100" x2="110" y2="70" stroke="#e38c8c" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="160" y1="100" x2="110" y2="70" stroke="#e38c8c" strokeWidth="2" strokeDasharray="4 4" />
      </svg>
      <img src="/icons/Users avatar 1.png" className="w-9 h-9 rounded-full border-2 border-red-300 absolute top-[2px] left-[90px]" />
      <img src="/icons/Users avatar 2.png" className="w-9 h-9 rounded-full border-2 border-red-300 absolute top-[40px] left-[60px]" />
      <img src="/icons/Users avatar 3.png" className="w-11 h-11 rounded-full border-2 border-black absolute top-[60px] left-[100px] z-10" />
      <img src="/icons/Users avatar 5.png" className="w-9 h-9 rounded-full border-2 border-red-300 absolute top-[95px] left-[50px]" />
      <img src="/icons/Users avatar 4.png" className="w-9 h-9 rounded-full border-2 border-red-300 absolute top-[92px] left-[160px]" />
    </div>
  </div>

  {/* Нижняя часть */}
  <div className="mt-4">
    <p className="text-sm text-gray-500 mb-2">
      До награды <span className="text-black font-semibold">“Автомобиль Tannur”</span> осталось{' '}
      <span className="text-black font-semibold">32 человек</span>
    </p>
    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
      <div className="bg-[#5C6AC4] h-full" style={{ width: '68%' }} />
    </div>
  </div>
</div>


            {/* Товарооборот */}
<div className="bg-white rounded-xl p-6 flex-1 h-full flex flex-col justify-between">
  {/* Верхняя часть */}
  <div className="flex justify-between items-start mb-4">
    <div className="space-y-3">
      <p className="text-sm text-gray-600">Товарооборот команды</p>
      <h2 className="text-2xl text-gray-600 font-bold">7 412 000 ₸</h2>
      <ul className="text-xs text-gray-500 leading-5">
        <li>15% — с оборота команды</li>
        <li>30% — с скидка в магазине</li>
        <li>50% — с подписки дилеров</li>
      </ul>
    </div>
    <img src="/icons/IconStongs.png" alt="Рост" className="w-20 h-20" />
  </div>

  {/* Нижняя часть */}
  <div className="mt-4">
    <p className="text-xs text-gray-500 mb-2">
      До следующего статуса осталось <span className="text-black font-semibold">2 388 000 ₸</span>
    </p>
    <div className="relative w-full h-4 rounded-full bg-gray-200 overflow-hidden">
      <div className="absolute top-0 left-0 h-full bg-[#C679F7] w-[74%] rounded-full px-3 flex items-center">
        <span className="text-[10px] text-white font-semibold leading-none">7 412 000 ₸</span>
      </div>
    </div>
  </div>
</div>

          </div>

          {/* Правая колонка */}
          <div className="flex flex-col gap-4 w-full lg:w-3/5">
<div className="bg-white rounded-xl p-6 flex-1">
    <BonusTableBlock />
</div>


            <div className="rounded-xl flex-1 flex items-center justify-center bg-neutral-700">
              <div className="text-white rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Добавить диллера</h3>
                  <p className="text-sm text-white/70 max-w-[80%]">
                    It is a long established fact that a reader will be distracted by the readable content.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => alert('Аватар нажат')}
                    className="w-10 h-10 rounded-full border-2 border-white overflow-hidden flex-shrink-0"
                  >
                    <img src="/Icons/Users avatar 1.png" alt="Аватар" className="w-full h-full object-cover" />
                  </button>
                  <button
                    onClick={() => alert('Добавить нажат')}
                    className="flex items-center gap-2 bg-white text-black px-8 py-2 rounded-full text-sm hover:bg-gray-100 transition"
                  >
                    <img src="/icons/IcionUserAdd.png" alt="user" className="w-4 h-4" />
                    Добавить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      }




column2={
  <div className="bg-white rounded-xl p-4 flex flex-col gap-4 h-full w-full">
    {/* Аватар + информация */}
    <div className="flex items-center gap-4">
      <div
        className="w-[70px] h-[70px] rounded-[11px] bg-center bg-cover bg-no-repeat"
        style={{
          backgroundImage: "url('/ICons/UsersAvatar1Box.png')",
        }}
      />
      <div className="flex flex-col text-left">
        <h3 className="text-sm font-semibold text-[#111] flex items-center gap-1">
          Инжу Ануарбек
          <span className="text-green-600 text-base">✔</span>
        </h3>
        <p className="text-xs text-gray-900">KZ848970</p>
        <p className="text-xs p-1 text-gray-500">inzhu@gmail.com</p>
        <p className="text-xs p-1 text-gray-500">+7 707 700 00 02</p>
      </div>
    </div>

    {/* Кнопка "Моя страница" */}
    <button className="w-full flex items-center justify-between bg-[#F6F6F6] text-sm px-4 py-2 rounded-xl text-[#111] font-medium">
      <span className="flex items-center gap-2">
        <img
          src="/icons/IconGroupBlack.png"
          alt="user"
          className="w-[35px] h-[35px]"
        />
        Моя страница
      </span>
      <span className="text-lg">›</span>
    </button>

    {/* Ссылка для приглашения */}
    <div className="w-full bg-[#DC7C67] text-white rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <img
          src="/icons/Iconsharewhite.png"
          className="w-4 h-4"
          alt="Поделиться"
        />
        <p className="text-[12px] font-medium">Ссылка для приглашения</p>
      </div>
      <div className="bg-white rounded-md px-3 py-2 flex justify-between items-center">
        <span className="text-[12px] text-black">
          <span className="text-gray-400">tannur.app/</span>
          <span className="font-semibold">KZ848970</span>
        </span>
        <img
          src="/icons/Icon copy gray.png"
          className="w-4 h-4"
          alt="Копировать"
        />
      </div>
    </div>

    {/* Мой спонсор */}
    <div className="w-full">
      <p className="text-sm font-medium text-[#111] mb-2">Мой спонсор</p>
      <div className="relative bg-[#F6F6F6] rounded-xl p-4 pb-7 min-h-[120px]">
        <img
          src="/icons/Icon decor.png"
          alt="decor"
          className="absolute top-2 right-2 w-[50px] h-[50px]"
        />
        <div className="flex items-center gap-3">
          <img
            src="/icons/Users avatar 7.png"
            alt="sponsor"
            className="w-[40px] h-[40px] rounded-full object-cover"
          />
          <div>
            <p className="text-sm text-[#111] flex items-center gap-1">
              Маргұза Қағыбат
              <img
                src="/icons/Icon check mark.png"
                alt="check"
                className="w-[14px] h-[14px]"
              />
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <img
                src="/icons/IconCrownBlack.png"
                alt="crown"
                className="w-[12px] h-[12px]"
              />
              VIP наставник
            </p>
          </div>
        </div>
        <div className="absolute bottom-3 left-4">
          <button className="flex items-center gap-2 bg-white border border-gray-100 rounded-full px-3 py-1 text-[10px] text-[#111]">
            <img
              src="/icons/Icon profile.png"
              alt="user"
              className="w-[12px] h-[12px]"
            />
            Посмотреть профиль
          </button>
        </div>
        <div className="absolute bottom-3 right-4 flex items-center gap-1 text-xs text-[#111]">
          <img
            src="/icons/Icon phone.png"
            alt="phone"
            className="w-[12px] h-[12px]"
          />
          <span>+7 707 700 00 02</span>
        </div>
      </div>
    </div>
  </div>
}

column3={
  <div className="flex flex-col gap-4">
    {/* Заголовок и переключатели */}
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-medium text-[#111]">Древо команды</h2>
      <div className="relative flex items-center bg-white rounded-full p-0">
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-full transition-all z-10 ${
            activeTab === 'subscriptions' ? 'bg-[#DC7C67] text-white' : 'text-black'
          }`}
          style={{
            marginRight: activeTab === 'subscriptions' ? '-8px' : '0',
            zIndex: activeTab === 'subscriptions' ? 20 : 10,
          }}
        >
          <Image
            src={
              activeTab === 'subscriptions'
                ? '/icons/IconMapWhite.png'
                : '/icons/IconMapBlack.png'
            }
            alt="Карта"
            width={16}
            height={16}
          />
          Карта
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-full transition-all z-10 ${
            activeTab === 'products' ? 'bg-[#DC7C67] text-white' : 'text-black'
          }`}
          style={{
            marginLeft: activeTab === 'products' ? '-8px' : '0',
            zIndex: activeTab === 'products' ? 20 : 10,
          }}
        >
          <Image
            src={
              activeTab === 'products'
                ? '/icons/IconAlignWhite.png'
                : '/icons/IconAlignBlack.png'
            }
            alt="Список"
            width={16}
            height={16}
          />
          Список
        </button>
      </div>
    </div>

    {/* Блок под карту/список */}
    <div className="bg-white rounded-xl w-full h-[300px]" />
  </div>
  
}

    />
    
  )
}
