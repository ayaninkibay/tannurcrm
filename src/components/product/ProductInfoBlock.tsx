'use client';

import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Sparkles, Play, 
  ShoppingCart, Heart, Share2, Star
} from 'lucide-react';

export default function ProductInfoBlock() {
  const [activeTab, setActiveTab] = useState('composition');
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const productImages = [
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop',
  ];

  const handlePrev = () => {
    setActiveImage((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveImage((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full h-full">
      <div className="max-w-420 mx-auto">
        {/* Мобильный заголовок */}
        <div className="md:hidden mb-4">
          <h1 className="text-2xl font-bold text-gray-900">9-А Шампунь Tannur</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-sm text-gray-600">(234 отзыва)</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Блок с изображениями */}
            <div className="w-full lg:w-1/2 p-4 md:p-8">
              <div className="relative">
                {/* Основное изображение */}
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100">
                  <div
                    className="flex h-full transition-transform duration-500 ease-in-out"
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
                  
                  {/* Кнопки навигации */}
                  <button
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Бейдж */}
                  <div className="absolute top-4 left-4 bg-[#D77E6C] text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Хит продаж
                  </div>

                  {/* Избранное */}
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  </button>
                </div>

                {/* Превью изображений */}
                <div className="mt-4 grid grid-cols-4 gap-2 md:gap-3">
                  {productImages.map((src, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        activeImage === index ? 'border-[#D77E6C]' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={src}
                        alt={`preview-${index}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Контент с описанием */}
            <div className="w-full lg:w-1/2 p-4 md:p-8 lg:border-l border-gray-100">
              {/* Десктопный заголовок */}
              <div className="hidden md:block mb-6">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">9-А Шампунь Tannur</h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-gray-600">(234 отзыва)</span>
                  <button className="text-[#D77E6C] hover:underline flex items-center gap-1">
                    <Share2 className="w-4 h-4" />
                    Поделиться
                  </button>
                </div>
              </div>

              {/* Описание */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Описание</h3>
                <p className="text-gray-600 leading-relaxed">
                  Профессиональный шампунь для глубокого восстановления волос. 
                  Инновационная формула с кератином и маслом арганы обеспечивает 
                  интенсивное питание и увлажнение, возвращая волосам здоровый блеск и шелковистость.
                </p>
              </div>

              {/* Табы */}
              <div className="mb-6">
                <div className="flex gap-0 ">
                  <button
                    onClick={() => setActiveTab('composition')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                      activeTab === 'composition'
                        ? 'border-[#D77E6C] text-[#D77E6C]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    Состав
                  </button>
                  <button
                    onClick={() => setActiveTab('video')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                      activeTab === 'video'
                        ? 'border-[#D77E6C] text-[#D77E6C]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Play className="w-4 h-4" />
                    Видео инструкция
                  </button>
                </div>

                {/* Контент табов */}
                <div className="mt-6">
                  {activeTab === 'composition' ? (
                    <div className="space-y-3">
                      <p className="text-gray-600">
                        <strong>Активные компоненты:</strong>
                      </p>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-[#D77E6C] rounded-full mt-1.5" />
                          <span>Гидролизованный кератин - восстанавливает структуру волос</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-[#D77E6C] rounded-full mt-1.5" />
                          <span>Масло арганы - интенсивное питание и увлажнение</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-[#D77E6C] rounded-full mt-1.5" />
                          <span>Протеины шелка - придают блеск и гладкость</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-[#D77E6C] rounded-full mt-1.5" />
                          <span>Витаминный комплекс A, E, B5 - укрепление волос</span>
                        </li>
                      </ul>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative w-full overflow-hidden rounded-2xl" style={{ paddingTop: "56.25%" }}>
                        <iframe
                          className="absolute top-0 left-0 w-full h-full"
                          src="https://www.youtube.com/embed/ozsiSecYy2w"
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        Видео-инструкция по применению шампуня для достижения максимального эффекта.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Цены и кнопки - фиксированные внизу на мобильных */}
              <div className="mt-8 space-y-4 lg:mt-auto">
                {/* Цены */}
                <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gradient-to-r from-[#FFE8E4] to-[#FFF5F3] rounded-2xl">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Розничная цена</p>
                    <p className="text-2xl font-bold text-gray-900">12 990 ₸</p>
                  </div>
                  <div className="flex-1 sm:text-right">
                    <p className="text-sm text-gray-600 mb-1">Дилерская цена</p>
                    <div className="flex items-baseline gap-2 sm:justify-end">
                      <p className="text-2xl font-bold text-[#D77E6C]">8 990 ₸</p>
                      <span className="text-sm text-green-600 font-semibold">-31%</span>
                    </div>
                  </div>
                </div>

                {/* Кнопки действий */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="flex-1 bg-[#D77E6C] text-white px-6 py-4 rounded-full font-semibold hover:bg-[#C56D5C] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Добавить в корзину
                  </button>
                  <button className="flex-1 border-2 border-[#D77E6C] text-[#D77E6C] px-6 py-4 rounded-full font-semibold hover:bg-[#D77E6C] hover:text-white transition-all duration-300">
                    Купить сейчас
                  </button>
                </div>

                {/* Дополнительная информация */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center text-sm text-gray-600">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="font-semibold text-gray-900">Бесплатная</p>
                    <p>доставка от 50К</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="font-semibold text-gray-900">100%</p>
                    <p>оригинал</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1 p-3 bg-gray-50 rounded-xl">
                    <p className="font-semibold text-gray-900">Гарантия</p>
                    <p>возврата</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Фиксированная панель на мобильных */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-600">Дилерская цена</p>
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-bold text-[#D77E6C]">8 990 ₸</p>
              <span className="text-xs text-gray-500 line-through">12 990 ₸</span>
            </div>
          </div>
          <button className="bg-[#D77E6C] text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            В корзину
          </button>
        </div>
      </div>
    </div>
  );
}