// src/components/components_admins_dashboard/RevenueCard.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslate } from '@/hooks/useTranslate';

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
  const { t } = useTranslate();

  const formatted =
    typeof amount === 'number' ? amount.toLocaleString('ru-RU') : amount;

  return (
    <div
      className={`
        w-full
        ${bgColor}
        rounded-2xl 
        p-3 sm:p-4 md:p-6
        flex items-center justify-between
      `}
    >
      {/* Текстовая часть: min-w-0 + truncate */}
      <div className="min-w-0">
        <h3 className="text-xs sm:text-sm font-medium text-gray-700 truncate">
          {t(title)}
        </h3>
        <p className="mt-1 sm:mt-2 text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 whitespace-nowrap">
          {formatted}
          <span className="ml-1 text-lg sm:text-2xl md:text-3xl font-normal">₸</span>
        </p>
      </div>

      <Link href={href} title={t('Перейти')}>
        <Image
          src="/icons/IconArrowBlack.svg"
          width={24}
          height={24}
          className="w-6 h-6 sm:w-8 sm:h-8 md:w-[34px] md:h-[34px]"
          alt={t('Перейти')}
        />
      </Link>
    </div>
  );
};
