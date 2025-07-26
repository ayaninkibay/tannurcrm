'use client';

import Image from 'next/image';

export default function Warehouse() {
  const products = [
    {
      name: '9-А Шампунь+ Tannur',
      shopPrice: '12 990 ₸',
      dealerPrice: '9 900 ₸',
      quantity: 897,
      image: '/images/product1.png'
    },
    {
      name: 'Отбеливающая маска Tannur',
      shopPrice: '5 990 ₸',
      dealerPrice: '3 900 ₸',
      quantity: 231,
      image: '/images/product2.png'
    },
    {
      name: 'Гелевая маска Tannur',
      shopPrice: '4 990 ₸',
      dealerPrice: '1 900 ₸',
      quantity: 157,
      image: '/images/product3.png'
    },
    {
      name: 'Кусач 3 в 1 Tannur',
      shopPrice: '7 990 ₸',
      dealerPrice: '6 900 ₸',
      quantity: 321,
      image: '/images/product4.png'
    },
    {
      name: 'Набор из 6 кремов Tannur',
      shopPrice: '8 990 ₸',
      dealerPrice: '6 900 ₸',
      quantity: 585,
      image: '/images/product5.png'
    },
    {
      name: '9-А Бальзам для волос Tannur',
      shopPrice: '11 990 ₸',
      dealerPrice: '8 900 ₸',
      quantity: 870,
      image: '/images/product6.png'
    },
  ];

  return (
    <div className="flex flex-col bg-[#F6F6F6] min-h-screen pl-[140px]">
      {/* Верхняя панель */}
      <div className="w-full flex justify-end items-center gap-4 px-6 py-4">
        {/* Уведомления */}
        <button onClick={() => {}} className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center hover:opacity-80 transition">
          <Image src="/icons/Icon notifications.png" alt="уведомления" width={16} height={16} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-600 rounded-full" />
        </button>

        {/* Профиль */}
        <button onClick={() => {}} className="flex items-center gap-2 bg-white px-3 py-1 rounded-full hover:opacity-90 transition cursor-pointer">
          <img src="/avatars/user1.png" alt="User" className="w-6 h-6 rounded-full object-cover" />
          <span className="text-sm font-medium text-[#111] whitespace-nowrap">Маргоза Каныбат</span>
        </button>

        {/* Кнопка выхода */}
        <button onClick={() => {}} className="hover:opacity-80 transition">
          <Image src="/icons/logout-red.png" alt="выйти" width={20} height={20} />
        </button>
      </div>

      {/* Основной контент */}
      <div className="flex gap-6 p-6">
        {/* Левая колонка - контент */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#111] mb-1">Склад Tannur</h1>
          <p className="text-sm text-gray-400 mb-6">It is a long established fact that.</p>

          {/* Статистика */}
          <div className="flex gap-4 mb-6">
            <div className="bg-white p-6 rounded-xl flex-1">
              <p className="text-sm text-gray-400 mb-1">📦 Товары на складе</p>
              <h2 className="text-3xl font-bold text-[#111]">8321 <span className="text-base font-medium text-gray-400">штук</span></h2>
            </div>
            <div className="bg-white p-6 rounded-xl flex-1">
              <p className="text-sm text-gray-400 mb-1">💰 Текущая сумма</p>
              <h2 className="text-3xl font-bold text-[#111]">543 213 000 ₸</h2>
            </div>
          </div>

          {/* Таблица товаров */}
          <div className="bg-white rounded-xl p-4">
            <div className="grid grid-cols-5 font-semibold text-gray-500 text-sm border-b pb-2 mb-2">
              <span>Наименование</span>
              <span>Цена Магазин</span>
              <span>Цена Дилер</span>
              <span>Кол-во</span>
              <span>Инфо</span>
            </div>

            {products.map((product, index) => (
              <div key={index} className="grid grid-cols-5 items-center py-3 border-b text-sm text-[#111]">
                <div className="flex items-center gap-2">
                  <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover" />
                  <span>{product.name}</span>
                </div>
                <span>{product.shopPrice}</span>
                <span>{product.dealerPrice}</span>
                <span>{product.quantity}</span>
                <span className="text-xl text-gray-400">›››</span>
              </div>
            ))}
          </div>
        </div>

        {/* Правая колонка - информация и действия */}
        <div className="w-[300px] flex flex-col gap-4">
          <div className="bg-white rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-1">Заведующий складом</p>
            <div className="flex items-center gap-3 mb-2">
              <img src="/avatars/manager.png" className="w-10 h-10 rounded-full object-cover" alt="manager" />
              <div>
                <p className="text-sm font-semibold text-[#111] flex items-center gap-1">
                  Алишан Берденов <span className="text-blue-500">✔</span>
                </p>
                <p className="text-xs text-gray-400">KZ849970</p>
                <p className="text-xs text-gray-400">+7 707 700 00 02</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4">
            <p className="text-sm font-semibold mb-2 text-[#111]">Товары</p>
            <button className="text-left text-sm py-2 border-b w-full">Выпуск товаров из склада</button>
            <button className="text-left text-sm py-2 border-b w-full">Создать новый товар</button>
          </div>

          <div className="bg-white rounded-xl p-4">
            <p className="text-sm font-semibold mb-2 text-[#111]">История</p>
            <button className="text-left text-sm py-2 border-b w-full">Составить отчет по остаткам</button>
            <button className="text-left text-sm py-2 border-b w-full">История движения на складе</button>
          </div>

          <div className="bg-white rounded-xl p-4">
            <p className="text-sm font-semibold mb-2 text-[#111]">Пользователи</p>
            <button className="text-left text-sm py-2 w-full">Создать менеджера</button>
          </div>
        </div>
      </div>
    </div>
  );
} 
