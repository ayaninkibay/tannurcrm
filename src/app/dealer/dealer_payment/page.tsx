'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, CreditCard, Smartphone, Copy, Check } from 'lucide-react';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/context/UserContext';

// Custom modal component
const SuccessModal = ({ 
  isOpen, 
  onClose, 
  amount, 
  paymentMethod 
}: {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  paymentMethod: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 relative animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
          Заявка создана успешно!
        </h3>
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-4">
            Ваша заявка на подписку дилера отправлена финансисту для проверки.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Сумма:</span>
              <span className="font-semibold text-green-600">{amount.toLocaleString()} ₸</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Способ оплаты:</span>
              <span className="font-medium text-gray-900">{paymentMethod}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Статус:</span>
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium">
                Ожидает подтверждения
              </span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Что дальше?</strong><br />
              Финансист проверит вашу оплату и активирует аккаунт дилера. 
              Вы получите уведомление о статусе заявки.
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-[#D77E6C] hover:bg-[#C66B5A] text-white py-3 px-4 rounded-xl transition-colors font-medium"
        >
          Понятно
        </button>
      </div>
    </div>
  );
};

export default function DealerPayment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useUser();
  
  const dealerId = searchParams.get('dealer_id');
  const sponsorId = searchParams.get('sponsor_id');
  
  const [dealerInfo, setDealerInfo] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedMethodName, setSelectedMethodName] = useState('');
  
  const SUBSCRIPTION_AMOUNT = 50000;
  const SPONSOR_BONUS = 25000;
  const CEO_BONUS = 25000;
  const KASPI_NUMBER = "+7 777 123 45 67";

  const paymentMethods = [
    {
      id: 'kaspi_transfer',
      name: 'Каспи Перевод',
      icon: '/icons/kaspi.svg',
      description: 'Перевод на номер телефона'
    },
    {
      id: 'kaspi_qr',
      name: 'Каспи QR',
      icon: '/icons/qr-code.svg',
      description: 'Оплата через QR-код'
    },
    {
      id: 'bank_card',
      name: 'Банковская карта',
      icon: '/icons/card.svg',
      description: 'Оплата картой (временно недоступно)',
      disabled: true
    },
    {
      id: 'bank_transfer',
      name: 'Банковский перевод',
      icon: '/icons/bank.svg',
      description: 'Перевод на расчетный счет'
    }
  ];

  useEffect(() => {
    if (dealerId) {
      loadDealerInfo();
    }
  }, [dealerId]);

  const loadDealerInfo = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, phone')
        .eq('id', dealerId)
        .single();

      if (error) throw error;
      setDealerInfo(data);
    } catch (err) {
      console.error('Error loading dealer info:', err);
      setError('Ошибка загрузки информации о дилере');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const handlePaymentConfirm = async () => {
    if (!selectedMethod) {
      setError('Выберите способ оплаты');
      return;
    }

    if (!notes.trim()) {
      setError('Добавьте примечание о способе оплаты');
      return;
    }

    if (!dealerId || !sponsorId) {
      setError('Отсутствуют данные дилера или спонсора');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      console.log('Creating payment record for dealer:', dealerId);
      
      const paymentData = {
        user_id: dealerId,
        parent_id: sponsorId, 
        amount: SUBSCRIPTION_AMOUNT,
        method: selectedMethod,
        status: 'pending',
        paid_at: new Date().toISOString(),
        sponsor_bonus: SPONSOR_BONUS,
        ceo_bonus: CEO_BONUS
      };

      console.log('Payment data to insert:', paymentData);

      const { data, error } = await supabase
        .from('subscription_payments')
        .insert([paymentData])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Ошибка базы данных: ${error.message}`);
      }

      console.log('Payment record created successfully:', data);

      // Set the selected method name for the modal
      const method = paymentMethods.find(m => m.id === selectedMethod);
      setSelectedMethodName(method?.name || '');
      
      // Show success modal
      setShowSuccessModal(true);
      
    } catch (err: any) {
      console.error('Error creating payment record:', err);
      setError(`Ошибка создания заявки: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    // Navigate to dashboard after modal closes
    router.push('/dealer/dashboard');
  };

  const renderPaymentDetails = () => {
    if (!selectedMethod) return null;

    switch (selectedMethod) {
      case 'kaspi_transfer':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
            <h3 className="font-medium text-blue-900 mb-3">Перевод через Каспи</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-white rounded-lg p-3">
                <div>
                  <p className="text-sm text-gray-600">Номер для перевода:</p>
                  <p className="font-mono font-bold text-lg">{KASPI_NUMBER}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(KASPI_NUMBER)}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Скопировано' : 'Копировать'}
                </button>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-sm text-gray-600">Сумма к переводу:</p>
                <p className="font-bold text-xl text-green-600">{SUBSCRIPTION_AMOUNT.toLocaleString()} ₸</p>
              </div>
              <div className="text-xs text-blue-700 bg-blue-100 rounded-lg p-2">
                После перевода укажите номер транзакции в примечаниях и нажмите "Подтвердить оплату"
              </div>
            </div>
          </div>
        );

      case 'kaspi_qr':
        return (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mt-4">
            <h3 className="font-medium text-purple-900 mb-3">Оплата через QR-код</h3>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 flex flex-col items-center">
                <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-3">
                  <div className="text-center">
                    <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">QR-код для оплаты</p>
                    <p className="text-xs text-gray-400 mt-1">Временная заглушка</p>
                  </div>
                </div>
                <p className="font-bold text-xl text-green-600">{SUBSCRIPTION_AMOUNT.toLocaleString()} ₸</p>
              </div>
              <div className="text-xs text-purple-700 bg-purple-100 rounded-lg p-2">
                Отсканируйте QR-код в приложении Каспи и подтвердите оплату
              </div>
            </div>
          </div>
        );

      case 'bank_transfer':
        return (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
            <h3 className="font-medium text-green-900 mb-3">Банковский перевод</h3>
            <div className="space-y-2">
              <div className="bg-white rounded-lg p-3">
                <p className="text-sm text-gray-600">Получатель:</p>
                <p className="font-medium">ТОО "Tannur Kazakhstan"</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-sm text-gray-600">БИК банка:</p>
                <p className="font-mono">KKMFKZ2A</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-sm text-gray-600">Расчетный счет:</p>
                <p className="font-mono">KZ12345678901234567890</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-sm text-gray-600">Сумма:</p>
                <p className="font-bold text-xl text-green-600">{SUBSCRIPTION_AMOUNT.toLocaleString()} ₸</p>
              </div>
              <div className="text-xs text-green-700 bg-green-100 rounded-lg p-2">
                Назначение платежа: "Подписка дилера #{dealerId?.slice(-8)}"
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#D77E6C]" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col p-2 md:p-6 bg-[#F6F6F6] min-h-screen">
        <MoreHeaderDE title="Оплата подписки дилера" />

        <div className="mt-4 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-all hover:shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Назад</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dealer Info */}
            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Image src="/icons/IconUser.svg" width={20} height={20} alt="user" />
                Информация о дилере
              </h2>
              
              {dealerInfo && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Имя</p>
                    <p className="font-medium">{dealerInfo.first_name} {dealerInfo.last_name}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{dealerInfo.email}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Телефон</p>
                    <p className="font-medium">{dealerInfo.phone || 'Не указан'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">ID дилера</p>
                    <p className="font-mono text-sm">{dealerId?.slice(-8)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Способ оплаты
              </h2>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => !method.disabled && setSelectedMethod(method.id)}
                    className={`
                      border-2 rounded-xl p-4 transition-all
                      ${method.disabled 
                        ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                        : 'cursor-pointer hover:shadow-sm'
                      }
                      ${selectedMethod === method.id 
                        ? 'border-[#D77E6C] bg-[#D77E6C]/5' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        {method.id === 'kaspi_transfer' && <Smartphone className="w-4 h-4 text-blue-600" />}
                        {method.id === 'kaspi_qr' && <Image src="/icons/qr-code.svg" alt="qr" width={16} height={16} />}
                        {method.id === 'bank_card' && <CreditCard className="w-4 h-4 text-gray-600" />}
                        {method.id === 'bank_transfer' && <Image src="/icons/bank.svg" alt="bank" width={16} height={16} />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{method.name}</h3>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                      {selectedMethod === method.id && (
                        <div className="w-5 h-5 bg-[#D77E6C] rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {renderPaymentDetails()}

              {/* Notes */}
              {selectedMethod && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Примечания об оплате <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[#F6F6F6] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D77E6C]/20 transition-all"
                    placeholder="Укажите номер транзакции, время перевода или другие детали оплаты..."
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Эта информация поможет финансисту быстрее найти ваш платеж
                  </p>
                </div>
              )}

              {/* Confirm button */}
              {selectedMethod && (
                <div className="mt-6">
                  <button
                    onClick={handlePaymentConfirm}
                    disabled={isSubmitting || !notes.trim()}
                    className="w-full bg-[#D77E6C] hover:bg-[#C66B5A] disabled:bg-gray-400 text-white py-4 rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Создание заявки...
                      </>
                    ) : (
                      'Подтвердить оплату'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Сводка заказа</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Подписка дилера</span>
                  <span className="font-medium">{SUBSCRIPTION_AMOUNT.toLocaleString()} ₸</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Итого к оплате</span>
                    <span className="text-[#D77E6C]">{SUBSCRIPTION_AMOUNT.toLocaleString()} ₸</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-3 space-y-1">
                  <p>• Спонсор бонус: {SPONSOR_BONUS.toLocaleString()} ₸</p>
                  <p>• CEO бонус: {CEO_BONUS.toLocaleString()} ₸</p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                Процесс оплаты
              </h3>
              <div className="text-xs text-gray-500 leading-relaxed space-y-2">
                <p>1. Выберите удобный способ оплаты</p>
                <p>2. Произведите оплату согласно инструкции</p>
                <p>3. Обязательно укажите детали оплаты в примечаниях</p>
                <p>4. Нажмите "Подтвердить оплату"</p>
                <p>5. Дождитесь проверки финансистом</p>
                <p className="text-orange-600 font-medium mt-3">
                  ⚠️ После подтверждения заявка отправится финансисту. Активация аккаунта дилера произойдет после одобрения.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        amount={SUBSCRIPTION_AMOUNT}
        paymentMethod={selectedMethodName}
      />
    </>
  );
}