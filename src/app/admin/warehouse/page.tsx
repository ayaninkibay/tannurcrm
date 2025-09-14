'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import ProductCardWare from '@/components/ui/ProductCardWare';
import RightSidebar from '@/components/ui/RightSidebar';

import { 
  Package, 
  Users, 
  Gift, 
  Plus, 
  TrendingUp,
  Box,
  DollarSign,
  BarChart3,
  ShoppingBag,
  Sparkles,
  Eye
} from 'lucide-react';

import { useProductModule } from '@/lib/product/ProductModule';
import { useGiftModule } from '@/lib/gift/useGiftModule';
import Distrib, { DistribItem } from '@/components/reports/warehouse/distrib';
import Presents, { GiftItem } from '@/components/reports/warehouse/presents';
import { useTranslate } from '@/hooks/useTranslate';

type ActiveTab = 'warehouse' | 'distributors' | 'gifts';

export default function WareHouse() {
  const { t } = useTranslate();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>('warehouse');

  const { 
    products, 
    total, 
    isLoading, 
    error, 
    listProducts 
  } = useProductModule();

  const {
    gifts,
    stats: giftStats,
    loading: giftsLoading,
    loadGifts,
    loadStats
  } = useGiftModule();

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    totalValue: 0
  });

  // Загружаем все данные при инициализации
  useEffect(() => {
    loadProducts();
    loadGifts();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Перезагружаем подарки при переключении на вкладку gifts
  useEffect(() => {
    if (activeTab === 'gifts') {
      loadGifts();
      loadStats();
    }
  }, [activeTab, loadGifts, loadStats]);

  useEffect(() => {
    if (products.length > 0) {
      const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
      const totalValue = products.reduce((sum, p) => {
        const price = p.price_dealer || p.price || 0;
        const stock = p.stock || 0;
        return sum + (price * stock);
      }, 0);
      setStats({
        totalProducts: products.length,
        totalStock,
        totalValue
      });
    } else {
      setStats({ totalProducts: 0, totalStock: 0, totalValue: 0 });
    }
  }, [products]);

  const loadProducts = async () => {
    try {
      await listProducts({
        limit: 50,
        orderBy: 'created_at',
        order: 'desc'
      });
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const handleProductClick = (productId: string) => {
    router.push(`/admin/warehouse/product_view?id=${productId}`);
  };

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return '0 ₸';
    return `${price.toLocaleString('ru-RU')} ₸`;
  };

  const getImageUrl = (imageUrl?: string | null) => {
    if (!imageUrl) return '/icons/Photo_icon_1.jpg';
    return imageUrl;
  };

  // МОКИ для дистрибьюторов (остаются как есть)
  const distribItems: DistribItem[] = [
    { name: t('ИП Манна Мир'), qty: 153, total: '1 238 984 ₸', region: t('Алматы, Аксай 123') },
    { name: t('ТОО Жанна'),    qty: 43,  total: '538 984 ₸',   region: t('Алматы, Жандосова 2') },
  ];

  // Конвертируем реальные подарки в формат для компонента Presents
  const giftItems: GiftItem[] = gifts.map(gift => ({
    name: gift.recipient_name,
    qty: gift.gift_items.reduce((sum, item) => sum + item.quantity, 0),
    total: formatPrice(gift.total_amount),
    note: gift.reason
  }));

  const tabsData = [
    {
      id: 'warehouse' as const,
      icon: Package,
      title: t('Товары на складе'),
      count: stats.totalStock,
      unit: t('единиц'),
      sum: formatPrice(stats.totalValue),
      sumLabel: t('Общая стоимость'),
      color: '#D77E6C',
      bgColor: 'bg-orange-50',
      borderColor: 'border-[#D77E6C]',
      iconBg: 'bg-[#D77E6C]/10'
    },
    {
      id: 'distributors' as const,
      icon: Users,
      title: t('Дистрибьюторы'),
      count: 312, // Пока остается статичным
      unit: t('товаров'),
      sum: '2 598 899 ₸', // Пока остается статичным
      sumLabel: t('На реализации'),
      color: '#7C9D6C',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-600',
      iconBg: 'bg-green-100'
    },
    {
      id: 'gifts' as const,
      icon: Gift,
      title: t('Подарочный фонд'),
      count: giftStats.totalGifts,
      unit: t('подарков'),
      sum: formatPrice(giftStats.totalAmount),
      sumLabel: t('Общая стоимость'),
      color: '#9C7C6C',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-600',
      iconBg: 'bg-purple-100'
    }
  ];

  if (error) {
    return (
      <main className=" bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <MoreHeaderAD title={t('Склад Tannur')} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center bg-white p-8 rounded-2xl">
            <p className="text-red-500 mb-4 text-lg">{t('Ошибка')}: {String(error)}</p>
            <button 
              onClick={loadProducts}
              className="px-6 py-3 bg-[#D77E6C] text-white rounded-xl hover:bg-[#C56D5C] transition-all"
            >
              {t('Попробовать снова')}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <MoreHeaderAD title={t('Склад Tannur')} />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Левая колонка */}
        <div className="flex-1">
          {/* Табы-карточки */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-6">
            {tabsData.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative group rounded-2xl p-6 text-left border-2 transition-all duration-300 overflow-hidden
                    ${isActive 
                      ? `bg-white ${tab.borderColor}  scale-[1.02]` 
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'
                    }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#D77E6C]/5" />
                  )}
                  
                  <div className={`absolute top-4 right-4 w-2 h-2 rounded-full transition-all duration-300 ${
                    isActive ? 'bg-[#D77E6C] animate-pulse' : 'bg-gray-300'
                  }`} />
                  
                  <div className="relative">
                    {/* Иконка и заголовок */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2.5 rounded-xl transition-colors ${
                        isActive ? tab.iconBg : 'bg-gray-100 group-hover:bg-gray-200'
                      }`}>
                        <Icon className={`w-5 h-5 transition-colors`} style={{ color: isActive ? tab.color : undefined }} />
                      </div>
                      <p className={`text-sm font-medium transition-colors ${
                        isActive ? 'text-gray-900' : 'text-gray-600'
                      }`}>
                        {tab.title}
                      </p>
                    </div>
                    
                    {/* Основное число */}
                    <div className="mb-4">
                      <h3 className="text-3xl font-bold text-gray-900">
                        {tab.count.toLocaleString('ru-RU')}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{tab.unit}</p>
                    </div>
                    
                    {/* Сумма */}
                    <div className={`rounded-xl p-3 transition-colors ${
                      isActive ? 'bg-gradient-to-r from-[#D77E6C]/10 to-[#D77E6C]/5' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-semibold text-gray-900">{tab.sum}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{tab.sumLabel}</p>
                        </div>
                        <TrendingUp className={`${isActive ? 'text-[#D77E6C]' : 'text-gray-400'} w-5 h-5 transition-colors`} />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Основной контент */}
          <div className="bg-white rounded-2xl overflow-hidden">
            {/* Шапка секции */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {activeTab === 'warehouse' && <Package className="w-6 h-6 text-[#D77E6C]" />}
                  {activeTab === 'distributors' && <Users className="w-6 h-6 text-green-600" />}
                  {activeTab === 'gifts' && <Gift className="w-6 h-6 text-purple-600" />}
                  <h2 className="text-xl font-bold text-gray-900">
                    {activeTab === 'warehouse' ? t('Товары на складе') : 
                     activeTab === 'distributors' ? t('Дистрибьюторы') : t('Подарочный фонд')}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  {activeTab === 'warehouse' && (
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
                      {t('Всего: {n} товаров').replace('{n}', String(total || products.length))}
                    </span>
                  )}

                  {activeTab === 'gifts' && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
                        {t('Ожидает выдачи: {n}').replace('{n}', String(giftStats.pendingGifts))}
                      </span>
                      <span className="text-sm text-gray-600 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg">
                        {t('Выдано: {n}').replace('{n}', String(giftStats.issuedGifts))}
                      </span>
                    </div>
                  )}

                  {activeTab !== 'warehouse' && (
                    <button
                      onClick={() => {
                        if (activeTab === 'distributors') {
                          router.push('/admin/warehouse/create_distributor');
                        }
                        if (activeTab === 'gifts') {
                          router.push('/admin/warehouse/create_gift');
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-[#D77E6C] hover:text-[#D77E6C] transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{activeTab === 'distributors' ? t('Добавить дистрибьютора') : t('Добавить подарок')}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Контент вкладок */}
            <div className="p-6">
              {activeTab === 'warehouse' && (
                <>
                  {/* Заголовок таблицы */}
                  <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 rounded-xl mb-4 text-xs font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-gray-500" />
                      <span>{t('Имя')}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span>{t('Розница')}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#D77E6C]" />
                      <span>{t('Дилер')}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Box className="w-4 h-4 text-gray-500" />
                      <span>{t('Кол-во')}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <BarChart3 className="w-4 h-4 text-gray-500" />
                      <span>{t('Действия')}</span>
                    </div>
                  </div>

                  {/* Список товаров */}
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#D77E6C] border-t-transparent"></div>
                    </div>
                  ) : products.length > 0 ? (
                    <div className="space-y-3">
                      {products.map((product) => (
                        <ProductCardWare
                          key={product.id}
                          image={getImageUrl(product.image_url)}
                          title={t(product.name || 'Без названия')}
                          priceOld={formatPrice(product.price)}
                          priceNew={formatPrice(product.price_dealer)}
                          count={product.stock || 100}
                          onClick={() => handleProductClick(product.id)}
                          className="hover:shadow-md transition-shadow"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">{t('Товары не найдены')}</p>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'distributors' && (
                <Distrib items={distribItems} />
              )}

              {activeTab === 'gifts' && (
                <>
                  {giftsLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-600 border-t-transparent"></div>
                    </div>
                  ) : gifts.length > 0 ? (
                    <div className="space-y-3">
                      {gifts.map((gift) => (
                        <div 
                          key={gift.id} 
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all cursor-pointer"
                          onClick={() => router.push(`/admin/warehouse/gifts/${gift.id}`)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                              <Gift className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{gift.recipient_name}</h3>
                              <p className="text-sm text-gray-600">
                                {gift.gift_items.reduce((sum, item) => sum + item.quantity, 0)} {t('позиций')}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">
                                {formatPrice(gift.total_amount)}
                              </div>
                              <div className={`text-xs px-2 py-1 rounded-full ${
                                gift.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                gift.status === 'issued' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {gift.status === 'pending' ? t('Ожидает') :
                                 gift.status === 'issued' ? t('Выдан') : t('Отменен')}
                              </div>
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/admin/warehouse/gifts/${gift.id}`);
                              }}
                              className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">{t('Подарки не найдены')}</p>
                      <button
                        onClick={() => router.push('/admin/warehouse/create_gift')}
                        className="px-6 py-3 bg-[#D77E6C] text-white rounded-xl hover:bg-[#C56D5C] transition-all"
                      >
                        {t('Создать первый подарок')}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Правая часть */}
        <div className="w-full lg:w-[320px] xl:w-[380px]">
          <RightSidebar />
        </div>
      </div>
    </main>
  );
}