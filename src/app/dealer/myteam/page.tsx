'use client'

import React from 'react'
import MoreHeader from '@/components/header/MoreHeader'
import TeamCard from '@/components/blocks/TeamCard'
import UserProfileCard from '@/components/profile/UserProfileCard'
import TannurButton from '@/components/Button'
import ReferalLink from '@/components/blocks/ReferralLink'
import SponsorCard from '@/components/blocks/SponsorCard'
import BonusTableBlock from '@/components/blocks/BonusTableBlock'
import BonusCard from '@/components/blocks/BonusCard'
import AddDealerCard from '@/components/blocks/AddDealerCard'





export default function TeamPage() {

  return (
<div className="flex flex-col min-h-screen p-2 md:p-6 bg-[#F5F5F5]">
      
      {/* Верхний хедер */}
      <MoreHeader title="Моя команда" />

      {/* Контент страницы */}
      <div className="flex flex-col gap-6">

        {/* Первая секция */}
        <section className="grid grid-cols-10 rounded-xl mt-10 gap-4">





                <div className="col-span-10 sm:col-span-10 md:col-span-10 xl:col-span-4 grid grid-rows-3 xl:grid-rows-5 rounded-2xl gap-4">

                                              <div className="row-span-1 lg:row-span-1 xl:row-span-2 rounded-2xl bg-white h-full w-full">
                                                    <TeamCard
                                                      title="Моя команда"
                                                      count={68}
                                                      goal={100}
                                                      showButton={false}
                                                      variant="purple"
                                                    />
                                              </div>
                                              <div className="row-span-1 lg:row-span-1 xl:row-span-2 rounded-2xl bg-white h-full w-full">
                                                    <BonusCard variant="white" turnover={7412000} goal={9800000} remaining={2388000} />
                                              </div>
                                              <div className="row-span-1 rounded-2xl flex bg-white h-full w-full">
                                                    <AddDealerCard
                                                      title="Присоединить нового партнёра"
                                                      description="Вы можете пригласить человека в свою ветку, используя эту кнопку."
                                                      onAdd={() => console.log('Добавить дилера')}
                                                      onAvatarClick={() => console.log('Аватар нажат')}
                                                    />
                                              </div>


                </div>


                <div className="col-span-10 md:col-span-5 xl:col-span-4 rounded-2xl p-4 bg-white">
                                                  <BonusTableBlock />
                </div>



                <div className="col-span-10 md:col-span-5 xl:col-span-2 rounded-2xl bg-white grid grid-rows-[auto_auto_auto_auto] p-4 gap-4">
                                                  <UserProfileCard />
                                                  <div className="space-y-4 hidden md:block">
                                                    <TannurButton href="/profile" text="Моя страница" iconSrc="/icons/IconGroupBlack.png" arrow="black" variant="gray" />
                                                    <TannurButton href="/notifications" text="Уведомления" iconSrc="/icons/Icon notifications.png" arrow="black" variant="gray" />
                                                  </div>
                                                  <ReferalLink variant="orange" />
                                                  <SponsorCard variant="gray" />
                </div>
        </section>





        {/* Вторая секция */}
        <section className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-bold text-[#1C1C1C] mb-2">Секция 2</h2>
                    <p className="text-gray-600">Контент второй секции. Тот же стиль и структура.</p>
        </section>

      </div>
    </div>
    
  )
}
