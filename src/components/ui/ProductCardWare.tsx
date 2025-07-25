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
}

export default function ProductCardWare({
  image,
  title,
  priceOld,
  priceNew,
  count,
  onClick,
  className
}: ProductCardWareProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center justify-between rounded-xl px-4 py-2 transition cursor-pointer hover:bg-[#f3f3f3] h-[60px]",
        className
      )}
    >
      {/* Левая часть — картинка и название */}
      <div className="flex items-center gap-4 min-w-0">
        <Image
          src={image}
          alt=""
          width={40}
          height={40}
          className="rounded-lg object-cover flex-shrink-0"
        />
        <span className="text-sm font-medium text-gray-900 truncate">{title}</span>
      </div>

      {/* Правая часть — равномерная сетка */}
      <div className="grid grid-cols-4 gap-6 items-center text-sm text-gray-600 min-w-[400px] text-right">
        <span>{priceOld}</span>
        <span>{priceNew}</span>
        <span className="text-black font-semibold">{count}</span>
        <Image
          src="/icons/Icon arow botom.png"
          alt="arrow"
          width={14}
          height={14}
          className="justify-self-end"
        />
      </div>
    </div>
  );
}
