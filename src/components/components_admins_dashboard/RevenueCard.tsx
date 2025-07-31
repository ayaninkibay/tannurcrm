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
    <div className={` ${bgColor} rounded-2xl p-6 flex items-center justify-between`}>
      <div>
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        <p className="mt-2 text-3xl font-bold text-gray-900">
          {formatted}
          <span className="ml-1 text-3xl font-normal">₸</span>
        </p>
      </div>
      <Link
        href={href}
        className=""
      >
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

// Пример использования в странице
// import { RevenueCard } from '@/components/components_admins_dashboard/RevenueCard';
//
// <RevenueCard
//   title="Товарооборот магазина"
//   amount={84213000}
//   href="/admin/revenue"
// />
