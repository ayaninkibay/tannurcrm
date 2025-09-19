'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBonusModule } from '@/lib/bonus/useBonusModule';
import { useTranslate } from '@/hooks/useTranslate';

// SVG иконки
const TrophyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V19H7v2h10v-2h-4v-3.1a5.01 5.01 0 003.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" 
    fill="#EA580C"/>
  </svg>
);

interface BonusProgressCardProps {
  userId?: string;
}

export const BonusProgressCard: React.FC<BonusProgressCardProps> = ({ userId }) => {
  const { t } = useTranslate();
  const router = useRouter();
  const { getDealerTurnover, formatAmount } = useBonusModule();
  const [dealerData, setDealerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDealerData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        const data = await getDealerTurnover(userId);
        setDealerData(data);
      } catch (error) {
        console.error('Error loading dealer data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDealerData();
  }, [userId, getDealerTurnover]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 animate-pulse h-full">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div className="h-6 bg-gray-200 rounded w-2/3 mb-3"></div>
        <div className="h-2 bg-gray-200 rounded-full"></div>
      </div>
    );
  }

  if (!dealerData) {
    return (
      <div 
        className="bg-white rounded-2xl p-5 h-full cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => router.push('/dealer/dashboard/bonus-program')} // ИЗМЕНЕН ПУТЬ
      >
        <div className="flex items-center gap-2 mb-3">
          <TrophyIcon />
          <h3 className="text-base font-semibold">{t('Бонусная программа')}</h3>
        </div>
        <p className="text-sm text-gray-500">{t('Начните продавать для участия в программе')}</p>
      </div>
    );
  }

  const progressPercent = Math.round(dealerData.progress_percentage);

  return (
    <div 
      className="bg-white rounded-2xl p-5 h-full flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => router.push('/dealer/dashboard/bonus-program')} // ИЗМЕНЕН ПУТЬ
    >
      <div className="flex items-center gap-2 mb-4">
        <TrophyIcon />
        <h3 className="text-base font-semibold">{t('Бонусная программа')}</h3>
      </div>

      <div className="space-y-3 flex-1">
        {/* Товарооборот */}
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-gray-500">{t('Ваш товарооборот')}</span>
          <span className="text-xl font-bold text-gray-900">
            {formatAmount(dealerData.total_turnover)}
          </span>
        </div>

        {/* До следующего уровня */}
        {dealerData.bonus_tier !== 'apartment' && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{t('До следующего уровня')}</span>
              <span className="text-sm font-medium text-orange-600">
                {formatAmount(dealerData.amount_to_next_tier)}
              </span>
            </div>

            {/* Прогресс-бар */}
            <div className="relative">
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-orange-500 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-400">{progressPercent}% {t('пройдено')}</span>
                <span className="text-xs text-gray-400">{100 - progressPercent}% {t('осталось')}</span>
              </div>
            </div>
          </>
        )}

        {/* Максимальный уровень */}
        {dealerData.bonus_tier === 'apartment' && (
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-800">{t('Максимальный уровень достигнут!')}</p>
          </div>
        )}
      </div>

      {/* Последний заказ внизу */}
      <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between items-center text-xs">
        <span className="text-gray-500">{t('Последний заказ')}</span>
        <span className="font-semibold text-gray-700">
          {new Date(dealerData.last_order_date).toLocaleDateString('ru-RU')}
        </span>
      </div>
    </div>
  );
};