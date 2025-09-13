'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Target, Award, Loader2 } from 'lucide-react';

// Эмуляция хука перевода
const useTranslate = () => ({
  t: (key: string) => key
});

interface BonusCardProps {
  userId?: string;
  className?: string;
}

export default function BonusCard({ userId, className = '' }: BonusCardProps) {
  const { t } = useTranslate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    currentTurnover: 0,
    goalAmount: 1000000,
    previousMonth: 0,
    teamCount: 0,
    currentLevel: null as any,
    nextLevel: null as any
  });

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        
        // Импортируем Supabase
        const { supabase } = await import('@/lib/supabase/client');
        
        // Получаем текущего пользователя если userId не передан
        let targetUserId = userId;
        if (!targetUserId) {
          const { data: { user } } = await supabase.auth.getUser();
          targetUserId = user?.id;
        }

        if (!targetUserId) {
          console.error('No user ID available');
          setLoading(false);
          return;
        }

        // Получаем командные закупки
        const { data: purchases, error } = await supabase
          .from('team_purchases')
          .select('id, completed_at, paid_amount, status')
          .eq('initiator_id', targetUserId)
          .eq('status', 'completed')
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: false });

        if (error) {
          console.error('Error loading team purchases:', error);
        }

        // Текущий месяц
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        // Предыдущий месяц
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        let currentMonthTotal = 0;
        let previousMonthTotal = 0;

        if (purchases && purchases.length > 0) {
          purchases.forEach(purchase => {
            if (purchase.completed_at && purchase.paid_amount) {
              const date = new Date(purchase.completed_at);
              
              // Текущий месяц
              if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                currentMonthTotal += purchase.paid_amount;
              }
              // Предыдущий месяц
              else if (date.getMonth() === prevMonth && date.getFullYear() === prevYear) {
                previousMonthTotal += purchase.paid_amount;
              }
            }
          });
        }

        // Получаем количество членов команды
        const { data: teamMembers } = await supabase
          .from('users')
          .select('id')
          .eq('parent_id', targetUserId);

        const teamCount = teamMembers?.length || 0;

        // Получаем уровни бонусов из БД
        const { data: bonusLevels } = await supabase
          .from('bonus_levels')
          .select('*')
          .eq('is_active', true)
          .order('min_amount', { ascending: true });

        // Определяем текущий и следующий уровень
        let currentLevel = null;
        let nextLevel = null;
        let goalAmount = 1000000; // По умолчанию

        if (bonusLevels && bonusLevels.length > 0) {
          // Находим текущий уровень
          for (let i = bonusLevels.length - 1; i >= 0; i--) {
            if (currentMonthTotal >= bonusLevels[i].min_amount) {
              currentLevel = bonusLevels[i];
              // Следующий уровень
              if (i < bonusLevels.length - 1) {
                nextLevel = bonusLevels[i + 1];
                goalAmount = nextLevel.min_amount;
              } else {
                // Если это максимальный уровень, ставим цель в 2 раза больше
                goalAmount = currentLevel.min_amount * 2;
              }
              break;
            }
          }

          // Если текущий товарооборот меньше минимального уровня
          if (!currentLevel && bonusLevels[0]) {
            nextLevel = bonusLevels[0];
            goalAmount = nextLevel.min_amount;
          }
        }

        setData({
          currentTurnover: currentMonthTotal,
          goalAmount: goalAmount,
          previousMonth: previousMonthTotal,
          teamCount: teamCount,
          currentLevel: currentLevel,
          nextLevel: nextLevel
        });
        
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [userId]);

  const formatMoney = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${Math.round(amount / 1000)}K`;
    }
    return amount.toLocaleString('ru-RU');
  };

  const percentage = Math.min((data.currentTurnover / data.goalAmount) * 100, 100);
  const remaining = Math.max(0, data.goalAmount - data.currentTurnover);
  
  // Расчет роста
  const growthPercent = data.previousMonth > 0 
    ? Math.round(((data.currentTurnover - data.previousMonth) / data.previousMonth) * 100)
    : 0;

  if (loading) {
    return (
      <div className={`bg-white rounded-3xl p-6 relative overflow-hidden flex items-center justify-center h-[280px] border border-gray-100 ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-[#D77E6C]" />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-3xl p-6 relative overflow-hidden border border-gray-100 ${className}`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#D77E6C] to-[#E89380] rounded-full -translate-y-20 translate-x-20"></div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{t('Командный товарооборот')}</h3>
          <p className="text-gray-500 text-sm">{t('текущий месяц')}</p>
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-[#D77E6C]/10 to-[#E89380]/10 rounded-2xl flex items-center justify-center">
          <Users className="w-6 h-6 text-[#D77E6C]" />
        </div>
      </div>

      {/* Main value */}
      <div className="relative z-10 mb-5">
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-4xl font-black bg-gradient-to-r from-[#D77E6C] to-[#E89380] bg-clip-text text-transparent">
            {formatMoney(data.currentTurnover)}
          </span>
          <span className="text-xl font-bold text-gray-400">₸</span>
        </div>
        
        {/* Stats grid - только 2 колонки */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <Users className="w-5 h-5 mx-auto mb-1 text-[#D77E6C]" />
            <div className="text-lg font-bold text-gray-900">{data.teamCount}</div>
            <div className="text-xs text-gray-500">{t('в команде')}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <Award className="w-5 h-5 mx-auto mb-1 text-[#D77E6C]" />
            <div className="text-lg font-bold text-gray-900">
              {data.currentLevel ? `${data.currentLevel.bonus_percent}%` : '0%'}
            </div>
            <div className="text-xs text-gray-500">{t('уровень бонуса')}</div>
          </div>
        </div>
      </div>

      {/* Progress to next level */}
      <div className="relative z-10">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 font-medium">
            {data.nextLevel 
              ? t('До уровня "{name}"').replace('{name}', data.nextLevel.name)
              : t('Прогресс к цели')}
          </span>
          <span className="font-bold text-gray-900">
            {formatMoney(remaining)} ₸
          </span>
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
          <span>
            {data.currentLevel && (
              <span className="font-medium">{data.currentLevel.name}: </span>
            )}
            {formatMoney(data.currentTurnover)} ₸
          </span>
          <span className="font-bold text-[#D77E6C]">{Math.round(percentage)}%</span>
          <span>
            {t('Цель')}: {formatMoney(data.goalAmount)} ₸
          </span>
        </div>
      </div>
    </div>
  );
}

// Стили для анимации shimmer
const shimmerStyles = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
`;

// Добавляем стили в head
if (typeof document !== 'undefined' && !document.getElementById('shimmer-styles')) {
  const style = document.createElement('style');
  style.id = 'shimmer-styles';
  style.textContent = shimmerStyles;
  document.head.appendChild(style);
}