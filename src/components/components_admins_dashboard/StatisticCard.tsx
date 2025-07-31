// src/components/components_admins_dashboard/StatisticCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface StatisticCardProps {
  /** Путь к иконке слева */
  iconSrc: string;
  /** Заголовок карточки */
  title: string;
  /** Основное числовое значение */
  count: number | string;
  /** Ссылка для клика по стрелке */
  href: string;
}

export const StatisticCard: React.FC<StatisticCardProps> = ({
  iconSrc,
  title,
  count,
  href,
}) => {
  // Форматируем число для RU
  const formattedCount =
    typeof count === 'number' ? count.toLocaleString('ru-RU') : count;

  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col gap-4">
      {/* Заголовок и стрелка */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src={iconSrc} width={20} height={20} alt={title} />
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
        <Link href={href} className="">
          <Image src="/icons/IconArrowBlack.svg" width={34} height={34} alt="Перейти" />
        </Link>
      </div>

      {/* Число и статичные подписи */}
      <div>
        <p className="mt-4 text-3xl font-bold text-gray-900">
          {formattedCount}
          <span className="ml-1 text-xl font-normal text-gray-600">человек</span>
        </p>
        <p className="mt-1 text-sm text-gray-500">Общее количество</p>
      </div>
    </div>
);
};