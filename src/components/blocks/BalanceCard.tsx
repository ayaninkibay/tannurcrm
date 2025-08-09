'use client'

import React from 'react'

interface BalanceCardProps {
  balance: number | string
  variant?: 'light' | 'dark'
  size?: 'compact' | 'normal' | 'large'
}

// SVG иконки
const WithdrawIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 16L21 12L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 16V19C15 19.5304 14.7893 20.0391 14.4142 20.4142C14.0391 20.7893 13.5304 21 13 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const HistoryIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.05 11C3.55 5.94 7.76 2 12.95 2C18.48 2 23 6.52 23 12C23 17.48 18.48 22 12.95 22C9.39 22 6.28 20.03 4.68 17.11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 17L4.68 17.11L7 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const TrendUpIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 6H23V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const TrendDownIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23 18L13.5 8.5L8.5 13.5L1 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 18H23V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ArrowRightIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const WalletIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1 10H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const CheckIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

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
  const isDark = variant === 'dark'
  
  // Цветовые схемы
  const bgClass = isDark 
    ? 'bg-[#3A3D43]' 
    : 'bg-white'
  
  const labelClass = isDark ? 'text-gray-400' : 'text-gray-600'
  const amountClass = isDark ? 'text-white' : 'text-gray-900'
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-100'

  // COMPACT версия - только баланс и быстрый вывод
  if (size === 'compact') {
    return (
      <div className={`
        relative flex items-center justify-between
        ${bgClass} 
        rounded-xl p-4
        
        
      `}>
        <div>
          <p className={`${labelClass} text-xs mb-1`}>Баланс</p>
          <h3 className={`text-lg font-bold ${amountClass}`}>
            {typeof balance === 'number' ? balance.toLocaleString('ru-RU') : balance} ₸
          </h3>
        </div>
        
        <a
          href="/dealer/payments"
          className="p-2 bg-[#D77E6C] hover:bg-[#C66B5A] text-white rounded-lg transition-colors"
          title="Вывод средств"
        >
          <ArrowRightIcon />
        </a>
      </div>
    )
  }

  // NORMAL версия - баланс, статус и основные кнопки
  if (size === 'normal') {
    return (
      <div className={`
        relative flex flex-col
        ${bgClass} 
        rounded-xl md:rounded-2xl p-6
       
        
      `}>
        {/* Декор */}
        <div className={`absolute top-4 right-4 ${isDark ? 'text-gray-700' : 'text-gray-200'}`}>
          <WalletIcon />
        </div>

        {/* Основной контент */}
        <div className="relative z-10 flex flex-col">
          {/* Заголовок и баланс */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-green-400' : 'bg-green-500'}`}></div>
              <p className={`${labelClass} text-sm font-medium`}>
                Ваш баланс
              </p>
            </div>
            
            <h2 className={`text-3xl font-bold ${amountClass} mb-2`}>
              {typeof balance === 'number' ? balance.toLocaleString('ru-RU') : balance} ₸
            </h2>
            
            {/* Статус вывода */}
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
              isDark ? 'bg-[#2D2F33] text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}>
              <CheckIcon />
              <span>Доступно для вывода</span>
            </div>
          </div>

          {/* Кнопки */}
          <div className="grid grid-cols-2 gap-3 mt-2 sm:mt-10">
            <a
              href="/dealer/payments"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#D77E6C] to-[#E09080] hover:from-[#C66B5A] hover:to-[#D77E6C] text-white py-2.5 rounded-xl transition-all duration-300 hover:shadow-md"
            >
              <WithdrawIcon />
              <span className="text-sm font-medium">Вывод</span>
            </a>

            <a
              href="/dealer/payments"
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-300 hover:shadow-md ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <HistoryIcon />
              <span className="text-sm font-medium">История</span>
            </a>
          </div>
        </div>
      </div>
    )
  }

  // LARGE версия - полная информация с аналитикой (без динамики и последних операций)
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
            <h2 className={`text-lg font-semibold ${amountClass}`}>Финансовая сводка</h2>
            <p className={`text-sm ${labelClass}`}>Обновлено только что</p>
          </div>
          <div className={`p-2 rounded-lg ${isDark ? 'bg-[#2D2F33]' : 'bg-gray-100'}`}>
            <WalletIcon />
          </div>
        </div>

        {/* Основной баланс */}
        <div className="mb-8">
          <p className={`${labelClass} text-sm mb-2`}>Текущий баланс</p>
          <div className="flex items-baseline gap-4">
            <h2 className={`text-4xl font-bold ${amountClass}`}>
              {typeof balance === 'number' ? balance.toLocaleString('ru-RU') : balance} ₸
            </h2>
            <div className="flex items-center gap-1 text-green-500">
              <TrendUpIcon />
              <span className="text-sm font-medium">+12.5%</span>
            </div>
          </div>
        </div>

        {/* Статистика в 3 колонки */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-[#2D2F33]' : 'bg-gray-50'}`}>
            <p className={`text-xs ${labelClass} mb-1`}>За месяц</p>
            <p className={`text-lg font-semibold ${amountClass}`}>245 000 ₸</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendUpIcon className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-500">+8%</span>
            </div>
          </div>
          
          <div className={`p-4 rounded-xl ${isDark ? 'bg-[#2D2F33]' : 'bg-gray-50'}`}>
            <p className={`text-xs ${labelClass} mb-1`}>Выведено</p>
            <p className={`text-lg font-semibold ${amountClass}`}>125 000 ₸</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendDownIcon className="w-3 h-3 text-orange-500" />
              <span className="text-xs text-orange-500">-5%</span>
            </div>
          </div>
          
          <div className={`p-4 rounded-xl ${isDark ? 'bg-[#2D2F33]' : 'bg-gray-50'}`}>
            <p className={`text-xs ${labelClass} mb-1`}>В ожидании</p>
            <p className={`text-lg font-semibold ${amountClass}`}>45 000 ₸</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
              <span className="text-xs text-yellow-600">обработка</span>
            </div>
          </div>
        </div>

        {/* Расширенные кнопки действий */}
        <div className="grid grid-cols-3 gap-3">
          <a
            href="/dealer/payments"
            className="flex flex-col items-center gap-2 bg-gradient-to-r from-[#D77E6C] to-[#E09080] hover:from-[#C66B5A] hover:to-[#D77E6C] text-white py-3 rounded-xl transition-all duration-300"
          >
            <WithdrawIcon />
            <span className="text-xs font-medium">Вывести</span>
          </a>

          <a
            href="/dealer/payments"
            className={`flex flex-col items-center gap-2 py-3 rounded-xl transition-all duration-300 hover:shadow-md ${
              isDark 
                ? 'bg-[#2D2F33] hover:bg-gray-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <HistoryIcon />
            <span className="text-xs font-medium">История</span>
          </a>

          <a
            href="/dealer/payments"
            className={`flex flex-col items-center gap-2 py-3 rounded-xl transition-all duration-300 hover:shadow-md ${
              isDark 
                ? 'bg-[#2D2F33] hover:bg-gray-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <TrendUpIcon />
            <span className="text-xs font-medium">Аналитика</span>
          </a>
        </div>
      </div>
    </div>
  )
}

// Примеры использования компонента
export function BalanceCardExamples() {
  return (
    <div className="p-8 bg-gray-100 space-y-8">
      <div className="text-2xl font-bold mb-4">Варианты BalanceCard с разным контентом</div>
      
      {/* Compact версия */}
      <div>
        <p className="mb-2 text-sm text-gray-600 font-medium">Compact - минимальная информация для узких мест</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <BalanceCard balance={890020} size="compact" variant="light" />
          <BalanceCard balance={890020} size="compact" variant="dark" />
        </div>
      </div>

      {/* Normal версия */}
      <div>
        <p className="mb-2 text-sm text-gray-600 font-medium">Normal - стандартная информация с кнопками</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BalanceCard balance={890020} size="normal" variant="light" />
          <BalanceCard balance={890020} size="normal" variant="dark" />
        </div>
      </div>

      {/* Large версия */}
      <div>
        <p className="mb-2 text-sm text-gray-600 font-medium">Large - полная аналитика и история</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BalanceCard balance={890020} size="large" variant="light" />
          <BalanceCard balance={890020} size="large" variant="dark" />
        </div>
      </div>
    </div>
  )
}