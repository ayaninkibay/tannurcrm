'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface DealerProductCardProps {
  product: any;
  showClientPrice: boolean;
  className?: string;
}

export default function DealerProductCard({
  product,
  showClientPrice,
  className
}: DealerProductCardProps) {
  const [imgSrc, setImgSrc] = useState<string>('');
  const router = useRouter();

  const handleArrowClick = () => {
    router.push(`/dealer/shop/product_view?id=${product.id}`);
  };

  const getImageUrl = (imageUrl?: string | null) => {
    if (!imageUrl) return '/img/product1.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${imageUrl}`;
  };

  // Инициализируем изображение при первом рендере
  if (!imgSrc) {
    setImgSrc(getImageUrl(product.image_url));
  }

  const handleImageError = () => {
    setImgSrc('/img/product1.jpg');
  };

  return (
    <div className={`bg-white rounded-2xl sm:rounded-3xl p-2 sm:p-3 relative w-full group hover:shadow-lg transition-all duration-300 ${className}`}>
      {/* Контейнер изображения */}
      <div className="w-full aspect-square relative rounded-xl sm:rounded-2xl overflow-hidden bg-white">
        <Image
          src={imgSrc}
          alt={product.name || 'Товар'}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          onError={handleImageError}
        />

        {/* Флагман бейдж */}
        {product.flagman && (
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2">
            <span className="bg-[#D77E6C] text-white text-[8px] sm:text-[10px] font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
              Хит продаж
            </span>
          </div>
        )}
      </div>

      {/* Информация о товаре */}
      <div className="p-2 sm:p-3 pt-3 sm:pt-4">
        <h3 className="text-xs sm:text-sm font-bold text-[#1C1C1C] mb-2 sm:mb-3 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] leading-tight">
          {product.name || 'Без названия'}
        </h3>

        <div className="flex items-end justify-between gap-2 sm:gap-3">
          <div className="flex flex-col gap-1 sm:gap-2 flex-1 min-w-0">
            {/* Дилерская цена - убираем текст */}
            <div>
              <p className="text-sm sm:text-base font-bold text-[#1C1C1C] truncate">
                {(product.price_dealer || 0).toLocaleString('ru-RU')}₸
              </p>
            </div>

            {/* Розничная цена */}
            {showClientPrice && (
              <div>
                <p className="text-xs text-[#8C8C8C] mb-0.5">Розничная</p>
                <p className="text-xs sm:text-sm font-semibold text-[#D77E6C] truncate">
                  {(product.price || 0).toLocaleString('ru-RU')}₸
                </p>
              </div>
            )}
          </div>

          {/* Кнопка просмотра - используем вашу иконку */}
          <div className="shrink-0">
            <button 
              onClick={handleArrowClick} 
              className="hover:scale-105 transition-transform duration-200"
              aria-label="View Product"
            >
              <Image
                src="/icons/buttom/DoubleIconArrowOrange.svg"
                alt="arrow"
                width={20}
                height={20}
                className="w-5 h-5 sm:w-6 sm:h-6"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}