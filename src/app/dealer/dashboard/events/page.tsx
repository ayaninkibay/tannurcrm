// src/app/dealer/events/page.tsx
'use client';

import { useTranslate } from '@/hooks/useTranslate';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import OrdersSection from '@/components/purchases/OrdersSection';
import type { Order } from '@/components/purchases/OrderRow';
import { ArrowLeft, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function PurchasesPage() {
  const { t } = useTranslate();

  // Активные заказы
  const activeOrders: Order[] = [
    {
      id: 1,
      image: '/icons/iconprewshop.svg',
      items: ['9-А шампунь Tannur', '9-А Крем для волос Tannur'],
      orderNumber: '#12345',
      date: '15.07.2024',
      status: t('Оплачено'),
      amount: '4,500 ₸'
    },
    {
      id: 2,
      image: '/icons/iconprewshop.svg',
      items: ['6 Этапный уходовый набор Tannur'],
      orderNumber: '#12346',
      date: '10.07.2024',
      status: t('Ожидание оплаты'),
      amount: '12,000 ₸'
    }
  ];

  // Завершенные заказы
  const completedOrders: Order[] = [
    {
      id: 3,
      image: '/icons/iconprewshop.svg',
      items: ['Отбеливащая маска Tannur', 'Гелеон маска Tannur'],
      orderNumber: '#12340',
      date: '01.07.2024',
      status: t('Оплачено'),
      amount: '18,500 ₸'
    },
    {
      id: 4,
      image: '/icons/iconprewshop.svg',
      items: ['9-А Крем для волос Tannur'],
      orderNumber: '#12338',
      date: '25.06.2024',
      status: t('Возврат'),
      amount: '6,800 ₸'
    },
    {
      id: 5,
      image: '/icons/iconprewshop.svg',
      items: ['Набор из 6 кремов Tannur', 'Гелеон маска Tannur'],
      orderNumber: '#12335',
      date: '20.06.2024',
      status: t('Оплачено'),
      amount: '9,200 ₸'
    }
  ];

  return (
    <main className="p-4 sm:p-6">
      <MoreHeaderDE title={t('Мои покупки')} />

      <div className="w-full">
        {/* Назад */}
        <div className="mb-4 mt-5">
          <Link
            href="/dealer/dashboard/"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('Назад')}
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 w-full">
          {/* Левая часть — история покупок */}
          <div className="flex-1 order-2 lg:order-1 w-full">
            <div className="bg-white rounded-2xl p-4 sm:p-6 w-full">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {t('История покупок')}
              </h2>

              <OrdersSection title="" orders={activeOrders} className="mb-8" />

              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {t('Завершенные заказы')}
              </h2>
              <OrdersSection title="" orders={completedOrders} />
            </div>
          </div>

          {/* Правая часть — способ оплаты */}
          <div className="w-full lg:w-72 order-1 lg:order-2">
            <div className="bg-white rounded-2xl p-4 w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('Ваш способ оплаты')}
              </h3>

              {/* Банковская карта */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Bank HBK</p>
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-3 text-white relative overflow-hidden w-full">
                  <div className="flex items-start justify-between mb-3">
                    <CreditCard className="w-6 h-6" />
                    <div className="text-right">
                      <div className="text-xs opacity-70">{t('BANK NAME')}</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="font-mono text-base tracking-wider">
                      **** **** **** 1234
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-xs opacity-70 mb-1">{t('CARDHOLDER NAME')}</div>
                      <div className="text-xs font-medium">JOHN DOE</div>
                    </div>
                    <div>
                      <div className="text-xs opacity-70 mb-1">{t('VALID THRU')}</div>
                      <div className="text-xs">12/28</div>
                    </div>
                  </div>

                  {/* Декор */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full -mr-8 -mt-8" />
                  <div className="absolute bottom-0 left-0 w-12 h-12 bg-white opacity-5 rounded-full -ml-6 -mb-6" />
                </div>
              </div>

              {/* Кнопки */}
              <div className="space-y-2">
                <button className="w-full px-3 py-2 text-sm bg-[#DC7C67] text-white rounded-lg hover:opacity-90 transition-colors">
                  {t('Изменить')}
                </button>
                <button className="w-full px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  {t('Добавить карту')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
