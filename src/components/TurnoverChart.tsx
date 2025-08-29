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
import { TrendingUp, Calendar, ChevronDown, CalendarRange } from 'lucide-react';
import { useTranslate } from '@/hooks/useTranslate';

export type MonthValue = {
  date: Date;
  value: number;
};

export type TurnoverChartProps = {
  title?: string;
  subtitle?: string;
  data: MonthValue[];
  colorBar?: string;
  colorLine?: string;
  lineOffset?: number;
  showPeriodSelector?: boolean;
  showStats?: boolean;
};

type PeriodType = 'all' | 'last6' | 'thisYear' | 'prevYear' | 'custom';

export const TurnoverChart: React.FC<TurnoverChartProps> = ({
  // дефолт — русские ключи; отображение через t(...) ниже
  title = 'Товарооборот',
  subtitle = 'Динамика продаж за период',
  data,
  colorBar = '#FFE5E1',
  colorLine = '#D77E6C',
  lineOffset = 300000,
  showPeriodSelector = true,
  showStats = true,
}) => {
  const { t } = useTranslate();

  const [period, setPeriod] = useState<PeriodType>('all');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setIsClient(true); }, []);

  // Пункты периода (моки) — показываем через t(...)
  const periodOptions = useMemo(() => ([
    { value: 'all' as PeriodType,      label: t('За всё время') },
    { value: 'last6' as PeriodType,    label: t('6 месяцев') },
    { value: 'thisYear' as PeriodType, label: t('Текущий год') },
    { value: 'prevYear' as PeriodType, label: t('Прошлый год') },
    { value: 'custom' as PeriodType,   label: t('Выбрать период') },
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

  // Фильтруем по периоду
  const filtered = useMemo(() => {
    if (!data || data.length === 0) return [];
    const now = new Date();
    let result = [...data];

    switch (period) {
      case 'last6':
        result = [...data].sort((a, b) => a.date.getTime() - b.date.getTime()).slice(-6);
        break;
      case 'thisYear':
        result = data.filter(d => d.date.getFullYear() === now.getFullYear());
        break;
      case 'prevYear':
        result = data.filter(d => d.date.getFullYear() === now.getFullYear() - 1);
        break;
      case 'custom':
        if (customDateRange.start && customDateRange.end) {
          const startDate = new Date(customDateRange.start);
          const endDate = new Date(customDateRange.end);
          endDate.setHours(23, 59, 59, 999);
          result = data.filter(d => {
            const date = new Date(d.date);
            return date >= startDate && date <= endDate;
          });
        }
        break;
      case 'all':
      default:
        result = data;
        break;
    }
    return result;
  }, [data, period, customDateRange]);

  const graphData = useMemo(() => {
    return filtered.map(d => ({
      month: d.date.toLocaleString('ru', { month: 'short' }), // формат даты оставляем
      value: d.value,
      lineValue: d.value + lineOffset,
    }));
  }, [filtered, lineOffset]);

  const total = useMemo(() => graphData.reduce((sum, d) => sum + d.value, 0), [graphData]);

  const growthRate = useMemo(() => {
    if (graphData.length < 2) return 0;
    const lastMonth = graphData[graphData.length - 1]?.value || 0;
    const prevMonth = graphData[graphData.length - 2]?.value || 0;
    if (prevMonth === 0) return 0;
    return ((lastMonth - prevMonth) / prevMonth * 100).toFixed(1);
  }, [graphData]);

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
    return periodOptions.find(o => o.value === period)?.label || t('За всё время');
  };

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
        {showPeriodSelector && (
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
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 min-w-[180px]">
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
      {showStats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">{t('Общий доход')}</p>
            {isClient && (
              <p className="text-xl md:text-2xl font-bold text-gray-900">
                {total.toLocaleString('ru-RU')} ₸
              </p>
            )}
          </div>
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">{t('Средний чек')}</p>
            {isClient && (
              <p className="text-xl md:text-2xl font-bold text-gray-900">
                {graphData.length > 0
                  ? Math.round(total / graphData.length).toLocaleString('ru-RU')
                  : 0} ₸
              </p>
            )}
          </div>
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">{t('Прирост')}</p>
            {isClient && (
              <p
                className={`text-xl md:text-2xl font-bold ${
                  Number(growthRate) > 0
                    ? 'text-green-600'
                    : Number(growthRate) < 0
                    ? 'text-red-600'
                    : 'text-gray-900'
                }`}
              >
                {Number(growthRate) > 0 ? '+' : ''}{growthRate}%
              </p>
            )}
          </div>
        </div>
      )}

      {/* График */}
      <div className={`${showStats ? 'h-[250px] md:h-[300px]' : 'h-[300px] md:h-[350px]'} w-full relative bg-gray-50/50 rounded-xl p-4`}>
        {graphData.length > 0 ? (
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
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                dy={10}
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
                      <p className="text-xs text-gray-500 mb-1">{payload[0].payload.month}</p>
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
          <div className="h-full flex items-center justify-center text-gray-500">
            {t('Нет данных для отображения')}
          </div>
        )}

        {/* Линия тренда */}
        {graphData.length > 0 && (
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
      <div className="flex flex-wrap items-center gap-6 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: colorBar }}></div>
          <span>{t('Доход за месяц')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-0.5"
            style={{
              backgroundImage: `repeating-linear-gradient(to right, ${colorLine} 0, ${colorLine} 4px, transparent 4px, transparent 8px)`
            }}
          />
          <span>{t('Линия тренда')}</span>
        </div>
        <div className="ml-auto flex items-center gap-1 text-gray-400">
          <Calendar className="w-3 h-3" />
          <span>
            {t('Период: {label}').replace('{label}', getPeriodLabel())}
          </span>
        </div>
      </div>
    </div>
  );
};

// Варианты экспорта
export const TurnoverChartWithStats: React.FC<Omit<TurnoverChartProps, 'showStats'>> = (props) => (
  <TurnoverChart {...props} showStats={true} />
);

export const TurnoverChartCompact: React.FC<Omit<TurnoverChartProps, 'showStats'>> = (props) => (
  <TurnoverChart {...props} showStats={false} />
);
