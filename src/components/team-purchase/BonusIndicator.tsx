'use client';

import React, { useEffect, useState } from 'react';
import { Gift, TrendingUp, Crown, Star, Trophy } from 'lucide-react';
import { bonusService, type BonusLevel } from '@/lib/team-purchase/BonusService';

interface BonusIndicatorProps {
  amount: number;
  showDetails?: boolean;
  className?: string;
}

export default function BonusIndicator({ 
  amount, 
  showDetails = false,
  className = ''
}: BonusIndicatorProps) {
  const [bonusInfo, setBonusInfo] = useState<{
    level: BonusLevel | null;
    percent: number;
    bonusAmount: number;
    totalWithBonus: number;
  } | null>(null);
  
  const [allLevels, setAllLevels] = useState<BonusLevel[]>([]);

  useEffect(() => {
    loadBonusInfo();
    if (showDetails) {
      loadAllLevels();
    }
  }, [amount, showDetails]);

  const loadBonusInfo = async () => {
    const info = await bonusService.calculateBonus(amount);
    setBonusInfo(info);
  };

  const loadAllLevels = async () => {
    const levels = await bonusService.getAllLevels();
    setAllLevels(levels);
  };

  const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} ₸`;

  const getIcon = (iconName?: string) => {
    switch(iconName) {
      case 'crown': return <Crown className="w-5 h-5" />;
      case 'star': return <Star className="w-5 h-5" />;
      case 'trophy': return <Trophy className="w-5 h-5" />;
      case 'trending': return <TrendingUp className="w-5 h-5" />;
      default: return <Gift className="w-5 h-5" />;
    }
  };

  if (!bonusInfo) {
    return null;
  }

  const { level, percent, bonusAmount } = bonusInfo;

  // Простой индикатор
  if (!showDetails) {
    if (!level || percent === 0) {
      return (
        <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
          <Gift className="w-4 h-4" />
          <span className="text-sm">Нет бонусов</span>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-2 ${className}`} style={{ color: level.color || '#10B981' }}>
        {getIcon(level.icon)}
        <span className="font-medium">
          {level.name}: {percent}% бонус
        </span>
        <span className="text-sm opacity-75">
          (+{formatPrice(bonusAmount)})
        </span>
      </div>
    );
  }

  // Детальный вид с уровнями
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Текущий уровень */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[#111]">Ваш бонусный уровень</h3>
          {level && (
            <div className="flex items-center gap-2" style={{ color: level.color }}>
              {getIcon(level.icon)}
              <span className="font-bold">{level.name}</span>
            </div>
          )}
        </div>

        {level ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Процент бонуса:</span>
              <span className="font-bold text-green-600">{percent}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Сумма бонуса:</span>
              <span className="font-bold text-green-600">+{formatPrice(bonusAmount)}</span>
            </div>
            {level.description && (
              <p className="text-sm text-gray-500 mt-2">{level.description}</p>
            )}
          </div>
        ) : (
          <p className="text-gray-500">
            Добавьте товаров на сумму от {formatPrice(allLevels[0]?.min_amount || 300000)} для получения бонусов
          </p>
        )}
      </div>

      {/* Все уровни */}
      {allLevels.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-3">Бонусные уровни</h4>
          <div className="space-y-2">
            {allLevels.map((lvl) => {
              const isActive = level?.id === lvl.id;
              const isReachable = amount >= lvl.min_amount && (!lvl.max_amount || amount <= lvl.max_amount);
              
              return (
                <div
                  key={lvl.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-white border-2' 
                      : isReachable 
                      ? 'bg-white/50 border border-gray-200' 
                      : 'opacity-50'
                  }`}
                  style={{ borderColor: isActive ? lvl.color : undefined }}
                >
                  <div className="flex items-center gap-3">
                    <div style={{ color: isActive ? lvl.color : '#9CA3AF' }}>
                      {getIcon(lvl.icon)}
                    </div>
                    <div>
                      <p className={`font-medium ${isActive ? 'text-[#111]' : 'text-gray-600'}`}>
                        {lvl.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {bonusService.formatBonusRange(lvl)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                      {lvl.bonus_percent}%
                    </p>
                    {isActive && (
                      <p className="text-xs text-green-600">Активен</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Прогресс до следующего уровня */}
      {level && allLevels.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            {(() => {
              const currentIndex = allLevels.findIndex(l => l.id === level.id);
              const nextLevel = allLevels[currentIndex + 1];
              
              if (!nextLevel) {
                return '🎉 Вы достигли максимального уровня!';
              }
              
              const needed = nextLevel.min_amount - amount;
              return `До уровня "${nextLevel.name}" осталось: ${formatPrice(needed)}`;
            })()}
          </p>
        </div>
      )}
    </div>
  );
}