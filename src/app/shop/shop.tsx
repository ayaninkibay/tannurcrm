'use client';
import React from 'react';
import ProductCard from './ProductCard';
import Image from 'next/image';


const Shop = () => {
  const smallProducts  = [
    { id: 1, title: '9‑A Шампунь Tannur',        price: '89 850₸', img: '/icons/Photo Shampoo.png' },
    { id: 2, title: '9‑A Бальзам для волос Tannur', price: '89 850₸', img: '/icons/Photo Balm.png'    },
    { id: 3, title: '9‑A Крем для волос Tannur',   price: '89 850₸', img:  '/icons/Photo Cream.png'   },
  ];

  const moreProducts = [
    { id: 4, title: 'Отбеливащая маска Tannur', price: '89 850₸', img: '/icons/Photo mask.png' },
    { id: 5, title: 'Гелеон маска Tannur', price: '89 850₸', img: '/icons/Photo mask geleon.png' },
    { id: 6, title: 'Гелеон маска Tannur', price: '89 850₸', img: '/icons/Photo soap.png' },
    { id: 7, title: 'Набор из 6 кремов Tannur', price: '89 850₸', img: '/icons/Photo cushion.png' },
    { id: 8, title: 'Набор из 6 кремов Tannur', price: '89 850₸', img: '/icons/Photo soap blue.png' },
  ];


  return (
    <div className="px-[40px] py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-semibold text-black">Tannur Store</h1>
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

      {/* Greeting */}
      <div className="bg-white p-5 rounded-2xl flex justify-between items-center mb-10">
        <span className="text-gray-700 font-medium">С возвращением, Інжу</span>
        <button className="flex items-center gap-1.5 px-4 py-1.5 border border-black rounded-full text-sm text-black font-medium hover:bg-gray-100 transition">
          <img src="/icons/Icon shopping black.png" alt="Покупки" className="w-3.5 h-3.5" />
          Ваши покупки
        </button>
      </div>

      {/* Main content */}
      <div className="flex gap-4 relative">
        {/* Products column */}
        <div className="flex-1 flex flex-col px-1 mt-1 gap-6 pr-[310px]">
          {/* First row */}
          <div className="flex gap-4">
            {smallProducts.map(p => (
              <ProductCard
                key={p.id}
                imgSrc={p.img}
                title={p.title}
                price={p.price}
                showHeart
                arrowIconSrc="/icons/Icon arow botom white.png"
              />
            ))}

            {/* Big flagship card */}
            <ProductCard widthClass="w-[500px]" heightClass="h-[360px]">
              <div className="relative flex flex-col h-full overflow-hidden">
                {/* Image + badge */}
                <div className="relative flex-shrink-0 h-[240px]">
                  <img
                    src="/icons/6StepTannurCareSet.png"
                    alt="6‑этапный уходовый набор Tannur"
                    className="w-full h-full object-cover rounded-t-2xl"
                  />
                  <span className="absolute top-65 right-4 bg-[#BE345D] text-white text-xs font-medium px-3 py-1 rounded-full">
                    Флагман продукт
                  </span>
                </div>

                {/* Text */}
                <div className="px-6 mt-4 flex-grow">
                  <h3 className="text-sm font-medium text-black">
                    6‑этапный уходовый набор Tannur
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Дилерская цена</p>
                  <p className="text-sm text-black mt-3">89 850₸</p>
                </div>

                {/* Arrow button */}
                <button className="absolute bottom-4 right-4 z-10 w-8 h-8 bg-[#DC867B] rounded-md flex items-center justify-center hover:bg-opacity-90 transition">
                  <img
                    src="/icons/Icon arow botom white.png"
                    alt="Перейти"
                    className="w-4 h-4"
                  />
                </button>
              </div>
            </ProductCard>
          </div>

          {/* Second row */}
          <div className="flex gap-4">
            {moreProducts.map(p => (
              <ProductCard
                key={p.id}
                imgSrc={p.img}
                title={p.title}
                price={p.price}
                arrowIconSrc="/icons/Icon arow botom white.png"
                heightClass="h-[360px]"
              />
            ))}
          </div>
        </div>

        {/* Filters panel (unchanged) */}
        <div className="absolute top-0 right-0 h-full w-[310px] overflow-visible">
          <div className="absolute inset-y-0 left-0 w-px bg-gray-300" />
          <div className="h-full overflow-y-auto px-6 py-4 space-y-12">
            {/* Settings */}
            <div>
              <h3 className="font-semibold text-black mb-5">Настройки</h3>
              <div className="space-y-3">
                {[
                  { label: 'Дилерские цены', checked: true },
                  { label: 'Доставка в ваш адрес', checked: true },
                  { label: 'Выбрать филиал', checked: false },
                ].map((item, idx) => (
                  <label
                    key={idx}
                    className="flex justify-between items-center bg-white px-3 py-2 rounded-md w-full"
                  >
                    <span className="text-sm text-black">{item.label}</span>
                    <input
                      type="checkbox"
                      defaultChecked={item.checked}
                      className="accent-[#B3125E] w-3 h-3"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <h3 className="font-semibold text-black mb-5">Категория</h3>
              <div className="space-y-3">
                {[
                  { label: 'Наборы', checked: true },
                  { label: 'Для лица', checked: true },
                  { label: 'Для волос', checked: false },
                ].map((item, idx) => (
                  <label
                    key={idx}
                    className="flex justify-between items-center bg-white px-3 py-2 rounded-md w-full"
                  >
                    <span className="text-sm text-black">{item.label}</span>
                    <input
                      type="checkbox"
                      defaultChecked={item.checked}
                      className="accent-[#B3125E] w-3 h-3"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Shop;
