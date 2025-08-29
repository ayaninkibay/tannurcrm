'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@/context/UserContext'
import { useTranslate } from '@/hooks/useTranslate'
import MoreHeaderDE from '@/components/header/MoreHeaderDE'
import TeamCard from '@/components/blocks/TeamCard'
import BonusTableBlock from '@/components/blocks/BonusTableBlock'
import BonusCard from '@/components/blocks/BonusCard'
import AddDealerCard from '@/components/blocks/AddDealerCard'
import TeamTree from '@/components/team/TeamTree'
import { TreeService, type TeamMember } from '@/lib/tree/TreeService'
import TeamPurchaseList from '@/components/team/TeamPurchaseList'
import { Play, Trophy, Users, Sparkles, ChevronRight } from 'lucide-react'

export default function TeamPage() {
  const { t } = useTranslate()
  const { profile: user } = useUser()
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [teamStats, setTeamStats] = useState({
    totalMembers: 0,
    totalTurnover: 0,
    goal: 9800000,
    remaining: 9800000
  })
  const [bonusTableOpen, setBonusTableOpen] = useState(false)
  
  const [statsLoading, setStatsLoading] = useState(true)
  const [treeLoading, setTreeLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      loadTeamData()
    } else {
      setStatsLoading(false)
      setTreeLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const loadTeamData = async () => {
    if (!user?.id) return

    try {
      setError(null)
      setStatsLoading(true)
      const stats = await TreeService.getTeamStats(user.id)
      setTeamStats(stats)
      setStatsLoading(false)

      setTreeLoading(true)
      const membersResponse = await TreeService.getMyTeam(user.id)
      const safeMembers = Array.isArray(membersResponse) ? membersResponse : []
      setTeamMembers(safeMembers)
      setTreeLoading(false)
      
    } catch (err) {
      console.error('Error loading team data:', err)
      setError('Не удалось загрузить данные команды')
      setTeamMembers([])
      setStatsLoading(false)
      setTreeLoading(false)
    }
  }

  const handleSelectMember = (member: TeamMember) => {
    // Action handled
  }

  const handleEditMember = (member: TeamMember) => {
    // Action handled
  }

  const handleAddDealer = () => {
    loadTeamData()
  }

  const safeTeamMembers = Array.isArray(teamMembers) ? teamMembers : []

  return (
    <div className="flex flex-col min-h-screen p-2 sm:p-4 md:p-6 bg-[#F5F5F5]">
      
      <MoreHeaderDE title={t('Моя команда')} />

      <div className="flex flex-col gap-4 sm:gap-6 mt-4 sm:mt-6 flex-1">

        {/* Основная сетка */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
          
          {/* Левая колонка - TeamPurchaseList */}
          <div className="lg:col-span-5 xl:col-span-4">
            <TeamPurchaseList userId="current-user-id" />
          </div>

          {/* Правая колонка - TeamCard и BonusCard */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3 sm:gap-4">
            
            {/* Карточки в сетке */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              
              {/* TeamCard */}
              <div>
                <TeamCard
                  title={t('Моя команда')}
                  count={statsLoading ? 0 : teamStats.totalMembers}
                  goal={100}
                  showButton={false}
                  variant="white"
                />
              </div>

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

                {/* Кнопка таблицы бонусов */}
                <button
                  onClick={() => setBonusTableOpen(true)}
                  className="group relative flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-[#DC7C67] to-[#E89380] text-white rounded-xl sm:rounded-2xl hover:shadow-xl transition-all duration-300 font-semibold overflow-hidden hover:scale-[1.03] active:scale-[0.97]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
                  <div className="relative z-10 flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-white font-bold text-sm sm:text-base">{t('Таблица бонусов')}</div>
                      <div className="text-white/80 text-xs hidden sm:block">{t('Узнайте о наградах')}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 ml-auto group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </div>
            </div>
            
          </div>

        </section>

        {/* Дерево команды */}
        <section className="bg-white rounded-xl shadow-sm overflow-hidden flex-1 min-h-[400px] sm:min_h-[500px]">
          <div className="flex-1 min-h-[300px] sm:min-h-[400px]">
            {error ? (
              <div className="flex items-center justify-center h-full p-4">
                <div className="text-center">
                  <p className="text-red-600 mb-4 text-sm sm:text-base">{t('Не удалось загрузить данные команды')}</p>
                  <button
                    onClick={loadTeamData}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all duration-300 text-sm font-medium hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {t('Повторить попытку')}
                  </button>
                </div>
              </div>
            ) : !treeLoading && safeTeamMembers.length === 0 ? (
              <div className="flex items-center justify-center h-full p-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#DC7C67]/10 to-[#E89380]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-[#DC7C67]" />
                  </div>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">{t('У вас пока нет членов команды')}</p>
                  <button
                    onClick={handleAddDealer}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#DC7C67] to-[#E89380] text-white rounded-xl hover:shadow-lg transition-all duration-300 text-sm font-medium hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {t('Пригласить первого партнёра')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full">
                <TeamTree
                  members={safeTeamMembers}
                  currentUserId={user?.id}
                  onSelectMember={handleSelectMember}
                  onEditMember={handleEditMember}
                  isLoading={treeLoading}
                />
              </div>
            )}
          </div>
        </section>

      </div>

      {/* Модалка: Таблица бонусов */}
      {bonusTableOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-[#DC7C67]/10 to-[#E89380]/10 border-b border-[#DC7C67]/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#DC7C67] to-[#E89380] rounded-xl flex items-center justify-center shadow-md">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{t('Таблица бонусов')}</h2>
                  <p className="text-sm text-gray-600">{t('Структура вознаграждений команды')}</p>
                </div>
              </div>
              <button
                onClick={() => setBonusTableOpen(false)}
                className="p-2 hover:bg-white/80 rounded-xl transition-all duration-200 group"
                aria-label="close"
              >
                <svg className="w-6 h-6 text-gray-500 group-hover:text-gray-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto bg-gray-50">
              <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                <BonusTableBlock />
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  )
}
