'use client';

import React from 'react';
import OrderRow, { Order } from './OrderRow';

export default function OrdersSection({
  title,
  orders,
  className = '',
}: {
  title: string;
  orders: Order[];
  className?: string;
}) {
  return (
    <section className={className}>
      <h3 className="text-md font-medium text-gray-700 mb-4">{title}</h3>
      <div className="space-y-5">
        {orders.map((order) => (
          <OrderRow key={order.id} order={order} />
        ))}
      </div>
    </section>
  );
}
