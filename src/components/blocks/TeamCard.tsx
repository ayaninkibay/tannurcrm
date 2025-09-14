'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, Sparkles, Trophy, ChevronRight, X } from 'lucide-react'
import { useTranslate } from '@/hooks/useTranslate'
import BonusTableBlock from '@/components/blocks/BonusTableBlock' // ИМПОРТ ВАШЕГО КОМПОНЕНТА

interface TeamCardProps {
  title?: string
  count: number
  goal?: number
  showButton?: boolean
  variant?: 'color' | 'white'
  showBonusTable?: boolean
}

export default function TeamCard({
  title = 'Моя команда',
  count,
  goal = 100,
  showButton = true,
  variant = 'color',
  showBonusTable = false,
}: TeamCardProps) {
  const { t } = useTranslate()
  const [bonusTableOpen, setBonusTableOpen] = useState(false)
  const percentage = Math.min((count / goal) * 100, 100)
  const remaining = Math.max(goal - count, 0)
  const isColor = variant === 'color'

  return (
    <>
      <div
        className={`rounded-2xl p-4 h-full flex flex-col relative overflow-hidden ${
          isColor
            ? 'bg-gradient-to-br from-[#DC7C67] to-[#C66B5A] text-white'
            : 'bg-white border border-gray-100 text-gray-900'
        }`}
      >
        {/* Декоративные шейпы */}
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-10">
          <div className={`w-full h-full rounded-full ${isColor ? 'bg-white' : 'bg-[#DC7C67]'}`} />
        </div>
        <div className="absolute bottom-0 left-0 w-16 h-16 -translate-x-8 translate-y-8">
          <div className={`w-full h-full rounded-full opacity-10 ${isColor ? 'bg-white' : 'bg-[#E89380]'}`} />
        </div>

        {/* Мини-декор в углу */}
        <div className="absolute top-3 right-3">
          <Sparkles className={`w-4 h-4 ${isColor ? 'text-white/30' : 'text-[#DC7C67]/30'}`} />
        </div>

        {/* Заголовок и статистика */}
        <div className="relative z-10 mb-3">
          <h3
            className={`text-xs font-medium uppercase tracking-wider mb-2 ${
              isColor ? 'text-white/80' : 'text-gray-500'
            }`}
          >
            {t(title)}
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
          <div
            className={`w-full h-10 rounded-xl overflow-hidden ${
              isColor ? 'bg-black/20' : 'bg-gray-50 border border-gray-200'
            }`}
          >
            <div
              className="h-full rounded-xl transition-all duration-700 ease-out relative overflow-hidden"
              style={{
                width: `${percentage}%`,
                background: isColor
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)'
                  : 'linear-gradient(135deg, #DC7C67 0%, #E89380 100%)',
              }}
            >
              {/* Shimmer эффект */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
          </div>

          {/* Метка под прогресс-баром */}
          <div className={`text-xs mt-1 ${isColor ? 'text-white/60' : 'text-gray-500'}`}>
            {t('Осталось пригласить: {n}').replace('{n}', String(remaining))}
          </div>
        </div>

        {/* КНОПКА ТАБЛИЦЫ БОНУСОВ */}
        {showBonusTable && (
          <button
            onClick={() => setBonusTableOpen(true)}
            className={`group relative w-full mb-3 p-3 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
              isColor 
                ? 'bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20' 
                : 'bg-gradient-to-r from-[#DC7C67] to-[#E89380] text-white hover:shadow-lg'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isColor ? 'bg-white/20' : 'bg-white/20'}`}>
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm">{t('Таблица бонусов')}</div>
                  <div className={`text-xs ${isColor ? 'text-white/70' : 'text-white/80'}`}>
                    {t('Узнайте о наградах команды')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                  isColor ? 'bg-white/20' : 'bg-white/20'
                }`}>
                  до 15%
                </div>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            
            {/* Декоративная полоска снизу */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </button>
        )}

        {/* Нижняя секция с аватарами и кнопкой добавления дилера */}
        <div className="mt-auto relative z-10">
          <div className={`${isColor ? 'bg-white/10 backdrop-blur-sm' : 'bg-gray-50'} rounded-xl p-3`}>
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
                      background: `linear-gradient(135deg, #${
                        ['FFB6C1', 'ADD8E6', 'FFE4B5'][i - 1]
                      } 0%, #${
                        ['FFC0CB', 'B0E0E6', 'FFDEAD'][i - 1]
                      } 100%)`,
                    }}
                  >
                    {/* Заглушка для memoji */}
                    <div className="w-full h-full flex items-center justify-center text-lg">
                      {['🧑', '👩', '👨'][i - 1]}
                    </div>
                  </div>
                ))}
                {count > 3 && (
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 ${
                      isColor
                        ? 'bg-white/20 text-white ring-white/30'
                        : 'bg-white text-gray-700 ring-white border border-gray-200'
                    }`}
                  >
                    +{count - 3}
                  </div>
                )}
              </div>

              {/* Кнопка добавления дилера */}
              {showButton && (
                <Link href="/dealer/create_dealer">
                  <button
                    className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 active:scale-95 ${
                      isColor ? 'bg-white text-[#DC7C67] hover:bg-white/95' : 'bg-[#DC7C67] hover:bg-[#C66B5A] text-white'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('Добавить')}</span>
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно с таблицей бонусов */}
      {bonusTableOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-zoom-in">
            {/* Заголовок модалки */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-[#DC7C67]/10 to-[#E89380]/10 border-b border-[#DC7C67]/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#DC7C67] to-[#E89380] rounded-xl flex items-center justify-center shadow-md">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{t('Таблица бонусов')}</h2>
                  <p className="text-sm text-gray-600">{t('Структура вознаграждений команды')}</p>
                </div>
              </div>
              <button
                onClick={() => setBonusTableOpen(false)}
                className="p-2 hover:bg-white/80 rounded-xl transition-all duration-200 group"
                aria-label="Закрыть"
              >
                <X className="w-6 h-6 text-gray-500 group-hover:text-gray-700 transition-colors" />
              </button>
            </div>
            
            {/* ВАШ КОМПОНЕНТ BonusTableBlock */}
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto bg-gray-50">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <BonusTableBlock />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Стили для анимаций */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoom-in {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 200ms ease-out;
        }
        .animate-zoom-in {
          animation: zoom-in 200ms ease-out;
        }
      `}</style>
    </>
  )
}