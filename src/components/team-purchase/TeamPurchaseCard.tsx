'use client';

import React from 'react';
import { 
  Crown, Users, Calendar, TrendingUp, 
  Share2, Plus, Minus, Clock
} from 'lucide-react';
import type { TeamPurchaseView } from '@/lib/team-purchase/TeamPurchaseService';
import type { User } from '@/types';

interface TeamPurchaseCardProps {
  purchase: TeamPurchaseView;
  currentUser: User | null;
  onJoin: () => void;
  onShare: () => void;
  onUpdateContribution: (amount: number) => void;
}

export default function TeamPurchaseCard({
  purchase,
  currentUser,
  onJoin,
  onShare,
  onUpdateContribution
}: TeamPurchaseCardProps) {
  const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} ₸`;
  
  // Проверяем, участвует ли текущий пользователь
  const isParticipant = currentUser && purchase.participants.some(p => p.id === currentUser.id);
  const userRelation = purchase.relations.find(r => r.user_id === currentUser?.id);
  const userContribution = userRelation?.contribution_amount || 0;
  
  // Статус заказа
  const getStatusColor = () => {
    switch (purchase.order.order_status) {
      case 'new':
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'processing':
        return 'bg-yellow-100 text-yellow-700';
      case 'delivered':
      case 'shipped':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = () => {
    switch (purchase.order.order_status) {
      case 'new':
        return 'Активна';
      case 'confirmed':
        return 'Подтверждена';
      case 'processing':
        return 'В процессе';
      case 'delivered':
        return 'Доставлена';
      case 'shipped':
        return 'Отправлена';
      default:
        return purchase.order.order_status;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* Заголовок */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-[#111] mb-2">
              Заказ {purchase.order.order_number}
            </h3>
            
            {/* Организатор */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#D77E6C]/10 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-[#D77E6C]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {purchase.initiator?.first_name} {purchase.initiator?.last_name}
                </p>
                <p className="text-xs text-gray-500">Организатор</p>
              </div>
            </div>
          </div>
          
          {/* Статус */}
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </div>
        </div>

        {/* Прогресс */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Прогресс сбора</span>
            <span className="text-sm font-medium text-[#111]">
              {formatPrice(purchase.totalContributions)} / {formatPrice(purchase.order.total_amount)}
            </span>
          </div>
          <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#D77E6C] to-[#E89380] rounded-full transition-all duration-500"
              style={{ width: `${purchase.progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              {Math.round(purchase.progress)}% собрано
            </span>
            {purchase.daysLeft > 0 && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Осталось {purchase.daysLeft} дн.
              </span>
            )}
          </div>
        </div>

        {/* Информация о закупке */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Участников</p>
            <p className="text-sm font-semibold text-[#111] flex items-center gap-1">
              <Users className="w-4 h-4 text-gray-400" />
              {purchase.participants.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Экономия</p>
            <p className="text-sm font-semibold text-green-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              25%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Мин. вклад</p>
            <p className="text-sm font-semibold text-[#111]">
              {formatPrice(5000)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Товаров</p>
            <p className="text-sm font-semibold text-[#111]">
              {purchase.orderItems.length}
            </p>
          </div>
        </div>

        {/* Участники (аватары) */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex -space-x-2">
            {purchase.participants.slice(0, 5).map((participant, idx) => (
              <div
                key={participant.id}
                className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-sm font-medium ${
                  participant.id === purchase.initiator.id 
                    ? 'bg-[#D77E6C] text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}
                title={`${participant.first_name} ${participant.last_name}`}
              >
                {participant.first_name?.[0]}{participant.last_name?.[0]}
              </div>
            ))}
            {purchase.participants.length > 5 && (
              <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-sm font-medium text-gray-600">
                +{purchase.participants.length - 5}
              </div>
            )}
          </div>

          {/* Дедлайн */}
          {purchase.daysLeft > 0 && purchase.daysLeft <= 3 && (
            <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Срочно! {purchase.daysLeft} дн.
            </div>
          )}
        </div>

        {/* Действия */}
        <div className="flex gap-3">
          {/* Если пользователь не участвует и закупка активна */}
          {!isParticipant && purchase.order.order_status === 'new' && (
            <>
              <button
                onClick={onJoin}
                className="flex-1 px-4 py-2 bg-[#D77E6C] text-white rounded-lg font-medium hover:bg-[#C56D5C] transition-colors"
              >
                Участвовать
              </button>
              <button
                onClick={onShare}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                title="Поделиться"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Если пользователь участвует */}
          {isParticipant && purchase.order.order_status === 'new' && (
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Ваш вклад:</span>
                <span className="text-sm font-semibold text-[#111]">
                  {formatPrice(userContribution)}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onUpdateContribution(-1000)}
                  className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                  disabled={userContribution <= 0}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onUpdateContribution(1000)}
                  className="flex-1 py-2 bg-[#D77E6C]/10 text-[#D77E6C] rounded-lg hover:bg-[#D77E6C]/20 transition-colors flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={onShare}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Если закупка не активна */}
          {purchase.order.order_status !== 'new' && (
            <button 
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Подробнее
            </button>
          )}
        </div>
      </div>
    </div>
  );
}