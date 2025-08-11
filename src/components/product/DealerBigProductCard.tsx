'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Import useRouter

interface DealerProductCardProps {
  id: number;
  name: string;
  dealerPrice: number;
  clientPrice: number;
  showClientPrice: boolean;
  imageUrl: string;
  className?: string;
}

export default function DealerBigProductCard({
  id,
  name,
  dealerPrice,
  clientPrice,
  showClientPrice,
  imageUrl,
}: DealerProductCardProps) {
  const [liked, setLiked] = useState(false);
  const router = useRouter(); // Initialize useRouter

  const handleArrowClick = () => {
    router.push('/dealer/shop/product_view'); // Navigate to the product view page
  };

  return (
    <div className={`bg-white rounded-2xl p-2 relative w-full max-w-full`}>
      {/* Кнопка лайка — компактнее */}
      <button
        onClick={() => setLiked(!liked)}
        className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10"
        aria-label="like"
      >
        <Image
          src={liked ? '/icons/heart_white.svg' : '/icons/heart_red.svg'}
          alt="like"
          width={24}
          height={24}
          className="hidden md:block"
        />
      </button>

      {/* Фото — ниже по высоте */}
      <div className="w-full aspect-[11/5] relative rounded-2xl overflow-hidden">
        <Image src={imageUrl} alt={name} fill className="object-cover" />
      </div>

      {/* Контент — компактнее */}
      <div className="p-3 pt-6">
        {/* Название + флагман */}
        <div className="flex justify-between items-start -mb-1 gap-2">
          <h3 className="text-base font-bold text-[#1C1C1C] line-clamp-2 min-h-[3rem]">
            {name}
          </h3>

          <span className="bg-[#D77E6C] text-white text-[10px] font-medium px-3 py-1 rounded-full whitespace-nowrap">
            Хит продаж
          </span>
        </div>

        {/* Цены + стрелка */}
        <div className="flex items-end justify-between gap-2 mt-1">
          {/* Блок цен */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
            <div>
              <p className="text-xs text-[#8C8C8C] leading-none">Диллерская цена</p>
              <p className="text-base font-semibold text-[#1C1C1C]">
                {dealerPrice.toLocaleString()}₸
              </p>
            </div>

            {showClientPrice && (
              <div>
                <p className="text-xs text-[#8C8C8C] leading-none">Цена</p>
                <p className="text-base font-semibold text-[#D77E6C]">
                  {clientPrice.toLocaleString()}₸
                </p>
              </div>
            )}
          </div>

          {/* Кнопка → */}
          <div className="shrink-0 self-end">
            <button onClick={handleArrowClick} aria-label="View Product"> {/* Add onClick handler */}
              <Image
                src="/icons/buttom/DoubleIconArrowOrange.svg"
                alt="arrow"
                width={24}
                height={24}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}