'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';

interface ActionButtonProps {
  icon: string;       // путь к иконке
  label: string;      // текст кнопки
  href?: string;      // ссылка перехода
  onClick?: () => void; // альтернатива навигации
}

export default function ActionButton({ icon, label, href, onClick }: ActionButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex justify-between items-center text-sm py-3 px-4 rounded-xl bg-white hover:bg-gray-100 w-full transition"
    >
      <span className="flex items-center gap-3 text-[#111] font-medium">
        <Image src={icon} alt="icon" width={20} height={20} />
        {label}
      </span>
      <Image src="/icons/Icon arow botom.png" alt=">" width={18} height={18} />
    </button>
  );
}
