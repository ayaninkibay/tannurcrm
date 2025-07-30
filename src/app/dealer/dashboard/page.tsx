// src/app/dashboard/page.tsx
'use client'

import React, { useState } from 'react'
import SimpleHeader from '@/components/header/SimpleHeader'
import { ThirdTemplate } from '@/components/layouts/TannurPageTemplates'
import { TurnoverChart } from '@/components/TurnoverChart'

export default function DashboardPage() {
  const handleCopy = () => {
    navigator.clipboard.writeText('tannur.app/KZ848970')
    alert('Ссылка скопирована!')
  }

  const graphData = [
    { month: 'Апр', value: 1210000 },
    { month: 'Май', value: 980000 },
    { month: 'Июнь', value: 750000 },
    { month: 'Июль', value: 1120000 },
    { month: 'Авг', value: 1984321 },
    { month: 'Сен', value: 340000 },
  ]

  return (
    <ThirdTemplate
      header={
        <>
          {/* 1) Основная шапка */}
          <SimpleHeader title="Дэшборд" />
          {/* 2) Приветственный блок над колонками */}
          <div className="mt-6 bg-white p-6 rounded-2xl flex justify-between items-center">
            <span className="text-gray-700 font-medium text-base">
              С возвращением, Інжу
            </span>
            <button
              onClick={() => {}}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white bg-[#DC7C67] hover:opacity-90 transition"
            >
              <img
                src="/icons/IconShoppingWhite.png"
                className="w-3.5 h-3.5"
                alt="shop"
              />
              Ваши покупки
            </button>
          </div>
        </>
      }
       
            column1={
        // Блок 7 — Профиль
        <div className="mt-6">
          <div className="bg-white rounded-2xl p-4 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div
                className="w-[70px] h-[70px] rounded-[11px] bg-center bg-cover bg-no-repeat shrink-0"
                style={{ backgroundImage: "url('/icons/UsersAvatar1Box.png')" }}
              />
              <div className="flex flex-col text-left">
                <h3 className="text-sm font-semibold text-[#111] flex items-center gap-1">
                  Инжу Ануарбек <span className="text-green-600 text-base">✔</span>
                </h3>
                <p className="text-xs text-gray-900">KZ848970</p>
                <p className="text-xs py-1 text-gray-500 break-words">inzhu@gmail.com</p>
                <p className="text-xs py-1 text-gray-500">+7 707 700 00 02</p>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-between bg-[#F6F6F6] text-sm px-4 py-2 rounded-xl text-[#111] font-medium"
            >
              <span className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center">
                  <img src="/icons/IconGroupBlack.png" className="w-[15px] h-[15px]" />
                </div>
                Моя страница
              </span>
              <span className="text-lg">›</span>
            </button>

            <button
              onClick={() => {}}
              className="w-full flex items-center justify-between bg-[#F6F6F6] text-sm px-4 py-2 rounded-xl text-[#111] font-medium"
            >
              <span className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center">
                  <img src="/icons/Icon notifications.png" className="w-[15px] h-[15px]" />
                </div>
                Уведомления
              </span>
              <span className="text-lg">›</span>
            </button>

            <div className="w-full bg-[#DC7C67] text-white rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <img src="/icons/Iconsharewhite.png" className="w-4 h-4" />
                <p className="text-[12px] font-medium">Ссылка для приглашения</p>
              </div>
              <div className="bg-white rounded-md px-3 py-2 flex justify-between items-center">
                <span className="text-[12px] text-black">
                  <span className="text-gray-400">tannur.app/</span>KZ848970
                </span>
                <img
                  onClick={handleCopy}
                  src="/icons/Icon copy gray.png"
                  className="w-4 h-4 cursor-pointer"
                  alt="copy"
                />
              </div>
            </div>

            <div className="w-full">
              <p className="text-sm font-medium text-[#111] mb-2">Мой спонсор</p>
              <div className="relative bg-[#3D3D3D] rounded-xl p-4 pb-7 min-h-[120px]">
                <img
                  src="/icons/Icon decor.png"
                  className="absolute top-2 right-2 w-[50px] h-[50px]"
                />
                <div className="flex items-center gap-3">
                  <img
                    src="/icons/Users avatar 7.png"
                    className="w-[40px] h-[40px] rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm text-[white] flex items-center gap-1">
                      Маргұза Қағыбат
                      <img src="/icons/Icon check mark.png" className="w-[14px] h-[14px]" />
                    </p>
                    <p className="text-xs text-white flex items-center gap-1">
                      <img src="/icons/Icon crown gray.png" className="w-[12px] h-[12px]" />
                      VIP наставник
                    </p>
                  </div>
                </div>
                <div className="absolute bottom-3 left-4">
                  <button
                    onClick={() => {}}
                    className="flex items-center gap-2 bg-white border border-gray-100 rounded-full px-3 py-1 text-[10px] text-[#111]"
                  >
                    <img src="/icons/Icon profile.png" className="w-[12px] h-[12px]" />
                    Посмотреть профиль
                  </button>
                </div>
                <div className="absolute bottom-3 text-white right-4 flex items-center gap-1 text-xs">
                  <img src="/icons/Icon phone white.png" className="w-[12px] h-[12px]" />
                  <span>+7 707 700 00 02</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {}}
              className="mt-6 w-full flex items-center gap-2 text-sm text-[#3D3D3D] font-medium justify-center bg-white py-2 border-t border-[white] rounded-b-xl hover:opacity-80 transition"
            >
              <img src="/icons/IconOutRed.png" className="w-4 h-4" />
              Выйти из профиля
            </button>
          </div>
        </div>
      }
column2={
        <>
          {/* Блок 1 — Баланс */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <div className="bg-[#3D3D3D] text-white rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-2">Ваш баланс</p>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">890 020 ₸</h2>
                  <button className="text-xs text-white border border-white px-3 py-1 rounded-full hover:opacity-90 transition">
                    ↗ Вывод средств
                  </button>
                </div>
              </div>
            </div>

            {/* Блок 2 — Моя команда */}
            <div className="bg-[#E8E4FF] text-[#111] rounded-2xl p-6">
              <p className="text-sm font-medium mb-1">Моя команда</p>
              <h2 className="text-2xl font-bold mb-2">68 человек</h2>
              <button className="text-xs text-white bg-black px-3 py-1 rounded-full hover:opacity-90 transition">
                + Добавить
              </button>
              <div className="mt-3 text-xs text-gray-600">
                До следующего статуса осталось: <b>32 человека</b>
                <div className="w-full h-2 bg-white rounded-full mt-1">
                  <div className="h-full bg-[#7F62E0] rounded-full w-[60%]" />
                </div>
              </div>
            </div>

            {/* Блок 3 — Бонус */}
            <div className="bg-[#F1E6FA] text-[#111] rounded-2xl p-6">
              <p className="text-sm font-medium mb-1">Ваш бонус</p>
              <h2 className="text-2xl font-bold mb-2">15% с оборота команды</h2>
              <ul className="text-xs text-gray-600 mb-2 list-disc list-inside">
                <li>15% – с оборота команды</li>
                <li>30% – с спонсора команды</li>
                <li>50% – с спонсора договора</li>
              </ul>
              <div className="text-xs">
                До следующего статуса осталось: <b>2 386 000 ₸</b>
                <div className="w-full h-2 bg-white rounded-full mt-1">
                  <div className="h-full bg-[#B172D9] rounded-full w-[45%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Нижний ряд: Блок 4 и 5 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Блок 4 — График оборота */}
            <div className="bg-white rounded-2xl h-[370px] p-6 overflow-hidden relative">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-base text-gray-700">
                    Товарооборот за всё время
                  </p>
                  <h2 className="text-4xl text-gray-700 font-bold mt-2">
                    7 412 000 ₸
                  </h2>
                </div>
                <button className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center border border-black rounded-full hover:bg-gray-100 transition">
                  <img
                    src="/icons/Icon long arrow white.png"
                    className="w-3.5 h-3.5"
                    alt="Перейти"
                  />
                </button>
              </div>
              <div className="mt-6 h-[200px] w-full relative">
                <TurnoverChart
                  data={graphData}
                  colorBar="#e9d7d6"
                  colorLine="#db6a56"
                  lineOffset={1700000}
                />
              </div>
            </div>

            {/* Блок 5 — Новости Tannur */}
            <div className="rounded-2xl bg-white p-6 h-[370px] overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl text-gray-700">Новости Tannur</h2>
                <button className="w-10 h-10 flex items-center justify-center border border-black rounded-full hover:bg-gray-100 transition">
                  <img
                    src="/icons/Icon long arrow white.png"
                    className="w-3.5 h-3.5"
                    alt="Перейти"
                  />
                </button>
              </div>
              <div className="border-t border-gray-300 mb-4" />
              <div className="flex flex-col gap-4">
                {[
                  { title: 'Новый филиал в Алматы', icon: 'Icon cover 1.png' },
                  {
                    title: 'Путевка в Египет за 50 человек',
                    icon: 'Icon cover 2.png',
                  },
                  {
                    title: 'TNBA – Новый спикер в Академии',
                    icon: 'Icon cover 3.png',
                  },
                  {
                    title: 'Мероприятие Tannur Event 08 в Astana Arena',
                    icon: 'Icon cover 4.png',
                  },
                ].map(({ title, icon }, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={`/icons/${icon}`}
                        className="w-12 h-12 rounded-xl object-cover"
                        alt="Иконка"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">
                          {title}
                        </span>
                        <span className="text-xs text-gray-500">
                          новости
                        </span>
                      </div>
                    </div>
                    <img
                      src="/icons/buttom/DoubleIconArrowOrange.svg"
                      className="w-6.5 h-6.5"
                      alt="Подробнее"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      }
    />
  )
}

