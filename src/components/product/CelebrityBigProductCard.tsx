'use client';

import { useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { useTranslate } from '@/hooks/useTranslate';

interface CelebrityBigProductCardProps {
  id: number;
  name: string;
  subtitle?: string;
  price: number;
  oldPrice?: number;
  imageUrl: string;
  tag?: 'Хит' | 'Эксклюзив' | 'Новинка' | string;
  inStock?: boolean;
  className?: string;
  onAddToCart?: (id: number) => void;
  onLikeToggle?: (id: number, liked: boolean) => void;
  onOpen?: (id: number) => void;
}

export default function CelebrityBigProductCard({
  id,
  name,
  subtitle,
  price,
  oldPrice,
  imageUrl,
  tag = 'Эксклюзив',
  inStock = true,
  className,
  onAddToCart,
  onLikeToggle,
  onOpen,
}: CelebrityBigProductCardProps) {
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
    <div className={clsx('bg-white rounded-3xl p-2 relative w-full max-w-full', className)}>
      {/* Лайк */}
      <button
        onClick={handleLike}
        className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10"
        aria-label={t('Добавить в избранное')}
        title={t('Добавить в избранное')}
      >
        <Image
          src={liked ? '/icons/heart_white.svg' : '/icons/heart_red.svg'}
          alt=""
          aria-hidden="true"
          width={28}
          height={28}
          className="hidden md:block"
        />
      </button>

      {/* Тэг */}
      {tag && (
        <div className="absolute left-2 top-2 sm:left-4 sm:top-4 z-10">
          <span className="bg-[#1C1C1C] text-white text-[10px] font-medium px-3 py-1 rounded-full">
            {t(tag)}
          </span>
        </div>
      )}

      {/* Более плоское фото */}
      <button
        onClick={() => onOpen?.(id)}
        className="w-full aspect-[11/5] relative rounded-2xl overflow-hidden"
        title={name}
      >
        <Image src={imageUrl} alt={name} fill className="object-cover" />
      </button>

      {/* Контент — компактнее */}
      <div className="p-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <button onClick={() => onOpen?.(id)} className="text-left block">
              <h3 className="text-base sm:text-lg font-bold text-[#1C1C1C] -mb-1 line-clamp-2">
                {name}
              </h3>
              {subtitle && (
                <p className="text-xs sm:text-sm text-[#8C8C8C] mt-2 line-clamp-2">
                  {subtitle}
                </p>
              )}
            </button>
          </div>

          {/* Цена/Скидка */}
          <div className="shrink-0 text-right">
            <div className="flex items-baseline gap-2 justify-end">
              <span className="text-base sm:text-xl font-semibold text-[#D77E6C]">
                {price.toLocaleString()}₸
              </span>
              {oldPrice && oldPrice > price && (
                <>
                  <span className="text-xs sm:text-sm text-[#8C8C8C] line-through">
                    {oldPrice.toLocaleString()}₸
                  </span>
                  {discount > 0 && (
                    <span className="text-[10px] sm:text-xs font-medium bg-[#FFE9E4] text-[#D77E6C] px-2 py-0.5 rounded-full">
                      -{discount}%
                    </span>
                  )}
                </>
              )}
            </div>
            {!inStock && (
              <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                {t('Нет в наличии')}
              </div>
            )}
          </div>
        </div>

        {/* Действия */}
        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            onClick={() => onOpen?.(id)}
            className="inline-flex items-center gap-2 text-sm text-[#1C1C1C] hover:opacity-80"
            aria-label={t('Подробнее')}
            title={t('Подробнее')}
          >
            {t('Подробнее')}
            <Image
              src="/icons/buttom/DoubleIconArrowOrange.svg"
              alt=""
              aria-hidden="true"
              width={24}
              height={24}
            />
          </button>

          <button
            onClick={() => onAddToCart?.(id)}
            disabled={!inStock}
            className={clsx(
              'text-sm sm:text-base px-4 sm:px-6 py-2.5 rounded-full transition',
              inStock ? 'bg-[#D77E6C] text-white hover:opacity-90' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            )}
          >
            {t('В корзину')}
          </button>
        </div>
      </div>
    </div>
  );
}
