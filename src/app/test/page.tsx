'use client'

import React from 'react'
import ReferralLink from '@/components/Button'
import TannurButton from '@/components/Button'

export default function ReferralPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] p-6">
      <h1 className="text-xl font-semibold mb-4">Приглашения</h1>
      
      <TannurButton
  text="Мой профиль"
  href="/dealer/profile"
  iconSrc="/icons/userblack.svg"
  arrow="black"
  variant="gray"
/>

<TannurButton
  text="Моя команда"
  href="/dealer/myteam"
  iconSrc="/icons/IconBulbPink.svg"
  arrow="orange"
  variant="white"
/>
    </div>
  )
}
