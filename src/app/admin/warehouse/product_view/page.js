'use client';

import React from 'react';
import MoreHeader from '@/components/header/MoreHeader';
import Image from 'next/image';
import ActionButton from '@/components/ui/ActionButton';
import ProductCardWare from '@/components/ui/ProductCardWare';
import ProductInfoBlock from '@/components/product/ProductInfoBlock';

export default function ProductView() {
  return (
    <div className="flex flex-col bg-[#F6F6F6] min-h-screen">
      <MoreHeader
        title={
          <span>
            <span className="text-gray-400">Tannur</span>
            <span className="mx-1 text-[#111]">/</span>
            <span className="text-[#111]">Карточка товара</span>
          </span>
        }
      />
      
      <div className="w-full h-px bg-gray-300" />

      {/* Основной контейнер, который теперь использует гибкую сетку */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6  md:p-6 lg:p-8">
        
        {/* Левая и центральная часть */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <ProductInfoBlock />

          {/* Контент снизу */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#111]">Информация</h2>

            {/* Заголовки колонок, теперь адаптивные */}
            <div className="hidden md:grid grid-cols-[1fr_min-content_min-content_min-content_min-content] items-center text-sm font-semibold text-gray-500 border-b pb-2 px-4 gap-9">
              <span className="text-left">Наименование</span>
              <span className="text-center">Цена в Магазине</span>
              <span className="text-center">Диллерская цена</span>
              <span className="text-center">Количество в Складе</span>
              <span className="text-center">Инфо</span>
            </div>

            {/* Карточка */}
            <ProductCardWare
              image="/icons/Photo_icon_1.jpg"
              title="9-А Шампунь Tannur"
              priceOld="12 990 ₸"
              priceNew="7 990 ₸"
              count={897}
              className="bg-white pointer-events-none"
              showArrow={false}
            />

            {/* Кнопки */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <ActionButton icon="/icons/IconProfileOrange.svg" label="Пополнить остаток" onClick={() => alert('Пополнение')} />
              <ActionButton icon="/icons/IconProfileOrange.svg" label="Уменьшить остаток" onClick={() => alert('Уменьшение')} />
            </div>
          </div>
        </div>

        {/* Правая колонка — управление */}
        <div className="lg:col-span-1 rounded-2xl  flex flex-col gap-6">
          <h2 className="text-xl font-bold text-[#111]">Управление товаром</h2>
          <p className="text-sm text-gray-500">
            Любые изменения товара требуют подтверждения управляющего складом, а так же сохраняются в истории.
          </p>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-[#111]">Данные</p>
            <ActionButton icon="/icons/IconShoppingOrange.svg" label="Изменить данные товара" href="/admin/warehouse/edit_product" />
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-[#111]">История</p>
            <ActionButton icon="/icons/IconProfileOrange.svg" label="Составить отчет по товару" href="/admin/warehouse/product_report" />
            <ActionButton icon="/icons/IconProfileOrange.svg" label="История движения на складе" href="/admin/warehouse/move_history" />
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-[#111]">Удаление</p>
            <ActionButton icon="/icons/IconProfileOrange.svg" label="Удалить товар" onClick={() => alert('Подтвердите удаление')} />
          </div>
        </div>
      </div>
    </div>
  );
}
