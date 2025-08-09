'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MoreHeaderDE from '@/components/header/MoreHeaderDE'

// Страница вывода средств
const WithdrawPage = () => {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [selectedCard, setSelectedCard] = useState(0);
  const [step, setStep] = useState(1);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(true);

  const savedCards = [
    { id: 0, bank: 'Bank RBK', number: '***1112', name: 'INZHU ANUARBEK', type: 'visa' },
    { id: 1, bank: 'Kaspi Bank', number: '***4567', name: 'INZHU ANUARBEK', type: 'mastercard' },
  ];

  const quickAmounts = [5000, 10000, 25000, 50000, 100000, 250000];

  return (
    <div className="p-2 md:p-6 ">
              <MoreHeaderDE title="Дэшборд" />


      {/* Хедер с кнопкой назад */}
      <div className="bg-white rounded-2xl w-30 h-10 mt-5 mb-5 top-0 z-50">
        <div className="w-full">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => router.push('/dealer/dashboard')}
              className="p-2 hover:bg-gray-50 rounded-lg transition-colors group"
            >
              <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-md font-light text-gray-900">Назад</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto ">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Блок ВЫВОД - сворачиваемый на мобильных */}
          <div className="bg-white rounded-2xl  border border-gray-100 overflow-hidden">
            {/* Заголовок блока с кнопкой сворачивания на мобильных */}
            <div 
              className="flex items-center justify-between p-6 border-b border-gray-100 lg:border-b-0 cursor-pointer lg:cursor-default"
              onClick={() => window.innerWidth < 1024 && setIsWithdrawOpen(!isWithdrawOpen)}
            >
              <h2 className="text-lg font-medium">Форма вывода</h2>
              <button className="lg:hidden p-1">
                <svg 
                  className={`w-5 h-5 transition-transform ${isWithdrawOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Контент блока */}
            <div className={`${isWithdrawOpen ? 'block' : 'hidden lg:block'}`}>
              {step === 1 && (
                <div className="p-6 pt-0 lg:pt-6">
                  {/* Ввод суммы */}
                  <div className="mb-6">
                    <label className="block text-sm text-gray-600 mb-3">Сумма вывода</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                        placeholder="0"
                        className="w-full text-2xl lg:text-3xl font-bold bg-gray-50 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-[#D77E6C]"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl lg:text-2xl text-gray-500">₸</span>
                    </div>
                    
                    {/* Быстрые суммы */}
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {quickAmounts.map((value) => (
                        <button
                          key={value}
                          onClick={() => setAmount(value.toString())}
                          className="py-2 px-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs lg:text-sm font-medium transition-colors"
                        >
                          {value.toLocaleString()} ₸
                        </button>
                      ))}
                    </div>

                    <div className="mt-6 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Комиссия</span>
                        <span className="font-medium">0 ₸</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-600">К получению</span>
                        <span className="text-lg lg:text-xl font-bold text-[#D77E6C]">
                          {amount ? parseInt(amount).toLocaleString() : '0'} ₸
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Выбор карты */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-4">Куда вывести</h3>
                    <div className="space-y-3">
                      {savedCards.map((card) => (
                        <label
                          key={card.id}
                          className={`flex items-center gap-3 p-3 lg:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedCard === card.id 
                              ? 'border-[#D77E6C] bg-red-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            checked={selectedCard === card.id}
                            onChange={() => setSelectedCard(card.id)}
                            className="hidden"
                          />
                          <div className="w-10 h-7 lg:w-12 lg:h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded flex items-center justify-center">
                            <div className="w-5 h-3 lg:w-6 lg:h-4 bg-yellow-400 rounded-sm"></div>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm lg:text-base">{card.bank}</p>
                            <p className="text-xs lg:text-sm text-gray-500">{card.number}</p>
                          </div>
                          {selectedCard === card.id && (
                            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-[#D77E6C]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </label>
                      ))}
                      
                      <button className="w-full p-3 lg:p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 transition-colors flex items-center justify-center gap-2 text-sm lg:text-base">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Добавить новую карту
                      </button>
                    </div>
                  </div>

                  {/* Кнопка подтверждения */}
                  <button 
                    onClick={() => setStep(2)}
                    disabled={!amount || parseInt(amount) === 0}
                    className="w-full bg-gradient-to-r from-[#D77E6C] to-[#E09080] text-white py-3 lg:py-4 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Продолжить
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="p-6 lg:p-8 text-center">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 lg:w-10 lg:h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl lg:text-2xl font-bold mb-2">Заявка принята!</h2>
                  <p className="text-sm lg:text-base text-gray-600 mb-6">
                    Средства поступят на вашу карту в течение 1-3 рабочих дней
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600 text-sm">Сумма</span>
                      <span className="font-medium">{parseInt(amount).toLocaleString()} ₸</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">На карту</span>
                      <span className="font-medium">{savedCards[selectedCard].number}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setStep(1);
                      setAmount('');
                    }}
                    className="w-full bg-[#D77E6C] text-white py-3 rounded-xl font-medium hover:bg-[#C66B5A] transition-colors"
                  >
                    Готово
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Блок ИСТОРИЯ - всегда открыт */}
          <div className="bg-white rounded-2xl  border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-medium">История операций</h2>
            </div>
            
            <div className="p-6">
              {/* Мини-статистика */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-600 mb-1">Выведено за месяц</p>
                  <p className="text-lg font-bold text-orange-600">125 000 ₸</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-600 mb-1">Получено за месяц</p>
                  <p className="text-lg font-bold text-green-600">170 000 ₸</p>
                </div>
              </div>

              {/* Список последних операций */}
              <div className="space-y-3">
                {[
                  { type: 'withdraw', amount: 125000, date: '15.01.2025', status: 'completed', card: '***1112' },
                  { type: 'income', amount: 45000, date: '14.01.2025', source: 'Подписка', user: 'Алия Н.' },
                  { type: 'withdraw', amount: 50000, date: '13.01.2025', status: 'pending', card: '***4567' },
                  { type: 'income', amount: 25000, date: '12.01.2025', source: 'Подарок', user: 'Ерлан Ж.' },
                  { type: 'income', amount: 100000, date: '08.01.2025', source: 'Курс', user: 'Мадина С.' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        item.type === 'withdraw' ? 'bg-orange-100' : 'bg-green-100'
                      }`}>
                        {item.type === 'withdraw' ? (
                          <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {item.type === 'withdraw' ? `Вывод ${item.card}` : item.source}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.date} {item.type === 'income' && `• ${item.user}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${
                        item.type === 'withdraw' ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {item.type === 'withdraw' ? '-' : '+'}{item.amount.toLocaleString()} ₸
                      </p>
                      {item.type === 'withdraw' && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.status === 'completed' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {item.status === 'completed' ? 'Выполнено' : 'В обработке'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Кнопка показать все */}
              <button className="w-full mt-4 py-2 text-sm text-[#D77E6C] hover:text-[#C66B5A] font-medium transition-colors">
                Показать все операции →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawPage;