'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  Tooltip,
  Cell,
} from 'recharts';

export type MonthValue = {
  date: Date;
  value: number;
};

export type TurnoverChartProps = {
  data: MonthValue[];
  colorBar?: string;
  colorLine?: string;
  lineOffset?: number;
};

export const TurnoverChart: React.FC<TurnoverChartProps> = ({
  data,
  colorBar = '#E9D7D6',
  colorLine = '#DB6A56',
  lineOffset = 300000,
}) => {
  const [period, setPeriod] = useState<'all' | 'last6' | 'thisYear' | 'prevYear'>('all');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Фильтруем по периоду
  const filtered = useMemo(() => {
    const now = new Date();
    switch (period) {
      case 'last6':
        return [...data].sort((a, b) => a.date.getTime() - b.date.getTime()).slice(-6);
      case 'thisYear':
        return data.filter(d => d.date.getFullYear() === now.getFullYear());
      case 'prevYear':
        return data.filter(d => d.date.getFullYear() === now.getFullYear() - 1);
      case 'all':
      default:
        return data;
    }
  }, [data, period]);

  const graphData = filtered.map(d => ({
    month: d.date.toLocaleString('ru', { month: 'short' }),
    value: d.value,
    lineValue: d.value + lineOffset,
  }));

  const total = useMemo(() => {
    return graphData.reduce((sum, d) => sum + d.value, 0);
  }, [graphData]);

  return (
    <div className="relative">
      {/* Селектор периода */}
      <div className="absolute top-6 right-6">
        <select
          value={period}
          onChange={e => setPeriod(e.target.value as any)}
          className="bg-gray-100 text-gray-700 text-sm rounded-full py-1 px-3"
        >
          <option value="all">За всё время</option>
          <option value="last6">Последние 6 мес.</option>
          <option value="thisYear">Текущий год</option>
          <option value="prevYear">Прошлый год</option>
        </select>
      </div>

      {/* Сумма */}
      <div className="mb-4">
        <p className="text-sm text-gray-500">Заработок от товарооборота</p>
        {isClient && (
          <h2 className="text-2xl font-bold text-gray-800">
            {total.toLocaleString()} ₸
          </h2>
        )}
      </div>

      {/* График */}
      <div className="h-[200px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={graphData}
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
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
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: '#555' }}
            />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              content={({ active, payload, coordinate }) => {
                if (!active || !payload || !coordinate) return null;
                return (
                  <div
                    className="absolute z-20 px-3 py-1 rounded bg-gray-900 text-white text-xs whitespace-nowrap"
                    style={{
                      transform: `translate(${coordinate.x - 30}px, ${coordinate.y - 40}px)`,
                    }}
                  >
                    {payload[0].value.toLocaleString()} ₸
                  </div>
                );
              }}
            />
            <Bar dataKey="value" radius={4}>
              {graphData.map((_, i) => (
                <Cell key={i} fill={i === activeIndex ? colorLine : colorBar} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Линия */}
        <ResponsiveContainer
          width="100%"
          height="100%"
          className="absolute top-0 left-0 pointer-events-none"
        >
          <LineChart data={graphData}>
            <Line
              type="monotone"
              dataKey="lineValue"
              stroke={colorLine}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
