'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Plus, Sparkles } from 'lucide-react'

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

  // Apple Memoji стиль аватары
  const memojiAvatars = [
    '/memoji-1.png', // Поместите реальные изображения memoji
    '/memoji-2.png',
    '/memoji-3.png',
  ]

  return (
    <div className={`rounded-2xl p-4 h-full flex flex-col relative overflow-hidden ${
      isColor 
        ? 'bg-gradient-to-br from-[#DC7C67] to-[#C66B5A] text-white' 
        : 'bg-white border border-gray-100 text-gray-900 '
    }`}>
      
      {/* Декоративные шейпы */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-10">
        <div className={`w-full h-full rounded-full ${
          isColor ? 'bg-white' : 'bg-[#DC7C67]'
        }`} />
      </div>
      <div className="absolute bottom-0 left-0 w-16 h-16 -translate-x-8 translate-y-8">
        <div className={`w-full h-full rounded-full opacity-10 ${
          isColor ? 'bg-white' : 'bg-[#E89380]'
        }`} />
      </div>

      {/* Мини-декор в углу */}
      <div className="absolute top-3 right-3">
        <Sparkles className={`w-4 h-4 ${isColor ? 'text-white/30' : 'text-[#DC7C67]/30'}`} />
      </div>

      {/* Заголовок и статистика */}
      <div className="relative z-10 mb-3">
        <h3 className={`text-xs font-medium uppercase tracking-wider mb-2 ${
          isColor ? 'text-white/80' : 'text-gray-500'
        }`}>
          {title}
        </h3>
        <div className="flex items-baseline justify-between">
          <div>
            <span className={`text-3xl font-bold ${isColor ? 'text-white' : 'text-gray-900'}`}>
              {count}
            </span>
            <span className={`text-sm ml-1 ${isColor ? 'text-white/70' : 'text-gray-500'}`}>
              / {goal}
            </span>
          </div>
          <div className={`text-xl font-bold ${isColor ? 'text-white/90' : 'text-[#DC7C67]'}`}>
            {Math.round(percentage)}%
          </div>
        </div>
      </div>

      {/* Прогресс-бар с градиентом */}
      <div className="relative z-10 mb-3">
        <div className={`w-full h-10 rounded-xl overflow-hidden ${
          isColor ? 'bg-black/20' : 'bg-gray-50 border border-gray-200'
        }`}>
          <div
            className="h-full rounded-xl transition-all duration-700 ease-out relative overflow-hidden"
            style={{ 
              width: `${percentage}%`,
              background: isColor 
                ? 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)' 
                : 'linear-gradient(135deg, #DC7C67 0%, #E89380 100%)'
            }}
          >
            {/* Shimmer эффект */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          </div>
        </div>
        
        {/* Метка под прогресс-баром */}
        <div className={`text-xs mt-1 ${isColor ? 'text-white/60' : 'text-gray-500'}`}>
          Осталось пригласить: {remaining}
        </div>
      </div>

      {/* Нижняя секция с аватарами */}
      <div className="mt-auto relative z-10">
        <div className={`rounded-xl p-3 ${
          isColor ? 'bg-white/10 backdrop-blur-sm' : 'bg-gray-50'
        }`}>
          <div className="flex items-center justify-between">
            {/* Memoji аватары */}
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full ring-2 overflow-hidden ${
                    isColor ? 'ring-white/30' : 'ring-white'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, #${['FFB6C1', 'ADD8E6', 'FFE4B5'][i-1]} 0%, #${['FFC0CB', 'B0E0E6', 'FFDEAD'][i-1]} 100%)`
                  }}
                >
                  {/* Заглушка для memoji - замените на реальные изображения */}
                  <div className="w-full h-full flex items-center justify-center text-lg">
                    {['🧑', '👩', '👨'][i-1]}
                  </div>
                </div>
              ))}
              {count > 3 && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 ${
                  isColor 
                    ? 'bg-white/20 text-white ring-white/30' 
                    : 'bg-white text-gray-700 ring-white border border-gray-200'
                }`}>
                  +{count - 3}
                </div>
              )}
            </div>

            {/* Кнопка добавления */}
            {showButton && (
              <Link href="/dealer/create_dealer">
                <button className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 active:scale-95 ${
                  isColor 
                    ? 'bg-white text-[#DC7C67] hover:bg-white/95' 
                    : 'bg-[#DC7C67] hover:bg-[#C66B5A] text-white'
                }`}>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Добавить</span>
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}