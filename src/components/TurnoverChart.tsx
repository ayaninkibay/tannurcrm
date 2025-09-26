'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, Calendar, ChevronDown, CalendarRange, Loader2 } from 'lucide-react';

// Hooks - эмуляция, если нет реального
const useTranslate = () => ({
  t: (key: string) => key
});

export type DayValue = {
  date: Date;
  value: number;
};

export type MonthValue = {
  date: Date;
  value: number;
};

export type TurnoverChartProps = {
  title?: string;
  subtitle?: string;
  data?: MonthValue[];
  colorBar?: string;
  colorLine?: string;
  lineOffset?: number;
  showPeriodSelector?: boolean;
  showStats?: boolean;
  userId?: string;
  dataType?: 'personal' | 'team';
  apiEndpoint?: string;
};

type PeriodType = 'last15Days' | 'thisMonth' | 'lastMonth' | 'last3Months' | 'last6Months' | 'thisYear' | 'all' | 'custom';
type ViewType = 'daily' | 'monthly';

export const TurnoverChart: React.FC<TurnoverChartProps> = ({
  title = 'Товарооборот',
  subtitle = 'Динамика продаж за период',
  data: propData,
  colorBar = '#FFE5E1',
  colorLine = '#D77E6C',
  lineOffset = 0,
  showPeriodSelector = true,
  showStats = true,
  userId,
  dataType = 'personal',
  apiEndpoint = '/api/dealer/turnover'
}) => {
  const { t } = useTranslate();

  // По умолчанию показываем последние 15 дней
  const [period, setPeriod] = useState<PeriodType>('last15Days');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Состояния для загрузки данных
  const [rawData, setRawData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setIsClient(true); }, []);

  // Загрузка данных напрямую из Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Импортируем Supabase клиент
        const { supabase } = await import('@/lib/supabase/client');
        
        // Получаем текущего пользователя
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        const targetUserId = userId || user?.id;
        
        if (!targetUserId) {
          throw new Error('Пользователь не авторизован');
        }

        console.log('Loading data for user:', targetUserId, 'type:', dataType);

        if (dataType === 'personal') {
          // Загружаем личные заказы с детальной информацией по дням
          const { data: orders, error } = await supabase
            .from('orders')
            .select('id, created_at, total_amount, payment_status')
            .eq('user_id', targetUserId)
            .eq('payment_status', 'paid')
            .order('created_at', { ascending: true });

          if (error) {
            console.error('Error loading orders:', error);
            throw error;
          }

          console.log('Loaded orders:', orders?.length || 0);
          setRawData(orders || []);
          
        } else if (dataType === 'team') {
          // Загружаем командные закупки
          const { data: purchases, error } = await supabase
            .from('team_purchases')
            .select('id, completed_at, paid_amount, status')
            .eq('initiator_id', targetUserId)
            .eq('status', 'completed')
            .not('completed_at', 'is', null)
            .order('completed_at', { ascending: true });

          if (error) {
            console.error('Error loading team purchases:', error);
            throw error;
          }

          setRawData(purchases || []);
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, dataType]);

  // Пункты периода
  const periodOptions = useMemo(() => ([
    { value: 'last15Days' as PeriodType, label: t('Последние 15 дней') },
    { value: 'thisMonth' as PeriodType, label: t('Текущий месяц') },
    { value: 'lastMonth' as PeriodType, label: t('Прошлый месяц') },
    { value: 'last3Months' as PeriodType, label: t('3 месяца') },
    { value: 'last6Months' as PeriodType, label: t('6 месяцев') },
    { value: 'thisYear' as PeriodType, label: t('Текущий год') },
    { value: 'all' as PeriodType, label: t('За всё время') },
    { value: 'custom' as PeriodType, label: t('Выбрать период') },
  ]), [t]);

  // Закрытие dropdown при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  // Определение типа отображения на основе периода
  const viewType = useMemo(() => {
    switch (period) {
      case 'last15Days':
      case 'thisMonth':
      case 'lastMonth':
        return 'daily';
      case 'last3Months':
      case 'last6Months':
      case 'thisYear':
      case 'all':
        return 'monthly';
      case 'custom':
        if (customDateRange.start && customDateRange.end) {
          const start = new Date(customDateRange.start);
          const end = new Date(customDateRange.end);
          const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays <= 45 ? 'daily' : 'monthly';
        }
        return 'daily';
      default:
        return 'daily';
    }
  }, [period, customDateRange]);

  // Обработка и фильтрация данных
  const processedData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    
    let startDate: Date;
    let endDate: Date = now;

    // Определяем диапазон дат для фильтрации
    switch (period) {
      case 'last15Days':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 14); // 15 дней включая сегодня
        startDate.setHours(0, 0, 0, 0);
        break;
        
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Последний день месяца
        endDate.setHours(23, 59, 59, 999);
        break;
        
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        endDate.setHours(23, 59, 59, 999);
        break;
        
      case 'last3Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        startDate.setHours(0, 0, 0, 0);
        break;
        
      case 'last6Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        startDate.setHours(0, 0, 0, 0);
        break;
        
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0);
        break;
        
      case 'custom':
        if (customDateRange.start && customDateRange.end) {
          startDate = new Date(customDateRange.start);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(customDateRange.end);
          endDate.setHours(23, 59, 59, 999);
        } else {
          return [];
        }
        break;
        
      case 'all':
      default:
        const dates = rawData.map(item => new Date(item.created_at || item.completed_at));
        if (dates.length === 0) return [];
        startDate = new Date(Math.min(...dates.map(d => d.getTime())));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(Math.max(...dates.map(d => d.getTime())));
        endDate.setHours(23, 59, 59, 999);
        break;
    }

    // Фильтруем данные по диапазону дат
    const filteredData = rawData.filter(item => {
      const date = new Date(item.created_at || item.completed_at);
      return date >= startDate && date <= endDate;
    });

    // Группируем данные
    if (viewType === 'daily') {
      // Группировка по дням
      const dailyData: { [key: string]: number } = {};
      
      filteredData.forEach(item => {
        const date = new Date(item.created_at || item.completed_at);
        const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const value = item.total_amount || item.paid_amount || 0;
        
        if (!dailyData[dayKey]) {
          dailyData[dayKey] = 0;
        }
        dailyData[dayKey] += value;
      });

      // Создаем массив всех дней в периоде
      const allDays: DayValue[] = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dayKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        allDays.push({
          date: new Date(currentDate),
          value: dailyData[dayKey] || 0
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return allDays;
      
    } else {
      // Группировка по месяцам для периодов больше 45 дней
      const monthlyData: { [key: string]: number } = {};
      
      filteredData.forEach(item => {
        const date = new Date(item.created_at || item.completed_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const value = item.total_amount || item.paid_amount || 0;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = 0;
        }
        monthlyData[monthKey] += value;
      });

      // Создаем массив всех месяцев в периоде
      const allMonths: MonthValue[] = [];
      const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
      
      while (currentDate <= endMonth) {
        const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        allMonths.push({
          date: new Date(currentDate),
          value: monthlyData[monthKey] || 0
        });
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      return allMonths;
    }
  }, [rawData, period, viewType, customDateRange]);

  // Подготовка данных для графика
  const graphData = useMemo(() => {
    return processedData.map(d => ({
      label: viewType === 'daily' 
        ? d.date.getDate().toString() // Для дней показываем только число
        : d.date.toLocaleString('ru', { month: 'short', year: '2-digit' }), // Для месяцев
      fullDate: viewType === 'daily'
        ? d.date.toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })
        : d.date.toLocaleString('ru', { month: 'long', year: 'numeric' }),
      value: d.value,
      lineValue: d.value + lineOffset,
    }));
  }, [processedData, lineOffset, viewType]);

  const total = useMemo(() => graphData.reduce((sum, d) => sum + d.value, 0), [graphData]);
  const daysWithSales = useMemo(() => graphData.filter(d => d.value > 0).length, [graphData]);

  const formatYAxis = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
    return value.toString();
  };

  const handlePeriodSelect = (value: PeriodType) => {
    if (value === 'custom') {
      setShowDatePicker(true);
      setShowDropdown(false);
    } else {
      setPeriod(value);
      setShowDropdown(false);
    }
  };

  const handleCustomPeriodApply = () => {
    if (customDateRange.start && customDateRange.end) {
      setPeriod('custom');
      setShowDatePicker(false);
    }
  };

  const getPeriodLabel = () => {
    if (period === 'custom' && customDateRange.start && customDateRange.end) {
      return `${new Date(customDateRange.start).toLocaleDateString('ru')} - ${new Date(customDateRange.end).toLocaleDateString('ru')}`;
    }
    return periodOptions.find(o => o.value === period)?.label || t('Последние 15 дней');
  };

  // Расчет интервала для оси X
  const xAxisInterval = useMemo(() => {
    if (graphData.length <= 15) return 0; // Показываем все метки
    if (graphData.length <= 30) return 1; // Показываем каждую вторую
    if (graphData.length <= 45) return 2; // Показываем каждую третью
    return Math.floor(graphData.length / 15); // Показываем ~15 меток
  }, [graphData.length]);

  return (
    <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 h-full">
      {/* Шапка */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#D77E6C]/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-[#D77E6C]" />
            </div>
            <h3 className="text-xl md:text-2xl font-medium text-gray-900">
              {t(title)}
            </h3>
          </div>
          <p className="text-gray-600 text-sm">{t(subtitle)}</p>
        </div>

        {/* Селектор периода */}
        {showPeriodSelector && !loading && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>{getPeriodLabel()}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 min-w-[200px]">
                {periodOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handlePeriodSelect(option.value)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-50 text-sm transition-colors flex items-center gap-2 ${
                      period === option.value && option.value !== 'custom'
                        ? 'bg-gray-50 text-[#D77E6C] font-medium'
                        : 'text-gray-700'
                    }`}
                  >
                    {option.value === 'custom' ? (
                      <CalendarRange className={`w-4 h-4 ${period === 'custom' ? 'text-[#D77E6C]' : 'text-gray-400'}`} />
                    ) : period === option.value ? (
                      <div className="w-2 h-2 bg-[#D77E6C] rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2"></div>
                    )}
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Модальное окно выбора периода */}
      {showDatePicker && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-50"
            onClick={() => setShowDatePicker(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl z-50 p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">{t('Выберите период')}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Начало периода')}
                </label>
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Конец периода')}
                </label>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                  min={customDateRange.start}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDatePicker(false)}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                {t('Отмена')}
              </button>
              <button
                onClick={handleCustomPeriodApply}
                disabled={!customDateRange.start || !customDateRange.end}
                className="flex-1 py-2.5 px-4 bg-[#D77E6C] hover:bg-[#C66B5A] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('Применить')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Статистика */}
      {showStats && !loading && graphData.length > 0 && (
        <div className="bg-gray-50 rounded-xl px-4 py-3 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500 mb-1">{t('Итого за период')}</p>
              {isClient && (
                <p className="text-lg font-bold text-gray-900">
                  {total.toLocaleString('ru-RU')} ₸
                </p>
              )}
            </div>
            {viewType === 'daily' && daysWithSales > 0 && (
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">{t('Дней с продажами')}</p>
                <p className="text-lg font-bold text-gray-900">
                  {daysWithSales} / {graphData.length}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* График с состояниями загрузки */}
      <div className={`${showStats ? 'h-[250px] md:h-[300px]' : 'h-[300px] md:h-[350px]'} w-full relative bg-gray-50/50 rounded-xl p-4`}>
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#D77E6C]" />
            <p className="text-sm">{t('Загрузка данных...')}</p>
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-red-500 mb-2">⚠️</div>
            <p className="text-sm text-gray-600">{t('Ошибка загрузки данных')}</p>
            <p className="text-xs text-gray-400 mt-1">{error}</p>
          </div>
        ) : graphData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={graphData}
              margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
              onMouseMove={s => {
                if (!s.isTooltipActive || s.activeTooltipIndex === undefined) {
                  setActiveIndex(null);
                  return;
                }
                const idx = Number(s.activeTooltipIndex);
                setActiveIndex(isNaN(idx) ? null : idx);
              }}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#6b7280' }}
                dy={10}
                interval={xAxisInterval}
                angle={graphData.length > 20 ? -45 : 0}
                textAnchor={graphData.length > 20 ? "end" : "middle"}
                height={graphData.length > 20 ? 60 : 40}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={formatYAxis}
                dx={-10}
              />
              <Tooltip
                cursor={{ fill: 'rgba(215, 126, 108, 0.05)' }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload[0]) return null;
                  return (
                    <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">{payload[0].payload.fullDate}</p>
                      <p className="text-sm font-bold text-gray-900">
                        {Number(payload[0].value).toLocaleString('ru-RU')} ₸
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {graphData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === activeIndex ? colorLine : colorBar}
                    style={{
                      filter: i === activeIndex ? 'drop-shadow(0 4px 6px rgba(215, 126, 108, 0.2))' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <div className="mb-2 text-3xl">📊</div>
            <p className="text-sm">{t('Нет данных для отображения')}</p>
            <p className="text-xs text-gray-400 mt-1">
              {viewType === 'daily' 
                ? t('Данные появятся после первых продаж в этом периоде')
                : t('Данные появятся после первых продаж')
              }
            </p>
          </div>
        )}

        {/* Линия тренда (только если больше 1 точки) */}
        {!loading && !error && graphData.length > 1 && (
          <ResponsiveContainer
            width="100%"
            height="100%"
            className="absolute top-0 left-0 pointer-events-none"
          >
            <LineChart data={graphData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
              <Line
                type="monotone"
                dataKey="lineValue"
                stroke={colorLine}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: colorLine, r: 3 }}
                activeDot={{ r: 5 }}
                isAnimationActive={true}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Легенда */}
      {!loading && graphData.length > 0 && (
        <div className="flex flex-wrap items-center gap-6 mt-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: colorBar }}></div>
            <span>
              {viewType === 'daily' ? t('Доход за день') : t('Доход за месяц')}
            </span>
          </div>
          {graphData.length > 1 && (
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-0.5"
                style={{
                  backgroundImage: `repeating-linear-gradient(to right, ${colorLine} 0, ${colorLine} 4px, transparent 4px, transparent 8px)`
                }}
              />
              <span>{t('Линия тренда')}</span>
            </div>
          )}
          <div className="ml-auto flex items-center gap-1 text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>{getPeriodLabel()}</span>
          </div>
        </div>
      )}
    </div>
  );
};