'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import './VerticalMediaScroll.css';

const baseItems = [
  { src: '/img/events/tannur_1.jpg', title: '35 000 000 тг', subtitle: 'Оборот команды', color: 'bg-gray-100' },
  { src: '/img/events/tannur_2.jpg', title: 'Лучший 2025', subtitle: 'Партнёр года', color: 'bg-gray-100' },
  { src: '/img/events/tannur_3.jpg', title: 'Tannur Events 2025', subtitle: 'Участники ивента 22.08', color: 'bg-gray-100' },
  { src: '/img/events/tannur_4.jpg', title: '2 345 дилеров', subtitle: 'За 1 год самостоятельно', color: 'bg-gray-100' },
  { src: '/img/events/tannur_5.jpg', title: '13 000 932 тг', subtitle: 'За одну неделю', color: 'bg-gray-100' },
  { src: '/img/events/tannur_6.jpg', title: '86 регионов', subtitle: 'География продаж', color: 'bg-gray-100' },
  { src: '/img/events/tannur_7.jpg', title: '48 часов', subtitle: 'До полной распродажи', color: 'bg-gray-100' },
  { src: '/img/events/tannur_8.jpg', title: '1 200 заказов', subtitle: 'Только за выходные', color: 'bg-gray-100' },
  { src: '/img/events/tannur_9.jpg', title: 'Tannur Academy', subtitle: '300 новых выпускников', color: 'bg-gray-100' },
  { src: '/img/events/tannur_10.jpg', title: 'Премия бренда', subtitle: 'Признание индустрии', color: 'bg-gray-100' },
  { src: '/img/events/tannur_11.jpg', title: '10 000 подписок', subtitle: 'Только за август', color: 'bg-gray-100' },
];


const SCROLL_SPEED = 0.5;

// Генерация большого количества элементов
const generateItems = (count: number) => {
  const result: typeof baseItems = [];
  for (let i = 0; i < count; i++) {
    result.push(baseItems[i % baseItems.length]);
  }
  return result;
};

export default function VerticalMediaScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const items = [...generateItems(100), ...generateItems(100)];


  const col1 = items.filter((_, i) => i % 2 === 0);
  const col2 = items.filter((_, i) => i % 2 !== 0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationFrame: number;

    const scroll = () => {
      if (!paused) {
        el.scrollTop += SCROLL_SPEED;
        if (el.scrollTop >= el.scrollHeight / 2) {
  el.scrollTop -= el.scrollHeight / 2;
}

      }
      animationFrame = requestAnimationFrame(scroll);
    };

    animationFrame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrame);
  }, [paused]);

  const renderBlock = (item: typeof items[number], i: number, reverse = false) => (
    <div key={`${item.src}-${i}`} className="flex flex-col items-center gap-2">
      {!reverse && (
        <div className="relative w-[145px] h-[205px] md:w-[200px] md:h-[260px] overflow-hidden rounded-xl">
          <Image src={item.src} alt={`Photo ${i}`} fill className="object-cover" />
        </div>
      )}
      <div className={`w-[150px] h-[60px] md:w-[200px] md:h-[80px] rounded-xl p-4 text-black flex flex-col justify-center bg-gradient-to-br ${item.color}`}>
        <h3 className="text-xs font-semibold">{item.title}</h3>
        <p className="text-[10px] opacity-80">{item.subtitle}</p>
      </div>
      {reverse && (
        <div className="relative w-[145px] h-[205px] md:w-[200px] md:h-[260px] overflow-hidden rounded-xl">
          <Image src={item.src} alt={`Photo ${i}`} fill className="object-cover" />
        </div>
      )}
    </div>
  );

  return (
    <div className="relative h-[550px] overflow-hidden w-full rounded-2xl">
      {/* Градиенты */}
      <div className="absolute top-0 left-0 w-full h-10 z-10 pointer-events-none backdrop-blur-md bg-[#F4F4F4]/60"
     style={{ WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)', maskImage: 'linear-gradient(to bottom, black, transparent)' }}
/>
      {/* Нижний блок с мягким размытием */}
<div className="absolute bottom-0 left-0 w-full h-10 z-10 pointer-events-none backdrop-blur-md bg-[#F4F4F4]/60"
     style={{ WebkitMaskImage: 'linear-gradient(to top, white, transparent)', maskImage: 'linear-gradient(to top, black, transparent)' }}
/>

      {/* Контейнер со скроллом */}
      <div
        ref={scrollRef}
        className="scroll-container h-full overflow-y-scroll no-scrollbar px-2 relative z-0"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="grid grid-cols-2 gap-x-4">
          <div className="flex flex-col gap-6">
            {col1.map((item, i) => renderBlock(item, i, false))}
          </div>
          <div className="flex flex-col gap-6 mt-[150px]">
            {col2.map((item, i) => renderBlock(item, i, true))}
          </div>
        </div>
      </div>
    </div>
  );
}
