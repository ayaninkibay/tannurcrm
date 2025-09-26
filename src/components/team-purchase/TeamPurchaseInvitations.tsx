import React, { useState, useEffect } from 'react';
import {
  Bell, UserPlus, Check, X, Clock, Calendar, 
  TrendingUp, Gift, Sparkles, ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslate } from '@/hooks/useTranslate';
import { teamPurchaseInvitationService } from '@/lib/team-purchase/TeamPurchaseInvitationService';

export default function TeamPurchaseInvitations({ userId, onAccept }: TeamPurchaseInvitationsProps) {
  const { t } = useTranslate();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadInvitations();
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

  const handleAccept = async (purchaseId: string) => {
    setProcessingId(purchaseId);
    try {
      await teamPurchaseInvitationService.acceptInvitation(purchaseId, userId);
      toast.success(t('Вы успешно присоединились!'));
      onAccept?.(purchaseId);
      await loadInvitations();
    } catch (error) {
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
      toast.error(t('Ошибка при отклонении'));
    } finally {
      setProcessingId(null);
    }
  };

  if (loading || invitations.length === 0) return null;

  const displayInvitations = showAll ? invitations : invitations.slice(0, 2);
  const formatPrice = (price: number) => price.toLocaleString('ru-RU', { useGrouping: true }).replace(/,/g, ' ');

  return (
    <div className="bg-gradient-to-br from-[#D77E6C]/10 via-[#E89380]/10 to-white rounded-2xl border border-[#D77E6C]/20 p-6 mb-6 relative overflow-hidden">
      {/* Декоративные элементы */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#D77E6C]/20 to-transparent rounded-full -translate-y-20 translate-x-20"></div>
      
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-5 relative">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-[#D77E6C] to-[#E89380] rounded-xl text-white">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              {t('Новые приглашения')}
              <span className="px-2.5 py-1 bg-[#D77E6C] text-white text-xs font-bold rounded-full">
                {invitations.length}
              </span>
            </h3>
            <p className="text-sm text-gray-600 mt-0.5">
              {t('Присоединяйтесь к командным закупкам')}
            </p>
          </div>
        </div>
        
        {invitations.length > 2 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-[#D77E6C] font-medium hover:underline flex items-center gap-1"
          >
            {showAll ? t('Скрыть') : t('Показать все')}
            <ArrowRight className={`w-4 h-4 transition-transform ${showAll ? 'rotate-90' : ''}`} />
          </button>
        )}
      </div>

      {/* Список приглашений */}
      <div className="space-y-3">
        {displayInvitations.map((invitation) => (
          <div
            key={invitation.id}
            className="bg-white rounded-xl p-5 border border-gray-100 hover:border-[#D77E6C]/30 transition-all hover:shadow-lg group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-base mb-2 group-hover:text-[#D77E6C] transition-colors">
                  {invitation.team_purchase.title}
                </h4>
                
                {invitation.team_purchase.description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {invitation.team_purchase.description}
                  </p>
                )}

                {/* Прогресс */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">{t('Прогресс сбора')}</span>
                    <span className="font-medium text-[#D77E6C]">
                      {formatPrice(invitation.team_purchase.collected_amount)} / {formatPrice(invitation.team_purchase.target_amount)} ₸
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#D77E6C] to-[#E89380] rounded-full transition-all"
                      style={{ 
                        width: `${Math.min(100, (invitation.team_purchase.collected_amount / invitation.team_purchase.target_amount) * 100)}%` 
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <UserPlus className="w-4 h-4 text-[#D77E6C]" />
                    {invitation.inviter?.first_name || invitation.inviter?.email}
                  </span>
                  {invitation.team_purchase.deadline && (
                    <span className="flex items-center gap-1.5 text-gray-600">
                      <Calendar className="w-4 h-4 text-[#D77E6C]" />
                      {new Date(invitation.team_purchase.deadline).toLocaleDateString('ru-RU')}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-green-600 font-medium">
                    <Sparkles className="w-4 h-4" />
                    {t('Бонусы до 25%')}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 ml-5">
                <button
                  onClick={() => handleAccept(invitation.team_purchase_id)}
                  disabled={processingId === invitation.team_purchase_id}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#D77E6C] to-[#E89380] text-white text-sm font-medium rounded-xl hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {t('Принять')}
                </button>
                <button
                  onClick={() => handleDecline(invitation.team_purchase_id)}
                  disabled={processingId === invitation.team_purchase_id}
                  className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  {t('Отклонить')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Информация о бонусах */}
      <div className="mt-5 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
        <div className="flex items-start gap-3">
          <Gift className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="font-medium text-green-900 mb-1">
              {t('Выгода от участия:')}
            </p>
            <ul className="text-sm text-green-700 space-y-1">
              <li className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {t('Бонусы до 25% от суммы покупки')}
              </li>
              <li className="flex items-center gap-1">
                <Gift className="w-3 h-3" />
                {t('Специальные цены для команды')}
              </li>
              <li className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {t('Приглашайте своих дилеров и получайте больше')}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}