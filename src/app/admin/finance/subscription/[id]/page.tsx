'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { 
  ArrowLeft, 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  CreditCard,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  MapPin,
  Instagram
} from 'lucide-react';

type SubscriptionDetail = {
  id: string;
  user_id: string;
  parent_id: string | null;
  amount: number;
  method: string;
  status: string;
  paid_at: string;
  created_at: string;
  sponsor_bonus: number | null;
  ceo_bonus: number | null;
  approved_by: string | null;
  notes?: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    region?: string;
    instagram?: string;
    avatar_url?: string;
    personal_level?: number;
    personal_turnover?: number;
    created_at: string;
    is_confirmed: boolean;
    status: string;
  };
  parent?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  approver?: {
    first_name: string;
    last_name: string;
  };
};

const SubscriptionDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const subscriptionId = params?.id as string;

  const [subscription, setSubscription] = useState<SubscriptionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (subscriptionId) {
      loadSubscriptionDetails();
    }
  }, [subscriptionId]);

  const loadSubscriptionDetails = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('subscription_payments')
        .select(`
          *,
          user:user_id (
            id,
            first_name,
            last_name,
            email,
            phone,
            region,
            instagram,
            avatar_url,
            personal_level,
            personal_turnover,
            created_at,
            is_confirmed,
            status
          ),
          parent:parent_id (
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          approver:approved_by (
            first_name,
            last_name
          )
        `)
        .eq('id', subscriptionId)
        .single();

      if (error) throw error;
      
      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription details:', error);
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!subscription) return;
    
    setIsProcessing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Update subscription payment status
      const { error: paymentError } = await supabase
        .from('subscription_payments')
        .update({ 
          status: 'paid',
          approved_by: user?.id
        })
        .eq('id', subscription.id);

      if (paymentError) throw paymentError;

      // Update user role to dealer
      const { error: userError } = await supabase
        .from('users')
        .update({ 
          role: 'dealer',
          is_confirmed: true,
          status: 'active'
        })
        .eq('id', subscription.user_id);

      if (userError) throw userError;

      // TODO: Send notification to user about approval

      alert('Подписка успешно одобрена! Аккаунт дилера активирован.');
      router.push('/admin/finance');
      
    } catch (error) {
      console.error('Error approving subscription:', error);
      alert('Ошибка при одобрении подписки');
    } finally {
      setIsProcessing(false);
      setShowConfirmModal(false);
    }
  };

  const handleReject = async () => {
    if (!subscription || !rejectReason.trim()) {
      alert('Укажите причину отклонения');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Update subscription payment status
      const { error } = await supabase
        .from('subscription_payments')
        .update({ 
          status: 'rejected',
          approved_by: user?.id,
          notes: rejectReason
        })
        .eq('id', subscription.id);

      if (error) throw error;

      // TODO: Send notification to user about rejection

      alert('Подписка отклонена');
      router.push('/admin/finance');
      
    } catch (error) {
      console.error('Error rejecting subscription:', error);
      alert('Ошибка при отклонении подписки');
    } finally {
      setIsProcessing(false);
      setShowConfirmModal(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Ожидает одобрения
          </span>
        );
      case 'paid':
        return (
          <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Оплачено
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1.5 bg-red-100 text-red-800 rounded-lg text-sm font-medium flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Отклонено
          </span>
        );
      default:
        return (
          <span className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium">
            {status}
          </span>
        );
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'kaspi_transfer':
        return 'Kaspi перевод';
      case 'kaspi_qr':
        return 'Kaspi QR';
      case 'bank_transfer':
        return 'Банковский перевод';
      case 'bank_card':
        return 'Банковская карта';
      default:
        return method;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#D77E6C]" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-500">Подписка не найдена</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          Вернуться назад
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="w-full h-full p-2 md:p-4 lg:p-6 bg-gray-50 min-h-screen">
        <MoreHeaderAD title="Детали подписки" />
        
        {/* Back button */}
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
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* User Info Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" />
                Информация о дилере
              </h2>
              
              <div className="flex items-start gap-4 mb-6">
                {subscription.user?.avatar_url ? (
                  <Image
                    src={subscription.user.avatar_url}
                    alt="Avatar"
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {subscription.user?.first_name} {subscription.user?.last_name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">ID: {subscription.user_id.slice(-8)}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      subscription.user?.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {subscription.user?.status || 'inactive'}
                    </span>
                    {subscription.user?.is_confirmed && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-medium">
                        Подтвержден
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium">{subscription.user?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Телефон</p>
                    <p className="text-sm font-medium">{subscription.user?.phone || 'Не указан'}</p>
                  </div>
                </div>
                
                {subscription.user?.region && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Регион</p>
                      <p className="text-sm font-medium">{subscription.user.region}</p>
                    </div>
                  </div>
                )}
                
                {subscription.user?.instagram && (
                  <div className="flex items-center gap-3">
                    <Instagram className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Instagram</p>
                      <p className="text-sm font-medium">@{subscription.user.instagram}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Дата регистрации</p>
                    <p className="text-sm font-medium">
                      {new Date(subscription.user?.created_at || '').toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Личный товарооборот</p>
                    <p className="text-sm font-medium">
                      {(subscription.user?.personal_turnover || 0).toLocaleString()} ₸
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sponsor Info Card */}
            {subscription.parent && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  Информация о спонсоре
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Имя</p>
                    <p className="text-sm font-medium">
                      {subscription.parent.first_name} {subscription.parent.last_name}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium">{subscription.parent.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Телефон</p>
                    <p className="text-sm font-medium">{subscription.parent.phone || 'Не указан'}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">ID спонсора</p>
                    <p className="text-sm font-medium font-mono">{subscription.parent_id?.slice(-8)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {subscription.notes && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  Примечания
                </h2>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{subscription.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Info Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Детали платежа</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500">Статус</p>
                  <div className="mt-1">
                    {getStatusBadge(subscription.status)}
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Сумма платежа</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {subscription.amount.toLocaleString()} ₸
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Способ оплаты</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    {getPaymentMethodName(subscription.method)}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Дата оплаты</p>
                  <p className="text-sm font-medium">
                    {new Date(subscription.paid_at).toLocaleDateString('ru-RU')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(subscription.paid_at).toLocaleTimeString('ru-RU')}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Бонус спонсору:</span>
                    <span className="text-sm font-medium">
                      {(subscription.sponsor_bonus || 0).toLocaleString()} ₸
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">CEO бонус:</span>
                    <span className="text-sm font-medium">
                      {(subscription.ceo_bonus || 0).toLocaleString()} ₸
                    </span>
                  </div>
                </div>
                
                {subscription.approved_by && subscription.approver && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">Обработал</p>
                    <p className="text-sm font-medium">
                      {subscription.approver.first_name} {subscription.approver.last_name}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {subscription.status === 'pending' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Действия</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setConfirmAction('approve');
                      setShowConfirmModal(true);
                    }}
                    disabled={isProcessing}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Одобрить подписку
                  </button>
                  
                  <button
                    onClick={() => {
                      setConfirmAction('reject');
                      setShowConfirmModal(true);
                    }}
                    disabled={isProcessing}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Отклонить
                  </button>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Внимание!</strong> После одобрения аккаунт пользователя будет 
                    автоматически переведен в статус "Дилер" и активирован.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">
              {confirmAction === 'approve' ? 'Подтвердить одобрение' : 'Подтвердить отклонение'}
            </h3>
            
            {confirmAction === 'approve' ? (
              <div>
                <p className="text-gray-600 mb-4">
                  Вы уверены, что хотите одобрить эту подписку и активировать аккаунт дилера?
                </p>
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm">
                    <strong>Дилер:</strong> {subscription?.user?.first_name} {subscription?.user?.last_name}
                  </p>
                  <p className="text-sm">
                    <strong>Сумма:</strong> {subscription?.amount.toLocaleString()} ₸
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">
                  Укажите причину отклонения подписки:
                </p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  placeholder="Причина отклонения..."
                  rows={3}
                />
              </div>
            )}
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={confirmAction === 'approve' ? handleApprove : handleReject}
                disabled={isProcessing || (confirmAction === 'reject' && !rejectReason.trim())}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:bg-gray-400 ${
                  confirmAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Подтвердить'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubscriptionDetailPage;