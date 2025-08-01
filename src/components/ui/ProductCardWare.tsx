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
        // mobile: stacked & centered, desktop: row & spaced
        "flex flex-col sm:flex-row items-center justify-center sm:justify-between rounded-xl " +
        "px-2 py-2 sm:px-4 sm:py-3 transition cursor-pointer hover:bg-[#f3f3f3] " +
        "h-auto sm:h-[72px]",
        className
      )}
    >
      {/* Левая часть — картинка и название, всегда центрированы */}
      <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-4 w-full sm:w-auto">
        <Image
          src={image}
          alt="product"
          width={50}
          height={50}
          className="rounded-lg object-cover flex-shrink-0"
        />
        <span className="text-[10px] sm:text-sm font-medium text-gray-900 truncate">
          {title}
        </span>
      </div>

      {/* Правая часть — сетка, центрируем содержимое на мобильном */}
      <div
        className={cn(
          "grid items-center text-[10px] sm:text-sm text-gray-600 " +
          "w-full sm:w-auto gap-2 sm:gap-4 " +
          (showArrow ? "grid-cols-4" : "grid-cols-3") + " " +
          "text-center sm:text-right"
        )}
      >
        <span className="justify-self-center sm:justify-self-auto">{priceOld}</span>
        <span className="justify-self-center sm:justify-self-auto">{priceNew}</span>
        <span className="text-black font-semibold justify-self-center sm:justify-self-auto">
          {count}
        </span>
        {showArrow && (
          <Image
            src="/icons/IconArowBotomOrange.png"
            alt="arrow"
            width={18}
            height={18}
            className="justify-self-center sm:justify-self-auto"
          />
        )}
      </div>
    </div>
  );
}
