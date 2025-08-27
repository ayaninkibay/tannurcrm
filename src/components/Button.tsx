'use client'

import Link from 'next/link'
import Image from 'next/image'
import clsx from 'clsx'

interface Props {
  text: string
  href: string
  iconSrc: string
  arrow?: 'black' | 'orange'
  variant?: 'white' | 'gray'
}

export default function TannurButton({
  text,
  href,
  iconSrc,
  arrow = 'black',
  variant = 'gray',
}: Props) {
  const isWhite = variant === 'white'

  const baseColors = isWhite
    ? 'bg-white hover:bg-gray-100'
    : 'bg-gray-100 hover:bg-gray-200'

  return (
    <Link
      href={href}
      className={clsx(
        'group w-full flex items-center justify-between rounded-xl px-4 py-3',
        'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#DC7C67]/40',
        baseColors
      )}
    >
      <div className="flex items-center gap-3">
        {/* Иконка в кружке */}
        <div
          className={clsx(
            'rounded-full p-2 transition-colors',
            isWhite ? 'bg-gray-100 group-hover:bg-white' : 'bg-white group-hover:bg-gray-100'
          )}
        >
          <Image 
            src={iconSrc} 
            alt="icon" 
            width={20} 
            height={20}
            style={{ width: '20px', height: '20px' }}
          />
        </div>

        {/* Текст */}
        <p className="text-sm text-[#111] font-medium">{text}</p>
      </div>

      {/* Стрелка */}
      <div className="relative w-[20px] h-[20px]">
        {/* Чёрная */}
        <Image
          src="/icons/DoubleIconArrowBlack.svg"
          alt="arrow"
          width={20}
          height={20}
          style={{ width: '20px', height: '20px' }}
          className={clsx(
            'absolute inset-0 object-contain transition-opacity duration-200',
            arrow === 'orange' ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'
          )}
        />
        {/* Оранжевая */}
        <Image
          src="/icons/DoubleIconArrowOrange.svg"
          alt="arrow hover"
          width={20}
          height={20}
          style={{ width: '20px', height: '20px' }}
          className="absolute inset-0 object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        />
      </div>
    </Link>
  )
}