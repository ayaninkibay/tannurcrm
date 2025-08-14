'use client';

import React from 'react';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import Image from 'next/image';
import ActionButton from '@/components/ui/ActionButton';
import ProductCardWare from '@/components/ui/ProductCardWare';
import ProductInfoBlock from '@/components/product/ProductInfoBlock';

export default function ProductView() {
  return (
    <div className="flex flex-col bg-[#F6F6F6] p-6 min-h-screen">
        <MoreHeaderDE title="Страница товара" />
      
      <div className="w-full h-px bg-gray-300" />

      {/* Основной контейнер, который теперь использует гибкую сетку */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6  md:p-6 lg:p-8">
        
        {/* Левая и центральная часть */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <ProductInfoBlock />


        </div>


      </div>
    </div>
  );
}
