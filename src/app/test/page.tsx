'use client';

import React, { useState, useEffect } from 'react';
import { Users, ArrowRight, Calendar, MapPin, Award, Sparkles, ChevronRight, Heart, Star } from 'lucide-react';
import HorizontalMediaScroll from '@/components/homemain/HorizontalMediaScroll';



const EventCard = ({ title, icon, type, delay }) => (
  <div 
    className="group flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#FFF5F3] to-white hover:from-[#FFE8E4] hover:to-[#FFF5F3] transition-all duration-500 cursor-pointer hover:scale-[1.02] hover:shadow-lg"
    style={{
      animation: `slideInLeft 0.6s ease-out ${delay}s both`
    }}
  >
    <div className="flex items-center gap-4">
      <div className="relative">
        <div className="absolute inset-0 bg-[#D2776A] blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D2776A] to-[#E89185] flex items-center justify-center text-white shadow-lg">
          {icon}
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-gray-900 group-hover:text-[#D2776A] transition-colors">
          {title}
        </span>
        <span className="text-xs text-gray-500">{type}</span>
      </div>
    </div>
    <ChevronRight className="w-5 h-5 text-[#D2776A] group-hover:translate-x-1 transition-transform" />
  </div>
);

const NewsCard = ({ title, date, image, delay }) => (
  <div 
    className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
    style={{
      animation: `fadeInUp 0.6s ease-out ${delay}s both`
    }}
  >
    <div className="relative overflow-hidden h-[180px]">
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-[#D2776A] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Новое
      </div>
    </div>
    <div className="p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-2 group-hover:text-[#D2776A] transition-colors line-clamp-2">
        {title}
      </h3>
      <p className="text-xs text-gray-400 flex items-center gap-1">
        <Calendar className="w-3 h-3" />
        {date}
      </p>
    </div>
  </div>
);

export default function TannurLandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [membersCount, setMembersCount] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    // Анимация счетчика участников
    const target = 2234;
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setMembersCount(target);
        clearInterval(timer);
      } else {
        setMembersCount(Math.floor(current));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, []);

type FloatingPosition = {
  top: string;
  left: string;
  duration: number;
  delay: number;
};

const [floatingPositions, setFloatingPositions] = useState<FloatingPosition[]>([]);

useEffect(() => {
  const generated = [...Array(6)].map((_, i) => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    duration: 3 + i,
    delay: i * 0.5
  }));
  setFloatingPositions(generated);
}, []);

  
  const events = [
    { title: 'Новый филиал в Алматы', icon: <MapPin className="w-6 h-6" />, type: 'новости' },
    { title: 'Путевка в Египет за 50 человек', icon: <Award className="w-6 h-6" />, type: 'акция' },
    { title: 'TNBA – Новый спикер в Академии', icon: <Users className="w-6 h-6" />, type: 'обучение' },
    { title: 'Мероприятие Tannur Event 08', icon: <Sparkles className="w-6 h-6" />, type: 'событие' },
  ];

  const news = [
    {
      title: 'Новый филиал в Алматы открывает двери',
      date: '22.07.2025',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
    },
    {
      title: 'Путевка в Египет для лучших партнёров',
      date: '22.07.2025',
      image: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=400&h=300&fit=crop',
    },
    {
      title: 'TNBA — Новый спикер в Академии красоты',
      date: '22.07.2025',
      image: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400&h=300&fit=crop',
    },
    {
      title: 'Грандиозное мероприятие в Astana Arena',
      date: '22.07.2025',
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F3] via-white to-[#FFE8E4] p-4 md:p-8">
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
      `}</style>

      {/* Декоративные элементы фона */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-20 right-10 w-72 h-72 bg-[#D2776A] rounded-full blur-3xl opacity-10"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        />
        <div 
          className="absolute bottom-20 left-10 w-96 h-96 bg-[#E89185] rounded-full blur-3xl opacity-10"
          style={{ transform: `translateY(${-scrollY * 0.15}px)` }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Блок 1: Главный баннер */}
        <div className="bg-white/80 backdrop-blur-sm grid grid-cols-1 rounded-3xl p-6 md:p-10 shadow-xl hover:shadow-2xl transition-shadow duration-500">
  {/* Верхний текстовый блок */}
  <div className="flex flex-col items-start text-start gap-6">
    {/* Счетчик */}
    <div 
      className="flex items-center gap-2 mt-2 md:mt-10 bg-gradient-to-r from-[#D2776A] to-[#E89185] text-white rounded-full px-5 py-2.5 text-sm font-bold shadow-lg"
      style={{ animation: 'pulse 2s ease-in-out infinite' }}
    >
      <Users className="w-5 h-5" />
      <span>{membersCount.toLocaleString()} женщин строят бизнес с нами</span>
    </div>

    {/* Заголовок */}
    <h2 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-[#D2776A] to-[#E89185] bg-clip-text text-transparent leading-tight">
      Сообщество успешных женщин Tannur Cosmetics
    </h2>

    {/* Описание */}
    <p className="text-gray-600 text-base md:text-lg max-w-lg leading-relaxed">
      Присоединяйтесь к тысячам женщин, которые строят свой бизнес в индустрии красоты. 
      Обучение, поддержка и возможность финансовой независимости.
    </p>

    {/* Кнопки */}
    <div className="flex flex-col sm:flex-row items-start gap-4 mt-4">
      <button className="group relative bg-gradient-to-r from-[#D2776A] to-[#E89185] text-white px-8 py-4 rounded-full font-bold text-sm hover:shadow-2xl transition-all duration-300 overflow-hidden">
        <span className="relative z-10 flex items-center gap-2">
          Начать зарабатывать
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-[#E89185] to-[#D2776A] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>

      <button className="group relative border-2 border-[#D2776A] text-[#D2776A] px-8 py-4 rounded-full font-bold text-sm hover:text-white transition-all duration-300 overflow-hidden">
        <span className="relative z-10 flex items-center gap-2">
          <Heart className="w-4 h-4" />
          Узнать о преимуществах
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-[#D2776A] to-[#E89185] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </button>
    </div>

    {/* Преимущества */}
    <div className="flex items-center gap-6 mt-6">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Star className="w-4 h-4 text-[#D2776A]" />
        <span>4.9 рейтинг</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Award className="w-4 h-4 text-[#D2776A]" />
        <span>Лучший бренд 2024</span>
      </div>
    </div>
  </div>

  {/* Горизонтальный скролл — теперь снизу */}
  <div className="mt-10">
    <HorizontalMediaScroll />
  </div>
</div>


        {/* Блок 2: События */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-10 shadow-xl hover:shadow-2xl transition-shadow duration-500">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl md:text-3xl font-black text-gray-900">
              События <span className="text-[#D2776A]">августа</span>
            </h3>
            <Sparkles className="w-8 h-8 text-[#D2776A]" style={{ animation: 'float 3s ease-in-out infinite' }} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              {events.map((event, idx) => (
                <EventCard key={idx} {...event} delay={idx * 0.1} />
              ))}
            </div>

            <div className="relative bg-gradient-to-br from-[#FFE8E4] to-[#FFF5F3] rounded-3xl p-8 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                {floatingPositions.map((pos, i) => (

               <div
  key={i}
  className="absolute w-32 h-32 bg-[#D2776A] rounded-full blur-2xl"
  style={{
    top: pos.top,
    left: pos.left,
    animation: `float ${pos.duration}s ease-in-out infinite`,
    animationDelay: `${pos.delay}s`
  }}
/>

                ))}
              </div>
              <div className="relative text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">Будь в курсе!</h4>
                <p className="text-gray-600">Не пропускай важные события и мероприятия</p>
              </div>
            </div>
          </div>
        </div>

        {/* Блок 3: Новости */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-10 shadow-xl hover:shadow-2xl transition-shadow duration-500">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl md:text-3xl font-black text-gray-900">
              Новости <span className="text-[#D2776A]">Tannur</span>
            </h3>
            <button className="text-[#D2776A] font-semibold text-sm hover:underline flex items-center gap-1">
              Все новости
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {news.map((item, idx) => (
              <NewsCard key={idx} {...item} delay={idx * 0.1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}