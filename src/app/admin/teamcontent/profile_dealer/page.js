'use client';

import React from 'react';
import Image from 'next/image';
import MoreHeader from '@/components/header/MoreHeader';
import { ThirdTemplate } from '@/components/layouts/TannurPageTemplates';
import DealerPost from '@/components/ui/DealerPost';

export default function ProfileDealer() {
  // Функция копирования ссылки в буфер обмена
  const handleCopy = () => {
    const text = 'tannur.app/KZ848970';
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert('Ссылка скопирована!');
      })
      .catch(() => {
        alert('Не удалось скопировать ссылку');
      });
  };

  return (
    <ThirdTemplate
      header={
        <MoreHeader
          title={
            <span>
              <span className="text-gray-400">Tannur</span>
              <span className="mx-1 text-[#111]">/</span>
              <span className="text-[#111]">Профиль дилера</span>
            </span>
          }
        />
      }
      // Левая колонка: команда и инструкция
      column1={
        <>
          {/* Команда + ссылка */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
  {/* Топовая часть: заголовок + аватарки */}
  <div className="flex justify-between items-start mb-6">
    {/* Заголовок и число */}
    <div>
      <p className="text-sm text-gray-600">Команда Алина</p>
      <p className="text-2xl font-bold text-[#111]">68 человек</p>
    </div>

    {/* Схема аватарок */}
    <div className="relative w-[200px] h-[130px]">
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="100" y1="15"  x2="80"  y2="50"  stroke="#DC7C67" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="80"  y1="50"  x2="110" y2="70"  stroke="#DC7C67" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="60"  y1="100" x2="110" y2="70"  stroke="#DC7C67" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="160" y1="100" x2="110" y2="70"  stroke="#DC7C67" strokeWidth="2" strokeDasharray="4 4" />
      </svg>

      <img
        src="/icons/Users avatar 1.png"
        alt="user1"
        className="absolute top-[2px]   left-[90px] w-9 h-9 rounded-full border-2 border-[#DC7C67]"
      />
      <img
        src="/icons/Users avatar 2.png"
        alt="user2"
        className="absolute top-[35px]  left-[60px] w-9 h-9 rounded-full border-2 border-[#DC7C67]"
      />
      <img
        src="/icons/Users avatar 3.png"
        alt="user3"
        className="absolute top-[60px]  left-[100px] w-11 h-11 rounded-full border-2 border-white z-10"
      />
      <img
        src="/icons/Users avatar 5.png"
        alt="user4"
        className="absolute top-[79px]  left-[50px] w-9 h-9 rounded-full border-2 border-[#DC7C67]"
      />
      <img
        src="/icons/Users avatar 4.png"
        alt="user5"
        className="absolute top-[92px]  left-[160px] w-9 h-9 rounded-full border-2 border-[#DC7C67]"
      />
    </div>
  </div>

  {/* Ссылка для приглашения */}
  <div className="w-full bg-[#DC7C67] text-white rounded-xl p-3">
    <div className="flex items-center gap-2 mb-2">
      <img src="/icons/Iconsharewhite.png" className="w-4 h-4" alt="share" />
      <p className="text-[12px] font-medium">Ссылка для приглашения</p>
    </div>
    <div className="bg-white rounded-md px-3 py-2 flex justify-between items-center">
      <span className="text-[12px] text-black">
        <span className="text-gray-400">tannur.app/</span>KZ848970
      </span>
      <img
        onClick={handleCopy}
        src="/icons/Icon copy gray.png"
        className="w-4 h-4 cursor-pointer"
        alt="copy"
      />
    </div>
  </div>
</div>


          {/* Инструкция */}
<div className="bg-white rounded-2xl p-6 shadow-sm">
  {/* Заголовок */}
  <h2 className="text-2xl font-semibold text-[#111]">
    Награды от Tannur Cosmetics
  </h2>

  {/* Описание */}
  <p className="mt-2 text-sm text-gray-500">
    It is a long established fact that a reader will be distracted by the
    readable content .
  </p>

  {/* Карточки наград */}
  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 mt-15 gap-4">
    {/* Первая карточка */}
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col items-center text-center">
      {/* Иконка */}
      <Image
        src="/icons/IconBulbPink.svg"
        alt="Партнер года"
        width={60}
        height={60}
        className="mb-4"
      />
      {/* Логотип */}
      <Image
        src="/icons/LogotipTannurOrange.svg"
        alt="Tannur logo"
        width={40}
        height={12}
        className="mb-2"
      />
      {/* Текст */}
      <p className="text-sm text-[#111]">
        Партнер года 2025<br />
        II место
      </p>
    </div>

    {/* Вторая карточка */}
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col items-center text-center">
      <Image
        src="/icons/IconballoonsPink.svg"
        alt="Участник Awards"
        width={60}
        height={60}
        className="mb-4"
      />
      <Image
        src="/icons/LogotipTannurOrange.svg"
        alt="Tannur logo"
        width={40}
        height={12}
        className="mb-2"
      />
      <p className="text-sm text-[#111]">
        Участник<br />
        Tannur Awards 2025
      </p>
    </div>
  </div>
</div>

        </>
      }
      // Правая колонка: блок дилера, лента и галерея
      column2={
        <>
          {/* Блок Алина Аскарова */}
         <div className="relative rounded-2xl bg-white overflow-hidden min-h-[280px]">
  {/* Градиентная полоса сверху */}
  <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-r from-[#E79DBB] via-[#EAD2DC] to-[#BAC7EB]" />

  {/* Контент: mobile — flex-col, desktop (md+) — flex-row */}
  <div className="relative pt-36 p-6 flex flex-col items-start gap-4
                  md:p-8 md:flex-row md:items-center md:gap-6">
    {/* Аватар: mobile — 96×96 и «подъём», desktop — 230×230 и mt-10 */}
    <img
      src="/Icons/UsersAvatarPrew.jpg"
      alt="dealer"
      className="
        w-24 h-24 -mt-20          /* мобилка: 96×96 и поднимаем */
        md:w-[230px] md:h-[230px] /* desktop: 230×230 */
        md:mt-10                 /* desktop: смещаем вниз */
        object-cover rounded-2xl
      "
    />

    {/* Информация: mobile — рядом с аватаром, desktop — по центру */}
    <div className="flex-1 flex flex-col justify-center mt-[25px] md:mt-25 gap-1">
      <p className="text-lg font-semibold text-[#111] flex items-center gap-1 md:text-2xl">
        Алина Аскарова
        <Image src="/icons/IconCheckMarkBlue.svg" alt="verify" width={16} height={16} />
      </p>
      <p className="text-xs text-gray-800 md:text-sg">Эксперт</p>
      <p className="text-xs text-gray-500 md:text-sm">inzhu@gmail.com</p>
      <p className="text-xs text-gray-500 md:text-sm">+7 707 700 00 02</p>
    </div>

    {/* Товарооборот: одинаково и на mobile, и на desktop */}
    <div className="absolute bottom-3 right-6 flex flex-col items-end">
      <p className="text-sg text-black">Товарооборот</p>
      <p className="text-2xl font-semibold text-gray-600 flex items-center gap-1">
        7 412 000 ₸
        <Image src="/icons/IconStongs.png" alt="up" width={40} height={40} />
      </p>
    </div>
  </div>

  {/* Дальнейшая разметка (лента, галерея) без изменений */}
</div>

          {/* Лента */}
          <div className="flex justify-between mt-6 items-center px-6 md:px-8 text-[#111] text-xl font-semibold mb-6">
            <span>Лента</span>
            <Image
              src="/icons/IconSettingsBlack.svg"
              alt="settings"
              width={20}
              height={20}
            />
          </div>

          {/* Галерея */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DealerPost
              imageSrc="/icons/gallery1.jpg"
              alt="Gallery image 1"
              title="It is a long established fact that ."
              description="It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English."            
            />
              <DealerPost
              imageSrc="/icons/gallery2.jpg"
              alt="Gallery image 2"
              title="It is a long established fact that ."
              description="It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English."            
            />
             <DealerPost
              imageSrc="/icons/gallery3.jpg"
              alt="Gallery image 3"
              title="It is a long established fact that ."
              description="It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English."            
            />
             <DealerPost
              imageSrc="/icons/gallery1.jpg"
              alt="Gallery image 1"
              title="It is a long established fact that ."
              description="It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English."            
            />
            <DealerPost
              imageSrc="/icons/gallery2.jpg"
              alt="Gallery image 2"
              title="It is a long established fact that ."
              description="It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English."            
            />
             <DealerPost
              imageSrc="/icons/gallery3.jpg"
              alt="Gallery image 3"
              title="It is a long established fact that ."
              description="It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English."            
            />
          </div>
        </>
      }
    />
  );
}
