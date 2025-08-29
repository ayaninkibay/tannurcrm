'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslate } from '@/hooks/useTranslate';

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
  const router = useRouter();
  const { t } = useTranslate();

  const handleArrowClick = () => {
    router.push(`/dealer/shop/product_view?id=${product?.id || '538dd152-4d6f-471e-8cf1-dcdf6ba564ec'}`);
  };

  // Формируем корректный url картинки
  const getImageUrl = (imageUrl?: string | null) => {
    if (!imageUrl) return '/img/productBig.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${imageUrl}`;
  };

  const [imgSrc, setImgSrc] = useState<string>(getImageUrl(product?.image_url));
  const handleImgError = () => setImgSrc('/img/productBig.jpg');

  return (
    <div className={`bg-white rounded-2xl p-2 relative w-full max-w-full ${className || ''}`}>
      {/* Блок с картинкой */}
      <div className="w-full aspect-[11/5] relative rounded-2xl overflow-hidden">
        <Image
          src={imgSrc}
          alt={product?.name || t('Товар')}
          fill
          priority
          loading="eager"
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={handleImgError}
        />
      </div>

      <div className="p-3 pt-6">
        <div className="flex justify-between items-start -mb-1 gap-2">
          <h3 className="text-base font-bold text-[#1C1C1C] line-clamp-2 min-h-[3rem]">
            {product?.name || t('Без названия')}
          </h3>

          {product?.flagman && (
            <span className="bg-[#D77E6C] text-white text-[10px] font-medium px-3 py-1 rounded-full whitespace-nowrap">
              {t('Хит продаж')}
            </span>
          )}
        </div>

        <div className="flex items-end justify-between gap-2 mt-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
            <div>
              <p className="text-base font-semibold text-[#1C1C1C]">
                {(product?.price_dealer || 0).toLocaleString('ru-RU')}₸
              </p>
            </div>

            {showClientPrice && (
              <div>
                <p className="text-xs text-[#8C8C8C] leading-none">{t('Цена')}</p>
                <p className="text-base font-semibold text-[#D77E6C]">
                  {(product?.price || 0).toLocaleString('ru-RU')}₸
                </p>
              </div>
            )}
          </div>

          <div className="shrink-0 self-end">
            <button onClick={handleArrowClick} aria-label={t('Открыть товар')} title={t('Открыть товар')}>
              <Image
                src="/icons/buttom/DoubleIconArrowOrange.svg"
                alt=""
                aria-hidden="true"
                width={24}
                height={24}
                style={{ height: 'auto' }}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
