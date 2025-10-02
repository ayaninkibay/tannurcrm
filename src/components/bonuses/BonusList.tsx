// src/components/bonuses/BonusList.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  TrendingUp,
  Trophy,
  DollarSign,
  Calendar,
  ArrowRight,
  Users,
  Sparkles,
  Target,
  Zap,
  ChevronRight,
  Award,
  Activity
} from 'lucide-react'

import { useUser } from '@/context/UserContext'
import { BonusService } from '@/lib/bonuses/BonusService'
import { useTranslate } from '@/hooks/useTranslate'

interface BonusListProps {
  showViewButton?: boolean
}

const LEVEL_COLORS = [
  { from: '#D77E6C', to: '#E89380', percent: 8 },
  { from: '#E89380', to: '#F0A090', percent: 10 },
  { from: '#C66B5A', to: '#D77E6C', percent: 12 },
  { from: '#B85948', to: '#C66B5A', percent: 15 }
]

// Полноценный шиммер для блока бонусов
const BonusBlockShimmer = () => (
  <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-lg shadow-gray-200/50">
    {/* Заголовок шиммер */}
    <div className="flex items-center justify-between mb-4 animate-pulse">
      <div>
        <div className="h-7 bg-gray-200 rounded-lg w-36 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded-md w-44"></div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-gray-200 rounded-xl"></div>
        <div className="flex -space-x-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-10 h-10 bg-gray-200 rounded-full ring-3 ring-white"></div>
          ))}
        </div>
      </div>
    </div>
    
    {/* Статистика шиммер */}
    <div className="grid grid-cols-2 gap-3 mb-4 animate-pulse">
      <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl p-4">
        <div className="h-9 bg-gray-200 rounded-lg w-16 mb-1"></div>
        <div className="h-4 bg-gray-200 rounded-md w-24"></div>
      </div>
      <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl p-4">
        <div className="h-9 bg-gray-200 rounded-lg w-24 mb-1"></div>
        <div className="h-4 bg-gray-200 rounded-md w-20"></div>
      </div>
    </div>
    
    {/* Текущий уровень шиммер */}
    <div className="mb-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 bg-gray-200 rounded-md w-32"></div>
        <div className="h-7 bg-gray-200 rounded-full w-24"></div>
      </div>
      
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 border border-gray-100">
        <div className="h-5 bg-gray-200 rounded-lg w-48 mb-4"></div>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <div className="h-4 bg-gray-200 rounded-md w-20"></div>
              <div className="h-8 bg-gray-200 rounded-lg w-14"></div>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-gray-300 rounded-full"></div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="h-4 bg-gray-200 rounded-md w-20"></div>
              <div className="h-5 bg-gray-200 rounded-md w-28"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 bg-gray-200 rounded-md w-16"></div>
              <div className="h-5 bg-gray-200 rounded-md w-32"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Кнопка шиммер */}
    <div className="h-14 bg-gray-200 rounded-2xl animate-pulse"></div>
  </div>
)

export default function BonusList({ showViewButton = true }: BonusListProps) {
  const router = useRouter()
  const { profile, loading: userLoading } = useUser()
  const { t } = useTranslate()
  
  const [loading, setLoading] = useState(true)
  const [turnoverData, setTurnoverData] = useState<any>(null)
  const [currentLevel, setCurrentLevel] = useState<any>(null)
  const [nextLevel, setNextLevel] = useState<any>(null)
  const [monthlyBonuses, setMonthlyBonuses] = useState<any[]>([])
  const [teamStats, setTeamStats] = useState({ direct: 0, total: 0 })
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Проверяем, что профиль загружен и есть id
    if (profile?.id && !userLoading) {
      loadBonusData()
    } else if (!userLoading && !profile) {
      // Если загрузка завершена, но профиля нет
      setLoading(false)
      setHasError(true)
    }
  }, [profile, userLoading])

  const loadBonusData = async () => {
    if (!profile?.id) {
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      setHasError(false)
      const currentMonth = BonusService.getCurrentMonth()
      
      // Загружаем данные с обработкой ошибок для каждого запроса
      const [levels, turnover, bonuses] = await Promise.all([
        BonusService.getBonusLevels().catch(() => []),
        BonusService.getTurnoverForMonth(currentMonth).catch(() => ({ data: [] })),
        BonusService.getMonthlyBonuses(currentMonth, profile.id).catch(() => [])
      ])

      // Пробуем загрузить дерево команды отдельно, так как оно может вызвать ошибку
      let tree = null
      try {
        tree = await BonusService.buildTeamTree(profile.id)
      } catch (error) {
        console.warn('Could not build team tree:', error)
        // Продолжаем без дерева команды
      }

      // Находим данные текущего пользователя
      const userTurnover = turnover.data?.find(
        (u: any) => u.user_id === profile.id || u.users?.id === profile.id
      ) || {
        personal_turnover: 0,
        total_turnover: 0,
        bonus_percent: 8
      }
      setTurnoverData(userTurnover)

      // Определяем уровень
      if (levels && levels.length > 0) {
        const totalAmount = userTurnover.total_turnover || 0
        const current = levels.find(
          l => totalAmount >= l.min_amount && (!l.max_amount || totalAmount <= l.max_amount)
        ) || levels[0] // Берем первый уровень по умолчанию
        setCurrentLevel(current)
        
        const nextIdx = levels.findIndex(l => l.id === current?.id)
        if (nextIdx !== -1 && nextIdx < levels.length - 1) {
          setNextLevel(levels[nextIdx + 1])
        }
      }

      // Считаем команду если дерево загрузилось
      if (tree) {
        const countMembers = (node: any): { direct: number; total: number } => {
          if (!node || !node.children) return { direct: 0, total: 0 }
          
          let total = node.children.length
          const direct = node.children.length
          
          node.children.forEach((child: any) => {
            const childCount = countMembers(child)
            total += childCount.total
          })
          
          return { direct, total }
        }
        setTeamStats(countMembers(tree))
      }

      setMonthlyBonuses(bonuses || [])
    } catch (error) {
      console.error('Error loading bonus data:', error)
      setHasError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = () => {
    router.push('/dealer/bonuses')
  }

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`
    if (price >= 1000) return `${Math.round(price / 1000)}K`
    return price.toLocaleString('ru-RU')
  }

  const calculateProgress = () => {
    if (!currentLevel || !nextLevel || !turnoverData) return 0
    
    const current = turnoverData.total_turnover || 0
    const start = currentLevel.min_amount
    const end = nextLevel.min_amount
    
    return Math.min(100, ((current - start) / (end - start)) * 100)
  }

  // Расчет бонусов
  const personalBonus = monthlyBonuses
    .filter(b => b.bonus_type === 'personal' && b.beneficiary_id === profile?.id)
    .reduce((sum, b) => sum + (b.bonus_amount || 0), 0)
    
  const differentialBonus = monthlyBonuses
    .filter(b => b.bonus_type === 'differential' && b.beneficiary_id === profile?.id)
    .reduce((sum, b) => sum + (b.bonus_amount || 0), 0)
    
  const totalBonus = personalBonus + differentialBonus

  if (loading || userLoading) {
    return <BonusBlockShimmer />
  }

  // Если есть ошибка или нет профиля, показываем заглушку
  if (hasError || !profile) {
    return (
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-lg shadow-gray-200/50">
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">{t('Загрузка данных о бонусах...')}</p>
        </div>
      </div>
    )
  }

  const progress = calculateProgress()
  const currentMonth = BonusService.getCurrentMonth()

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-shadow duration-300">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            {t('Мои бонусы')}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {BonusService.getMonthName(currentMonth)}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Иконка уровня */}
          <div className="p-2.5 bg-gradient-to-r from-[#D77E6C] to-[#E89380] text-white rounded-xl shadow-md">
            <Trophy className="w-5 h-5" />
          </div>
          {/* Процентные индикаторы */}
          <div className="flex -space-x-2">
            {LEVEL_COLORS.map((level, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-full ring-3 ring-white flex items-center justify-center text-white font-bold text-xs shadow-sm ${
                  currentLevel && currentLevel.bonus_percent >= level.percent ? 'opacity-100' : 'opacity-40'
                }`}
                style={{ background: `linear-gradient(135deg, ${level.from}, ${level.to})` }}
              >
                {level.percent}%
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gradient-to-br from-[#D77E6C]/10 via-[#D77E6C]/5 to-white rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#D77E6C]/20 to-transparent rounded-full -translate-y-8 translate-x-8"></div>
          <div className="relative">
            <div className="text-3xl font-bold text-[#D77E6C]">
              {currentLevel?.bonus_percent || 8}%
            </div>
            <div className="text-sm text-[#D77E6C]/70 font-medium">{t('текущая ставка')}</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 via-green-50/50 to-white rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-100 to-transparent rounded-full -translate-y-8 translate-x-8"></div>
          <div className="relative">
            <div className="text-3xl font-bold text-green-600">
              {formatPrice(totalBonus)}
            </div>
            <div className="text-sm text-green-600/70 font-medium">{t('к получению')}</div>
          </div>
        </div>
      </div>

      {/* Текущий уровень */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-500">{t('Ваш прогресс')}</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-[#D77E6C]/10 to-[#E89380]/10 text-[#D77E6C] rounded-full text-xs font-medium">
            <Award className="w-3.5 h-3.5" />
            {currentLevel?.name || t('Начальный')}
          </span>
        </div>
        
        <div className="bg-gradient-to-r from-gray-50 via-gray-50 to-white rounded-2xl p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D77E6C]/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
          
          <div className="relative">
            <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#D77E6C]" />
              {t('Общий товарооборот')}
            </h4>
            
            <div className="space-y-3">
              {nextLevel ? (
                <>
                  <div>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-sm text-gray-500">{t('До следующего')}</span>
                      <span className="text-2xl font-bold text-[#D77E6C]">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-700 ease-out relative"
                        style={{
                          width: `${progress}%`,
                          background: 'linear-gradient(90deg, #D77E6C 0%, #E89380 100%)'
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      {t('Текущий:')} <span className="font-semibold text-gray-900">{formatPrice(turnoverData?.total_turnover || 0)} ₸</span>
                    </span>
                    <span className="text-gray-600">
                      {t('Цель:')} <span className="font-semibold text-gray-900">{formatPrice(nextLevel.min_amount)} ₸</span>
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center py-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 rounded-full">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('Максимальный уровень достигнут!')}</span>
                  </div>
                </div>
              )}
              
              {/* Дополнительная статистика */}
              <div className="pt-3 border-t border-gray-100 flex justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {t('Команда:')} <span className="font-semibold">{teamStats.total}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {t('Личный:')} <span className="font-semibold">{formatPrice(turnoverData?.personal_turnover || 0)}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка просмотра */}
      {showViewButton && (
        <button
          onClick={handleViewDetails}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white rounded-2xl font-medium transition-all duration-200 shadow-md hover:shadow-lg group"
        >
          <DollarSign className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          {t('Подробная статистика')}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200 ml-auto" />
        </button>
      )}
    </div>
  )
}