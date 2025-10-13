'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowRight, Loader2, CreditCard, Copy, Check, 
  Users, Info, Phone, Mail, Hash, User, 
  Clock, Award, ChevronRight, Wallet,
  CheckCircle2, AlertCircle, QrCode, Building2
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
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'payment' | 'bonuses'>('payment');
  
  const SUBSCRIPTION_AMOUNT = 100000;
  const KASPI_NUMBER = "+7 777 123 45 67";
  const BANK_NAME = "ТОО Tannur Kazakhstan";
  const BIK = "KKMFKZ2A";
  const IIK = "KZ12345678901234567890";

  const paymentMethods = [
    { 
      id: 'kaspi_transfer',
      name: 'Каспи Перевод',
      icon: '💳',
      description: 'На номер телефона'
    },
    { 
      id: 'kaspi_qr',
      name: 'Каспи QR', 
      icon: '📱',
      description: 'Через QR-код'
    },
    { 
      id: 'bank_transfer',
      name: 'Банковский перевод',
      icon: '🏦',
      description: 'На расчетный счет'
    }
  ];

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

  const handlePaymentConfirm = async () => {
    if (!selectedMethod) {
      setError('Выберите способ оплаты');
      return;
    }

    if (!notes.trim()) {
      setError('Укажите детали платежа');
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
          method: selectedMethod,
          status: 'pending',
          paid_at: new Date().toISOString(),
          notes: notes.trim()
        }]);

      if (error) throw error;
      setShowSuccessModal(true);
    } catch (err: any) {
      setError('Ошибка создания заявки');
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

            {/* Payment Methods */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Выберите способ оплаты</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`bg-white rounded-2xl p-6 text-left hover:shadow-lg transition-all group border-2 ${
                      selectedMethod === method.id 
                        ? 'border-[#D77E6C] shadow-lg' 
                        : 'border-gray-100'
                    }`}
                  >
                    <div className="text-3xl mb-3">{method.icon}</div>
                    <h4 className="text-base font-semibold text-gray-900 mb-1">
                      {method.name}
                    </h4>
                    <p className="text-sm text-gray-500">{method.description}</p>
                    {selectedMethod === method.id && (
                      <div className="mt-4 flex items-center text-[#D77E6C] text-sm font-medium">
                        <span>Выбрано</span>
                        <Check className="w-4 h-4 ml-1" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Details - Kaspi Transfer */}
            {selectedMethod === 'kaspi_transfer' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">💳</span>
                  Детали для перевода Каспи
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Номер телефона</p>
                      <p className="text-lg font-mono font-semibold">{KASPI_NUMBER}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(KASPI_NUMBER, 'phone')}
                      className="p-2 bg-[#D77E6C] text-white rounded-lg hover:bg-[#C66B5A] transition-colors"
                    >
                      {copied === 'phone' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Сумма к переводу</p>
                    <p className="text-2xl font-bold text-[#D77E6C]">{SUBSCRIPTION_AMOUNT.toLocaleString()} ₸</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Details - QR Code */}
            {selectedMethod === 'kaspi_qr' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  QR-код для оплаты
                </h4>
                <div className="flex flex-col items-center">
                  <div className="w-64 h-64 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">QR-код временно недоступен</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">Сумма к оплате</p>
                    <p className="text-3xl font-bold text-[#D77E6C]">{SUBSCRIPTION_AMOUNT.toLocaleString()} ₸</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Details - Bank Transfer */}
            {selectedMethod === 'bank_transfer' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Банковские реквизиты
                </h4>
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Получатель</p>
                    <p className="font-semibold">{BANK_NAME}</p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">БИК банка</p>
                      <p className="font-mono font-semibold">{BIK}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(BIK, 'bik')}
                      className="p-2 bg-[#D77E6C] text-white rounded-lg hover:bg-[#C66B5A] transition-colors"
                    >
                      {copied === 'bik' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1 mr-2">
                      <p className="text-sm text-gray-500 mb-1">Расчетный счет (ИИК)</p>
                      <p className="font-mono text-sm break-all">{IIK}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(IIK, 'iik')}
                      className="p-2 bg-[#D77E6C] text-white rounded-lg hover:bg-[#C66B5A] transition-colors flex-shrink-0"
                    >
                      {copied === 'iik' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Назначение платежа</p>
                    <p className="text-sm font-medium">Оплата подписки дилера ID: {dealerId?.slice(0, 8)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Сумма</p>
                    <p className="text-2xl font-bold text-[#D77E6C]">{SUBSCRIPTION_AMOUNT.toLocaleString()} ₸</p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes Input */}
            {selectedMethod && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Детали платежа <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-[#D77E6C] transition-colors"
                  placeholder="Укажите номер транзакции, время перевода, имя отправителя..."
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Эта информация поможет финансисту быстрее найти и подтвердить ваш платеж
                </p>
                {error && (
                  <div className="mt-3 flex items-start gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5" />
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            {selectedMethod && (
              <button
                onClick={handlePaymentConfirm}
                disabled={!notes.trim() || isSubmitting}
                className="w-full bg-[#D77E6C] hover:bg-[#C66B5A] disabled:bg-gray-300 text-white py-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Отправка заявки...</span>
                  </>
                ) : (
                  <>
                    <span>Подтвердить оплату</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
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