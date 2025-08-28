'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ShoppingCart,
  Clock,
  Plus,
  ArrowRight,
  Sparkles,
  Users,
  TrendingUp,
  Trophy,
  X
} from 'lucide-react'

// Импортируем нужные сервисы и типы
import { useUser } from '@/context/UserContext'
import { useTeamPurchaseModule } from '@/lib/team-purchase/TeamPurchaseModule'
import BonusTableBlock from '@/components/blocks/BonusTableBlock'

interface TeamPurchaseListProps {
  maxItems?: number
  showCreateButton?: boolean
}

// Фейковые аватары с градиентами в фирменных цветах
const AVATAR_GRADIENTS = [
  { from: '#D77E6C', to: '#E89380', initial: 'A' },
  { from: '#E89380', to: '#F0A090', initial: 'M' },
  { from: '#C66B5A', to: '#D77E6C', initial: 'S' },
  { from: '#B85948', to: '#C66B5A', initial: 'K' }
]

// Компонент попапа
const BonusTablePopup = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#D77E6C]" />
            Таблица бонусов
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <BonusTableBlock />
        </div>
      </div>
    </div>
  )
}

// Шиммер для полного блока
const FullBlockShimmer = () => (
  <div className="bg-white rounded-3xl p-6 animate-pulse shadow-lg">
    <div className="flex items-center justify-between mb-6">
      <div>
        <div className="h-6 bg-gray-200 rounded-lg w-40 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
      <div className="flex -space-x-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-10 h-10 bg-gray-200 rounded-full"></div>
        ))}
      </div>
    </div>
    
    <div className="flex gap-4 mb-6">
      <div className="flex-1 bg-gray-100 rounded-2xl p-4">
        <div className="h-8 bg-gray-200 rounded w-12 mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="flex-1 bg-gray-100 rounded-2xl p-4">
        <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
    
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4">
      <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
      <div className="h-2 bg-gray-200 rounded-full"></div>
    </div>
  </div>
)

export default function TeamPurchaseList({ 
  maxItems = 1,
  showCreateButton = false 
}: TeamPurchaseListProps) {
  const router = useRouter()
  const { profile: currentUser } = useUser()
  const [showBonusPopup, setShowBonusPopup] = useState(false)
  
  const teamPurchase = useTeamPurchaseModule(currentUser)

  useEffect(() => {
    if (currentUser) {
      teamPurchase.loadPurchases()
    }
  }, [currentUser])

  const handlePurchaseClick = (purchaseId: string) => {
    router.push(`/dealer/myteam/team_relations?purchase=${purchaseId}`)
  }

  const handleViewAll = () => {
    router.push('/dealer/myteam/team_relations')
  }

  const handleCreate = () => {
    router.push('/dealer/myteam/team_relations?action=create')
  }

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`
    if (price >= 1000) return `${Math.round(price / 1000)}K`
    return price.toLocaleString('ru-RU')
  }

  const getDaysLeft = (deadline: string | null) => {
    if (!deadline) return null
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0
    return Math.min(100, (current / target) * 100)
  }

  const stats = {
    total: teamPurchase.purchases.length,
    active: teamPurchase.purchases.filter(p => p.status === 'active').length,
    totalCollected: teamPurchase.purchases.reduce((sum, p) => sum + (p.collected_amount || 0), 0)
  }

  // Берем только одну активную закупку
  const activePurchase = teamPurchase.purchases
    .filter(p => p.status === 'active' || p.status === 'forming')
    .sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1
      if (a.status !== 'active' && b.status === 'active') return 1
      return 0
    })[0]

  if (teamPurchase.loading) {
    return <FullBlockShimmer />
  }

  const progress = activePurchase ? calculateProgress(activePurchase.collected_amount, activePurchase.target_amount) : 0
  const daysLeft = activePurchase ? getDaysLeft(activePurchase.deadline) : null

  return (
    <>
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
        {/* Заголовок с аватарами и кнопкой бонусов */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              Командные закупки
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">Выгодные условия для команды</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Кнопка открытия таблицы бонусов */}
            <button
              onClick={() => setShowBonusPopup(true)}
              className="p-2.5 bg-gradient-to-r from-[#D77E6C] to-[#E89380] hover:from-[#C66B5A] hover:to-[#D77E6C] text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg group"
              title="Таблица бонусов"
            >
              <Trophy className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            </button>
            
            {/* Аватары участников */}
            <div className="flex -space-x-3">
              {AVATAR_GRADIENTS.map((avatar, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full ring-3 ring-white flex items-center justify-center text-white font-semibold text-sm shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${avatar.from}, ${avatar.to})`
                  }}
                >
                  {avatar.initial}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Статистика карточки */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-[#D77E6C]/10 via-[#D77E6C]/5 to-white rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#D77E6C]/20 to-transparent rounded-full -translate-y-8 translate-x-8"></div>
            <div className="relative">
              <div className="text-3xl font-bold text-[#D77E6C]">{stats.active}</div>
              <div className="text-sm text-[#D77E6C]/70 font-medium">активных</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-[#E89380]/10 via-[#E89380]/5 to-white rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#E89380]/20 to-transparent rounded-full -translate-y-8 translate-x-8"></div>
            <div className="relative">
              <div className="text-3xl font-bold text-[#D77E6C]">{formatPrice(stats.totalCollected)}</div>
              <div className="text-sm text-[#D77E6C]/70 font-medium">тенге собрано</div>
            </div>
          </div>
        </div>

        {/* Активная закупка */}
        {activePurchase ? (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Текущая закупка</span>
              {daysLeft !== null && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  Осталось {daysLeft} дней
                </span>
              )}
            </div>
            
            <div 
              onClick={() => handlePurchaseClick(activePurchase.id)}
              className="bg-gradient-to-r from-gray-50 via-gray-50 to-white rounded-2xl p-4 cursor-pointer hover:from-[#D77E6C]/5 hover:to-[#E89380]/5 transition-all duration-200 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D77E6C]/10 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
              
              <div className="relative">
                <h4 className="text-base font-semibold text-gray-900 mb-3 group-hover:text-[#D77E6C] transition-colors">
                  {activePurchase.title}
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-sm text-gray-500">Прогресс</span>
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
                      Собрано: <span className="font-semibold text-gray-900">{formatPrice(activePurchase.collected_amount)} ₸</span>
                    </span>
                    <span className="text-gray-600">
                      Цель: <span className="font-semibold text-gray-900">{formatPrice(activePurchase.target_amount)} ₸</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 mb-5 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-gray-100 to-transparent rounded-full -translate-y-20 translate-x-20"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShoppingCart className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-600 font-medium">Нет активных закупок</p>
              <p className="text-sm text-gray-500 mt-1">Создайте первую командную закупку</p>
            </div>
          </div>
        )}

        {/* Кнопки действий */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={handleCreate}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white rounded-2xl font-medium transition-all duration-200 shadow-md hover:shadow-lg group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            Создать закупку
          </button>
          
          <button
            onClick={handleViewAll}
            className="px-5 py-3.5 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 text-gray-900 rounded-2xl font-medium transition-all duration-200 group flex items-center gap-2"
          >
            Все
            {stats.total > 0 && (
              <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 bg-gradient-to-r from-[#D77E6C] to-[#E89380] text-white rounded-full text-xs font-semibold">
                {stats.total}
              </span>
            )}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>

      {/* Попап с таблицей бонусов */}
      <BonusTablePopup 
        isOpen={showBonusPopup} 
        onClose={() => setShowBonusPopup(false)} 
      />
    </>
  )
}