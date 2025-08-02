'use client';

import { useSwipeable } from 'react-swipeable';
import { useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';

const images = [
  '/img/product1.jpg',
  '/img/product2.jpg',
  '/img/product3.jpg',
  '/img/product4.jpg',
  '/img/product5.jpg',
  '/img/product6.jpg',
  '/img/product7.jpg',
  '/img/product8.jpg',
];

export default function ThreeDCarousel() {
  const [index, setIndex] = useState(0);

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % images.length);
  };

  const handlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

const getTransformStyle = (relativeIndex: number) => {
  switch (relativeIndex) {
    case 0:
      return 'translate-x-0 scale-100 z-50 blur-none brightness-100 -translate-y-1/2';
    case 1:
      return 'translate-x-[40%] scale-80 z-40 blur-xs brightness-90 -translate-y-[55%]';
    case 2:
      return 'translate-x-[80%] scale-65 z-30 blur-xs brightness-75 -translate-y-[60%]';
    case 3:
      return 'translate-x-[120%] scale-50 z-20 blur-xs brightness-80 -translate-y-[65%]';
    case -1:
      return '-translate-x-[40%] scale-80 z-40 blur-xs brightness-90 -translate-y-[55%]';
    case -2:
      return '-translate-x-[80%] scale-65 z-30 blur-xs brightness-95 -translate-y-[60%]';
    case -3:
      return '-translate-x-[120%] scale-50 z-20 blur-xs brightness-90 -translate-y-[65%]';
    default:
      return 'hidden';
  }
};


  return (
<div {...handlers} className="relative w-full h-[400px] overflow-visible select-none">
  {/* Центрированный контейнер */}
  <div className="absolute left-100 top-1/2 -translate-x-1/2 w-[400px] max-w-none h-full pointer-events-none">
    {images.map((src, i) => {
      let relativeIndex = i - index;

      if (relativeIndex < -images.length / 2) {
        relativeIndex += images.length;
      } else if (relativeIndex > images.length / 2) {
        relativeIndex -= images.length;
      }

      if (Math.abs(relativeIndex) > 3) return null;

      return (
        <div
          key={i}
          className={clsx(
            'absolute top-1/2 left-1/2 w-[220px] h-[240px] transform transition-all duration-500 ease-in-out rounded-xl overflow-hidden shadow-xs pointer-events-auto',
            getTransformStyle(relativeIndex)
          )}
        >
          <Image
            src={src}
            alt={`Slide ${i}`}
            fill
            priority={relativeIndex === 0}
            sizes="(max-width: 768px) 100vw, 240px"
            className="object-cover"
          />
        </div>
      );
    })}
  </div>

  {/* Кнопки */}
  <button
    onClick={handlePrev}
    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full p-2 shadow z-50"
  >
    ◀
  </button>
  <button
    onClick={handleNext}
    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full p-2 shadow z-50"
  >
    ▶
  </button>
</div>


  );
}
