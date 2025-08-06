'use client';

import React, { useState } from 'react';
import MoreHeader from '@/components/header/MoreHeader';
import Image from 'next/image';
import ProductCardWare from '@/components/ui/ProductCardWare';
import RightSidebar from '@/components/ui/RightSidebar';

export default function WareHouse() {
  const [activeTab, setActiveTab] = useState('warehouse'); // warehouse, distributors, gifts

  const warehouseProducts = [
    { name: '9-А Шампунь+ Tannur', shopPrice: '12 990 ₸', dealerPrice: '9 900 ₸', quantity: 897, image: '/icons/Photo icon 1.png' },
    { name: 'Отбеливающая маска Tannur', shopPrice: '5 990 ₸', dealerPrice: '3 900 ₸', quantity: 231, image: '/icons/Photo icon 2.png' },
    { name: 'Гелевая маска Tannur', shopPrice: '4 990 ₸', dealerPrice: '1 900 ₸', quantity: 157, image: '/icons/Photo icon 3.png' },
    { name: 'Кушон 3 в 1 от Tannur', shopPrice: '7 990 ₸', dealerPrice: '6 900 ₸', quantity: 321, image: '/icons/Photo icon 4.png' },
    { name: 'Набор из 6 кремов Tannur', shopPrice: '8 990 ₸', dealerPrice: '6 900 ₸', quantity: 585, image: '/icons/Photo icon 5.png' },
    { name: '9-А Бальзам для волос Tannur', shopPrice: '11 990 ₸', dealerPrice: '8 900 ₸', quantity: 870, image: '/icons/Photo icon 6.png' },
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
          icon: '/icons/IconAppsOrange.png',
          title: 'Товары на складе',
          count: '8321',
          unit: 'штук',
          totalSum: '543 213 000 ₸',
          totalText: 'Товары на общую сумму'
        };
      case 'distributors':
        return {
          icon: '/icons/IconAppsOrange.png',
          title: 'Внешние дистрибьюторы',
          count: '312',
          unit: 'штук',
          totalSum: '2 598 899 ₸',
          totalText: 'Товары на общую сумму'
        };
      case 'gifts':
        return {
          icon: '/icons/IconAppsOrange.png',
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
      <MoreHeader title="Склад Tannur" />

      {/* Основной контейнер */}
      <div className="mt-8 flex flex-col lg:flex-row gap-6">
        
        {/* Левая часть - три блока и таблица */}
        <div className="flex-1">
          {/* Три блока */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Товары на складе */}
            <button
              onClick={() => setActiveTab('warehouse')}
              className={`relative rounded-2xl p-5 transition-all duration-300 text-left ${
                activeTab === 'warehouse' 
                  ? 'bg-white border-2 border-orange-500 shadow-sm' 
                  : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {/* Индикатор в правом верхнем углу */}
              <div className="absolute top-5 right-5">
                {activeTab === 'warehouse' ? (
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                ) : (
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                )}
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <Image 
                  src="/icons/IconAppsOrange.png" 
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
                <Image 
                  src="/icons/placeholder.svg" 
                  alt="icon" 
                  width={24} 
                  height={24}
                  className="opacity-50"
                />
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
                  ? 'bg-white border-2 border-orange-500 shadow-sm' 
                  : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {/* Индикатор в правом верхнем углу */}
              <div className="absolute top-5 right-5">
                {activeTab === 'distributors' ? (
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                ) : (
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                )}
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <Image 
                  src="/icons/IconAppsOrange.png" 
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
                <Image 
                  src="/icons/placeholder.svg" 
                  alt="icon" 
                  width={24} 
                  height={24}
                  className="opacity-50"
                />
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
                  ? 'bg-white border-2 border-orange-500 shadow-sm' 
                  : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {/* Индикатор в правом верхнем углу */}
              <div className="absolute top-5 right-5">
                {activeTab === 'gifts' ? (
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                ) : (
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                )}
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <Image 
                  src="/icons/IconAppsOrange.png" 
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
                <Image 
                  src="/icons/placeholder.svg" 
                  alt="icon" 
                  width={24} 
                  height={24}
                  className="opacity-50"
                />
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
              <h2 className="text-lg font-semibold text-[#111]">{currentTabData.title}</h2>
              <span className="text-sm text-gray-500">{currentTabData.count} товаров</span>
            </div>

            {/* Заголовок таблицы */}
            <div className="flex items-center font-semibold text-gray-400 text-sm border-b">
              <div className="grid grid-cols-5 gap-2 sm:gap-4 lg:gap-6 xl:gap-9 w-full text-center text-[9px] xs:text-xs sm:text-sm md:text-base lg:text-lg p-2 sm:p-3">
                <div className="text-left">Наименование</div>
                <span className="text-center">Цена Магазин</span>
                <span className="text-center">Цена Дилер</span>
                <span className="text-center">Кол-во</span>
                <span className="text-center">Инфо</span>
              </div>
            </div>
            
            {/* Список продуктов */}
            <div className="space-y-2">
              {getCurrentProducts().map((product, idx) => (
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

        {/* Правая часть - Заведующий складом */}
        <div className="w-full lg:w-[320px] xl:w-[380px]">
          <RightSidebar />
        </div>
      </div>
    </main>
  );
}