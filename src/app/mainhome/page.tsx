'use client';

import { useState } from 'react';
import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import VerticalMediaScroll from '@/components/homemain/VerticalMediaScroll';
import Lottie from 'lottie-react';
import eventsAnimation from '@/lotties/events.json'; // путь может отличаться

const tabs = [
  'Главная',
  'О компании',
  'ТОП-10',
  'Экскурсия',
  'Документы'
];

export default function HomePage() {
  const router = useRouter();
  const { profile } = useUser();
  const [activeTab, setActiveTab] = useState('Главная');

  const tabBlocks: Record<string, React.ReactNode[]> = {
    'Главная': [
      <div key="Главная-1" className="bg-white grid grid-cols-5 rounded-2xl p-10 min-h-[400px]">
                      <div className="col-span-5 sm:col-span-2 md:col-span-2 lg:col-span-3 p-2 flex flex-col items-start text-start gap-6">

                        {/* Иконка + количество человек */}
                        <div className="flex items-center gap-2 mt-2 md:mt-10 border border-black/20 rounded-full px-4 py-2 text-xs font-medium text-black">
                          <Image
                            src="/icons/buttom/IconProfile.svg"
                            alt="Community"
                            width={18}
                            height={18}
                          />

                          <span>2 234 человек вместе с нами</span>
                        </div>

                        {/* Заголовок */}
                        <h2 className="text-2xl sm:text-3xl font-semibold text-[#1C1C1C]">
                          Сообщество Tannur Cosmetics
                        </h2>

                        {/* Подзаголовок / описание */}
                        <p className="text-gray-500 text-sm mb-2 md:mb-10 xl:mb-40 sm:text-base max-w-md">
                          It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. 
                          The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters...
                        </p>

                        {/* Кнопки */}
                        <div className="flex flex-col sm:flex-row mb-10 md:mb-1 items-start gap-4">
                          <button className="bg-[#D2776A] text-white px-6 py-3 line-clamp-2 rounded-full font-semibold text-sm hover:bg-[#b86457] transition">
                            О TNBA
                          </button>
                          <button className="border border-black/20 px-6 py-3 rounded-full font-semibold text-sm hover:bg-black hover:text-white transition">
                            Связаться с менеджером
                          </button>
                        </div>
                      </div>


                  <div className="col-span-5 sm:col-span-3 md:col-span-3 lg:col-span-2 p-2">
                <VerticalMediaScroll/>
                  </div>
      </div>,



                <div key="Главная-2" className="flex flex-col bg-white rounded-2xl p-10 h-full">
                  <div className="text-black text-lg font-semibold mb-8">События за Август</div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Левая колонка: события */}
                    <div className="flex flex-col gap-10">
                      {[
                        { title: 'Новый филиал в Алматы', icon: 'Icon cover 1.png' },
                        { title: 'Путевка в Египет за 50 человек', icon: 'Icon cover 2.png' },
                        { title: 'TNBA – Новый спикер в Академии', icon: 'Icon cover 3.png' },
                        { title: 'Мероприятие Tannur Event 08 в Astana Arena', icon: 'Icon cover 4.png' },
                      ].map(({ title, icon }, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={`/icons/${icon}`} className="w-12 h-12 rounded-xl object-cover" alt="Иконка" />
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-gray-900 line-clamp-2">{title}</span>
                              <span className="text-xs text-gray-500">новости</span>
                            </div>
                          </div>
                          <img src="/icons/buttom/DoubleIconArrowOrange.svg" className="w-6 h-6" alt="Подробнее" />
                        </div>
                      ))}
                    </div>

                    {/* Правая колонка — можно что-то вставить */}
                <div className="bg-[#FFF1EE] rounded-xl h-full p-4 flex items-center justify-center">
                  <Lottie animationData={eventsAnimation} loop={true} className="w-full max-w-[300px]" />
                </div>
                  </div>
                </div>,
      
                <div key="Главная-3" className="bg-white rounded-2xl p-10 min-h-[400px] mb-50">
                  {/* Заголовок */}
                  <h2 className="text-lg sm:text-xl font-semibold text-[#111] mb-4">Новости Tannur</h2>

                  {/* Сетка новостей */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        title: 'Новый филиал в Алматы',
                        date: '22.07.2025',
                        image: '/icons/news1.png',
                      },
                      {
                        title: 'Путевка в Египет за 50 человек',
                        date: '22.07.2025',
                        image: '/icons/news2.png',
                      },
                      {
                        title: 'TNBA — Новый спикер в Академии',
                        date: '22.07.2025',
                        image: '/Icons/news3.png',
                      },
                      {
                        title: 'Мероприятие в Astana Arena',
                        date: '22.07.2025',
                        image: '/Icons/news4.png',
                      },
                    ].map((card, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl overflow-hidden shadow-sm">
                        <img src={card.image} alt={card.title} className="w-full h-[150px] p-1 rounded-2xl object-cover" />
                        <div className="p-4">
                          <h3 className="text-sm font-medium text-[#111] mb-2">{card.title}</h3>
                          <p className="text-xs text-gray-400">{card.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>,
    ],





    'О компании': [
      <div key="О компании-1" className="bg-white rounded-2xl p-6 min-h-[400px] shadow-sm">О компании — Блок 1</div>,
      <div key="О компании-2" className="bg-white rounded-2xl p-6 min-h-[400px] shadow-sm">О компании — Блок 2</div>,
      <div key="О компании-3" className="bg-white rounded-2xl p-6 min-h-[400px] shadow-sm">О компании — Блок 3</div>,
    ],
    'ТОП-10': [
      <div key="ТОП-10-1" className="bg-white rounded-2xl p-6 min-h-[400px] shadow-sm">Магазин — Блок 1</div>,
      <div key="ТОП-10-2" className="bg-white rounded-2xl p-6 min-h-[400px] shadow-sm">Магазин — Блок 2</div>,
      <div key="ТОП-10-3" className="bg-white rounded-2xl p-6 min-h-[400px] shadow-sm">Магазин — Блок 3</div>,
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
        <div className="relative w-[150px] h-[40px]">
  <Image
    src="/icons/company/tannur_black.svg"
    alt="Tannur"
    fill
    className="object-contain"
    priority // 👈 ДОБАВЬ
  />
</div>

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