// src/components/payment/KaspiPaymentFlow.tsx

'use client';

import React, { useState } from 'react';
import { ExternalLink, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface KaspiPaymentFlowProps {
  totalAmount: number;
  onPaymentConfirmed: (notes: string) => void | Promise<void>;
  onPaymentCancelled: () => void | Promise<void>;  // Убрали notes - он не нужен
  isProcessing?: boolean;
}

const KaspiPaymentFlow: React.FC<KaspiPaymentFlowProps> = ({ 
  totalAmount, 
  onPaymentConfirmed, 
  onPaymentCancelled,
  isProcessing = false 
}) => {
  const [step, setStep] = useState<'initial' | 'waiting' | 'confirm'>('initial');
  const [paymentNotes, setPaymentNotes] = useState('');

  const KASPI_LINK = 'https://pay.kaspi.kz/pay/oh6n1rwa';

  const handleOpenKaspi = () => {
    window.open(KASPI_LINK, '_blank');
    setStep('waiting');
  };

  const handleConfirmPayment = () => {
    setStep('confirm');
  };

  const handleDeclinePayment = async () => {
    // Просто вызываем callback без всяких форм
    await onPaymentCancelled();
  };

  const handleSubmitConfirmation = async () => {
    if (!paymentNotes.trim()) {
      alert('Пожалуйста, укажите данные об оплате (от кого перевод, последние 4 цифры и т.д.)');
      return;
    }
    await onPaymentConfirmed(paymentNotes);
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ru-RU');
  };

  // INITIAL STEP - Показываем Kaspi ссылку
  if (step === 'initial') {
    return (
      <div className="bg-white rounded-2xl p-6 border-2 border-[#D77E6C]/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-[#D77E6C] to-[#E09080] rounded-xl">
            <div className="text-white font-bold text-2xl">K</div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Оплата через Kaspi</h3>
            <p className="text-sm text-gray-500">Быстро и безопасно</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-xl p-6 mb-6">
          <p className="text-sm text-gray-600 mb-2">Сумма к оплате:</p>
          <p className="text-4xl font-bold text-[#D77E6C]">
            {formatAmount(totalAmount)} ₸
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4 border border-blue-200">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold text-blue-900 mb-1">Как оплатить:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Нажмите кнопку ниже для перехода в Kaspi</li>
                <li>Введите сумму: <span className="font-bold">{formatAmount(totalAmount)} ₸</span></li>
                <li>Завершите оплату</li>
                <li>Вернитесь на эту страницу и подтвердите оплату</li>
              </ol>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenKaspi}
          className="w-full py-4 bg-gradient-to-r from-[#D77E6C] to-[#E09080] text-white rounded-xl font-semibold text-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3"
        >
          <ExternalLink className="w-5 h-5" />
          Перейти к оплате в Kaspi
        </button>
      </div>
    );
  }

  // WAITING STEP - Ожидаем оплату
  if (step === 'waiting') {
    return (
      <div className="bg-white rounded-2xl p-6 border-2 border-yellow-200">
        <div className="text-center mb-6">
          <div className="inline-flex p-4 bg-yellow-50 rounded-full mb-4">
            <Loader2 className="w-12 h-12 text-yellow-600 animate-spin" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Ожидаем оплату
          </h3>
          <p className="text-gray-600">
            После завершения оплаты в Kaspi, вернитесь на эту страницу
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">Сумма к оплате:</p>
          <p className="text-2xl font-bold text-[#D77E6C]">
            {formatAmount(totalAmount)} ₸
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleConfirmPayment}
            disabled={isProcessing}
            className="py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Я оплатил
          </button>
          <button
            onClick={handleDeclinePayment}
            disabled={isProcessing}
            className="py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <XCircle className="w-5 h-5" />
            Не оплатил
          </button>
        </div>

        <button
          onClick={handleOpenKaspi}
          className="w-full mt-3 py-2 text-sm text-[#D77E6C] hover:text-[#C66B5A] transition-colors flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Открыть Kaspi снова
        </button>
      </div>
    );
  }

  // CONFIRM STEP - Подтверждение оплаты
  if (step === 'confirm') {
    return (
      <div className="bg-white rounded-2xl p-6 border-2 border-green-200">
        <div className="text-center mb-6">
          <div className="inline-flex p-4 bg-green-50 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Подтверждение оплаты
          </h3>
          <p className="text-gray-600">
            Пожалуйста, укажите данные об оплате для подтверждения
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-sm text-blue-900 font-medium mb-2">Что указать:</p>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>От кого перевод (имя или номер телефона)</li>
              <li>Последние 4 цифры номера телефона отправителя</li>
              <li>Примерное время оплаты</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Данные об оплате *
            </label>
            <textarea
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              placeholder="Например: Оплачено от Айжан, номер +7 777 123-45-67, время: 14:30"
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D77E6C] focus:border-transparent resize-none"
              maxLength={500}
              disabled={isProcessing}
            />
            <p className="text-xs text-gray-500 mt-1">
              {paymentNotes.length}/500 символов
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setStep('waiting')}
            disabled={isProcessing}
            className="py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
          >
            Назад
          </button>
          <button
            onClick={handleSubmitConfirmation}
            disabled={isProcessing}
            className="py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Создание заказа...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Подтвердить оплату
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default KaspiPaymentFlow;