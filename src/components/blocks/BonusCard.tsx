'use client'

import Image from 'next/image'
import clsx from 'clsx'

interface BonusCardProps {
  turnover: number
  goal: number
  remaining: number
  variant?: 'color' | 'white'
}

export default function BonusCard({
  turnover,
  goal,
  remaining,
  variant = 'color',
}: BonusCardProps) {
  const percentage = Math.min((turnover / goal) * 100, 100)
  const isColor = variant === 'color'

  return (
    <div
      className={clsx(
        'rounded-2xl p-4 md:p-6 flex flex-col justify-between h-full relative transition-all',
        isColor ? 'bg-[#F6ECFF] text-black' : 'bg-white text-black border border-gray-200'
      )}
    >
      {/* Верхняя часть */}
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            {isColor ? 'Ваш бонус' : 'Товарооборот команды'}
          </p>

          <h2 className="text-3xl font-bold text-black">
            {isColor ? '15%' : `${turnover.toLocaleString()} ₸`}
            {isColor && (
              <span className="text-base text-gray-500 ml-2 font-medium">с оборота команды</span>
            )}
          </h2>

          <ul className="text-xs text-gray-500 leading-5">
            <li>15% — с оборота команды</li>
            <li>30% — с скидка в магазине</li>
            <li>50% — с подписки диллеров</li>
          </ul>
        </div>

        {isColor ? (
          <div className="w-12 h-12 flex items-center justify-center">
            <Image
              src="/icons/link_arrow_black.svg"
              alt="arrow"
              width={56}
              height={56}
              className="opacity-80"
            />
          </div>
        ) : (
          <Image
            src="/icons/IconStongs.png"
            alt="Рост"
            width={80}
            height={80}
            className="w-20 h-20"
          />
        )}
      </div>

      {/* Нижняя часть */}
      <div className="mt-auto">
        <p className="text-xs text-gray-500 mb-2">
          До следующего статуса осталось{' '}
          <span className="text-black font-semibold">{remaining.toLocaleString()} ₸</span>
        </p>

        <div className="relative w-full h-4 rounded-full bg-gray-200 overflow-hidden">
          <div
            className={clsx(
              'absolute top-0 left-0 h-full rounded-full flex items-center pl-2 text-[10px] text-white font-semibold',
              isColor ? 'bg-[#C679F7]' : 'bg-[#7B61FF]'
            )}
            style={{ width: `${percentage}%` }}
          >
            {isColor ? `${turnover.toLocaleString()} ₸` : ''}
          </div>
        </div>
      </div>
    </div>
  )
}
