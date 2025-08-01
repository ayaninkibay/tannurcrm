'use client'

import MoreHeader from '@/components/header/MoreHeader'

export default function CelebrityDashboardPage() {
  return (
    <main className="min-h-screen bg-[#F6F6F6]">
      {/* Заголовок страницы */}
      <MoreHeader title="Dashboard Селебрити" />

      {/* Заглушка контента */}
      <div className="grid grid-cols-4 gap-4 mt-15">
                    <div className="grid col-span-1 grid-rows-5 gap-4">
                                    <div className="grid row-span-3 h-full w-full bg-white "></div>
                                    <div className="grid row-span-1 h-full w-full bg-white "></div>
                                    <div className="grid row-span-1 h-full w-full bg-white "></div>

                    </div>
                      <div className="grid col-span-2 h-full w-full bg-white"></div>
                      <div className="grid col-span-1 h-100 w-full bg-white"></div>
                        
      </div>
    </main>
  )
}
