'use client'

import { useState } from 'react'
import Image from 'next/image'
import MoreHeader from '@/components/header/MoreHeader'
import PickupAddressBlock from '@/components/product/HidderElements/PickupAddressBlock'
import PickupDeliverBlock from '@/components/product/HidderElements/PickupDeliverBlock'
import SortProductBlock from '@/components/product/HidderElements/SortProductsBlock'
import OrderCard from '@/components/product/OrderCard'
import DealerProductCard from '@/components/product/DealerProductCard'
import DealerBigProductCard from '@/components/product/DealerBigProductCard'
import Lottie from 'lottie-react';
import retailAnimation from '@/lotties/Retail.json'

export default function ShopPage() {
  const [showClientPrices, setShowClientPrices] = useState(false)

  const products = [
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
  ]

  const bigProduct = {
    id: 7,
    name: '6 Этапный уходовый набор Tannur',
    dealerPrice: 89850,
    clientPrice: 123499,
    imageUrl: '/img/productBig.jpg',
  }

  return (
    <main className="flex flex-col gap-6 p-6 bg-[#F5F5F5] min-h-screen">
      <MoreHeader title="Магазин Tannur" />

      {/* Верхний блок: Дилерский магазин */}
      <section className="bg-white rounded-2xl w-full p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-x divide-[#EAEAEA] gap-6">
          <div className="flex items-center justify-start p-2 gap-3">
            {/* Анимация слева */}
            <div className="w-10 h-10 md:w-15 md:h-15">
              <Lottie animationData={retailAnimation} loop autoplay />
            </div>

            {/* Текст */}
            <h2 className="text-md md:text-lg font-semibold text-[#1C1C1C]">
              Дилерский магазин
            </h2>
          </div>
          <PickupAddressBlock />
          <PickupDeliverBlock />
          <SortProductBlock />
        </div>
      </section>

      {/* Основной контент */}
      <section className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {/* Левая часть */}
        <div className="col-span-6 grid grid-rows-2 gap-4">
          {/* Товары */}
                          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* Сначала большой товар (занимает 2 колонки) */}
                            <div className="col-span-2">
                              <DealerBigProductCard
                                {...bigProduct}
                                showClientPrice={showClientPrices}
                                className="h-full w-full"
                              />
                            </div>

                            {/* Обычные товары */}
                            <div className="col-span-1">
                              <DealerProductCard
                                {...products[0]}
                                showClientPrice={showClientPrices}
                                className="h-full w-full"
                              />
                            </div>
                            <div className="col-span-1">
                              <DealerProductCard
                                {...products[1]}
                                showClientPrice={showClientPrices}
                                className="h-full w-full"
                              />
                            </div>
                            <div className="col-span-1">
                              <DealerProductCard
                                {...products[2]}
                                showClientPrice={showClientPrices}
                                className="h-full w-full"
                              />
                            </div>
                          </div>


          {/* Второй ряд - статичные заглушки */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl h-32 w-full flex items-center justify-center text-[#1C1C1C] font-medium"
              >
                Товар
              </div>
            ))}
          </div>
        </div>

      </section>
    </main>
  )
}
