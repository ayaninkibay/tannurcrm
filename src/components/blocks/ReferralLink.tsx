'use client'

import { useState } from 'react'
import Image from 'next/image'
import clsx from 'clsx'
import { useUser } from '@/context/UserContext'

interface Props {
  referralCode?: string
  variant?: 'orange' | 'gray'
}

export default function ReferralLink({ referralCode, variant = 'orange' }: Props) {
  const { profile, loading: loadingProfile } = useUser()
  const [copied, setCopied] = useState(false)

  const code = referralCode || profile?.referral_code || ''
  const fullLink = `https://tannur.app/${code}`
  const isOrange = variant === 'orange'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error('Ошибка копирования ссылки:', err)
    }
  }

  if (loadingProfile && !referralCode) {
    return (
      <div className="w-full min-h-[96px] bg-white rounded-xl p-3">
        <div className="h-4 w-32 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-[shimmer_1.5s_infinite]" />
        <div className="mt-2 h-12 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-[shimmer_1.5s_infinite]" />
      </div>
    )
  }

  return (
    <div className="w-full">
      <p className="text-sm font-medium text-[#111] mb-2">Реферальная ссылка</p>

      <div
        className={clsx(
          'rounded-xl p-3',
          isOrange ? 'bg-[#DC7C67] text-white' : 'bg-gray-100 text-black'
        )}
      >
        <div className="flex items-center gap-2 mb-2">
          <Image
            src={isOrange ? '/icons/buttom/share_white.svg' : '/icons/buttom/share_black.svg'}
            alt="share"
            width={16}
            height={16}
          />
          <p className="text-[12px] font-medium">Ссылка для приглашения</p>
        </div>

        <div className="bg-white rounded-md px-3 py-2 flex justify-between items-center">
          <span className="text-[12px] truncate">
            <span className="text-gray-400">tannur.app/</span>
            <span className={isOrange ? 'text-black' : 'text-[#D77E6C]'}>{code}</span>
          </span>

          <div onClick={handleCopy} className="cursor-pointer">
            <Image
              src="/icons/buttom/copy_black.svg"
              alt="copy"
              width={16}
              height={16}
            />
          </div>
        </div>

        {copied && (
          <p className={clsx('text-[10px] mt-1', isOrange ? 'text-white' : 'text-gray-500')}>
            Ссылка скопирована!
          </p>
        )}
      </div>
    </div>
  )
}
