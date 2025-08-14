'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface DealerBigProductCardProps {
  product: any;
  showClientPrice: boolean;
  className?: string;
}

export default function DealerBigProductCard({
  product,
  showClientPrice,
  className
}: DealerBigProductCardProps) {
  const [liked, setLiked] = useState(false);
  const router = useRouter();

  const handleArrowClick = () => {
    // Всегда переходим на страницу с фиксированным товаром
    router.push('/dealer/shop/product_view?id=538dd152-4d6f-471e-8cf1-dcdf6ba564ec');
  };

  // Функция для получения URL изображения
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/img/productBig.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${imageUrl}`;
  };

  return (
    <div className={`bg-white rounded-2xl p-2 relative w-full max-w-full ${className}`}>
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

      <div className="w-full aspect-[11/5] relative rounded-2xl overflow-hidden">
        <Image 
          src={getImageUrl(product.image_url)} 
          alt={product.name || 'Товар'} 
          fill 
          className="object-cover"
          onError={(e) => {
            e.currentTarget.src = '/img/productBig.jpg';
          }}
        />
      </div>

      <div className="p-3 pt-6">
        <div className="flex justify-between items-start -mb-1 gap-2">
          <h3 className="text-base font-bold text-[#1C1C1C] line-clamp-2 min-h-[3rem]">
            {product.name || 'Без названия'}
          </h3>

          {product.flagman && (
            <span className="bg-[#D77E6C] text-white text-[10px] font-medium px-3 py-1 rounded-full whitespace-nowrap">
              Хит продаж
            </span>
          )}
        </div>

        <div className="flex items-end justify-between gap-2 mt-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
            <div>
              <p className="text-xs text-[#8C8C8C] leading-none">Дилерская цена</p>
              <p className="text-base font-semibold text-[#1C1C1C]">
                {(product.price_dealer || 0).toLocaleString('ru-RU')}₸
              </p>
            </div>

            {showClientPrice && (
              <div>
                <p className="text-xs text-[#8C8C8C] leading-none">Цена</p>
                <p className="text-base font-semibold text-[#D77E6C]">
                  {(product.price || 0).toLocaleString('ru-RU')}₸
                </p>
              </div>
            )}
          </div>

          <div className="shrink-0 self-end">
            <button onClick={handleArrowClick} aria-label="View Product">
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