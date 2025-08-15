'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Users, TrendingUp, Clock, Target, 
  CheckCircle, AlertCircle, Gift, Shield,
  ChevronRight, UserPlus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';
import { teamPurchaseService } from '@/lib/team-purchase/TeamPurchaseService';
import { teamPurchaseLifecycleService } from '@/lib/team-purchase/TeamPurchaseLifecycleService';
import type { TeamPurchase, User } from '@/types';

export default function TeamPurchaseJoinPage() {
  const params = useParams();
  const router = useRouter();
  const inviteCode = params.code as string;

  const [purchase, setPurchase] = useState<TeamPurchase | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [contribution, setContribution] = useState(50000);
  const [isJoining, setIsJoining] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alreadyMember, setAlreadyMember] = useState(false);

  useEffect(() => {
    loadPurchaseAndUser();
  }, [inviteCode]);

  const loadPurchaseAndUser = async () => {
    try {
      // Проверяем авторизацию
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Сохраняем код в localStorage и редиректим на вход
        localStorage.setItem('pendingInviteCode', inviteCode);
        router.push('/signin');
        return;
      }

      // Загружаем данные пользователя
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      setCurrentUser(userData);

      // Загружаем закупку по коду
      const { data: purchaseData } = await supabase
        .from('team_purchases')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();

      if (!purchaseData) {
        toast.error('Закупка не найдена');
        router.push('/dealer/team-purchases');
        return;
      }

      setPurchase(purchaseData);

      // Проверяем, участвует ли уже
      const { data: member } = await supabase
        .from('team_purchase_members')
        .select('*')
        .eq('team_purchase_id', purchaseData.id)
        .eq('user_id', user.id)
        .single();

      if (member && member.status !== 'left') {
        setAlreadyMember(true);
      }

    } catch (error) {
      console.error('Error loading:', error);
      toast.error('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!currentUser || !purchase) return;

    setIsJoining(true);
    try {
      const result = await teamPurchaseLifecycleService.joinByInviteCode(
        inviteCode,
        currentUser.id,
        contribution
      );

      if (result.success) {
        toast.success(result.message);
        router.push(`/dealer/team-purchases/${purchase.id}`);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error('Error joining:', error);
      toast.error(error.message || 'Ошибка присоединения');
    } finally {
      setIsJoining(false);
    }
  };

  const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} ₸`;
  const progress = purchase ? (purchase.collected_amount / purchase.target_amount) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D77E6C] border-t-transparent"></div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#111] mb-2">Закупка не найдена</h2>
          <p className="text-gray-500 mb-6">Проверьте правильность ссылки</p>
          <button
            onClick={() => router.push('/dealer/team-purchases')}
            className="px-6 py-3 bg-[#D77E6C] text-white rounded-xl hover:bg-[#C56D5C] transition-colors"
          >
            К закупкам
          </button>
        </div>
      </div>
    );
  }

  if (alreadyMember) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#111] mb-2">Вы уже участник</h2>
          <p className="text-gray-500 mb-6">Вы уже участвуете в этой закупке</p>
          <button
            onClick={() => router.push(`/dealer/team-purchases/${purchase.id}`)}
            className="px-6 py-3 bg-[#D77E6C] text-white rounded-xl hover:bg-[#C56D5C] transition-colors"
          >
            Перейти к закупке
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D77E6C]/10 to-[#F6F6F6]">
      <div className="max-w-4xl mx-auto p-6 py-12">
        
        {/* Заголовок */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#D77E6C]/10 rounded-full mb-4">
            <Users className="w-10 h-10 text-[#D77E6C]" />
          </div>
          <h1 className="text-3xl font-bold text-[#111] mb-2">
            Приглашение в командную закупку
          </h1>
          <p className="text-gray-500">
            Присоединитесь и получите максимальную выгоду
          </p>
        </div>

        {/* Карточка закупки */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#111] mb-2">
              {purchase.title}
            </h2>
            {purchase.description && (
              <p className="text-gray-600 mb-4">{purchase.description}</p>
            )}

            {/* Прогресс */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Прогресс сбора</span>
                <span className="text-sm font-medium">
                  {formatPrice(purchase.collected_amount)} / {formatPrice(purchase.target_amount)}
                </span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#D77E6C] to-[#E89380] transition-all"
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Собрано {progress.toFixed(0)}% от цели
              </p>
            </div>

            {/* Информация */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Target className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-xs text-gray-500">Цель</p>
                <p className="font-semibold text-[#111]">{formatPrice(purchase.target_amount)}</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-xs text-gray-500">Мин. вклад</p>
                <p className="font-semibold text-[#111]">{formatPrice(purchase.min_contribution)}</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-xs text-gray-500">Дедлайн</p>
                <p className="font-semibold text-[#111]">
                  {purchase.deadline ? new Date(purchase.deadline).toLocaleDateString('ru-RU') : 'Не указан'}
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-xs text-gray-500">Экономия</p>
                <p className="font-semibold text-green-600">~25%</p>
              </div>
            </div>

            {/* Выбор вклада */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Ваш планируемый вклад
              </label>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[30000, 50000, 100000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setContribution(amount)}
                    className={`py-3 rounded-lg font-medium transition-colors ${
                      contribution === amount
                        ? 'bg-[#D77E6C] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {formatPrice(amount)}
                  </button>
                ))}
              </div>
              
              <input
                type="range"
                min={purchase.min_contribution}
                max={500000}
                step={10000}
                value={contribution}
                onChange={(e) => setContribution(Number(e.target.value))}
                className="w-full"
              />
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">Мин: {formatPrice(purchase.min_contribution)}</span>
                <span className="text-lg font-bold text-[#D77E6C]">{formatPrice(contribution)}</span>
                <span className="text-sm text-gray-500">Макс: 500,000 ₸</span>
              </div>
            </div>
          </div>
        </div>

        {/* Преимущества */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-[#111] mb-1">Максимальная скидка</h3>
            <p className="text-sm text-gray-500">
              Получите дилерскую цену с дополнительной скидкой до 25%
            </p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <Gift className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-[#111] mb-1">Бонусы за участие</h3>
            <p className="text-sm text-gray-500">
              Получайте бонусы с личных покупок и покупок вашей команды
            </p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-[#111] mb-1">Гарантия безопасности</h3>
            <p className="text-sm text-gray-500">
              Все сделки защищены, возврат средств при отмене закупки
            </p>
          </div>
        </div>

        {/* Действия */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/dealer/team-purchases')}
            className="flex-1 py-4 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleJoin}
            disabled={isJoining || purchase.status !== 'forming'}
            className="flex-1 py-4 bg-[#D77E6C] text-white rounded-xl font-medium hover:bg-[#C56D5C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isJoining ? (
              <>Присоединяемся...</>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Присоединиться с вкладом {formatPrice(contribution)}
              </>
            )}
          </button>
        </div>

        {purchase.status !== 'forming' && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Закупка уже началась</p>
                <p className="text-sm text-yellow-700 mt-1">
                  К сожалению, присоединиться можно только на этапе формирования
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}