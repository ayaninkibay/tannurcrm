// utils/generateData.ts

import type { MonthValue } from '@/components/TurnoverChart';

export function generateMonthlyData(
  start: Date,
  monthsCount: number
): MonthValue[] {
  const result: MonthValue[] = [];
  for (let i = 0; i < monthsCount; i++) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + i);
    result.push({
      date: d,
      value: Math.floor(Math.random() * 1_000_000),
    });
  }
  return result;
}