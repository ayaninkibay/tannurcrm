'use client';

import React from 'react';
import Image from 'next/image';

export default function SponsorCard() {
  return (
    <div className="w-full">
      <p className="text-sm font-medium text-[#111] mb-2">Мой спонсор</p>

      <div className="relative bg-[#3D3D3D] rounded-xl p-4 pb-7 min-h-[120px] overflow-hidden">
        {/* Декор */}
        <div className="absolute top-2 right-2 w-[50px] h-[50px] opacity-40">
          <Image
            src="/img/boxes.svg"
            alt="decor"
            fill
            sizes="50px"
            className="object-contain"
          />
        </div>

        {/* Аватар и имя */}
        <div className="flex items-center gap-3">
          <div className="relative w-[40px] h-[40px]">
            <Image
              src="/icons/Users avatar 7.png"
              alt="avatar"
              fill
              sizes="40px"
              className="rounded-full object-cover"
            />
          </div>

          <div>
            <p className="text-sm text-white flex items-center gap-1">
              Маргұза Қағыбат
              <Image
                src="/icons/confirmed_white.svg"
                alt="check"
                width={14}
                height={14}
              />
            </p>
            <p className="text-xs text-white flex items-center gap-1">
              <Image
                src="/icons/crown_white.svg"
                alt="crown"
                width={12}
                height={12}
              />
              VIP наставник
            </p>
          </div>
        </div>

        {/* Кнопка "Посмотреть профиль" */}
        <div className="absolute bottom-3 left-4">
          <button
            onClick={() => {}}
            className="flex items-center gap-2 bg-white border border-gray-100 rounded-full px-3 py-1 text-[10px] text-[#111]"
          >
            <Image
              src="/icons/userblack.svg"
              alt="profile"
              width={12}
              height={12}
            />
            Посмотреть профиль
          </button>
        </div>

        {/* Телефон */}
        <div className="absolute bottom-3 right-4 text-white flex items-center gap-1 text-xs">
          <Image
            src="/icons/buttom/tell_white.svg"
            alt="phone"
            width={12}
            height={12}
          />
          <span>+7 707 700 00 02</span>
        </div>
      </div>
    </div>
  );
}
