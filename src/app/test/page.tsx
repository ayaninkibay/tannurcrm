'use client';

import { useState } from 'react';
import DealerProductCard from '@/components/product/DealerProductCard';
import DealerBigProductCard from '@/components/product/DealerBigProductCard'; // 👈 импорт нового компонента

export default function TestDealerProductPage() {
  const [showClientPrices, setShowClientPrices] = useState(false);

  const mockProducts = [
    {
      id: 1,
      name: '9-A шампунь Tannur',
      dealerPrice: 89850,
      clientPrice: 123499,
      imageUrl: '/img/product1.jpg',
    },
    {
      id: 2,
      name: 'Сыворотка B5 Active',
      dealerPrice: 75900,
      clientPrice: 101900,
      imageUrl: '/img/product2.jpg',
    },
    {
      id: 3,
      name: 'Крем Snail Therapy',
      dealerPrice: 68900,
      clientPrice: 94700,
      imageUrl: '/img/product3.jpg',
    },
  ];

  return (
    <div className="min-h-screen bg-[#E5E5E5] p-6">
      {/* Кнопка */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowClientPrices((prev) => !prev)}
          className="bg-[#D77E6C] text-white px-5 py-2 rounded-full text-sm hover:bg-[#c56c5c] transition"
        >
          {showClientPrices ? 'Скрыть клиентские цены' : 'Показать клиентские цены'}
        </button>
      </div>

      {/* Флагман продукт */}
      <div className="mb-10">
        <DealerBigProductCard
          id={7}
          name="6 Этапный уходовый набор Tannur"
          dealerPrice={89850}
          clientPrice={123499}
          showClientPrice={showClientPrices}
          imageUrl="/img/product.jpg"
        />
      </div>

      {/* Сетка карточек */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
        {mockProducts.map((product) => (
          <DealerProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            dealerPrice={product.dealerPrice}
            clientPrice={product.clientPrice}
            showClientPrice={showClientPrices}
            imageUrl={product.imageUrl}
          />
        ))}
      </div>
    </div>
  );
}
