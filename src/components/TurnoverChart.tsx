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
import { TrendingUp, Calendar, ChevronDown, CalendarRange, Loader2, RefreshCw } from 'lucide-react';

// =====================================================
// КЕШИРОВАНИЕ
// =====================================================
class TurnoverCache {
  private static CACHE_KEY = 'turnover_chart_cache';
  private static CACHE_TTL = 5 * 60 * 1000; // 5 минут

  static getCacheKey(userId: string, period: string, startDate?: string, endDate?: string): string {
    if (period === 'custom' && startDate && endDate) {
      return `${userId}_${period}_${startDate}_${endDate}`;
    }
    return `${userId}_${period}`;
  }

  static get(userId: string, period: string, startDate?: string, endDate?: string): any | null {
    try {
      const cache = JSON.parse(localStorage.getItem(this.CACHE_KEY) || '{}');
      const key = this.getCacheKey(userId, period, startDate, endDate);
      const item = cache[key];
      
      if (!item) return null;
      
      // Проверяем срок действия кеша
      if (Date.now() - item.timestamp > this.CACHE_TTL) {
        delete cache[key];
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }

  static set(userId: string, period: string, data: any, startDate?: string, endDate?: string): void {
    try {
      const cache = JSON.parse(localStorage.getItem(this.CACHE_KEY) || '{}');
      const key = this.getCacheKey(userId, period, startDate, endDate);
      
      // Ограничиваем размер кеша (максимум 20 записей)
      const keys = Object.keys(cache);
      if (keys.length >= 20) {
        // Удаляем самые старые записи
        keys.sort((a, b) => cache[a].timestamp - cache[b].timestamp);
        keys.slice(0, 5).forEach(k => delete cache[k]);
      }
      
      cache[key] = {
        data,
        timestamp: Date.now()
      };
      
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}

// =====================================================
// ТИПЫ
// =====================================================
const useTranslate = () => ({
  t: (key: string) => key
});

export type ChartDataPoint = {
  period_date: string;
  period_label: string;
  personal_amount: number;
  team_amount: number;
  total_amount: number;
  orders_count: number;
};

export type TurnoverChartProps = {
  title?: string;
  subtitle?: string;
  colorBar?: string;
  colorLine?: string;
  showPeriodSelector?: boolean;
  showStats?: boolean;
  userId?: string;
};

type PeriodType = 'last15Days' | 'thisMonth' | 'lastMonth' | 'last3Months' | 'last6Months' | 'thisYear' | 'all' | 'custom';

// =====================================================
// КОМПОНЕНТ
// =====================================================
export const TurnoverChart: React.FC<TurnoverChartProps> = ({
  title = 'Товарооборот',
  subtitle = 'Динамика продаж за период',
  colorBar = '#FFE5E1',
  colorLine = '#D77E6C',
  showPeriodSelector = true,
  showStats = true,
  userId
}) => {
  const { t } = useTranslate();

  // Состояния
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
  
  // Состояния для данных
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

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

  // Определение типа отображения и диапазона дат
  const { viewType, dateRange } = useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    
    let startDate: Date;
    let endDate: Date = now;
    let viewType: 'daily' | 'monthly' = 'daily';

    switch (period) {
      case 'last15Days':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 14);
        startDate.setHours(0, 0, 0, 0);
        viewType = 'daily';
        break;
        
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        viewType = 'daily';
        break;
        
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        endDate.setHours(23, 59, 59, 999);
        viewType = 'daily';
        break;
        
      case 'last3Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        startDate.setHours(0, 0, 0, 0);
        viewType = 'monthly';
        break;
        
      case 'last6Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        startDate.setHours(0, 0, 0, 0);
        viewType = 'monthly';
        break;
        
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0);
        viewType = 'monthly';
        break;
        
      case 'custom':
        if (customDateRange.start && customDateRange.end) {
          startDate = new Date(customDateRange.start);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(customDateRange.end);
          endDate.setHours(23, 59, 59, 999);
          const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          viewType = diffDays <= 45 ? 'daily' : 'monthly';
        } else {
          return { viewType: 'daily', dateRange: null };
        }
        break;
        
      case 'all':
      default:
        // Для "За всё время" начнём с года назад
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        viewType = 'monthly';
        break;
    }

    return { 
      viewType, 
      dateRange: { startDate, endDate }
    };
  }, [period, customDateRange]);

  // Загрузка данных с RPC функцией
  const fetchData = async (forceRefresh = false) => {
    if (!dateRange || !userId) return;

    setLoading(true);
    setError(null);
    setIsFromCache(false);

    try {
      // Проверяем кеш (если не принудительное обновление)
      if (!forceRefresh) {
        const cachedData = TurnoverCache.get(
          userId, 
          period, 
          customDateRange.start, 
          customDateRange.end
        );
        
        if (cachedData) {
          setChartData(cachedData);
          setIsFromCache(true);
          setLoading(false);
          return;
        }
      }

      // Импортируем Supabase клиент
      const { supabase } = await import('@/lib/supabase/client');
      
      // Получаем текущего пользователя если не передан
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      
      if (!targetUserId) {
        throw new Error('Пользователь не авторизован');
      }

      // Вызываем RPC функцию
      const { data, error } = await supabase.rpc('get_turnover_chart_data', {
        p_user_id: targetUserId,
        p_start_date: dateRange.startDate.toISOString(),
        p_end_date: dateRange.endDate.toISOString(),
        p_group_by: viewType,
        p_include_team: false
      });

      if (error) {
        console.error('RPC Error:', error);
        throw error;
      }

      // Сохраняем в кеш
      TurnoverCache.set(
        targetUserId, 
        period, 
        data || [], 
        customDateRange.start, 
        customDateRange.end
      );

      setChartData(data || []);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка данных при изменении параметров
  useEffect(() => {
    fetchData();
  }, [userId, period, dateRange]);

  // Подготовка данных для графика
  const graphData = useMemo(() => {
    return chartData.map(d => {
      const date = new Date(d.period_date);
      const value = d.personal_amount;
      
      return {
        label: viewType === 'daily' 
          ? date.getDate().toString()
          : date.toLocaleString('ru', { month: 'short', year: '2-digit' }),
        fullDate: viewType === 'daily'
          ? date.toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })
          : date.toLocaleString('ru', { month: 'long', year: 'numeric' }),
        value: value,
        lineValue: value
      };
    });
  }, [chartData, viewType]);

  // Статистика
  const stats = useMemo(() => {
    const total = graphData.reduce((sum, d) => sum + d.value, 0);
    return { total };
  }, [graphData]);

  // Форматирование оси Y
  const formatYAxis = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
    return value.toString();
  };

  // Обработка выбора периода
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
    if (graphData.length <= 15) return 0;
    if (graphData.length <= 30) return 1;
    if (graphData.length <= 45) return 2;
    return Math.floor(graphData.length / 15);
  }, [graphData.length]);

  return (
    <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 h-full">
      {/* Шапка */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-[#D77E6C]/10 rounded-lg">
              <TrendingUp className="w-4 h-4 text-[#D77E6C]" />
            </div>
            <h3 className="text-lg md:text-xl font-medium text-gray-900">
              {t(title)}
            </h3>
            {isFromCache && (
              <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 rounded">
                {t('из кеша')}
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm">{t(subtitle)}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Кнопка обновления */}
          {!loading && (
            <button
              onClick={() => fetchData(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={t('Обновить данные')}
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
          )}

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
        <div className="mb-4 bg-gray-50 rounded-xl px-4 py-2.5 flex justify-between items-center">
          <p className="text-xs text-gray-500">{t('Итого за период')}</p>
          {isClient && (
            <p className="text-lg font-bold text-gray-900">
              {stats.total.toLocaleString('ru-RU')} ₸
            </p>
          )}
        </div>
      )}

      {/* График */}
      <div className={`${showStats ? 'h-[220px] md:h-[260px]' : 'h-[260px] md:h-[300px]'} w-full relative bg-gray-50/50 rounded-xl p-3`}>
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
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">{data.fullDate}</p>
                      <p className="text-sm font-bold text-gray-900">
                        {Number(data.value).toLocaleString('ru-RU')} ₸
                      </p>
                    </div>
                  );
                }}
              />
                              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
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

        {/* Линия тренда */}
        {!loading && !error && graphData.length > 1 && (
          <ResponsiveContainer
            width="100%"
            height="100%"
            className="absolute top-0 left-0 pointer-events-none"
          >
            <LineChart data={graphData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <Line
                type="monotone"
                dataKey="lineValue"
                stroke={colorLine}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                isAnimationActive={true}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Легенда */}
      {!loading && graphData.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
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
            {isFromCache && (
              <span className="text-xs">• {t('кешировано')}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};