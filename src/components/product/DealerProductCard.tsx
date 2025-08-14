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
  const [liked, setLiked] = useState(false);
  const router = useRouter();

  const handleArrowClick = () => {
    router.push(`/dealer/shop/product_view?id=${product.id}`);
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/img/product1.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${imageUrl}`;
  };

  return (
    <div className={`bg-white rounded-3xl p-2 relative w-full max-w-full ${className}`}>
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

      <div className="w-full aspect-square relative rounded-2xl overflow-hidden">
        <Image
          src={getImageUrl(product.image_url)}
          alt={product.name || 'Товар'}
          fill
          className="object-cover"
          onError={(e) => {
            e.currentTarget.src = '/img/product1.jpg';
          }}
        />
      </div>

      <div className="p-2 md:p-4 pt-2">
        <h3 className="text-sm sm:text-base font-bold text-[#1C1C1C] mb-2 sm:mb-3 line-clamp-2 min-h-[1.5rem]">
          {product.name || 'Без названия'}
        </h3>

        <div className="flex flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
            <div>
              <p className="text-xs text-[#8C8C8C] mb-1 leading-none">Дилерская цена</p>
              <p className="text-sm sm:text-base font-semibold text-[#1C1C1C]">
                {(product.price_dealer || 0).toLocaleString('ru-RU')}₸
              </p>
            </div>

            {showClientPrice && (
              <div>
                <p className="text-xs text-[#8C8C8C] leading-none">Цена</p>
                <p className="text-sm sm:text-base font-semibold text-[#D77E6C]">
                  {(product.price || 0).toLocaleString('ru-RU')}₸
                </p>
              </div>
            )}
          </div>

          <div className="shrink-0 self-end sm:self-auto">
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