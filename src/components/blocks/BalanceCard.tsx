'use client';

import React from 'react';
import Image from 'next/image';

interface BalanceCardProps {
  /** Сумма баланса без символа валюты */
  balance: number | string;
  /** Вариант оформления: light (белый фон) или dark (чёрный фон) */
  variant?: 'light' | 'dark';
}

export default function BalanceCard({ balance, variant = 'light' }: BalanceCardProps) {
  const isDark = variant === 'dark';

  const bgClass = isDark ? 'bg-black' : 'bg-white';
  const labelClass = isDark ? 'text-gray-400' : 'text-gray-500';
  const amountClass = isDark ? 'text-white' : 'text-black';
  const textClass = isDark ? 'text-white' : 'text-black';

  return (
    <div className={`h-full w-full relative flex flex-col ${bgClass}`}>
      <Image
        src="/icons/Icon decor.png"
        alt="decor"
        fill
        sizes="20px"
        className="absolute top-5 right-5 opacity-50"
      />
      <div className="flex-grow" />
      <div>
        <p className={`${labelClass} text-sm mb-1`}>Ваш баланс</p>
        <h2 className={`text-2xl font-bold mb-6 ${amountClass}`}>{balance} ₸</h2>

        {/* Вывод средств как ссылка */}
        <a
          href="#"
          className="w-full bg-[#D8765E] hover:opacity-90 transition text-white flex items-center justify-center gap-2 py-2 rounded-xl"
        >
          <Image src="/icons/Icon withdraw.png" alt="withdraw" width={16} height={16} />
          <span className="text-sm font-medium">Вывод средств</span>
        </a>

        {/* История как ссылка */}
        <a
          href="#"
          className={`mt-4 w-full flex items-center justify-center gap-2 text-sm hover:underline transition ${textClass}`}
        >
          <Image src="/icons/Icon time.png" alt="history" width={16} height={16} />
          <span>Посмотреть историю</span>
        </a>
      </div>
    </div>
  );
}
