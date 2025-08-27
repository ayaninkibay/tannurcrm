'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@/context/UserContext'
import MoreHeaderDE from '@/components/header/MoreHeaderDE'
import TeamCard from '@/components/blocks/TeamCard'
import UserProfileCard from '@/components/profile/UserProfileCard'
import TannurButton from '@/components/Button'
import ReferalLink from '@/components/blocks/ReferralLink'
import SponsorCard from '@/components/blocks/SponsorCard'
import BonusTableBlock from '@/components/blocks/BonusTableBlock'
import BonusCard from '@/components/blocks/BonusCard'
import AddDealerCard from '@/components/blocks/AddDealerCard'
import TeamTree from '@/components/team/TeamTree'
import { TreeService, type TeamMember } from '@/lib/tree/TreeService'

export default function TeamPage() {
  const { profile: user } = useUser()
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [teamStats, setTeamStats] = useState({
    totalMembers: 0,
    totalTurnover: 0,
    goal: 9800000,
    remaining: 9800000
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      loadTeamData()
    } else {
      setLoading(false)
    }
  }, [user?.id])

  const loadTeamData = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      const membersResponse = await TreeService.getMyTeam(user.id)
      const safeMembers = Array.isArray(membersResponse) ? membersResponse : []
      setTeamMembers(safeMembers)

      const stats = await TreeService.getTeamStats(user.id)
      setTeamStats(stats)
    } catch (err) {
      console.error('Error loading team data:', err)
      setError('Не удалось загрузить данные команды')
      setTeamMembers([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectMember = (member: TeamMember) => {
    console.log('Selected member:', member)
  }

  const handleEditMember = (member: TeamMember) => {
    console.log('Edit member:', member)
  }

  const handleAddDealer = () => {
    console.log('Add dealer clicked')
    loadTeamData()
  }

  const safeTeamMembers = Array.isArray(teamMembers) ? teamMembers : []

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">Пожалуйста, войдите в систему</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Загрузка данных команды...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-2 md:p-6 bg-[#F5F5F5]">
      
      {/* Верхний хедер */}
      <MoreHeaderDE title="Моя команда" />

      {/* Контент страницы */}
      <div className="flex flex-col gap-6">

        {/* Первая секция */}
        <section className="grid grid-cols-10 rounded-xl mt-10 gap-4">
          <div className="col-span-10 sm:col-span-10 md:col-span-10 xl:col-span-4 grid grid-rows-3 xl:grid-rows-5 rounded-2xl gap-4">
            <div className="row-span-1 lg:row-span-1 xl:row-span-2 rounded-2xl bg-white h-full w-full">
              <TeamCard
                title="Моя команда"
                count={teamStats.totalMembers}
                goal={100}
                showButton={false}
                variant="white"
              />
            </div>
            <div className="row-span-1 lg:row-span-1 xl:row-span-2 rounded-2xl bg-white h-full w-full">
              <BonusCard 
                variant="white" 
                turnover={teamStats.totalTurnover} 
                goal={teamStats.goal} 
                remaining={teamStats.remaining} 
              />
            </div>
            <div className="row-span-1 rounded-2xl flex bg-white h-full w-full">
              <AddDealerCard
                title="Присоединить нового партнёра"
                description="Вы можете пригласить человека в свою ветку, используя эту кнопку."
                onAdd={handleAddDealer}
                onAvatarClick={() => console.log('Avatar clicked')}
              />
            </div>
          </div>

          <div className="col-span-10 md:col-span-5 xl:col-span-4 rounded-2xl p-4 bg-white">
            <BonusTableBlock />
          </div>

          <div className="col-span-10 md:col-span-5 xl:col-span-2 rounded-2xl bg-white grid grid-rows-[auto_auto_auto_auto] p-4 gap-4">
            <UserProfileCard />
            <div className="space-y-4 hidden md:block">
              <TannurButton 
                href="/dealer/profile_dealer" 
                text="Моя страница" 
                iconSrc="/icons/IconGroupBlack.png" 
                arrow="black" 
                variant="gray" 
              />
              <TannurButton 
                href="/notifications" 
                text="Уведомления" 
                iconSrc="/icons/Icon notifications.png" 
                arrow="black" 
                variant="gray" 
              />
            </div>
            <ReferalLink variant="orange" />
            <SponsorCard variant="gray" />
          </div>
        </section>

        {/* Вторая секция - Дерево команды */}
        <div className="h-screen">
          <section className="bg-white rounded-xl w-full h-full overflow-hidden">
            {error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={loadTeamData}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Повторить попытку
                  </button>
                </div>
              </div>
            ) : safeTeamMembers.length > 0 ? (
              <TeamTree
                members={safeTeamMembers}
                currentUserId={user.id}
                onSelectMember={handleSelectMember}
                onEditMember={handleEditMember}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">У вас пока нет членов команды</p>
                  <button
                    onClick={handleAddDealer}
                    className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                  >
                    Пригласить первого партнёра
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

      </div>
    </div>
  )
}