// src/app/admin/teamcontent/profile_star/page.tsx
'use client';

import React, { useState, MouseEvent, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { FifthTemplate } from '@/components/layouts/TannurPageTemplates';
import DealerProductCard from '@/components/product/DealerProductCard';
import DealerBigProductCard from '@/components/product/DealerBigProductCard';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { Database } from '@/types/supabase';

// Типы
type ProductRow = Database['public']['Tables']['products']['Row'];
type UserRow = Database['public']['Tables']['users']['Row'];

function ProfileStarContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const starId = searchParams?.get('id');
  
  const [showClientPrices, setShowClientPrices] = useState(false);
  const [starProfile, setStarProfile] = useState<UserRow | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [bigProduct, setBigProduct] = useState<ProductRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [starId]);

  // Загрузка данных
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Если есть ID, загружаем профиль знаменитости
      if (starId) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', starId)
          .eq('role', 'celebrity')
          .single<UserRow>();

        if (!userError && userData) {
          setStarProfile(userData);
        }
      }

      // Загружаем товары из БД
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('flagman', { ascending: false }) // Сначала флагманские товары
        .limit(9);

      if (productsError) throw productsError;
      
      if (productsData && productsData.length > 0) {
        // Первый товар (желательно флагман) как большой
        setBigProduct(productsData[0]);
        // Остальные товары
        setProducts(productsData.slice(1));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  // Копирование ссылки
  const handleCopy = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const text = starProfile?.referral_code 
      ? `tannur.app/${starProfile.referral_code}`
      : 'tannur.app/KZ848970';
    
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success('Ссылка скопирована!'))
      .catch(() => toast.error('Не удалось скопировать ссылку'));
  };

  // Переход на страницу товара
  const handleProductClick = (productId: string) => {
    router.push(`/celebrity/store/product_view?id=${productId}`);
  };

  // Форматирование имени
  const getStarName = () => {
    if (starProfile) {
      return `${starProfile.first_name || ''} ${starProfile.last_name || ''}`.trim() || 'Знаменитость';
    }
    return 'Інжу Ануарбек';
  };

  // Получение Instagram
  const getInstagram = () => {
    if (starProfile?.instagram) {
      return starProfile.instagram.replace('@', '').replace('https://instagram.com/', '');
    }
    return 'inzhu_anuarbek';
  };

  // Получение аватара
  const getAvatarUrl = () => {
    if (starProfile?.avatar_url) {
      return starProfile.avatar_url;
    }
    return '/icons/UsersAvatarPrew2.jpg';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F6F6F6]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D77E6C] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <FifthTemplate
      header={
        <MoreHeaderAD title="Страница знаменитости" />
      }
      /* Первая колонка — профиль */
      column1={
        <>
          <div className="relative rounded-2xl bg-white overflow-hidden pb-6 sm:pb-8 md:pb-12">
            {/* Градиентный фон */}
            <div className="h-24 sm:h-32 md:h-36 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200" />

            {/* Аватар */}
            <div className="absolute top-8 sm:top-10 md:top-12 left-4 sm:left-6 w-32 h-32 sm:w-48 sm:h-48 md:w-60 md:h-60 rounded-2xl overflow-hidden border-2 sm:border-4 border-white">
              <img
                src={getAvatarUrl()}
                alt={getStarName()}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Контент профиля */}
            <div className="pt-4 sm:pt-6 px-4 sm:px-6 md:px-8 flex flex-col lg:flex-row items-start lg:items-center gap-4">
              <div className="flex-1 mt-20 sm:mt-24 md:mt-0 md:ml-[15rem] flex flex-col">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-[#111] flex items-center gap-2">
                  <span className="break-words">{getStarName()}</span>
                  <Image src="/icons/IconCheckMarkBlue.svg" alt="verified" width={16} height={16} className="sm:w-5 sm:h-5" />
                </h1>

                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {starProfile?.region || 'Эстрада әншісі'}
                </p>

                {/* Ссылки */}
                <div className="mt-3 sm:mt-4 flex flex-col gap-y-2 text-xs text-gray-500">
                  <a href="#" onClick={handleCopy} className="flex items-center gap-1 hover:text-gray-700 transition-colors">
                    <Image src="/icons/IconCopyGray.svg" alt="copy" width={14} height={14} className="sm:w-4 sm:h-4" />
                    <span className="break-all">
                      tannur.app/{starProfile?.referral_code || 'KZ848970'}
                    </span>
                  </a>
                  <a
                    href={`https://instagram.com/${getInstagram()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                  >
                    <Image src="/icons/IconInstagram.svg" alt="instagram" width={14} height={14} className="sm:w-4 sm:h-4" />
                    <span className="break-all">instagram.com/{getInstagram()}</span>
                  </a>
                </div>
              </div>

              {/* Подписчики */}
              <div className="relative flex-shrink-0 mt-4 lg:mt-0 lg:-top-9 flex flex-col items-start lg:items-end w-full lg:w-auto">
                <div className="flex items-center gap-2">
                  <Image src="/icons/IconUsersOrange.svg" alt="subscribers" width={20} height={20} className="sm:w-6 sm:h-6" />
                  <span className="text-xl sm:text-2xl font-semibold text-[#111]">1 283</span>
                </div>
                <span className="text-xs sm:text-sm text-gray-500">Подписчики</span>
              </div>

              {/* Декор */}
              <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 opacity-20">
                <Image src="/icons/IconDecorOrange.svg" alt="decor" width={80} height={80} className="sm:w-24 sm:h-24 md:w-[104px] md:h-[104px]" />
              </div>
            </div>
          </div>
        </>
      }
      /* Вторая колонка — компания */
      column2={
        <>
          <h3 className="text-base sm:text-lg font-semibold text-[#111] mt-4 sm:mt-7 mb-4 sm:mb-7 px-2 sm:px-0">О компании</h3>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col gap-4 sm:gap-6 mx-2 sm:mx-0">
            <div className="flex mt-3 sm:mt-5 justify-center">
              <Image src="/icons/IconlogoTannur.jpg" alt="Tannur" width={150} height={150} className="sm:w-20 sm:h-20" />
            </div>

            <div className="space-y-3 sm:space-y-4">
              <p className="text-xs leading-relaxed text-gray-500">
                It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more‑or‑less normal distribution of letters, as opposed to using &apos;Content here&apos;, making it look like readable English.
              </p>
              <p className="text-xs leading-relaxed text-gray-500">
                Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for &apos;lorem ipsum&apos; will uncover many web sites still in their infancy.
              </p>
              <p className="text-xs leading-relaxed text-gray-500">
                Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).
              </p>
            </div>

            <div className="inline-flex items-center rounded-full border border-[#DC7C67] overflow-hidden w-full sm:w-auto">
              <a href="#" className="flex items-center justify-center gap-2 px-3 py-1.5 bg-[#DC7C67] text-white text-xs flex-1 sm:flex-initial hover:bg-opacity-90 transition-colors">
                <Image src="/icons/IconGalleryWhite.svg" alt="link" width={14} height={14} />
                <span>Перейти на сайт</span>
              </a>
              <a href="#" className="flex items-center justify-center gap-2 px-3 py-1.5 bg-white text-[#111] text-xs flex-1 sm:flex-initial hover:bg-gray-50 transition-colors">
                <Image src="/icons/IconStarBlack.svg" alt="factory" width={14} height={14} />
                <span>Завод Tannur</span>
              </a>
            </div>
          </div>
        </>
      }
      /* Третья колонка — магазин */
      column3={
        <>
          <div className="flex justify-between items-center px-2 sm:px-4 md:px-6 lg:px-8 xl:px-0 mt-4 sm:mt-6 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#111]">Tannur Store</h2>
            <Image src="/icons/IconFilterBlack.svg" alt="filter" width={18} height={18} className="sm:w-5 sm:h-5 cursor-pointer hover:opacity-70 transition-opacity" />
          </div>

          {/* Сетка товаров */}
          <div className="px-1 sm:px-2">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Большой товар */}
              {bigProduct && (
                <div className="col-span-2">
                  <div onClick={() => handleProductClick(bigProduct.id)} className="cursor-pointer">
                    <DealerBigProductCard
                      product={bigProduct}
                      showClientPrice={showClientPrices}
                      className="h-full w-full"
                    />
                  </div>
                </div>
              )}

              {/* Остальные карточки */}
              {products.map((product) => (
                <div key={product.id} className="col-span-1">
                  <div onClick={() => handleProductClick(product.id)} className="cursor-pointer">
                    <DealerProductCard
                      product={product}
                      showClientPrice={showClientPrices}
                      className="h-full w-full"
                    />
                  </div>
                </div>
              ))}

              {/* Заглушка если нет товаров */}
              {!bigProduct && products.length === 0 && (
                <div className="col-span-5 text-center py-12 text-gray-500">
                  <p>Товары будут доступны в ближайшее время</p>
                </div>
              )}
            </div>
          </div>

          {/* Фотографии */}
          <div className="mt-8 sm:mt-10 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-0">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#111] mb-4 sm:mb-6">Фотографии</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {['/icons/gallery1.jpg', '/icons/gallery2.jpg', '/icons/gallery3.jpg', '/icons/gallery4.jpg'].map((src, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-2xl group cursor-pointer">
                  <img
                    src={src}
                    alt={`Фото ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      }
    />
  );
}

// Оборачиваем компонент в Suspense
export default function ProfileStarPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#F6F6F6]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D77E6C] border-t-transparent"></div>
      </div>
    }>
      <ProfileStarContent />
    </Suspense>
  );
}