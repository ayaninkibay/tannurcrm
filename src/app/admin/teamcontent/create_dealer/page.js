'use client';

import Image from 'next/image';
import { useState } from 'react';
import MoreHeader from '@/components/header/MoreHeader';

export default function CreateDealer() {
  const [fileName, setFileName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <div className="min-h-screen pl-[140px] pr-6 pt-6 bg-[#F6F6F6]">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
        {/* Хлебные крошки */}
        <MoreHeader
          title={
            <span>
              <span className="text-gray-400">Tannur</span>
              <span className="mx-1 text-[#111]">/</span>
              <span className="text-[#111]">Создать профиль дилера</span>
            </span>
          }
        />

        <div className="flex gap-6 w-full">
          {/* Левая часть — форма */}
          <div className="bg-white rounded-2xl p-10 flex-1 shadow-sm text-gray-700">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Image src="/icons/IconAppsOrange.svg" width={20} height={20} alt="icon" />
              Регистрация дилера
            </h2>

<div className="grid grid-cols-2 gap-x-6 gap-y-6">
  {/* Имя + Фамилия вместе */}
<div className="flex flex-col gap-6">
  <div className="flex flex-col gap-2">
    <label className="text-sm text-gray-600">Имя</label>
    <input type="text" className="input-new bg-[#F6F6F6] rounded-xl h-[50px]" />
  </div>

  <div className="flex flex-col gap-2">
    <label className="text-sm text-gray-600">Фамилия</label>
    <input type="text" className="input-new bg-[#F6F6F6] rounded-xl h-[50px]" />
  </div>
</div>


 <div className="flex flex-col gap-2">
  <label className="text-sm text-gray-600">Фотография</label>
  <label className="cursor-pointer bg-[#F6F6F6] border-2 border-dashed border-gray-300 rounded-xl h-[150px] flex items-center justify-center text-gray-500 text-sm">
    <input
      type="file"
      accept="image/*"
      className="hidden"
      onChange={handleFileChange}
    />
    <div className="flex flex-col items-center gap-1">
      <img src="/icons/IconFileGray.svg" alt="upload" className="w-6 h-6" />
      <span>{fileName ? fileName : 'Выберите файл'}</span>
    </div>
  </label>
</div>


<div className="flex flex-col gap-2 relative">
  <label className="text-sm text-gray-600">Введите пароль</label>
  <input
    type={showPassword ? 'text' : 'password'}
    className="input-new h-[50px] rounded-xl bg-[#F6F6F6] pr-10"
  />
  <img
    src={showPassword ? "/icons/OffEye.svg" : "/icons/OnEye.svg"}
    alt="eye"
    className="absolute right-3 top-[44px] w-5 h-5 opacity-60 cursor-pointer"
    onClick={() => setShowPassword(!showPassword)}
  />
</div>


  <div className="flex flex-col gap-2">
    <label className="text-sm text-gray-600">Введите e-mail</label>
    <input type="email" className="input-new bg-[#F6F6F6] rounded-xl h-[50px]" />
  </div>

<div className="flex flex-col gap-2 relative">
  <label className="text-sm text-gray-600">Повторите пароль</label>
  <input
    type={showRepeatPassword ? 'text' : 'password'}
    className="input-new h-[50px] rounded-xl bg-[#F6F6F6] pr-10"
  />
  <img
    src={showRepeatPassword ? "/icons/OffEye.svg" : "/icons/OnEye.svg"}
    alt="eye"
    className="absolute right-3 top-[44px] w-5 h-5 opacity-60 cursor-pointer"
    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
  />
</div>


  <div className="flex flex-col gap-2">
    <label className="text-sm text-gray-600">Телефон</label>
    <input type="tel" className="input-new bg-[#F6F6F6] rounded-xl h-[50px]" />
  </div>

 
</div>


            <button className="mt-8 bg-[#D46F4D] text-white py-3 px-61 rounded-xl hover:opacity-90 transition w-fit">
              Создать
            </button>
          </div>

          {/* Правая часть */}
          <div className="flex flex-col gap-6 w-[370px] shrink-0">
            {/* Карточка спонсора */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-700 mb-2">Ваш спонсор</p>
              <div className="w-full">
                <div className="relative bg-[#2D2D2D] rounded-xl p-4 pb-7 min-h-[120px]">
                  <img
                    src="/icons/IconDecorGray.svg"
                    alt="decor"
                    className="absolute top-2 right-2 w-[50px] h-[50px]"
                  />
                  <div className="flex items-center gap-3">
                    <img
                      src="/icons/Usersavatar6.png"
                      alt="sponsor"
                      className="w-[40px] h-[40px] rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm text-white flex items-center gap-1">
                        Маргұза Қағыбат
                        <img src="/icons/IconCheckMarkWhite.png" alt="check" className="w-[14px] h-[14px]" />
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <img src="/icons/IconCrownGray.svg" alt="crown" className="w-[12px] h-[12px]" />
                        VIP наставник
                      </p>
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-4">
                    <button className="flex items-center gap-2 bg-white border border-gray-100 rounded-full px-3 py-1 text-[10px] text-[#111]">
                      <img src="/icons/Icon profile.png" alt="user" className="w-[12px] h-[12px]" />
                      Посмотреть профиль
                    </button>
                  </div>
                  <div className="absolute bottom-3 right-4 flex items-center gap-1 text-xs text-white">
                    <img src="/icons/IconPhoneWhite.svg" alt="phone" className="w-[12px] h-[12px]" />
                    <span>+7 707 700 00 02</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Инструкция */}
            <div className="bg-white rounded-2xl p-9 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Инструкция по созданию дилера</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                It is a long established fact that a reader will be distracted Many desktop publishing packages and web page by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.
                Many desktop publishing packages and by the readable content of  web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).
              </p>
            </div>
          </div>
        </div>
      </div>

<style jsx>{`
  .input-new {
    @apply w-full rounded-xl bg-[#D9D9D9] text-gray-600 px-4 text-sm placeholder-gray-400
      border border-gray-300
      focus:border-gray-400 focus:outline-none focus:ring-0 focus:shadow-none;
  }
`}</style>


    </div>
  );
}
