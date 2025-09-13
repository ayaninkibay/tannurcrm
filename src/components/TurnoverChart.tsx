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

type PeriodType = 'all' | 'last6' | 'thisYear' | 'prevYear' | 'custom';

export const TurnoverChart: React.FC<TurnoverChartProps> = ({
  title = 'Товарооборот',
  subtitle = 'Динамика продаж за период',
  data: propData,
  colorBar = '#FFE5E1',
  colorLine = '#D77E6C',
  lineOffset = 300000,
  showPeriodSelector = true,
  showStats = true,
  userId,
  dataType = 'personal',
  apiEndpoint = '/api/dealer/turnover'
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
  
  // Состояния для загрузки данных
  const [data, setData] = useState<MonthValue[]>(propData || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setIsClient(true); }, []);

  // Загрузка данных напрямую из Supabase
  useEffect(() => {
    // Если данные переданы через props, используем их
    if (propData && propData.length > 0) {
      console.log('Using prop data:', propData);
      setData(propData);
      return;
    }

    // Загружаем данные напрямую из базы
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

        let processedData: MonthValue[] = [];

        if (dataType === 'personal') {
          // Загружаем личные заказы - ТОЛЬКО из таблицы orders
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
          console.log('Orders data:', orders);

          if (orders && orders.length > 0) {
            // Группируем по месяцам
            const monthlyData: { [key: string]: number } = {};
            
            orders.forEach(order => {
              const date = new Date(order.created_at);
              const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              
              // Используем только total_amount из таблицы orders
              const orderTotal = order.total_amount || 0;
              
              console.log(`Order ${order.id}: date=${order.created_at}, total=${orderTotal}`);
              
              if (orderTotal > 0) {
                if (!monthlyData[monthKey]) {
                  monthlyData[monthKey] = 0;
                }
                monthlyData[monthKey] += orderTotal;
              }
            });

            console.log('Monthly data:', monthlyData);

            // Преобразуем в массив MonthValue
            processedData = Object.entries(monthlyData)
              .map(([monthKey, value]) => {
                const [year, month] = monthKey.split('-');
                return {
                  date: new Date(parseInt(year), parseInt(month) - 1, 1),
                  value: value
                };
              })
              .sort((a, b) => a.date.getTime() - b.date.getTime());
          }
          
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

          console.log('Team purchases found:', purchases?.length || 0);

          if (purchases && purchases.length > 0) {
            const monthlyData: { [key: string]: number } = {};
            
            purchases.forEach(purchase => {
              if (purchase.completed_at && purchase.paid_amount) {
                const date = new Date(purchase.completed_at);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                
                if (!monthlyData[monthKey]) {
                  monthlyData[monthKey] = 0;
                }
                monthlyData[monthKey] += purchase.paid_amount;
              }
            });

            processedData = Object.entries(monthlyData)
              .map(([monthKey, value]) => {
                const [year, month] = monthKey.split('-');
                return {
                  date: new Date(parseInt(year), parseInt(month) - 1, 1),
                  value: value
                };
              })
              .sort((a, b) => a.date.getTime() - b.date.getTime());
          }
        }

        console.log('Processed data:', processedData);
        setData(processedData);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propData, userId, dataType]);

  // Логирование для отладки
  useEffect(() => {
    console.log('Current data state:', {
      dataLength: data?.length,
      firstItem: data?.[0],
      loading,
      error
    });
  }, [data, loading, error]);

  // Пункты периода
  const periodOptions = useMemo(() => ([
    { value: 'all' as PeriodType, label: t('За всё время') },
    { value: 'last6' as PeriodType, label: t('6 месяцев') },
    { value: 'thisYear' as PeriodType, label: t('Текущий год') },
    { value: 'prevYear' as PeriodType, label: t('Прошлый год') },
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
      month: d.date.toLocaleString('ru', { month: 'short', year: '2-digit' }),
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
      {showStats && !loading && graphData.length > 0 && (
        <div className="bg-gray-50 rounded-xl px-4 py-3 mb-6">
          <p className="text-xs text-gray-500 mb-1">{t('Итого за период')}</p>
          {isClient && (
            <p className="text-lg font-bold text-gray-900">
              {total.toLocaleString('ru-RU')} ₸
            </p>
          )}
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
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <div className="mb-2 text-3xl">📊</div>
            <p className="text-sm">{t('Нет данных для отображения')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('Данные появятся после первых продаж')}</p>
          </div>
        )}

        {/* Линия тренда */}
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
              {t('Период:')} {getPeriodLabel()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Демо компонент для тестирования
export default function TurnoverChartDemo() {
  const [selectedUserId, setSelectedUserId] = useState<string>('33542896-acc2-41a6-ade3-1b6fb45e4e96');
  
  // Эти ID из вашего скриншота
  const userIds = [
    '33542896-acc2-41a6-ade3-1b6fb45e4e96',
    '54d376a4-7ad5-404f-b30f-fac955e70007'
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold mb-4">Выберите пользователя:</h2>
          <select 
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {userIds.map(id => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-8">
          <TurnoverChart 
            title="Личный товарооборот"
            subtitle="Ваши личные продажи"
            userId={selectedUserId}
            dataType="personal"
            showStats={true}
            colorBar="#FFE5E1"
            colorLine="#D77E6C"
          />
          
          <TurnoverChart 
            title="Командный товарооборот"
            subtitle="Продажи вашей команды"
            userId={selectedUserId}
            dataType="team"
            showStats={true}
            colorBar="#E1F0FF"
            colorLine="#6C9BD7"
          />
        </div>
      </div>
    </div>
  );
}