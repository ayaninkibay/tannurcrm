'use client';

import { useState } from 'react';
import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import HorizontalMediaScroll from '@/components/homemain/HorizontalMediaScroll';
import Lottie from 'lottie-react';
import eventsAnimation from '@/lotties/events.json';
import { 
  Building2, 
  Users, 
  ShoppingBag, 
  Map, 
  FileText,
  Calendar,
  TrendingUp,
  Search,
  Filter
} from 'lucide-react';

const primaryColor = '#D77E6C';

const tabs = [
  { name: 'Главная', icon: <Building2 size={18} /> },
  { name: 'О компании', icon: <Users size={18} /> },
  { name: 'ТОП-10', icon: <ShoppingBag size={18} /> },
  { name: 'Экскурсия', icon: <Map size={18} /> },
  { name: 'Документы', icon: <FileText size={18} /> }
];

export default function HomePage() {
  const router = useRouter();
  const { profile } = useUser();
  const [activeTab, setActiveTab] = useState('Главная');

  const tabBlocks: Record<string, React.ReactNode[]> = {
    'Главная': [
      // Галерея с HorizontalMediaScroll
      <div key="gallery" className="bg-white rounded-3xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Галерея Tannur</h2>
        </div>
        <div className="p-4">
          <HorizontalMediaScroll />
        </div>
      </div>,

      // События
      <div key="events" className="bg-white rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">События за Август</h3>
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar className="w-4 h-4" />
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {Object.entries({
              'Новый филиал в Алматы': 'Icon cover 1.png',
              'Путевка в Египет за 50 человек': 'Icon cover 2.png',
              'TNBA – Новый спикер в Академии': 'Icon cover 3.png',
              'Мероприятие Tannur Event 08 в Astana Arena': 'Icon cover 4.png',
            }).map(([title, icon], idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm">
                    <img src={`/icons/${icon}`} className="w-full h-full object-cover" alt={title} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 line-clamp-2">{title}</span>
                    <span className="text-xs text-gray-500">новости</span>
                  </div>
                </div>
                <Image src="/icons/buttom/DoubleIconArrowOrange.svg" className="w-6 h-6" alt="Подробнее" width={24} height={24} />
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-center">
            <Lottie animationData={eventsAnimation} loop={true} className="w-full max-w-[300px]" />
          </div>
        </div>
      </div>,

      // Новости
      <div key="news" className="bg-white rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Новости Tannur</h3>
          <div className="flex items-center gap-2 text-gray-400">
            <Search className="w-4 h-4" />
            <Filter className="w-4 h-4" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries({
            'Новый филиал в Алматы': '/icons/news1.png',
            'Путевка в Египет за 50 человек': '/icons/news2.png',
            'TNBA — Новый спикер в Академии': '/Icons/news3.png',
            'Мероприятие в Astana Arena': '/Icons/news4.png',
          }).map(([title, image], idx) => (
            <div key={idx} className="bg-gray-50 rounded-2xl overflow-hidden shadow-sm hover:bg-gray-100 transition-colors">
              <div className="p-1">
                <img src={image} alt={title} className="w-full h-[150px] rounded-xl object-cover" />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">{title}</h3>
                <p className="text-xs text-gray-500">22.07.2025</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ],





    'О компании': [
      <div key="about-1" className="bg-white rounded-3xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">О компании Tannur</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          <div className="prose">
            <p className="text-gray-600">
              Tannur - ведущая компания в сфере [описание]. Основанная в [год], 
              мы стремимся к инновациям и качеству во всех аспектах нашей работы.
            </p>
            <ul className="mt-4 space-y-2">
              <li>Более 1000 довольных клиентов</li>
              <li>Присутствие в 5 городах Казахстана</li>
              <li>Команда из 200+ профессионалов</li>
            </ul>
          </div>
          <div className="relative h-[300px] rounded-xl overflow-hidden">
            <Image
              src="/images/about-company.jpg"
              alt="О компании"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>,
      // ...дополнительные блоки о компании...
    ],

    'ТОП-10': [
      <div key="top-10" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {Array.from({ length: 10 }).map((_, idx) => (
          <div key={idx} className="bg-white rounded-3xl shadow-md overflow-hidden">
            <div className="relative h-48 rounded-xl overflow-hidden mb-4">
              <Image
                src={`https://source.unsplash.com/random/400x400/?portrait&sig=${idx}`}
                alt={`Дилер ${idx + 1}`}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2">Дилер {idx + 1}</h3>
              <p className="text-sm text-gray-600 mb-2">Рейтинг: 4.5/5</p>
              <p className="text-sm text-gray-600 mb-2">Сделок: {Math.floor(Math.random() * 100) + 50}</p>
            </div>
          </div>
        ))}
      </div>
    ],

    'Экскурсия': [
      <div key="tour-1" className="bg-white rounded-3xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Виртуальная экскурсия</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          <div>
            <p className="text-gray-600 mb-4">
              Познакомьтесь с нашей компанией через интерактивную виртуальную экскурсию.
            </p>
            <button className="px-6 py-3 bg-black text-white rounded-full">
              Начать экскурсию
            </button>
          </div>
          <div className="relative h-[400px] rounded-xl overflow-hidden">
            <Image
              src="/images/virtual-tour.jpg"
              alt="Виртуальная экскурсия"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    ],

'Документы': [
  <div key="docs" className="bg-white rounded-2xl p-6 shadow-xl">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-medium text-gray-900">Документы</h3>
      <FileText className="w-4 h-4 text-gray-400" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries({
        'Лицензии': <FileText size={32} className="text-gray-400 mb-4" />,
        'Сертификаты': <FileText size={32} className="text-gray-400 mb-4" />,
        'Награды': <FileText size={32} className="text-gray-400 mb-4" />,
        'Документация': <FileText size={32} className="text-gray-400 mb-4" />,
        'Правила': <FileText size={32} className="text-gray-400 mb-4" />,
        'Договоры': <FileText size={32} className="text-gray-400 mb-4" />,
      }).map(([doc, icon], idx) => (
        <div key={idx} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
          {icon}
          <h3 className="font-medium text-gray-900 mb-2">{doc}</h3>
          <p className="text-sm text-gray-600 mb-4">
            Нажмите для просмотра документов
          </p>
          <button className="text-orange-500 hover:text-orange-600 text-sm font-medium">
            Открыть →
          </button>
        </div>
      ))}
    </div>
  </div>
]

  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="relative w-[120px] h-[36px]">
              <Image
                src="/icons/company/tannur_black.svg"
                alt="Tannur"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Profile section */}
            <div className="flex items-center gap-4">
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
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-0 bg-white border-b z-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-wrap gap-2 py-4">
            {tabs.map(({ name, icon }) => (
              <button
                key={name}
                onClick={() => setActiveTab(name)}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all duration-200
                  ${activeTab === name 
                    ? `bg-[${primaryColor}] text-white` 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {icon}
                {name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {tabBlocks[activeTab]}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}