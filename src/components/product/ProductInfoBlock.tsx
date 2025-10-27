// src/components/product/ProductInfoBlock.tsx
// ОБНОВЛЕНО: работа с новым CartModule

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, ChevronRight, Sparkles, Play,
  ShoppingCart, Heart, Share2, Star, Package,
  Plus, Minus, ArrowRight, FileText, Award,
  Truck, Shield, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';

import { useUser } from '@/context/UserContext';
import { useCartModule } from '@/lib/cart/CartModule';
import { useTranslate } from '@/hooks/useTranslate';

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

  // Стейты для корзины
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [productStock, setProductStock] = useState<number>(0);
  const [loadingStock, setLoadingStock] = useState(true);
  
  // Состояние товара в корзине
  const [isInCart, setIsInCart] = useState(false);
  const [cartItemQuantity, setCartItemQuantity] = useState(0);
  const [totalCartItems, setTotalCartItems] = useState(0);
  const [totalCartAmount, setTotalCartAmount] = useState(0);

  // ==========================================
  // ЗАГРУЗКА ДАННЫХ
  // ==========================================
  
  useEffect(() => {
    if (currentUser) {
      loadCartData();
    }
    if (product) {
      loadProductStock();
    }
  }, [currentUser, product]);

  // Проверяем наличие товара в корзине
  useEffect(() => {
    if (cart.cartItems && product) {
      const cartItem = cart.cartItems.find(item => item.product_id === product.id);
      setIsInCart(!!cartItem);
      setCartItemQuantity(cartItem?.quantity || 0);
      
      // Считаем общее количество товаров
      const total = cart.cartItems.reduce((sum, item) => sum + item.quantity, 0);
      setTotalCartItems(total);
      
      // Считаем общую сумму ВСЕХ товаров
      const totalAmount = cart.cartItems.reduce((sum, item) => {
        const price = item.price_dealer || 0;
        return sum + (item.quantity * price);
      }, 0);
      setTotalCartAmount(totalAmount);
    }
  }, [cart.cartItems, product]);

  const loadCartData = async () => {
    if (!currentUser) return;
    try {
      await cart.loadUserCart(currentUser.id);
    } catch (error) {
      console.error('❌ Error loading cart:', error);
    }
  };

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
      console.error('❌ Error loading stock:', error);
      setProductStock(0);
    } finally {
      setLoadingStock(false);
    }
  };

  // ==========================================
  // ДОБАВИТЬ В КОРЗИНУ
  // ==========================================
  
  const handleAddToCart = async () => {
    if (!currentUser) {
      toast.error(t('Необходимо авторизоваться'));
      router.push('/signin');
      return;
    }

    if (!product) return;

    // Проверка наличия
    if (productStock < quantity) {
      toast.error(t('Недостаточно товара на складе'));
      return;
    }

    setIsAddingToCart(true);
    try {
      console.log('➕ Adding to cart:', { productId: product.id, quantity });
      
      // Используем НОВЫЙ метод addItem
      await cart.addItem(
        currentUser.id,
        product.id,
        quantity
      );

      setQuantity(1);
      
      // Обновляем остатки
      await loadProductStock();

    } catch (error: any) {
      console.error('❌ Error adding to cart:', error);
      // toast уже показан в CartModule
    } finally {
      setIsAddingToCart(false);
    }
  };

  // ==========================================
  // ИЗОБРАЖЕНИЯ
  // ==========================================
  
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
        images.push('/icons/Photo_icon_1.jpg');
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

  // ==========================================
  // YOUTUBE EMBED
  // ==========================================
  
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

  // ==========================================
  // ФОРМАТИРОВАНИЕ
  // ==========================================
  
  const formatPrice = (price: number | null): string => {
    if (price === null) return '0';
    return price.toLocaleString('ru-RU');
  };

  const discount = product.price && product.price_dealer
    ? Math.round(((product.price - product.price_dealer) / product.price) * 100)
    : 0;

  const reviewsCount = Math.floor(Math.random() * 50) + 10;
  const rating = 4 + Math.random() * 0.5;

  // ==========================================
  // LOADING STATE
  // ==========================================
  
  if (!product) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 text-[#D77E6C] animate-spin" />
      </div>
    );
  }

  // ==========================================
  // РЕНДЕР
  // ==========================================
  
  return (
    <div className="w-full h-full">
      <div className="max-w-7xl mx-auto">
        
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
              ({reviewsCount} {t('отзывов')})
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row">
            
            {/* ЛЕВАЯ ЧАСТЬ - ИЗОБРАЖЕНИЯ */}
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

                  {/* Бейджи */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.flagman && (
                      <div className="bg-[#D77E6C] text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {t('Хит продаж')}
                      </div>
                    )}
                    {productStock === 0 && !loadingStock && (
                      <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {t('Нет в наличии')}
                      </div>
                    )}
                    {productStock > 0 && productStock <= 10 && !loadingStock && (
                      <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {t('Осталось:')} {productStock}
                      </div>
                    )}
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

            {/* ПРАВАЯ ЧАСТЬ - КОНТЕНТ */}
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
                    ({reviewsCount} {t('отзывов')})
                  </span>
                  <button className="text-[#D77E6C] hover:underline flex items-center gap-1">
                    <Share2 className="w-4 h-4" />
                    {t('Поделиться')}
                  </button>
                </div>

                {/* Категория */}
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
                <div className="flex gap-0 border-b border-gray-200">
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
                    {t('Видео')}
                  </button>
                </div>

                <div className="mt-6">
                  {activeTab === 'composition' ? (
                    <div className="text-gray-600 whitespace-pre-line">
                      {product.compound || t('Информация о составе отсутствует')}
                    </div>
                  ) : (
                    <div>
                      {product.video_instr ? (
                        <div className="relative w-full overflow-hidden rounded-2xl bg-black" style={{ paddingTop: '56.25%' }}>
                          <iframe
                            className="absolute top-0 left-0 w-full h-full"
                            src={getYouTubeEmbedUrl(product.video_instr)}
                            title={t('Видео инструкция')}
                            frameBorder={0}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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

              {/* ЦЕНЫ И ДЕЙСТВИЯ */}
              <div className="mt-8 space-y-4">
                
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

                {/* Индикатор корзины */}
                <div className="p-4 bg-gradient-to-r from-[#D77E6C]/5 to-[#E09080]/5 border border-[#D77E6C]/20 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <ShoppingCart className="w-6 h-6 text-[#D77E6C]" />
                        {totalCartItems > 0 && (
                          <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#D77E6C] text-white text-xs rounded-full flex items-center justify-center font-bold">
                            {totalCartItems}
                          </span>
                        )}
                      </div>
                      <div>
                        {cart.loading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-[#D77E6C] animate-spin" />
                            <p className="text-gray-500">{t('Загрузка...')}</p>
                          </div>
                        ) : totalCartItems > 0 ? (
                          <>
                            <p className="font-semibold text-gray-800">
                              {t('В корзине:')} {totalCartItems}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatPrice(totalCartAmount)} ₸
                            </p>
                          </>
                        ) : (
                          <div>
                            <p className="font-semibold text-gray-800">{t('Корзина пуста')}</p>
                            <p className="text-sm text-gray-500">{t('Добавьте товары')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {!cart.loading && totalCartItems > 0 && (
                      <button
                        onClick={() => router.push('/dealer/shop/cart')}
                        className="flex items-center gap-2 px-4 py-2 bg-[#D77E6C] text-white rounded-lg hover:bg-[#C56D5C] transition-colors font-medium"
                      >
                        <span>{t('Перейти')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

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
                      disabled={quantity >= productStock || loadingStock}
                      className="w-10 h-10 flex items-center justify-center hover:bg-white rounded transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Кнопка добавления */}
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || productStock === 0 || loadingStock}
                  className="w-full px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 bg-gradient-to-r from-[#D77E6C] to-[#E09080] text-white hover:from-[#C56D5C] hover:to-[#D77E6C] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('Добавление...')}
                    </>
                  ) : productStock === 0 ? (
                    t('Нет в наличии')
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      {t('Добавить в корзину')}
                    </>
                  )}
                </button>

                {/* Дополнительная информация */}
                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <Truck className="w-5 h-5 mx-auto mb-1 text-[#D77E6C]" />
                    <p className="font-semibold text-gray-900 text-xs">{t('Бесплатная')}</p>
                    <p className="text-xs text-gray-600">{t('доставка')}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <Shield className="w-5 h-5 mx-auto mb-1 text-[#D77E6C]" />
                    <p className="font-semibold text-gray-900 text-xs">{t('100%')}</p>
                    <p className="text-xs text-gray-600">{t('оригинал')}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <Award className="w-5 h-5 mx-auto mb-1 text-[#D77E6C]" />
                    <p className="font-semibold text-gray-900 text-xs">{t('Гарантия')}</p>
                    <p className="text-xs text-gray-600">{t('возврата')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Сертификаты */}
        <div className="mt-8 bg-white rounded-2xl p-4 md:p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#D77E6C]" />
            {t('Сертификаты и документы')}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Сертификат', 'Декларация', 'Инструкция', 'Паспорт'].map((doc, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#D77E6C] hover:bg-[#D77E6C]/5 transition-all">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-400 group-hover:text-[#D77E6C]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">
                        {t(doc)}
                      </p>
                      <p className="text-xs text-gray-500">PDF</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 border-t border-gray-200 pt-8 pb-4 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">TANNUR</h3>
          <p className="text-sm text-gray-500">© 2024 TANNUR. {t('Все права защищены.')}</p>
        </div>
      </div>
    </div>
  );
}