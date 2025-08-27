'use client'

import Image from 'next/image'
import Link from 'next/link'

interface TeamCardProps {
  title?: string
  count: number
  goal?: number
  showButton?: boolean
  variant?: 'color' | 'white'
}

export default function TeamCard({
  title = 'Моя команда',
  count,
  goal = 100,
  showButton = true,
  variant = 'color',
}: TeamCardProps) {
  const percentage = Math.min((count / goal) * 100, 100)
  const remaining = Math.max(goal - count, 0)
  const isColor = variant === 'color'

  return (
    <div className={`rounded-2xl p-6 h-full flex flex-col relative overflow-hidden ${
      isColor 
        ? 'bg-gradient-to-br from-[#DC7C67] to-[#C86B56] text-white ' 
        : 'bg-white border border-gray-200 '
    }`}>
      
      {/* Subtle background pattern */}
      {isColor && (
        <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="currentColor">
            <circle cx="70" cy="30" r="12" />
            <circle cx="85" cy="15" r="6" />
          </svg>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3 className={`font-medium text-sm mb-2 ${isColor ? 'text-white/90' : 'text-gray-600'}`}>
            {title}
          </h3>
          <div className={`text-3xl font-bold ${isColor ? 'text-white' : 'text-[#111]'}`}>
            {count}
          </div>
          <div className={`text-sm ${isColor ? 'text-white/80' : 'text-gray-500'}`}>
            участников
          </div>
        </div>
        
        {showButton && (
          <Link href="/dealer/create_dealer">
            <button className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-105 ${
              isColor 
                ? 'bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-sm' 
                : 'bg-[#DC7C67] hover:bg-[#C86B56] text-white'
            }`}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Добавить
            </button>
          </Link>
        )}
      </div>

      {/* Progress Section */}
      <div className={`mt-auto p-4 rounded-xl relative z-10 ${
        isColor ? 'bg-white/10 backdrop-blur-sm border border-white/20' : 'bg-gray-50'
      }`}>
        <div className="flex justify-between items-center mb-3">
          <span className={`text-sm ${isColor ? 'text-white/90' : 'text-gray-600'}`}>
            До награды
          </span>
          <span className={`font-semibold ${isColor ? 'text-white' : 'text-[#111]'}`}>
            {remaining} чел.
          </span>
        </div>

        <div className={`w-full h-3 rounded-full overflow-hidden mb-2 ${
          isColor ? 'bg-white/20' : 'bg-gray-200'
        }`}>
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isColor ? 'bg-white shadow-sm' : 'bg-[#DC7C67]'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className={`flex justify-between text-xs ${
          isColor ? 'text-white/70' : 'text-gray-500'
        }`}>
          <span>{count} / {goal}</span>
          <span className={`font-medium ${isColor ? 'text-white' : 'text-[#DC7C67]'}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    </div>
  )
}