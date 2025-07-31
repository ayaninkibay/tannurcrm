'use client';

import React from 'react';
import Image from 'next/image';

interface BalanceCardProps {
  /** Сумма баланса без символа валюты */
  balance: number | string;
  /** Вариант оформления: light (белый фон) или dark (тёмный фон) */
  variant?: 'light' | 'dark';
}

export default function BalanceCard({ balance, variant = 'light' }: BalanceCardProps) {
  const isDark = variant === 'dark';

  const bgClass = isDark ? 'bg-gray-700' : 'bg-white';
  const labelClass = isDark ? 'text-gray-400' : 'text-gray-500';
  const amountClass = isDark ? 'text-white' : 'text-black';
  const textClass = isDark ? 'text-white' : 'text-black';
  const boxesIcon = isDark ? '/img/boxes.svg' : '/img/boxes_black.svg';
  const historyIcon = isDark ? '/icons/buttom/history_white.svg' : '/icons/buttom/history_black.svg';

  return (
    <div className={`h-full w-full relative flex flex-col ${bgClass} rounded-xl p-6`}>
      {/* Иконка декора */}
      <div className="absolute top-4 right-4 opacity-10 w-[50px] md:w-[100px]">
        <Image
          src={boxesIcon}
          alt="decor"
          width={160}
          height={60}
          className="w-full h-auto object-contain"
        />
      </div>

      <div className="flex-grow" />
      <div>
        <p className={`${labelClass} text-sm mb-1`}>Ваш баланс</p>
        <h2 className={`text-2xl font-bold mb-6 ${amountClass}`}>{balance} ₸</h2>

        {/* Вывод средств */}
        <a
          href="#"
          className="w-full bg-[#D8765E] hover:opacity-90 transition text-white flex items-center justify-center gap-2 py-2 rounded-xl"
        >
          <Image src="/icons/Icon withdraw.png" alt="withdraw" width={16} height={16} />
          <span className="text-sm font-medium">Вывод средств</span>
        </a>

        {/* История */}
        <a
          href="#"
          className={`mt-4 w-full flex items-center justify-center gap-2 text-sm hover:underline transition ${textClass}`}
        >
          <Image src={historyIcon} alt="history" width={16} height={16} />
          <span>Посмотреть историю</span>
        </a>
      </div>
    </div>
  );
}
