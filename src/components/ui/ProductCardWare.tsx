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
        // Используем ту же сетку, что и для заголовков в родительском компоненте
        "grid grid-cols-5 gap-9 w-full items-center",
        
        // Общие стили для карточки
        "rounded-xl px-2 py-2 sm:px-4 sm:py-3",
        "transition cursor-pointer hover:bg-[#f3f3f3]",
        "h-auto sm:h-[72px]",

        // Адаптивный шрифт
        "text-gray-600 text-[10px] sm:text-sm md:text-base lg:text-lg",
        
        className
      )}
    >
      {/* КОЛОНКА 1: Наименование */}
      <div className="flex items-center gap-2 sm:gap-4 text-left overflow-hidden">
        <Image
          src={image}
          alt="product"
          width={50}
          height={50}
          className="rounded-lg object-cover flex-shrink-0"
        />
        {/* Текст обрезается, чтобы не выходить за границы колонки */}
        <span className="font-medium text-gray-900 truncate">
          {title}
        </span>
      </div>

      {/* КОЛОНКА 2: Цена Магазин */}
      <span className="whitespace-nowrap text-center">{priceOld}</span>
      
      {/* КОЛОНКА 3: Цена Дилер */}
      <span className="whitespace-nowrap text-center">{priceNew}</span>
      
      {/* КОЛОНКА 4: Кол-во */}
      <span className="text-black font-semibold whitespace-nowrap text-center">{count}</span>
      
      {/* КОЛОНКА 5: Инфо */}
      <div className="flex justify-center">
        {showArrow && (
          <Image
            src="/icons/IconArowBotomOrange.png"
            alt="arrow"
            width={18}
            height={18}
          />
        )}
      </div>
    </div>
  );
}
