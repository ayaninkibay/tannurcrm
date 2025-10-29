// src/components/components_admins_dashboard/StatCard.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslate } from '@/hooks/useTranslate';

export type StatCardType = 'revenue' | 'subscriptions' | 'warehouse';

export interface StatCardData {
  allTime: {
    primary: string | number;
    secondary?: string | number;
  };
  monthly: {
    primary: string | number;
    secondary?: string | number;
  };
}

export interface StatCardProps {
  type: StatCardType;
  title: string;
  iconSrc: string;
  data: StatCardData;
  href: string;
  bgColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  type,
  title,
  iconSrc,
  data,
  href,
  bgColor = 'bg-purple-100',
}) => {
  const { t } = useTranslate();
  const [period, setPeriod] = useState<'allTime' | 'monthly'>('allTime');

  const currentData = data[period];

  const formatNumber = (value: string | number) => {
    if (typeof value === 'number') {
      return value.toLocaleString('ru-RU');
    }
    return value;
  };

  // Разные рендеры в зависимости от типа
  const renderContent = () => {
    switch (type) {
      case 'revenue':
        return (
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              {formatNumber(currentData.primary)}
              <span className="text-xl sm:text-2xl md:text-3xl font-normal ml-1">₸</span>
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              {t('Товарооборот')}
            </p>
          </div>
        );

      case 'subscriptions':
        return (
          <div className="space-y-2">
            <div>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                {formatNumber(currentData.primary)}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                {t('Подписок')}
              </p>
            </div>
            {currentData.secondary && (
              <div className="pt-2 border-t border-gray-300/50">
                <p className="text-lg sm:text-xl font-semibold text-gray-800">
                  {formatNumber(currentData.secondary)}
                  <span className="text-base font-normal ml-1">₸</span>
                </p>
                <p className="text-xs text-gray-600">
                  {t('Сумма платежей')}
                </p>
              </div>
            )}
          </div>
        );

      case 'warehouse':
        return (
          <div className="space-y-2">
            <div>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                {formatNumber(currentData.primary)}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                {t('Товаров на складе')}
              </p>
            </div>
            {currentData.secondary && (
              <div className="pt-2 border-t border-gray-300/50">
                <p className="text-lg sm:text-xl font-semibold text-gray-800">
                  {formatNumber(currentData.secondary)}
                  <span className="text-base font-normal ml-1">₸</span>
                </p>
                <p className="text-xs text-gray-600">
                  {t('Общая стоимость')}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`
        w-full
        ${bgColor}
        rounded-2xl 
        p-4 sm:p-5 md:p-6
        flex flex-col
        transition-all duration-300
        hover:shadow-lg
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/60 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Image
              src={iconSrc}
              width={24}
              height={24}
              className="w-5 h-5 sm:w-6 sm:h-6"
              alt={title}
            />
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-gray-800">
            {t(title)}
          </h3>
        </div>

        <Link href={href} title={t('Перейти')} className="shrink-0">
          <Image
            src="/icons/IconArrowBlack.svg"
            width={24}
            height={24}
            className="w-6 h-6 hover:scale-110 transition-transform"
            alt={t('Перейти')}
          />
        </Link>
      </div>

      {/* Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setPeriod('allTime')}
          className={`
            flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium
            transition-all duration-200
            ${
              period === 'allTime'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'bg-white/40 text-gray-600 hover:bg-white/60'
            }
          `}
        >
          {t('За все время')}
        </button>
        <button
          onClick={() => setPeriod('monthly')}
          className={`
            flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium
            transition-all duration-200
            ${
              period === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'bg-white/40 text-gray-600 hover:bg-white/60'
            }
          `}
        >
          {t('За месяц')}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1">
        {renderContent()}
      </div>
    </div>
  );
};