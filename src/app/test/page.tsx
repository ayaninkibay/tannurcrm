'use client';

import ProductCardWare from "@/components/ui/ProductCardWare";
import SimpleHeader from "@/components/header/SimpleHeader";
import MoreHeader from "@/components/header/MoreHeader";

export default function TestPage() {
  const showMoreHeader = true; // переключи на false, чтобы увидеть SimpleHeader

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-10 px-4">
      {showMoreHeader ? (
        <MoreHeader title="Магазин Tannur" />
      ) : (
        <SimpleHeader title="Склад Tannur" />
      )}

      <div className="max-w-6xl mx-auto bg-white rounded-2xl p-8 shadow-sm mt-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Товары</h1>

        <div className="grid grid-cols-1 gap-3">
          <ProductCardWare
            image="/img/product1.png"
            title="9-A Шампунь Tannur"
            priceOld="12 990 ₸"
            priceNew="7 990 ₸"
            count={897}
            onClick={() => alert("Клик по товару 1")}
          />
          <ProductCardWare
            image="/img/product2.png"
            title="Отбеливающая маска Tannur"
            priceOld="5 990 ₸"
            priceNew="3 990 ₸"
            count={231}
            onClick={() => alert("Клик по товару 2")}
          />
          <ProductCardWare
            image="/img/product3.png"
            title="Гелеон маска Tannur"
            priceOld="4 990 ₸"
            priceNew="2 990 ₸"
            count={421}
            onClick={() => alert("Клик по товару 3")}
          />
          <ProductCardWare
            image="/img/product4.png"
            title="Кушон 3 в 1 Tannur"
            priceOld="12 990 ₸"
            priceNew="9 990 ₸"
            count={321}
            onClick={() => alert("Клик по товару 4")}
          />
          <ProductCardWare
            image="/img/product5.png"
            title="Набор из 6 кремов Tannur"
            priceOld="89 990 ₸"
            priceNew="56 990 ₸"
            count={6745}
            onClick={() => alert("Клик по товару 5")}
          />
        </div>
      </div>
    </div>
  );
}
