// components/blocks/BalanceCard.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  LogOut,
  History,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Wallet,
  Check,
  Loader2,
  Sparkles,
  Zap,
  Info,
  Clock,
  AlertCircle
} from 'lucide-react'
import { useTranslate } from '@/hooks/useTranslate'
import { withdrawalService, type Balance } from '@/lib/transactions/withdrawalService'
import { toast } from 'react-hot-toast'

// =====================================================
// КЕШИРОВАНИЕ
// =====================================================
class BalanceCache {
  private static CACHE_KEY = 'balance_card_cache'
  private static CACHE_TTL = 2 * 60 * 1000 // 2 минуты

  static get(userId: string): Balance | null {
    try {
      const cache = JSON.parse(localStorage.getItem(this.CACHE_KEY) || '{}')
      const item = cache[userId]
      
      if (!item) return null
      
      // Проверяем срок действия кеша
      if (Date.now() - item.timestamp > this.CACHE_TTL) {
        delete cache[userId]
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache))
        return null
      }
      
      return item.data
    } catch (error) {
      console.error('Cache read error:', error)
      return null
    }
  }

  static set(userId: string, data: Balance): void {
    try {
      const cache = JSON.parse(localStorage.getItem(this.CACHE_KEY) || '{}')
      
      // Ограничиваем размер кеша (максимум 10 пользователей)
      const keys = Object.keys(cache)
      if (keys.length >= 10) {
        // Удаляем самые старые записи
        keys.sort((a, b) => cache[a].timestamp - cache[b].timestamp)
        keys.slice(0, 5).forEach(k => delete cache[k])
      }
      
      cache[userId] = {
        data,
        timestamp: Date.now()
      }
      
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache))
    } catch (error) {
      console.error('Cache write error:', error)
    }
  }

  static clear(userId?: string): void {
    try {
      if (userId) {
        const cache = JSON.parse(localStorage.getItem(this.CACHE_KEY) || '{}')
        delete cache[userId]
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache))
      } else {
        localStorage.removeItem(this.CACHE_KEY)
      }
    } catch (error) {
      console.error('Cache clear error:', error)
    }
  }
}

// =====================================================
// ТИПЫ И ИНТЕРФЕЙСЫ
// =====================================================
interface BalanceCardProps {
  userId?: string
  variant?: 'light' | 'dark' | 'gradient'
  size?: 'compact' | 'normal' | 'large'
  onBalanceUpdate?: (balance: Balance) => void
}

// =====================================================
// ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ
// =====================================================

// Анимированный фон
const AnimatedBackground = ({ variant }: { variant: string }) => {
  if (variant === 'gradient') {
    return (
      <>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 opacity-90 rounded-2xl" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-transparent to-purple-600/20 animate-pulse rounded-2xl" />
      </>
    )
  }
  return null
}

// Плавающие элементы
const FloatingElements = () => (
  <>
    <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-2xl animate-pulse" />
    <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full blur-2xl animate-pulse delay-700" />
    <div className="absolute top-1/2 right-1/3 w-12 h-12 bg-white/5 rounded-full blur-xl animate-bounce delay-300" />
  </>
)

// =====================================================
// ОСНОВНОЙ КОМПОНЕНТ
// =====================================================
export default function BalanceCard({
  userId,
  variant = 'light',
  size = 'normal',
  onBalanceUpdate
}: BalanceCardProps) {
  const { t } = useTranslate()
  const [balance, setBalance] = useState<Balance | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFromCache, setIsFromCache] = useState(false)
  const animationRef = useRef<number | null>(null)

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
        setIsFromCache(false)
        
        // Проверяем кеш
        const cachedBalance = BalanceCache.get(userId)
        if (cachedBalance) {
          setBalance(cachedBalance)
          setIsFromCache(true)
          setIsLoading(false)
          
          if (onBalanceUpdate) {
            onBalanceUpdate(cachedBalance)
          }
          
          // Обновляем в фоне
          const freshBalance = await withdrawalService.getUserBalance(userId)
          if (JSON.stringify(freshBalance) !== JSON.stringify(cachedBalance)) {
            setBalance(freshBalance)
            BalanceCache.set(userId, freshBalance)
            setIsFromCache(false)
            
            if (onBalanceUpdate) {
              onBalanceUpdate(freshBalance)
            }
          }
          return
        }
        
        // Загружаем свежие данные
        const userBalance = await withdrawalService.getUserBalance(userId)
        setBalance(userBalance)
        BalanceCache.set(userId, userBalance)
        
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
        try {
          const updatedBalance = await withdrawalService.getUserBalance(userId)
          setBalance(updatedBalance)
          BalanceCache.set(userId, updatedBalance)
          setIsFromCache(false)
          
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

  // Анимация чисел
  const animateValue = (start: number, end: number, duration: number, callback: (value: number) => void) => {
    const startTime = Date.now()
    
    const frame = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      const value = Math.floor(start + (end - start) * progress)
      
      callback(value)
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(frame)
      }
    }
    
    animationRef.current = requestAnimationFrame(frame)
  }

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Форматирование суммы
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ru-RU')
  }

  // Цветовые схемы
  const getColorScheme = () => {
    switch (variant) {
      case 'dark':
        return {
          bg: 'bg-gray-900',
          cardBg: 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50',
          label: 'text-gray-400',
          amount: 'text-white',
          statBg: 'bg-gray-700/50',
          button: 'bg-gray-700'
        }
      case 'gradient':
        return {
          bg: 'relative overflow-hidden',
          cardBg: 'relative backdrop-blur-md bg-white/10 border border-white/20',
          label: 'text-white/70',
          amount: 'text-white',
          statBg: 'bg-white/10',
          button: 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
        }
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-50 to-white',
          cardBg: 'bg-white border border-gray-200',
          label: 'text-gray-600',
          amount: 'text-gray-900',
          statBg: 'bg-gray-50',
          button: 'bg-gray-100 hover:bg-gray-200'
        }
    }
  }

  const colors = getColorScheme()

  // Если загрузка
  if (isLoading) {
    return (
      <div className={`${colors.cardBg} rounded-2xl p-6 flex flex-col items-center justify-center min-h-[180px]`}>
        <Loader2 className="w-8 h-8 animate-spin text-[#D77E6C] mb-3" />
        <p className={`text-sm ${colors.label}`}>{t('Загрузка баланса...')}</p>
      </div>
    )
  }

  // Если ошибка или нет userId
  if (error || !userId || !balance) {
    return (
      <div className={`${colors.cardBg} rounded-2xl p-6`}>
        <div className="flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
          <p className="text-gray-500">
            {error || t('Нет данных о балансе')}
          </p>
        </div>
      </div>
    )
  }

  // COMPACT версия
  if (size === 'compact') {
    return (
      <div className={`relative ${colors.cardBg} rounded-xl p-3 transition-all duration-300`}>
        {variant === 'gradient' && <AnimatedBackground variant={variant} />}
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${variant === 'gradient' ? 'bg-white/20' : 'bg-[#D77E6C]/10'}`}>
              <Wallet className={`w-4 h-4 ${variant === 'gradient' ? 'text-white' : 'text-[#D77E6C]'}`} />
            </div>
            
            <div>
              <p className={`${colors.label} text-xs mb-0.5 flex items-center gap-1`}>
                {t('Баланс')}
                {isFromCache && (
                  <Clock className="w-3 h-3" />
                )}
              </p>
              <h3 className={`text-lg font-bold ${colors.amount}`}>
                {formatAmount(balance.available_balance)} ₸
              </h3>
            </div>
          </div>
          
          <a
            href="/dealer/dashboard/payments"
            className={`relative p-2 ${
              balance.can_withdraw 
                ? 'bg-gradient-to-r from-[#D77E6C] to-[#E09080]' 
                : 'bg-gray-400 cursor-not-allowed'
            } text-white rounded-lg transition-all duration-300`}
          >
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    )
  }

  // NORMAL версия
  if (size === 'normal') {
    return (
      <div className={`relative ${colors.cardBg} rounded-xl p-5 transition-all duration-300 overflow-hidden`}>
        {variant === 'gradient' && <AnimatedBackground variant={variant} />}
        {variant === 'gradient' && <FloatingElements />}
        
        <div className="relative z-10">
          {/* Заголовок с индикатором */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg ${variant === 'gradient' ? 'bg-white/20' : 'bg-gradient-to-br from-[#D77E6C]/10 to-[#E09080]/10'}`}>
                <Wallet className={`w-4 h-4 ${variant === 'gradient' ? 'text-white' : 'text-[#D77E6C]'}`} />
              </div>
              <div>
                <p className={`${colors.label} text-sm font-medium flex items-center gap-1.5`}>
                  {t('Текущий баланс')}
                  {isFromCache && (
                    <span className="text-xs opacity-60 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${balance.can_withdraw ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
                  <span className={`text-xs ${colors.label}`}>
                    {balance.can_withdraw ? t('Доступно для вывода') : t('Вывод временно недоступен')}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Декоративный элемент */}
            <Sparkles className={`w-4 h-4 ${variant === 'gradient' ? 'text-white/30' : 'text-gray-300'}`} />
          </div>

          {/* Основная сумма с анимацией */}
          <div className="mb-5">
            <h2 className={`text-3xl font-bold ${colors.amount} flex items-baseline gap-1.5`}>
              {formatAmount(balance.available_balance)}
              <span className="text-xl font-normal opacity-70">₸</span>
            </h2>
            
            {/* Мини-статистика */}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                <span className={`text-sm ${colors.label}`}>
                  {t('Заработано')}: <span className="font-medium">{formatAmount(balance.total_earned)} ₸</span>
                </span>
              </div>
              {balance.frozen_balance > 0 && (
                <div className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-yellow-500" />
                  <span className={`text-sm ${colors.label}`}>
                    {t('В обработке')}: <span className="font-medium">{formatAmount(balance.frozen_balance)} ₸</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="grid grid-cols-2 gap-2.5">
            <a
              href="/dealer/dashboard/payments"
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all duration-300 ${
                balance.can_withdraw
                  ? 'bg-gradient-to-r from-[#D77E6C] to-[#E09080] text-white'
                  : 'bg-gray-300 cursor-not-allowed text-gray-500'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="font-medium text-sm">{t('Вывести')}</span>
            </a>

            <a
              href="/dealer/dashboard/payments"
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all duration-300 ${colors.button} ${colors.amount}`}
            >
              <History className="w-3.5 h-3.5" />
              <span className="font-medium text-sm">{t('История')}</span>
            </a>
          </div>
        </div>
      </div>
    )
  }

  // LARGE версия - полная аналитика
  return (
    <div className={`relative ${colors.cardBg} rounded-2xl p-6 transition-all duration-300 overflow-hidden`}>
      {variant === 'gradient' && <AnimatedBackground variant={variant} />}
      {variant === 'gradient' && <FloatingElements />}
      
      <div className="relative z-10">
        {/* Заголовок секции */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${variant === 'gradient' ? 'bg-white/20' : 'bg-gradient-to-br from-[#D77E6C]/10 to-[#E09080]/10'}`}>
              <Wallet className="w-5 h-5 text-[#D77E6C]" />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${colors.amount}`}>{t('Финансовая панель')}</h2>
              <p className={`text-xs ${colors.label} flex items-center gap-1.5`}>
                {t('Обновлено')} {isFromCache ? t('из кеша') : t('только что')}
                {isFromCache && <Clock className="w-3 h-3" />}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              balance.can_withdraw 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {balance.can_withdraw ? t('Активно') : t('Ожидание')}
            </div>
          </div>
        </div>

        {/* Основной баланс с визуализацией */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-[#D77E6C]/5 to-[#E09080]/5 border border-[#D77E6C]/10">
          <p className={`${colors.label} text-xs mb-2`}>{t('Доступный баланс')}</p>
          <div className="flex items-baseline justify-between">
            <h2 className={`text-4xl font-bold ${colors.amount}`}>
              {formatAmount(balance.available_balance)}
              <span className="text-2xl font-normal opacity-70 ml-1">₸</span>
            </h2>
            
            {/* Прогресс бар */}
            <div className="flex flex-col items-end gap-1">
              {balance.total_earned > 0 && (
                <div className="text-right">
                  <p className={`text-xs ${colors.label} mb-1`}>{t('От общего дохода')}</p>
                  <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#D77E6C] to-[#E09080] transition-all duration-1000"
                      style={{ width: `${Math.min((balance.current_balance / balance.total_earned) * 100, 100)}%` }}
                    />
                  </div>
                  <p className={`text-xs ${colors.label} mt-0.5`}>
                    {Math.round((balance.current_balance / balance.total_earned) * 100)}%
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Детальная статистика в карточках */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className={`${colors.statBg} p-3 rounded-xl border ${variant === 'gradient' ? 'border-white/10' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-green-100">
                <TrendingUp className="w-3.5 h-3.5 text-green-600" />
              </div>
              <span className="text-xs text-green-600 font-medium">+100%</span>
            </div>
            <p className={`text-xs ${colors.label} mb-0.5`}>{t('Всего заработано')}</p>
            <p className={`text-lg font-bold ${colors.amount}`}>
              {formatAmount(balance.total_earned)} ₸
            </p>
          </div>

          <div className={`${colors.statBg} p-3 rounded-xl border ${variant === 'gradient' ? 'border-white/10' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-orange-100">
                <TrendingDown className="w-3.5 h-3.5 text-orange-600" />
              </div>
              <span className="text-xs text-orange-600 font-medium">
                -{Math.round((balance.total_withdrawn / balance.total_earned) * 100)}%
              </span>
            </div>
            <p className={`text-xs ${colors.label} mb-0.5`}>{t('Выведено средств')}</p>
            <p className={`text-lg font-bold ${colors.amount}`}>
              {formatAmount(balance.total_withdrawn)} ₸
            </p>
          </div>

          <div className={`${colors.statBg} p-3 rounded-xl border ${variant === 'gradient' ? 'border-white/10' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-blue-100">
                <Wallet className="w-3.5 h-3.5 text-blue-600" />
              </div>
              {balance.frozen_balance > 0 && (
                <span className="text-xs text-yellow-600 font-medium">
                  {t('Заморожено')}
                </span>
              )}
            </div>
            <p className={`text-xs ${colors.label} mb-0.5`}>{t('Текущий баланс')}</p>
            <p className={`text-lg font-bold ${colors.amount}`}>
              {formatAmount(balance.current_balance)} ₸
            </p>
          </div>
        </div>

        {/* Предупреждение о замороженных средствах */}
        {balance.frozen_balance > 0 && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 mb-5">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">{t('Средства в обработке')}</p>
                <p className="text-xs text-yellow-700 mt-0.5">
                  {formatAmount(balance.frozen_balance)} ₸ {t('находятся в процессе вывода')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Действия */}
        <div className="grid grid-cols-3 gap-2.5">
          <a
            href="/dealer/dashboard/payments"
            className={`relative flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all duration-300 overflow-hidden ${
              balance.can_withdraw
                ? 'bg-gradient-to-r from-[#D77E6C] to-[#E09080] text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-medium">{t('Вывести')}</span>
          </a>

          <a
            href="/dealer/dashboard/payments"
            className={`relative flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all duration-300 overflow-hidden ${colors.button} ${colors.amount}`}
          >
            <History className="w-4 h-4" />
            <span className="text-xs font-medium">{t('История')}</span>
          </a>

          <a
            href="/dealer/dashboard/payments"
            className={`relative flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all duration-300 overflow-hidden ${colors.button} ${colors.amount}`}
          >
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">{t('Аналитика')}</span>
          </a>
        </div>
      </div>
    </div>
  )
}