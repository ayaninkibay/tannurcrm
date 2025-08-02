'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import MoreHeader from '@/components/header/MoreHeader';
import SponsorCard from '@/components/blocks/SponsorCard';

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
            <span className="text-[#111]">Создать профиль дилера</span>
          </span>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 mt-6 md:p-6">
        {/* Левая часть — форма (5/7 на десктопе) */}
        <div className="col-span-1 lg:col-span-5 bg-white rounded-2xl p-6 text-gray-700">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Image src="/icons/IconAppsOrange.svg" width={20} height={20} alt="icon" />
            Регистрация дилера
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Имя */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600">Имя</label>
              <input
                type="text"
                className="w-full bg-[#F6F6F6] rounded-xl px-4 py-3 text-sm focus:outline-none"
                placeholder="Введите имя"
              />
                   <div className="flex flex-col gap-2 mt-9">
              <label className="text-sm text-gray-600">Фамилия</label>
              <input
                type="text"
                className="w-full bg-[#F6F6F6] rounded-xl px-4 py-3 text-sm focus:outline-none"
                placeholder="Введите фамилию"
              />
            </div>
            </div>

                  {/* Фотография (растягивается на две колонки) */}
            <div className="sm:col-span-1 flex flex-col gap-2">
              <label className="text-sm text-gray-600">Фотография</label>
              <label className="cursor-pointer bg-[#F6F6F6] border-2 border-dashed border-gray-300 rounded-xl h-40 flex items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="flex flex-col items-center gap-1 text-gray-500 text-sm">
                  <Image src="/icons/IconFileGray.svg" alt="upload" width={24} height={24} />
                  <span>{fileName || 'Выберите файл'}</span>
                </div>
              </label>
            </div>      

            {/* Пароль */}
            <div className="flex flex-col gap-2 relative">
              <label className="text-sm text-gray-600">Введите пароль</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full bg-[#F6F6F6] rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none"
                placeholder="Пароль"
              />
              <button
                type="button"
                className="absolute right-3 top-11"
                onClick={() => setShowPassword(prev => !prev)}
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
              <label className="text-sm text-gray-600">Повторите пароль</label>
              <input
                type={showRepeatPassword ? 'text' : 'password'}
                className="w-full bg-[#F6F6F6] rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none"
                placeholder="Повтор пароля"
              />
              <button
                type="button"
                className="absolute right-3 top-11"
                onClick={() => setShowRepeatPassword(prev => !prev)}
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

            {/* E-mail */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600">Введите e-mail</label>
              <input
                type="email"
                className="w-full bg-[#F6F6F6] rounded-xl px-4 py-3 text-sm focus:outline-none"
                placeholder="Email"
              />
            </div>

            {/* Телефон */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600">Телефон</label>
              <input
                type="tel"
                className="w-full bg-[#F6F6F6] rounded-xl px-4 py-3 text-sm focus:outline-none"
                placeholder="Номер телефона"
              />
            </div>

            {/* Кнопка Создать (на ширину двух колонок) */}
            <div className="sm:col-span-2">
              <button className="w-full bg-[#D46F4D] text-white py-3 rounded-xl hover:opacity-90 transition">
                Создать
              </button>
            </div>
          </div>
        </div>

        {/* Правая часть */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          {/* Ваш спонсор */}
          <div className="bg-white rounded-2xl p-2 ">
            <div className="mt-3">
          <SponsorCard variant="gray"/>
            {/* Здесь можно добавить контент */}
          </div>
          </div>

          {/* Инструкция */}
          <div className="bg-white h-full w-full rounded-2xl p-6 ">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              Инструкция по созданию дилера
            </h3>
            <div className="text-xs text-gray-500 leading-relaxed space-y-4 max-h-[300px] overflow-auto">
              <p>
                               It is a long established fact that a reader will be distracted Many desktop publishing packages and web page by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.
                Many desktop publishing packages and by the readable content of  web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).
              </p>
              {/* Остальной текст */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
