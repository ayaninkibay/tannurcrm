'use client';

import { useState } from 'react';
import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

const tabs = [
  'Главная',
  'О компании',
  'Магазин',
  'Экскурсия',
  'Документы'
];

export default function HomePage() {
  const router = useRouter();
  const { profile } = useUser();
  const [activeTab, setActiveTab] = useState('Главная');

  const tabBlocks: Record<string, React.ReactNode[]> = {
    'Главная': [
      <div key="Главная-1" className="bg-white rounded-2xl p-6 min-h-[400px] shadow-sm">Главная — Блок 1</div>,
      <div key="Главная-2" className="bg-white rounded-2xl p-6 min-h-[400px] shadow-sm">Главная — Блок 2</div>,
      <div key="Главная-3" className="bg-white rounded-2xl p-6 min-h-[400px] shadow-sm">Главная — Блок 3</div>,
    ],
    'О компании': [
      <div key="О компании-1" className="bg-white rounded-2xl p-6 min-h-[400px] shadow-sm">О компании — Блок 1</div>,
      <div key="О компании-2" className="bg-white rounded-2xl p-6 min-h-[400px] shadow-sm">О компании — Блок 2</div>,
      <div key="О компании-3" className="bg-white rounded-2xl p-6 min-h-[400px] shadow-sm">О компании — Блок 3</div>,
    ],
    'Магазин': [
      <div key="Магазин-1" className="bg-white rounded-2xl p-6 min-h-[400px] shadow-sm">Магазин — Блок 1</div>,
      <div key="Магазин-2" className="bg-white rounded-2xl p-6 min-h-[400px] shadow-sm">Магазин — Блок 2</div>,
      <div key="Магазин-3" className="bg-white rounded-2xl p-6 min-h-[400px] shadow-sm">Магазин — Блок 3</div>,
    ],
    'Экскурсия': [
      <div key="Экскурсия-1" className="bg-white rounded-2xl p-6 min-h-[400px] shadow-sm">Экскурсия — Блок 1</div>,
      <div key="Экскурсия-2" className="bg-white rounded-2xl p-6 min-h-[400px] shadow-sm">Экскурсия — Блок 2</div>,
      <div key="Экскурсия-3" className="bg-white rounded-2xl p-6 min-h-[400px] shadow-sm">Экскурсия — Блок 3</div>,
    ],
    'Документы': [
      <div key="Документы-1" className="bg-white rounded-2xl p-6 min-h-[400px] shadow-sm">Документы — Блок 1</div>,
      <div key="Документы-2" className="bg-white rounded-2xl p-6 min-h-[400px] shadow-sm">Документы — Блок 2</div>,
      <div key="Документы-3" className="bg-white rounded-2xl p-6 min-h-[400px] shadow-sm">Документы — Блок 3</div>,
    ]
  };

  return (
  <div className="w-full bg-gray-100">
    {/* Верх: логотип + профиль + кнопки */} 
    <div className="flex justify-between items-center max-w-[1200px] mx-auto px-6 pt-6 pb-4">
      {/* Логотип слева */}
      <div className="w-[60px] h-[36px] sm:w-[120px] sm:h-[36px] relative -mt-2">
        <Image src="/icons/company/tannur_black.svg" alt="Tannur" fill className="object-contain" />
      </div>

      {/* Профиль + кнопки справа */}
      <div className="flex items-center gap-2">
                {/* Кнопки входа в CRM / Админку */}
        {profile?.role && (
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/dealer/dashboard')}
              className="flex items-center gap-2 bg-white px-4 py-1 rounded-full text-xs font-medium hover:bg-[#D9D9D9] hover:text-white transition"
            >
              <Image src="/icons/buttom/crm_orange.svg" alt="CRM" width={16} height={16} />
              <span className="whitespace-nowrap">CRM</span>
            </button>

            {profile.role === 'admin' && (
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="flex items-center gap-2 bg-white  px-4 py-2 rounded-full text-sm font-medium hover:bg-black hover:text-white transition"
              >
                <Image src="/icons/buttom/settings_orange.svg" alt="Admin" width={16} height={16} />
                Админ
              </button>
            )}
          </div>
        )}
        {/* Блок: профиль или "войти" */}
        <div
                    className="flex items-center gap-2 cursor-pointer bg-white rounded-3xl px-3 py-2 transition hover:shadow"
                    onClick={() => {
                      if (!profile) {
                        router.push('/signin');
                      } else {
                        switch (profile.role) {
                          case 'admin':
                            router.push('/admin/profile');
                            break;
                          case 'dealer':
                            router.push('/dealer/profile');
                            break;
                          case 'celebrity':
                            router.push('/celebrity/profile');
                            break;
                          default:
                            router.push('/signin');
                        }
                      }
                    }}
                  >

          {!profile ? (
            <>
              <div className="w-7 h-7 flex items-center justify-center">
                <Image src="/icons/userblack.svg" alt="Войти" width={17} height={17} />
              </div>
              <span className="text-sm font-medium text-black">Войти в CRM</span>
            </>
          ) : (
            <>
              <div className="w-7 h-7 rounded-full overflow-hidden">
                <Image
                  src={profile.avatar_url || '/img/avatar-default.png'}
                  alt="Профиль"
                  width={28}
                  height={28}
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-black whitespace-nowrap">
                  {profile.first_name}
                </span>
                <Image
                  src="/icons/DoubleIconArrowBlack.svg"
                  alt="arrow"
                  width={14}
                  height={14}
                />
              </div>
            </>
          )}
        </div>


      </div>
    </div>

    {/* Разделительная линия */}
    <div className="w-full flex justify-center mb-4">
      <div className="w-full max-w-[1150px] border-b border-black/10" />
    </div>

    {/* Табы */}
    <div className="max-w-[1200px] mx-auto px-6 mb-10">
      <div className="flex flex-wrap gap-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200 border outline-none ${
              activeTab === tab
                ? ' bg-black text-white border-black'
                : ' bg-white text-black border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>

    {/* Контент таба */}
    <div className="max-w-[1200px] mx-auto px-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-6"
        >
          {tabBlocks[activeTab]}
        </motion.div>
      </AnimatePresence>
    </div>
  </div>
);
}