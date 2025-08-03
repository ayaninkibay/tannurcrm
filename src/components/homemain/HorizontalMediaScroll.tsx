'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const staticCards = [
  { 
    src: '/img/events/tannur_1.jpg', 
    title: '35 000 000 тг', 
    subtitle: 'Оборот команды', 
    person: 'Айдар Каримов', 
    role: 'Топ менеджер'
  },
  { 
    src: '/img/events/tannur_2.jpg', 
    title: 'Лучший 2025', 
    subtitle: 'Партнёр года', 
    person: 'Асель Нурланова', 
    role: 'Региональный директор'
  },
  { 
    src: '/img/events/tannur_3.jpg', 
    title: 'Tannur Events 2025', 
    subtitle: 'Участники ивента 22.08', 
    person: 'Данияр Омаров', 
    role: 'Ведущий специалист'
  },
  { 
    src: '/img/events/tannur_4.jpg', 
    title: '2 345 дилеров', 
    subtitle: 'За 1 год самостоятельно', 
    person: 'Жанара Сейтказы', 
    role: 'Бизнес партнер'
  },
  { 
    src: '/img/events/tannur_5.jpg', 
    title: '13 000 932 тг', 
    subtitle: 'За одну неделю', 
    person: 'Нурлан Абишев', 
    role: 'Старший консультант'
  },
  { 
    src: '/img/events/tannur_6.jpg', 
    title: '86 регионов', 
    subtitle: 'География продаж', 
    person: 'Камила Досжанова', 
    role: 'Координатор проекта'
  },
  { 
    src: '/img/events/tannur_7.jpg', 
    title: '48 часов', 
    subtitle: 'До полной распродажи', 
    person: 'Ерлан Токтаров', 
    role: 'Менеджер по развитию'
  },
  { 
    src: '/img/events/tannur_8.jpg', 
    title: '1 200 заказов', 
    subtitle: 'Только за выходные', 
    person: 'Арина Казыбекова', 
    role: 'Специалист отдела'
  },
  { 
    src: '/img/events/tannur_9.jpg', 
    title: 'Tannur Academy', 
    subtitle: '300 новых выпускников', 
    person: 'Бекзат Алиев', 
    role: 'Тренинг менеджер'
  },
  { 
    src: '/img/events/tannur_10.jpg', 
    title: 'Премия бренда', 
    subtitle: 'Признание индустрии', 
    person: 'Диана Ержанова', 
    role: 'Бренд амбассадор'
  },
  { 
    src: '/img/events/tannur_11.jpg', 
    title: '10 000 подписок', 
    subtitle: 'Только за август', 
    person: 'Санжар Утебаев', 
    role: 'Цифровой эксперт'
  },
];

// Дублируем карточки для бесконечного скролла
const duplicatedCards = [...staticCards, ...staticCards, ...staticCards];

export default function HorizontalMediaScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Параметры скролла
  const SCROLL_SPEED = 50; // Пикселей в секунду
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const currentPositionRef = useRef<number>(0);

  // Функция автоскролла с использованием времени для плавности
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    const contentContainer = contentRef.current;
    if (!scrollContainer || !contentContainer || isDragging) return;

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (!isPaused && !isDragging) {
        // Вычисляем сколько пикселей нужно прокрутить
        const pixelsToScroll = (SCROLL_SPEED * deltaTime) / 1000;
        currentPositionRef.current += pixelsToScroll;

        // Получаем ширину одного набора карточек
        const singleSetWidth = contentContainer.scrollWidth / 3;

        // Если прокрутили больше одного набора, сбрасываем позицию
        if (currentPositionRef.current >= singleSetWidth) {
          currentPositionRef.current = currentPositionRef.current - singleSetWidth;
        }

        scrollContainer.scrollLeft = currentPositionRef.current;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, isDragging]);

  // Обработчики перетаскивания мышью
  const handleMouseDown = (e: React.MouseEvent) => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    setIsDragging(true);
    setStartX(e.pageX - scrollContainer.offsetLeft);
    setScrollLeft(scrollContainer.scrollLeft);
    scrollContainer.style.cursor = 'grabbing';
    scrollContainer.style.userSelect = 'none';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const x = e.pageX - scrollContainer.offsetLeft;
    const walk = (x - startX) * 1.5; // Скорость перетаскивания
    const newScrollLeft = scrollLeft - walk;
    
    scrollContainer.scrollLeft = newScrollLeft;
    currentPositionRef.current = newScrollLeft;
  };

  const handleMouseUp = () => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    setIsDragging(false);
    scrollContainer.style.cursor = 'grab';
    scrollContainer.style.userSelect = 'auto';
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
    setIsPaused(false);
  };

  // Обработчики для touch устройств
  const handleTouchStart = (e: React.TouchEvent) => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainer.offsetLeft);
    setScrollLeft(scrollContainer.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const x = e.touches[0].pageX - scrollContainer.offsetLeft;
    const walk = (x - startX) * 1.5;
    const newScrollLeft = scrollLeft - walk;
    
    scrollContainer.scrollLeft = newScrollLeft;
    currentPositionRef.current = newScrollLeft;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative h-[400px] overflow-hidden w-full bg-gradient-to-r from-slate-50 to-white">
{/* Левый градиент-блюр */}
<div className="absolute left-[-40px] top-0 h-full w-48 z-10 pointer-events-none">
  <div className="h-full w-full bg-gradient-to-r from-white via-white/60 to-transparent blur-2xl" />
</div>

{/* Правый градиент-блюр */}
<div className="absolute right-[-40px] top-0 h-full w-48 z-10 pointer-events-none">
  <div className="h-full w-full bg-gradient-to-l from-white via-white/60 to-transparent blur-2xl" />
</div>


      {/* Контейнер со скроллом */}
      <div
        ref={scrollRef}
        className="h-full overflow-x-hidden py-8 px-8 cursor-grab"
        style={{ 
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        } as React.CSSProperties}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          ref={contentRef}
          className="flex gap-6 h-full items-center"
          style={{ width: 'max-content' }}
        >
{duplicatedCards.map((card, index) => (
  <div
    key={`${index}-${card.person}`}
    className="relative w-[280px] h-[320px] flex-shrink-0 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-slate-800 to-slate-900 group"
    style={{ userSelect: 'none' }}
  >
    {/* Фоновое изображение */}
<Image
  src={card.src}
  alt={card.person}
  fill
  sizes="(max-width: 768px) 100vw, 280px"
  className="object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
  draggable={false}
  priority={index < 4}
/>


    {/* Темный оверлей */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

    {/* Информация внизу */}
    <div className="absolute bottom-0 left-0 right-0 p-4 text-white pointer-events-none">
      {/* Название компании */}
      <div className="inline-block bg-[#D77E6C] text-white px-2 py-1 rounded-md text-xs font-medium mb-2">
        Tannur Cosmetics
      </div>

      {/* Информация о человеке */}
      <div className="space-y-1">
        <h3 className="font-bold text-lg leading-tight">{card.person}</h3>
        <p className="text-sm opacity-90">{card.role}</p>
      </div>

      {/* Достижение */}
      <div className="mt-2 pt-2 border-t border-white/20">
        <p className="font-semibold text-sm">{card.title}</p>
        <p className="text-xs opacity-80">{card.subtitle}</p>
      </div>
    </div>
  </div>
))}

        </div>
      </div>

      <style jsx global>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}