'use client';

import React from 'react';
import { useTranslate } from '@/hooks/useTranslate';

interface BonusProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTurnover: number;
}

// SVG иконки
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="#6B7280"/>
  </svg>
);

const PlaneIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="#EA580C"/>
  </svg>
);

const CarIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" fill="#EA580C"/>
  </svg>
);

const HomeIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="#EA580C"/>
  </svg>
);

export const BonusProgramModal: React.FC<BonusProgramModalProps> = ({ isOpen, onClose, currentTurnover }) => {
  const { t } = useTranslate();

  if (!isOpen) return null;

  const bonusTiers = [
    {
      amount: 30000000,
      name: t('Путёвка на двоих'),
      description: t('Отдых в лучших курортах мира'),
      icon: <PlaneIcon />,
      color: 'bg-orange-50 border-orange-200'
    },
    {
      amount: 60000000,
      name: t('Новый автомобиль'),
      description: t('Премиальный автомобиль на ваш выбор'),
      icon: <CarIcon />,
      color: 'bg-orange-100 border-orange-300'
    },
    {
      amount: 90000000,
      name: t('Квартира'),
      description: t('Недвижимость в новом комплексе'),
      icon: <HomeIcon />,
      color: 'bg-orange-200 border-orange-400'
    }
  ];

  const maxAmount = 90000000;
  const currentProgress = Math.min((currentTurnover / maxAmount) * 100, 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{t('Бонусная программа Tannur')}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* График прогресса */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-700 mb-4">{t('Ваш прогресс')}</h3>
            
            {/* Визуализация прогресса */}
            <div className="relative">
              {/* Линия прогресса */}
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500"
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
              
              {/* Метки уровней */}
              <div className="relative mt-2">
                {bonusTiers.map((tier, index) => {
                  const position = (tier.amount / maxAmount) * 100;
                  const isReached = currentTurnover >= tier.amount;
                  
                  return (
                    <div 
                      key={tier.amount}
                      className="absolute flex flex-col items-center"
                      style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                    >
                      <div className={`w-3 h-3 rounded-full -mt-7 ${
                        isReached ? 'bg-orange-500' : 'bg-gray-300'
                      }`} />
                      <span className="text-xs text-gray-500 mt-2 whitespace-nowrap">
                        {(tier.amount / 1000000).toFixed(0)}M
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Текущий товарооборот */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">{t('Текущий товарооборот')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentTurnover.toLocaleString('ru-RU')} ₸
              </p>
            </div>
          </div>

          {/* Уровни бонусов */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">{t('Уровни наград')}</h3>
            
            {bonusTiers.map((tier) => {
              const isReached = currentTurnover >= tier.amount;
              const isNext = !isReached && currentTurnover < tier.amount && 
                           (bonusTiers.findIndex(t => t.amount > currentTurnover) === bonusTiers.indexOf(tier));
              
              return (
                <div 
                  key={tier.amount}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 transition ${
                    isReached ? 'bg-green-50 border-green-200' :
                    isNext ? tier.color : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className={`p-3 rounded-lg ${isReached ? 'bg-green-100' : 'bg-white'}`}>
                    {tier.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{tier.name}</h4>
                      {isReached && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          {t('Достигнуто')}
                        </span>
                      )}
                      {isNext && (
                        <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                          {t('Следующая цель')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{tier.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{t('Необходимо')}</span>
                      <span className="font-semibold text-gray-900">
                        {tier.amount.toLocaleString('ru-RU')} ₸
                      </span>
                    </div>
                    {!isReached && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">
                          {t('Осталось')}: {(tier.amount - currentTurnover).toLocaleString('ru-RU')} ₸
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Информация */}
          <div className="p-4 bg-orange-50 rounded-xl">
            <p className="text-sm text-gray-700">
              {t('Бонусная программа Tannur награждает наших лучших партнеров за их успехи. Увеличивайте товарооборот и получайте ценные призы!')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            {t('Понятно')}
          </button>
        </div>
      </div>
    </div>
  );
};