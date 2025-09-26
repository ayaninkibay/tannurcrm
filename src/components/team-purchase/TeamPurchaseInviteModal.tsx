import React, { useState, useEffect } from 'react';
import {
  X, Users, UserPlus, UserCheck, Search, Check, Loader2, Link2, 
  UserX, Crown, Star, Award, TrendingUp, Sparkles, Gift
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslate } from '@/hooks/useTranslate';
import { teamPurchaseInvitationService, type InvitableUser } from '@/lib/team-purchase/TeamPurchaseInvitationService';

interface TeamPurchaseInviteModalProps {
  purchaseId: string;
  purchaseTitle: string;
  currentUserId: string;
  inviteCode: string;
  onClose: () => void;
  onInvited?: () => void;
}

export default function TeamPurchaseInviteModal({
  purchaseId,
  purchaseTitle,
  currentUserId,
  inviteCode,
  onClose,
  onInvited
}: TeamPurchaseInviteModalProps) {
  const { t } = useTranslate();
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [users, setUsers] = useState<InvitableUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'direct' | 'sub'>('all');
  const [stats, setStats] = useState({
    totalInvitable: 0,
    directDealers: 0,
    subDealers: 0
  });

  useEffect(() => {
    loadUsers();
  }, [purchaseId, currentUserId]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await teamPurchaseInvitationService.getInvitableUsers(
        purchaseId,
        currentUserId
      );
      setUsers(result.users);
      setStats(result.stats);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error(t('Ошибка загрузки списка дилеров'));
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        user.email.toLowerCase().includes(query) ||
        user.first_name?.toLowerCase().includes(query) ||
        user.last_name?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    if (filter === 'direct' && !user.isDirectDealer) return false;
    if (filter === 'sub' && !user.isSubDealer) return false;

    return true;
  });

  const toggleUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const selectAll = () => {
    const newSelected = new Set<string>();
    filteredUsers.forEach(user => {
      if (!user.joined) {
        newSelected.add(user.id);
      }
    });
    setSelectedUsers(newSelected);
  };

  const inviteSelected = async () => {
    if (selectedUsers.size === 0) {
      toast.error(t('Выберите хотя бы одного дилера'));
      return;
    }

    setInviting(true);
    try {
      const result = await teamPurchaseInvitationService.inviteUsers(
        purchaseId,
        Array.from(selectedUsers),
        currentUserId
      );

      if (result.success) {
        toast.success(t(`Успешно приглашено: ${result.invited} дилеров`));
        onInvited?.();
        onClose();
      }
    } catch (error) {
      toast.error(t('Ошибка при отправке приглашений'));
    } finally {
      setInviting(false);
    }
  };

  const inviteAll = async () => {
    if (!confirm(t('Пригласить всех доступных дилеров?'))) return;
    
    setInviting(true);
    try {
      const result = await teamPurchaseInvitationService.inviteAllDealers(
        purchaseId,
        currentUserId,
        true
      );

      if (result.success) {
        toast.success(t(`Приглашено: ${result.invited} дилеров`));
        onInvited?.();
        onClose();
      }
    } catch (error) {
      toast.error(t('Ошибка массового приглашения'));
    } finally {
      setInviting(false);
    }
  };

  const copyInviteLink = async () => {
    const link = `${window.location.origin}/team-purchase/join/${inviteCode}`;
    await navigator.clipboard.writeText(link);
    toast.success(t('Ссылка скопирована'));
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Красивый заголовок */}
        <div className="bg-gradient-to-r from-[#D77E6C] to-[#E89380] p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <UserPlus className="w-6 h-6" />
                {t('Пригласить в команду')}
              </h2>
              <p className="text-white/90">{purchaseTitle}</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-2xl font-bold">{stats.totalInvitable}</span>
              </div>
              <p className="text-sm text-white/80">{t('Доступно')}</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4" />
                <span className="text-2xl font-bold">{stats.directDealers}</span>
              </div>
              <p className="text-sm text-white/80">{t('Прямых')}</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4" />
                <span className="text-2xl font-bold">{stats.subDealers}</span>
              </div>
              <p className="text-sm text-white/80">{t('Поддилеров')}</p>
            </div>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="p-5 border-b border-gray-100 bg-gray-50">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={inviteAll}
              disabled={inviting}
              className="px-4 py-2.5 bg-gradient-to-r from-[#D77E6C] to-[#E89380] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-medium"
            >
              <Sparkles className="w-4 h-4" />
              {t('Пригласить всех')}
            </button>
            <button
              onClick={selectAll}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {t('Выбрать всех')}
            </button>
            <button
              onClick={copyInviteLink}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <Link2 className="w-4 h-4" />
              {t('Скопировать ссылку')}
            </button>
          </div>
        </div>

        {/* Поиск и фильтры */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Поиск по имени или email...')}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D77E6C] transition-colors"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D77E6C]"
            >
              <option value="all">{t('Все дилеры')}</option>
              <option value="direct">{t('Прямые')}</option>
              <option value="sub">{t('Поддилеры')}</option>
            </select>
          </div>
        </div>

        {/* Список пользователей */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#D77E6C]" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UserX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t('Нет доступных дилеров')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map(user => (
                <label
                  key={user.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    user.joined 
                      ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed' 
                      : selectedUsers.has(user.id)
                      ? 'bg-[#D77E6C]/5 border-[#D77E6C]'
                      : 'bg-white border-gray-200 hover:border-[#D77E6C]/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={() => !user.joined && toggleUser(user.id)}
                    disabled={user.joined}
                    className="w-5 h-5 rounded text-[#D77E6C] focus:ring-[#D77E6C]"
                  />
                  
                  <div className="w-10 h-10 bg-gradient-to-br from-[#D77E6C] to-[#E89380] rounded-full flex items-center justify-center text-white font-semibold">
                    {user.first_name?.[0] || user.email[0].toUpperCase()}
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}`
                        : user.email}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {user.isDirectDealer && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        {t('Прямой')}
                      </span>
                    )}
                    {user.isSubDealer && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-lg flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {t(`Уровень ${user.level}`)}
                      </span>
                    )}
                    {user.joined && (
                      <span className="text-green-600 font-medium flex items-center gap-1">
                        <UserCheck className="w-4 h-4" />
                        {t('В команде')}
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Футер */}
        <div className="p-5 border-t border-gray-200 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
          >
            {t('Отмена')}
          </button>
          <button
            onClick={inviteSelected}
            disabled={inviting || selectedUsers.size === 0}
            className="flex-1 py-3 bg-gradient-to-r from-[#D77E6C] to-[#E89380] text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {inviting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('Отправка...')}
              </>
            ) : (
              <>
                <Gift className="w-5 h-5" />
                {t(`Пригласить выбранных (${selectedUsers.size})`)}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}