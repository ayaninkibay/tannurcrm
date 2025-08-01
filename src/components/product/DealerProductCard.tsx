'use client';

import { useState } from 'react';
import Image from 'next/image';

interface DealerProductCardProps {
  id: number;
  name: string;
  dealerPrice: number;
  clientPrice: number;
  showClientPrice: boolean;
  imageUrl: string;
}

export default function DealerProductCard({
  id,
  name,
  dealerPrice,
  clientPrice,
  showClientPrice,
  imageUrl,
}: DealerProductCardProps) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="bg-white rounded-3xl p-2 relative text-left w-full max-w-[320px]">
      {/* Кнопка лайка */}
      <button
        onClick={() => setLiked(!liked)}
        className="absolute top-4 right-4 z-10"
      >
        <Image
          src={liked ? '/icons/heart_white.svg' : '/icons/heart_red.svg'}
          alt="like"
          width={24}
          height={24}
        />
      </button>

      {/* Фото */}
      <div className="w-full aspect-[1/1] relative rounded-2xl overflow-hidden">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
        />
      </div>

      {/* 🧱 Внутренний блок: текст, цены, кнопка */}
      <div className="p-2 md:p-4 pt-2">
        {/* Название */}
        <h3 className="text-base font-bold text-[#1C1C1C] mb-3">{name}</h3>

        {/* Цены + стрелка */}
        <div className="flex items-end justify-between gap-2">
          {/* Блок цен */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
            <div>
              <p className="text-xs text-[#8C8C8C] leading-none">Диллерская цена</p>
              <p className="text-base font-semibold text-[#1C1C1C]">
                {dealerPrice.toLocaleString()}₸
              </p>
            </div>

            {showClientPrice && (
              <div>
                <p className="text-[10px] md:text-xs text-[#8C8C8C] leading-none">Цена</p>
                <p className="text-xs md:text-base font-semibold text-[#D77E6C]">
                  {clientPrice.toLocaleString()}₸
                </p>
              </div>
            )}
          </div>

          {/* Кнопка → */}
          <div className="shrink-0">
            <Image
              src="/icons/buttom/DoubleIconArrowOrange.svg"
              alt="arrow"
              width={24}
              height={24}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
