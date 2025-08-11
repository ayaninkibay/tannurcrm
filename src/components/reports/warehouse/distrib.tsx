'use client';

import React from 'react';

export interface DistribItem {
  name: string;
  qty: number | string;
  total: string;
  region: string;
}

interface DistribProps {
  items: DistribItem[];
  onRowClick?: (item: DistribItem) => void;
}

export default function Distrib({ items, onRowClick }: DistribProps) {
  return (
    <>
      {/* Заголовок таблицы */}
      <div className="flex items-center text-gray-400 text-sm border-b pb-2">
        <div className="grid grid-cols-5 gap-4 w-full text-xs">
          <div className="text-left">Имя</div>
          <div className="text-left">Кол-во</div>
          <div className="text-left">Общая сумма</div>
          <div className="text-left">Регион</div>
          <div className="text-right">Инфо</div>
        </div>
      </div>

      {/* Список */}
      <div className="space-y-2">
        {items.map((it, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100"
            onClick={() => onRowClick?.(it)}
          >
            <div className="grid grid-cols-5 gap-4 items-center">
              <div className="font-medium text-sm text-black">{it.name}</div>
              <div className="text-sm text-black">{it.qty} шт</div>
              <div className="text-sm font-medium text-black">{it.total}</div>
              <div className="text-sm text-black">{it.region}</div>
              <div className="text-right">
                <button className="text-orange-500 hover:text-orange-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
