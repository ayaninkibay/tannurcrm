'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useTranslate } from '@/hooks/useTranslate';

const tabs = [
  'Главная',
  'О компании',
  'Магазин',
  'Экскурсия',
  'Документы'
];

interface MobileTabMenuProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function MobileTabMenu({ activeTab, setActiveTab }: MobileTabMenuProps) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslate();

  return (
    <div className="relative block md:hidden ml-2">
      {/* Кнопка меню справа */}
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow"
        aria-label={t('Меню')}
        title={t('Меню')}
      >
        <Image src="/icons/hamburger.svg" alt={t('Меню')} width={20} height={20} />
      </button>

      {/* Выпадающее меню */}
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-xl overflow-hidden z-50">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab); // сохраняем ключ (RU), отображаем переводом
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-100 transition-colors ${
                activeTab === tab ? 'bg-gray-100 text:black' : 'text-gray-800'
              }`}
            >
              {t(tab)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
