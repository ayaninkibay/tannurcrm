'use client';

import React, { useEffect, useState } from 'react';
import { useBonusModule } from '@/lib/bonus/useBonusModule';
import { useTranslate } from '@/hooks/useTranslate';

// SVG иконки как компоненты
const PlaneIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 16V8C21 7.45 20.55 7 20 7H17L11.5 2.5C11.3 2.3 11 2 10.5 2C10 2 9.7 2.3 9.5 2.5L4 7H1C0.45 7 0 7.45 0 8V16C0 16.55 0.45 17 1 17H4L9.5 21.5C9.7 21.7 10 22 10.5 22C11 22 11.3 21.7 11.5 21.5L17 17H20C20.55 17 21 16.55 21 16Z" fill="#EA580C"/>
  </svg>
);

const CarIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.5 16C5.67 16 5 15.33 5 14.5C5 13.67 5.67 13 6.5 13C7.33 13 8 13.67 8 14.5C8 15.33 7.33 16 6.5 16ZM17.5 16C16.67 16 16 15.33 16 14.5C16 13.67 16.67 13 17.5 13C18.33 13 19 13.67 19 14.5C19 15.33 18.33 16 17.5 16ZM5 11L6.5 6.5H17.5L19 11H5Z" fill="#EA580C"/>
  </svg>
);

const HomeIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill="#EA580C"/>
  </svg>
);

const StarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" fill="#EA580C"/>
  </svg>
);

// Компонент карточки бонусного уровня
const BonusTierCard = ({ 
  tier, 
  amount, 
  icon, 
  borderColor,
  achievedCount = 0 
}: { 
  tier: string; 
  amount: number; 
  icon: React.ReactNode;
  borderColor: string;
  achievedCount?: number;
}) => {
  const { t } = useTranslate();
  
  return (
    <div className={`bg-white rounded-xl p-4 border-2 ${borderColor} relative overflow-hidden`}>
      <div className="flex items-center justify-between mb-2">
        {icon}
        {achievedCount > 0 && (
          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
            {achievedCount} {t('дилеров')}
          </span>
        )}
      </div>
      <h4 className="font-semibold text-gray-900 mb-1">{tier}</h4>
      <p className="text-2xl font-bold text-gray-900">
        {amount.toLocaleString('ru-RU')} ₸
      </p>
      <p className="text-sm text-gray-500 mt-1">{t('товарооборот')}</p>
    </div>
  );
};

// Компонент таблицы топ дилеров
const TopDealersTable = ({ dealers, loading }: { dealers: any[]; loading: boolean }) => {
  const { t } = useTranslate();
  const { formatAmount } = useBonusModule();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const getTierIcon = (tier: string) => {
    switch(tier) {
      case 'apartment': return <HomeIcon />;
      case 'car': return <CarIcon />;
      case 'vacation': return <PlaneIcon />;
      default: return <StarIcon />;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">#</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('Дилер')}</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('Товарооборот')}</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('Уровень')}</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">{t('Прогресс')}</th>
          </tr>
        </thead>
        <tbody>
          {dealers.map((dealer, index) => (
            <tr key={dealer.user_id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4">
                <div className={`font-semibold ${index < 3 ? 'text-orange-500' : 'text-gray-600'}`}>
                  {dealer.rank}
                </div>
              </td>
              <td className="py-3 px-4">
                <div>
                  <div className="font-medium text-gray-900">{dealer.full_name || 'Без имени'}</div>
                  <div className="text-sm text-gray-500">{dealer.phone}</div>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="font-semibold text-gray-900">
                  {formatAmount(dealer.total_turnover)}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  {getTierIcon(dealer.bonus_tier)}
                  <span className="text-sm">
                    {dealer.bonus_tier === 'apartment' && t('Квартира')}
                    {dealer.bonus_tier === 'car' && t('Автомобиль')}
                    {dealer.bonus_tier === 'vacation' && t('Путёвка')}
                    {dealer.bonus_tier === 'none' && t('—')}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="w-full">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-orange-500"
                        style={{ width: `${dealer.progress_percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 min-w-[40px]">
                      {Math.round(dealer.progress_percentage)}%
                    </span>
                  </div>
                  {dealer.bonus_tier !== 'apartment' && (
                    <div className="text-xs text-gray-500 mt-1">
                      {t('Осталось')}: {formatAmount(dealer.amount_to_next_tier)}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {dealers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {t('Нет данных о дилерах')}
        </div>
      )}
    </div>
  );
};

// Основной компонент
export const BonusSystemStrategy = () => {
  const { t } = useTranslate();
  const { 
    topDealers, 
    bonusStats, 
    loading, 
    loadTopDealers, 
    loadBonusStats 
  } = useBonusModule();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'leaderboard'>('overview');

  useEffect(() => {
    loadTopDealers(10);
    loadBonusStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    loadTopDealers(10);
    loadBonusStats();
  };

  return (
    <section className="space-y-4 sm:space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-medium">{t('Стратегия Tannur - Бонусная система')}</h2>
        <button 
          onClick={handleRefresh}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title={t('Обновить')}
          disabled={loading}
        >
          <svg 
            className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
        </button>
      </div>

      {/* Табы */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2 px-1 font-medium transition-colors ${
            activeTab === 'overview' 
              ? 'text-orange-600 border-b-2 border-orange-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('Обзор системы')}
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`pb-2 px-1 font-medium transition-colors ${
            activeTab === 'leaderboard' 
              ? 'text-orange-600 border-b-2 border-orange-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('Рейтинг дилеров')} ({topDealers.length})
        </button>
      </div>

      {/* Контент */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Уровни бонусов */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BonusTierCard
              tier={t('Путёвка')}
              amount={30000000}
              icon={<PlaneIcon />}
              borderColor="border-orange-300"
              achievedCount={bonusStats.vacation}
            />
            <BonusTierCard
              tier={t('Автомобиль')}
              amount={60000000}
              icon={<CarIcon />}
              borderColor="border-orange-400"
              achievedCount={bonusStats.car}
            />
            <BonusTierCard
              tier={t('Квартира')}
              amount={90000000}
              icon={<HomeIcon />}
              borderColor="border-orange-500"
              achievedCount={bonusStats.apartment}
            />
          </div>

          {/* Статистика */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4">{t('Статистика программы')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold text-gray-900">{bonusStats.total}</div>
                <div className="text-sm text-gray-500">{t('Всего дилеров')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{bonusStats.vacation}</div>
                <div className="text-sm text-gray-500">{t('Достигли путёвки')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{bonusStats.car}</div>
                <div className="text-sm text-gray-500">{t('Достигли автомобиля')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{bonusStats.apartment}</div>
                <div className="text-sm text-gray-500">{t('Достигли квартиры')}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-xl p-4 sm:p-6">
          <TopDealersTable dealers={topDealers} loading={loading} />
        </div>
      )}
    </section>
  );
};