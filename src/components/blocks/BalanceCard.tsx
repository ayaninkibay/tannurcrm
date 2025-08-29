// Обновлённый компонент с i18n
'use client'

import React from 'react'
import {
  LogOut,
  History,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Wallet,
  Check
} from 'lucide-react'
import { useTranslate } from '@/hooks/useTranslate'

interface BalanceCardProps {
  balance: number | string
  variant?: 'light' | 'dark'
  size?: 'compact' | 'normal' | 'large'
}

// Декоративный компонент с точками
const DotsPattern = ({ className }: { className?: string }) => (
  <div className={`grid grid-cols-4 gap-1 opacity-10 ${className}`}>
    {[...Array(12)].map((_, i) => (
      <div key={i} className="w-1.5 h-1.5 bg-current rounded-sm"></div>
    ))}
  </div>
)

export default function BalanceCard({
  balance,
  variant = 'light',
  size = 'normal'
}: BalanceCardProps) {
  const { t } = useTranslate()
  const isDark = variant === 'dark'

  // Цветовые схемы
  const bgClass = isDark
    ? 'bg-[#3A3D43]'
    : 'bg-white'

  const labelClass = isDark ? 'text-gray-400' : 'text-gray-600'
  const amountClass = isDark ? 'text-white' : 'text-gray-900'

  // COMPACT версия - только баланс и быстрый вывод
  if (size === 'compact') {
    return (
      <div className={`
        relative flex items-center justify-between
        ${bgClass}
        rounded-xl p-4
      `}>
        <div>
          <p className={`${labelClass} text-xs mb-1`}>{t('Баланс')}</p>
          <h3 className={`text-lg font-bold ${amountClass}`}>
            {typeof balance === 'number' ? balance.toLocaleString('ru-RU') : balance} ₸
          </h3>
        </div>
        <a
          href="/dealer/payments"
          className="p-2 bg-[#D77E6C] hover:bg-[#C66B5A] text-white rounded-lg transition-colors"
          title={t('Вывод средств')}
        >
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    )
  }

  // NORMAL версия - баланс, статус и основные кнопки
  if (size === 'normal') {
    return (
      <div className={`
        relative flex flex-col h-full
        ${bgClass}
        rounded-xl md:rounded-2xl p-6
      `}>
        {/* Декор */}
        <div className={`absolute top-4 right-4 ${isDark ? 'text-gray-700' : 'text-gray-200'}`}>
          <Wallet className="w-5 h-5" />
        </div>

        {/* Основной контент */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Заголовок и баланс */}
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-green-400' : 'bg-green-500'}`}></div>
              <p className={`${labelClass} text-sm font-medium`}>
                {t('Ваш баланс')}
              </p>
            </div>

            <h2 className={`text-3xl font-bold ${amountClass} mb-2`}>
              {typeof balance === 'number' ? balance.toLocaleString('ru-RU') : balance} ₸
            </h2>

            {/* Статус вывода */}
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
              isDark ? 'bg-[#2D2F33] text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}>
              <Check className="w-4 h-4" />
              <span>{t('Доступно для вывода')}</span>
            </div>
          </div>

          {/* Кнопки - всегда внизу */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <a
              href="/dealer/payments"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#D77E6C] to-[#E09080] hover:from-[#C66B5A] hover:to-[#D77E6C] text-white py-2.5 rounded-xl transition-all duration-300 hover:shadow-md"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">{t('Вывод')}</span>
            </a>

            <a
              href="/dealer/payments"
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-300 hover:shadow-md ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="text-sm font-medium">{t('История')}</span>
            </a>
          </div>
        </div>
      </div>
    )
  }

  // LARGE версия - полная информация с аналитикой
  return (
    <div className={`
      relative flex flex-col
      ${bgClass}
      rounded-2xl p-8
    `}>
      {/* Декоративные элементы */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#D77E6C]/5 to-[#E09080]/5 rounded-full blur-3xl"></div>
      <div className={`absolute top-6 right-6 ${isDark ? 'text-gray-700' : 'text-gray-200'}`}>
        <DotsPattern className="w-16" />
      </div>

      <div className="relative z-10 flex flex-col">
        {/* Заголовок секции */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-lg font-semibold ${amountClass}`}>{t('Финансовая сводка')}</h2>
            <p className={`text-sm ${labelClass}`}>{t('Обновлено только что')}</p>
          </div>
          <div className={`p-2 rounded-lg ${isDark ? 'bg-[#2D2F33]' : 'bg-gray-100'}`}>
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        {/* Основной баланс */}
        <div className="mb-8">
          <p className={`${labelClass} text-sm mb-2`}>{t('Текущий баланс')}</p>
          <div className="flex items-baseline gap-4">
            <h2 className={`text-4xl font-bold ${amountClass}`}>
              {typeof balance === 'number' ? balance.toLocaleString('ru-RU') : balance} ₸
            </h2>
            <div className="flex items-center gap-1 text-green-500">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+12.5%</span>
            </div>
          </div>
        </div>

        {/* Статистика в 3 колонки */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-[#2D2F33]' : 'bg-gray-50'}`}>
            <p className={`text-xs ${labelClass} mb-1`}>{t('За месяц')}</p>
            <p className={`text-lg font-semibold ${amountClass}`}>245 000 ₸</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-500">+8%</span>
            </div>
          </div>

          <div className={`p-4 rounded-xl ${isDark ? 'bg-[#2D2F33]' : 'bg-gray-50'}`}>
            <p className={`text-xs ${labelClass} mb-1`}>{t('Выведено')}</p>
            <p className={`text-lg font-semibold ${amountClass}`}>125 000 ₸</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="w-3 h-3 text-orange-500" />
              <span className="text-xs text-orange-500">-5%</span>
            </div>
          </div>

          <div className={`p-4 rounded-xl ${isDark ? 'bg-[#2D2F33]' : 'bg-gray-50'}`}>
            <p className={`text-xs ${labelClass} mb-1`}>{t('В ожидании')}</p>
            <p className={`text-lg font-semibold ${amountClass}`}>45 000 ₸</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
              <span className="text-xs text-yellow-600">{t('обработка')}</span>
            </div>
          </div>
        </div>

        {/* Расширенные кнопки действий */}
        <div className="grid grid-cols-3 gap-3">
          <a
            href="/dealer/payments"
            className="flex flex-col items-center gap-2 bg-gradient-to-r from-[#D77E6C] to-[#E09080] hover:from-[#C66B5A] hover:to-[#D77E6C] text-white py-3 rounded-xl transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-medium">{t('Вывести')}</span>
          </a>

          <a
            href="/dealer/payments"
            className={`flex flex-col items-center gap-2 py-3 rounded-xl transition-all duration-300 hover:shadow-md ${
              isDark
                ? 'bg-[#2D2F33] hover:bg-gray-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <History className="w-4 h-4" />
            <span className="text-xs font-medium">{t('История')}</span>
          </a>

          <a
            href="/dealer/payments"
            className={`flex flex-col items-center gap-2 py-3 rounded-xl transition-all duration-300 hover:shadow-md ${
              isDark
                ? 'bg-[#2D2F33] hover:bg-gray-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">{t('Аналитика')}</span>
          </a>
        </div>
      </div>
    </div>
  )
}

// Примеры использования компонента
export function BalanceCardExamples() {
  const { t } = useTranslate()

  return (
    <div className="p-8 bg-gray-100 space-y-8">
      <div className="text-2xl font-bold mb-4">{t('Варианты BalanceCard с разным контентом')}</div>

      {/* Compact версия */}
      <div>
        <p className="mb-2 text-sm text-gray-600 font-medium">{t('Compact - минимальная информация для узких мест')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <BalanceCard balance={890020} size="compact" variant="light" />
          <BalanceCard balance={890020} size="compact" variant="dark" />
        </div>
      </div>

      {/* Normal версия */}
      <div>
        <p className="mb-2 text-sm text-gray-600 font-medium">{t('Normal - стандартная информация с кнопками')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BalanceCard balance={890020} size="normal" variant="light" />
          <BalanceCard balance={890020} size="normal" variant="dark" />
        </div>
      </div>

      {/* Large версия */}
      <div>
        <p className="mb-2 text-sm text-gray-600 font-medium">{t('Large - полная аналитика и история')}</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BalanceCard balance={890020} size="large" variant="light" />
          <BalanceCard balance={890020} size="large" variant="dark" />
        </div>
      </div>
    </div>
  )
}
