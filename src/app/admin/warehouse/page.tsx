'use client';

import React, { useState } from 'react';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import Image from 'next/image';
import ProductCardWare from '@/components/ui/ProductCardWare';
import RightSidebar from '@/components/ui/RightSidebar';

export default function WareHouse() {
  const [activeTab, setActiveTab] = useState('warehouse'); // warehouse, distributors, gifts

  const warehouseProducts = [
    { name: '9-А Шампунь+ Tannur', shopPrice: '12 990 ₸', dealerPrice: '9 900 ₸', quantity: 897, image: '/img/product1.jpg' },
    { name: 'Отбеливающая маска Tannur', shopPrice: '5 990 ₸', dealerPrice: '3 900 ₸', quantity: 231, image: '/img/product5.jpg' },
    { name: 'Гелевая маска Tannur', shopPrice: '4 990 ₸', dealerPrice: '1 900 ₸', quantity: 157, image: '/img/product3.jpg' },
    { name: 'Кушон 3 в 1 от Tannur', shopPrice: '7 990 ₸', dealerPrice: '6 900 ₸', quantity: 321, image: '/img/product7.jpg' },
    { name: 'Набор из 6 кремов Tannur', shopPrice: '8 990 ₸', dealerPrice: '6 900 ₸', quantity: 585, image: '/img/product4.jpg' },
    { name: '9-А Бальзам для волос Tannur', shopPrice: '11 990 ₸', dealerPrice: '8 900 ₸', quantity: 870, image: '/img/product2.jpg' },
  ];

  const distributorProducts = [
    { name: 'Сыворотка для лица Tannur', shopPrice: '15 990 ₸', dealerPrice: '12 900 ₸', quantity: 45, image: '/icons/Photo icon 1.png' },
    { name: 'Крем для рук Tannur', shopPrice: '3 990 ₸', dealerPrice: '2 900 ₸', quantity: 123, image: '/icons/Photo icon 2.png' },
    { name: 'Тоник для лица Tannur', shopPrice: '6 990 ₸', dealerPrice: '4 900 ₸', quantity: 89, image: '/icons/Photo icon 3.png' },
    { name: 'Маска для волос Tannur', shopPrice: '8 990 ₸', dealerPrice: '6 900 ₸', quantity: 55, image: '/icons/Photo icon 4.png' },
  ];

  const giftProducts = [
    { name: 'Подарочный набор Tannur Premium', shopPrice: '25 990 ₸', dealerPrice: '19 900 ₸', quantity: 78, image: '/icons/Photo icon 5.png' },
    { name: 'Мини-набор Tannur Travel', shopPrice: '9 990 ₸', dealerPrice: '7 900 ₸', quantity: 234, image: '/icons/Photo icon 6.png' },
    { name: 'Набор масок Tannur Special', shopPrice: '12 990 ₸', dealerPrice: '9 900 ₸', quantity: 156, image: '/icons/Photo icon 1.png' },
    { name: 'Подарочный сертификат', shopPrice: '10 000 ₸', dealerPrice: '10 000 ₸', quantity: 288, image: '/icons/Photo icon 2.png' },
  ];

  const getCurrentProducts = () => {
    switch(activeTab) {
      case 'distributors':
        return distributorProducts;
      case 'gifts':
        return giftProducts;
      default:
        return warehouseProducts;
    }
  };

  const getTabData = (tab) => {
    switch(tab) {
      case 'warehouse':
        return {
          icon: '/icons/IconAppsOrange.svg',
          title: 'Товары на складе',
          count: '8321',
          unit: 'штук',
          totalSum: '543 213 000 ₸',
          totalText: 'Товары на общую сумму'
        };
      case 'distributors':
        return {
          icon: '/icons/IconAppsOrange.svg',
          title: 'Внешние дистрибьюторы',
          count: '312',
          unit: 'штук',
          totalSum: '2 598 899 ₸',
          totalText: 'Товары на общую сумму'
        };
      case 'gifts':
        return {
          icon: '/icons/IconAppsOrange.svg',
          title: 'Товары на подарки',
          count: '456',
          unit: 'штук',
          totalSum: '3 274 865 ₸',
          totalText: 'Товары на общую сумму'
        };
      default:
        return {};
    }
  };

  const currentTabData = getTabData(activeTab);

  return (
    <main className="p-2 md:p-6 bg-[#F3F3F3] min-h-screen">
      <MoreHeaderAD title="Склад Tannur" />

      {/* Основной контейнер */}
      <div className="mt-8 flex flex-col lg:flex-row gap-6">
        
        {/* Левая часть - три блока и таблица */}
        <div className="flex-1">
          {/* Три блока */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-6">
            {/* Товары на складе */}
            <button
              onClick={() => setActiveTab('warehouse')}
              className={`relative rounded-2xl p-5 transition-all duration-300 text-left ${
                activeTab === 'warehouse' 
                  ? 'bg-white border-2 border-orange-500 ' 
                  : 'bg-white border border-gray-200 hover:border-gray-300 hover:'
              }`}
            >
              {/* Индикатор в правом верхнем углу */}
<div className="absolute top-5 right-5">
  <div className={`w-4 h-4 rounded-full flex items-center justify-center 
    ${activeTab === 'warehouse' ? 'border border-red-400' : 'border border-gray-300'}`}>
    <div className={`w-2 h-2 rounded-full 
      ${activeTab === 'warehouse' ? 'bg-red-400' : 'bg-gray-300'}`}></div>
  </div>
</div>

              
              <div className="flex items-center gap-2 mb-3">
                <Image 
                  src="/icons/IconAppsOrange.svg" 
                  alt="warehouse" 
                  width={20} 
                  height={20}
                />
                <p className="text-sm text-gray-500">Товары на складе</p>
              </div>
              
              <h3 className="text-4xl font-bold text-[#111] mb-4">
                8321 <span className="text-base font-normal text-gray-500">штук</span>
              </h3>
              
              {/* Серый блок с суммой */}
              <div className="bg-gray-100 rounded-xl p-3 flex items-center gap-3 relative">
                <div className="flex-1">
                  <p className="text-base font-semibold text-[#111]">543 213 000 ₸</p>
                  <p className="text-xs text-gray-500">Товары на общую сумму</p>
                </div>
                {/* Декоративные квадраты внутри серого блока */}
                <div className="grid grid-cols-3 gap-1 opacity-30">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-sm bg-gray-400" />
                  ))}
                </div>
              </div>
            </button>

            {/* Внешние дистрибьюторы */}
            <button
              onClick={() => setActiveTab('distributors')}
              className={`relative rounded-2xl p-5 transition-all duration-300 text-left ${
                activeTab === 'distributors' 
                  ? 'bg-white border-2 border-orange-500 ' 
                  : 'bg-white border border-gray-200 hover:border-gray-300 hover:'
              }`}
            >
              {/* Индикатор в правом верхнем углу */}
              <div className="absolute top-5 right-5">
  <div className={`w-4 h-4 rounded-full flex items-center justify-center 
    ${activeTab === 'distributors' ? 'border border-red-400' : 'border border-gray-300'}`}>
    <div className={`w-2 h-2 rounded-full 
      ${activeTab === 'distributors' ? 'bg-red-400' : 'bg-gray-300'}`}></div>
  </div>
</div>
              
              <div className="flex items-center gap-2 mb-3">
                <Image 
                  src="/icons/IconAppsOrange.svg" 
                  alt="distributors" 
                  width={20} 
                  height={20}
                />
                <p className="text-sm text-gray-500">Внешние дистрибьюторы</p>
              </div>
              
              <h3 className="text-4xl font-bold text-[#111] mb-4">
                312 <span className="text-base font-normal text-gray-500">штук</span>
              </h3>
              
              {/* Серый блок с суммой */}
              <div className="bg-gray-100 rounded-xl p-3 flex items-center gap-3 relative">

                <div className="flex-1">
                  <p className="text-base font-semibold text-[#111]">2 598 899 ₸</p>
                  <p className="text-xs text-gray-500">Товары на общую сумму</p>
                </div>
                {/* Декоративные квадраты внутри серого блока */}
                <div className="grid grid-cols-3 gap-1 opacity-30">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-sm bg-gray-400" />
                  ))}
                </div>
              </div>
            </button>

            {/* Товары на подарки */}
            <button
              onClick={() => setActiveTab('gifts')}
              className={`relative rounded-2xl p-5 transition-all duration-300 text-left ${
                activeTab === 'gifts' 
                  ? 'bg-white border-2 border-orange-500 ' 
                  : 'bg-white border border-gray-200 hover:border-gray-300 hover:'
              }`}
            >
              {/* Индикатор в правом верхнем углу */}
<div className="absolute top-5 right-5">
  <div className={`w-4 h-4 rounded-full flex items-center justify-center 
    ${activeTab === 'gifts' ? 'border border-red-400' : 'border border-gray-300'}`}>
    <div className={`w-2 h-2 rounded-full 
      ${activeTab === 'gifts' ? 'bg-red-400' : 'bg-gray-300'}`}></div>
  </div>
</div>

              <div className="flex items-center gap-2 mb-3">
                <Image 
                  src="/icons/IconAppsOrange.svg" 
                  alt="gifts" 
                  width={20} 
                  height={20}
                />
                <p className="text-sm text-gray-500">Товары на подарки</p>
              </div>
              
              <h3 className="text-4xl font-bold text-[#111] mb-4">
                456 <span className="text-base font-normal text-gray-500">штук</span>
              </h3>
              
              {/* Серый блок с суммой */}
              <div className="bg-gray-100 rounded-xl p-3 flex items-center gap-3 relative">
                <div className="flex-1">
                  <p className="text-base font-semibold text-[#111]">3 274 865 ₸</p>
                  <p className="text-xs text-gray-500">Товары на общую сумму</p>
                </div>
                {/* Декоративные квадраты внутри серого блока */}
                <div className="grid grid-cols-3 gap-1 opacity-30">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-sm bg-gray-400" />
                  ))}
                </div>
              </div>
            </button>
          </div>

          {/* Таблица товаров - сразу под тремя блоками */}
          <div className="bg-white rounded-2xl p-4 flex flex-col gap-4">
            {/* Заголовок с названием активной вкладки */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-[#111]">
                {activeTab === 'warehouse' ? 'Товары на складе' : 
                 activeTab === 'distributors' ? 'Дистрибьюторы' : 
                 'Товары на подарки'}
              </h2>
              {activeTab === 'warehouse' && (
                <span className="text-sm text-gray-500">{currentTabData.count} товаров</span>
              )}
              {activeTab !== 'warehouse' && (
                <button className="text-sm text-gray-500 border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50">
                  {activeTab === 'distributors' ? 'Добавить дистрибьютера' : 'Добавить подарок'}
                </button>
              )}
            </div>

            {/* Заголовок таблицы для складских товаров */}
            {activeTab === 'warehouse' && (
              <>
                <div className="flex items-center font-semibold text-gray-400 text-sm border-b">
                  <div className="grid grid-cols-5 gap-2 sm:gap-4 lg:gap-6 xl:gap-9 w-full text-center text-[9px] xs:text-xs sm:text-sm md:text-base lg:text-lg p-2 sm:p-3">
                    <div className="text-left">Наименование</div>
                    <span className="text-center">Цена Магазин</span>
                    <span className="text-center">Цена Дилер</span>
                    <span className="text-center">Кол-во</span>
                    <span className="text-center">Инфо</span>
                  </div>
                </div>
                
                {/* Список продуктов для склада */}
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

            {/* Таблица для дистрибьюторов */}
            {activeTab === 'distributors' && (
              <>
                <div className="flex items-center text-gray-400 text-sm border-b pb-2">
                  <div className="grid grid-cols-5 gap-4 w-full text-xs">
                    <div className="text-left">Имя</div>
                    <div className="text-left">Кол-во</div>
                    <div className="text-left">Общая сумма</div>
                    <div className="text-left">Регион</div>
                    <div className="text-right">Инфо</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="bg-white rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100">
                    <div className="grid grid-cols-5 gap-4 items-center">
                      <div className="font-medium text-black text-sm">ИП Манна Мир</div>
                      <div className="text-sm text-black">153 шт</div>
                      <div className="text-sm text-black font-medium">1 238 984 ₸</div>
                      <div className="text-sm text-black ">Алматы, Аксай 123</div>
                      <div className="text-right">
                        <button className="text-orange-500 hover:text-orange-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100">
                    <div className="grid grid-cols-5 gap-4 items-center">
                      <div className="font-medium text-sm text-black">ТОО Жанна</div>
                      <div className="text-sm text-black">43 шт</div>
                      <div className="text-sm font-medium text-black">538 984 ₸</div>
                      <div className="text-sm text-black">Алматы, Жандосова 2</div>
                      <div className="text-right">
                        <button className="text-orange-500 hover:text-orange-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Таблица для подарков */}
            {activeTab === 'gifts' && (
              <>
                <div className="flex items-center text-gray-400 text-sm border-b pb-2">
                  <div className="grid grid-cols-5 gap-4 w-full text-xs">
                    <div className="text-left">Имя</div>
                    <div className="text-left">Кол-во</div>
                    <div className="text-left">Общая сумма</div>
                    <div className="text-left">Заметка</div>
                    <div className="text-right">Инфо</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="bg-white rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100">
                    <div className="grid grid-cols-5 gap-4 items-center">
                      <div className="font-medium text-sm text-black">Акмаржан Лейс</div>
                      <div className="text-sm text-black">2 шт</div>
                      <div className="text-sm font-medium text-black">43 984 ₸</div>
                      <div className="text-sm  text-black">Stories</div>
                      <div className="text-right">
                        <button className="text-orange-500 hover:text-orange-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100">
                    <div className="grid grid-cols-5 gap-4 items-center">
                      <div className="font-medium text-sm text-black">Инжу Ануарбек</div>
                      <div className="text-sm text-black">1 шт</div>
                      <div className="text-sm font-medium text-black">12 984 ₸</div>
                      <div className="text-sm  text-black">Рекламные ролики</div>
                      <div className="text-right">
                        <button className="text-orange-500 hover:text-orange-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Правая часть - Заведующий складом */}
        <div className="w-full lg:w-[320px] xl:w-[380px]">
          <RightSidebar />
        </div>
      </div>
    </main>
  );
}