'use client';

import React from 'react';
import Image from 'next/image';

interface SponsorCardProps {
  variant?: 'black' | 'gray';
}

export default function SponsorCard({ variant = 'black' }: SponsorCardProps) {
  const isGray = variant === 'gray';
  const bgColor = isGray ? 'bg-gray-100' : 'bg-[#3D3D3D]';
  const textColor = isGray ? 'text-[#111]' : 'text-white';
  const iconColorPrefix = isGray ? '' : '_white';

  return (
    <div className="w-full">
      <p className="text-sm font-medium text-[#111] mb-2">Мой спонсор</p>

      <div className={`relative ${bgColor} rounded-xl p-4 min-h-[140px] overflow-hidden flex flex-col gap-4 md:gap-0 md:block`}>
        {/* Декор */}
        {!isGray && (
          <div className="absolute top-2 right-2 w-[50px] h-[50px] opacity-10">
            <Image
              src="/img/boxes.svg"
              alt="decor"
              fill
              sizes="50px"
              className="object-contain"
            />
          </div>
        )}

        {/* Верхняя часть — Аватар, имя, статус */}
        <div className="flex items-center gap-3">
          <div className="relative mt-2 w-[40px] h-[40px]">
            <Image
              src="/icons/Users avatar 7.png"
              alt="avatar"
              fill
              sizes="40px"
              className="rounded-full object-cover"
            />
          </div>

          <div>
            <p className={`text-xs sm:text-sm ${textColor} flex items-center gap-1`}>
              Маргұза Қағыбат
              <Image
                src={`/icons/confirmed${iconColorPrefix}.svg`}
                alt="check"
                width={14}
                height={14}
              />
            </p>
            <p className={`text-xs ${textColor} flex items-center gap-1`}>
              <Image
                src={`/icons/crown${iconColorPrefix}.svg`}
                alt="crown"
                width={12}
                height={12}
              />
              Основатель
            </p>
          </div>
        </div>

        {/* Телефон и кнопка */}
        <div className="flex flex-col-reverse gap-3 mt-4 md:mt-0 md:flex-row md:items-center md:justify-between absolute bottom-3 left-4 right-4">
          {/* Кнопка */}
          <button
            onClick={() => {}}
            className="flex items-center justify-center gap-2 bg-white border border-gray-100 rounded-full px-3 py-1 text-[10px] md:text-xs text-[#111]"
          >
            <Image
              src="/icons/userblack.svg"
              alt="profile"
              width={12}
              height={12}
            />
            Профиль
          </button>

          {/* Телефон */}
          <div className={`flex items-center gap-1 text-xs justify-end md:justify-start ${textColor}`}>
            <Image
              src={`/icons/buttom/tell${iconColorPrefix}.svg`}
              alt="phone"
              width={12}
              height={12}
            />
            <span>+7 707 700 00 02</span>
          </div>
        </div>
      </div>
    </div>
  );
}