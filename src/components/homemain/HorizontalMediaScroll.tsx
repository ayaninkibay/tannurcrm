'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

// Массив данных для карточек
const staticCards = [
  { 
    src: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=280&h=320&fit=crop&crop=faces', 
    fallbackSrc: 'https://picsum.photos/280/320?random=1',
    title: '35 000 000 тг', 
    subtitle: 'Оборот команды', 
    person: 'Айдар Каримов', 
    role: 'Топ менеджер'
  },
  { 
    src: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=280&h=320&fit=crop&crop=faces',
    fallbackSrc: 'https://picsum.photos/280/320?random=2',
    title: 'Лучший 2025', 
    subtitle: 'Партнёр года', 
    person: 'Асель Нурланова', 
    role: 'Региональный директор'
  },
  { 
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=280&h=320&fit=crop&crop=faces',
    fallbackSrc: 'https://picsum.photos/280/320?random=3',
    title: 'Tannur Events 2025', 
    subtitle: 'Участники ивента 22.08', 
    person: 'Данияр Омаров', 
    role: 'Ведущий специалист'
  },
  { 
    src: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=280&h=320&fit=crop&crop=faces',
    fallbackSrc: 'https://picsum.photos/280/320?random=4',
    title: '2 345 дилеров', 
    subtitle: 'За 1 год самостоятельно', 
    person: 'Жанара Сейтказы', 
    role: 'Бизнес партнер'
  },
  { 
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=280&h=320&fit=crop&crop=faces',
    fallbackSrc: 'https://picsum.photos/280/320?random=5',
    title: '13 000 932 тг', 
    subtitle: 'За одну неделю', 
    person: 'Нурлан Абишев', 
    role: 'Старший консультант'
  },
  { 
    src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=280&h=320&fit=crop&crop=faces',
    fallbackSrc: 'https://picsum.photos/280/320?random=6',
    title: '86 регионов', 
    subtitle: 'География продаж', 
    person: 'Камила Досжанова', 
    role: 'Координатор проекта'
  },
  { 
    src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=280&h=320&fit=crop&crop=faces',
    fallbackSrc: 'https://picsum.photos/280/320?random=7',
    title: '48 часов', 
    subtitle: 'До полной распродажи', 
    person: 'Ерлан Токтаров', 
    role: 'Менеджер по развитию'
  },
  { 
    src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=280&h=320&fit=crop&crop=faces',
    fallbackSrc: 'https://picsum.photos/280/320?random=8',
    title: '1 200 заказов', 
    subtitle: 'Только за выходные', 
    person: 'Арина Казыбекова', 
    role: 'Специалист отдела'
  },
  { 
    src: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=280&h=320&fit=crop&crop=faces',
    fallbackSrc: 'https://picsum.photos/280/320?random=9',
    title: 'Tannur Academy', 
    subtitle: '300 новых выпускников', 
    person: 'Бекзат Алиев', 
    role: 'Тренинг менеджер'
  },
  { 
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=280&h=320&fit=crop&crop=faces',
    fallbackSrc: 'https://picsum.photos/280/320?random=10',
    title: 'Премия бренда', 
    subtitle: 'Признание индустрии', 
    person: 'Диана Ержанова', 
    role: 'Бренд амбассадор'
  },
  { 
    src: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=280&h=320&fit=crop&crop=faces',
    fallbackSrc: 'https://picsum.photos/280/320?random=11',
    title: '10 000 подписок', 
    subtitle: 'Только за август', 
    person: 'Санжар Утебаев', 
    role: 'Цифровой эксперт'
  },
];

const duplicatedCards = [...staticCards, ...staticCards, ...staticCards];

// Компонент карточки с обработкой ошибок изображений
interface CardProps {
  card: typeof staticCards[0];
  index: number;
}

const Card: React.FC<CardProps> = ({ card, index }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(card.src);

  const handleImageError = () => {
    console.error(`❌ Ошибка загрузки: ${currentSrc}`);
    if (currentSrc === card.src && card.fallbackSrc) {
      // Пробуем fallback изображение
      console.log(`🔄 Пробуем fallback: ${card.fallbackSrc}`);
      setCurrentSrc(card.fallbackSrc);
      setImageError(false);
    } else {
      setImageError(true);
    }
  };

  const handleImageLoad = () => {
    console.log(`✅ Загружено: ${currentSrc}`);
    setImageLoaded(true);
  };

  return (
    <div
      key={`${index}-${card.person}`}
      className="relative w-[280px] h-[320px] flex-shrink-0 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-slate-800 to-slate-900 group"
      style={{ userSelect: 'none' }}
    >
      {/* Показываем изображение только если нет ошибки */}
      {!imageError ? (
        <>
          {/* Skeleton loader пока изображение загружается */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-300 animate-pulse flex items-center justify-center">
              <div className="text-gray-500 text-sm">Загрузка...</div>
            </div>
          )}
          
          <Image
            src={currentSrc}
            alt={card.person}
            fill
            sizes="(max-width: 768px) 100vw, 280px"
            className={`object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            draggable={false}
            priority={index < 4}
            onError={handleImageError}
            onLoad={handleImageLoad}
            // Добавляем unoptimized для проблемных случаев
            unoptimized={process.env.NODE_ENV === 'development'}
          />
        </>
      ) : (
        /* Fallback при ошибке загрузки изображения */
        <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-4xl mb-2">🖼️</div>
            <div className="text-xs opacity-75">Изображение недоступно</div>
            <div className="text-xs opacity-50 mt-1">{currentSrc}</div>
          </div>
        </div>
      )}

      {/* Темный оверлей */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

      {/* Информация о карточке */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white pointer-events-none">
        <div className="inline-block bg-[#D77E6C] text-white px-2 py-1 rounded-md text-xs font-medium mb-2">
          Tannur Cosmetics
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-lg leading-tight">{card.person}</h3>
          <p className="text-sm opacity-90">{card.role}</p>
        </div>

        <div className="mt-2 pt-2 border-t border-white/20">
          <p className="font-semibold text-sm">{card.title}</p>
          <p className="text-xs opacity-80">{card.subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default function HorizontalMediaScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const SCROLL_SPEED = 50;
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const currentPositionRef = useRef<number>(0);

  // Debug: проверяем доступность изображений
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('🔍 Используем обычные img теги без Next.js Image');
    }
  }, []);

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
        const pixelsToScroll = (SCROLL_SPEED * deltaTime) / 1000;
        currentPositionRef.current += pixelsToScroll;

        const singleSetWidth = contentContainer.scrollWidth / 3;

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
    const walk = (x - startX) * 1.5;
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
      <div className="absolute left-[-40px] top-0 h-full w-48 z-10 pointer-events-none">
        <div className="h-full w-full bg-gradient-to-r from-white via-white/60 to-transparent blur-2xl" />
      </div>

      <div className="absolute right-[-40px] top-0 h-full w-48 z-10 pointer-events-none">
        <div className="h-full w-full bg-gradient-to-l from-white via-white/60 to-transparent blur-2xl" />
      </div>

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
            <Card key={`${index}-${card.person}`} card={card} index={index} />
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