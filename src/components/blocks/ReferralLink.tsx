'use client'

import { useState } from 'react'
import Image from 'next/image'
import clsx from 'clsx'

interface Props {
  referralCode: string
  variant?: 'orange' | 'gray'
}

export default function ReferralLink({ referralCode, variant = 'orange' }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      const fullLink = `https://tannur.app/${referralCode}`
      await navigator.clipboard.writeText(fullLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error('Ошибка копирования ссылки:', err)
    }
  }

  const isOrange = variant === 'orange'

  return (
    <div className="w-full">
      {/* Заголовок блока */}
      <p className="text-sm font-medium text-[#111] mb-2">Реферальная ссылка</p>

      <div
        className={clsx(
          'rounded-xl p-3',
          isOrange ? 'bg-[#DC7C67] text-white' : 'bg-gray-100 text-black'
        )}
      >
        {/* Иконка и подпись */}
        <div className="flex items-center gap-2 mb-2">
          <Image
            src={isOrange ? '/icons/buttom/share_white.svg' : '/icons/buttom/share_black.svg'}
            alt="share"
            width={16}
            height={16}
          />
          <p className="text-[12px] font-medium">Ссылка для приглашения</p>
        </div>

        {/* Сама ссылка */}
        <div className="bg-white rounded-md px-3 py-2 flex justify-between items-center">
          <span className="text-[12px] truncate">
            <span className="text-gray-400">tannur.app/</span>
            <span className={isOrange ? 'text-black' : 'text-[#D77E6C]'}>{referralCode}</span>
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

        {/* Статус скопировано */}
        {copied && (
          <p className={clsx('text-[10px] mt-1', isOrange ? 'text-white' : 'text-gray-500')}>
            Ссылка скопирована!
          </p>
        )}
      </div>
    </div>
  )
}
