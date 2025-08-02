'use client';

import React from 'react';
import MoreHeader from '@/components/header/MoreHeader';
import Image from 'next/image';
import ProductCardWare from '@/components/ui/ProductCardWare';
import RightSidebar from '@/components/ui/RightSidebar';

export default function WareHouse() {
  const products = [
    { name: '9-А Шампунь+ Tannur', shopPrice: '12 990 ₸', dealerPrice: '9 900 ₸', quantity: 897, image: '/icons/Photo icon 1.png' },
    { name: 'Отбеливающая маска Tannur', shopPrice: '5 990 ₸', dealerPrice: '3 900 ₸', quantity: 231, image: '/icons/Photo icon 2.png' },
    { name: 'Гелевая маска Tannur', shopPrice: '4 990 ₸', dealerPrice: '1 900 ₸', quantity: 157, image: '/icons/Photo icon 3.png' },
    { name: 'Кушон 3 в 1 от Tannur', shopPrice: '7 990 ₸', dealerPrice: '6 900 ₸', quantity: 321, image: '/icons/Photo icon 4.png' },
    { name: 'Набор из 6 кремов Tannur', shopPrice: '8 990 ₸', dealerPrice: '6 900 ₸', quantity: 585, image: '/icons/Photo icon 5.png' },
    { name: '9-А Бальзам для волос Tannur', shopPrice: '11 990 ₸', dealerPrice: '8 900 ₸', quantity: 870, image: '/icons/Photo icon 6.png' },
  ];

  return (
    <main className="min-h-screen bg-[#F3F3F3] ">
      <MoreHeader title="Скалд Админа" />

      {/* 
        grid-cols-1 на мобилке,
        sm:grid-cols-2 на планшетах,
        lg:grid-cols-4 на десктопе
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-8 gap-4">
        {/* Основной блок: 
            — col-span-1 на мобилке,
            — sm:col-span-2 на планшете,
            — lg:col-span-3 на десктопе */}
        <div className="grid grid-rows-[auto_1fr] gap-4 sm:col-span-2 lg:col-span-3">
          {/* Метрики */}
          <div className="bg-white rounded-2xl p-6 flex flex-col lg:flex-row justify-between items-start gap-4">
            <div className="flex flex-col justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Image src="/icons/IconAppsOrange.png" alt="box" width={16} height={16} />
                <p className="text-sm font-medium text-[#111]">Товары на складе</p>
              </div>
              <h2 className="text-4xl font-bold text-[#111]">
                8321 <span className="text-base font-medium text-gray-400">штук</span>
              </h2>
            </div>
            <div className="relative bg-[#F2F2F2] rounded-xl p-4 w-full max-w-[240px] flex flex-col">
            
              <div className="mt-auto z-10">
                <h3 className="text-lg font-semibold text-[#111] leading-tight">
                  543 213 000 ₸
                </h3>
                <p className="text-xs text-gray-500">Товары на общую сумму</p>
              </div>
            </div>
          </div>

          {/* Список товаров */}
          <div className="bg-white rounded-2xl p-4 flex flex-col gap-4">
            <div className="flex items-center font-semibold text-gray-500 text-sm border-b ">
              
              <div className="grid grid-cols-5 gap-9 w-full justify-between text-center
                text-[10px] sm:text-sm md:text-base lg:text-lg">
                <div>Наименование</div>
                <span>Цена Магазин</span>
                <span>Цена Дилер</span>
                <span>Кол-во</span>
                <span>Инфо</span>
              </div>
            </div>
            <div className="space-y-2">
              {products.map((product, idx) => (
                <ProductCardWare
                  key={idx}
                  image={product.image}
                  title={product.name}
                  priceOld={product.shopPrice}
                  priceNew={product.dealerPrice}
                  count={product.quantity}
                  onClick={() => alert(`Открыть товар: ${product.name}`)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Правая панель:
            — full-width на мобилке и планшете,
            — 1 из 4 колонок на десктопе */}
        <div className=" rounded-2xl sm:col-span-2 md:col-span-2 lg:col-span-1 grid">
          <RightSidebar />
        </div>
      </div>
    </main>
  );
}
