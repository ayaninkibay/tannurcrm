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

  return (
    <Link
      href={href}
      className={clsx(
        'w-full flex items-center justify-between rounded-xl px-4 py-3 transition hover:opacity-90',
        isWhite ? 'bg-white' : 'bg-gray-100'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Иконка в кружке */}
        <div className={clsx('rounded-full p-2', isWhite ? 'bg-gray-100' : 'bg-white')}>
          <Image src={iconSrc} alt="icon" width={20} height={20} />
        </div>

        {/* Текст */}
        <p className="text-sm text-[#111] font-medium">{text}</p>
      </div>

      {/* Стрелка */}
      <Image
        src={
          arrow === 'orange'
            ? '/icons/DoubleIconArrowOrange.svg'
            : '/icons/DoubleIconArrowBlack.svg'
        }
        alt="arrow"
        width={20}
        height={20}
      />
    </Link>
  )
}
