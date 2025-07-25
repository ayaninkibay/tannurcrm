'use client';

import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, Tooltip, BarChart, Bar, ResponsiveContainer, Cell,
} from 'recharts';

export default function DashboardPage() {
  const handleCopy = () => {
    navigator.clipboard.writeText('tannur.app/KZ848970');
    alert('Ссылка скопирована!');
  };

  const graphData = [
    { month: 'Апр', value: 1210000 },
    { month: 'Май', value: 980000 },
    { month: 'Июнь', value: 750000 },
    { month: 'Июль', value: 1120000 },
    { month: 'Авг', value: 1984321 },
    { month: 'Сен', value: 340000 },
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(4);

  return (
    <div className="w-full mt-6 flex flex-col gap-6">

      {/* Верхний блок: Дешборд и кнопки */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-black">Дэшборд</h1>
        <div className="flex gap-3">
          <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:opacity-80 transition" onClick={() => {}}>
            <img src="/icons/Icon notifications.png" alt="notif" className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-600 rounded-full" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:opacity-80 transition" onClick={() => {}}>
            <img src="/icons/Icon profile.png" alt="profile" className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Блок 0 — Приветствие */}
      <div className="bg-white p-6 rounded-2xl flex justify-between items-center">
        <span className="text-gray-700 font-medium text-base">С возвращением, Інжу</span>
        <button className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white bg-[#DC7C67] hover:opacity-90 transition" onClick={() => {}}>
          <img src="/icons/IconShoppingWhite.png" className="w-3.5 h-3.5" alt="shop" />
          Ваши покупки
        </button>
      </div>

      {/* Основная сетка */}
      <div className="grid grid-cols-4 gap-6 w-full">

        {/* Блок 1 — Баланс */}
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
          <button className="text-xs text-white bg-black px-3 py-1 rounded-full hover:opacity-90 transition">+ Добавить</button>
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

        {/* Блок 7 — Профиль */}
        <div className="bg-white rounded-2xl p-4 flex flex-col gap-4 row-span-2">
          <div className="flex flex-col gap-6">
            <div className="w-[70px] h-[70px] rounded-[11px] bg-center bg-cover bg-no-repeat" style={{ backgroundImage: "url('/ICons/UsersAvatar1Box.png')" }} />
            <div className="flex flex-col text-left">
              <h3 className="text-sm font-semibold text-[#111] flex items-center gap-1">Инжу Ануарбек <span className="text-green-600 text-base">✔</span></h3>
              <p className="text-xs text-gray-900">KZ848970</p>
              <p className="text-xs p-1 text-gray-500">inzhu@gmail.com</p>
              <p className="text-xs p-1 text-gray-500">+7 707 700 00 02</p>
            </div>
          </div>

          <button onClick={() => {}} className="w-full flex items-center justify-between bg-[#F6F6F6] text-sm px-4 py-2 rounded-xl text-[#111] font-medium">
            <span className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center">
                <img src="/icons/IconGroupBlack.png" className="w-[15px] h-[15px]" />
              </div>
              Моя страница
            </span>
            <span className="text-lg">›</span>
          </button>

          <button onClick={() => {}} className="w-full flex items-center justify-between bg-[#F6F6F6] text-sm px-4 py-2 rounded-xl text-[#111] font-medium">
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
              <img onClick={handleCopy} src="/icons/Icon copy gray.png" className="w-4 h-4 cursor-pointer" alt="copy" />
            </div>
          </div>

          <div className="w-full">
            <p className="text-sm font-medium text-[#111] mb-2">Мой спонсор</p>
            <div className="relative bg-[#3D3D3D] rounded-xl p-4 pb-7 min-h-[120px]">
              <img src="/icons/Icon decor.png" className="absolute top-2 right-2 w-[50px] h-[50px]" />
              <div className="flex items-center gap-3">
                <img src="/icons/Users avatar 7.png" className="w-[40px] h-[40px] rounded-full object-cover" />
                <div>
                  <p className="text-sm text-[white] flex items-center gap-1">Маргұза Қағыбат
                    <img src="/icons/Icon check mark.png" className="w-[14px] h-[14px]" />
                  </p>
                  <p className="text-xs text-white flex items-center gap-1">
                    <img src="/icons/Icon crown gray.png" className="w-[12px] h-[12px]" />
                    VIP наставник
                  </p>
                </div>
              </div>
              <div className="absolute bottom-3 left-4">
                <button onClick={() => {}} className="flex items-center gap-2 bg-white border border-gray-100 rounded-full px-3 py-1 text-[10px] text-[#111]">
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

          <button onClick={() => {}} className="mt-6 w-full flex items-center gap-2 text-sm text-[#3D3D3D] font-medium justify-center bg-white py-2 border-t border-[white] rounded-b-xl hover:opacity-80 transition">
            <img src="/icons/IconOutRed.png" className="w-4 h-4" />
            Выйти из профиля
          </button>
        </div>

        {/* Нижний ряд: Блок 4 и 5 */}
<div className="col-span-3 grid grid-cols-2 gap-6">
  {/* Блок 4 — График оборота */}
     <div className="bg-white rounded-2xl h-[370px] p-6 overflow-hidden relative">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-base text-gray-700">Товарооборот за всё время</p>
          <h2 className="text-4xl text-gray-700 font-bold mt-2">7 412 000 ₸</h2>
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
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={graphData}
onMouseMove={(state) => {
  if (state.isTooltipActive) {
    const index = Number(state.activeTooltipIndex);
    setActiveIndex(!isNaN(index) ? index : null);
  }
}}

            onMouseLeave={() => setActiveIndex(null)}
            margin={{ top: 50, right: 30, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 14, fill: "#555" }}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              content={({ active, payload }) =>
                active && payload && payload.length ? (
                  <div className="relative z-20">
                    <div className="bg-gray-900 text-white text-sm px-4 py-1 rounded-full">
                      {payload[0].value.toLocaleString()} ₸
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-[-6px] w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-gray-900" />
                    </div>
                  </div>
                ) : null
              }
            />
            <Bar dataKey="value" radius={[8, 8, 8, 8]}>
              {graphData.map((entry, index) => (
                <Cell
                  key={`bar-${index}`}
                  fill={index === activeIndex ? "#db6a56" : "#e9d7d6"}
                />
              ))}
            </Bar>
            <Line
              type="monotone"
              dataKey="value"
              stroke="#db6a56"
              strokeWidth={2}
              dot={false}
              className="z-10"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

  {/* Блок 5 — Новости Tannur */}
  <div className="rounded-2xl bg-white p-6 h-[370px] overflow-hidden shadow-md">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl text-gray-700">Новости Tannur</h2>
      <button className="w-10 h-10 flex items-center justify-center border border-black rounded-full hover:bg-gray-100 transition">
        <img src="/icons/Icon long arrow white.png" className="w-3.5 h-3.5" alt="Перейти" />
      </button>
    </div>
    <div className="border-t border-gray-300 mb-4" />
    <div className="flex flex-col gap-4">
      {[
        { title: "Новый филиал в Алматы", icon: "Icon cover 1.png" },
        { title: "Путевка в Египет за 50 человек", icon: "Icon cover 2.png" },
        { title: "TNBA – Новый спикер в Академии", icon: "Icon cover 3.png" },
        { title: "Мероприятие Tannur Event 08 в Astana Arena", icon: "Icon cover 4.png" }
      ].map(({ title, icon }, index) => (
        <div className="flex items-center justify-between" key={index}>
          <div className="flex items-center gap-3">
            <img src={`/icons/${icon}`} className="w-12 h-12 rounded-xl object-cover" alt="Иконка" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">{title}</span>
              <span className="text-xs text-gray-500">новости</span>
            </div>
          </div>
          <img src="/icons/Ikon arow botom.png" className="w-6.5 h-6.5" alt="Подробнее" />
        </div>
      ))}
    </div>
  </div>
</div>

      </div>
    </div>
  );
}
