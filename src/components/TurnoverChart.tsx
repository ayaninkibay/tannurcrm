'use client';

import React, { useState } from 'react';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  Tooltip,
  Cell
} from 'recharts';

type MonthValue = {
  month: string;
  value: number;
};

type TurnoverChartProps = {
  data: MonthValue[];
  colorBar?: string;
  colorLine?: string;
  lineOffset?: number;
  period?: 'last6' | 'last12' | `year=${number}`;
};

export const TurnoverChart: React.FC<TurnoverChartProps> = ({
  data,
  colorBar = '#e9d7d6',
  colorLine = '#db6a56',
  lineOffset = 300000,
  period = 'last6'
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Добавляем lineValue для отступа линии
  const graphData = data.map((item) => ({
    ...item,
    lineValue: item.value + lineOffset,
  }));

  return (
    <div className="h-[200px] w-full relative">
      {/* Первый слой: Барчарт */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={graphData}
          margin={{ top: 50, right: 30, left: 0, bottom: 0 }}
          onMouseMove={(state) => {
            if (state.isTooltipActive) {
              const index = Number(state.activeTooltipIndex);
              setActiveIndex(!isNaN(index) ? index : null);
            }
          }}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 14, fill: '#555' }}
          />
         <Tooltip
  cursor={{ fill: 'transparent' }}
  content={({ active, payload, coordinate }) => {
    if (!active || !payload || !coordinate) return null;

    const value = payload[0]?.value;
    const x = coordinate.x;
    const y = coordinate.y;

    return (
      <div
        className="absolute z-20 px-3 py-1 rounded-full bg-gray-900 text-white text-xs"
        style={{
          transform: `translate(${x - 30}px, ${y - 40}px)`,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        {value.toLocaleString()} ₸
      </div>
    );
  }}
/>

          <Bar dataKey="value" radius={[8, 8, 8, 8]}>
            {graphData.map((entry, index) => (
              <Cell
                key={`bar-${index}`}
                fill={index === activeIndex ? colorLine : colorBar}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Второй слой: Линия поверх */}
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
  );
};
