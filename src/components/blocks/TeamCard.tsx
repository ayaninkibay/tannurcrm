'use client'

import Image from 'next/image'
import clsx from 'clsx'

interface TeamCardProps {
  title?: string
  count: number
  goal?: number
  showButton?: boolean
  variant?: 'purple' | 'white'
}

export default function TeamCard({
  title = 'Моя команда',
  count,
  goal = 100,
  showButton = true,
  variant = 'purple',
}: TeamCardProps) {
  const percentage = Math.min((count / goal) * 100, 100)
  const remaining = Math.max(goal - count, 0)

  const isPurple = variant === 'purple'

  return (
    <div
      className={clsx(
        'rounded-2xl p-4 md:p-6 relative flex flex-col justify-between transition-all duration-300',
        isPurple ? 'bg-[#E5E2FB]' : 'bg-white border border-gray-200'
      )}
    >
      {/* Верхняя часть */}
      <div>
        <p className="text-sm text-gray-600 font-medium">{title}</p>
        <p className="text-3xl font-bold text-[#111] mt-1 mb-3">{count} человек</p>

        {showButton && (
          <button className="flex items-center gap-2 bg-white text-black rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-100 transition">
            <Image src="/icons/buttom/useradd_black.svg" alt="add" width={16} height={16} />
            Добавить
          </button>
        )}
      </div>

      {/* Нижняя часть — всегда снизу */}
      <div className="mt-6">
        <p className="text-xs md:text-md text-gray-700">
          До награды “Автомобиль Tannur” осталось{' '}
          <span className=" font-semibold text-black">{remaining} человек</span>
        </p>

        <div className="relative w-full h-4 bg-gray-100 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-[#BE345D] rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
          <span className="absolute left-2 top-1/2 -translate-y-2 text-xs text-white font-medium">
            {count} человек
          </span>
        </div>
      </div>
    </div>
  )
}
