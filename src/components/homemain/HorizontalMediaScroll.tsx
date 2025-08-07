'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image'; // Импорт компонента Image из Next.js

// Массив данных для карточек, каждая с путем к изображению
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

// Дублируем карточки, чтобы создать эффект бесконечного скролла
const duplicatedCards = [...staticCards, ...staticCards, ...staticCards];

export default function HorizontalMediaScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Параметры автоскролла
  const SCROLL_SPEED = 50; // Пикселей в секунду
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const currentPositionRef = useRef<number>(0);

  // Эффект для реализации автоскролла
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
        // Вычисляем, сколько пикселей нужно прокрутить, исходя из времени
        const pixelsToScroll = (SCROLL_SPEED * deltaTime) / 1000;
        currentPositionRef.current += pixelsToScroll;

        // Ширина одного набора карточек (поскольку мы дублируем 3 раза, это 1/3 общей ширины)
        const singleSetWidth = contentContainer.scrollWidth / 3;

        // Если прокрутили больше одного набора, сбрасываем позицию для "бесконечности"
        if (currentPositionRef.current >= singleSetWidth) {
          currentPositionRef.current = currentPositionRef.current - singleSetWidth;
        }

        scrollContainer.scrollLeft = currentPositionRef.current;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    // Очистка анимации при размонтировании компонента
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, isDragging]); // Зависимости для перерендера эффекта

  // Обработчики для перетаскивания мышью
  const handleMouseDown = (e: React.MouseEvent) => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    setIsDragging(true);
    setStartX(e.pageX - scrollContainer.offsetLeft); // Начальная позиция курсора относительно контейнера
    setScrollLeft(scrollContainer.scrollLeft);      // Текущая позиция скролла
    scrollContainer.style.cursor = 'grabbing';
    scrollContainer.style.userSelect = 'none'; // Отключаем выделение текста при перетаскивании
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault(); // Предотвращаем стандартное поведение (например, выделение текста)
    
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const x = e.pageX - scrollContainer.offsetLeft;
    const walk = (x - startX) * 1.5; // Вычисляем смещение и увеличиваем скорость перетаскивания
    const newScrollLeft = scrollLeft - walk; // Новая позиция скролла
    
    scrollContainer.scrollLeft = newScrollLeft;
    currentPositionRef.current = newScrollLeft; // Обновляем текущую позицию для автоскролла
  };

  const handleMouseUp = () => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    setIsDragging(false);
    scrollContainer.style.cursor = 'grab';
    scrollContainer.style.userSelect = 'auto'; // Включаем выделение текста обратно
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp(); // Завершаем перетаскивание, если курсор ушел с элемента
    }
    setIsPaused(false); // Возобновляем автоскролл
  };

  // Обработчики для сенсорных устройств (touch)
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
      {/* Левый градиент-блюр для визуального эффекта */}
      <div className="absolute left-[-40px] top-0 h-full w-48 z-10 pointer-events-none">
        <div className="h-full w-full bg-gradient-to-r from-white via-white/60 to-transparent blur-2xl" />
      </div>

      {/* Правый градиент-блюр для визуального эффекта */}
      <div className="absolute right-[-40px] top-0 h-full w-48 z-10 pointer-events-none">
        <div className="h-full w-full bg-gradient-to-l from-white via-white/60 to-transparent blur-2xl" />
      </div>

      {/* Контейнер со скроллом, который прокручивается */}
      <div
        ref={scrollRef}
        className="h-full overflow-x-hidden py-8 px-8 cursor-grab"
        // Инлайн-стили для скрытия полосы прокрутки в разных браузерах
        style={{ 
          scrollbarWidth: 'none', // Для Firefox
          msOverflowStyle: 'none', // Для IE/Edge
          WebkitOverflowScrolling: 'touch' // Для плавного скролла на iOS
        } as React.CSSProperties}
        // Обработчики событий мыши и касания
        onMouseEnter={() => setIsPaused(true)} // Пауза при наведении мыши
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Контейнер содержимого, который фактически прокручивается */}
        <div 
          ref={contentRef}
          className="flex gap-6 h-full items-center"
          style={{ width: 'max-content' }} // Важно для горизонтального скролла
        >
          {/* Маппинг по дублированным карточкам для отображения */}
          {duplicatedCards.map((card, index) => (
            <div
              key={`${index}-${card.person}`} // Уникальный ключ для React
              className="relative w-[280px] h-[320px] flex-shrink-0 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-slate-800 to-slate-900 group"
              style={{ userSelect: 'none' }} // Отключаем выделение текста на карточках
            >
              {/* Компонент Image из Next.js для отображения изображений */}
              <Image
                src={card.src} // Путь к изображению (например, /img/events/tannur_1.jpg)
                alt={card.person} // Alt-текст для доступности
                fill // Заполняет родительский элемент
                sizes="(max-width: 768px) 100vw, 280px" // Оптимизация для разных размеров экрана
                className="object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                draggable={false} // Отключает перетаскивание изображения
                priority={index < 4} // Загружает первые 4 изображения с высоким приоритетом
                onError={(e) => console.error(`Error loading image: ${card.src}`, e)} // Добавляем обработчик ошибок
              />

              {/* Темный оверлей для улучшения читаемости текста */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

              {/* Информация о карточке внизу */}
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

      {/* Глобальные стили для скрытия полосы прокрутки */}
      <style jsx global>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}