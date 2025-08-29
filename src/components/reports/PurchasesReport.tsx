"use client";

import React, { useState } from "react";
import { ShoppingBag, Download, Calendar } from "lucide-react";
import { useTranslate } from "@/hooks/useTranslate";

export type Period = "all" | "last6" | "thisYear" | "prevYear";

interface Purchase {
  avatar: string;
  name: string;
  product: string;
  date: string;
  id: string;
  amount: string;
  status: 'Оплачен' | 'Возврат';
}

const samplePurchases: Purchase[] = [
  {
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan',
    name: 'Иван Иванов',
    product: 'Product A',
    date: '01-07-2025',
    id: 'PR12345',
    amount: '10 000₸',
    status: 'Оплачен',
  },
  {
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    name: 'Мария Петрова',
    product: 'Product B',
    date: '15-06-2025',
    id: 'PR12346',
    amount: '15 500₸',
    status: 'Возврат',
  },
  {
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alexey',
    name: 'Алексей Сидоров',
    product: 'Product C',
    date: '10-06-2025',
    id: 'PR12347',
    amount: '22 000₸',
    status: 'Оплачен',
  },
  {
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
    name: 'Елена Козлова',
    product: 'Product D',
    date: '05-06-2025',
    id: 'PR12348',
    amount: '8 500₸',
    status: 'Оплачен',
  },
];

interface PurchasesReportProps {
  period?: Period;
  onPeriodChange?: (period: Period) => void;
}

const periodOptions = [
  { value: "all",      label: "За всё время" },
  { value: "last6",    label: "6 месяцев" },
  { value: "thisYear", label: "Текущий год" },
  { value: "prevYear", label: "Прошлый год" },
];

const MobilePurchaseCard: React.FC<{ purchase: Purchase }> = ({ purchase }) => {
  const { t } = useTranslate();
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={purchase.avatar}
            alt={purchase.name} // имена людей не переводим
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-medium text-sm">{purchase.name}</p>
            <p className="text-xs text-gray-500">{purchase.product}</p>
          </div>
        </div>
        {purchase.status === 'Оплачен' ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-green-700">{t('Оплачен')}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 rounded-lg">
            <svg className="w-3 h-3 text-red-500" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM4.7 4.7a.75.75 0 0 1 1.06 0L8 6.94l2.24-2.24a.75.75 0 1 1 1.06 1.06L9.06 8l2.24 2.24a.75.75 0 1 1-1.06 1.06L8 9.06l-2.24 2.24a.75.75 0 0 1-1.06-1.06L6.94 8 4.7 5.76a.75.75 0 0 1 0-1.06z"/>
            </svg>
            <span className="text-xs font-medium text-red-700">{t('Возврат')}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">{t('ID')}</span>
          <span className="font-mono">{purchase.id}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">{t('Дата')}</span>
          <span>{purchase.date}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-xs text-gray-500">{t('Сумма')}</span>
          <span className="font-semibold text-base">{purchase.amount}</span>
        </div>
      </div>
    </div>
  );
};

export default function PurchasesReport({
  period = "all",
  onPeriodChange = () => {}
}: PurchasesReportProps) {
  const { t } = useTranslate();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>(period);

  const handlePeriodChange = (newPeriod: Period) => {
    setSelectedPeriod(newPeriod);
    onPeriodChange(newPeriod);
  };

  const totalAmount = samplePurchases
    .filter(p => p.status === 'Оплачен')
    .reduce((sum, p) => sum + parseInt(p.amount.replace(/[^\d]/g, '')), 0);

  return (
    <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-4 md:p-6">
      {/* Шапка */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(215, 126, 108, 0.1)' }}>
              <ShoppingBag className="w-5 h-5" style={{ color: '#D77E6C' }} />
            </div>
            <h3 className="text-xl md:text-2xl font-medium text-gray-900">
              {t('Отчет по покупкам')}
            </h3>
          </div>
          <p className="text-gray-600 text-sm">
            {t('История покупок и возвратов')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">{t('Общая сумма')}</p>
            <p className="text-lg md:text-xl font-bold" style={{ color: '#D77E6C' }}>
              {totalAmount.toLocaleString('ru-KZ')}₸
            </p>
          </div>
          <button
            className="flex items-center justify-center gap-2 text-white px-4 py-3 rounded-xl transition-colors"
            style={{ backgroundColor: '#D77E6C' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C66B5A')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#D77E6C')}
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">{t('Скачать')}</span>
          </button>
        </div>
      </div>

      {/* Переключатель периода */}
      <div className="overflow-x-auto mb-6">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit min-w-full sm:min-w-0">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handlePeriodChange(option.value as Period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                selectedPeriod === option.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {t(option.label)}
            </button>
          ))}
        </div>
      </div>

      {/* Мобильная версия */}
      <div className="md:hidden">
        {samplePurchases.map((purchase, idx) => (
          <MobilePurchaseCard key={idx} purchase={purchase} />
        ))}
      </div>

      {/* Десктопная версия */}
      <div className="hidden md:block overflow-hidden rounded-xl bg-white border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">
                  {t('Клиент')}
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  {t('Товар')}
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {t('Дата')}
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  {t('ID')}
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  {t('Сумма')}
                </th>
                <th className="text-center py-3 px-6 font-medium text-gray-700 text-sm">
                  {t('Статус')}
                </th>
              </tr>
            </thead>
            <tbody>
              {samplePurchases.map((purchase, idx) => (
                <tr
                  key={idx}
                  className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={purchase.avatar}
                        alt={purchase.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <p className="font-medium text-gray-900">{purchase.name}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                      {purchase.product}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {purchase.date}
                  </td>
                  <td className="py-4 px-4">
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-700">
                      {purchase.id}
                    </code>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-gray-900">
                      {purchase.amount}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-center">
                      {purchase.status === 'Оплачен' ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-green-700">
                            {t('Оплачен')}
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                          <svg className="w-3 h-3 text-red-500" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM4.7 4.7a.75.75 0 0 1 1.06 0L8 6.94l2.24-2.24a.75.75 0 1 1 1.06 1.06L9.06 8l2.24 2.24a.75.75 0 1 1-1.06 1.06L8 9.06l-2.24 2.24a.75.75 0 0 1-1.06-1.06L6.94 8 4.7 5.76a.75.75 0 0 1 0-1.06z"/>
                          </svg>
                          <span className="text-sm font-medium text-red-700">
                            {t('Возврат')}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Пагинация */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
        <p className="text-center sm:text-left">
          {t('Показано {n} записей').replace('{n}', String(samplePurchases.length))}
        </p>
        <div className="flex gap-1">
          <button className="px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Prev">
            ←
          </button>
          <button
            className="px-3 py-1.5 rounded-lg text-white"
            style={{ backgroundColor: '#D77E6C' }}
            aria-current="page"
          >
            1
          </button>
          <button className="px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">2</button>
          <button className="px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">3</button>
          <button className="px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Next">
            →
          </button>
        </div>
      </div>
    </div>
  );
}
