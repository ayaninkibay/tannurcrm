'use client';

import Image from 'next/image';
import ActionButton from '@/components/ui/ActionButton';
import ProductCardWare from '@/components/ui/ProductCardWare';
import { useState } from 'react';

export default function ProductView() {
  const [activeTab, setActiveTab] = useState('composition');
  const [activeImage, setActiveImage] = useState(0);

  const productImages = [
    '/icons/Photo_ico_1.jpg',
    '/icons/Photo_ico_2.jpg',
    '/icons/Photo_ico_3.jpg',
    '/icons/Photo_ico_1.jpg',
  ];
  <ProductCardWare
  name="9-А Шампунь Tannur"
  shopPrice="12 990 ₸"
  dealerPrice="7 990 ₸"
  quantity={897}
  image="/icons/Photo icon 1.png"
/>


  const handlePrev = () => {
    setActiveImage((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveImage((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col bg-[#F6F6F6] min-h-screen pl-[140px]">
      {/* Верхняя панель */}
      <div className="w-full flex justify-between items-center mt-6 px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111]">
            <span className="text-gray-400 font-medium">Склад Tannur / </span>
            9-А Шампунь Tannur
          </h1>
          <p className="text-sm text-gray-400">It is a long established fact that.</p>
        </div>
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

      <div className="w-full h-px bg-gray-300" />

      <div className="flex gap-6 px-6 pt-6">
        {/* Левая часть — карточка товара */}
        <div className={`relative flex bg-white rounded-xl p-9 w-full max-w-[1600px] transition-all duration-500 ease-in-out ${activeTab === 'video' ? 'max-h-[700px]' : 'max-h-[650px]'}`}>
          <div className="flex flex-col items-center">
            <div className="w-[540px] h-[540px] overflow-hidden rounded-xl relative">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeImage * 100}%)` }}
              >
                {productImages.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt={`product-${index}`}
                    className="w-[540px] h-[540px] object-cover flex-shrink-0"
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 mt-7">
              <button onClick={handlePrev} className="text-xl px-2 text-gray-500 hover:text-gray-700">‹</button>
              {productImages.map((_, index) => (
                <span
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-200 ${
                    activeImage === index ? 'bg-gray-500' : 'bg-gray-300'
                  }`}
                />
              ))}
              <button onClick={handleNext} className="text-xl px-2 text-gray-500 hover:text-gray-700">›</button>
            </div>
          </div>

          <div className="ml-10 flex flex-col justify-between w-full">
            <div>
              <h2 className="text-xl font-bold text-[#111] mb-1">9-А Шампунь Tannur</h2>
              <p className="text-lg text-gray-500 mb-0 mt-4">Описание</p>
              <p className="text-sm text-gray-800 mb-8">
                It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
              </p>
              <div className="flex gap-6 border-b pb-2">
                <button
                  className={`flex items-center gap-1 text-sm font-medium pb-1 border-b-2 transition ${
                    activeTab === 'composition' ? 'border-gray-400 text-[#111]' : 'border-gray-200 text-gray-400'
                  }`}
                  onClick={() => setActiveTab('composition')}
                >
                  <Image src="/icons/IconChartOrange.jpg" alt="composition" width={16} height={16} />
                  Состав
                </button>
                <button
                  className={`flex items-center gap-1 text-sm font-medium pb-1 border-b-2 transition ${
                    activeTab === 'video' ? 'border-gray-400 text-[#111]' : 'border-gray-200 text-gray-400'
                  }`}
                  onClick={() => setActiveTab('video')}
                >
                  <Image src="/icons/Icon video red.jpg" alt="video" width={16} height={16} />
                  Видео инструкция
                </button>
              </div>
              <div className="text-sm text-[#111] mt-8">
                {activeTab === 'composition' ? (
                  <p>
                    It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
                  </p>
                ) : (
                  <div className="mt-4">
                    <iframe
                      width="100%"
                      height="300"
                      src="https://www.youtube.com/embed/ozsiSecYy2w"
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-xl"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Само видео было создано при помощи наших великих людей и т.д.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-end w-full mt-auto pt-6">
              <div className="text-sm text-gray-500">
                Цена
                <p className="text-xl font-bold text-[#111]">12 990 ₸</p>
              </div>
              <div className="text-sm text-gray-500 text-right">
                Диллерская цена
                <p className="text-xl font-bold text-[#111]">8 990 ₸</p>
              </div>
            </div>
          </div>
        </div>

        {/* Правая колонка — управление */}
        <div className="p-6 max-w-[460px] space-y-6 bg-[#F6F6F6] min-h-screen">
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

      {/* Контент снизу */}
      <div className="px-6 pt-0 space-y-6">
        <h2 className="text-xl font-bold  text-[#111]">Доступные товары</h2>
        <ProductCardWare name="9-А Шампунь Tannur" shopPrice="12 990 ₸" dealerPrice="7 990 ₸" quantity={897} image="/icons/Photo icon 1.jpg" />

        <div className="grid grid-cols-2 gap-4 max-w-[760px]">
          <ActionButton icon="/icons/IconProfileOrange.svg" label="Пополнить остаток" onClick={() => alert('Пополнение')} />
          <ActionButton icon="/icons/IconProfileOrange.svg" label="Уменьшить остаток" onClick={() => alert('Уменьшение')} />
        </div>
      </div>
    </div>
  );
}