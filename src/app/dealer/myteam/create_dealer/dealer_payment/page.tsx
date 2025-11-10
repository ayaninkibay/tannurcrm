'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, Loader2, CheckCircle2, XCircle, AlertCircle, 
  Copy, Check, QrCode, ExternalLink, Award, Phone
} from 'lucide-react';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import { supabase } from '@/lib/supabase/client';

type PaymentMethod = 'qr' | 'link';

const SuccessModal = ({ isOpen, onClose, dealerName }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Оплата подтверждена! 🎉</h3>
        <p className="text-gray-600 mb-2">{dealerName} добавлен в систему</p>
        <p className="text-sm text-gray-500 mb-6">
          Статус: Ожидает подтверждения финансиста
        </p>
        <button
          onClick={onClose}
          className="w-full bg-[#D77E6C] hover:bg-[#C66B5A] text-white py-3 rounded-xl font-medium transition-colors"
        >
          Вернуться к команде
        </button>
      </div>
    </div>
  );
};

export default function DealerPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const dealerId = searchParams?.get('dealer_id');
  const sponsorId = searchParams?.get('sponsor_id');
  
  const [dealerInfo, setDealerInfo] = useState<any>(null);
  const [sponsorChain, setSponsorChain] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qr');
  const [paymentStep, setPaymentStep] = useState<'initial' | 'waiting' | 'confirm' | 'declined'>('initial');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showBonuses, setShowBonuses] = useState(false);

  const SUBSCRIPTION_AMOUNT = 100000;
  const KASPI_LINK = 'https://pay.kaspi.kz/pay/2jzh8tc9';

  const loadSponsorChain = useCallback(async () => {
    try {
      if (!dealerId) return;

      const sponsors: Array<{
        level_num: number;
        user_id: string;
        full_name: string;
        email: string;
        phone: string;
        bonus: number;
        percent: number;
      }> = [];
      let currentUserId = dealerId;
      
      for (let level = 1; level <= 3; level++) {
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUserId)
          .single();
        
        if (!user?.parent_id) break;
        
        const { data: parent } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.parent_id)
          .single();
        
        if (parent) {
          sponsors.push({
            level_num: level,
            user_id: parent.id,
            full_name: `${parent.first_name || ''} ${parent.last_name || ''}`.trim(),
            email: parent.email,
            phone: parent.phone,
            bonus: level === 1 ? 25000 : 3000,
            percent: level === 1 ? 25 : 3
          });
          currentUserId = parent.id;
        }
      }
      
      setSponsorChain(sponsors);
    } catch (err) {
      console.error('Error loading sponsor chain:', err);
    }
  }, [dealerId]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data: dealer } = await supabase
        .from('users')
        .select('*')
        .eq('id', dealerId)
        .single();

      if (dealer) {
        setDealerInfo(dealer);
      } else {
        setError('Дилер не найден');
      }

      await loadSponsorChain();
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  }, [dealerId, loadSponsorChain]);

  useEffect(() => {
    if (dealerId && sponsorId) {
      loadData();
    } else {
      setError('Отсутствуют необходимые параметры');
    }
  }, [dealerId, sponsorId, loadData]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(KASPI_LINK);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentConfirmed = async () => {
    if (!paymentNotes.trim()) {
      setError('Пожалуйста, укажите данные об оплате');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 1. Обновляем статус дилера на paid (оплачено, ждёт подтверждения)
      const { error: updateError } = await supabase
        .from('users')
        .update({ status: 'paid' })
        .eq('id', dealerId);

      if (updateError) throw updateError;

      // 2. Создаём запись об оплате со статусом pending
      const { error: paymentError } = await supabase
        .from('subscription_payments')
        .insert({
          user_id: dealerId,
          parent_id: sponsorId,
          amount: SUBSCRIPTION_AMOUNT,
          method: 'kaspi',
          status: 'pending',
          paid_at: new Date().toISOString(),
          notes: paymentNotes.trim()
        });

      if (paymentError) throw paymentError;

      setShowSuccessModal(true);

    } catch (err: any) {
      console.error('Error confirming payment:', err);
      setError(err.message || 'Произошла ошибка при подтверждении оплаты');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentDeclined = async () => {
    if (!declineReason.trim()) {
      setError('Пожалуйста, укажите причину отказа');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 1. Обновляем статус дилера на not_paid (не оплачено)
      const { error: updateError } = await supabase
        .from('users')
        .update({ status: 'not_paid' })
        .eq('id', dealerId);

      if (updateError) throw updateError;

      // 2. Создаём запись об отказе от оплаты
      const { error: paymentError } = await supabase
        .from('subscription_payments')
        .insert({
          user_id: dealerId,
          parent_id: sponsorId,
          amount: SUBSCRIPTION_AMOUNT,
          method: 'kaspi',
          status: 'cancelled',
          paid_at: new Date().toISOString(),
          notes: `Отказ от оплаты: ${declineReason.trim()}`
        });

      if (paymentError) throw paymentError;

      // Редирект на страницу команды
      router.push('/dealer/myteam');

    } catch (err: any) {
      console.error('Error declining payment:', err);
      setError(err.message || 'Произошла ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F6F6F6]">
        <Loader2 className="w-8 h-8 animate-spin text-[#D77E6C]" />
      </div>
    );
  }

  if (error && !dealerInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F6F6F6] p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Ошибка</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dealer/myteam')}
            className="px-6 py-3 bg-[#D77E6C] text-white rounded-xl hover:bg-[#C66B5A] transition font-medium"
          >
            Вернуться к команде
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-2 md:p-6 bg-[#F6F6F6] min-h-screen">
      <MoreHeaderDE title="Оплата подписки дилера" showBackButton={true}/>

      <div className="w-full mx-auto mt-6">
        <div className="bg-white rounded-3xl shadow-xl p-4 md:p-10">
          {/* Заголовок */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-[#D77E6C] to-[#E89185] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Image src="/icons/IconAppsOrange.svg" width={40} height={40} alt="payment" className="brightness-0 invert" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Оплата подписки дилера
                </h1>
                <p className="text-gray-600">Последний шаг перед активацией</p>
              </div>

              {/* Информация о дилере */}
              {dealerInfo && (
                <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl p-6 mb-8">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Дилер создан
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Имя:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {dealerInfo.first_name} {dealerInfo.last_name}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 font-medium text-gray-900">{dealerInfo.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Телефон:</span>
                      <span className="ml-2 font-medium text-gray-900">{dealerInfo.phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Регион:</span>
                      <span className="ml-2 font-medium text-gray-900">{dealerInfo.region}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Сумма оплаты - показываем всегда на initial и waiting */}
              {(paymentStep === 'initial' || paymentStep === 'waiting') && (
                <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-6 mb-8">
                  <h3 className="font-bold text-xl text-gray-900 mb-4">Сумма к оплате</h3>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-5xl font-bold text-[#D77E6C]">
                      {SUBSCRIPTION_AMOUNT.toLocaleString()}
                    </span>
                    <span className="text-2xl text-gray-600">₸</span>
                  </div>
                </div>
              )}

              {/* Выбор способа оплаты - показываем всегда на initial и waiting */}
              {(paymentStep === 'initial' || paymentStep === 'waiting') && (
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-900 mb-4">Выберите способ оплаты</h3>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                      {/* QR Code */}
                      <button
                        onClick={() => setPaymentMethod('qr')}
                        className={`p-3 md:p-6 rounded-xl md:rounded-2xl border-2 transition-all ${
                          paymentMethod === 'qr'
                            ? 'border-[#D77E6C] bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <QrCode className={`w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 md:mb-3 ${
                          paymentMethod === 'qr' ? 'text-[#D77E6C]' : 'text-gray-400'
                        }`} />
                        <p className="font-semibold text-gray-900 text-sm md:text-base mb-1">Отсканировать QR</p>
                        <p className="text-xs text-gray-500 hidden md:block">Быстрая оплата</p>
                      </button>

                      {/* Ссылка */}
                      <button
                        onClick={() => setPaymentMethod('link')}
                        className={`p-3 md:p-6 rounded-xl md:rounded-2xl border-2 transition-all ${
                          paymentMethod === 'link'
                            ? 'border-[#D77E6C] bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <ExternalLink className={`w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 md:mb-3 ${
                          paymentMethod === 'link' ? 'text-[#D77E6C]' : 'text-gray-400'
                        }`} />
                        <p className="font-semibold text-gray-900 text-sm md:text-base mb-1">Открыть ссылку</p>
                        <p className="text-xs text-gray-500 hidden md:block">В приложении Kaspi</p>
                      </button>
                    </div>
                  </div>
              )}

              {/* Контент в зависимости от способа */}
              {paymentMethod === 'qr' && (
                    <>
                      {paymentStep === 'initial' && (
                        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-8 text-center">
                          <h4 className="font-semibold text-gray-900 mb-4">Отсканируйте QR-код</h4>
                          <div className="relative w-64 h-64 mx-auto mb-4 bg-gray-50 rounded-xl overflow-hidden">
                            <Image
                              src="/img/kaspi_dealer_qr.png"
                              alt="Kaspi QR Code"
                              fill
                              className="object-contain"
                            />
                          </div>
                          <p className="text-sm text-gray-600 mb-4">
                            Откройте приложение Kaspi и отсканируйте QR-код для оплаты
                          </p>
                          <button
                            onClick={() => setPaymentStep('waiting')}
                            className="w-full px-6 py-3 bg-[#D77E6C] hover:bg-[#C66B5A] text-white rounded-xl font-medium transition"
                          >
                            Начать оплату →
                          </button>
                        </div>
                      )}

                      {paymentStep === 'waiting' && (
                        <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 mb-8">
                          <div className="text-center mb-6">
                            <div className="relative inline-flex items-center justify-center mb-4">
                              <div className="absolute w-20 h-20 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                <Loader2 className="w-10 h-10 text-white animate-spin" />
                              </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                              Ожидание оплаты...
                            </h3>
                            <p className="text-gray-600">
                              Завершите оплату в приложении Kaspi
                            </p>
                          </div>

                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-6">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                !
                              </div>
                              <div className="text-sm text-blue-900">
                                <p className="font-medium mb-1">После оплаты:</p>
                                <p className="text-blue-700">Нажмите кнопку &quot;Я оплатил&quot; ниже</p>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => setPaymentStep('confirm')}
                            className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                            Я оплатил →
                          </button>

                          <button
                            onClick={() => setPaymentStep('initial')}
                            className="w-full mt-3 px-6 py-3 text-sm text-gray-600 hover:text-gray-800 transition"
                          >
                            Показать QR-код снова
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {paymentMethod === 'link' && (
                    <>
                      {paymentStep === 'initial' && (
                        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-8">
                          <h4 className="font-semibold text-gray-900 mb-4">Ссылка для оплаты</h4>
                          <div className="flex gap-2 mb-4">
                            <input
                              type="text"
                              value={KASPI_LINK}
                              readOnly
                              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                            />
                            <button
                              onClick={copyToClipboard}
                              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                            >
                              {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-gray-600" />}
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              window.open(KASPI_LINK, '_blank');
                              setPaymentStep('waiting');
                            }}
                            className="w-full px-6 py-3 bg-[#D77E6C] hover:bg-[#C66B5A] text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
                          >
                            <ExternalLink className="w-5 h-5" />
                            Открыть Kaspi
                          </button>
                        </div>
                      )}

                      {paymentStep === 'waiting' && (
                        <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 mb-8">
                          <div className="text-center mb-6">
                            <div className="relative inline-flex items-center justify-center mb-4">
                              <div className="absolute w-20 h-20 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                <Loader2 className="w-10 h-10 text-white animate-spin" />
                              </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                              Ожидание оплаты...
                            </h3>
                            <p className="text-gray-600">
                              Завершите оплату в приложении Kaspi
                            </p>
                          </div>

                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-6">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                !
                              </div>
                              <div className="text-sm text-blue-900">
                                <p className="font-medium mb-1">После оплаты:</p>
                                <p className="text-blue-700">Вернитесь сюда и нажмите кнопку &quot;Я оплатил&quot;</p>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => setPaymentStep('confirm')}
                            className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                            Я оплатил →
                          </button>

                          <button
                            onClick={() => setPaymentStep('initial')}
                            className="w-full mt-3 px-6 py-3 text-sm text-gray-600 hover:text-gray-800 transition"
                          >
                            Открыть ссылку снова
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* Кнопка отказа - показываем на initial и waiting */}
                  {(paymentStep === 'initial' || paymentStep === 'waiting') && (
                    <button
                      onClick={() => setPaymentStep('declined')}
                      className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition flex items-center justify-center gap-2 mt-4"
                    >
                      <XCircle className="w-5 h-5" />
                      Не оплатил
                    </button>
                  )}

                  {/* Кнопка показать распределение бонусов - только на initial */}
                  {paymentStep === 'initial' && (
                    <>
                      <button
                        onClick={() => setShowBonuses(!showBonuses)}
                        className="w-full mt-4 px-6 py-3 bg-white border-2 border-gray-200 hover:border-[#D77E6C] text-gray-700 rounded-xl font-medium transition flex items-center justify-center gap-2"
                      >
                        <Award className="w-5 h-5" />
                        {showBonuses ? 'Скрыть' : 'Показать'} распределение бонусов
                      </button>

                      {/* Распределение бонусов */}
                      {showBonuses && (
                        <div className="mt-6 space-y-3">
                          {sponsorChain.map((sponsor, index) => (
                            <div key={sponsor.user_id} className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-4 border border-orange-100">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-[#D77E6C]">
                                  {index === 0 ? 'Прямой спонсор' : `Уровень ${sponsor.level_num}`}
                                </span>
                                <span className="px-2 py-1 bg-[#D77E6C] text-white text-xs rounded-full font-bold">
                                  {sponsor.percent}%
                                </span>
                              </div>
                              <p className="text-xl font-bold text-gray-900 mb-2">
                                +{sponsor.bonus.toLocaleString()} ₸
                              </p>
                              <p className="font-medium text-gray-900 text-sm">{sponsor.full_name}</p>
                              <p className="text-xs text-gray-500">{sponsor.email}</p>
                              {sponsor.phone && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                  <Phone className="w-3 h-3" />
                                  {sponsor.phone}
                                </div>
                              )}
                            </div>
                          ))}

                          {sponsorChain.length === 0 && (
                            <div className="text-center py-8 bg-gray-50 rounded-xl">
                              <Award className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">Нет данных о спонсорах</p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

              {/* Подтверждение оплаты */}
              {paymentStep === 'confirm' && (
                <div className="bg-white rounded-2xl border-2 border-green-200 p-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex p-4 bg-green-50 rounded-full mb-4">
                      <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Подтверждение оплаты
                    </h3>
                    <p className="text-gray-600">
                      Укажите детали платежа для проверки финансистом
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-6">
                    <p className="text-sm text-blue-900 font-medium mb-2">Что указать:</p>
                    <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                      <li>Имя или номер телефона отправителя</li>
                      <li>Последние 4 цифры номера телефона</li>
                      <li>Примерное время оплаты</li>
                    </ul>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Данные об оплате *
                    </label>
                    <textarea
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      placeholder="Например: Оплачено от Айжан, номер +7 777 123-4567, время: 14:30"
                      className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D77E6C] resize-none"
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">{paymentNotes.length}/500</p>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 rounded-lg p-3 mb-6">
                      <AlertCircle className="w-4 h-4 mt-0.5" />
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentStep('initial')}
                      disabled={isSubmitting}
                      className="py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 rounded-xl font-medium transition"
                    >
                      Назад
                    </button>
                    <button
                      onClick={handlePaymentConfirmed}
                      disabled={isSubmitting}
                      className="py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Обработка...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Подтвердить
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Отказ от оплаты */}
              {paymentStep === 'declined' && (
                <div className="bg-white rounded-2xl border-2 border-red-200 p-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex p-4 bg-red-50 rounded-full mb-4">
                      <XCircle className="w-12 h-12 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Оплата не выполнена
                    </h3>
                    <p className="text-gray-600">Укажите причину отказа</p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Причина отказа *
                    </label>
                    <textarea
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      placeholder="Например: Технические проблемы с Kaspi, нет средств на счету, передумал..."
                      className="w-full h-24 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                      maxLength={300}
                    />
                    <p className="text-xs text-gray-500 mt-1">{declineReason.length}/300</p>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 rounded-lg p-3 mb-6">
                      <AlertCircle className="w-4 h-4 mt-0.5" />
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentStep('initial')}
                      disabled={isSubmitting}
                      className="py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 rounded-xl font-medium transition"
                    >
                      Назад
                    </button>
                    <button
                      onClick={handlePaymentDeclined}
                      disabled={isSubmitting}
                      className="py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Обработка...
                        </>
                      ) : (
                        'Отменить оплату'
                      )}
                    </button>
                  </div>
                </div>
              )}
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => router.push('/dealer/myteam')}
        dealerName={`${dealerInfo?.first_name} ${dealerInfo?.last_name}`}
      />
    </div>
  );
}