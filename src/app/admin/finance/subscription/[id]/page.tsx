'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-toastify';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  CreditCard,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Hash,
  FileText,
  MapPin,
  Instagram,
  Shield,
  Briefcase
} from 'lucide-react';

type BonusDistribution = {
  id: string;
  recipient_id: string;
  amount: number;
  percentage: number;
  hierarchy_level: number;
  distribution_type: string;
  status: string;
  created_at: string;
  recipient?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
};

type SubscriptionDetail = {
  id: string;
  user_id: string;
  parent_id: string | null;
  amount: number;
  method: string;
  status: string;
  paid_at: string;
  created_at: string;
  notes?: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    iin?: string;
    region?: string;
    instagram?: string;
    avatar_url?: string;
    created_at: string;
    is_confirmed: boolean;
    status: string;
    role: string;
  };
  parent?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  bonusDistributions?: BonusDistribution[];
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
      
      // Шаг 1: Загружаем основную подписку
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscription_payments')
        .select('*')
        .eq('id', subscriptionId)
        .single();

      if (subscriptionError) throw subscriptionError;
      
      // Шаг 2: Загружаем данные пользователя
      let userData = null;
      if (subscriptionData.user_id) {
        const { data: userInfo, error: userError } = await supabase
          .from('users')
          .select('id, first_name, last_name, email, phone, iin, region, instagram, avatar_url, created_at, is_confirmed, status, role')
          .eq('id', subscriptionData.user_id)
          .single();
        
        if (userError) {
          console.warn('Error loading user data:', userError);
        } else {
          userData = userInfo;
        }
      }
      
      // Шаг 3: Загружаем данные спонсора
      let parentData = null;
      if (subscriptionData.parent_id) {
        const { data: parentInfo, error: parentError } = await supabase
          .from('users')
          .select('id, first_name, last_name, email, phone')
          .eq('id', subscriptionData.parent_id)
          .single();
        
        if (parentError) {
          console.warn('Error loading parent data:', parentError);
        } else {
          parentData = parentInfo;
        }
      }
      
      // Шаг 4: Загружаем распределения бонусов
      let bonusDistributions: BonusDistribution[] = [];
      const { data: distributionsData, error: distributionsError } = await supabase
        .from('subscription_payment_distributions')
        .select('*')
        .eq('subscription_payment_id', subscriptionId)
        .order('hierarchy_level', { ascending: true });
      
      if (distributionsError) {
        console.warn('Error loading bonus distributions:', distributionsError);
      } else if (distributionsData && distributionsData.length > 0) {
        // Загружаем данные получателей бонусов
        const recipientIds = distributionsData.map(d => d.recipient_id);
        const { data: recipientsData } = await supabase
          .from('users')
          .select('id, first_name, last_name, email, phone')
          .in('id', recipientIds);
        
        // Объединяем данные
        bonusDistributions = distributionsData.map(dist => ({
          ...dist,
          recipient: recipientsData?.find(r => r.id === dist.recipient_id)
        }));
      }
      
      // Шаг 5: Объединяем все данные
      const fullSubscription = {
        ...subscriptionData,
        user: userData,
        parent: parentData,
        bonusDistributions
      };
      
      setSubscription(fullSubscription);
      toast.success('✅ Данные подписки загружены');
      
    } catch (error: any) {
      console.error('Error loading subscription details:', error);
      toast.error(`❌ ${error.message || 'Ошибка загрузки данных подписки'}`);
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!subscription) return;
    
    setIsProcessing(true);
    
    try {
      // Шаг 1: Обновляем статус пользователя на активного дилера
      const { error: userError } = await supabase
        .from('users')
        .update({ 
          status: 'active',
          is_confirmed: true,
          role: 'dealer'
        })
        .eq('id', subscription.user_id);

      if (userError) throw userError;

      // Шаг 2: Обновляем статус платежа
      const { error: paymentError } = await supabase
        .from('subscription_payments')
        .update({ 
          status: 'paid'
        })
        .eq('id', subscription.id);

      if (paymentError) throw paymentError;

      // Шаг 3: Вызываем функцию распределения бонусов через RPC
      const { data, error: bonusError } = await supabase
        .rpc('process_subscription_payment_bonuses', {
          p_payment_id: subscription.id
        });

      if (bonusError) {
        console.error('Error distributing bonuses:', bonusError);
        toast.warning('⚠️ Подписка одобрена, но возникла ошибка при распределении бонусов');
      } else if (data && data.success) {
        console.log('Bonuses distributed:', data.message);
        toast.success('✅ Подписка одобрена! Аккаунт активирован, бонусы распределены.');
      }

      setTimeout(() => {
        router.push('/admin/finance/subscription');
      }, 1500);
      
    } catch (error: any) {
      console.error('Error approving subscription:', error);
      toast.error(`❌ ${error.message || 'Ошибка при одобрении'}`);
    } finally {
      setIsProcessing(false);
      setShowConfirmModal(false);
    }
  };

  const handleReject = async () => {
    if (!subscription || !rejectReason.trim()) {
      toast.error('❌ Укажите причину отклонения');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const { error } = await supabase
        .from('subscription_payments')
        .update({ 
          status: 'rejected',
          notes: rejectReason
        })
        .eq('id', subscription.id);

      if (error) throw error;

      toast.success('✅ Подписка отклонена');
      
      setTimeout(() => {
        router.push('/admin/finance/subscription');
      }, 1500);
      
    } catch (error: any) {
      console.error('Error rejecting subscription:', error);
      toast.error(`❌ ${error.message || 'Ошибка при отклонении'}`);
    } finally {
      setIsProcessing(false);
      setShowConfirmModal(false);
      setRejectReason('');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
            <Clock className="w-3.5 h-3.5" />
            Ожидает одобрения
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            Оплачено
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm font-medium">
            <XCircle className="w-3.5 h-3.5" />
            Отклонено
          </span>
        );
      default:
        return null;
    }
  };

  const getPaymentMethodName = (method: string) => {
    const methods: any = {
      'kaspi_transfer': 'Kaspi перевод',
      'kaspi_qr': 'Kaspi QR',
      'bank_transfer': 'Банковский перевод',
      'bank_card': 'Банковская карта'
    };
    return methods[method] || method;
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
        <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-500">Подписка не найдена</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen">
        <div className="">
          <MoreHeaderAD title="Детали подписки" showBackButton={true} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* User Info Card */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-[#D77E6C] to-[#C66B5A] p-6 text-white">
                  <div className="flex items-center gap-4">
                    {subscription.user?.avatar_url ? (
                      <Image
                        src={subscription.user.avatar_url}
                        alt="Avatar"
                        width={72}
                        height={72}
                        className="rounded-full border-3 border-white/20"
                      />
                    ) : (
                      <div className="w-[72px] h-[72px] bg-white/20 rounded-full flex items-center justify-center">
                        <User className="w-9 h-9 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold">
                        {subscription.user?.first_name} {subscription.user?.last_name}
                      </h3>
                      <p className="text-white/80">
                        ID: {subscription.user_id.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Информация о пользователе</h4>
                  
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium text-sm">{subscription.user?.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">Телефон</p>
                        <p className="font-medium text-sm">{subscription.user?.phone || 'Не указан'}</p>
                      </div>
                    </div>

                    {subscription.user?.region && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500">Регион</p>
                          <p className="font-medium text-sm">{subscription.user.region}</p>
                        </div>
                      </div>
                    )}

                    {subscription.user?.instagram && (
                      <div className="flex items-start gap-3">
                        <Instagram className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500">Instagram</p>
                          <p className="font-medium text-sm">@{subscription.user.instagram}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <Shield className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">Статус аккаунта</p>
                        <p className="font-medium text-sm">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            subscription.user?.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {subscription.user?.status || 'Неактивен'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Briefcase className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">Роль</p>
                        <p className="font-medium text-sm capitalize">{subscription.user?.role || 'user'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">Дата регистрации</p>
                        <p className="font-medium text-sm">
                          {new Date(subscription.user?.created_at || '').toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                    
                    {subscription.user?.iin && (
                      <div className="flex items-start gap-3">
                        <Hash className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500">ИИН</p>
                          <p className="font-medium text-sm font-mono">{subscription.user.iin}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bonus Recipients Card */}
              {subscription.bonusDistributions && subscription.bonusDistributions.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#D77E6C]" />
                    Распределение бонусов
                  </h3>
                  
                  <div className="space-y-3">
                    {subscription.bonusDistributions.map((dist) => {
                      const levelNames: Record<number, string> = {
                        1: '1-й уровень (родитель)',
                        2: '2-й уровень (дед)',
                        3: '3-й уровень (прадед)'
                      };
                      
                      const levelColors: Record<number, string> = {
                        1: 'from-emerald-500 to-green-600',
                        2: 'from-blue-500 to-indigo-600',
                        3: 'from-purple-500 to-pink-600'
                      };
                      
                      return (
                        <div 
                          key={dist.id} 
                          className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border-l-4 border-[#D77E6C]"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 bg-gradient-to-r ${levelColors[dist.hierarchy_level]} text-white text-xs font-semibold rounded-full`}>
                                  {levelNames[dist.hierarchy_level] || `Уровень ${dist.hierarchy_level}`}
                                </span>
                                {dist.status === 'paid' && (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                )}
                              </div>
                              <p className="font-semibold text-lg">
                                {dist.recipient?.first_name} {dist.recipient?.last_name}
                              </p>
                              <p className="text-sm text-gray-500">{dist.recipient?.email}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500 mb-1">{dist.percentage}% от суммы</p>
                              <p className="text-xl font-bold text-green-600">
                                +{dist.amount.toLocaleString()} ₸
                              </p>
                            </div>
                          </div>
                          {dist.recipient?.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 pt-2 border-t border-gray-200">
                              <Phone className="w-3.5 h-3.5" />
                              {dist.recipient.phone}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-800">
                      💡 Бонусы распределяются автоматически по 3 уровням вверх: родитель получает наибольший процент, 
                      дед и прадед - меньшие проценты согласно настройкам системы.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Если распределений нет, показываем информацию о спонсоре */}
              {(!subscription.bonusDistributions || subscription.bonusDistributions.length === 0) && subscription.parent && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#D77E6C]" />
                    Информация о спонсоре
                  </h3>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-lg">
                          {subscription.parent.first_name} {subscription.parent.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{subscription.parent.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Получит бонус</p>
                        <p className="text-lg font-bold text-green-600">+25,000 ₸</p>
                      </div>
                    </div>
                    {subscription.parent.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-3.5 h-3.5" />
                        {subscription.parent.phone}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Notes */}
              {subscription.notes && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#D77E6C]" />
                    Детали платежа от дилера
                  </h3>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{subscription.notes}</p>
                  </div>
                </div>
              )}

              {/* Payment Details */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold mb-4">Информация о платеже</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Способ оплаты</p>
                      <p className="font-medium">{getPaymentMethodName(subscription.method)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Дата платежа</p>
                      <p className="font-medium">
                        {new Date(subscription.paid_at).toLocaleDateString('ru-RU')}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(subscription.paid_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Actions */}
            <div className="space-y-6">
              {/* Actions Card */}
              {subscription.status === 'pending' && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Детали заявки</h3>
                      {getStatusBadge(subscription.status)}
                    </div>
                    <div className="bg-gradient-to-r from-[#D77E6C]/10 to-[#C66B5A]/10 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Сумма платежа</p>
                      <p className="text-3xl font-bold text-[#D77E6C]">
                        {subscription.amount.toLocaleString()} ₸
                      </p>
                    </div>
                  </div>

                  <h3 className="font-semibold mb-4">Действия</h3>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setConfirmAction('approve');
                        setShowConfirmModal(true);
                      }}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Одобрить и активировать
                    </button>
                    
                    <button
                      onClick={() => {
                        setConfirmAction('reject');
                        setShowConfirmModal(true);
                      }}
                      disabled={isProcessing}
                      className="w-full bg-white hover:bg-gray-50 text-red-600 border-2 border-red-200 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Отклонить заявку
                    </button>
                  </div>
                  
                  <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                    <p className="text-xs text-amber-800">
                      При одобрении дилер получит доступ к личному кабинету, а спонсоры получат бонусы.
                    </p>
                  </div>
                </div>
              )}
              
              {subscription.status === 'paid' && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="mb-4">
                    {getStatusBadge(subscription.status)}
                  </div>
                  <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">Оплаченная сумма</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {subscription.amount.toLocaleString()} ₸
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    Аккаунт дилера активирован, бонусы распределены.
                  </p>
                </div>
              )}
              
              {subscription.status === 'rejected' && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="mb-4">
                    {getStatusBadge(subscription.status)}
                  </div>
                  <div className="bg-red-50 rounded-xl p-4">
                    <p className="text-sm text-red-700">
                      Заявка была отклонена администратором.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4">
              {confirmAction === 'approve' ? 'Подтвердить одобрение' : 'Отклонить заявку'}
            </h3>
            
            {confirmAction === 'approve' ? (
              <>
                <p className="text-gray-600 mb-4">
                  Вы уверены, что хотите одобрить подписку?
                </p>
                <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Дилер:</span>
                    <span className="font-medium">
                      {subscription?.user?.first_name} {subscription?.user?.last_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Сумма:</span>
                    <span className="font-medium">{subscription?.amount.toLocaleString()} ₸</span>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700">
                  ✓ Статус пользователя → <strong>active</strong><br/>
                  ✓ Подтверждение → <strong>is_confirmed: true</strong><br/>
                  ✓ Роль → <strong>dealer</strong>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  Укажите причину отклонения:
                </p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Причина отклонения..."
                  rows={3}
                />
              </>
            )}
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setRejectReason('');
                }}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={confirmAction === 'approve' ? handleApprove : handleReject}
                disabled={isProcessing || (confirmAction === 'reject' && !rejectReason.trim())}
                className={`flex-1 px-4 py-3 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                  confirmAction === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:bg-gray-400`}
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {confirmAction === 'approve' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    Подтвердить
                  </>
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