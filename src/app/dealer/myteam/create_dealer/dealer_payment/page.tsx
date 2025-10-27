// src/app/dealer/myteam/create_dealer/dealer_payment/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowRight, Loader2, CreditCard, Copy, Check, 
  Users, Info, Phone, Mail, Hash, User, 
  Clock, Award, ChevronRight, Wallet,
  CheckCircle2, AlertCircle, QrCode, Building2, ExternalLink, XCircle
} from 'lucide-react';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/context/UserContext';

const SuccessModal = ({ isOpen, onClose, amount }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-center mb-3">Заявка отправлена</h3>
        <p className="text-gray-600 text-center mb-6">
          Ожидайте подтверждения платежа на сумму {amount.toLocaleString()} ₸
        </p>
        <button
          onClick={onClose}
          className="w-full bg-[#D77E6C] hover:bg-[#C66B5A] text-white py-3 rounded-lg font-medium transition-colors"
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
  
  const dealerId = searchParams.get('dealer_id');
  const sponsorId = searchParams.get('sponsor_id');
  
  const [dealerInfo, setDealerInfo] = useState<any>(null);
  const [sponsorInfo, setSponsorInfo] = useState<any>(null);
  const [sponsorChain, setSponsorChain] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState('kaspi_qr');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'payment' | 'bonuses'>('payment');
  
  const SUBSCRIPTION_AMOUNT = 100000;
  const KASPI_LINK = 'https://pay.kaspi.kz/pay/lafnp2v5';

  // Состояния для flow оплаты
  const [paymentStep, setPaymentStep] = useState<'initial' | 'waiting' | 'confirm' | 'declined'>('initial');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [declineReason, setDeclineReason] = useState('');

  useEffect(() => {
    if (dealerId && sponsorId) {
      loadData();
    }
  }, [dealerId, sponsorId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const [dealerRes, sponsorRes] = await Promise.all([
        supabase.from('users').select('*').eq('id', dealerId).single(),
        supabase.from('users').select('*').eq('id', sponsorId).single()
      ]);

      if (dealerRes.data) setDealerInfo(dealerRes.data);
      if (sponsorRes.data) setSponsorInfo(sponsorRes.data);
      
      await loadSponsorChain();
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSponsorChain = async () => {
    try {
      if (!dealerId) return;
      
      const sponsors = [];
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
      console.error('Error:', err);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleOpenKaspi = () => {
    window.open(KASPI_LINK, '_blank');
    setPaymentStep('waiting');
  };

  const handleConfirmPayment = () => {
    setPaymentStep('confirm');
  };

  const handleDeclinePayment = () => {
    setPaymentStep('declined');
  };

  const handleSubmitConfirmation = async () => {
    if (!paymentNotes.trim()) {
      setError('Пожалуйста, укажите данные об оплате');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { error } = await supabase
        .from('subscription_payments')
        .insert([{
          user_id: dealerId,
          parent_id: sponsorId,
          amount: SUBSCRIPTION_AMOUNT,
          method: 'kaspi_qr',
          status: 'pending',
          paid_at: new Date().toISOString(),
          notes: paymentNotes.trim()
        }]);

      if (error) throw error;
      setShowSuccessModal(true);
    } catch (err: any) {
      setError('Ошибка создания заявки');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitDecline = async () => {
    if (!declineReason.trim()) {
      setError('Пожалуйста, укажите причину');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { error } = await supabase
        .from('subscription_payments')
        .insert([{
          user_id: dealerId,
          parent_id: sponsorId,
          amount: SUBSCRIPTION_AMOUNT,
          method: 'kaspi_qr',
          status: 'cancelled',
          paid_at: new Date().toISOString(),
          notes: `Отменено: ${declineReason.trim()}`
        }]);

      if (error) throw error;
      router.push('/dealer/myteam');
    } catch (err: any) {
      setError('Ошибка сохранения');
    } finally {
      setIsSubmitting(false);
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
      <div className="p-2 md:p-6">
        <MoreHeaderDE title="Оплата подписки дилера" />

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 mt-5 gap-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {activeTab === 'payment' ? 'Оплата подписки' : 'Распределение бонусов'}
            </h2>
          </div>

          <div className="flex bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('payment')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'payment' ? 'bg-[#D77E6C] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Оплата</span>
            </button>
            <button
              onClick={() => setActiveTab('bonuses')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'bonuses' ? 'bg-[#D77E6C] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Бонусы</span>
            </button>
          </div>
        </div>

        {activeTab === 'payment' ? (
          <>
            {/* Payment Amount Card */}
            <div className="bg-gradient-to-r from-[#D77E6C] to-[#C66B5A] rounded-2xl p-6 mb-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-1">Сумма к оплате</p>
                  <p className="text-4xl font-bold">{SUBSCRIPTION_AMOUNT.toLocaleString()} ₸</p>
                  <p className="text-white/80 text-sm mt-2">Единоразовый платеж для активации</p>
                </div>
                <Wallet className="w-16 h-16 text-white/20" />
              </div>
            </div>

            {/* Dealer Info Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-[#D77E6C]/10 rounded-lg text-[#D77E6C]">
                    <User className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {dealerInfo?.first_name} {dealerInfo?.last_name}
                </p>
                <p className="text-xs text-gray-500">Новый дилер</p>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Mail className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1 truncate">
                  {dealerInfo?.email}
                </p>
                <p className="text-xs text-gray-500">Email</p>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-green-100 rounded-lg text-green-600">
                    <Phone className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {dealerInfo?.phone || 'Не указан'}
                </p>
                <p className="text-xs text-gray-500">Телефон</p>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {sponsorInfo?.first_name} {sponsorInfo?.last_name}
                </p>
                <p className="text-xs text-gray-500">Спонсор</p>
              </div>
            </div>

            {/* Kaspi QR Payment Flow */}
            {paymentStep === 'initial' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Kaspi QR оплата
                </h4>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-700">
                      <p className="font-semibold text-blue-900 mb-1">Как оплатить:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Нажмите кнопку ниже - откроется Kaspi</li>
                        <li>Введите сумму: <span className="font-bold">{SUBSCRIPTION_AMOUNT.toLocaleString()} ₸</span></li>
                        <li>Завершите оплату</li>
                        <li>Вернитесь сюда и подтвердите оплату</li>
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
            )}

            {paymentStep === 'waiting' && (
              <div className="bg-white rounded-2xl p-6 border-2 border-yellow-200 mb-6">
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
                    {SUBSCRIPTION_AMOUNT.toLocaleString()} ₸
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleConfirmPayment}
                    className="py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Я оплатил
                  </button>
                  <button
                    onClick={handleDeclinePayment}
                    className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
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
            )}

            {paymentStep === 'confirm' && (
              <div className="bg-white rounded-2xl p-6 border-2 border-green-200 mb-6">
                <div className="text-center mb-6">
                  <div className="inline-flex p-4 bg-green-50 rounded-full mb-4">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
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
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {paymentNotes.length}/500 символов
                    </p>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 rounded-lg p-3">
                      <AlertCircle className="w-4 h-4 mt-0.5" />
                      {error}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentStep('waiting')}
                    className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                  >
                    Назад
                  </button>
                  <button
                    onClick={handleSubmitConfirmation}
                    disabled={isSubmitting}
                    className="py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Обработка...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Подтвердить оплату
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {paymentStep === 'declined' && (
              <div className="bg-white rounded-2xl p-6 border-2 border-red-200 mb-6">
                <div className="text-center mb-6">
                  <div className="inline-flex p-4 bg-red-50 rounded-full mb-4">
                    <XCircle className="w-12 h-12 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Оплата не выполнена
                  </h3>
                  <p className="text-gray-600">
                    Пожалуйста, укажите причину
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Причина *
                    </label>
                    <textarea
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      placeholder="Например: Технические проблемы с Kaspi, нет средств на счету, передумал..."
                      className="w-full h-24 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                      maxLength={300}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {declineReason.length}/300 символов
                    </p>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 rounded-lg p-3">
                      <AlertCircle className="w-4 h-4 mt-0.5" />
                      {error}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentStep('waiting')}
                    className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                  >
                    Назад
                  </button>
                  <button
                    onClick={handleSubmitDecline}
                    disabled={isSubmitting}
                    className="py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
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
          </>
        ) : (
          /* Bonuses Tab */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {sponsorChain.map((sponsor, index) => (
              <div key={sponsor.user_id} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                <div className="p-4 bg-gradient-to-r from-[#D77E6C]/10 to-[#D77E6C]/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-[#D77E6C]">
                      {index === 0 ? 'Прямой спонсор' : `Уровень ${sponsor.level_num}`}
                    </span>
                    <span className="px-2 py-1 bg-[#D77E6C] text-white text-xs rounded-full font-bold">
                      {sponsor.percent}%
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    +{sponsor.bonus.toLocaleString()} ₸
                  </p>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-gray-900 mb-1">{sponsor.full_name}</p>
                  <p className="text-sm text-gray-500 mb-2">{sponsor.email}</p>
                  {sponsor.phone && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Phone className="w-3 h-3" />
                      {sponsor.phone}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {sponsorChain.length === 0 && (
              <div className="col-span-3 bg-white rounded-2xl p-12 text-center border border-gray-100">
                <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Информация о распределении бонусов недоступна</p>
              </div>
            )}
          </div>
        )}
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push('/dealer/dashboard');
        }}
        amount={SUBSCRIPTION_AMOUNT}
      />
    </>
  );
}