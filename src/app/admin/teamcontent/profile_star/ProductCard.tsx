'use client';
import React, { useState } from 'react';
import { useTranslate } from '@/hooks/useTranslate';

export interface ProductCardProps {
  imgSrc?: string;
  title?: string;
  price?: string;
  showHeart?: boolean;          // используется как initialFavorite
  arrowIconSrc?: string;
  widthClass?: string;
  heightClass?: string;
  children?: React.ReactNode;
}

const ProductCard: React.FC<ProductCardProps> = ({
  imgSrc,
  title,
  price,
  showHeart = false,
  arrowIconSrc,
  widthClass  = 'w-[240px]',
  heightClass = 'h-[360px]',
  children,
}) => {
  const { t } = useTranslate();
  const [isFav, setIsFav] = useState(showHeart);

  if (children) {
    return (
      <div className={`${widthClass} ${heightClass} relative bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`${widthClass} ${heightClass} relative bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden flex flex-col`}>
      {/* Кнопка «сердечко» */}
      <button
        type="button"
        className="absolute top-4 right-4 z-10"
        onClick={() => setIsFav(f => !f)}
        aria-label={isFav ? t('В избранном') : t('В избранное')}
        title={isFav ? t('В избранном') : t('В избранное')}
      >
        <img
          src={isFav ? '/icons/Heart red.png' : '/icons/Heart white.png'}
          alt={isFav ? t('В избранном') : t('В избранное')}
          className="w-5 h-5"
        />
      </button>

      {imgSrc && (
        <div className="flex-shrink-0">
          <img
            src={imgSrc}
            alt={t(title ?? '')}
            className="w-full h-[240px] px-1 mt-1 object-cover rounded-t-2xl"
          />
        </div>
      )}

      <div className="px-4 mt-4 flex-grow">
        {title && <h3 className="text-sm font-medium text-black">{t(title)}</h3>}
        {title && <p className="text-xs text-gray-500 mt-1">{t('Дилерская цена')}</p>}
        {price && <p className="text-sm text-black mt-3">{price}</p>}
      </div>

      {arrowIconSrc && (
        <button
          type="button"
          className="absolute bottom-4 right-4 z-10 w-8 h-8 bg-[#DC867B] rounded-md flex items-center justify-center hover:bg-opacity-90 transition"
          aria-label={t('Перейти')}
          title={t('Перейти')}
        >
          <img src={arrowIconSrc} alt={t('Перейти')} className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ProductCard;
