// src/app/admin/warehouse/page.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import ProductCardWare from '@/components/ui/ProductCardWare';
import RightSidebar from '@/components/ui/RightSidebar';

// новые компоненты таблиц
import Distrib, { DistribItem } from '@/components/reports/warehouse/distrib';
import Presents, { GiftItem } from '@/components/reports/warehouse/presents';

type ActiveTab = 'warehouse' | 'distributors' | 'gifts';

export default function WareHouse() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('warehouse');

  // ——— Товары на складе ———
  const warehouseProducts = [
    { name: '9-А Шампунь+ Tannur',           shopPrice: '12 990 ₸', dealerPrice: '9 900 ₸',  quantity: 897, image: '/img/product1.jpg' },
    { name: 'Отбеливающая маска Tannур',     shopPrice: '5 990 ₸',  dealerPrice: '3 900 ₸',  quantity: 231, image: '/img/product5.jpg' },
    { name: 'Гелевая маска Tannur',          shopPrice: '4 990 ₸',  dealerPrice: '1 900 ₸',  quantity: 157, image: '/img/product3.jpg' },
    { name: 'Кушон 3 в 1 от Tannur',         shopPrice: '7 990 ₸',  dealerPrice: '6 900 ₸',  quantity: 321, image: '/img/product7.jpg' },
    { name: 'Набор из 6 кремов Tannur',      shopPrice: '8 990 ₸',  dealerPrice: '6 900 ₸',  quantity: 585, image: '/img/product4.jpg' },
    { name: '9-А Бальзам для волос Tannur',  shopPrice: '11 990 ₸', dealerPrice: '8 900 ₸',  quantity: 870, image: '/img/product2.jpg' },
  ];

  // ——— Дистрибьюторы ———
  const distribItems: DistribItem[] = [
    { name: 'ИП Манна Мир', qty: 153, total: '1 238 984 ₸', region: 'Алматы, Аксай 123' },
    { name: 'ТОО Жанна',    qty: 43,  total: '538 984 ₸',   region: 'Алматы, Жандосова 2' },
  ];

  // ——— Подарки ———
  const giftItems: GiftItem[] = [
    { name: 'Акмаржан Лейс', qty: 2, total: '43 984 ₸', note: 'Stories' },
    { name: 'Инжу Ануарбек', qty: 1, total: '12 984 ₸', note: 'Рекламные ролики' },
  ];

  // карточки-статистики
  interface TabData {
    icon: string;
    title: string;
    count: string;
    unit: string;
    totalSum: string;
    totalText: string;
  }

  const getTabData = (tab: ActiveTab): TabData => {
    switch (tab) {
      case 'warehouse':
        return { icon: '/icons/IconAppsOrange.svg', title: 'Товары на складе', count: '8321', unit: 'штук', totalSum: '543 213 000 ₸', totalText: 'Товары на общую сумму' };
      case 'distributors':
        return { icon: '/icons/IconAppsOrange.svg', title: 'Внешние дистрибьюторы', count: '312', unit: 'штук', totalSum: '2 598 899 ₸', totalText: 'Товары на общую сумму' };
      case 'gifts':
        return { icon: '/icons/IconAppsOrange.svg', title: 'Товары на подарки', count: '456', unit: 'штук', totalSum: '3 274 865 ₸', totalText: 'Товары на общую сумму' };
      default:
        return { icon: '', title: '', count: '', unit: '', totalSum: '', totalText: '' };
    }
  };

  const currentTabData = getTabData(activeTab);

  const Indicator: React.FC<{ active: boolean }> = ({ active }) => (
    <div className="absolute top-5 right-5">
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${active ? 'border border-red-400' : 'border border-gray-300'}`}>
        <div className={`w-2 h-2 rounded-full ${active ? 'bg-red-400' : 'bg-gray-300'}`} />
      </div>
    </div>
  );

  return (
    <main className="p-2 md:p-6 bg-[#F3F3F3] min-h-screen">
      <MoreHeaderAD title="Склад Tannur" />

      <div className="mt-8 flex flex-col lg:flex-row gap-6">
        {/* Левая колонка */}
        <div className="flex-1">
          {/* Табы-карточки */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-6">
            {/* Склад */}
            <button
              onClick={() => setActiveTab('warehouse')}
              className={`relative rounded-2xl p-5 text-left border transition-colors duration-200
                ${activeTab === 'warehouse' ? 'bg-white border-[#DC7C67] ring-2 ring-[#DC7C67]/30' : 'bg-white border-gray-200 hover:border-gray-300'}`}
            >
              <Indicator active={activeTab === 'warehouse'} />
              <div className="flex items-center gap-2 mb-3">
                <Image src="/icons/IconAppsOrange.svg" alt="warehouse" width={20} height={20} />
                <p className="text-sm text-gray-500">Товары на складе</p>
              </div>
              <h3 className="text-4xl font-bold text-[#111] mb-4">
                8321 <span className="text-base font-normal text-gray-500">штук</span>
              </h3>
              <div className="bg-gray-100 rounded-xl p-3 flex items-center gap-3 relative">
                <div className="flex-1">
                  <p className="text-base font-semibold text-[#111]">543 213 000 ₸</p>
                  <p className="text-xs text-gray-500">Товары на общую сумму</p>
                </div>
                <div className="grid grid-cols-3 gap-1 opacity-30">
                  {Array.from({ length: 9 }).map((_, i) => (<div key={i} className="w-1.5 h-1.5 rounded-sm bg-gray-400" />))}
                </div>
              </div>
            </button>

            {/* Дистрибьюторы */}
            <button
              onClick={() => setActiveTab('distributors')}
              className={`relative rounded-2xl p-5 text-left border transition-colors duration-200
                ${activeTab === 'distributors' ? 'bg-white border-[#DC7C67] ring-2 ring-[#DC7C67]/30' : 'bg-white border-gray-200 hover:border-gray-300'}`}
            >
              <Indicator active={activeTab === 'distributors'} />
              <div className="flex items-center gap-2 mb-3">
                <Image src="/icons/IconAppsOrange.svg" alt="distributors" width={20} height={20} />
                <p className="text-sm text-gray-500">Внешние дистрибьюторы</p>
              </div>
              <h3 className="text-4xl font-bold text-[#111] mb-4">
                312 <span className="text-base font-normal text-gray-500">штук</span>
              </h3>
              <div className="bg-gray-100 rounded-xl p-3 flex items-center gap-3 relative">
                <div className="flex-1">
                  <p className="text-base font-semibold text-[#111]">2 598 899 ₸</p>
                  <p className="text-xs text-gray-500">Товары на общую сумму</p>
                </div>
                <div className="grid grid-cols-3 gap-1 opacity-30">
                  {Array.from({ length: 9 }).map((_, i) => (<div key={i} className="w-1.5 h-1.5 rounded-sm bg-gray-400" />))}
                </div>
              </div>
            </button>

            {/* Подарки */}
            <button
              onClick={() => setActiveTab('gifts')}
              className={`relative rounded-2xl p-5 text-left border transition-colors duration-200
                ${activeTab === 'gifts' ? 'bg-white border-[#DC7C67] ring-2 ring-[#DC7C67]/30' : 'bg-white border-gray-200 hover:border-gray-300'}`}
            >
              <Indicator active={activeTab === 'gifts'} />
              <div className="flex items-center gap-2 mb-3">
                <Image src="/icons/IconAppsOrange.svg" alt="gifts" width={20} height={20} />
                <p className="text-sm text-gray-500">Товары на подарки</p>
              </div>
              <h3 className="text-4xl font-bold text-[#111] mb-4">
                456 <span className="text-base font-normal text-gray-500">штук</span>
              </h3>
              <div className="bg-gray-100 rounded-xl p-3 flex items-center gap-3 relative">
                <div className="flex-1">
                  <p className="text-base font-semibold text-[#111]">3 274 865 ₸</p>
                  <p className="text-xs text-gray-500">Товары на общую сумму</p>
                </div>
                <div className="grid grid-cols-3 gap-1 opacity-30">
                  {Array.from({ length: 9 }).map((_, i) => (<div key={i} className="w-1.5 h-1.5 rounded-sm bg-gray-400" />))}
                </div>
              </div>
            </button>
          </div>

          {/* Табличная часть (фиксируем высоту чтобы ничего не «прыгало») */}
          <div className="bg-white rounded-2xl p-4 flex flex-col gap-4">

            {/* Шапка блока — правая часть фиксированной ширины и высоты */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-[#111]">
                {activeTab === 'warehouse' ? 'Товары на складе' : activeTab === 'distributors' ? 'Дистрибьюторы' : 'Товары на подарки'}
              </h2>

              {/* фиксированный контейнер  — ширина и высота одинаковые на всех табах */}
              <div className="relative h-9 w-[220px] flex items-center justify-end">
                {/* счётчик — видим только на складе, но место сохраняется */}
                <span
                  className={`absolute right-0 top-1/2 -translate-y-1/2 text-sm text-gray-500 transition-opacity
                    ${activeTab === 'warehouse' ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                >
                  {currentTabData.count} товаров
                </span>

                {/* кнопка — видна на дист/подарках, но место сохраняется */}
                <button
                  className={`absolute right-0 top-1/2 -translate-y-1/2 text-sm text-gray-600 border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50 transition-opacity
                    ${activeTab !== 'warehouse' ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                >
                  {activeTab === 'distributors' ? 'Добавить дистрибьютера' : 'Добавить подарок'}
                </button>
              </div>
            </div>

            {/* Контент вкладок */}
            {activeTab === 'warehouse' && (
              <>
                {/* Заголовок таблицы склада — уменьшенный шрифт */}
                <div className="flex items-center font-semibold text-gray-400 border-b">
                  <div className="grid grid-cols-5 gap-2 sm:gap-4 lg:gap-6 xl:gap-9 w-full text-center p-2 sm:p-2.5 text-[10px] sm:text-xs md:text-sm lg:text-sm">
                    <div className="text-left">Наименование</div>
                    <span className="text-center">Цена Магазин</span>
                    <span className="text-center">Цена Дилер</span>
                    <span className="text-center">Кол-во</span>
                    <span className="text-center">Инфо</span>
                  </div>
                </div>

                {/* Ряды товаров склада */}
                <div className="space-y-2">
                  {warehouseProducts.map((product, idx) => (
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
              </>
            )}

            {activeTab === 'distributors' && (
              <Distrib items={distribItems} />
            )}

            {activeTab === 'gifts' && (
              <Presents items={giftItems} />
            )}
          </div>
        </div>

        {/* Правая часть */}
        <div className="w-full lg:w-[320px] xl:w-[380px]">
          <RightSidebar />
        </div>
      </div>
    </main>
  );
}
