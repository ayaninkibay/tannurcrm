'use client';

import React from 'react';
import Image from 'next/image';

export type Order = {
  id: number;
  image: string;
  items: string[];
  orderNumber: string;
  date: string;
  status: 'Оплачено' | 'Ожидание оплаты' | 'Отмена заказа' | 'Возврат' | string;
  amount: string;
};

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'Оплачено':
      return 'text-black bg-green-300';
    case 'Ожидание оплаты':
      return 'text-black bg-yellow-300';
    case 'Отмена заказа':
      return 'text-black bg-red-300';
    case 'Возврат':
      return 'text-black bg-gray-300';
    default:
      return 'text-black bg-gray-300';
  }
};

export default function OrderRow({ order }: { order: Order }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center border border-gray-300 rounded-2xl py-4 gap-2 sm:gap-4 hover:bg-gray-50 transition">
      {/* картинка */}
      <div className="flex-shrink-0 ml-5">
        <Image
          src={order.image}
          alt="Товар"
          width={60}
          height={60}
          className="w-12 h-12 sm:w-15 sm:h-15 rounded-lg object-cover"
        />
      </div>

      {/* названия товаров */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900">
          {order.items.map((item, i) => (
            <div key={i} className="truncate sm:text-clip">{item}</div>
          ))}
        </div>
      </div>

      {/* мобилка — столбцом */}
      <div className="flex flex-col sm:hidden gap-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Заказ:</span>
          <span className="text-gray-600">{order.orderNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Дата:</span>
          <span className="text-gray-600">{order.date}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Статус:</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Сумма:</span>
          <span className="font-semibold text-gray-900">{order.amount}</span>
        </div>
      </div>

      {/* десктоп — в строку */}
      <div className="hidden sm:flex sm:items-center sm:gap-4">
        <div className="text-sm text-gray-600 w-20">{order.orderNumber}</div>
        <div className="text-sm text-gray-600 w-24">{order.date}</div>
        <div className="w-32">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>
        <div className="text-sm font-semibold text-gray-900 w-24">{order.amount}</div>
      </div>
    </div>
  );
}
