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
  className?: string;
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
    <div className="bg-white rounded-3xl p-2 relative w-full max-w-full">
      {/* Кнопка лайка */}
      <button
        onClick={() => setLiked(!liked)}
        className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10"
      >
        <Image
          src={liked ? '/icons/heart_white.svg' : '/icons/heart_red.svg'}
          alt="like"
          width={24}
          height={24}
          className="hidden md:block"
        />
      </button>

      {/* Фото */}
      <div className="w-full aspect-square relative rounded-2xl overflow-hidden">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
        />
      </div>

      {/* Текст и цены */}
      <div className="p-2 md:p-4 pt-2">
        <h3 className="text-sm sm:text-base font-bold text-[#1C1C1C] mb-2 sm:mb-3 line-clamp-2 min-h-[1.5rem]">
          {name}
        </h3>


        <div className="flex flex-row sm:items-center justify-between gap-2 sm:gap-4">
          {/* Цены */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
            <div>
              <p className="text-xs text-[#8C8C8C] mb-1 leading-none">Диллерская цена</p>
              <p className="text-sm sm:text-base font-semibold text-[#1C1C1C]">
                {dealerPrice.toLocaleString()}₸
              </p>
            </div>

            {showClientPrice && (
              <div>
                <p className="text-xs text-[#8C8C8C] leading-none">Цена</p>
                <p className="text-sm sm:text-base font-semibold text-[#D77E6C]">
                  {clientPrice.toLocaleString()}₸
                </p>
              </div>
            )}
          </div>

          {/* Кнопка → */}
          <div className="shrink-0 self-end sm:self-auto">
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
