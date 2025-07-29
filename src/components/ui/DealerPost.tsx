'use client';

import Image from 'next/image';
import React from 'react';

interface DealerPostProps {
  /** Путь до картинки */
  imageSrc: string;
  /** Альтернативный текст для изображения */
  alt?: string;
  /** Заголовок или название поста */
  title: string;
}

/**
 * Компонент карточки поста дилера: изображение + название
 * Использование:
 * <DealerPost imageSrc="/images/...jpg" alt="Описание" title="Заголовок" />
 */
export default function DealerPost({ imageSrc, alt = '', title }: DealerPostProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="w-full h-[180px] relative">
        <Image
          src={imageSrc}
          alt={alt}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-500">{title}</p>
      </div>
    </div>
  );
}
