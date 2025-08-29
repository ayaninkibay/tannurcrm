'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy, TrendingUp, Users, Gift,
  DollarSign, Calendar, ChevronRight,
  Award, Star, Target, Zap, CheckCircle, Clock
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useTranslate } from '@/hooks/useTranslate';

interface BonusData {
  totalEarned: number;
  personalBonus: number;
  teamBonus: number;
  pendingBonus: number;
  paidBonus: number;
  currentLevel: number;
  nextLevel: number;
  progressToNext: number;
  teamSize: number;
  monthlyGrowth: number;
}

interface BonusHistory {
  id: string;
  created_at: string;
  amount: number;
  type: 'personal' | 'team_difference' | 'special';
  status: 'pending_payment' | 'paid' | 'cancelled';
  note: string;
  order_id?: string;
  reference_user?: {
    first_name: string;
    last_name: string;
  };
}

interface BonusDisplayProps {
  userId: string;
  showHistory?: boolean;
  compact?: boolean;
}

export default function BonusDisplay({
  userId,
  showHistory = true,
  compact = false
}: BonusDisplayProps) {
  const { t } = useTranslate();

  const [bonusData, setBonusData] = useState<BonusData>({
    totalEarned: 0,
    personalBonus: 0,
    teamBonus: 0,
    pendingBonus: 0,
    paidBonus: 0,
    currentLevel: 5,
    nextLevel: 7,
    progressToNext: 0,
    teamSize: 0,
    monthlyGrowth: 0
  });
  const [bonusHistory, setBonusHistory] = useState<BonusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'month' | 'week'>('month');

  useEffect(() => {
    loadBonusData();
    if (showHistory) {
      loadBonusHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, selectedPeriod]);

  const loadBonusData = async () => {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('personal_level, personal_turnover, temp_bonus_percent, temp_bonus_until')
        .eq('id', userId)
        .single();

      const { data: bonuses } = await supabase
        .from('bonus_payots')
        .select('amount, type, status')
        .eq('user_id', userId);

      const { data: team } = await supabase
        .from('users')
        .select('id')
        .eq('parent_id', userId);

      const personalBonus =
        bonuses?.filter(b => b.type === 'personal')
          .reduce((sum, b) => sum + (b.amount || 0), 0) || 0;

      const teamBonus =
        bonuses?.filter(b => b.type === 'team_difference')
          .reduce((sum, b) => sum + (b.amount || 0), 0) || 0;

      const pendingBonus =
        bonuses?.filter(b => b.status === 'pending_payment')
          .reduce((sum, b) => sum + (b.amount || 0), 0) || 0;

      const paidBonus =
        bonuses?.filter(b => b.status === 'paid')
          .reduce((sum, b) => sum + (b.amount || 0), 0) || 0;

      const currentLevel = user?.personal_level || 5;
      const nextLevel =
        currentLevel < 7 ? 7 : currentLevel < 10 ? 10 : currentLevel < 15 ? 15 : 20;

      const turnoverForNext = getRequiredTurnover(nextLevel);
      const currentTurnover = user?.personal_turnover || 0;
      const progressToNext = Math.min(100, (currentTurnover / turnoverForNext) * 100);

      setBonusData({
        totalEarned: personalBonus + teamBonus,
        personalBonus,
        teamBonus,
        pendingBonus,
        paidBonus,
        currentLevel,
        nextLevel,
        progressToNext,
        teamSize: team?.length || 0,
        monthlyGrowth: calculateMonthlyGrowth(bonuses || [])
      });
    } catch (error) {
      console.error('Error loading bonus data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBonusHistory = async () => {
    try {
      let query = supabase
        .from('bonus_payots')
        .select(`
          *,
          reference_user:reference_user_id(first_name, last_name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (selectedPeriod === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('created_at', weekAgo.toISOString());
      } else if (selectedPeriod === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = query.gte('created_at', monthAgo.toISOString());
      }

      const { data } = await query;
      setBonusHistory(data || []);
    } catch (error) {
      console.error('Error loading bonus history:', error);
    }
  };

  const getRequiredTurnover = (level: number): number => {
    const requirements: Record<number, number> = {
      7: 1000000,
      10: 3000000,
      15: 10000000,
      20: 50000000
    };
    return requirements[level] || 100000000;
  };

  const calculateMonthlyGrowth = (bonuses: any[]): number => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const thisMonthBonuses = bonuses
      .filter(b => new Date(b.created_at) >= new Date(now.getFullYear(), now.getMonth(), 1))
      .reduce((sum, b) => sum + (b.amount || 0), 0);

    const lastMonthBonuses = bonuses
      .filter(b => {
        const date = new Date(b.created_at);
        return date >= lastMonth && date < new Date(now.getFullYear(), now.getMonth(), 1);
      })
      .reduce((sum, b) => sum + (b.amount || 0), 0);

    if (lastMonthBonuses === 0) return 100;
    return ((thisMonthBonuses - lastMonthBonuses) / lastMonthBonuses) * 100;
  };

  const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} ₸`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString('ru-RU');

  const getBonusTypeIcon = (type: string) => {
    switch (type) {
      case 'personal': return Trophy;
      case 'team_difference': return Users;
      case 'special': return Gift;
      default: return DollarSign;
    }
  };

  const getBonusTypeColor = (type: string) => {
    switch (type) {
      case 'personal': return 'text-blue-600 bg-blue-100';
      case 'team_difference': return 'text-green-600 bg-green-100';
      case 'special': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-xl mb-4"></div>
        <div className="h-48 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#111]">{t('Мои бонусы')}</h3>
          <Trophy className="w-5 h-5 text-[#D77E6C]" />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{t('Всего заработано')}</span>
            <span className="font-semibold text-[#111]">{formatPrice(bonusData.totalEarned)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{t('Ожидает выплаты')}</span>
            <span className="font-semibold text-orange-600">{formatPrice(bonusData.pendingBonus)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{t('Текущий уровень')}</span>
            <span className="font-semibold text-[#D77E6C]">{bonusData.currentLevel}%</span>
          </div>
        </div>

        <button
          onClick={() => window.location.href = '/dealer/bonuses'}
          className="w-full mt-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          {t('Подробнее')}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Статистика карточки */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Trophy className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs text-gray-500">{t('Всего')}</span>
          </div>
          <div className="text-2xl font-bold text-[#111]">{formatPrice(bonusData.totalEarned)}</div>
          <div className="text-sm text-gray-500">{t('заработано')}</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-xs text-gray-500">{t('Ожидает')}</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">{formatPrice(bonusData.pendingBonus)}</div>
          <div className="text-sm text-gray-500">{t('к выплате')}</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[#D77E6C]/10 rounded-lg">
              <Star className="w-5 h-5 text-[#D77E6C]" />
            </div>
            <span className="text-xs text-gray-500">{t('Уровень')}</span>
          </div>
          <div className="text-2xl font-bold text-[#D77E6C]">{bonusData.currentLevel}%</div>
          <div className="text-sm text-gray-500">{t('текущий')}</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-gray-500">{t('Рост')}</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {bonusData.monthlyGrowth > 0 ? '+' : ''}{bonusData.monthlyGrowth.toFixed(0)}%
          </div>
          <div className="text-sm text-gray-500">{t('за месяц')}</div>
        </div>
      </div>

      {/* Прогресс к следующему уровню */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-[#111] mb-4">
          {t('Прогресс к следующему уровню')}
        </h3>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#D77E6C]/10 rounded-full flex items-center justify-center">
              <span className="font-bold text-[#D77E6C]">{bonusData.currentLevel}%</span>
            </div>
            <div>
              <p className="font-medium text-[#111]">{t('Текущий уровень')}</p>
              <p className="text-sm text-gray-500">{t('Личный бонус')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div>
              <p className="font-medium text-[#111] text-right">{t('Следующий уровень')}</p>
              <p className="text-sm text-gray-500 text-right">{t('Нужен товарооборот')}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="font-bold text-green-600">{bonusData.nextLevel}%</span>
            </div>
          </div>
        </div>

        <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#D77E6C] to-[#E89380] rounded-full transition-all duration-500"
            style={{ width: `${bonusData.progressToNext}%` }}
          />
        </div>

        <p className="text-sm text-gray-500 mt-2">
          {t('Прогресс: {p}% до уровня {lvl}%')
            .replace('{p}', bonusData.progressToNext.toFixed(0))
            .replace('{lvl}', String(bonusData.nextLevel))}
        </p>
      </div>

      {/* Разбивка бонусов */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-[#111] mb-4">{t('Источники дохода')}</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-[#111]">{t('Личные бонусы')}</p>
                  <p className="text-xs text-gray-500">{t('С ваших покупок')}</p>
                </div>
              </div>
              <p className="font-semibold text-[#111]">{formatPrice(bonusData.personalBonus)}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-[#111]">{t('Командные бонусы')}</p>
                  <p className="text-xs text-gray-500">{t('От вашей команды')}</p>
                </div>
              </div>
              <p className="font-semibold text-[#111]">{formatPrice(bonusData.teamBonus)}</p>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-[#111]">{t('Итого заработано')}</p>
                <p className="text-xl font-bold text-[#D77E6C]">{formatPrice(bonusData.totalEarned)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-[#111] mb-4">{t('Статус выплат')}</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-[#111]">{t('Выплачено')}</p>
                  <p className="text-xs text-gray-500">{t('Получено на счет')}</p>
                </div>
              </div>
              <p className="font-semibold text-green-600">{formatPrice(bonusData.paidBonus)}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-[#111]">{t('Ожидает')}</p>
                  <p className="text-xs text-gray-500">{t('В обработке')}</p>
                </div>
              </div>
              <p className="font-semibold text-orange-600">{formatPrice(bonusData.pendingBonus)}</p>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <button className="w-full py-2 bg-[#D77E6C] text-white rounded-lg hover:bg-[#C56D5C] transition-colors">
                {t('Запросить выплату')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* История бонусов */}
      {showHistory && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#111]">{t('История начислений')}</h3>
            <div className="flex gap-2">
              {(['week', 'month', 'all'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedPeriod === period
                      ? 'bg-[#D77E6C] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {period === 'week' ? t('Неделя') : period === 'month' ? t('Месяц') : t('Все')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {bonusHistory.map(bonus => {
              const Icon = getBonusTypeIcon(bonus.type);
              const colorClass = getBonusTypeColor(bonus.type);

              return (
                <div
                  key={bonus.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-[#111]">{bonus.note}</p>
                      <p className="text-xs text-gray-500">{formatDate(bonus.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#111]">+{formatPrice(bonus.amount)}</p>
                    <p
                      className={`text-xs font-medium ${
                        bonus.status === 'paid'
                          ? 'text-green-600'
                          : bonus.status === 'pending_payment'
                          ? 'text-orange-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {bonus.status === 'paid'
                        ? t('Выплачено')
                        : bonus.status === 'pending_payment'
                        ? t('Ожидает')
                        : t('Отменено')}
                    </p>
                  </div>
                </div>
              );
            })}

            {bonusHistory.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {t('Нет начислений за выбранный период')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
