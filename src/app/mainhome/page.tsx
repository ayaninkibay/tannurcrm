'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Trophy, Calendar, MapPin, Award, FileText, Play, Download, 
  ChevronRight, Star, TrendingUp, Building2, ShieldCheck, FileCheck,
  Camera, Video, ImageIcon, Menu, X, User, Settings, LogIn, Heart
} from 'lucide-react';
import { useUser } from '@/context/UserContext';
import HorizontalMediaScroll from '@/components/homemain/HorizontalMediaScroll';
import Image from 'next/image';

const tabs = [
  'Главная',
  'О компании',
  'ТОП-10',
  'Экскурсия',
  'Документы'
];


export default function HomePage() {
  const { profile } = useUser();
  const [activeTab, setActiveTab] = useState('Главная');
  const router = useRouter(); // Используем реальный роутер Next.js


  const tabBlocks = {
    'Главная': [
      // Главный баннер
      <motion.div 
        key="Главная-1" 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-[#D77E6C]/10 via-white to-[#FFE8E4]/20 backdrop-blur-sm rounded-3xl p-8 md:p-12 overflow-hidden"
      >
        {/* Декоративные элементы */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D77E6C]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFE8E4]/30 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 shadow-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">2,234 партнёров онлайн</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Добро пожаловать в <span className="text-[#D77E6C]">Tannur</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl">
              Ваш путь к успеху в индустрии красоты начинается здесь. Присоединяйтесь к лидерам рынка косметики.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <button className="bg-[#D77E6C] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#C56D5C] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2">
                Начать сейчас
                <ChevronRight className="w-5 h-5" />
              </button>
              <button className="bg-white/80 backdrop-blur-sm px-8 py-4 rounded-full font-semibold hover:bg-white transition-all duration-300 shadow-lg">
                Узнать больше
              </button>
            </div>
          </div>
        </div>
      </motion.div>,

      // События
      <motion.div 
        key="Главная-2" 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            События <span className="text-[#D77E6C]">августа</span>
          </h2>
          <Calendar className="w-8 h-8 text-[#D77E6C]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {[
              { title: 'Новый филиал в Алматы', icon: <MapPin />, type: 'Открытие', date: '12 августа' },
              { title: 'Путевка в Египет за 50 человек', icon: <Award />, type: 'Конкурс', date: '15 августа' },
              { title: 'TNBA – Новый спикер', icon: <Users />, type: 'Обучение', date: '20 августа' },
              { title: 'Tannur Event 08', icon: <Trophy />, type: 'Мероприятие', date: '25 августа' },
            ].map((event, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="group flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-white hover:from-[#FFE8E4] hover:to-white transition-all duration-300 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D77E6C] to-[#E89185] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  {React.cloneElement(event.icon, { className: "w-6 h-6" })}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-500">{event.type} • {event.date}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#D77E6C] opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>

          <div className="relative bg-gradient-to-br from-[#FFE8E4] to-[#FFF5F3] rounded-3xl p-8 flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <div className="text-6xl mb-4">🎊</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Не пропустите!</h3>
              <p className="text-gray-600">Следите за событиями и будьте в центре успеха</p>
            </div>
          </div>
        </div>
      </motion.div>,

      // Галерея событий
      <motion.div 
        key="Главная-3" 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          Прошедшие <span className="text-[#D77E6C]">мероприятия</span>
        </h2>
        <HorizontalMediaScroll />
      </motion.div>,
    ],

    'О компании': [
      <motion.div 
        key="О компании-1" 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              История <span className="text-[#D77E6C]">успеха</span>
            </h2>
            <p className="text-gray-600 mb-4">
              Tannur Cosmetics — это больше, чем просто косметический бренд. Это сообщество успешных женщин, 
              которые строят свой бизнес и меняют жизнь к лучшему.
            </p>
            <p className="text-gray-600 mb-6">
              Основанная в 2015 году, наша компания выросла из небольшого стартапа в международный бренд 
              с представительствами в 15 странах мира.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-[#FFE8E4] to-white p-4 rounded-2xl">
                <h4 className="text-3xl font-bold text-[#D77E6C]">10+</h4>
                <p className="text-sm text-gray-600">Лет на рынке</p>
              </div>
              <div className="bg-gradient-to-br from-[#FFE8E4] to-white p-4 rounded-2xl">
                <h4 className="text-3xl font-bold text-[#D77E6C]">50K+</h4>
                <p className="text-sm text-gray-600">Партнёров</p>
              </div>
            </div>
          </div>
          <div className="relative h-96 rounded-2xl overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop" 
              alt="О компании"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </motion.div>,

      <motion.div 
        key="О компании-2" 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Наши <span className="text-[#D77E6C]">ценности</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              icon: <Heart className="w-8 h-8" />, 
              title: 'Забота', 
              desc: 'Мы заботимся о каждом партнёре и клиенте' 
            },
            { 
              icon: <Star className="w-8 h-8" />, 
              title: 'Качество', 
              desc: 'Только лучшие ингредиенты и технологии' 
            },
            { 
              icon: <TrendingUp className="w-8 h-8" />, 
              title: 'Развитие', 
              desc: 'Постоянное обучение и рост для всех' 
            }
          ].map((value, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white hover:from-[#FFE8E4] hover:to-white transition-all duration-300"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#D77E6C] to-[#E89185] flex items-center justify-center text-white">
                {value.icon}
              </div>
              <h3 className="font-bold text-xl mb-2">{value.title}</h3>
              <p className="text-gray-600">{value.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>,

      <motion.div 
        key="О компании-3" 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Наша <span className="text-[#D77E6C]">миссия</span>
        </h2>
        <div className="bg-gradient-to-r from-[#FFE8E4] to-[#FFF5F3] rounded-2xl p-8">
          <blockquote className="text-xl italic text-gray-700 mb-4">
            "Мы создаём возможности для женщин по всему миру реализовать свой потенциал, 
            обрести финансовую независимость и построить успешный бизнес в индустрии красоты."
          </blockquote>
          <p className="text-right text-gray-600 font-semibold">— Основатель Tannur Cosmetics</p>
        </div>
      </motion.div>,
    ],

    'ТОП-10': [
      <motion.div 
        key="ТОП-10-1" 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            ТОП-10 <span className="text-[#D77E6C]">дилеров</span>
          </h2>
          <Trophy className="w-8 h-8 text-[#D77E6C]" />
        </div>
        
        <div className="space-y-4">
          {[
            { name: 'Айгуль Касымова', city: 'Алматы', sales: '2.5M ₸', rank: 1, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop' },
            { name: 'Мадина Ахметова', city: 'Астана', sales: '2.3M ₸', rank: 2, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop' },
            { name: 'Гульнара Сейтова', city: 'Шымкент', sales: '2.1M ₸', rank: 3, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop' },
            { name: 'Дана Жумабекова', city: 'Караганда', sales: '1.9M ₸', rank: 4, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop' },
            { name: 'Асель Нурланова', city: 'Актобе', sales: '1.8M ₸', rank: 5, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop' },
          ].map((dealer, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex items-center gap-4 p-4 rounded-2xl ${
                dealer.rank <= 3 ? 'bg-gradient-to-r from-[#FFE8E4] to-white' : 'bg-gray-50'
              } hover:shadow-lg transition-all duration-300`}
            >
              <div className="relative">
                <img 
                  src={dealer.avatar} 
                  alt={dealer.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  dealer.rank === 1 ? 'bg-yellow-500' : dealer.rank === 2 ? 'bg-gray-400' : dealer.rank === 3 ? 'bg-orange-600' : 'bg-[#D77E6C]'
                }`}>
                  {dealer.rank}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{dealer.name}</h3>
                <p className="text-sm text-gray-600">{dealer.city}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#D77E6C]">{dealer.sales}</p>
                <p className="text-xs text-gray-500">за месяц</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>,

      <motion.div 
        key="ТОП-10-2" 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Лидеры <span className="text-[#D77E6C]">роста</span>
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop',
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop',
            'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=150&h=150&fit=crop',
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop',
            'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=150&h=150&fit=crop',
            'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=150&h=150&fit=crop',
            'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop',
          ].map((avatar, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
              className="relative group cursor-pointer"
            >
              <img 
                src={avatar} 
                alt={`Дилер ${idx + 1}`}
                className="w-full aspect-square rounded-2xl object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <p className="text-white text-sm font-semibold">+{120 - idx * 10}%</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="bg-gradient-to-r from-[#FFE8E4] to-[#FFF5F3] rounded-2xl p-6 text-center">
          <p className="text-gray-700 mb-2">Средний рост продаж за месяц</p>
          <p className="text-4xl font-bold text-[#D77E6C]">+68%</p>
        </div>
      </motion.div>,

      <motion.div 
        key="ТОП-10-3" 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Статистика <span className="text-[#D77E6C]">успеха</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-[#D77E6C]/10 to-white p-6 rounded-2xl">
            <TrendingUp className="w-8 h-8 text-[#D77E6C] mb-4" />
            <h4 className="text-3xl font-bold text-gray-900 mb-2">156%</h4>
            <p className="text-gray-600">Средний рост дохода дилеров за год</p>
          </div>
          <div className="bg-gradient-to-br from-[#FFE8E4] to-white p-6 rounded-2xl">
            <Award className="w-8 h-8 text-[#D77E6C] mb-4" />
            <h4 className="text-3xl font-bold text-gray-900 mb-2">92%</h4>
            <p className="text-gray-600">Дилеров достигают целей</p>
          </div>
          <div className="bg-gradient-to-br from-[#FFF5F3] to-white p-6 rounded-2xl">
            <Users className="w-8 h-8 text-[#D77E6C] mb-4" />
            <h4 className="text-3xl font-bold text-gray-900 mb-2">5K+</h4>
            <p className="text-gray-600">Активных дилеров по всему миру</p>
          </div>
        </div>
      </motion.div>,
    ],

    'Экскурсия': [
      <motion.div 
        key="Экскурсия-1" 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Наш <span className="text-[#D77E6C]">завод</span>
          </h2>
          <Building2 className="w-8 h-8 text-[#D77E6C]" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative h-96 rounded-2xl overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop" 
              alt="Завод Tannur"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="w-16 h-16 text-white" />
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Современное производство</h3>
            <p className="text-gray-600 mb-4">
              Наш завод оснащен новейшим оборудованием от ведущих мировых производителей. 
              Площадь производственных помещений составляет более 10,000 м².
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#D77E6C] rounded-full" />
                <span className="text-gray-600">Сертифицированное производство ISO 9001</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#D77E6C] rounded-full" />
                <span className="text-gray-600">Собственная лаборатория контроля качества</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#D77E6C] rounded-full" />
                <span className="text-gray-600">Экологически чистое производство</span>
              </li>
            </ul>
            
            <button className="mt-6 bg-[#D77E6C] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#C56D5C] transition-all duration-300 flex items-center gap-2">
              <Video className="w-5 h-5" />
              Смотреть видео-тур
            </button>
          </div>
        </div>
      </motion.div>,

      <motion.div 
        key="Экскурсия-2" 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Фото <span className="text-[#D77E6C]">галерея</span>
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1612528443702-f6741f70a049?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1583521214690-73421a1829a9?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1629196613836-e417e4b55de9?w=400&h=300&fit=crop',
          ].map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
              className="relative group cursor-pointer overflow-hidden rounded-xl"
            >
              <img 
                src={img} 
                alt={`Производство ${idx + 1}`}
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-white" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>,

      <motion.div 
        key="Экскурсия-3" 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          3D <span className="text-[#D77E6C]">тур</span>
        </h3>
        
        <div className="bg-gradient-to-br from-[#FFE8E4] to-[#FFF5F3] rounded-2xl p-12 text-center">
          <Camera className="w-16 h-16 text-[#D77E6C] mx-auto mb-6" />
          <h4 className="text-2xl font-bold text-gray-900 mb-4">Виртуальная экскурсия</h4>
          <p className="text-gray-600 mb-6 max-w-lg mx-auto">
            Пройдите по нашему заводу не выходя из дома. Узнайте, как создаётся качественная косметика Tannur.
          </p>
          <button className="bg-[#D77E6C] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#C56D5C] transition-all duration-300 shadow-lg hover:shadow-xl">
            Начать виртуальный тур
          </button>
        </div>
      </motion.div>,
    ],

    'Документы': [
      <motion.div 
        key="Документы-1" 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Сертификаты и <span className="text-[#D77E6C]">лицензии</span>
          </h2>
          <ShieldCheck className="w-8 h-8 text-[#D77E6C]" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { 
              title: 'Сертификат ЕАС', 
              desc: 'Евразийское соответствие',
              icon: <FileCheck className="w-6 h-6" />,
              date: '2024-2027'
            },
            { 
              title: 'ISO 9001:2015', 
              desc: 'Система менеджмента качества',
              icon: <Award className="w-6 h-6" />,
              date: '2023-2026'
            },
            { 
              title: 'Halal Certificate', 
              desc: 'Сертификат халяль',
              icon: <ShieldCheck className="w-6 h-6" />,
              date: '2024-2025'
            },
            { 
              title: 'GMP Certificate', 
              desc: 'Надлежащая производственная практика',
              icon: <FileText className="w-6 h-6" />,
              date: '2023-2028'
            },
            { 
              title: 'Декларация ТР ТС', 
              desc: 'Техническое регулирование',
              icon: <FileCheck className="w-6 h-6" />,
              date: '2024-2029'
            },
            { 
              title: 'Экологический сертификат', 
              desc: 'Eco-friendly production',
              icon: <Award className="w-6 h-6" />,
              date: '2023-2025'
            },
          ].map((doc, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl hover:from-[#FFE8E4] hover:to-white transition-all duration-300 cursor-pointer hover:shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D77E6C] to-[#E89185] flex items-center justify-center text-white">
                  {doc.icon}
                </div>
                <Download className="w-5 h-5 text-gray-400 group-hover:text-[#D77E6C] transition-colors" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{doc.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{doc.desc}</p>
              <p className="text-xs text-[#D77E6C] font-semibold">{doc.date}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>,

      <motion.div 
        key="Документы-2" 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Правовые <span className="text-[#D77E6C]">документы</span>
        </h3>
        
        <div className="space-y-4">
          {[
            { title: 'Договор поставки', size: '2.4 MB', type: 'PDF' },
            { title: 'Политика конфиденциальности', size: '1.2 MB', type: 'PDF' },
            { title: 'Условия сотрудничества', size: '3.1 MB', type: 'PDF' },
            { title: 'Маркетинг план 2025', size: '5.6 MB', type: 'PDF' },
          ].map((file, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-[#FFE8E4] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#D77E6C]/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#D77E6C]" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{file.title}</h4>
                  <p className="text-sm text-gray-500">{file.type} • {file.size}</p>
                </div>
              </div>
              <Download className="w-5 h-5 text-gray-400 group-hover:text-[#D77E6C] transition-colors" />
            </motion.div>
          ))}
        </div>
      </motion.div>,

      <motion.div 
        key="Документы-3" 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Обучающие <span className="text-[#D77E6C]">материалы</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-[#FFE8E4] to-white p-6 rounded-2xl">
            <Video className="w-12 h-12 text-[#D77E6C] mb-4" />
            <h4 className="font-bold text-gray-900 mb-2">Видео-курсы</h4>
            <p className="text-gray-600 text-sm mb-4">Более 50 часов обучающего контента</p>
            <button className="text-[#D77E6C] font-semibold text-sm hover:underline">
              Перейти к курсам →
            </button>
          </div>
          
          <div className="bg-gradient-to-br from-[#FFF5F3] to-white p-6 rounded-2xl">
            <FileText className="w-12 h-12 text-[#D77E6C] mb-4" />
            <h4 className="font-bold text-gray-900 mb-2">База знаний</h4>
            <p className="text-gray-600 text-sm mb-4">Статьи, инструкции и руководства</p>
            <button className="text-[#D77E6C] font-semibold text-sm hover:underline">
              Открыть базу знаний →
            </button>
          </div>
        </div>
      </motion.div>,
    ]
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-[#FFE8E4]/20 via-white to-[#D77E6C]/10">
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
                <LogIn className="w-4 h-4 text-[#D77E6C]" />
                <span className="whitespace-nowrap">CRM</span>
              </button>

              {profile.role === 'admin' && (
                <button
                  onClick={() => router.push('/admin/dashboard')}
                  className="flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm font-medium hover:bg-black hover:text-white transition"
                >
                  <Settings className="w-4 h-4 text-[#D77E6C]" />
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
                  <User className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-black">Войти в CRM</span>
              </>
            ) : (
              <>
                <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-200">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Профиль"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-black whitespace-nowrap">
                    {profile.first_name}
                  </span>
                  <ChevronRight className="w-3 h-3" />
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
      <div className="max-w-[1200px] mx-auto px-6 pb-12">
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