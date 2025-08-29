// src/components/product/CelebrityProductCard.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { useTranslate } from '@/hooks/useTranslate';

interface CelebrityProductCardProps {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  imageUrl: string;
  isHit?: boolean;
  isNew?: boolean;
  inStock?: boolean;
  className?: string;
  onAddToCart?: (id: number) => void;
  onLikeToggle?: (id: number, liked: boolean) => void;
  onOpen?: (id: number) => void;
}

export default function CelebrityProductCard({
  id,
  name,
  price,
  oldPrice,
  imageUrl,
  isHit = false,
  isNew = false,
  inStock = true,
  className,
  onAddToCart,
  onLikeToggle,
  onOpen,
}: CelebrityProductCardProps) {
  const { t } = useTranslate();
  const [liked, setLiked] = useState(false);

  const discount =
    oldPrice && oldPrice > price
      ? Math.round((1 - price / oldPrice) * 100)
      : 0;

  const handleLike = () => {
    const next = !liked;
    setLiked(next);
    onLikeToggle?.(id, next);
  };

  return (
    <div
      className={clsx(
        'bg-white rounded-3xl p-2 relative w-full max-w-full group',
        className
      )}
    >
      {/* Лайк */}
      <button
        onClick={handleLike}
        className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10"
        aria-label={t('Добавить в избранное')}
        title={t('Добавить в избранное')}
      >
        <Image
          src={liked ? '/icons/heart_white.svg' : '/icons/heart_red.svg'}
          alt="like"
          width={24}
          height={24}
          className="hidden md:block"
        />
      </button>

      {/* Бэйджи */}
      <div className="absolute left-2 top-2 sm:left-4 sm:top-4 z-10 flex gap-2">
        {isHit && (
          <span className="bg-[#D77E6C] text-white text-[10px] font-medium px-3 py-1 rounded-full">
            {t('Хит')}
          </span>
        )}
        {isNew && (
          <span className="bg-black text-white text-[10px] font-medium px-3 py-1 rounded-full">
            {t('Новинка')}
          </span>
        )}
        {!inStock && (
          <span className="bg-gray-300 text-[#1C1C1C] text-[10px] font-medium px-3 py-1 rounded-full">
            {t('Нет в наличии')}
          </span>
        )}
      </div>

      {/* Фото */}
      <button
        onClick={() => onOpen?.(id)}
        className="w-full aspect-square relative rounded-2xl overflow-hidden"
        aria-label={t('Подробнее')}
        title={t('Подробнее')}
      >
        <Image src={imageUrl} alt={name} fill className="object-cover" />
      </button>

      {/* Контент */}
      <div className="p-2 md:p-4 pt-2">
        <button
          onClick={() => onOpen?.(id)}
          className="text-left block w-full"
          title={name}
        >
          <h3 className="text-sm sm:text-base font-bold text-[#1C1C1C] mb-2 sm:mb-3 line-clamp-2 min-h-[1.5rem]">
            {name}
          </h3>
        </button>

        <div className="flex items-end justify-between gap-3">
          {/* Цены */}
          <div className="flex items-baseline gap-3">
            <p className="text-sm sm:text-base font-semibold text-[#D77E6C]">
              {price.toLocaleString()}₸
            </p>
            {oldPrice && oldPrice > price && (
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-[#8C8C8C] line-through">
                  {oldPrice.toLocaleString()}₸
                </span>
                {discount > 0 && (
                  <span className="text-[10px] font-medium bg-[#FFE9E4] text-[#D77E6C] px-2 py-0.5 rounded-full">
                    -{discount}%
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Действия */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddToCart?.(id)}
              disabled={!inStock}
              className={clsx(
                'text-xs sm:text-sm px-3 py-2 rounded-full border transition',
                inStock
                  ? 'border-[#D77E6C] text-[#D77E6C] hover:bg-[#D77E6C] hover:text-white'
                  : 'border-gray-300 text-gray-400 cursor-not-allowed'
              )}
            >
              {t('В корзину')}
            </button>

            <button
              onClick={() => onOpen?.(id)}
              className="shrink-0"
              aria-label={t('Подробнее')}
              title={t('Подробнее')}
            >
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
