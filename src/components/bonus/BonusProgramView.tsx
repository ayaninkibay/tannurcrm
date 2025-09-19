'use client';

import React, { useEffect, useState } from 'react';
import { useBonusModule } from '@/lib/bonus/useBonusModule';
import { useTranslate } from '@/hooks/useTranslate';
import { eventsService } from '@/lib/events/EventService';

// SVG иконки
const PlaneIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="#EA580C"/>
  </svg>
);

const CarIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" fill="#EA580C"/>
  </svg>
);

const HomeIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="#EA580C"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#10B981"/>
  </svg>
);

interface BonusProgramViewProps {
  userId?: string;
}

export const BonusProgramView: React.FC<BonusProgramViewProps> = ({ userId }) => {
  const { t } = useTranslate();
  const { getDealerTurnover, formatAmount } = useBonusModule();
  const [dealerData, setDealerData] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        // Загружаем данные дилера
        const data = await getDealerTurnover(userId);
        setDealerData(data);

        // Загружаем события и участие дилера
        const participation = await eventsService.getDealerEventParticipation(userId);
        setEvents(participation);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, getDealerTurnover]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const currentTurnover = dealerData?.total_turnover || 0;
  const maxAmount = 90000000;
  const overallProgress = Math.min((currentTurnover / maxAmount) * 100, 100);

  // Стандартные уровни бонусной программы
  const bonusTiers = [
    {
      amount: 30000000,
      name: t('Путёвка на двоих'),
      description: t('Отдых в лучших курортах мира'),
      icon: <PlaneIcon />,
      benefits: [
        t('7-10 дней отдыха'),
        t('Любое направление на выбор'),
        t('Премиум размещение'),
        t('Все включено')
      ]
    },
    {
      amount: 60000000,
      name: t('Новый автомобиль'),
      description: t('Премиальный автомобиль бизнес-класса'),
      icon: <CarIcon />,
      benefits: [
        t('Автомобиль бизнес-класса'),
        t('Полная страховка КАСКО'),
        t('Регистрация и оформление'),
        t('Гарантия 3 года')
      ]
    },
    {
      amount: 90000000,
      name: t('Квартира'),
      description: t('Современная квартира в новостройке'),
      icon: <HomeIcon />,
      benefits: [
        t('50-70 кв.м'),
        t('Новостройка'),
        t('С ремонтом'),
        t('Оформление на вас')
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Прогресс пользователя */}
      <div className="bg-white rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-6">{t('Ваш прогресс в программе')}</h2>
        
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">{t('Ваш товарооборот')}</p>
            <p className="text-xl font-bold text-gray-900">{formatAmount(currentTurnover)}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">{t('Общий прогресс')}</p>
            <p className="text-xl font-bold text-orange-600">{Math.round(overallProgress)}%</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">{t('Текущий уровень')}</p>
            <p className="text-xl font-bold text-gray-900">
              {dealerData?.bonus_tier === 'apartment' && t('Квартира')}
              {dealerData?.bonus_tier === 'car' && t('Автомобиль')}
              {dealerData?.bonus_tier === 'vacation' && t('Путёвка')}
              {dealerData?.bonus_tier === 'none' && t('Начальный')}
            </p>
          </div>
        </div>

        {/* График общего прогресса */}
        <div className="relative mb-8">
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-1000"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          
          {/* Метки уровней */}
          <div className="absolute w-full -top-2">
            {bonusTiers.map((tier) => {
              const position = (tier.amount / maxAmount) * 100;
              const isReached = currentTurnover >= tier.amount;
              
              return (
                <div 
                  key={tier.amount}
                  className="absolute flex flex-col items-center"
                  style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isReached ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {isReached && <CheckCircleIcon />}
                  </div>
                  <span className="text-xs text-gray-600 mt-2 hidden md:block whitespace-nowrap">
                    {(tier.amount / 1000000)}M
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* События с индивидуальным прогрессом */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">{t('Активные события')}</h2>
        
        {events.map((item) => {
          const progress = item.event.target_amount > 0 
            ? Math.min((currentTurnover / Number(item.event.target_amount)) * 100, 100)
            : 0;
          const remaining = Math.max(0, Number(item.event.target_amount) - currentTurnover);
            
          return (
            <div key={item.event.id} className="bg-white rounded-2xl p-6 border-2 border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{item.event.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{item.event.description}</p>
                </div>
                {item.is_achieved && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                    {t('Достигнуто')}
                  </span>
                )}
              </div>

              {/* Прогресс */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('Ваш прогресс')}</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      item.is_achieved ? 'bg-green-500' : 'bg-gradient-to-r from-orange-400 to-orange-600'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">{t('Ваш товарооборот')}</p>
                    <p className="font-semibold text-gray-900">{formatAmount(currentTurnover)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">{t('Цель')}</p>
                    <p className="font-semibold text-gray-900">
                      {formatAmount(Number(item.event.target_amount) || 0)}
                    </p>
                  </div>
                </div>

                {!item.is_achieved && (
                  <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-700">
                      {t('До цели осталось')}: <span className="font-semibold">{formatAmount(remaining)}</span>
                    </p>
                  </div>
                )}

                {item.event.reward && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">{t('Награда')}</p>
                    <p className="font-medium text-gray-900">{item.event.reward}</p>
                    {item.event.reward_description && (
                      <p className="text-sm text-gray-600 mt-1">{item.event.reward_description}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Уровни наград */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">{t('Уровни наград')}</h2>
        
        {bonusTiers.map((tier, index) => {
          const isReached = currentTurnover >= tier.amount;
          const isNext = !isReached && currentTurnover < tier.amount && 
                       bonusTiers.findIndex(t => t.amount > currentTurnover) === index;
          
          return (
            <div 
              key={tier.amount}
              className={`bg-white rounded-2xl p-6 border-2 transition ${
                isReached ? 'border-green-200 bg-green-50/30' :
                isNext ? 'border-orange-200 bg-orange-50/30' : 
                'border-gray-200'
              }`}
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className={`p-4 rounded-xl ${
                      isReached ? 'bg-green-100' : isNext ? 'bg-orange-100' : 'bg-gray-100'
                    }`}>
                      {tier.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
                        {isReached && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                            {t('Достигнуто')}
                          </span>
                        )}
                        {isNext && (
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                            {t('Следующая цель')}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-4">{tier.description}</p>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {tier.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" 
                                fill={isReached ? '#10B981' : '#EA580C'}/>
                            </svg>
                            <span className="text-sm text-gray-700">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:w-64 bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-2">{t('Необходимый товарооборот')}</p>
                  <p className="text-xl font-bold text-gray-900 mb-3">
                    {tier.amount.toLocaleString('ru-RU')} ₸
                  </p>
                  
                  {!isReached && (
                    <>
                      <p className="text-sm text-gray-600 mb-1">{t('Осталось набрать')}</p>
                      <p className="text-lg font-semibold text-orange-600">
                        {formatAmount(tier.amount - currentTurnover)}
                      </p>
                    </>
                  )}
                  
                  {isReached && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircleIcon />
                      <span className="font-medium">{t('Уровень достигнут')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};