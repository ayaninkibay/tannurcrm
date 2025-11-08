// src/app/admin/finance/bonuses/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { BonusService } from '@/lib/bonuses/BonusService';
import {
  Calendar,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  History,
  Loader2,
  Shield,
  Package
} from 'lucide-react';

interface MonthData {
  month: string;
  monthName: string;
  isCurrentMonth: boolean;
  isHistorical: boolean;
  isFinalized: boolean;
  isPaid: boolean;
  hasData: boolean;
  dataCount: number;
  totalUsers?: number;
  totalTurnover?: number;
  totalBonuses?: number;
  status: 'active' | 'ready' | 'finalized' | 'paid' | 'empty';
}

export default function BonusesMainPage() {
  const router = useRouter();
  const [months, setMonths] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState<any>(null);

  useEffect(() => {
    loadMonths();
    checkSystemHealth();
  }, []);

  const checkSystemHealth = async () => {
    try {
      const issues = await BonusService.auditTurnoverCheck();
      const problemsOnly = issues.filter(i => !i.is_correct);
      
      setSystemHealth({
        hasIssues: problemsOnly.length > 0,
        issuesCount: problemsOnly.length,
        message: problemsOnly.length > 0 
          ? `Найдено ${problemsOnly.length} проблем в системе`
          : 'Система работает корректно'
      });
    } catch (err) {
      console.error('Error checking system health:', err);
    }
  };

  const loadMonths = async () => {
    try {
      setLoading(true);
      
      const currentMonth = BonusService.getCurrentMonth();
      const currentDate = new Date();
      const monthsData: MonthData[] = [];

      console.log('🔍 Current month from service:', currentMonth);
      console.log('🔍 Current date:', currentDate);

      // Генерируем последние 12 месяцев (включая текущий)
      for (let i = 0; i < 12; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthStr = date.toISOString().substring(0, 7);
        
        console.log(`📅 Processing month ${i}:`, monthStr);
        
        const monthStatus = await BonusService.getMonthStatus(monthStr);
        const turnoverData = await BonusService.getTurnoverForMonth(monthStr);
        
        console.log(`  Status for ${monthStr}:`, {
          isCurrentMonth: monthStatus.isCurrentMonth,
          hasData: monthStatus.hasData,
          dataCount: monthStatus.dataCount
        });
        
        // Определяем статус месяца
        let status: MonthData['status'] = 'empty';
        if (monthStatus.isPaid) {
          status = 'paid';
        } else if (monthStatus.isFinalized) {
          status = 'finalized';
        } else if (monthStatus.isHistorical && monthStatus.hasData) {
          status = 'ready';
        } else if (monthStatus.isCurrentMonth && monthStatus.hasData) {
          status = 'active';
        } else if (monthStatus.hasData) {
          status = 'ready';
        }

        // Подсчёт статистики
        const dealers = turnoverData.data.filter(u => {
          if (!u || !u.users) return false;
          if (!u.users.parent_id) return true;
          const parentExists = turnoverData.data.some(
            item => item.user_id === u.users.parent_id
          );
          return !parentExists;
        });

        const totalTurnover = dealers.reduce((sum, u) => sum + (u.total_turnover || 0), 0);
        const totalBonuses = dealers.reduce((sum, u) => {
          if (turnoverData.source === 'history') {
            return sum + (u.bonus_amount || 0);
          }
          return sum + ((u.personal_turnover || 0) * (u.bonus_percent || 0) / 100);
        }, 0);

        monthsData.push({
          month: monthStr,
          monthName: BonusService.getMonthName(monthStr),
          isCurrentMonth: monthStatus.isCurrentMonth,
          isHistorical: monthStatus.isHistorical,
          isFinalized: monthStatus.isFinalized,
          isPaid: monthStatus.isPaid,
          hasData: monthStatus.hasData,
          dataCount: monthStatus.dataCount,
          totalUsers: dealers.length,
          totalTurnover,
          totalBonuses,
          status
        });

        console.log(`  ✅ Added month:`, {
          month: monthStr,
          status,
          isCurrentMonth: monthStatus.isCurrentMonth,
          totalUsers: dealers.length
        });
      }

      console.log('📊 Total months loaded:', monthsData.length);
      console.log('📊 Months data:', monthsData.map(m => ({
        month: m.month,
        isCurrent: m.isCurrentMonth,
        status: m.status
      })));

      setMonths(monthsData);
    } catch (err) {
      console.error('❌ Error loading months:', err);
    } finally {
      setLoading(false);
    }
  };

  const navigateToMonth = (month: string) => {
    router.push(`/admin/finance/bonuses/${month}`);
  };

  const navigateToAudit = () => {
    router.push('/admin/finance/bonuses/audit');
  };

  const getStatusConfig = (status: MonthData['status']) => {
    const configs = {
      active: {
        bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
        border: 'border-blue-200',
        icon: Clock,
        iconColor: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-700',
        badgeText: 'Активный'
      },
      ready: {
        bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
        border: 'border-yellow-200',
        icon: AlertCircle,
        iconColor: 'text-yellow-600',
        badge: 'bg-yellow-100 text-yellow-700',
        badgeText: 'Готов к финализации'
      },
      finalized: {
        bg: 'bg-gradient-to-br from-green-50 to-green-100',
        border: 'border-green-200',
        icon: CheckCircle,
        iconColor: 'text-green-600',
        badge: 'bg-green-100 text-green-700',
        badgeText: 'Финализирован'
      },
      paid: {
        bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
        border: 'border-purple-200',
        icon: CheckCircle,
        iconColor: 'text-purple-600',
        badge: 'bg-purple-100 text-purple-700',
        badgeText: 'Выплачен'
      },
      empty: {
        bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
        border: 'border-gray-200',
        icon: Package,
        iconColor: 'text-gray-400',
        badge: 'bg-gray-100 text-gray-600',
        badgeText: 'Нет данных'
      }
    };
    return configs[status];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#D77E6C] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <MoreHeaderAD title="Управление бонусами" showBackButton={true} />

      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        
        {/* DEBUG INFO */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-mono text-blue-900">
            🔍 Debug: Загружено месяцев: {months.length} | 
            Текущих: {months.filter(m => m.isCurrentMonth).length} |
            Открой консоль для деталей
          </p>
        </div>
        
        {/* Системный статус */}
        {systemHealth && (
          <div className={`mb-6 p-4 rounded-xl border-2 ${
            systemHealth.hasIssues 
              ? 'bg-red-50 border-red-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {systemHealth.hasIssues ? (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
                <div>
                  <p className={`font-semibold ${
                    systemHealth.hasIssues ? 'text-red-900' : 'text-green-900'
                  }`}>
                    {systemHealth.message}
                  </p>
                  {systemHealth.hasIssues && (
                    <p className="text-sm text-red-700 mt-1">
                      Рекомендуется провести аудит перед финализацией
                    </p>
                  )}
                </div>
              </div>
              
              <button
                onClick={navigateToAudit}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Аудит
              </button>
            </div>
          </div>
        )}

        {/* Общая статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#D77E6C]/10 rounded-lg">
                <Calendar className="w-6 h-6 text-[#D77E6C]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Всего месяцев</p>
                <p className="text-2xl font-bold text-gray-900">{months.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Финализировано</p>
                <p className="text-2xl font-bold text-gray-900">
                  {months.filter(m => m.isPaid || m.isFinalized).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Требуют внимания</p>
                <p className="text-2xl font-bold text-gray-900">
                  {months.filter(m => m.status === 'ready').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Список месяцев */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Месяцы бонусов
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {months.map((month) => {
              const config = getStatusConfig(month.status);
              const StatusIcon = config.icon;

              return (
                <button
                  key={month.month}
                  onClick={() => navigateToMonth(month.month)}
                  className={`w-full p-4 md:p-6 hover:bg-gray-50 transition-all text-left ${
                    month.isCurrentMonth ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Иконка статуса */}
                    <div className={`p-3 rounded-xl ${config.bg} border ${config.border}`}>
                      <StatusIcon className={`w-6 h-6 ${config.iconColor}`} />
                    </div>

                    {/* Основная информация */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {month.monthName}
                        </h3>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.badge}`}>
                          {config.badgeText}
                        </span>
                        {month.isCurrentMonth && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#D77E6C]/10 text-[#D77E6C]">
                            Текущий
                          </span>
                        )}
                      </div>

                      {/* Статистика */}
                      {month.hasData ? (
                        <div className="grid grid-cols-3 gap-4 mt-3">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Дилеров</p>
                              <p className="font-semibold text-gray-900">
                                {month.totalUsers || 0}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Товарооборот</p>
                              <p className="font-semibold text-gray-900">
                                {BonusService.formatCurrency(month.totalTurnover || 0).split(' ')[0]}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Бонусы</p>
                              <p className="font-semibold text-[#D77E6C]">
                                {BonusService.formatCurrency(month.totalBonuses || 0).split(' ')[0]}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 mt-2">
                          Нет данных за этот месяц
                        </p>
                      )}
                    </div>

                    {/* Стрелка */}
                    <ChevronRight className="w-6 h-6 text-gray-400" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}