'use client';

import Image from 'next/image';
import { useTranslate } from '@/hooks/useTranslate';

interface OrderCardProps {
  orderNumber: string;
  date: string;
  items: string[];
  status: 'Оплачено' | 'В обработке' | 'Отменён';
  total: number;
}

const statusColorMap: Record<OrderCardProps['status'], string> = {
  'Оплачено': 'bg-[#A6C7FF] text-[#1C1C1C]',
  'В обработке': 'bg-[#FFD87A] text-[#1C1C1C]',
  'Отменён': 'bg-[#FFA6A6] text-[#1C1C1C]',
};

export default function OrderCard({
  orderNumber,
  date,
  items,
  status,
  total,
}: OrderCardProps) {
  const { t } = useTranslate();

  return (
    <div className="bg-white rounded-[24px] border border-[#dbdbdb] p-4 w-full grid grid-cols-1 lg:grid-cols-2">
      {/* Левая часть: Картинка, номер, дата */}
      <div className="flex flex-col items-start">
        <Image
          src="/img/order_vector.svg"
          alt={t('Заказ')}
          width={120}
          height={120}
          className="object-contain mb-4"
        />
        <p className="text-sm text-[#1C1C1C] font-semibold mt-6">
          {t('Заказ №: {n}').replace('{n}', orderNumber)}
        </p>
        <p className="text-sm text-[#8C8C8C]">{t('Дата:')} {date}</p>
      </div>

      {/* Правая часть: Товары, Статус, Сумма */}
      <div className="flex flex-col">
        <div>
          <p className="text-sm text-[#8C8C8C] mb-1">{t('Товары')}</p>
          {items.map((item, idx) => (
            <p key={idx} className="text-[#1C1C1C] text-sm">
              {item}
            </p>
          ))}
        </div>

        <div className="flex flex-col gap-2 mt-6">
          {/* Статус */}
          <div className="flex justify-between gap-2">
            <p className="text-sm text-[#8C8C8C]">{t('Статус')}</p>
            <span
              className={`px-4 py-1 text-sm font-medium rounded-full ${statusColorMap[status]}`}
            >
              {t(status)}
            </span>
          </div>

          {/* Сумма */}
          <div className="flex justify-between gap-2">
            <p className="text-sm text-[#8C8C8C]">{t('Сумма')}</p>
            <p className="text-sm md:text-lg font-bold text-[#1C1C1C]">
              {total.toLocaleString()} ₸
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
