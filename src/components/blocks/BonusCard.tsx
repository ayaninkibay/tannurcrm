'use client';

import React from 'react';
import { TrendingUp, Gift, Target, Zap, Trophy, DollarSign } from 'lucide-react';

interface BonusCardProps {
  turnover: number;
  goal: number;
  remaining: number;
  variant?: 'bonus' | 'turnover';
  bonusPercent?: number;
  storeDiscount?: number;
  dealerBonus?: number;
}

export default function BonusCard({
  turnover,
  goal,
  remaining,
  variant = 'bonus',
  bonusPercent = 15,
  storeDiscount = 30,
  dealerBonus = 50
}: BonusCardProps) {
  const percentage = Math.min((turnover / goal) * 100, 100);
  const isBonus = variant === 'bonus';

  const formatMoney = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${Math.round(amount / 1000)}K`;
    }
    return amount.toLocaleString('ru-RU');
  };

  if (isBonus) {
    return (
      <div className="bg-gradient-to-br from-[#D77E6C] via-[#D77E6C] to-[#C66B5A] rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <h3 className="text-xl font-bold mb-1">Ваши бонусы</h3>
            <p className="text-white/70 text-sm">активные преимущества</p>
          </div>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        {/* Main bonus value */}
        <div className="relative z-10 mb-5">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-5xl font-black">{bonusPercent}</span>
            <span className="text-2xl font-bold text-white/80">%</span>
          </div>
          
          {/* Bonus breakdown */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <Gift className="w-5 h-5 mx-auto mb-1 text-white/90" />
              <div className="text-lg font-bold">{bonusPercent}%</div>
              <div className="text-xs text-white/70">с оборота</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <DollarSign className="w-5 h-5 mx-auto mb-1 text-white/90" />
              <div className="text-lg font-bold">{storeDiscount}%</div>
              <div className="text-xs text-white/70">скидка</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <Zap className="w-5 h-5 mx-auto mb-1 text-white/90" />
              <div className="text-lg font-bold">{dealerBonus}%</div>
              <div className="text-xs text-white/70">с дилеров</div>
            </div>
          </div>
        </div>

        {/* Progress to next level */}
        <div className="relative z-10">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/80 font-medium">Прогресс уровня</span>
            <span className="font-bold">осталось {formatMoney(remaining)} ₸</span>
          </div>
          
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-700 relative"
              style={{ width: `${percentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
          
          <div className="flex justify-between text-xs mt-2 text-white/60">
            <span>{formatMoney(turnover)} ₸</span>
            <span className="font-bold text-white/90">{Math.round(percentage)}%</span>
            <span>{formatMoney(goal)} ₸</span>
          </div>
        </div>
      </div>
    );
  }

  // Turnover variant
  return (
    <div className="bg-white rounded-3xl p-6 relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#D77E6C] to-[#E89380] rounded-full -translate-y-20 translate-x-20"></div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Товарооборот</h3>
          <p className="text-gray-500 text-sm">команды за период</p>
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-[#D77E6C]/10 to-[#E89380]/10 rounded-2xl flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-[#D77E6C]" />
        </div>
      </div>

      {/* Main value */}
      <div className="relative z-10 mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-5xl font-black bg-gradient-to-r from-[#D77E6C] to-[#E89380] bg-clip-text text-transparent">
            {formatMoney(turnover)}
          </span>
          <span className="text-xl font-bold text-gray-400">₸</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="font-medium">+24%</span>
          </div>
          <span className="text-gray-500">vs прошлый месяц</span>
        </div>
      </div>

      {/* Progress to next status */}
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">До следующего статуса</span>
          <span className="text-sm font-bold text-gray-900">{formatMoney(remaining)} ₸</span>
        </div>
        
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#D77E6C] to-[#E89380] rounded-full transition-all duration-700 relative"
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
          </div>
        </div>
        
        <div className="flex justify-between text-xs mt-2 text-gray-500">
          <span>Текущий: {formatMoney(turnover)} ₸</span>
          <span className="font-bold text-[#D77E6C]">{Math.round(percentage)}%</span>
          <span>Цель: {formatMoney(goal)} ₸</span>
        </div>
      </div>
    </div>
  );
}