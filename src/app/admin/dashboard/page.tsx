// src/app/admin/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import TannurButton from '@/components/Button';
import { useTranslate } from '@/hooks/useTranslate';
import { getDashboardStats, type DashboardStats } from '@/lib/admin/dashboardService';
import { useGiftModule } from '@/lib/gift/useGiftModule';
import { useDistributorModule } from '@/lib/distributor/useDistributorModule';
import { createClient } from '@/lib/supabase/client';
import {
  Users,
  Star,
  Package,
  TrendingUp,
  Wallet,
  Gift,
  Building2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { t } = useTranslate();
  const supabase = createClient();

  const { stats: giftStats, loadGifts, loadStats } = useGiftModule();
  const { distributors, loadDistributors } = useDistributorModule();

  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [stats] = await Promise.all([
        getDashboardStats(supabase, false),
        loadDistributors(),
        loadGifts(),
        loadStats()
      ]);
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const distributorsBalance = distributors.reduce((sum, d) => sum + (d.current_balance || 0), 0);

  return (
    <div className="min-h-screen pb-6">
      <div className="w-full mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="relative">
          <header className="relative">
            <MoreHeaderAD title={t('Админ панель')} />
          </header>
        </div>

        {/* Основные метрики */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-4 md:px-0">
          {/* Дилеры */}
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-6 border-2 border-[#D77E6C]/20">
            <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-[#D77E6C]/10 to-transparent rounded-bl-full"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#D77E6C] to-[#C66B5A] rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-[#D77E6C] bg-[#D77E6C]/10 px-2 md:px-3 py-1 rounded-full whitespace-nowrap">
                    +{loading ? '...' : dashboardStats?.dealers.newThisMonth || 0}
                  </div>
                </div>
              </div>
              <div className="space-y-1 md:space-y-2">
                <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">{t('Дилеры')}</p>
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#D77E6C] to-[#C66B5A] bg-clip-text text-transparent">
                  {loading ? '...' : dashboardStats?.dealers.total || 0}
                </p>
                <div className="flex items-center gap-2 pt-1 md:pt-2">
                  <div className="h-1 w-6 md:w-8 bg-[#D77E6C]/30 rounded-full"></div>
                  <p className="text-xs text-gray-600">
                    {t('Активных')}: {loading ? '...' : dashboardStats?.dealers.active || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Заказы */}
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-6 border-2 border-[#D77E6C]/20">
            <div className="absolute bottom-0 left-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-tr from-[#D77E6C]/10 to-transparent rounded-tr-full"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#D77E6C] to-[#C66B5A] rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-[#D77E6C] bg-[#D77E6C]/10 px-2 md:px-3 py-1 rounded-full whitespace-nowrap">
                    {loading ? '...' : dashboardStats?.orders.new || 0}
                  </div>
                </div>
              </div>
              <div className="space-y-1 md:space-y-2">
                <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">{t('Заказы')}</p>
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#D77E6C] to-[#C66B5A] bg-clip-text text-transparent">
                  {loading ? '...' : dashboardStats?.orders.total || 0}
                </p>
                <div className="flex items-center gap-2 pt-1 md:pt-2">
                  <div className="h-1 w-6 md:w-8 bg-[#D77E6C]/30 rounded-full"></div>
                  <p className="text-xs text-gray-600">
                    {t('Новых')}: {loading ? '...' : dashboardStats?.orders.new || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Оборот */}
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-6 border-2 border-[#D77E6C]/20">
            <div className="absolute top-0 left-0 w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-[#D77E6C]/10 to-transparent rounded-br-full"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#D77E6C] to-[#C66B5A] rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 md:px-3 py-1 rounded-full whitespace-nowrap ${
                  (dashboardStats?.turnover.trend || 0) >= 0
                    ? 'text-green-700 bg-green-100'
                    : 'text-red-700 bg-red-100'
                }`}>
                  {(dashboardStats?.turnover.trend || 0) >= 0 ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {Math.abs(dashboardStats?.turnover.trend || 0)}%
                </div>
              </div>
              <div className="space-y-1 md:space-y-2">
                <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">{t('Товарооборот')}</p>
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#D77E6C] to-[#C66B5A] bg-clip-text text-transparent truncate">
                  {loading ? '...' : (dashboardStats?.orders.totalAmount || 0).toLocaleString('ru-RU')} ₸
                </p>
                <div className="flex items-center gap-2 pt-1 md:pt-2">
                  <div className="h-1 w-6 md:w-8 bg-[#D77E6C]/30 rounded-full"></div>
                  <p className="text-xs text-gray-600 truncate">
                    {loading ? '...' : (dashboardStats?.orders.monthlyAmount || 0).toLocaleString('ru-RU')} ₸
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Выводы */}
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-6 border-2 border-[#D77E6C]/20">
            <div className="absolute bottom-0 right-0 w-24 h-24 md:w-28 md:h-28 bg-gradient-to-tl from-[#D77E6C]/10 to-transparent rounded-tl-full"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#D77E6C] to-[#C66B5A] rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                  <Wallet className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-red-700 bg-red-100 px-2 md:px-3 py-1 rounded-full whitespace-nowrap">
                    {loading ? '...' : dashboardStats?.withdrawals.pending || 0}
                  </div>
                </div>
              </div>
              <div className="space-y-1 md:space-y-2">
                <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">{t('Выводы')}</p>
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#D77E6C] to-[#C66B5A] bg-clip-text text-transparent truncate">
                  {loading ? '...' : (dashboardStats?.withdrawals.totalAmount || 0).toLocaleString('ru-RU')} ₸
                </p>
                <div className="flex items-center gap-2 pt-1 md:pt-2">
                  <div className="h-1 w-6 md:w-8 bg-[#D77E6C]/30 rounded-full"></div>
                  <p className="text-xs text-gray-600 truncate">
                    {loading ? '...' : (dashboardStats?.withdrawals.pendingAmount || 0).toLocaleString('ru-RU')} ₸
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-8 border-2 border-[#D77E6C]/10 mx-4 md:mx-0">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="h-6 md:h-8 w-1 bg-gradient-to-b from-[#D77E6C] to-[#C66B5A] rounded-full"></div>
            <h2 className="text-lg md:text-xl font-bold text-gray-800">{t('Быстрые действия')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <TannurButton
              href="/admin/dashboard/events"
              text={t('События и Новости')}
              iconSrc="/icons/userblack.svg"
              arrow="black"
              variant="white"
            />
            <TannurButton
              href="/admin/dashboard/bonus_events"
              text={t('Бонусные события')}
              iconSrc="/icons/userblack.svg"
              arrow="black"
              variant="white"
            />
          </div>
        </div>

        {/* Подписки и Склад */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 px-4 md:px-0">
          {/* Подписки */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-8 border-2 border-[#D77E6C]/20">
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#D77E6C]/20 to-[#C66B5A]/10 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 md:w-6 md:h-6 text-[#D77E6C]" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-bold text-gray-800">{t('Подписки')}</h3>
                <p className="text-xs md:text-sm text-gray-500">{t('Активные участники ТНБА')}</p>
              </div>
            </div>
            <div className="space-y-3 md:space-y-4">
              <div className="flex justify-between items-center p-3 md:p-4 bg-[#D77E6C]/5 rounded-xl md:rounded-2xl">
                <span className="text-xs md:text-sm font-medium text-gray-700">{t('Всего подписок')}</span>
                <span className="text-xl md:text-2xl font-bold text-[#D77E6C]">
                  {loading ? '...' : dashboardStats?.subscriptions.totalCount || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 md:p-4 bg-[#D77E6C]/5 rounded-xl md:rounded-2xl">
                <span className="text-xs md:text-sm font-medium text-gray-700">{t('За месяц')}</span>
                <span className="text-xl md:text-2xl font-bold text-[#D77E6C]">
                  {loading ? '...' : dashboardStats?.subscriptions.monthlyCount || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 md:p-4 bg-gradient-to-r from-[#D77E6C]/10 to-[#C66B5A]/5 rounded-xl md:rounded-2xl">
                <span className="text-xs md:text-sm font-medium text-gray-700">{t('Общая сумма')}</span>
                <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-[#D77E6C] to-[#C66B5A] bg-clip-text text-transparent">
                  {loading ? '...' : (dashboardStats?.subscriptions.totalAmount || 0).toLocaleString('ru-RU')} ₸
                </span>
              </div>
            </div>
          </div>

          {/* Склад */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-8 border-2 border-[#D77E6C]/20">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#D77E6C]/20 to-[#C66B5A]/10 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 md:w-6 md:h-6 text-[#D77E6C]" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-800">{t('Склад')}</h3>
                  <p className="text-xs md:text-sm text-gray-500">{t('Товары и остатки')}</p>
                </div>
              </div>
              {(dashboardStats?.warehouse.lowStockCount || 0) > 0 && (
                <div className="flex items-center gap-1 md:gap-2 text-xs font-medium text-orange-700 bg-orange-100 px-2 md:px-3 py-1 md:py-2 rounded-full">
                  <AlertCircle className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                  <span>{dashboardStats?.warehouse.lowStockCount}</span>
                </div>
              )}
            </div>
            <div className="space-y-3 md:space-y-4">
              <div className="flex justify-between items-center p-3 md:p-4 bg-[#D77E6C]/5 rounded-xl md:rounded-2xl">
                <span className="text-xs md:text-sm font-medium text-gray-700">{t('Товаров')}</span>
                <span className="text-xl md:text-2xl font-bold text-[#D77E6C]">
                  {loading ? '...' : dashboardStats?.warehouse.totalProducts || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 md:p-4 bg-[#D77E6C]/5 rounded-xl md:rounded-2xl">
                <span className="text-xs md:text-sm font-medium text-gray-700">{t('Остаток')}</span>
                <span className="text-xl md:text-2xl font-bold text-[#D77E6C]">
                  {loading ? '...' : dashboardStats?.warehouse.totalStock || 0} {t('шт')}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 md:p-4 bg-gradient-to-r from-[#D77E6C]/10 to-[#C66B5A]/5 rounded-xl md:rounded-2xl">
                <span className="text-xs md:text-sm font-medium text-gray-700">{t('Стоимость')}</span>
                <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-[#D77E6C] to-[#C66B5A] bg-clip-text text-transparent">
                  {loading ? '...' : (dashboardStats?.warehouse.totalValue || 0).toLocaleString('ru-RU')} ₸
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Дистрибьюторы и Подарки */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-4 md:px-0">
          {/* Дистрибьюторы */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#D77E6C]/10 via-white/80 to-[#C66B5A]/5 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-8 border-2 border-[#D77E6C]/30">
            <div className="absolute -top-12 md:-top-16 -right-12 md:-right-16 w-32 md:w-40 h-32 md:h-40 bg-[#D77E6C]/10 rounded-full"></div>
            <div className="absolute -bottom-8 md:-bottom-10 -left-8 md:-left-10 w-24 md:w-32 h-24 md:h-32 bg-[#C66B5A]/10 rounded-full"></div>
            <div className="relative">
              <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 md:w-7 md:h-7 text-[#D77E6C]" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-800">{t('Внешние дистрибьюторы')}</h3>
                  <p className="text-xs md:text-sm text-gray-600">{t('Партнерские организации')}</p>
                </div>
              </div>
              <div className="space-y-4 md:space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wider">{t('Количество')}</span>
                  <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#D77E6C] to-[#C66B5A] bg-clip-text text-transparent">
                    {loading ? '...' : distributors.length}
                  </span>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-[#D77E6C]/30 to-transparent"></div>
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wider">{t('Общий баланс')}</span>
                  <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#D77E6C] to-[#C66B5A] bg-clip-text text-transparent">
                    {loading ? '...' : distributorsBalance.toLocaleString('ru-RU')} ₸
                  </span>
                </div>
                
                <a
                  href="/admin/warehouse?tab=distributors"
                  className="flex items-center justify-center gap-2 w-full py-3 md:py-4 px-6 bg-gradient-to-r from-[#D77E6C] to-[#C66B5A] text-white rounded-xl md:rounded-2xl text-sm font-semibold hover:shadow-lg transition-all active:scale-95"
                >
                  {t('Управление')}
                  <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Подарки */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#D77E6C]/10 via-white/80 to-[#C66B5A]/5 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-8 border-2 border-[#D77E6C]/30">
            <div className="absolute -top-8 md:-top-10 -left-8 md:-left-10 w-24 md:w-32 h-24 md:h-32 bg-[#D77E6C]/10 rounded-full"></div>
            <div className="absolute -bottom-12 md:-bottom-16 -right-12 md:-right-16 w-32 md:w-40 h-32 md:h-40 bg-[#C66B5A]/10 rounded-full"></div>
            <div className="relative">
              <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                  <Gift className="w-6 h-6 md:w-7 md:h-7 text-[#D77E6C]" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-800">{t('Товары на подарки')}</h3>
                  <p className="text-xs md:text-sm text-gray-600">{t('Выданные подарки')}</p>
                </div>
              </div>
              <div className="space-y-4 md:space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wider">{t('Количество')}</span>
                  <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#D77E6C] to-[#C66B5A] bg-clip-text text-transparent">
                    {loading ? '...' : giftStats.totalGifts}
                  </span>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-[#D77E6C]/30 to-transparent"></div>
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wider">{t('Общая сумма')}</span>
                  <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#D77E6C] to-[#C66B5A] bg-clip-text text-transparent">
                    {loading ? '...' : giftStats.totalAmount.toLocaleString('ru-RU')} ₸
                  </span>
                </div>
                
                <a
                  href="/admin/warehouse?tab=gifts"
                  className="flex items-center justify-center gap-2 w-full py-3 md:py-4 px-6 bg-gradient-to-r from-[#D77E6C] to-[#C66B5A] text-white rounded-xl md:rounded-2xl text-sm font-semibold hover:shadow-lg transition-all active:scale-95"
                >
                  {t('Управление')}
                  <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Топ исполнители */}
        {dashboardStats?.topPerformers && dashboardStats.topPerformers.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-8 border-2 border-[#D77E6C]/20 mx-4 md:mx-0">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="h-6 md:h-8 w-1 bg-gradient-to-b from-[#D77E6C] to-[#C66B5A] rounded-full"></div>
              <h3 className="text-lg md:text-xl font-bold text-gray-800">{t('Топ дилеры по обороту')}</h3>
            </div>
            <div className="space-y-3 md:space-y-4">
              {dashboardStats.topPerformers.map((performer, index) => (
                <div
                  key={performer.userId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 md:p-5 bg-gradient-to-r from-[#D77E6C]/5 to-transparent rounded-xl md:rounded-2xl border-l-4 border-[#D77E6C]"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center font-bold text-base md:text-lg shrink-0 ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                      index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                      'bg-gradient-to-br from-[#D77E6C]/20 to-[#C66B5A]/10 text-[#D77E6C]'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm md:text-base truncate">{performer.fullName}</p>
                      <p className="text-xs md:text-sm text-gray-500 truncate">{performer.email}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right ml-auto sm:ml-0">
                    <p className="text-lg md:text-xl font-bold bg-gradient-to-r from-[#D77E6C] to-[#C66B5A] bg-clip-text text-transparent">
                      {performer.turnover.toLocaleString('ru-RU')} ₸
                    </p>
                    <p className="text-xs md:text-sm text-gray-600">{performer.bonusPercent}% {t('бонус')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}