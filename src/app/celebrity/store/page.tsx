'use client';

import React from 'react';
import MoreHeaderCE from '@/components/header/MoreHeaderCE';
import PickupAddressBlock from '@/components/product/HidderElements/PickupAddressBlock';
import PickupDeliverBlock from '@/components/product/HidderElements/PickupDeliverBlock';
import SortProductBlock from '@/components/product/HidderElements/SortProductsBlock';
import Lottie from 'lottie-react';
import retailAnimation from '@/components/lotties/Retail.json';

import CelebrityProductCard from '@/components/product/CelebrityProductCard';
import CelebrityBigProductCard from '@/components/product/CelebrityBigProductCard';

export default function CelebrityStorePage() {
  // МАЛЕНЬКИЕ карточки (8 штук: 3 до большой + 5 после)
  const smallProducts = [
    { id: 1, name: '9-A шампунь Tannur', price: 89850, imageUrl: '/img/product1.jpg', isHit: true },
    { id: 2, name: '9-A Крем для волос Tannur', price: 89850, imageUrl: '/img/product2.jpg' },
    { id: 3, name: '9-A Крем для волос Tannur', price: 89850, imageUrl: '/img/product3.jpg' },

    { id: 4, name: 'Отбеливающая маска Tannur', price: 89850, imageUrl: '/img/product4.jpg' },
    { id: 5, name: 'Гелевая маска Tannur', price: 89850, imageUrl: '/img/product5.jpg' },
    { id: 6, name: 'Гелевая маска Tannur', price: 89850, imageUrl: '/img/product6.jpg' },
    { id: 7, name: 'Набор из 3 кремов Tannur', price: 89850, imageUrl: '/img/product7.jpg' },
    { id: 8, name: 'Набор из 6 кремов Tannur', price: 89850, imageUrl: '/img/product8.jpg' },
  ];

  // БОЛЬШАЯ карточка-герой
  const heroProduct = {
    id: 101,
    name: '6 Этапный уходовый набор Tannur',
    subtitle: 'Премиальный набор для ежедневного ухода',
    price: 129000,
    oldPrice: 149000,
    tag: 'Эксклюзив',
    imageUrl: '/img/productBig.jpg',
  };

  return (
    <main className="min-h-screen bg-[#F6F6F6]">
      <MoreHeaderCE title="Магазин Tannur" />

      {/* Верхняя плашка */}
      <section className="bg-white rounded-2xl w-full mt-5 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-x divide-[#EAEAEA] mt-5 gap-6 items-stretch">
          {/* 1 */}
          <div className="flex rounded-2xl bg-[#fff7f7] items-center justify-center p-2 h-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-15 md:h-15">
                <Lottie animationData={retailAnimation} loop autoplay />
              </div>
              <h2 className="text-lg md:text-lg font-semibold text-[#1C1C1C]">Магазин Селебрити</h2>
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

      {/* Сетка товаров */}
      <section className="mt-10">
        {/* ВАЖНО: 5 колонок на xl — чтобы уместить (мал, мал, мал, БОЛ(2 колонки)) */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">

          {/* первые 3 маленьких */}
          {smallProducts.slice(0, 3).map((p) => (
            <CelebrityProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              price={p.price}
              imageUrl={p.imageUrl}
              isHit={p.isHit}
              inStock
              onAddToCart={() => {}}
              onOpen={() => {}}
              onLikeToggle={() => {}}
            />
          ))}

          {/* большая на 2 колонки */}
          <div className="md:col-span-2 xl:col-span-2">
            <CelebrityBigProductCard
              id={heroProduct.id}
              name={heroProduct.name}
              subtitle={heroProduct.subtitle}
              price={heroProduct.price}
              oldPrice={heroProduct.oldPrice}
              tag={heroProduct.tag}
              imageUrl={heroProduct.imageUrl}
              inStock
              onAddToCart={() => {}}
              onOpen={() => {}}
              onLikeToggle={() => {}}
            />
          </div>

          {/* оставшиеся 5 маленьких */}
          {smallProducts.slice(3).map((p) => (
            <CelebrityProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              price={p.price}
              imageUrl={p.imageUrl}
              inStock
              onAddToCart={() => {}}
              onOpen={() => {}}
              onLikeToggle={() => {}}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
