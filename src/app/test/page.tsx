'use client'

import BonusCard from '@/components/blocks/BonusCard'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Цветной вариант */}
        <BonusCard
          variant="color"
          turnover={7412000}
          goal={9800000}
          remaining={2388000}
        />

        <div className="h-6" />

        {/* Белый вариант */}
        <BonusCard
          variant="white"
          turnover={7412000}
          goal={9800000}
          remaining={2388000}
        />
      </div>
    </div>
  )
}
