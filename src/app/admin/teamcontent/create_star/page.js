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
              <span className="text-[#111]">Создать профиль Знаменитости</span>
            </span>
          }
        />

        <div className="flex gap-6 w-full">
          {/* Левая часть — форма */}
          <div className="bg-white rounded-2xl p-10 flex-1 shadow-sm text-gray-700">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Image src="/icons/IconStarOrange.svg" width={20} height={20} alt="icon" />
              Регистрация знаменитости
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
    <label className="text-sm text-gray-600">Телефон</label>
    <input type="tel" className="input-new bg-[#F6F6F6] rounded-xl h-[50px]" />
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
    <label className="text-sm text-gray-600">Instagram</label>
    <input type="email" className="input-new bg-[#F6F6F6] rounded-xl h-[50px]" />
  </div>


  <div className="flex flex-col gap-2">
    <label className="text-sm text-gray-600">Введите e-mail</label>
    <input type="email" className="input-new bg-[#F6F6F6] rounded-xl h-[50px]" />
  </div>

  <div className="flex flex-col gap-2">
    <label className="text-sm text-gray-600">Количество подписчиков в Tannur</label>
    <input type="email" className="input-new bg-[#F6F6F6] rounded-xl h-[50px]" />
  </div>
  

 
</div>


            <button className="mt-8 bg-[#D46F4D] text-white py-3 px-133 rounded-xl hover:opacity-90 transition w-fit">
              Создать
            </button>
          </div>

          {/* Правая часть */}
          <div className="flex flex-col gap-6 w-[370px] shrink-0">


            {/* Инструкция */}
       <div className="bg-white rounded-2xl p-10 shadow-sm">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">Инструкция для знаменитости</h3>

  <div className="mb-4">
    <p className="text-xs text-gray-400 mb-1">Статус</p>
    <div className="flex items-center gap-2 bg-[#D46F4D] text-white px-4 py-1 rounded-full text-sm font-medium w-fit">
      <img src="/icons/IconStarWhite.svg" alt="star" className="w-4 h-4" />
      Знаменитость
    </div>
  </div>

  <div className="text-xs text-gray-500 leading-relaxed mb-10 space-y-4">
    <p>
      It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
      The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here',
      making it look like readable English.
    </p>
    <p>
      Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text,
      and a search for 'lorem ipsum' will uncover many web sites still in their infancy.
    </p>
    <p>
      Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).
    </p>
  </div>
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
