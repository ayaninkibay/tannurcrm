'use client'

import { useState } from 'react'
import MoreHeader from '@/components/header/MoreHeader'
import PickupAddressBlock from '@/components/product/HidderElements/PickupAddressBlock'
import PickupDeliverBlock from '@/components/product/HidderElements/PickupDeliverBlock'
import SortProductBlock from '@/components/product/HidderElements/SortProductsBlock'
import DealerProductCard from '@/components/product/DealerProductCard'
import DealerBigProductCard from '@/components/product/DealerBigProductCard'
import Lottie from 'lottie-react';
import retailAnimation from '@/components/lotties/Retail.json'

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
        {
      id: 4,
      name: 'Крем Snail Therapy',
      dealerPrice: 68900,
      clientPrice: 94700,
      imageUrl: '/img/product4.jpg',
    },
        {
      id: 5,
      name: 'Крем Snail Therapy',
      dealerPrice: 68900,
      clientPrice: 94700,
      imageUrl: '/img/product5.jpg',
    },
        {
      id: 3,
      name: 'Крем Snail Therapy',
      dealerPrice: 68900,
      clientPrice: 94700,
      imageUrl: '/img/product6.jpg',
    },
        {
      id: 6,
      name: 'Крем Snail Therapy',
      dealerPrice: 68900,
      clientPrice: 94700,
      imageUrl: '/img/product7.jpg',
    },
        {
      id: 7,
      name: 'Крем Snail Therapy',
      dealerPrice: 68900,
      clientPrice: 94700,
      imageUrl: '/img/product8.jpg',
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
    <div className="flex flex-col gap-6 p-2 md:p-6 bg-[#F5F5F5] min-h-screen">
      <MoreHeader title="Магазин Tannur" />

      {/* Верхний блок: Дилерский магазин */}
      <section className="bg-white rounded-2xl w-full p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-x divide-[#EAEAEA] gap-6 items-stretch">
                  {/* 1 */}
                  <div className="flex rounded-2xl bg-[#fff7f7] items-center justify-center p-2 h-full">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 md:w-15 md:h-15">
                        <Lottie animationData={retailAnimation} loop autoplay />
                      </div>
                      <h2 className=" text-lg md:text-lg font-semibold text-[#1C1C1C]">Дилерский магазин</h2>
                    </div>
                  </div>

                  {/* 2 */}
                  <div className="flex items-center justify-center h-full">
                    <PickupAddressBlock />
                  </div>

                  {/* 3 */}
                  <div className="flex items-center justify-center h-full">
                    <PickupDeliverBlock />
                  </div>

                  {/* 4 */}
                  <div className="flex items-center justify-center h-full">
                    <SortProductBlock />
                  </div>
                </div>

      </section>

      {/* Основной контент */}
      <section className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {/* Левая часть */}
<div className="col-span-6 grid gap-4">
  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
    {/* Первый товар — большой */}
    <div className="col-span-2">
      <DealerBigProductCard
        {...bigProduct}
        showClientPrice={showClientPrices}
        className="h-full w-full"
      />
    </div>

    {/* Остальные товары */}
    {products.slice(0, 8).map((product, idx) => (
      <div key={idx} className="col-span-1">
        <DealerProductCard
          {...product}
          showClientPrice={showClientPrices}
          className="h-full w-full"
        />
      </div>
    ))}
  </div>
</div>


      </section>
    </div>
  )
}
