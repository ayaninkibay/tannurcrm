// src/components/ui/ProductCardWare.tsx
'use client';

import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductCardWareProps {
  image: string;
  title: string;
  priceOld: string;
  priceNew: string;
  count: number;
  onClick?: () => void;
  className?: string;
  showArrow?: boolean;
}

export default function ProductCardWare({
  image,
  title,
  priceOld,
  priceNew,
  count,
  onClick,
  className,
  showArrow = true,
}: ProductCardWareProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        // теперь всегда flex-row + wrap, чтобы не ломаться на мобильных
        "flex flex-row flex-wrap items-center justify-between" +
        " rounded-xl px-2 py-2 sm:px-4 sm:py-3" +
        " transition cursor-pointer hover:bg-[#f3f3f3]" +
        " h-auto sm:h-[72px]",
        className
      )}
    >
      {/* Левая часть — картинка + название */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <Image
          src={image}
          alt="product"
          width={50}
          height={50}
          className="rounded-lg object-cover"
        />
        <span className="text-[10px] sm:text-sm font-medium text-gray-900 truncate">
          {title}
        </span>
      </div>

      {/* Правая часть — цены + количество + стрелка */}
      <div
        className={cn(
          "flex flex-row flex-wrap items-center gap-2 sm:gap-4" +
          " ml-auto" +                // чтобы при wrap правая часть уходила вправо
          " text-[10px] sm:text-sm text-gray-600"
        )}
      >
        <span className="whitespace-nowrap">{priceOld}</span>
        <span className="whitespace-nowrap">{priceNew}</span>
        <span className="text-black font-semibold whitespace-nowrap">{count}</span>
        {showArrow && (
          <Image
            src="/icons/IconArowBotomOrange.png"
            alt="arrow"
            width={18}
            height={18}
            className="whitespace-nowrap"
          />
        )}
      </div>
    </div>
  );
}
