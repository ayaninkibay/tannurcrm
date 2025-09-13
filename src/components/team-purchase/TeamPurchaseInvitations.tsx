// components/team-purchase/TeamPurchaseInvitations.tsx

import React, { useState, useEffect } from 'react';
import {
  Bell, UserPlus, X, Check, Clock, Users, 
  TrendingUp, Calendar, ChevronRight, Gift,
  Target, Crown, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslate } from '@/hooks/useTranslate';
import { teamPurchaseInvitationService } from '@/lib/team-purchase/TeamPurchaseInvitationService';

interface Invitation {
  id: string;
  team_purchase_id: string;
  user_id: string;
  status: string;
  invited_by: string;
  created_at: string;
  team_purchase: {
    id: string;
    title: string;
    description?: string;
    status: string;
    target_amount: number;
    collected_amount: number;
    deadline?: string;
    initiator_id: string;
  };
  inviter: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

interface TeamPurchaseInvitationsProps {
  userId: string;
  onAccept?: (purchaseId: string) => void;
}

export default function TeamPurchaseInvitations({ 
  userId, 
  onAccept 
}: TeamPurchaseInvitationsProps) {
  const { t } = useTranslate();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadInvitations();
    // Обновляем каждые 30 секунд
    const interval = setInterval(loadInvitations, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const loadInvitations = async () => {
    try {
      const data = await teamPurchaseInvitationService.getMyInvitations(userId);
      setInvitations(data);
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (purchaseId: string, purchaseTitle: string) => {
    // Убрали запрос суммы - просто принимаем приглашение
    setProcessingId(purchaseId);
    try {
      await teamPurchaseInvitationService.acceptInvitation(
        purchaseId,
        userId
        // Убрали параметр contribution
      );
      toast.success(t('Вы присоединились к закупке!'));
      onAccept?.(purchaseId);
      await loadInvitations();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error(t('Ошибка при принятии приглашения'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (purchaseId: string) => {
    if (!confirm(t('Отклонить приглашение?'))) return;

    setProcessingId(purchaseId);
    try {
      await teamPurchaseInvitationService.declineInvitation(purchaseId, userId);
      toast.success(t('Приглашение отклонено'));
      await loadInvitations();
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast.error(t('Ошибка при отклонении приглашения'));
    } finally {
      setProcessingId(null);
    }
  };

  const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} ₸`;
  const formatDate = (date: string | null) => {
    if (!date) return t('Не установлен');
    return new Date(date).toLocaleDateString('ru-RU');
  };

  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min(100, (current / target) * 100);
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-white rounded-xl p-4 mb-6 border border-gray-200">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-gray-100 rounded w-2/3"></div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return null;
  }

  const displayInvitations = showAll ? invitations : invitations.slice(0, 3);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mb-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-[#111] text-lg">
              {t('Приглашения в командные закупки')}
            </h3>
            <p className="text-sm text-gray-600">
              {invitations.length === 1 
                ? t('У вас 1 новое приглашение')
                : t(`У вас ${invitations.length} новых приглашений`)}
            </p>
          </div>
        </div>
        {invitations.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            {showAll ? t('Скрыть') : t(`Показать все (${invitations.length})`)}
            <ChevronRight className={`w-4 h-4 transition-transform ${showAll ? 'rotate-90' : ''}`} />
          </button>
        )}
      </div>

      {/* Список приглашений */}
      <div className="space-y-3">
        {displayInvitations.map((invitation) => (
          <div
            key={invitation.id}
            className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-[#111] text-base">
                    {invitation.team_purchase.title}
                  </h4>
                  {invitation.team_purchase.status === 'forming' && (
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">
                      {t('Сбор участников')}
                    </span>
                  )}
                  {invitation.team_purchase.status === 'active' && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                      {t('Активная')}
                    </span>
                  )}
                </div>
                
                {invitation.team_purchase.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {invitation.team_purchase.description}
                  </p>
                )}

                {/* Прогресс */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">{t('Собрано')}</span>
                    <span className="text-xs font-medium text-gray-700">
                      {formatPrice(invitation.team_purchase.collected_amount)} / {formatPrice(invitation.team_purchase.target_amount)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all"
                      style={{ 
                        width: `${calculateProgress(
                          invitation.team_purchase.collected_amount, 
                          invitation.team_purchase.target_amount
                        )}%` 
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <UserPlus className="w-3 h-3" />
                    {t('Приглашает:')} {invitation.inviter?.first_name || invitation.inviter?.email}
                  </span>
                  {invitation.team_purchase.deadline && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {t('До:')} {formatDate(invitation.team_purchase.deadline)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    {Math.round(calculateProgress(
                      invitation.team_purchase.collected_amount,
                      invitation.team_purchase.target_amount
                    ))}%
                  </span>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleAccept(invitation.team_purchase_id, invitation.team_purchase.title)}
                  disabled={processingId === invitation.team_purchase_id}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  {t('Принять')}
                </button>
                <button
                  onClick={() => handleDecline(invitation.team_purchase_id)}
                  disabled={processingId === invitation.team_purchase_id}
                  className="px-3 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Информационный блок */}
      {displayInvitations.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-800">
              <p className="font-medium mb-1">{t('Как это работает:')}</p>
              <ul className="space-y-0.5 text-blue-700">
                <li>• {t('Примите приглашение для участия в закупке')}</li>
                <li>• {t('Дождитесь активации закупки организатором')}</li>
                <li>• {t('Выбирайте товары и оформляйте заказ')}</li>
                <li>• {t('Вы также можете пригласить своих дилеров')}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}