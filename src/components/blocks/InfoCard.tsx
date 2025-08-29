// src/components/blocks/InfoCard.tsx
'use client'

import React from 'react'
import Image from 'next/image'
import { useTranslate } from '@/hooks/useTranslate'

interface InfoCardProps {
  imageSrc: string
  title: string
  subtitle: string
  date: string       // например: "05 Dec"
  count: string      // например: "1270 Notes"
}

export function InfoCard({
  imageSrc,
  title,
  subtitle,
  date,
  count,
}: InfoCardProps) {
  const { t } = useTranslate()

  return (
    <div
      className={`
        relative
        w-full
        max-w-xs
        sm:max-w-sm
        md:max-w-md
        aspect-[4/3]
        rounded-2xl
        overflow-hidden
        bg-gray-900
        text-white
      `}
    >
      {/* фоновая картинка */}
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt={title || t('Изображение')}
          fill
          className="object-cover object-center filter brightness-110"
        />
      </div>

      {/* полупрозрачная «шапка» */}
      <div
        className={`
          relative z-10
          bg-black bg-opacity-60
          px-4 py-3
          rounded-tl-xl
          sm:px-5 sm:py-4
        `}
      >
        <h3 className="text-base sm:text-lg font-semibold leading-snug">
          {title}
        </h3>
        <p className="text-sm sm:text-base text-gray-300 mt-1">
          {subtitle}
        </p>
      </div>

      {/* футер с датой и счетчиком */}
      <div
        className={`
          relative z-10
          flex items-center justify-between
          px-4 py-3
          sm:px-5 sm:py-4
        `}
      >
        <span className="text-xl sm:text-2xl font-bold">{date}</span>
        <span className="text-sm sm:text-base">{count}</span>
      </div>
    </div>
  )
}
