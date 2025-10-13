'use client';

import React from 'react';
import { TrendingUp, Users, Award } from 'lucide-react';
import { useTranslate } from '@/hooks/useTranslate';

// ===============================
// ТИПЫ
// ===============================

interface BonusCardProps {
  // Основные данные (обязательные)
  currentTurnover: number;
  goalAmount: number;
  
  // Дополнительная статистика (опциональная)
  personalTurnover?: number;
  teamTurnover?: number;
  teamCount?: number;
  bonusPercent?: number;
  
  // Информация об уровнях (опциональная)
  currentLevel?: {
    name: string;
    bonus_percent: number;
  } | null;
  nextLevel?: {
    name: string;
    min_amount: number;
  } | null;
  
  // UI опции
  className?: string;
  variant?: 'turnover' | 'default';
}

// ===============================
// КОМПОНЕНТ
// ===============================

export default function BonusCard({
  currentTurnover,
  goalAmount,
  personalTurnover = 0,
  teamTurnover = 0,
  teamCount = 0,
  bonusPercent = 8,
  currentLevel,
  nextLevel,
  className = '',
  variant = 'default'
}: BonusCardProps) {
  const { t } = useTranslate();

  // ===============================
  // ВЫЧИСЛЕНИЯ
  // ===============================

  const formatMoney = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${Math.round(amount / 1000)}K`;
    }
    return amount.toLocaleString('ru-RU');
  };

  const percentage = Math.min((currentTurnover / goalAmount) * 100, 100);
  const remaining = Math.max(0, goalAmount - currentTurnover);

  return (
    <div className={`bg-white rounded-3xl p-6 relative overflow-hidden border border-gray-100 h-full ${className}`}>
      {/* Декоративный фон */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#D77E6C] to-[#E89380] rounded-full -translate-y-20 translate-x-20" />
      </div>

      {/* Заголовок */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{t('Общий товарооборот')}</h3>
          <p className="text-gray-500 text-sm">{t('текущий месяц')}</p>
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-[#D77E6C]/10 to-[#E89380]/10 rounded-2xl flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-[#D77E6C]" />
        </div>
      </div>

      {/* Основное значение */}
      <div className="relative z-10 mb-5">
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-4xl font-black bg-gradient-to-r from-[#D77E6C] to-[#E89380] bg-clip-text text-transparent">
            {formatMoney(currentTurnover)}
          </span>
          <span className="text-xl font-bold text-gray-400">₸</span>
        </div>
        
        {/* Сетка статистики */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <Users className="w-5 h-5 mx-auto mb-1 text-[#D77E6C]" />
            <div className="text-lg font-bold text-gray-900">{teamCount}</div>
            <div className="text-xs text-gray-500">{t('в команде')}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <Award className="w-5 h-5 mx-auto mb-1 text-[#D77E6C]" />
            <div className="text-lg font-bold text-gray-900">{bonusPercent}%</div>
            <div className="text-xs text-gray-500">{t('бонус')}</div>
          </div>
        </div>

        {/* Личный и командный оборот */}
        {(personalTurnover > 0 || teamTurnover > 0) && (
          <div className="flex justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
            <span>
              {t('Личный')}: <span className="font-semibold text-gray-700">{formatMoney(personalTurnover)}</span>
            </span>
            <span>
              {t('Командный')}: <span className="font-semibold text-gray-700">{formatMoney(teamTurnover)}</span>
            </span>
          </div>
        )}
      </div>

      {/* Прогресс к следующему уровню */}
      <div className="relative z-10">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 font-medium">
            {nextLevel 
              ? t('До уровня "{name}"').replace('{name}', nextLevel.name)
              : t('Прогресс к цели')}
          </span>
          <span className="font-bold text-gray-900">
            {formatMoney(remaining)} ₸
          </span>
        </div>
        
        {/* Прогресс бар */}
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#D77E6C] to-[#E89380] rounded-full transition-all duration-700 relative"
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          </div>
        </div>
        
        {/* Информация о прогрессе */}
        <div className="flex justify-between text-xs mt-2 text-gray-500">
          <span>
            {currentLevel && (
              <span className="font-medium">{currentLevel.name}</span>
            )}
          </span>
          <span className="font-bold text-[#D77E6C]">{Math.round(percentage)}%</span>
          <span>
            {t('Цель')}: {formatMoney(goalAmount)} ₸
          </span>
        </div>
      </div>

      {/* Стили для анимации */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}