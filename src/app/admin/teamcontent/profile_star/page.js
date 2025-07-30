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
    { id: 1, img: '/icons/Photo_icon_1.jpg', title: 'Товар 1', price: '12 000₸' },
    { id: 2, img: '/icons/Photo_icon_2.jpg', title: 'Товар 2', price: '8 500₸' },
    { id: 3, img: '/icons/Photo_icon_3.jpg', title: 'Товар 3', price: '15 300₸' },
  ];
  const moreProducts = [
    { id: 4, img: '/icons/IconPrew4.jpg', title: 'Товар 4', price: '9 200₸' },
    { id: 5, img: '/icons/IconPrew5.jpg', title: 'Товар 5', price: '11 750₸' },
    { id: 6, img: '/icons/IconPrew6.jpg', title: 'Товар 6', price: '7 900₸' },
    { id: 7, img: '/icons/IconPrew7.jpg', title: 'Товар 7', price: '11 750₸' },
    { id: 8, img: '/icons/IconPrew8.jpg', title: 'Товар 8', price: '7 900₸' },
  ];

  return (
    <FifthTemplate
      header={
        <MoreHeader
          title={
            <span>
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
          <div className="relative rounded-2xl bg-white overflow-hidden pb-8 md:pb-12">
            <div className="h-36 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200" />
            <div className="absolute top-12 left-6 w-60 h-60 rounded-2xl overflow-hidden border-4 border-white">
              <img
                src="/Icons/UsersAvatarPrew2.jpg"
                alt="Інжу Ануарбек"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="pt-6 px-6 md:px-8 flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-1 md:ml-[15rem] flex flex-col">
                <h1 className="text-xl md:text-3xl font-semibold text-[#111] flex items-center gap-2">
                  Інжу Ануарбек
                  <Image
                    src="/icons/IconCheckMarkBlue.svg"
                    alt="verified"
                    width={20}
                    height={20}
                  />
                </h1>
                <p className="text-sm text-gray-600 mt-1">Эстрада әншісі</p>
                <div className="mt-4 flex flex-col gap-y-2 text-xs text-gray-500">
                  <a href="#" onClick={handleCopy} className="flex items-center gap-1">
                    <Image
                      src="/icons/IconCopyGray.svg"
                      alt="copy"
                      width={16}
                      height={16}
                    />
                    tannur.app/KZ848970
                  </a>
                  <a
                    href="https://instagram.com/inzhu_anuarbek"
                    className="flex items-center gap-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src="/icons/IconInstagram.svg"
                      alt="instagram"
                      width={16}
                      height={16}
                    />
                    instagram.com/inzhu_anuarbek
                  </a>
                </div>
              </div>
              <div className="relative flex-shrink-0 -top-9 mt-4 md:mt-0 flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <Image
                    src="/icons/IconUsersOrange.svg"
                    alt="subscribers"
                    width={24}
                    height={24}
                  />
                  <span className="text-2xl font-semibold text-[#111]">1 283</span>
                </div>
                <span className="text-sm text-gray-500">Подписчики</span>
              </div>
              <div className="absolute bottom-4 right-4 opacity-20">
                <Image
                  src="/icons/IconDecorOrange.svg"
                  alt="decor"
                  width={104}
                  height={104}
                />
              </div>
            </div>
          </div>
        </>
      }
      // Вторая колонка: информация о компании
      column2={
        <>{
  <>
     <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-6">
      {/* Заголовок внутри блока */}
      <h3 className="text-lg font-semibold text-[#111]">О компании</h3>

      {/* Логотип */}
      <div className="flex justify-center">
        <Image
          src="/icons/LogoTannur.svg"
          alt="Tannur"
          width={80}
          height={30}
        />
      </div>

      {/* Основной текст */}
      <p className="text-xs text-gray-500 leading-relaxed">
        It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more‑or‑less normal distribution of letters, as opposed to using 'Content here', making it look like readable English.
      </p>

      {/* Дополнительный текст */}
      <p className="text-xs text-gray-500 leading-relaxed">
        Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy.
      </p>

      {/* Сегментированные кнопки */}
      <div className="inline-flex overflow-hidden rounded-lg border border-[#DC7C67]">
        {/* Перейти на сайт */}
        <a
          href="#"
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-[#DC7C67] text-white text-sm"
        >
          <Image
            src="/icons/IconLink.svg"
            alt="link"
            width={16}
            height={16}
          />
          Перейти на сайт
        </a>

        {/* Завод Tannur */}
        <a
          href="#"
          className="flex items-center gap-2 px-4 py-2 bg-white text-[#111] text-sm"
        >
          <Image
            src="/icons/IconFactory.svg"
            alt="factory"
            width={16}
            height={16}
          />
          Завод Tannur
        </a>
      </div>
    </div>
  </>
}

        </>
      }
      // Третья колонка: товары
      column3={
        <>
          {/* Заголовок магазина */}
          <div className="flex justify-between mt-6 items-center px-6 md:px-8 pl-0 md:pl-0 text-[#111] text-3xl font-semibold mb-6">
            <span>Tannur Store</span>
            <Image
              src="/icons/IconFilterBlack.svg"
              alt="filter"
              width={20}
              height={20}
            />
          </div>

          {/* Ряды карточек */}
          <div className="px-1 mt-1 gap-6">
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
              <ProductCard widthClass="w-[500px]" heightClass="h-[360px]">
                <div className="relative flex flex-col h-full overflow-hidden">
                  <div className="relative flex-shrink-0 h-[240px]">
                    <img
                      src="/icons/6StepTannurCareSet.png"
                      alt="flagship"
                      className="w-full h-full object-cover rounded-t-2xl"
                    />
                    <span className="absolute top-4 right-4 bg-[#BE345D] text-white text-xs font-medium px-3 py-1 rounded-full">
                      Флагман продукт
                    </span>
                  </div>
                  <div className="px-6 mt-4 flex-grow">
                    <h3 className="text-sm font-medium text-black">
                      6‑этапный уходовый набор Tannur
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Дилерская цена</p>
                    <p className="text-sm text-black mt-3">89 850 ₸</p>
                  </div>
                  <button className="absolute bottom-4 right-4 z-10 w-8 h-8 bg-[#DC867B] rounded-md flex items-center justify-center hover:bg-opacity-90 transition">
                    <img
                      src="/icons/Icon arow botom white.png"
                      alt="go"
                      className="w-4 h-4"
                    />
                  </button>
                </div>
              </ProductCard>
            </div>
            <div className="flex gap-4 mt-4">
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
        </>
      }
    />
  );
}
