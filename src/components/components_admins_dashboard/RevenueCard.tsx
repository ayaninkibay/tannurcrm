// src/components/components_admins_dashboard/RevenueCard.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface RevenueCardProps {
  /** Заголовок (например: "Товарооборот магазина") */
  title: string;
  /** Сумма без форматирования (число или строка) */
  amount: number | string;
  /** Ссылка для кнопки-стрелки */
  href: string;
  /** Tailwind-класс для фона карточки (например: "bg-purple-100") */
  bgColor?: string;
}

// src/components/components_admins_dashboard/RevenueCard.tsx
export const RevenueCard: React.FC<RevenueCardProps> = ({
  title,
  amount,
  href,
  bgColor = 'bg-purple-100',
}) => {
  const formatted =
    typeof amount === 'number'
      ? amount.toLocaleString('ru-RU')
      : amount;

  return (
    <div
      className={`
        w-full                /* <-- растягиваем карточку на всю ширину ячейки */
        ${bgColor}
        rounded-2xl p-6
        flex items-center justify-between
      `}
    >
      {/* Текстовая часть: min-w-0 + truncate */}
      <div className="min-w-0">
        <h3 className="text-sm font-medium text-gray-700 truncate">
          {title}
        </h3>
        <p className="mt-2 text-3xl font-bold text-gray-900 whitespace-nowrap">
          {formatted}
          <span className="ml-1 text-3xl font-normal">₸</span>
        </p>
      </div>

      <Link href={href}>
        <Image
          src="/icons/IconArrowBlack.svg"
          width={34}
          height={34}
          alt="Перейти"
        />
      </Link>
    </div>
  );
};
