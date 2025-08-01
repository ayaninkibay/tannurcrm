'use client';

import Image from 'next/image';
import ProductCardWare from '@/components/ui/ProductCardWare';
import RightSidebar from '@/components/ui/RightSidebar';
import MoreHeader from '@/components/header/MoreHeader';

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
<div>
      <header>
        <MoreHeader title="Админ панель" />
      </header>

    
     <div className="grid grid-cols-4 mt-5 gap-4">
      
          <div className="grid col-span-3 grid-rows-5 gap-4">
                                                <div className="grid row-span-1 bg-white h-full w-full rounded-2xl">

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
                                                            
                        <div className="grid row-span-4 bg-white h-full w-full rounded-2xl p-3">

                        <div className="flex items-center font-semibold text-gray-500 text-sm border-b pb-3 mb-2">
                        {/* Левая часть — наименование */}
                        <div className="flex items-center gap-4 w-full">s
                        <span>Наименование</span>
                        </div>

                        {/* Правая часть — остальное */}
                        <div className="grid grid-cols-4 gap-6 w-full text-right">
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
          
         
          <div className="grid col-span-1 bg-white h-full w-full rounded-2xl"> 
          
          </div>
    </div>
</div>
  );
}
