import React from 'react'
import { Download, Users, ShoppingBag, UserCheck } from 'lucide-react'
import { useTranslate } from '@/hooks/useTranslate'

interface CooperationTermsProps {
  variant?: 'light' | 'dark'
}

export default function CooperationTerms({ 
  variant = 'light'
}: CooperationTermsProps) {
  const { t } = useTranslate()
  const isDark = variant === 'dark'
  
  const bgClass = isDark ? 'bg-[#3A3D43]' : 'bg-white'
  const titleClass = isDark ? 'text-white' : 'text-gray-900'
  const textClass = isDark ? 'text-gray-400' : 'text-gray-600'
  const accentClass = 'text-[#D77E6C]'

  const terms = [
    { icon: Users,       percentage: '8%',  description: t('с оборота команды') },
    { icon: ShoppingBag, percentage: '15%', description: t('с покупки в магазине') },
    { icon: UserCheck,   percentage: '50%', description: t('с подписки диллеров') }
  ]

  return (
    <div className={`${bgClass} rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-sm font-semibold ${titleClass}`}>
          {t('Условия сотрудничества')}
        </h3>
        <button className={`${textClass} hover:${accentClass} transition-colors`}>
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
      
      <div className="space-y-2">
        {terms.map((term, index) => (
          <div key={index} className="flex items-center gap-2">
            <term.icon className={`w-3.5 h-3.5 ${textClass} opacity-50`} />
            <span className={`${accentClass} text-lg font-semibold`}>
              {term.percentage}
            </span>
            <span className={`${textClass} text-xs`}>
              {term.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Примеры использования
export function CooperationTermsExamples() {
  const { t } = useTranslate()

  return (
    <div className="p-8 bg-gray-100 space-y-6">
      <h1 className="text-2xl font-bold mb-4">
        {t('Условия сотрудничества - Компактная версия')}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        <div>
          <p className="text-sm text-gray-600 mb-2">{t('Light версия')}</p>
          <CooperationTerms variant="light" />
        </div>
        
        <div>
          <p className="text-sm text-gray-600 mb-2">{t('Dark версия')}</p>
          <CooperationTerms variant="dark" />
        </div>
      </div>
    </div>
  )
}
