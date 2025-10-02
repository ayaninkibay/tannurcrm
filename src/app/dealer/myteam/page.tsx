'use client'

import React, { useState } from 'react'
import { useUser } from '@/context/UserContext'
import { useTranslate } from '@/hooks/useTranslate'
import MoreHeaderDE from '@/components/header/MoreHeaderDE'
import BonusTableBlock from '@/components/blocks/BonusTableBlock'
import BonusCard from '@/components/blocks/BonusCard'
import BonusList from '@/components/bonuses/BonusList'
import { 
  TreeModule, 
  TeamCardModule,
  useTeamStats,
  type TeamMember 
} from '@/lib/team'
import { Play, Trophy, Users, Sparkles, ChevronRight } from 'lucide-react'

export default function TeamPage() {
  const { t } = useTranslate()
  const { profile: user } = useUser()
  
  const [bonusTableOpen, setBonusTableOpen] = useState(false)
  
  // Используем хук для получения статистики
  const { stats: teamStats, loading: statsLoading } = useTeamStats(user?.id)

  const handleSelectMember = (member: TeamMember) => {
    console.log('Выбран участник:', member)
    // Здесь можно открыть модальное окно с деталями участника
  }

  const handleEditMember = (member: TeamMember) => {
    console.log('Редактирование участника:', member)
    // Здесь можно открыть форму редактирования
  }

  return (
    <div className="flex flex-col min-h-screen p-2 sm:p-4 md:p-6 bg-[#F5F5F5]">
      
      <MoreHeaderDE title={t('Моя команда')} />

      <div className="flex flex-col gap-4 sm:gap-6 mt-4 sm:mt-6 flex-1">

        {/* Основная сетка */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
          
          {/* Левая колонка - BonusList */}
          <div className="lg:col-span-5 xl:col-span-4">
            <BonusList showViewButton={true} />
          </div>

          {/* Правая колонка - TeamCard и BonusCard */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3 sm:gap-4">
            
            {/* Карточки в сетке */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              
              {/* TeamCard через модуль */}
              <TeamCardModule
                userId={user?.id}
                title={t('Моя команда')}
                variant="white"
                showButton={true}
                showBonusTable={true}
              />

              {/* BonusCard */}
              <div>
                <BonusCard 
                  variant="turnover" 
                  turnover={statsLoading ? 0 : teamStats.totalTurnover} 
                  goal={teamStats.goal} 
                  remaining={statsLoading ? teamStats.goal : teamStats.remaining} 
                />
              </div>
              
            </div>

            {/* Блок обучения и действий */}
            <div className="bg-gradient-to-br from-[#DC7C67]/5 to-[#E89380]/10 rounded-2xl shadow-sm border border-[#DC7C67]/20 relative overflow-hidden">
              {/* Декор */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#DC7C67]/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#E89380]/10 to-transparent rounded-full translate-y-12 -translate-x-12" />
              
              <div className="flex flex-col w-full p-3 sm:p-4 space-y-3 relative z-10">
                
                {/* Видео блок */}
                <div 
                  onClick={() => {
                    console.log('Открыть видео: Первые шаги к увеличению команды')
                  }}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white/80 backdrop-blur-sm rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer border border-[#DC7C67]/10 hover:border-[#DC7C67]/30 group hover:bg-white"
                >
                  {/* Иконка */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#DC7C67] to-[#E89380] rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white ml-0.5" />
                    </div>
                    {/* Пульс */}
                    <div className="absolute -top-1 -right-1 w-3 h-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </div>
                  </div>
                  
                  {/* Информация о видео */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-[#DC7C67] transition-colors">
                      {t('Первые шаги к увеличению команды')}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                      <span className="text-xs text-gray-500 hidden sm:inline">{t('Обучающий ролик')}</span>
                      <span className="text-xs text-gray-400 hidden sm:inline">•</span>
                      <span className="text-xs text-gray-500">12:30</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span className="text-xs text-amber-600 font-medium hidden sm:inline">{t('Рекомендуется к просмотру')}</span>
                      <span className="text-xs text-amber-600 font-medium sm:hidden">{t('Рекомендуется')}</span>
                    </div>
                  </div>
                  
                  {/* Стрелка */}
                  <div className="flex-shrink-0">
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-[#DC7C67] transition-all duration-300 group-hover:translate-x-1" />
                  </div>
                </div>

              </div>
            </div>
            
          </div>

        </section>

        {/* Дерево команды через модуль */}
        <section className="bg-white rounded-xl shadow-sm overflow-hidden flex-1 min-h-[400px] sm:min-h-[500px]">
          <div className="flex-1 min-h-[300px] sm:min-h-[400px]">
            <TreeModule
              userId={user?.id}
              currentUserId={user?.id}
              mode="user"
            />
          </div>
        </section>

      </div>
                
    </div>
  )
}