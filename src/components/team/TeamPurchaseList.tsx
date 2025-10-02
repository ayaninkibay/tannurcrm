// src/components/team/TeamPurchaseList.tsx

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
  X,
  Zap
} from 'lucide-react'

import { useUser } from '@/context/UserContext'
import { useTeamPurchaseModule } from '@/lib/team-purchase/TeamPurchaseModule'
import BonusTableBlock from '@/components/blocks/BonusTableBlock'
import { useTranslate } from '@/hooks/useTranslate'

interface TeamPurchaseListProps {
  maxItems?: number
  showCreateButton?: boolean
}

const AVATAR_GRADIENTS = [
  { from: '#D77E6C', to: '#E89380', initial: 'A' },
  { from: '#E89380', to: '#F0A090', initial: 'M' },
  { from: '#C66B5A', to: '#D77E6C', initial: 'S' },
  { from: '#B85948', to: '#C66B5A', initial: 'K' }
]

// Попап с таблицей бонусов
const BonusTablePopup = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { t } = useTranslate()
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#D77E6C]" />
            {t('Таблица бонусов')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <BonusTableBlock />
        </div>
      </div>
    </div>
  )
}

// Полноценный шиммер для всего блока
const FullBlockShimmer = () => (
  <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-lg shadow-gray-200/50">
    {/* Заголовок шиммер */}
    <div className="flex items-center justify-between mb-4 animate-pulse">
      <div>
        <div className="h-7 bg-gray-200 rounded-lg w-44 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded-md w-36"></div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-gray-200 rounded-xl"></div>
        <div className="flex -space-x-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-10 h-10 bg-gray-200 rounded-full ring-3 ring-white"></div>
          ))}
        </div>
      </div>
    </div>
    
    {/* Статистика шиммер */}
    <div className="grid grid-cols-2 gap-3 mb-4 animate-pulse">
      <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl p-4">
        <div className="h-9 bg-gray-200 rounded-lg w-14 mb-1"></div>
        <div className="h-4 bg-gray-200 rounded-md w-20"></div>
      </div>
      <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl p-4">
        <div className="h-9 bg-gray-200 rounded-lg w-20 mb-1"></div>
        <div className="h-4 bg-gray-200 rounded-md w-24"></div>
      </div>
    </div>
    
    {/* Текущая закупка шиммер - ПОЛНОЦЕННЫЙ БЛОК */}
    <div className="mb-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 bg-gray-200 rounded-md w-32"></div>
        <div className="h-7 bg-gray-200 rounded-full w-28"></div>
      </div>
      
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 border border-gray-100">
        {/* Заголовок закупки */}
        <div className="h-5 bg-gray-200 rounded-lg w-56 mb-4"></div>
        
        <div className="space-y-3">
          {/* Прогресс */}
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <div className="h-4 bg-gray-200 rounded-md w-20"></div>
              <div className="h-8 bg-gray-200 rounded-lg w-16"></div>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-gray-300 rounded-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>
          
          {/* Суммы */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="h-4 bg-gray-200 rounded-md w-16"></div>
              <div className="h-5 bg-gray-200 rounded-md w-24"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 bg-gray-200 rounded-md w-12"></div>
              <div className="h-5 bg-gray-200 rounded-md w-28"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Кнопки шиммер */}
    <div className="flex gap-2 sm:gap-3 animate-pulse">
      <div className="flex-1 h-14 bg-gray-200 rounded-2xl"></div>
      <div className="flex items-center gap-2 px-5 py-3.5 bg-gray-200 rounded-2xl">
        <div className="w-8 h-5"></div>
        <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
        <div className="w-4 h-4"></div>
      </div>
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
  const { t } = useTranslate()
  
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

  const activePurchase = teamPurchase.purchases
    .filter(p => p.status === 'active' || p.status === 'forming')
    .sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1
      if (a.status !== 'active' && b.status === 'active') return 1
      return 0
    })[0]

  // Показываем шиммер при загрузке
  if (teamPurchase.loading) {
    return <FullBlockShimmer />
  }

  const progress = activePurchase ? calculateProgress(activePurchase.collected_amount, activePurchase.target_amount) : 0
  const daysLeft = activePurchase ? getDaysLeft(activePurchase.deadline) : null

  return (
    <>
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-shadow duration-300 flex flex-col">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              {t('Командные закупки')}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">{t('Выгодные условия для команды')}</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Кнопка таблицы бонусов */}
            <button
              onClick={() => setShowBonusPopup(true)}
              className="p-2.5 bg-gradient-to-r from-[#D77E6C] to-[#E89380] hover:from-[#C66B5A] hover:to-[#D77E6C] text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg group"
              title={t('Таблица бонусов')}
              aria-label={t('Таблица бонусов')}
            >
              <Trophy className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            </button>
            {/* Аватары */}
            <div className="flex -space-x-3">
              {AVATAR_GRADIENTS.map((avatar, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full ring-3 ring-white flex items-center justify-center text-white font-semibold text-sm shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${avatar.from}, ${avatar.to})` }}
                  aria-hidden="true"
                >
                  {avatar.initial}
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
              <div className="text-3xl font-bold text-[#D77E6C]">{stats.active}</div>
              <div className="text-sm text-[#D77E6C]/70 font-medium">{t('активных')}</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-[#E89380]/10 via-[#E89380]/5 to-white rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#E89380]/20 to-transparent rounded-full -translate-y-8 translate-x-8"></div>
            <div className="relative">
              <div className="text-3xl font-bold text-[#D77E6C]">{formatPrice(stats.totalCollected)}</div>
              <div className="text-sm text-[#D77E6C]/70 font-medium">{t('тенге собрано')}</div>
            </div>
          </div>
        </div>

        {/* Активная закупка / пустое состояние */}
        <div className="mb-5">
          {activePurchase ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">{t('Текущая закупка')}</span>
                {daysLeft !== null && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {t('Осталось {n} дней').replace('{n}', String(daysLeft))}
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
                        <span className="text-sm text-gray-500">{t('Прогресс')}</span>
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
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={Math.round(progress)}
                          role="progressbar"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        {t('Собрано:')} <span className="font-semibold text-gray-900">{formatPrice(activePurchase.collected_amount)} ₸</span>
                      </span>
                      <span className="text-gray-600">
                        {t('Цель:')} <span className="font-semibold text-gray-900">{formatPrice(activePurchase.target_amount)} ₸</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">{t('Текущая закупка')}</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  <Zap className="w-3.5 h-3.5" />
                  {t('Ожидание')}
                </span>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50/50 rounded-2xl p-6 relative overflow-hidden border border-gray-100">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#D77E6C]/5 to-transparent rounded-full -translate-y-20 translate-x-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#E89380]/5 to-transparent rounded-full translate-y-16 -translate-x-16"></div>
                
                <div className="relative text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#D77E6C]/10 to-[#E89380]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <ShoppingCart className="w-7 h-7 text-[#D77E6C]" />
                  </div>
                  <h4 className="text-base font-semibold text-gray-900 mb-1">
                    {t('Нет активных событий')}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {t('Начните командную закупку и получайте бонусы')}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={handleCreate}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white rounded-2xl font-medium transition-all duration-200 shadow-md hover:shadow-lg group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            {t('Создать закупку')}
          </button>
          
          <button
            onClick={handleViewAll}
            className="px-5 py-3.5 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 text-gray-900 rounded-2xl font-medium transition-all duration-200 group flex items-center gap-2"
          >
            {t('Все')}
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