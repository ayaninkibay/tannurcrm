// components/team-purchase/TeamPurchaseInviteModal.tsx

import React, { useState, useEffect } from 'react';
import {
  X, Users, UserPlus, UserCheck, ChevronDown, ChevronRight,
  Search, Check, AlertCircle, Loader2, Crown, Link2,
  Mail, Send, UserX, Filter
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
  const [filter, setFilter] = useState<'all' | 'direct' | 'sub' | 'not_invited'>('all');
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [stats, setStats] = useState({
    totalInvitable: 0,
    directDealers: 0,
    subDealers: 0,
    alreadyInvited: 0,
    alreadyJoined: 0
  });

  // Загрузка списка пользователей
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

  // Фильтрация пользователей
  const filteredUsers = users.filter(user => {
    // Поиск
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        user.email.toLowerCase().includes(query) ||
        user.first_name?.toLowerCase().includes(query) ||
        user.last_name?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Фильтр по типу
    if (filter === 'direct' && !user.isDirectDealer) return false;
    if (filter === 'sub' && !user.isSubDealer) return false;
    if (filter === 'not_invited' && (user.invited || user.joined)) return false;

    // Показ только выбранных
    if (showOnlySelected && !selectedUsers.has(user.id)) return false;

    return true;
  });

  // Обработчики выбора
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

  const clearSelection = () => {
    setSelectedUsers(new Set());
  };

  const selectAllDirect = () => {
    const newSelected = new Set(selectedUsers);
    users
      .filter(u => u.isDirectDealer && !u.joined)
      .forEach(u => newSelected.add(u.id));
    setSelectedUsers(newSelected);
  };

  const selectAllSub = () => {
    const newSelected = new Set(selectedUsers);
    users
      .filter(u => u.isSubDealer && !u.joined)
      .forEach(u => newSelected.add(u.id));
    setSelectedUsers(newSelected);
  };

  // Приглашение выбранных
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
        toast.success(t(`Приглашено: ${result.invited} дилеров`));
        onInvited?.();
        await loadUsers();
        clearSelection();
      } else {
        toast.error(t(`Приглашено: ${result.invited}, ошибок: ${result.failed}`));
        if (result.errors.length > 0) {
          console.error('Invitation errors:', result.errors);
        }
      }
    } catch (error) {
      console.error('Error inviting users:', error);
      toast.error(t('Ошибка при отправке приглашений'));
    } finally {
      setInviting(false);
    }
  };

  // Пригласить всех
  const inviteAll = async (includeSubDealers: boolean = true) => {
    if (!confirm(t(includeSubDealers 
      ? 'Пригласить ВСЕХ дилеров и поддилеров?' 
      : 'Пригласить всех ПРЯМЫХ дилеров?'))) {
      return;
    }

    setInviting(true);
    try {
      const result = await teamPurchaseInvitationService.inviteAllDealers(
        purchaseId,
        currentUserId,
        includeSubDealers
      );

      if (result.success) {
        toast.success(t(`Успешно приглашено: ${result.invited} дилеров`));
        onInvited?.();
        await loadUsers();
      } else {
        toast.error(t(`Приглашено: ${result.invited}, ошибок: ${result.failed}`));
      }
    } catch (error) {
      console.error('Error inviting all:', error);
      toast.error(t('Ошибка массового приглашения'));
    } finally {
      setInviting(false);
    }
  };

  // Копирование ссылки
  const copyInviteLink = async () => {
    const link = `${window.location.origin}/team-purchase/join/${inviteCode}`;
    await navigator.clipboard.writeText(link);
    toast.success(t('Ссылка скопирована'));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Заголовок */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#111] mb-2">
                {t('Пригласить дилеров в закупку')}
              </h2>
              <p className="text-gray-600">{purchaseTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">{stats.totalInvitable}</div>
              <div className="text-xs text-blue-700">{t('Можно пригласить')}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">{stats.directDealers}</div>
              <div className="text-xs text-green-700">{t('Прямых дилеров')}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-600">{stats.subDealers}</div>
              <div className="text-xs text-purple-700">{t('Поддилеров')}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-600">{stats.alreadyInvited}</div>
              <div className="text-xs text-yellow-700">{t('Уже приглашены')}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-600">{stats.alreadyJoined}</div>
              <div className="text-xs text-gray-700">{t('Присоединились')}</div>
            </div>
          </div>
        </div>

        {/* Панель действий */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          {/* Быстрые действия */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => inviteAll(true)}
              disabled={inviting || stats.totalInvitable === 0}
              className="px-4 py-2 bg-[#D77E6C] text-white rounded-lg hover:bg-[#C56D5C] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              {t('Пригласить ВСЕХ')}
            </button>
            <button
              onClick={() => inviteAll(false)}
              disabled={inviting || stats.directDealers === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {t('Только прямых')}
            </button>
            <button
              onClick={copyInviteLink}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Link2 className="w-4 h-4" />
              {t('Скопировать ссылку')}
            </button>
          </div>

          {/* Поиск и фильтры */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Поиск по имени или email...')}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C]"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C]"
            >
              <option value="all">{t('Все дилеры')}</option>
              <option value="direct">{t('Прямые дилеры')}</option>
              <option value="sub">{t('Поддилеры')}</option>
              <option value="not_invited">{t('Не приглашенные')}</option>
            </select>
          </div>

          {/* Управление выбором */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="text-sm text-blue-600 hover:underline"
              >
                {t('Выбрать всех')}
              </button>
              <span className="text-gray-400">|</span>
              <button
                onClick={selectAllDirect}
                className="text-sm text-green-600 hover:underline"
              >
                {t('Прямых')}
              </button>
              <span className="text-gray-400">|</span>
              <button
                onClick={selectAllSub}
                className="text-sm text-purple-600 hover:underline"
              >
                {t('Поддилеров')}
              </button>
              <span className="text-gray-400">|</span>
              <button
                onClick={clearSelection}
                className="text-sm text-gray-600 hover:underline"
              >
                {t('Очистить')}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showSelected"
                checked={showOnlySelected}
                onChange={(e) => setShowOnlySelected(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="showSelected" className="text-sm text-gray-600">
                {t('Только выбранные')} ({selectedUsers.size})
              </label>
            </div>
          </div>
        </div>

        {/* Список пользователей */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#D77E6C]" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UserX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t('Нет доступных дилеров для приглашения')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    user.joined 
                      ? 'bg-gray-50 border-gray-200 opacity-60' 
                      : selectedUsers.has(user.id)
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  } ${!user.joined && 'cursor-pointer'}`}
                  onClick={() => !user.joined && toggleUser(user.id)}
                >
                  {/* Checkbox */}
                  <div className="flex-shrink-0">
                    {user.joined ? (
                      <UserCheck className="w-5 h-5 text-green-600" />
                    ) : (
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => toggleUser(user.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-[#D77E6C] rounded focus:ring-[#D77E6C]"
                      />
                    )}
                  </div>

                  {/* Информация о пользователе */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#111]">
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}`
                          : user.email}
                      </span>
                      {user.isDirectDealer && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                          {t('Прямой')}
                        </span>
                      )}
                      {user.isSubDealer && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                          {t(`Уровень ${user.level}`)}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>

                  {/* Статус */}
                  <div className="flex-shrink-0">
                    {user.joined ? (
                      <span className="text-sm text-green-600 font-medium">
                        {t('В закупке')}
                      </span>
                    ) : user.invited ? (
                      <span className="text-sm text-yellow-600">
                        {t('Приглашен')}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Футер с кнопками */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
            >
              {t('Закрыть')}
            </button>
            <button
              onClick={inviteSelected}
              disabled={inviting || selectedUsers.size === 0}
              className="px-6 py-3 bg-[#D77E6C] text-white rounded-xl font-medium hover:bg-[#C56D5C] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {inviting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('Отправка...')}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {t(`Пригласить выбранных (${selectedUsers.size})`)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}