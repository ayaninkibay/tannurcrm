'use client';

import React from 'react';
import Image from 'next/image';

interface BonusCardProps {
  turnover: number;
  goal: number;
  remaining: number;
  variant?: 'bonus' | 'turnover';
}

export default function BonusCard({
  turnover,
  goal,
  remaining,
  variant = 'bonus',
}: BonusCardProps) {
  const percentage = Math.min((turnover / goal) * 100, 100);
  const isBonus = variant === 'bonus';

  if (isBonus) {
    return (
      <div className="bg-gradient-to-br from-[#DC7C67] to-[#C86B56] rounded-2xl p-6 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-20 h-20 opacity-20">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="currentColor">
            <circle cx="70" cy="30" r="20" />
            <circle cx="85" cy="15" r="8" />
          </svg>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <h3 className="text-lg font-bold mb-1">Ваш бонус</h3>
            <p className="text-white/80 text-sm">с оборота команды</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Main value */}
        <div className="relative z-10 mb-6">
          <div className="text-4xl font-black mb-4">15%</div>
          
          <div className="bg-white/15 rounded-lg p-4 backdrop-blur-sm">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Бонус с оборота команды</span>
                <span className="font-semibold">15%</span>
              </div>
              <div className="flex justify-between">
                <span>Скидка в магазине</span>
                <span className="font-semibold">30%</span>
              </div>
              <div className="flex justify-between">
                <span>Бонус с подписки дилеров</span>
                <span className="font-semibold">50%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="relative z-10">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/80">До следующего уровня</span>
            <span className="font-bold">{remaining.toLocaleString()} ₸</span>
          </div>
          
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs mt-2 text-white/70">
            <span>{turnover.toLocaleString()} ₸</span>
            <span>{Math.round(percentage)}%</span>
            <span>{goal.toLocaleString()} ₸</span>
          </div>
        </div>
      </div>
    );
  }

  // Turnover card
  return (
    <div className="bg-white rounded-2xl p-6 text-gray-900  relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="currentColor">
          <path d="M20 20 L80 20 L80 80 L20 80 Z" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M30 50 L50 30 L70 50" stroke="currentColor" strokeWidth="3" fill="none" />
        </svg>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3 className="text-lg font-bold mb-1 text-gray-900">Товарооборот команды</h3>
          <p className="text-gray-600 text-sm">текущий период</p>
        </div>
        <div className="w-10 h-10 bg-[#DC7C67]/10 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-[#DC7C67]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
      </div>

      {/* Main value */}
      <div className="relative z-10 mb-6">
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-4xl font-black text-gray-900">{(turnover / 1000000).toFixed(1)}M</span>
          <span className="text-xl font-bold text-gray-600">₸</span>
        </div>
        
        <div className="text-sm text-gray-600">
          Текущий оборот за месяц
        </div>
      </div>

      {/* Progress */}
      <div className="relative z-10">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">До следующего статуса</span>
          <span className="font-bold text-gray-900">{remaining.toLocaleString()} ₸</span>
        </div>
        
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#DC7C67] rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs mt-2 text-gray-500">
          <span>{turnover.toLocaleString()} ₸</span>
          <span className="font-semibold text-[#DC7C67]">{Math.round(percentage)}%</span>
          <span>{goal.toLocaleString()} ₸</span>
        </div>
      </div>
    </div>
  );
}