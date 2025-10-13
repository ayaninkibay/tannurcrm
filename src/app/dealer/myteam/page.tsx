'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@/context/UserContext'
import { useTranslate } from '@/hooks/useTranslate'
import MoreHeaderDE from '@/components/header/MoreHeaderDE'
import BonusList from '@/components/bonuses/BonusList'
import TeamCard from '@/components/blocks/TeamCard'
import TeamTree from '@/components/team/TeamTree'
import { 
  useTeamStats,
  useTeamTree,
  type TeamMember 
} from '@/lib/team/TeamModule'
import { Play, Sparkles, ChevronRight } from 'lucide-react'

// Простой кеш прямо здесь
let cachedStats: any = null
let cachedMembers: TeamMember[] = []
let cacheTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 минут

export default function TeamPage() {
  const { t } = useTranslate()
  const { profile: user } = useUser()
  
  // Состояние с кешированными данными
  const [teamStats, setTeamStats] = useState(cachedStats)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(cachedMembers)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Хуки для загрузки
  const statsHook = useTeamStats(user?.id)
  const membersHook = useTeamTree(user?.id)
  
  // Проверяем кеш и загружаем данные
  useEffect(() => {
    const now = Date.now()
    const isCacheValid = cacheTime && (now - cacheTime) < CACHE_DURATION
    
    // Если кеш свежий - используем его
    if (isCacheValid && cachedStats && cachedMembers.length > 0) {
      setTeamStats(cachedStats)
      setTeamMembers(cachedMembers)
      return
    }
    
    // Иначе загружаем данные
    setIsLoading(statsHook.loading || membersHook.loading)
    
    if (statsHook.stats) {
      cachedStats = statsHook.stats
      cacheTime = Date.now()
      setTeamStats(statsHook.stats)
    }
    
    if (membersHook.members && membersHook.members.length > 0) {
      cachedMembers = membersHook.members
      cacheTime = Date.now()
      setTeamMembers(membersHook.members)
    }
    
    if (statsHook.error || membersHook.error) {
      setError(statsHook.error || membersHook.error)
    }
    
  }, [statsHook.stats, statsHook.loading, statsHook.error, 
      membersHook.members, membersHook.loading, membersHook.error])

  // ===============================
  // ОБРАБОТЧИКИ
  // ===============================
  const handleSelectMember = (member: TeamMember) => {
    console.log('Выбран участник:', member)
  }

  const handleEditMember = (member: TeamMember) => {
    console.log('Редактирование участника:', member)
  }

  // ===============================
  // LOADING STATE
  // ===============================
  if (isLoading && !teamStats && !teamMembers.length) {
    return (
      <div className="flex flex-col min-h-screen p-2 sm:p-4 md:p-6 bg-[#F5F5F5]">
        <MoreHeaderDE title={t('Моя команда')} />
        
        <div className="flex flex-col gap-4 sm:gap-6 mt-4 sm:mt-6 flex-1">
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
              <div className="lg:col-span-5 xl:col-span-4 space-y-3 sm:space-y-4">
                <div className="h-64 bg-gray-200 rounded-xl" />
                <div className="h-24 bg-gray-200 rounded-xl" />
              </div>
              <div className="lg:col-span-7 xl:col-span-8 h-64 bg-gray-200 rounded-xl" />
            </div>
            <div className="h-96 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  // ===============================
  // ERROR STATE
  // ===============================
  if (error) {
    return (
      <div className="flex flex-col min-h-screen p-2 sm:p-4 md:p-6 bg-[#F5F5F5]">
        <MoreHeaderDE title={t('Моя команда')} />
        
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-500 text-lg font-semibold mb-2">
              {t('Ошибка загрузки данных')}
            </div>
            <p className="text-gray-600 text-sm">
              {error}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen p-2 sm:p-4 md:p-6 bg-[#F5F5F5]">
      
      <MoreHeaderDE title={t('Моя команда')} />

      <div className="flex flex-col gap-4 sm:gap-6 mt-4 sm:mt-6 flex-1">

        {/* ===============================
            ОСНОВНАЯ СЕТКА
            =============================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
          
          {/* Левая колонка - TeamCard + Кнопка обучения */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-3 sm:gap-4">
            
            {/* TeamCard */}
            <TeamCard
              stats={teamStats}
              title={t('Моя команда')}
              variant="white"
              showButton={true}
              showBonusTable={true}
            />

            {/* Кнопка обучения */}
            <button
              onClick={() => {
                console.log('Открыть видео: Первые шаги к увеличению команды')
              }}
              className="group relative w-full flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#DC7C67]/30 transition-all duration-300 cursor-pointer"
            >
              {/* Декоративные элементы */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#DC7C67]/5 to-transparent rounded-full -translate-y-10 translate-x-10" />
              
              {/* Иконка Play */}
              <div className="relative flex-shrink-0 z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-[#DC7C67] to-[#E89380] rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                </div>
                {/* Пульсирующий индикатор */}
                <div className="absolute -top-1 -right-1 w-3 h-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
              </div>
              
              {/* Текст */}
              <div className="flex-1 text-left relative z-10">
                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-[#DC7C67] transition-colors mb-1">
                  {t('Первые шаги к увеличению команды')}
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('Обучающий ролик')}</span>
                  <span>•</span>
                  <span>12:30</span>
                </div>
              </div>
              
              {/* Стрелка */}
              <div className="flex-shrink-0 relative z-10">
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#DC7C67] transition-all duration-300 group-hover:translate-x-1" />
              </div>
            </button>

          </div>

          {/* Правая колонка - BonusList (большой) */}
          <div className="lg:col-span-7 xl:col-span-8">
            <BonusList 
              showViewButton={true}
              teamStats={teamStats}
            />
          </div>

        </section>

        {/* ===============================
            ДЕРЕВО КОМАНДЫ
            =============================== */}
        <section className="bg-white rounded-xl shadow-sm overflow-hidden flex-1 min-h-[400px] sm:min-h-[500px]">
          <div className="flex-1 min-h-[300px] sm:min-h-[400px]">
            <TeamTree
              members={teamMembers}
              currentUserId={user?.id}
              onSelectMember={handleSelectMember}
              onEditMember={handleEditMember}
              isLoading={isLoading}
            />
          </div>
        </section>

      </div>
                
    </div>
  )
}