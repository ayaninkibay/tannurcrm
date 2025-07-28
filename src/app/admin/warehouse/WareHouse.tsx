'use client';

import Image from 'next/image';
import ProductCardWare from '@/components/ui/ProductCardWare';
import RightSidebar from '@/components/ui/RightSidebar';

export default function WareHouse() {
  const products = [
    { name: '9-А Шампунь+ Tannur', shopPrice: '12 990 ₸', dealerPrice: '9 900 ₸', quantity: 897, image: '/icons/Photo icon 1.png' },
    { name: 'Отбеливающая маска Tannur', shopPrice: '5 990 ₸', dealerPrice: '3 900 ₸', quantity: 231, image: '/icons/Photo icon 2.png' },
    { name: 'Гелевая маска Tannur', shopPrice: '4 990 ₸', dealerPrice: '1 900 ₸', quantity: 157, image: '/icons/Photo icon 3.png' },
    { name: 'Кусач 3 в 1 Tannur', shopPrice: '7 990 ₸', dealerPrice: '6 900 ₸', quantity: 321, image: '/icons/Photo icon 4.png' },
    { name: 'Набор из 6 кремов Tannur', shopPrice: '8 990 ₸', dealerPrice: '6 900 ₸', quantity: 585, image: '/icons/Photo icon 5.png' },
    { name: '9-А Бальзам для волос Tannur', shopPrice: '11 990 ₸', dealerPrice: '8 900 ₸', quantity: 870, image: '/icons/Photo icon 6.png' },
  ];

  return (
    <div className="flex flex-col bg-[#F6F6F6] min-h-screen pl-[140px]">
      {/* Верхняя панель с заголовком и кнопками */}
      <div className="w-full flex justify-between items-center mt-6 px-6 py-4">
        
        {/* Заголовок и подзаголовок */}
        <div>
          <h1 className="text-2xl font-bold text-[#111]">Склад Tannur</h1>
          <p className="text-sm text-gray-400">It is a long established fact that.</p>
        </div>

        {/* Кнопки */}
        <div className="flex items-center gap-4">
          <button className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center hover:opacity-80 transition">
            <Image src="/icons/Icon notifications.png" alt="уведомления" width={16} height={16} />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-600 rounded-full" />
          </button>
          <button className="flex items-center gap-3 bg-white px-4 py-2 rounded-full hover:opacity-90 transition cursor-pointer">
            <img src="/Icons/Users avatar 6.png" alt="User" className="w-8 h-8 rounded-full object-cover" />
            <span className="text-sm font-medium text-[#111] whitespace-nowrap">Маргоза Каныбат</span>
          </button>
          <button className="hover:opacity-80 transition">
            <Image src="/Icons/IconOutRed.png" alt="выйти" width={20} height={20} />
          </button>
        </div>
      </div>

      {/* Основной контент */}
      <div className="w-full h-px bg-gray-200 my-2" />
      <div className="flex gap-6 px-6 pt-2 mt-7 pb-6">
        <div className="flex-1 w-full max-w-[1380px] mx-auto px-4">

          

          {/* Блок статистики */}
          <div className="bg-white rounded-xl flex justify-between items-center h-[160px] px-6 mb-4">
            <div className="flex flex-col justify-between h-full py-4">
              <div className="flex items-center gap-2">
                <Image src="/icons/IconAppsOrange.png" alt="box" width={16} height={16} />
                <p className="text-sm font-medium text-[#111]">Товары на складе</p>
              </div>
              <h2 className="text-4xl font-bold text-[#111]">
                8321 <span className="text-base font-medium text-gray-400">штук</span>
              </h2>
            </div>

            <div className="relative bg-[#F2F2F2] rounded-xl p-4 w-[240px] h-[110px] flex flex-col">
              <Image src="/icons/Icon decor.png" alt="decor" width={100} height={100} className="absolute top-3 right-3" />
              <div className="z-10 mt-auto">
                <h3 className="text-lg font-semibold text-[#111] leading-tight">543 213 000 ₸</h3>
                <p className="text-xs text-gray-500">Товары на общую сумму</p>
              </div>
            </div>
          </div>

          {/* Таблица */}
          <div className="bg-white rounded-xl p-10">
           <div className="flex items-center font-semibold text-gray-500 text-sm border-b pb-3 mb-2">

           {/* Левая часть — наименование */}
          <div className="flex items-center gap-4 min-w-[320px]">
          <span>Наименование</span>
          </div>

    {/* Правая часть — остальное */}
      <div className="grid grid-cols-4 gap-6 w-[900px] text-right">

        <span>Цена Магазин</span>
        
        <span>Цена Дилер</span>
        <span>Кол-во</span>
        <span>Инфо</span>
      </div>
    </div>

            {products.map((product, index) => (
              <ProductCardWare
                key={index}
                image={product.image}
                title={product.name}
                priceOld={product.shopPrice}
                priceNew={product.dealerPrice}
                count={product.quantity}
                onClick={() => alert(`Открыть товар: ${product.name}`)}
              />
            ))}
          </div>
        </div>

        {/* Правая панель */}
        <div className="w-[300px]  border-l pl-6">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
