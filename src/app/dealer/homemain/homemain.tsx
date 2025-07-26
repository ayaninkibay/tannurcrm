'use client';

import Image from 'next/image';
import React from 'react';
import Link from 'next/link';

export default function homemain() {
  return (
    <main className="w-full min-h-screen bg-[#F6F6F6] p-6">
      {/* Верхний блок */}
      {/* Top Navigation */}
<section className="flex justify-between items-start mb-6">
  {/* Навигационные кнопки */}
<div className="flex items-center gap-4 bg-white p-1 rounded-full shadow-sm">
  {[
    { name: 'Главная', href: '/', exact: true },
    { name: 'Тарифы', href: '/tariffs' },
    { name: 'Компания', href: '/company' },
    { name: 'Завод', href: '/factory' },
    { name: 'Экскурсия', href: '/tour' },
    { name: 'Документы', href: '/documents' },
    { name: 'Админ', href: '/admin/adashboard' }
  ].map((tab, i) => (
    <Link
      key={i}
      href={tab.href}
      className={`px-4 py-2 text-sm rounded-full transition ${
        tab.href === '/admin/adashboard'
          ? 'hover:bg-gray-100 text-black' // по умолчанию
          : 'hover:bg-gray-100 text-black'
      }`}
    >
      {tab.name}
    </Link>
  ))}
</div>


  {/* Правая часть: уведомления и профиль */}
  <div className="flex items-center gap-4">
    {/* Кнопка уведомлений (замени на свой готовый код при необходимости) */}
    <button className="w-10 h-10 flex items-center justify-center bg-white rounded-full relative hover:opacity-80 transition">
      <img src="/icons/Icon notifications.png" className="w-4 h-4" alt="уведомления" />
      <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-600 rounded-full" />
    </button>

    {/* Профиль (тоже замени при необходимости) */}
    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full">
      <img
        src="/ICons/Users avatar 1.png"
        alt="User"
        className="w-6 h-6 object-cover rounded-full"
      />
      <span className="text-sm font-medium text-[#111]">Инжу Ануарбек</span>
      <span className="text-lg">›</span>
    </div>
  </div>
</section>

{/* Дата справа */}
<div className="flex justify-between items-center mb-2">
  <div />
  <div className="text-right">
    <p className="text-xs text-gray-500">Понедельник</p>
    <p className="text-2xl font-semibold text-black">8 августа</p>
  </div>
</div>

{/* Горизонтальная линия */}
<hr className="border-gray-200 mb-6" />

      <section className="mb-6">
        <h1 className="text-2xl font-semibold text-[#111] mb-1">
          Добро пожаловать в Tannur CRM
        </h1>
        <p className="text-sm text-gray-500">
          It is a long established fact that a reader will be distracted by the readable content.
        </p>
      </section>

      {/* Инфо-блоки */}
      <section className="grid grid-cols-3 gap-4 mb-6">
        {/* Карточка 1: Тарифы Tannur */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-2">Тарифы Tannur</p>
          <p className="text-xs text-gray-400 mb-4">
            It is a long established fact that a reader will be distracted by the readable content.
          </p>
          <div className="flex items-center gap-2">
            <span className="bg-[#8F6AFD] text-white text-xs rounded-full px-3 py-1">Standard</span>
            <span className="bg-[#527BFF] text-white text-xs rounded-full px-3 py-1">Business</span>
            <span className="bg-[#BB781E] text-white text-xs rounded-full px-3 py-1">VIP</span>
          </div>
        </div>

        {/* Карточка 2: Как заработать */}
        <div className="bg-white rounded-xl p-4 shadow-sm relative overflow-hidden">
          <p className="text-sm text-gray-500 mb-2">Как заработать с Tannur</p>
          <p className="text-xs text-gray-400 mb-4">
            It is a long established fact that a reader will be distracted by the readable content.
          </p>
          <button className="text-xs bg-[#E2725B] text-white px-4 py-2 rounded-full">
            Открыть стратегию
          </button>
          <Image
            src="/icons/IconStongs.png"
            alt="arrow"
            width={50}
            height={50}
            className="absolute bottom-2 right-2"
          />
        </div>

        {/* Карточка 3: ТОП лидеры */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-2">ТОП Лидеры</p>
          <p className="text-xs text-gray-400 mb-4">
            It is a long established fact that a reader will be distracted by the readable content.
          </p>
          <button className="text-xs text-[#111] font-semibold underline">
            Открыть список
          </button>
        </div>
      </section>

      {/* Новости */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#111]">Новости Tannur</h2>
          <div className="flex gap-2">
            <span className="bg-[#E2725B] text-white text-xs px-3 py-1 rounded-full">Новости</span>
            <span className="bg-gray-200 text-black text-xs px-3 py-1 rounded-full">Акции</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {/* Карточки новостей */}
          {[
            {
              title: 'Новый филиал в Алматы',
              date: '22.07.2025',
              image: '/icons/news1.png',
            },
            {
              title: 'Путевка в Египет за 50 человек',
              date: '22.07.2025',
              image: '/icons/news2.png',
            },
            {
              title: 'TNBA — Новый спикер в Академии',
              date: '22.07.2025',
              image: '/Icons/news3.png',
            },
            {
              title: 'Мероприятие в Astana Arena',
              date: '22.07.2025',
              image: '/Icons/news4.png',
            },
          ].map((card, index) => (
            <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <img src={card.image} alt={card.title} className="w-full h-[150px] object-cover" />
              <div className="p-4">
                <h3 className="text-sm font-medium text-[#111] mb-2">{card.title}</h3>
                <p className="text-xs text-gray-400">{card.date}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
