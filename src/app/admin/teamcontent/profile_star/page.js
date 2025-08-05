// src/app/admin/teamcontent/profile_star/page.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import MoreHeader from '@/components/header/MoreHeader';
import { FifthTemplate } from '@/components/layouts/TannurPageTemplates';
import ProductCard from './ProductCard';

export default function ProfileStarPage() {
  // Функция копирования ссылки в буфер обмена
  const handleCopy = () => {
    const text = 'tannur.app/KZ848970';
    navigator.clipboard
      .writeText(text)
      .then(() => alert('Ссылка скопирована!'))
      .catch(() => alert('Не удалось скопировать ссылку'));
  };

  const smallProducts = [
    { id: 1, img: '/icons/Photo_icon_1.jpg', title: 'Товар 1', price: '12 000₸' },
    { id: 2, img: '/icons/Photo_icon_2.jpg', title: 'Товар 2', price: '8 500₸' },
    { id: 3, img: '/icons/Photo_icon_3.jpg', title: 'Товар 3', price: '15 300₸' },
  ];
  const moreProducts = [
    { id: 4, img: '/icons/IconPrew4.jpg', title: 'Товар 4', price: '9 200₸' },
    { id: 5, img: '/icons/IconPrew5.jpg', title: 'Товар 5', price: '11 750₸' },
    { id: 6, img: '/icons/IconPrew6.jpg', title: 'Товар 6', price: '7 900₸' },
    { id: 7, img: '/icons/IconPrew7.jpg', title: 'Товар 7', price: '11 750₸' },
    { id: 8, img: '/icons/IconPrew8.jpg', title: 'Товар 8', price: '7 900₸' },
  ];

  return (
    <FifthTemplate
      header={
        <MoreHeader
          title={
            <span className="text-sm sm:text-base">
              <span className="text-gray-400">Tannur</span>
              <span className="mx-1 text-[#111]">/</span>
              <span className="text-[#111]">Профиль знаменитости</span>
            </span>
          }
        />
      }
      // Первая колонка: профиль звезды
      column1={
        <>
          <div className="relative rounded-2xl bg-white overflow-hidden pb-6 sm:pb-8 md:pb-12">
            {/* Градиентный фон */}
            <div className="h-24 sm:h-32 md:h-36 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200" />
            
            {/* Аватар - адаптивные размеры */}
            <div className="absolute top-8 sm:top-10 md:top-12 left-4 sm:left-6 w-32 h-32 sm:w-48 sm:h-48 md:w-60 md:h-60 rounded-2xl overflow-hidden border-2 sm:border-4 border-white">
              <img
                src="/Icons/UsersAvatarPrew2.jpg"
                alt="Інжу Ануарбек"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Контент профиля */}
            <div className="pt-4 sm:pt-6 px-4 sm:px-6 md:px-8 flex flex-col lg:flex-row items-start lg:items-center gap-4">
              <div className="flex-1 mt-20 sm:mt-24 md:mt-0 md:ml-[15rem] flex flex-col">
                {/* Имя и верификация */}
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-[#111] flex items-center gap-2">
                  <span className="break-words">Інжу Ануарбек</span>
                  <Image
                    src="/icons/IconCheckMarkBlue.svg"
                    alt="verified"
                    width={16}
                    height={16}
                    className="sm:w-5 sm:h-5 flex-shrink-0"
                  />
                </h1>
                
                {/* Описание */}
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Эстрада әншісі</p>
                
                {/* Ссылки */}
                <div className="mt-3 sm:mt-4 flex flex-col gap-y-2 text-xs text-gray-500">
                  <a href="#" onClick={handleCopy} className="flex items-center gap-1 hover:text-gray-700 transition-colors">
                    <Image
                      src="/icons/IconCopyGray.svg"
                      alt="copy"
                      width={14}
                      height={14}
                      className="sm:w-4 sm:h-4 flex-shrink-0"
                    />
                    <span className="break-all">tannur.app/KZ848970</span>
                  </a>
                  <a
                    href="https://instagram.com/inzhu_anuarbek"
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src="/icons/IconInstagram.svg"
                      alt="instagram"
                      width={14}
                      height={14}
                      className="sm:w-4 sm:h-4 flex-shrink-0"
                    />
                    <span className="break-all">instagram.com/inzhu_anuarbek</span>
                  </a>
                </div>
              </div>
              
              {/* Подписчики */}
              <div className="relative flex-shrink-0 mt-4 lg:mt-0 lg:-top-9 flex flex-col items-start lg:items-end w-full lg:w-auto">
                <div className="flex items-center gap-2">
                  <Image
                    src="/icons/IconUsersOrange.svg"
                    alt="subscribers"
                    width={20}
                    height={20}
                    className="sm:w-6 sm:h-6"
                  />
                  <span className="text-xl sm:text-2xl font-semibold text-[#111]">1 283</span>
                </div>
                <span className="text-xs sm:text-sm text-gray-500">Подписчики</span>
              </div>
              
              {/* Декоративный элемент */}
              <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 opacity-20">
                <Image
                  src="/icons/IconDecorOrange.svg"
                  alt="decor"
                  width={80}
                  height={80}
                  className="sm:w-24 sm:h-24 md:w-[104px] md:h-[104px]"
                />
              </div>
            </div>
          </div>
        </>
      }
      // Вторая колонка: информация о компании
      column2={
        <>
          {/* Заголовок над блоком */}
          <h3 className="text-base sm:text-lg font-semibold text-[#111] mt-4 sm:mt-7 mb-4 sm:mb-7 px-2 sm:px-0">
            О компании
          </h3>

          {/* Сам блок */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col gap-4 sm:gap-6 mx-2 sm:mx-0">
            {/* Логотип по центру */}
            <div className="flex mt-3 sm:mt-5 justify-center">
              <Image
                src="/icons/IconlogoTannur.jpg"
                alt="Tannur"
                width={150}
                height={150}
                className="sm:w-20 sm:h-20"
              />
            </div>

            {/* Описание */}
            <div className="space-y-3 sm:space-y-4">
              <p className="text-xs leading-relaxed text-gray-500">
                It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more‑or‑less normal distribution of letters, as opposed to using 'Content here', making it look like readable English.
              </p>
              <p className="text-xs leading-relaxed text-gray-500">
                Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy.
              </p>
              <p className="text-xs leading-relaxed text-gray-500">
                Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).
              </p>
            </div>
            
            {/* Сегментированная кнопка‑пилюля */} 
            <div className="inline-flex items-center rounded-full border border-[#DC7C67] overflow-hidden w-full sm:w-auto">
              {/* Левая «активная» половинка */}
              <a
                href="#"
                className="flex items-center justify-center gap-2 px-3 py-1.5 bg-[#DC7C67] text-white text-xs flex-1 sm:flex-initial hover:bg-opacity-90 transition-colors"
              >
                <Image
                  src="/icons/IconGalleryWhite.svg"
                  alt="link"
                  width={14}
                  height={14}
                  className="flex-shrink-0"
                />
                <span>Перейти на сайт</span>
              </a>

              {/* Правая «неактивная» половинка */}
              <a
                href="#"
                className="flex items-center justify-center gap-2 px-3 py-1.5 bg-white text-[#111] text-xs flex-1 sm:flex-initial hover:bg-gray-50 transition-colors"
              >
                <Image
                  src="/icons/IconStarBlack.svg"
                  alt="factory"
                  width={14}
                  height={14}
                  className="flex-shrink-0"
                />
                <span>Завод Tannur</span>
              </a>
            </div>
          </div>
        </>
      }
      // Третья колонка: товары
      column3={
        <>
          {/* Заголовок магазина */}
          <div className="flex justify-between items-center px-2 sm:px-4 md:px-6 lg:px-8 xl:px-0 mt-4 sm:mt-6 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#111]">
              Tannur Store
            </h2>
            <Image
              src="/icons/IconFilterBlack.svg"
              alt="filter"
              width={18}
              height={18}
              className="sm:w-5 sm:h-5 cursor-pointer hover:opacity-70 transition-opacity"
            />
          </div>

          {/* Товары */}
          <div className="px-1 sm:px-2 mt-1 space-y-4">
            {/* Первый ряд - адаптивная сетка */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {smallProducts.map(p => (
                <ProductCard
                  key={p.id}
                  imgSrc={p.img}
                  title={p.title}
                  price={p.price}
                  showHeart
                  arrowIconSrc="/icons/Icon arow botom white.png"
                  widthClass="w-full"
                  heightClass="h-[280px] sm:h-[320px] md:h-[360px]"
                />
              ))}
              
              {/* Флагманский продукт */}
              <div className="sm:col-span-2 lg:col-span-1 xl:col-span-1">
                <ProductCard widthClass="w-full" heightClass="h-[280px] sm:h-[320px] md:h-[360px]">
                  <div className="relative flex flex-col h-full overflow-hidden">
                    <div className="relative flex-shrink-0 h-[180px] sm:h-[200px] md:h-[240px]">
                      <img
                        src="/icons/6StepTannurCareSet.png"
                        alt="flagship"
                        className="w-full h-full object-cover rounded-t-2xl"
                      />
                      <span className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-[#BE345D] text-white text-xs font-medium px-2 sm:px-3 py-1 rounded-full">
                        Флагман продукт
                      </span>
                    </div>
                    <div className="px-4 sm:px-6 mt-3 sm:mt-4 flex-grow">
                      <h3 className="text-sm font-medium text-black line-clamp-2">
                        6‑этапный уходовый набор Tannur
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Дилерская цена</p>
                      <p className="text-sm text-black mt-2 sm:mt-3 font-medium">89 850 ₸</p>
                    </div>
                    <button className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 z-10 w-7 h-7 sm:w-8 sm:h-8 bg-[#DC867B] rounded-md flex items-center justify-center hover:bg-opacity-90 transition-colors">
                      <img
                        src="/icons/Icon arow botom white.png"
                        alt="go"
                        className="w-3 h-3 sm:w-4 sm:h-4"
                      />
                    </button>
                  </div>
                </ProductCard>
              </div>
            </div>
            
            {/* Второй ряд */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
              {moreProducts.map(p => (
                <ProductCard
                  key={p.id}
                  imgSrc={p.img}
                  title={p.title}
                  price={p.price}
                  arrowIconSrc="/icons/Icon arow botom white.png"
                  widthClass="w-full"
                  heightClass="h-[280px] sm:h-[320px] md:h-[360px]"
                />
              ))}
            </div>
          </div>
          
          {/* Фотографии */}
          <div className="mt-8 sm:mt-10 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-0">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#111] mb-4 sm:mb-6">
              Фотографии
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {[
                '/icons/gallery1.jpg',
                '/icons/gallery2.jpg',
                '/icons/gallery3.jpg',
                '/icons/gallery4.jpg'
              ].map((src, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-2xl group cursor-pointer">
                  <img
                    src={src}
                    alt={`Фото ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      }
    />
  );
}