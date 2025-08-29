// src/components/components_admins_dashboard/StatisticCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslate } from '@/hooks/useTranslate';

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
  const { t } = useTranslate();

  // Форматируем число для RU
  const formattedCount =
    typeof count === 'number' ? count.toLocaleString('ru-RU') : count;

  return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 md:p-6 flex flex-col gap-2 sm:gap-3 md:gap-4">
      {/* Заголовок и стрелка */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-2">
          <Image
            src={iconSrc}
            width={20}
            height={20}
            className="w-4 h-4 sm:w-5 sm:h-5 md:w-[20px] md:h-[20px]"
            alt={t(title)}
          />
          <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900">
            {t(title)}
          </h3>
        </div>
        <Link href={href} aria-label={t('Перейти')}>
          <Image
            src="/icons/IconArrowBlack.svg"
            width={24}
            height={24}
            className="w-6 h-6 sm:w-8 sm:h-8 md:w-[34px] md:h-[34px]"
            alt={t('Перейти')}
          />
        </Link>
      </div>

      {/* Число и статичные подписи */}
      <div>
        <p className="mt-2 sm:mt-3 md:mt-4 text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
          {formattedCount}
          <span className="ml-1 text-base sm:text-lg md:text-xl font-normal text-gray-600">
            {t('человек')}
          </span>
        </p>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          {t('Общее количество')}
        </p>
      </div>
    </div>
  );
};
