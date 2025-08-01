'use client';

import PickupAddressBlock from '@/components/product/HidderElements/PickupAddressBlock';
import PickupDeliverBlock from '@/components/product/HidderElements/PickupDeliverBlock';
import SortProductBlock from '@/components/product/HidderElements/SortProductsBlock';
import OrderCard from '@/components/product/OrderCard'; // 👈 импортируем карточку заказа

export default function SomePage() {
  return (
    <div className="p-6 bg-[#F5F5F5] min-h-screen flex flex-col gap-6">
      {/* Верхний блок с фильтрами */}
      <div className="bg-white rounded-2xl shadow-sm p-6 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center text-right p-6">
            <h2 className="text-lg font-semibold text-[#1C1C1C]">
              Дилерский магазин
            </h2>
          </div>
          <PickupAddressBlock />
          <PickupDeliverBlock />
          <SortProductBlock />
        </div>
      </div>

      {/* Нижняя карточка в контейнере шириной 100px */}
      <div className="max-w-120 p-2">
        <OrderCard
          orderNumber="21431421"
          date="22.02.2025"
          items={[
            '9-A Крем для волос Tannur 2шт',
            '6 Этапный уходовый набор Tannur',
            'Отбеливающая маска Tannur',
          ]}
          status="Оплачено"
          total={247721}
        />
      </div>
    </div>
  );
}
