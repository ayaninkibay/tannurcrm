'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, ChevronRight, Sparkles, Play,
  ShoppingCart, Heart, Share2, Star, Package,
  Plus, Minus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';

import { useUser } from '@/context/UserContext';
import { useCartModule } from '@/lib/cart/CartModule';
import { useTranslate } from '@/hooks/useTranslate';

// Типы
import { Database } from '@/types/supabase';
type ProductRow = Database['public']['Tables']['products']['Row'];

interface ProductInfoBlockProps {
  product: ProductRow;
}

export default function ProductInfoBlock({ product }: ProductInfoBlockProps) {
  const router = useRouter();
  const { t } = useTranslate();
  const { profile: currentUser } = useUser();
  const cart = useCartModule();

  // Существующие стейты
  const [activeTab, setActiveTab] = useState<'composition' | 'video'>('composition');
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [productImages, setProductImages] = useState<string[]>([]);

  // Новые стейты для корзины
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [productStock, setProductStock] = useState<number>(0);
  const [loadingStock, setLoadingStock] = useState(true);

  // Загрузка данных корзины и остатков при монтировании
  useEffect(() => {
    if (currentUser) {
      loadCartData();
    }
    if (product) {
      loadProductStock();
    }
  }, [currentUser, product]);

  const loadCartData = async () => {
    if (!currentUser) return;
    try {
      await cart.loadUserCart(currentUser.id);
    } catch (error) {
      // Не блокируем загрузку страницы если корзина не загрузилась
      console.error('Error loading cart:', error);
      // Корзина будет создана при первом добавлении товара
    }
  };

  // Загрузка остатков товара
  const loadProductStock = async () => {
    if (!product) return;
    
    setLoadingStock(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('stock')
        .eq('id', product.id)
        .single();

      if (error) throw error;
      
      setProductStock(data?.stock || 0);
    } catch (error) {
      console.error('Error loading stock:', error);
      setProductStock(0);
    } finally {
      setLoadingStock(false);
    }
  };

  // Добавить в корзину
  const handleAddToCart = async () => {
    if (!currentUser) {
      toast.error(t('Необходимо авторизоваться'));
      router.push('/signin');
      return;
    }

    if (!product) return;

    // Проверка наличия товара
    if (productStock < quantity) {
      toast.error(t('Недостаточно товара на складе'));
      return;
    }

    setIsAddingToCart(true);
    try {
      // Сначала убедимся что корзина загружена
      if (!cart.cart) {
        await cart.loadUserCart(currentUser.id);
      }

      await cart.addItem(
        product.id,
        quantity,
        product.price || 0,
        product.price_dealer || 0
      );

      // Не дублируем toast - он уже показывается в cart.addItem
      setQuantity(1);
      
      // Обновляем остатки после добавления
      await loadProductStock();

    } catch (error: any) {
      // Ошибка уже показана в cart.addItem, просто логируем
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Купить сейчас
  const handleBuyNow = async () => {
    if (!currentUser) {
      toast.error(t('Необходимо авторизоваться'));
      router.push('/signin');
      return;
    }

    if (!product) return;

    // Проверка наличия товара
    if (productStock < quantity) {
      toast.error(t('Недостаточно товара на складе'));
      return;
    }

    setIsBuyingNow(true);
    try {
      // Сначала убедимся что корзина загружена
      if (!cart.cart) {
        await cart.loadUserCart(currentUser.id);
      }

      await cart.addItem(
        product.id,
        quantity,
        product.price || 0,
        product.price_dealer || 0
      );

      // Добавляем небольшую задержку чтобы данные успели сохраниться
      await new Promise(resolve => setTimeout(resolve, 500));

      // Переходим в корзину
      router.push('/dealer/cart');

    } catch (error: any) {
      // Ошибка уже показана в cart.addItem, просто логируем
      console.error('Error buying now:', error);
    } finally {
      setIsBuyingNow(false);
    }
  };

  useEffect(() => {
    if (product) {
      const images: string[] = [];

      if (product.image_url) {
        images.push(product.image_url);
      }
      if (product.gallery && Array.isArray(product.gallery)) {
        product.gallery.forEach(img => {
          if (img) images.push(img);
        });
      }
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
  const getYouTubeEmbedUrl = (url: string | null): string | undefined => {
    if (!url) return undefined;

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
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    return undefined;
  };

  if (!product) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#D77E6C] border-t-transparent" />
      </div>
    );
  }

  // Расчет скидки
  const discount = product.price && product.price_dealer
    ? Math.round(((product.price - product.price_dealer) / product.price) * 100)
    : 0;

  // Форматирование цены
  const formatPrice = (price: number | null): string => {
    if (price === null) return '0';
    return price.toLocaleString('ru-RU');
  };

  // Генерируем демо-значения
  const reviewsCount = Math.floor(Math.random() * 50) + 10;
  const rating = 4 + Math.random() * 0.5; // 4–4.5

  return (
    <div className="w-full h-full">
      <div className="max-w-420 mx-auto">
        {/* Мобильный заголовок */}
        <div className="md:hidden mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{product.name || t('Без названия')}</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              ({t('{n} отзывов').replace('{n}', String(reviewsCount))})
            </span>
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
                            (e.target as HTMLImageElement).src = '/icons/Photo_icon_1.jpg';
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="w-20 h-20 text-gray-300" />
                    </div>
                  )}

                  {/* Кнопки навигации */}
                  {productImages.length > 1 && (
                    <>
                      <button
                        onClick={handlePrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                        aria-label="Prev"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                        aria-label="Next"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Бейджи */}
                  {product.flagman && (
                    <div className="absolute top-4 left-4 bg-[#D77E6C] text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {t('Хит продаж')}
                    </div>
                  )}
                  {productStock === 0 && !loadingStock && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {t('Нет в наличии')}
                    </div>
                  )}

                  {/* Избранное */}
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                    aria-pressed={isFavorite}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  </button>
                </div>

                {/* Превью изображений */}
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
                            (e.target as HTMLImageElement).src = '/icons/Photo_icon_1.jpg';
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
                  {product.name || t('Без названия')}
                </h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-gray-600">
                    ({t('{n} отзывов').replace('{n}', String(reviewsCount))})
                  </span>
                  <button className="text-[#D77E6C] hover:underline flex items-center gap-1">
                    <Share2 className="w-4 h-4" />
                    {t('Поделиться')}
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
                      {t('Флагман')}
                    </span>
                  )}
                  {!loadingStock && productStock > 0 && productStock <= 10 && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium">
                      {t('Осталось мало')} ({productStock} шт.)
                    </span>
                  )}
                </div>
              </div>

              {/* Описание */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('Описание')}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description || t('Описание товара отсутствует')}
                </p>
              </div>

              {/* Табы */}
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
                    {t('Состав')}
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
                    {t('Видео инструкция')}
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
                          {t('Информация о составе отсутствует')}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {product.video_instr ? (
                        <div className="relative w-full overflow-hidden rounded-2xl bg-black" style={{ paddingTop: '56.25%' }}>
                          <iframe
                            className="absolute top-0 left-0 w-full h-full"
                            src={getYouTubeEmbedUrl(product.video_instr)}
                            title={t('Видео инструкция')}
                            frameBorder={0}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Play className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>{t('Видео-инструкция отсутствует')}</p>
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
                    <p className="text-sm text-gray-600 mb-1">{t('Розничная цена')}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(product.price)} ₸
                    </p>
                  </div>
                  <div className="flex-1 sm:text-right">
                    <p className="text-sm text-gray-600 mb-1">{t('Дилерская цена')}</p>
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

                {/* Наличие товара */}
                {!loadingStock && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{t('В наличии:')}</span>
                    <span className={`font-bold ${
                      productStock === 0 ? 'text-red-600' : 
                      productStock < 10 ? 'text-orange-600' : 
                      'text-green-600'
                    }`}>
                      {productStock === 0 ? t('Нет в наличии') : 
                       productStock < 10 ? `${productStock} шт. (мало)` : 
                       `${productStock} шт.`}
                    </span>
                  </div>
                )}

                {/* Селектор количества */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{t('Количество:')}</span>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center hover:bg-white rounded transition-colors disabled:opacity-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(productStock, quantity + 1))}
                      disabled={quantity >= productStock}
                      className="w-10 h-10 flex items-center justify-center hover:bg-white rounded transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Кнопки действий */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || productStock === 0 || loadingStock}
                    className="flex-1 px-6 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 bg-[#D77E6C] text-white hover:bg-[#C56D5C] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {isAddingToCart ? t('Добавление...') : 
                     productStock === 0 ? t('Нет в наличии') : 
                     t('Добавить в корзину')}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={isBuyingNow || productStock === 0 || loadingStock}
                    className="flex-1 border-2 px-6 py-4 rounded-full font-semibold transition-all duration-300 border-[#D77E6C] text-[#D77E6C] hover:bg-[#D77E6C] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBuyingNow ? t('Переход...') : 
                     productStock === 0 ? t('Нет в наличии') : 
                     t('Купить сейчас')}
                  </button>
                </div>

                {/* Дополнительная информация */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center text-sm text-gray-600">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="font-semibold text-gray-900">{t('Бесплатная')}</p>
                    <p>{t('доставка от 50К')}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="font-semibold text-gray-900">{t('100%')}</p>
                    <p>{t('оригинал')}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1 p-3 bg-gray-50 rounded-xl">
                    <p className="font-semibold text-gray-900">{t('Гарантия')}</p>
                    <p>{t('возврата')}</p>
                  </div>
                </div>
              </div>
            </div>{/* /контент */}
          </div>
        </div>
      </div>
    </div>
  );
}