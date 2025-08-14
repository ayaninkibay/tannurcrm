'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Sparkles, Play, 
  ShoppingCart, Heart, Share2, Star, Package
} from 'lucide-react';


import { ProductRow } from '@/types/supabase'; 

// Если ProductRow недоступен, определите интерфейс ProductData
// на основе используемых полей из объекта 'product'.
// Это очень важно для правильной типизации пропса 'product'.
interface ProductData {
  image_url: string | null;
  gallery: string[] | null;
  name: string | null;
  flagman: boolean | null;
  is_active: boolean | null;
  description: string | null;
  compound: string | null;
  video_instr: string | null;
  price: number | null;
  price_dealer: number | null;
  category: string | null;
  // Добавьте любые другие свойства, которые используются в компоненте
}

// Определите интерфейс для пропсов компонента ProductInfoBlock
interface ProductInfoBlockProps {
  product: ProductData; // Теперь 'product' типизирован
}

// Передайте типизированные пропсы в компонент
export default function ProductInfoBlock({ product }: ProductInfoBlockProps) {
  const [activeTab, setActiveTab] = useState('composition');
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  // 💡 Исправлено: Явно указан тип для состояния `productImages` как `string[]`
  const [productImages, setProductImages] = useState<string[]>([]);

  useEffect(() => {
    if (product) {
      // Формируем массив изображений
      // 💡 Исправлено: Явно указан тип для локальной переменной `images` как `string[]`
      const images: string[] = [];
      
      // Основное изображение
      if (product.image_url) {
        images.push(product.image_url);
      }
      
      // Дополнительные изображения из галереи
      if (product.gallery && Array.isArray(product.gallery)) {
        // Убедитесь, что каждый элемент галереи также является строкой
        product.gallery.forEach(img => {
          images.push(img);
        });
      }
      
      // Если нет изображений, используем заглушки
      if (images.length === 0) {
        images.push(
          'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop'
        );
      }
      
      setProductImages(images);
    }
  }, [product]);

  const handlePrev = () => {
    setActiveImage((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveImage((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

// Функция для извлечения ID видео из YouTube URL
const getYouTubeEmbedUrl = (url: string | null): string | undefined => { // ✨ ИСПРАВЛЕНИЕ: Указываем возвращаемый тип string | undefined
  if (!url) return undefined; // ✨ ИСПРАВЛЕНИЕ: Возвращаем undefined вместо null, если URL пуст

  // Различные форматы YouTube URL
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  // Если URL уже в формате embed, возвращаем как есть
  if (url.includes('youtube.com/embed/')) {
    return url;
  }

  return undefined; // ✨ ИСПРАВЛЕНИЕ: Возвращаем undefined, если не удалось извлечь URL для встраивания
};

  if (!product) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#D77E6C] border-t-transparent"></div>
      </div>
    );
  }

  // Расчет скидки
  const discount = product.price && product.price_dealer 
    ? Math.round(((product.price - product.price_dealer) / product.price) * 100)
    : 0;

  // Форматирование цены
  // 💡 Добавлена явная типизация для `price`
  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return '0'; // Уточненная проверка на null/undefined
    return price.toLocaleString('ru-RU');
  };

  // Генерируем случайное количество отзывов для демо
  const reviewsCount = Math.floor(Math.random() * 50) + 10;
  const rating = 4 + Math.random() * 0.5; // Рейтинг от 4 до 4.5

  return (
    <div className="w-full h-full">
      <div className="max-w-420 mx-auto">
        {/* Мобильный заголовок */}
        <div className="md:hidden mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{product.name || 'Без названия'}</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-sm text-gray-600">({reviewsCount} отзывов)</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Блок с изображениями */}
            <div className="w-full lg:w-1/2 p-4 md:p-8">
              <div className="relative">
                {/* Основное изображение */}
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100">
                  {productImages.length > 0 ? (
                    <div
                      className="flex h-full transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${activeImage * 100}%)` }}
                    >
                      {productImages.map((src, index) => (
                        <img
                          key={index}
                          src={src}
                          alt={`${product.name}-${index}`}
                          className="w-full h-full object-cover flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/icons/Photo_icon_1.jpg'; // Добавлено приведение типа
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="w-20 h-20 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Кнопки навигации - показываем только если больше 1 изображения */}
                  {productImages.length > 1 && (
                    <>
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
                    </>
                  )}

                  {/* Бейдж - показываем если товар флагман */}
                  {product.flagman && (
                    <div className="absolute top-4 left-4 bg-[#D77E6C] text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Хит продаж
                    </div>
                  )}

                  {/* Статус активности */}
                  {product.is_active === false && (
                    <div className="absolute top-4 left-4 bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Неактивен
                    </div>
                  )}

                  {/* Избранное */}
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  </button>
                </div>

                {/* Превью изображений - показываем только если больше 1 */}
                {productImages.length > 1 && (
                  <div className="mt-4 grid grid-cols-4 gap-2 md:gap-3">
                    {productImages.slice(0, 4).map((src, index) => (
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
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/icons/Photo_icon_1.jpg'; // Добавлено приведение типа
                          }}
                        />
                        {index === 3 && productImages.length > 4 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white font-semibold">+{productImages.length - 4}</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Контент с описанием */}
            <div className="w-full lg:w-1/2 p-4 md:p-8 lg:border-l border-gray-100">
              {/* Десктопный заголовок */}
              <div className="hidden md:block mb-6">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                  {product.name || 'Без названия'}
                </h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-gray-600">({reviewsCount} отзывов)</span>
                  <button className="text-[#D77E6C] hover:underline flex items-center gap-1">
                    <Share2 className="w-4 h-4" />
                    Поделиться
                  </button>
                </div>
                
                {/* Категория и статус */}
                <div className="flex items-center gap-3 mt-3">
                  {product.category && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                      {product.category}
                    </span>
                  )}
                  {product.flagman && (
                    <span className="px-3 py-1 bg-[#D77E6C]/10 text-[#D77E6C] rounded-lg text-sm font-medium">
                      Флагман
                    </span>
                  )}
                </div>
              </div>

              {/* Описание */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Описание</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description || 'Описание товара отсутствует'}
                </p>
              </div>

              {/* Табы БЕЗ нижнего бордера */}
              <div className="mb-6">
                <div className="flex gap-0">
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
                      {product.compound ? (
                        <div className="text-gray-600 whitespace-pre-line">
                          {product.compound}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">
                          Информация о составе отсутствует
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {product.video_instr ? (
                        <div className="relative w-full overflow-hidden rounded-2xl bg-black" style={{ paddingTop: "56.25%" }}>
                          <iframe
                            className="absolute top-0 left-0 w-full h-full"
                            src={getYouTubeEmbedUrl(product.video_instr)}
                            title="Video instruction"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Play className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>Видео-инструкция отсутствует</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Цены и кнопки */}
              <div className="mt-8 space-y-4 lg:mt-auto">
                {/* Цены */}
                <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gradient-to-r from-[#FFE8E4] to-[#FFF5F3] rounded-2xl">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Розничная цена</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(product.price)} ₸
                    </p>
                  </div>
                  <div className="flex-1 sm:text-right">
                    <p className="text-sm text-gray-600 mb-1">Дилерская цена</p>
                    <div className="flex items-baseline gap-2 sm:justify-end">
                      <p className="text-2xl font-bold text-[#D77E6C]">
                        {formatPrice(product.price_dealer)} ₸
                      </p>
                      {discount > 0 && (
                        <span className="text-sm text-green-600 font-semibold">
                          -{discount}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Кнопки действий */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    className="flex-1 px-6 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 bg-[#D77E6C] text-white hover:bg-[#C56D5C]"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Добавить в корзину
                  </button>
                  <button 
                    className="flex-1 border-2 px-6 py-4 rounded-full font-semibold transition-all duration-300 border-[#D77E6C] text-[#D77E6C] hover:bg-[#D77E6C] hover:text-white"
                  >
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
              <p className="text-xl font-bold text-[#D77E6C]">
                {formatPrice(product.price_dealer)} ₸
              </p>
              <span className="text-xs text-gray-500 line-through">
                {formatPrice(product.price)} ₸
              </span>
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