'use client';

import Image from 'next/image';

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
  return (
    <div className="bg-white rounded-[24px] border border-[#dbdbdb] p-6 flex gap-6 w-full max-w-full">
      {/* Левая часть */}
      <div className="shrink-0 flex flex-col items-start">
        <Image
          src="/img/order_vector.svg"
          alt="Order"
          width={120}
          height={120}
          className="object-contain mb-4"
        />
        <p className="text-sm text-[#1C1C1C] font-semibold mt-6">
          Заказ №: {orderNumber}
        </p>
        <p className="text-sm text-[#8C8C8C]">Дата: {date}</p>
      </div>

      {/* Правая часть */}
      <div className="flex flex-col justify-between w-full">
        {/* Товары */}
        <div>
          <p className="text-sm text-[#8C8C8C] mb-1">Товары</p>
          {items.map((item, idx) => (
            <p key={idx} className="text-[#1C1C1C] text-sm">
              {item}
            </p>
          ))}
        </div>

        {/* Статус и сумма справа внизу */}
        <div className="flex flex-col justify-between gap-2 mt-10">
          <div className="flex justify-between gap-2">
            <p className="text-sm text-[#8C8C8C]">Статус</p>
            <span
              className={`px-4 py-1 text-sm font-medium rounded-full ${statusColorMap[status]}`}
            >
              {status}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <p className="text-sm text-[#8C8C8C]">Сумма</p>
            <p className="text-xl font-bold text-[#1C1C1C]">
              {total.toLocaleString()} ₸
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
