'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import MoreHeader from '@/components/header/MoreHeader';

export default function CreateDealer() {
  const [fileName, setFileName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

 const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <div className="flex flex-col bg-[#F6F6F6] min-h-screen">
      <MoreHeader
        title={
          <span>
            <span className="text-gray-400">Tannur</span>
            <span className="mx-1 text-[#111]">/</span>
            <span className="text-[#111]">Создать профиль Знаменитости</span>
          </span>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-7 mt-5  gap-6 ">
        {/* Левая часть: форма (5/7 на десктопе) */}
        <div className="bg-white rounded-2xl p-6 col-span-1 lg:col-span-5 shadow-sm text-gray-700">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Image src="/icons/IconStarOrange.svg" width={20} height={20} alt="icon" />
            Регистрация знаменитости
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Имя */}
<div className="flex flex-col gap-2">
      <label className="text-sm text-gray-500">Имя</label>
      <input type="text" className="w-full bg-[#F6F6F6] rounded-xl p-3 text-sm" placeholder="Введите имя" />
       {/* Фамилия */}
    <div className="flex flex-col mt-8 gap-2">
      <label className="text-sm text-gray-500">Фамилия</label>
      <input type="text" className="w-full bg-[#F6F6F6] rounded-xl p-3 text-sm" placeholder="Введите фамилию" />
    </div>
    </div>

   {/* Фотографии — занимает обе колонки */}
    <div className="sm:col-span-1 flex flex-col gap-2">
      <label className="text-sm text-gray-500">Фотография</label>
      <label className="cursor-pointer bg-[#F6F6F6] border-2 border-dashed border-gray-300 rounded-xl h-40 flex items-center justify-center">
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <div className="flex flex-col items-center gap-1 text-gray-500 text-sm">
          <Image src="/icons/IconFileGray.svg" alt="upload" width={24} height={24} />
          <span>{fileName || 'Выберите файл'}</span>
        </div>
      </label>
    </div>

   

 

    {/* Пароль */}
    <div className="flex flex-col gap-2 relative">
      <label className="text-sm text-gray-500">Введите пароль</label>
      <input
        type={showPassword ? 'text' : 'password'}
        className="w-full bg-[#F6F6F6] rounded-xl p-3 pr-10 text-sm"
        placeholder="Пароль"
      />
      <button
        type="button"
        className="absolute right-3 top-11"
        onClick={() => setShowPassword(!showPassword)}
      >
        <Image
          src={showPassword ? '/icons/OffEye.svg' : '/icons/OnEye.svg'}
          alt="toggle"
          width={20}
          height={20}
          className="opacity-60"
        />
      </button>
    </div>

 {/* Повторите пароль */}
    <div className="flex flex-col gap-2 relative">
      <label className="text-sm text-gray-500">Повторите пароль</label>
      <input
        type={showRepeatPassword ? 'text' : 'password'}
        className="w-full bg-[#F6F6F6] rounded-xl p-3 pr-10 text-sm"
        placeholder="Повтор пароля"
      />
      <button
        type="button"
        className="absolute right-3 top-11"
        onClick={() => setShowRepeatPassword(!showRepeatPassword)}
      >
        <Image
          src={showRepeatPassword ? '/icons/OffEye.svg' : '/icons/OnEye.svg'}
          alt="toggle"
          width={20}
          height={20}
          className="opacity-60"
        />
      </button>
    </div>
    
    {/* Телефон */}
    <div className="flex flex-col gap-2">
      <label className="text-sm text-gray-500">Телефон</label>
      <input type="tel" className="w-full bg-[#F6F6F6] rounded-xl p-3 text-sm" placeholder="Номер телефона" />
    </div>

   

    {/* Instagram */}
    <div className="flex flex-col gap-2">
      <label className="text-sm text-gray-500">Instagram</label>
      <input type="text" className="w-full bg-[#F6F6F6] rounded-xl p-3 text-sm" placeholder="Ссылка на профиль" />
    </div>

    {/* E-mail */}
    <div className="flex flex-col gap-2">
      <label className="text-sm text-gray-500">Введите e-mail</label>
      <input type="email" className="w-full bg-[#F6F6F6] rounded-xl p-3 text-sm" placeholder="Email" />
    </div>

    {/* Подписчики */}
    <div className="flex flex-col gap-2">
      <label className="text-sm text-gray-500">Количество подписчиков в Tannur</label>
      <input type="number" className="w-full bg-[#F6F6F6] rounded-xl p-3 text-sm" placeholder="0" />
    </div>

    {/* Кнопка Создать — на всю ширину */}
    <div className="sm:col-span-2">
      <button className="w-full bg-[#D46F4D] text-white p-3 rounded-xl hover:opacity-90 transition">
        Создать
      </button>
    </div>
          </div>
        </div>

        {/* Правая часть: Инструкция и статус (2/7 на десктопе) */}
        <div className="flex flex-col gap-6  col-span-1 lg:col-span-2">
          <div className="bg-white rounded-2xl h-full w-full p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Инструкция для знаменитости
            </h3>
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-1">Статус</p>
              <div className="inline-flex items-center gap-2 bg-[#D46F4D] text-white px-4 py-1 rounded-full text-sm font-medium">
                <img
                  src="/icons/IconStarWhite.svg"
                  alt="star"
                  className="w-4 h-4"
                />
                Знаменитость
              </div>
            </div>
            <div className="text-xs text-gray-500 leading-relaxed space-y-4 max-h-[300px] overflow-auto">
              <p>
                It is a long established fact that a reader will be distracted by the readable content of a page
                when looking at its layout.
              </p>
              <p>
                Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model
                text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy.
              </p>
              <p>
                Various versions have evolved over the years, sometimes by accident, sometimes on purpose.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
