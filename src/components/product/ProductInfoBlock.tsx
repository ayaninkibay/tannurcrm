'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import ActionButton from '@/components/ui/ActionButton';
import { cn } from '@/lib/utils';

export default function ProductInfoBlock() {
  const [activeTab, setActiveTab] = useState('composition');
  const [activeImage, setActiveImage] = useState(0);

  const productImages = [
    '/icons/Photo_icon_1.jpg',
    '/icons/Photo_icon_2.jpg',
    '/icons/Photo_icon_3.jpg',
    '/icons/Photo_icon_1.jpg',
  ];

  const handlePrev = () => {
    setActiveImage((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveImage((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={cn(
      "relative flex flex-col sm:flex-row bg-white rounded-xl p-4 sm:p-6 lg:p-9 w-full overflow-hidden transition-[max-height] duration-500 ease-in-out",
      activeTab === 'video' ? 'max-h-[750px]' : 'max-h-[650px]'
    )}>
      
      {/* Блок с изображениями, полностью адаптивный */}
      <div className="flex flex-col items-center w-full sm:w-1/2 lg:w-[540px]">
        <div className="w-full h-auto aspect-square overflow-hidden rounded-xl relative">
          <div
            className="flex transition-transform duration-500 ease-in-out h-full"
            style={{ transform: `translateX(-${activeImage * 100}%)` }}
          >
            {productImages.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`product-${index}`}
                className="w-full h-full object-cover flex-shrink-0"
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
              className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-200 ${activeImage === index ? 'bg-gray-500' : 'bg-gray-300'}`}
            />
          ))}
          <button onClick={handleNext} className="text-xl px-2 text-gray-500 hover:text-gray-700">›</button>
        </div>
      </div>

      {/* Контент с описанием */}
      <div className="sm:ml-10 mt-6 sm:mt-0 flex flex-col justify-between w-full">
        <div>
          <h2 className="text-xl font-bold text-[#111] mb-1">9-А Шампунь Tannur</h2>
          <p className="text-lg text-gray-500 mb-0 mt-4">Описание</p>
          <p className="text-sm text-gray-800 mb-8">
            It is a long established fact that a reader will be distracted by the eader will be distracted by theader will be distracted by theader will be distracted by theader will be distracted by threadable content of a page when looking at its layout.
          </p>
          <div className="flex gap-6 border-b pb-2">
            <button onClick={() => setActiveTab('composition')} className={`flex items-center gap-1 text-sm font-medium pb-1 border-b-2 transition ${activeTab === 'composition' ? 'border-gray-400 text-[#111]' : 'border-gray-200 text-gray-400'}`}>
              <Image src="/icons/IconChartOrange.svg" alt="composition" width={16} height={16} />
              Состав
            </button>
            <button onClick={() => setActiveTab('video')} className={`flex items-center gap-1 text-sm font-medium pb-1 border-b-2 transition ${activeTab === 'video' ? 'border-gray-400 text-[#111]' : 'border-gray-200 text-gray-400'}`}>
              <Image src="/icons/Icon video red.svg" alt="video" width={16} height={16} />
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
                {/* Адаптивный контейнер для видео */}
                <div className="relative w-full overflow-hidden rounded-xl" style={{ paddingTop: "56.25%" }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src="https://www.youtube.com/embed/ozsiSecYy2w"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
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
  );
}
