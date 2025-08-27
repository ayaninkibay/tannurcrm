'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@/context/UserContext'
import MoreHeaderDE from '@/components/header/MoreHeaderDE'
import TeamCard from '@/components/blocks/TeamCard'
import BonusTableBlock from '@/components/blocks/BonusTableBlock'
import BonusCard from '@/components/blocks/BonusCard'
import AddDealerCard from '@/components/blocks/AddDealerCard'
import TeamTree from '@/components/team/TeamTree'
import { TreeService, type TeamMember } from '@/lib/tree/TreeService'
import TeamPurchaseList from '@/components/team/TeamPurchaseList'

export default function TeamPage() {
  const { profile: user } = useUser()
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [teamStats, setTeamStats] = useState({
    totalMembers: 0,
    totalTurnover: 0,
    goal: 9800000,
    remaining: 9800000
  })
  
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
    <div className="flex flex-col h-full p-2 md:p-6 bg-[#F5F5F5]">
      
      <MoreHeaderDE title="Моя команда" />

      <div className="flex flex-col gap-6 mt-6">

        {/* Основная сетка */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
          
          {/* Левая колонка */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            <div className="bg-white rounded-xl p-4">
              <TeamPurchaseList userId="current-user-id" />
            </div>
            
            <div className="bg-white rounded-xl">
              <TeamCard
                title="Моя команда"
                count={statsLoading ? 0 : teamStats.totalMembers}
                goal={100}
                showButton={false}
                variant="white"
              />
            </div>

            <div className="bg-white rounded-xl">
              <BonusCard 
                variant="turnover" 
                turnover={statsLoading ? 0 : teamStats.totalTurnover} 
                goal={teamStats.goal} 
                remaining={statsLoading ? teamStats.goal : teamStats.remaining} 
              />
            </div>
            
          </div>

          {/* Средняя колонка */}
          <div className="lg:col-span-5 bg-white rounded-xl p-4">
            <BonusTableBlock />
          </div>

          {/* Правая колонка */}
          <div className="lg:col-span-3 bg-white rounded-xl">
            <AddDealerCard
              title="Присоединить нового партнёра"
              description="Вы можете пригласить человека в свою ветку, используя эту кнопку."
              onAdd={handleAddDealer}
              onAvatarClick={() => {}}
            />
          </div>

        </section>

        {/* Дерево команды */}
        <section className="bg-white rounded-xl min-h-[600px] overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Дерево команды</h2>
          </div>
          
          {error ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={loadTeamData}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Повторить попытку
                </button>
              </div>
            </div>
          ) : !treeLoading && safeTeamMembers.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-gray-600 mb-4">У вас пока нет членов команды</p>
                <button
                  onClick={handleAddDealer}
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                >
                  Пригласить первого партнёра
                </button>
              </div>
            </div>
          ) : (
            <TeamTree
              members={safeTeamMembers}
              currentUserId={user?.id}
              onSelectMember={handleSelectMember}
              onEditMember={handleEditMember}
              isLoading={treeLoading}
            />
          )}
        </section>

      </div>
    </div>
  )
}