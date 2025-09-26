// components/blocks/BalanceCard.tsx
'use client'

import React, { useState, useEffect } from 'react'
import {
  LogOut,
  History,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Wallet,
  Check,
  Loader2
} from 'lucide-react'
import { useTranslate } from '@/hooks/useTranslate'
import { withdrawalService, type Balance } from '@/lib/transactions/withdrawalService'
import { toast } from 'react-hot-toast'

interface BalanceCardProps {
  userId?: string
  variant?: 'light' | 'dark'
  size?: 'compact' | 'normal' | 'large'
  onBalanceUpdate?: (balance: Balance) => void
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
  userId,
  variant = 'light',
  size = 'normal',
  onBalanceUpdate
}: BalanceCardProps) {
  const { t } = useTranslate()
  const isDark = variant === 'dark'
  
  // Состояния для данных
  const [balance, setBalance] = useState<Balance | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Загрузка баланса
  useEffect(() => {
    async function loadBalance() {
      if (!userId) {
        setIsLoading(false)
        return
      }
      
      try {
        setIsLoading(true)
        setError(null)
        const userBalance = await withdrawalService.getUserBalance(userId)
        setBalance(userBalance)
        
        // Callback для родительского компонента
        if (onBalanceUpdate) {
          onBalanceUpdate(userBalance)
        }
      } catch (err) {
        console.error('Error loading balance:', err)
        setError(t('Ошибка загрузки баланса'))
        toast.error(t('Не удалось загрузить баланс'))
      } finally {
        setIsLoading(false)
      }
    }

    loadBalance()
  }, [userId, t, onBalanceUpdate])

  // Подписка на обновления в реальном времени
  useEffect(() => {
    if (!userId) return

    const subscription = withdrawalService.subscribeToWithdrawals(
      userId,
      async () => {
        // При изменении в выводах обновляем баланс
        try {
          const updatedBalance = await withdrawalService.getUserBalance(userId)
          setBalance(updatedBalance)
          
          if (onBalanceUpdate) {
            onBalanceUpdate(updatedBalance)
          }
        } catch (err) {
          console.error('Error updating balance:', err)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [userId, onBalanceUpdate])

  // Цветовые схемы
  const bgClass = isDark ? 'bg-[#3A3D43]' : 'bg-white'
  const labelClass = isDark ? 'text-gray-400' : 'text-gray-600'
  const amountClass = isDark ? 'text-white' : 'text-gray-900'

  // Форматирование суммы
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ru-RU')
  }

  // Если загрузка
  if (isLoading) {
    return (
      <div className={`${bgClass} rounded-xl p-6 flex items-center justify-center min-h-[140px]`}>
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  // Если ошибка или нет userId
  if (error || !userId || !balance) {
    return (
      <div className={`${bgClass} rounded-xl p-6`}>
        <p className="text-gray-500 text-center">
          {error || t('Нет данных о балансе')}
        </p>
      </div>
    )
  }

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
            {formatAmount(balance.available_balance)} ₸
          </h3>
          {balance.frozen_balance > 0 && (
            <p className={`text-xs ${labelClass} mt-1`}>
              {t('Заморожено')}: {formatAmount(balance.frozen_balance)} ₸
            </p>
          )}
        </div>
        <a
          href="/dealer/payments"
          className={`p-2 ${balance.can_withdraw 
            ? 'bg-[#D77E6C] hover:bg-[#C66B5A]' 
            : 'bg-gray-400 cursor-not-allowed'
          } text-white rounded-lg transition-colors`}
          title={balance.can_withdraw ? t('Вывод средств') : t('Вывод недоступен')}
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
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                balance.can_withdraw ? 'bg-green-400' : 'bg-yellow-400'
              }`}></div>
              <p className={`${labelClass} text-sm font-medium`}>
                {t('Ваш баланс')}
              </p>
            </div>

            <h2 className={`text-3xl font-bold ${amountClass} mb-2`}>
              {formatAmount(balance.available_balance)} ₸
            </h2>

            {/* Статус вывода */}
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
              isDark ? 'bg-[#2D2F33] text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}>
              {balance.can_withdraw ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{t('Доступно для вывода')}</span>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 rounded-full bg-yellow-500 animate-pulse"></div>
                  <span>{t('Вывод временно недоступен')}</span>
                </>
              )}
            </div>
          </div>

          {/* Кнопки - всегда внизу */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <a
              href="/dealer/payments"
              className={`flex items-center justify-center gap-2 ${
                balance.can_withdraw
                  ? 'bg-gradient-to-r from-[#D77E6C] to-[#E09080] hover:from-[#C66B5A] hover:to-[#D77E6C]'
                  : 'bg-gray-400 cursor-not-allowed'
              } text-white py-2.5 rounded-xl transition-all duration-300 hover:shadow-md`}
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
              {formatAmount(balance.current_balance)} ₸
            </h2>
            {/* Динамика изменения */}
            {balance.current_balance > balance.total_withdrawn && (
              <div className="flex items-center gap-1 text-green-500">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">
                  +{Math.round((balance.current_balance / (balance.total_withdrawn || 1) - 1) * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Статистика в 3 колонки */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-[#2D2F33]' : 'bg-gray-50'}`}>
            <p className={`text-xs ${labelClass} mb-1`}>{t('Всего заработано')}</p>
            <p className={`text-lg font-semibold ${amountClass}`}>
              {formatAmount(balance.total_earned)} ₸
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-500">{t('общий доход')}</span>
            </div>
          </div>

          <div className={`p-4 rounded-xl ${isDark ? 'bg-[#2D2F33]' : 'bg-gray-50'}`}>
            <p className={`text-xs ${labelClass} mb-1`}>{t('Выведено')}</p>
            <p className={`text-lg font-semibold ${amountClass}`}>
              {formatAmount(balance.total_withdrawn)} ₸
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="w-3 h-3 text-orange-500" />
              <span className="text-xs text-orange-500">{t('всего выводов')}</span>
            </div>
          </div>

          <div className={`p-4 rounded-xl ${isDark ? 'bg-[#2D2F33]' : 'bg-gray-50'}`}>
            <p className={`text-xs ${labelClass} mb-1`}>{t('Доступно')}</p>
            <p className={`text-lg font-semibold ${amountClass}`}>
              {formatAmount(balance.available_balance)} ₸
            </p>
            <div className="flex items-center gap-1 mt-1">
              {balance.can_withdraw ? (
                <>
                  <Check className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-500">{t('к выводу')}</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
                  <span className="text-xs text-yellow-600">{t('ожидание')}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Заморожено (если есть) */}
        {balance.frozen_balance > 0 && (
          <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-amber-900/20 border border-amber-800/30' : 'bg-amber-50 border border-amber-200'}`}>
            <p className={`text-xs ${isDark ? 'text-amber-300' : 'text-amber-700'} mb-1 font-medium`}>
              {t('Заморожено')}
            </p>
            <p className={`text-lg font-semibold ${isDark ? 'text-amber-200' : 'text-amber-900'}`}>
              {formatAmount(balance.frozen_balance)} ₸
            </p>
            <p className={`text-xs mt-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
              {t('Средства в процессе вывода')}
            </p>
          </div>
        )}

        {/* Расширенные кнопки действий */}
        <div className="grid grid-cols-3 gap-3">
          <a
            href="/dealer/payments"
            className={`flex flex-col items-center gap-2 ${
              balance.can_withdraw
                ? 'bg-gradient-to-r from-[#D77E6C] to-[#E09080] hover:from-[#C66B5A] hover:to-[#D77E6C]'
                : 'bg-gray-400 cursor-not-allowed'
            } text-white py-3 rounded-xl transition-all duration-300`}
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