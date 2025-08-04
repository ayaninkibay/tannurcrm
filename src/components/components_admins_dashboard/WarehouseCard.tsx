// src/components/components_admins_dashboard/WarehouseCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface WarehouseCardProps {
  /** Путь к иконке слева */
  iconSrc: string;
  /** Заголовок карточки */
  title: string;
  /** Количество товаров */
  quantity: number | string;
  /** Общая стоимость */
  price: number | string;
  /** Ссылка для кнопки-стрелки */
  href: string;
}

export const WarehouseCard: React.FC<WarehouseCardProps> = ({
  iconSrc,
  title,
  quantity,
  price,
  href,
}) => {
  const formattedQuantity =
    typeof quantity === 'number'
      ? quantity.toLocaleString('ru-RU')
      : quantity;

  const formattedPrice =
    typeof price === 'number'
      ? price.toLocaleString('ru-RU')
      : price;

  return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 md:p-6 flex flex-col justify-between">
      {/* Заголовок и стрелка */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-2">
          <Image
            src={iconSrc}
            width={20}
            height={20}
            className="w-4 h-4 sm:w-5 sm:h-5 md:w-[20px] md:h-[20px]"
            alt={title}
          />
          <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900">
            {title}
          </h3>
        </div>
        <Link href={href}>
          <Image
            src="/icons/IconArrowBlack.svg"
            width={24}
            height={24}
            className="w-6 h-6 sm:w-8 sm:h-8 md:w-[34px] md:h-[34px]"
            alt="Перейти"
          />
        </Link>
      </div>

      {/* Основное количество */}
      <div className="mt-2 sm:mt-3 md:mt-4">
        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
          {formattedQuantity}
          <span className="ml-1 text-base sm:text-lg md:text-xl font-normal text-gray-600">
            штук
          </span>
        </p>
      </div>

      {/* Нижний блок с ценой */}
      <div className="mt-3 sm:mt-4 md:mt-6 bg-gray-100 rounded-lg p-2 sm:p-3 md:p-4">
        <p className="text-base sm:text-lg font-medium text-gray-900">
          {formattedPrice}
          <span className="ml-1 text-base sm:text-lg font-normal">₸</span>
        </p>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Товары на общую сумму
        </p>
      </div>
    </div>
  );
};

// Пример использования:
// import { WarehouseCard } from '@/components/components_admins_dashboard/WarehouseCard';
//
// <WarehouseCard
//   iconSrc="/icons/IconWarehouse.svg"
//   title="Товары на складе"
//   quantity={42933}
//   price={543213000}
//   href="/admin/warehouse"
// />
