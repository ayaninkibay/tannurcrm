'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import Image from 'next/image';

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
  Eye,
  Building2
} from 'lucide-react';

import { useProductModule } from '@/lib/product/ProductModule';
import { useGiftModule } from '@/lib/gift/useGiftModule';
import { useDistributorModule } from '@/lib/distributor/useDistributorModule';
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

  const {
    distributors,
    loading: distributorsLoading,
    loadDistributors
  } = useDistributorModule();

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
    loadDistributors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Перезагружаем подарки при переключении на вкладку gifts
  useEffect(() => {
    if (activeTab === 'gifts') {
      loadGifts();
      loadStats();
    }
  }, [activeTab, loadGifts, loadStats]);

  // Перезагружаем дистрибьюторов при переключении на вкладку distributors
  useEffect(() => {
    if (activeTab === 'distributors') {
      loadDistributors();
    }
  }, [activeTab, loadDistributors]);

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
    router.push(`/admin/warehouse/warehouse_control/product_view?id=${productId}`);
  };

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return '0 ₸';
    return `${price.toLocaleString('ru-RU')} ₸`;
  };

  const getImageUrl = (imageUrl?: string | null) => {
    if (!imageUrl) return '/icons/Photo_icon_1.jpg';
    return imageUrl;
  };

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
      count: distributors.length,
      unit: t('дистрибьюторов'),
      sum: distributors.reduce((sum, d) => sum + (d.current_balance || 0), 0).toLocaleString('ru-RU') + ' ₸',
      sumLabel: t('Общий баланс'),
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
      <main className=" min-h-screen">
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

  const activeTabData = tabsData.find(tab => tab.id === activeTab);

  return (
    <main className="min-h-screen">
      <MoreHeaderAD title={t('Склад Tannur')} />

      <div className="mt-8">
        {/* Верхняя панель с табами и кнопками действий */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          {/* Компактные табы */}
          <div className="flex gap-2 flex-wrap">
            {tabsData.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm
                    ${isActive 
                      ? 'bg-white border-2 ' + tab.borderColor + ' font-medium'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" style={{ color: isActive ? tab.color : undefined }} />
                  <span>{tab.title}</span>
                  <span className="text-xs text-gray-400">({tab.count})</span>
                </button>
              );
            })}
          </div>

          {/* Кнопки действий */}
          <div className="flex gap-2">
            {activeTab === 'warehouse' && (
              <>
                <button
                  onClick={() => router.push('/admin/warehouse/create_product')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#D77E6C] text-white rounded-lg hover:bg-[#C56D5C] text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('Создать товар')}</span>
                </button>
                <button
                  onClick={() => router.push('/admin/warehouse/stock_movements')}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:border-gray-300 text-sm"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>{t('История движений')}</span>
                </button>
              </>
            )}
            {activeTab === 'distributors' && (
              <button
                onClick={() => router.push('/admin/warehouse/create_distributor')}
                className="flex items-center gap-2 px-4 py-2 bg-[#7C9D6C] text-white rounded-lg hover:bg-[#6B8C5B] text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>{t('Добавить дистрибьютора')}</span>
              </button>
            )}
            {activeTab === 'gifts' && (
              <button
                onClick={() => router.push('/admin/warehouse/create_gift')}
                className="flex items-center gap-2 px-4 py-2 bg-[#9C7C6C] text-white rounded-lg hover:bg-[#8B6B5B] text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>{t('Создать подарок')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Основной контент на полную ширину */}
        <div className="bg-white rounded-2xl shadow p-6">
          {/* Заголовок секции */}
          <div className="flex items-center gap-2 mb-6">
            {activeTabData && (
              <>
                <activeTabData.icon 
                  className="w-5 h-5" 
                  style={{ color: activeTabData.color }} 
                />
                <h2 className="text-xl font-semibold text-gray-900">
                  {activeTabData.title}
                </h2>
              </>
            )}
          </div>

          {/* Контент */}
          <div>
            {activeTab === 'warehouse' && (
              <>
                {/* Заголовки таблицы */}
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-2 bg-gray-50 rounded-lg mb-3 text-sm text-gray-600 font-medium">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span>{t('Наименование')}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-gray-400" />
                    <span>{t('Розница')}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-gray-400" />
                    <span>{t('Дилер')}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Box className="w-4 h-4 text-gray-400" />
                    <span>{t('Кол-во')}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <BarChart3 className="w-4 h-4 text-gray-400" />
                    <span>{t('Действия')}</span>
                  </div>
                </div>

                {/* Список товаров */}
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#D77E6C] border-t-transparent"></div>
                  </div>
                ) : products.length > 0 ? (
                  <div className="space-y-1">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-50 text-sm text-gray-600"
                      >
                        {/* Наименование */}
                        <div className="flex items-center gap-3 overflow-hidden">
                          <Image
                            src={getImageUrl(product.image_url)}
                            alt="product"
                            width={50}
                            height={50}
                            className="rounded-lg object-cover flex-shrink-0"
                          />
                          <span className="font-medium text-gray-900 truncate">
                            {t(product.name || 'Без названия')}
                          </span>
                        </div>

                        {/* Розница */}
                        <span className="whitespace-nowrap text-center">
                          {formatPrice(product.price)}
                        </span>

                        {/* Дилер */}
                        <span className="whitespace-nowrap text-center">
                          {formatPrice(product.price_dealer)}
                        </span>

                        {/* Количество */}
                        <span className="text-black font-semibold whitespace-nowrap text-center">
                          {product.stock || 0}
                        </span>

                        {/* Действия */}
                        <div className="flex justify-center">
                          <Eye className="w-5 h-5 text-[#D77E6C]" />
                        </div>
                      </div>
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
              <>
                {distributorsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent"></div>
                  </div>
                ) : distributors.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {distributors.map((distributor) => (
                      <div 
                        key={distributor.id} 
                        className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:shadow-md hover:border-green-600 transition-all cursor-pointer"
                        onClick={() => router.push(`/admin/warehouse/distributors/${distributor.id}`)}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 truncate">{distributor.org_name}</h3>
                            <p className="text-sm text-gray-600 truncate">
                              {distributor.user?.first_name} {distributor.user?.last_name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-gray-500">{distributor.user?.region}</p>
                              <div className={`text-xs px-2 py-0.5 rounded-full ${
                                distributor.status === 'active' ? 'bg-green-100 text-green-800' :
                                distributor.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {distributor.status === 'active' ? t('Активен') :
                                 distributor.status === 'inactive' ? t('Неактивен') : t('Заблокирован')}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 ml-4">
                          <div className="text-right">
                            <div className="font-semibold text-gray-900 whitespace-nowrap">
                              {formatPrice(distributor.current_balance)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {t('Баланс')}
                            </div>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/admin/warehouse/distributors/${distributor.id}`);
                            }}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">{t('Дистрибьюторы не найдены')}</p>
                    <button
                      onClick={() => router.push('/admin/warehouse/create_distributor')}
                      className="px-6 py-3 bg-[#7C9D6C] text-white rounded-xl hover:bg-[#6B8C5B] transition-all"
                    >
                      {t('Добавить первого дистрибьютора')}
                    </button>
                  </div>
                )}
              </>
            )}

            {activeTab === 'gifts' && (
              <>
                {giftsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-600 border-t-transparent"></div>
                  </div>
                ) : gifts.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {gifts.map((gift) => (
                      <div 
                        key={gift.id} 
                        className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:shadow-md hover:border-purple-600 transition-all cursor-pointer"
                        onClick={() => router.push(`/admin/warehouse/gifts/${gift.id}`)}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Gift className="w-6 h-6 text-purple-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 truncate">{gift.recipient_name}</h3>
                            <p className="text-sm text-gray-600">
                              {gift.gift_items.reduce((sum, item) => sum + item.quantity, 0)} {t('позиций')}
                            </p>
                            <div className="mt-1">
                              <div className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                                gift.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                gift.status === 'issued' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {gift.status === 'pending' ? t('Ожидает') :
                                 gift.status === 'issued' ? t('Выдан') : t('Отменен')}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 ml-4">
                          <div className="text-right">
                            <div className="font-semibold text-gray-900 whitespace-nowrap">
                              {formatPrice(gift.total_amount)}
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
                      className="px-6 py-3 bg-[#9C7C6C] text-white rounded-xl hover:bg-[#8B6B5B] transition-all"
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
    </main>
  );
}