'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Package, ShoppingCart, CreditCard, 
  CheckCircle, AlertCircle, Clock, TrendingUp,
  Share2, UserPlus, Settings, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { TeamPurchaseView } from '@/types';

interface TeamPurchaseFlowProps {
  purchase: TeamPurchaseView;
  currentUserId: string;
  onRefresh: () => void;
  onStart: () => void;
  onComplete: () => void;
  onCancel: () => void;
  onInvite: () => void;
  onLeave: () => void;
}

export default function TeamPurchaseFlow({
  purchase,
  currentUserId,
  onRefresh,
  onStart,
  onComplete,
  onCancel,
  onInvite,
  onLeave
}: TeamPurchaseFlowProps) {
  const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} ₸`;
  
  const isOrganizer = purchase.initiator.id === currentUserId;
  const currentMember = purchase.members.find(m => m.user.id === currentUserId);
  const hasPaid = currentMember?.hasPaid || false;

  // Определяем текущий шаг
  const getStep = () => {
    switch (purchase.purchase.status) {
      case 'forming': return 0;
      case 'active': return 1;
      case 'purchasing': return 2;
      case 'confirming': return 3;
      case 'completed': return 4;
      default: return 0;
    }
  };

  const currentStep = getStep();

  const steps = [
    { 
      title: 'Формирование', 
      icon: Users,
      description: 'Набор участников'
    },
    { 
      title: 'Выбор товаров', 
      icon: Package,
      description: 'Участники выбирают товары'
    },
    { 
      title: 'Оплата', 
      icon: CreditCard,
      description: 'Оплата заказов'
    },
    { 
      title: 'Подтверждение', 
      icon: CheckCircle,
      description: 'Проверка менеджером'
    },
    { 
      title: 'Завершено', 
      icon: CheckCircle,
      description: 'Заказ выполнен'
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Заголовок */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#111]">
              {purchase.purchase.title}
            </h2>
            <p className="text-gray-500 mt-1">
              Заказ #{purchase.purchase.id.slice(0, 8)}
            </p>
          </div>
          
          {/* Статус */}
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${
            purchase.purchase.status === 'completed' ? 'bg-green-100 text-green-700' :
            purchase.purchase.status === 'cancelled' ? 'bg-red-100 text-red-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {purchase.purchase.status === 'forming' && 'Формируется'}
            {purchase.purchase.status === 'active' && 'Активна'}
            {purchase.purchase.status === 'purchasing' && 'Идет оплата'}
            {purchase.purchase.status === 'confirming' && 'Подтверждение'}
            {purchase.purchase.status === 'completed' && 'Завершена'}
            {purchase.purchase.status === 'cancelled' && 'Отменена'}
          </div>
        </div>

        {/* Прогресс шагов */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-[#D77E6C] text-white' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <p className={`text-xs mt-2 font-medium ${
                    isActive ? 'text-[#111]' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Контент в зависимости от статуса */}
      <div className="p-6">
        {/* ФОРМИРОВАНИЕ */}
        {purchase.purchase.status === 'forming' && (
          <div className="space-y-6">
            {/* Прогресс сбора */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Целевая сумма</span>
                <span className="text-sm font-medium">
                  {formatPrice(purchase.purchase.collected_amount)} / {formatPrice(purchase.purchase.target_amount)}
                </span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#D77E6C] to-[#E89380] transition-all"
                  style={{ width: `${purchase.progress}%` }}
                />
              </div>
              {purchase.purchase.collected_amount < 300000 && (
                <p className="text-xs text-orange-600 mt-2">
                  Минимальная сумма для старта: 300,000 ₸
                </p>
              )}
            </div>

            {/* Участники */}
            <div>
              <h3 className="font-semibold text-[#111] mb-3">
                Участники ({purchase.totalMembers})
              </h3>
              <div className="space-y-2">
                {purchase.members.map(member => (
                  <div key={member.member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                        member.isOrganizer ? 'bg-[#D77E6C] text-white' : 'bg-gray-200'
                      }`}>
                        {member.user.first_name?.[0]}{member.user.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-[#111]">
                          {member.user.first_name} {member.user.last_name}
                          {member.isOrganizer && ' (Организатор)'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Планируемый вклад: {formatPrice(member.member.contribution_target)}
                        </p>
                      </div>
                    </div>
                    {member.member.status === 'accepted' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Действия */}
            <div className="flex gap-3">
              {isOrganizer ? (
                <>
                  <button
                    onClick={onInvite}
                    className="flex-1 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-5 h-5" />
                    Пригласить
                  </button>
                  <button
                    onClick={onStart}
                    disabled={!purchase.canStart}
                    className="flex-1 py-3 bg-[#D77E6C] text-white rounded-xl font-medium hover:bg-[#C56D5C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Начать закупку
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onLeave}
                    className="flex-1 py-3 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors"
                  >
                    Выйти из закупки
                  </button>
                  <button
                    onClick={onInvite}
                    className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* АКТИВНАЯ - выбор товаров */}
        {purchase.purchase.status === 'active' && (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Выберите товары</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Ваш лимит: {formatPrice(currentMember?.member.contribution_target || 0)}
                  </p>
                  <p className="text-sm text-blue-700">
                    В корзине: {formatPrice(currentMember?.member.cart_total || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Статус участников */}
            <div>
              <h3 className="font-semibold text-[#111] mb-3">Статус участников</h3>
              <div className="space-y-2">
                {purchase.members.map(member => (
                  <div key={member.member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                        {member.user.first_name?.[0]}{member.user.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-[#111]">
                          {member.user.first_name} {member.user.last_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          В корзине: {formatPrice(member.member.cart_total)}
                        </p>
                      </div>
                    </div>
                    {member.member.cart_total > 0 ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Действие */}
            <button
              onClick={() => window.location.href = '/dealer/shop'}
              className="w-full py-3 bg-[#D77E6C] text-white rounded-xl font-medium hover:bg-[#C56D5C] transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Перейти к выбору товаров
            </button>
          </div>
        )}

        {/* ОПЛАТА */}
        {purchase.purchase.status === 'purchasing' && (
          <div className="space-y-6">
            {/* Прогресс оплат */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Оплачено</span>
                <span className="text-sm font-medium">
                  {formatPrice(purchase.totalPaid)} / {formatPrice(purchase.purchase.target_amount)}
                </span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${(purchase.totalPaid / purchase.purchase.target_amount) * 100}%` }}
                />
              </div>
            </div>

            {/* Статус оплат */}
            <div>
              <h3 className="font-semibold text-[#111] mb-3">Статус оплат</h3>
              <div className="space-y-2">
                {purchase.members.map(member => (
                  <div key={member.member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                        member.hasPaid ? 'bg-green-500 text-white' : 'bg-gray-200'
                      }`}>
                        {member.user.first_name?.[0]}{member.user.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-[#111]">
                          {member.user.first_name} {member.user.last_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          К оплате: {formatPrice(member.member.cart_total)}
                        </p>
                      </div>
                    </div>
                    {member.hasPaid ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-green-600">Оплачено</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-500" />
                        <span className="text-sm text-orange-600">Ожидание</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Действия */}
            {!hasPaid && currentMember && (
              <button
                onClick={() => window.location.href = `/team-purchase/${purchase.purchase.id}/checkout`}
                className="w-full py-3 bg-[#D77E6C] text-white rounded-xl font-medium hover:bg-[#C56D5C] transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Оплатить мой заказ
              </button>
            )}

            {isOrganizer && purchase.totalPaid >= purchase.purchase.target_amount && (
              <button
                onClick={onComplete}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
              >
                Отправить менеджеру на подтверждение
              </button>
            )}
          </div>
        )}

        {/* ПОДТВЕРЖДЕНИЕ */}
        {purchase.purchase.status === 'confirming' && (
          <div className="space-y-6">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">Ожидание подтверждения</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Менеджер проверяет и собирает ваш заказ
                  </p>
                </div>
              </div>
            </div>

            {/* Итоги */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Участников</span>
                <span className="font-medium">{purchase.totalMembers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Общая сумма</span>
                <span className="font-medium">{formatPrice(purchase.totalPaid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ваша экономия</span>
                <span className="font-medium text-green-600">~25%</span>
              </div>
            </div>
          </div>
        )}

        {/* ЗАВЕРШЕНО */}
        {purchase.purchase.status === 'completed' && (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Закупка завершена!</p>
                  <p className="text-sm text-green-700 mt-1">
                    Заказ готов к выдаче. Бонусы начислены.
                  </p>
                </div>
              </div>
            </div>

            {/* Итоговая статистика */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Участников</p>
                <p className="text-2xl font-bold text-[#111]">{purchase.totalMembers}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Общая сумма</p>
                <p className="text-2xl font-bold text-[#111]">{formatPrice(purchase.totalPaid)}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Экономия</p>
                <p className="text-2xl font-bold text-green-600">~25%</p>
              </div>
              <div className="bg-[#D77E6C]/10 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Бонусы</p>
                <p className="text-2xl font-bold text-[#D77E6C]">Начислены</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}