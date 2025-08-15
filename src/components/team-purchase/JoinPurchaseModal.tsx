'use client';

import React, { useState } from 'react';
import { 
  X, Plus, Minus, Users, TrendingUp, 
  Calendar, AlertCircle, CheckCircle 
} from 'lucide-react';
import type { TeamPurchaseView } from '@/lib/team-purchase/TeamPurchaseService';

interface JoinPurchaseModalProps {
  purchase: TeamPurchaseView;
  onClose: () => void;
  onJoin: (amount: number) => void;
}

export default function JoinPurchaseModal({
  purchase,
  onClose,
  onJoin
}: JoinPurchaseModalProps) {
  const [contributionAmount, setContributionAmount] = useState(10000);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} ₸`;

  const handleJoin = () => {
    if (!agreeToTerms) {
      alert('Необходимо согласиться с условиями');
      return;
    }
    if (contributionAmount < 5000) {
      alert('Минимальный вклад 5000 ₸');
      return;
    }
    onJoin(contributionAmount);
  };

  // Расчет вашей доли
  const yourShare = ((contributionAmount / purchase.order.total_amount) * 100).toFixed(1);
  
  // Расчет экономии
  const estimatedSavings = contributionAmount * 0.25; // 25% экономия

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#111]">
              Присоединиться к закупке
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Информация о закупке */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-[#111] mb-3">
              {purchase.order.order_number}
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Участников
                </span>
                <span className="text-sm font-medium">
                  {purchase.participants.length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Собрано
                </span>
                <span className="text-sm font-medium">
                  {formatPrice(purchase.totalContributions)} ({Math.round(purchase.progress)}%)
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Осталось дней
                </span>
                <span className="text-sm font-medium">
                  {purchase.daysLeft}
                </span>
              </div>
            </div>
          </div>

          {/* Выбор суммы вклада */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Ваш вклад
            </label>
            
            {/* Быстрый выбор */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[5000, 10000, 20000].map(amount => (
                <button
                  key={amount}
                  onClick={() => setContributionAmount(amount)}
                  className={`py-2 rounded-lg font-medium transition-colors ${
                    contributionAmount === amount
                      ? 'bg-[#D77E6C] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {formatPrice(amount)}
                </button>
              ))}
            </div>

            {/* Точная настройка */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setContributionAmount(Math.max(5000, contributionAmount - 1000))}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
              
              <div className="flex-1 text-center">
                <p className="text-2xl font-bold text-[#D77E6C]">
                  {formatPrice(contributionAmount)}
                </p>
                <p className="text-xs text-gray-500">
                  Ваша доля: {yourShare}%
                </p>
              </div>
              
              <button
                onClick={() => setContributionAmount(contributionAmount + 1000)}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Преимущества */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#111]">
                  Экономия ~{formatPrice(estimatedSavings)}
                </p>
                <p className="text-xs text-gray-500">
                  При скидке 25% от розничной цены
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#111]">
                  Коллективная выгода
                </p>
                <p className="text-xs text-gray-500">
                  Больше участников — больше скидка
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#111]">
                  Бонусы за участие
                </p>
                <p className="text-xs text-gray-500">
                  Дополнительные баллы в программе лояльности
                </p>
              </div>
            </div>
          </div>

          {/* Предупреждение */}
          <div className="p-3 bg-yellow-50 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Важно!</p>
              <ul className="space-y-1 text-xs">
                <li>• Вклад можно изменить до закрытия сбора</li>
                <li>• Возврат средств возможен только при отмене закупки</li>
                <li>• Товар будет доставлен после полной оплаты всеми участниками</li>
              </ul>
            </div>
          </div>

          {/* Согласие с условиями */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-[#D77E6C] rounded focus:ring-[#D77E6C]"
            />
            <span className="text-sm text-gray-600">
              Я согласен с условиями командной закупки и понимаю, что мой вклад 
              будет зарезервирован до завершения сбора
            </span>
          </label>
        </div>

        {/* Действия */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleJoin}
              disabled={!agreeToTerms}
              className="flex-1 px-4 py-3 bg-[#D77E6C] text-white rounded-lg font-medium hover:bg-[#C56D5C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Внести {formatPrice(contributionAmount)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}