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
    personalTurnover: 0,
    teamTurnover: 0,
    goalAmount: 1000000,
    previousMonth: 0,
    teamCount: 0,
    currentLevel: null as any,
    nextLevel: null as any,
    bonusPercent: 8
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

        // Текущий месяц
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
        
        // Получаем текущий товарооборот из user_turnover_current
        const { data: currentTurnover, error: turnoverError } = await supabase
          .from('user_turnover_current')
          .select('*')
          .eq('user_id', targetUserId)
          .single();

        if (turnoverError && turnoverError.code !== 'PGRST116') {
          console.error('Error loading turnover:', turnoverError);
        }

        let currentTotal = 0;
        let personalTotal = 0;
        let teamTotal = 0;
        let bonusPercent = 8;

        if (currentTurnover) {
          currentTotal = currentTurnover.total_turnover || 0;
          personalTotal = currentTurnover.personal_turnover || 0;
          teamTotal = currentTotal - personalTotal;
          bonusPercent = currentTurnover.bonus_percent || 8;
        } else {
          // Если нет записи в user_turnover_current, считаем из orders
          const { data: orders } = await supabase
            .from('orders')
            .select('total_amount')
            .eq('user_id', targetUserId)
            .eq('payment_status', 'paid')
            .gte('created_at', currentMonthStart);

          if (orders) {
            personalTotal = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
          }

          // Считаем командный товарооборот
          // Сначала получаем всех членов команды
          const { data: teamMembers } = await supabase
            .from('users')
            .select('id')
            .eq('parent_id', targetUserId);

          if (teamMembers && teamMembers.length > 0) {
            const teamMemberIds = teamMembers.map(m => m.id);
            
            // Рекурсивно получаем всю команду
            const getAllTeamMembers = async (memberIds: string[]): Promise<string[]> => {
              const { data: subMembers } = await supabase
                .from('users')
                .select('id')
                .in('parent_id', memberIds);
              
              if (subMembers && subMembers.length > 0) {
                const subMemberIds = subMembers.map(m => m.id);
                const deeperMembers = await getAllTeamMembers(subMemberIds);
                return [...memberIds, ...subMemberIds, ...deeperMembers];
              }
              return memberIds;
            };

            const allTeamIds = await getAllTeamMembers(teamMemberIds);
            
            // Получаем заказы всей команды
            if (allTeamIds.length > 0) {
              const { data: teamOrders } = await supabase
                .from('orders')
                .select('total_amount')
                .in('user_id', allTeamIds)
                .eq('payment_status', 'paid')
                .gte('created_at', currentMonthStart);

              if (teamOrders) {
                teamTotal = teamOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
              }
            }
          }

          currentTotal = personalTotal + teamTotal;
        }

        // Получаем предыдущий месяц из user_turnover_history
        const { data: previousTurnover } = await supabase
          .from('user_turnover_history')
          .select('total_turnover')
          .eq('user_id', targetUserId)
          .eq('month_start', prevMonthStart)
          .single();

        const previousMonth = previousTurnover?.total_turnover || 0;

        // Получаем количество прямых членов команды
        const { data: directTeamMembers } = await supabase
          .from('users')
          .select('id')
          .eq('parent_id', targetUserId);

        const teamCount = directTeamMembers?.length || 0;

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
          // Находим текущий уровень на основе общего товарооборота
          for (let i = bonusLevels.length - 1; i >= 0; i--) {
            if (currentTotal >= bonusLevels[i].min_amount) {
              currentLevel = bonusLevels[i];
              // Следующий уровень
              if (i < bonusLevels.length - 1) {
                nextLevel = bonusLevels[i + 1];
                goalAmount = nextLevel.min_amount;
              } else {
                // Если это максимальный уровень
                goalAmount = currentLevel.max_amount || currentLevel.min_amount * 2;
              }
              break;
            }
          }

          // Если текущий товарооборот меньше минимального уровня
          if (!currentLevel && bonusLevels[0]) {
            currentLevel = { name: 'Начальный', bonus_percent: 8 };
            nextLevel = bonusLevels[0];
            goalAmount = nextLevel.min_amount;
          }
        }

        setData({
          currentTurnover: currentTotal,
          personalTurnover: personalTotal,
          teamTurnover: teamTotal,
          goalAmount: goalAmount,
          previousMonth: previousMonth,
          teamCount: teamCount,
          currentLevel: currentLevel,
          nextLevel: nextLevel,
          bonusPercent: bonusPercent
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
          <h3 className="text-xl font-bold text-gray-900">{t('Общий товарооборот')}</h3>
          <p className="text-gray-500 text-sm">{t('текущий месяц')}</p>
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-[#D77E6C]/10 to-[#E89380]/10 rounded-2xl flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-[#D77E6C]" />
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
        
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <Users className="w-5 h-5 mx-auto mb-1 text-[#D77E6C]" />
            <div className="text-lg font-bold text-gray-900">{data.teamCount}</div>
            <div className="text-xs text-gray-500">{t('в команде')}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <Award className="w-5 h-5 mx-auto mb-1 text-[#D77E6C]" />
            <div className="text-lg font-bold text-gray-900">
              {data.bonusPercent}%
            </div>
            <div className="text-xs text-gray-500">{t('бонус')}</div>
          </div>
        </div>

        {/* Личный и командный */}
        <div className="flex justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
          <span>{t('Личный')}: <span className="font-semibold text-gray-700">{formatMoney(data.personalTurnover)}</span></span>
          <span>{t('Командный')}: <span className="font-semibold text-gray-700">{formatMoney(data.teamTurnover)}</span></span>
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
              <span className="font-medium">{data.currentLevel.name}</span>
            )}
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