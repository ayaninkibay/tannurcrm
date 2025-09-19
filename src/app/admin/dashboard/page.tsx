'use client';

import React, { useState, useEffect } from 'react';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { StatisticCard } from '@/components/components_admins_dashboard/StatisticCard';
import { RevenueCard } from '@/components/components_admins_dashboard/RevenueCard';
import { WarehouseCard } from '@/components/components_admins_dashboard/WarehouseCard';
import { BonusSystemStrategy } from '@/components/components_admins_dashboard/BonusSystemStrategy'; // ДОБАВИТЬ ИМПОРТ
import Image from 'next/image';
import TannurButton from '@/components/Button';
import { useTranslate } from '@/hooks/useTranslate';
import { useProductModule } from '@/lib/product/ProductModule';
import { useGiftModule } from '@/lib/gift/useGiftModule';
import { useDistributorModule } from '@/lib/distributor/useDistributorModule';

export default function AdminDashboardPage() {
  const { t } = useTranslate();
  
  // Используем существующие модули
  const { products, listProducts } = useProductModule();
  const { stats: giftStats, loadGifts, loadStats } = useGiftModule();
  const { distributors, loadDistributors } = useDistributorModule();
  
  const [loading, setLoading] = useState(true);
  const [warehouseStats, setWarehouseStats] = useState({
    totalStock: 0,
    totalValue: 0
  });

  // Загружаем все данные
  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        listProducts({ limit: 1000, orderBy: 'created_at', order: 'desc' }),
        loadDistributors(),
        loadGifts(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Пересчитываем статистику склада при изменении товаров
  useEffect(() => {
    if (products.length > 0) {
      const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
      const totalValue = products.reduce((sum, p) => {
        const price = p.price_dealer || p.price || 0;
        const stock = p.stock || 0;
        return sum + (price * stock);
      }, 0);
      
      setWarehouseStats({ totalStock, totalValue });
    }
  }, [products]);

  // Загружаем данные при инициализации
  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatPrice = (price: number) => {
    return price.toLocaleString('ru-RU');
  };

  // Вычисляем баланс дистрибьюторов
  const distributorsBalance = distributors.reduce((sum, d) => sum + (d.current_balance || 0), 0);

  return (
    <div className="flex">
      <div className="w-full mx-auto space-y-6 sm:space-y-8">
        {/* Шапка */}
        <header className="mb-6">
          <MoreHeaderAD title={t('Админ панель')} />
        </header>

        {/* Верхняя секция: статистика и профиль */}
        <section className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
          {/* Левая часть: статистика */}
          <div className="xl:col-span-3 space-y-4 sm:space-y-6">
            {/* Row 1: Диллеры/Звёзды и Выручка */}
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
              {/* Статистика */}
              <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-1 gap-4">
                <StatisticCard
                  iconSrc="/icons/IconUsersAdd.svg"
                  title={t('Диллеры')}
                  count={loading ? '...' : distributors.length}
                  href="/admin/dealers"
                />
                <StatisticCard
                  iconSrc="/icons/IconStarOrange.svg"
                  title={t('Звёзды')}
                  count={35}
                  href="/admin/dealers"
                />
              </div>
              {/* Выручка */}
              <div className="sm:col-span-4 grid grid-cols-1 gap-4">
                <RevenueCard
                  title={t('Товарооборот магазина')}
                  amount={84213000}
                  href="/admin/revenue"
                  bgColor="bg-[#DADDFF]"
                />
                <RevenueCard
                  title={t('Товарооборот TNBA')}
                  amount={84213000}
                  href="/admin/revenue"
                  bgColor="bg-[#FFE0DA]"
                />
                <RevenueCard
                  title={t('Товарооборот подписки')}
                  amount={84213000}
                  href="/admin/revenue"
                  bgColor="bg-[#F0E4FF]"
                />
              </div>
            </div>

            {/* Row 2: Товары на складе */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <WarehouseCard
                iconSrc="/icons/IconAppsOrange.svg"
                title={t('Товары на складе')}
                quantity={loading ? '...' : warehouseStats.totalStock}
                price={loading ? '...' : formatPrice(warehouseStats.totalValue)}
                href="/admin/warehouse"
              />
              <WarehouseCard
                iconSrc="/icons/IconAppsOrange.svg"
                title={t('Внешние дистрибьюторы')}
                quantity={loading ? '...' : distributors.length}
                price={loading ? '...' : formatPrice(distributorsBalance)}
                href="/admin/warehouse?tab=distributors"
              />
              <WarehouseCard
                iconSrc="/icons/IconAppsOrange.svg"
                title={t('Товары на подарки')}
                quantity={loading ? '...' : giftStats.totalGifts}
                price={loading ? '...' : formatPrice(giftStats.totalAmount)}
                href="/admin/warehouse?tab=gifts"
              />
            </div>
          </div>

          {/* Правая часть: профиль */}
          <div className="xl:col-span-1">
            <TannurButton
              href="dashboard/create_event"
              text={t('Создать событие')}
              iconSrc="/icons/userblack.svg"
              arrow="black"
              variant="white"
            />
            <div className="mt-4"></div>
            <TannurButton
              href="/admin/audit"
              text={t('Аудит')}
              iconSrc="/icons/userblack.svg"
              arrow="black"
              variant="white"
            />
            <div className="mt-4"></div>
            <TannurButton
              href="/profile"
              text={t('Моя страница')}
              iconSrc="/icons/userblack.svg"
              arrow="black"
              variant="white"
            />
            <div className="mt-4"></div>
            <TannurButton
              href="/profile"
              text={t('Моя страница')}
              iconSrc="/icons/userblack.svg"
              arrow="black"
              variant="white"
            />
          </div>
        </section>

        {/* ЗАМЕНЯЕМ БЛОК ЦЕЛЕЙ НА БОНУСНУЮ СИСТЕМУ */}
        <BonusSystemStrategy />
      </div>
    </div>
  );
}