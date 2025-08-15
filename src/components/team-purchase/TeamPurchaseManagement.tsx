'use client';

import React, { useState } from 'react';
import { 
  Settings, Users, Trash2, X, Edit2, Save, 
  UserMinus, Calendar, Target, FileText,
  AlertCircle, Check, Mail
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { TeamPurchaseView } from '@/types';

interface TeamPurchaseManagementProps {
  purchase: TeamPurchaseView;
  onClose: () => void;
  onUpdate: () => void;
  onRemoveMember: (memberId: string) => Promise<void>;
  onUpdateSettings: (settings: any) => Promise<void>;
  onInviteUser: (email: string) => Promise<void>;
  onCancelPurchase: (reason: string) => Promise<void>;
}

export default function TeamPurchaseManagement({
  purchase,
  onClose,
  onUpdate,
  onRemoveMember,
  onUpdateSettings,
  onInviteUser,
  onCancelPurchase
}: TeamPurchaseManagementProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'members' | 'settings'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  const [editForm, setEditForm] = useState({
    title: purchase.purchase.title,
    description: purchase.purchase.description || '',
    targetAmount: purchase.purchase.target_amount,
    deadline: purchase.purchase.deadline || ''
  });

  const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} ₸`;
  const formatDate = (date: string | null) => {
    if (!date) return 'Не установлен';
    return new Date(date).toLocaleDateString('ru-RU');
  };

  const handleSaveSettings = async () => {
    try {
      await onUpdateSettings(editForm);
      setIsEditing(false);
      toast.success('Настройки сохранены');
      onUpdate();
    } catch (error) {
      toast.error('Ошибка сохранения настроек');
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (confirm(`Удалить участника ${memberName}?`)) {
      try {
        await onRemoveMember(memberId);
        toast.success('Участник удален');
        onUpdate();
      } catch (error) {
        toast.error('Ошибка удаления участника');
      }
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast.error('Введите email');
      return;
    }

    try {
      await onInviteUser(inviteEmail);
      setInviteEmail('');
      toast.success('Приглашение отправлено');
      onUpdate();
    } catch (error) {
      toast.error('Ошибка отправки приглашения');
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Укажите причину отмены');
      return;
    }

    try {
      await onCancelPurchase(cancelReason);
      setShowCancelModal(false);
      toast.success('Закупка отменена');
      onClose();
    } catch (error) {
      toast.error('Ошибка отмены закупки');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Заголовок */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-[#D77E6C]" />
              <h2 className="text-xl font-bold text-[#111]">Управление закупкой</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Табы */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'info' 
                  ? 'bg-[#D77E6C] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Информация
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'members' 
                  ? 'bg-[#D77E6C] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Участники ({purchase.members.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'settings' 
                  ? 'bg-[#D77E6C] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Настройки
            </button>
          </div>
        </div>

        {/* Контент */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Вкладка Информация */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Статус</p>
                  <p className="font-semibold text-[#111]">
                    {purchase.purchase.status === 'forming' && 'Формируется'}
                    {purchase.purchase.status === 'active' && 'Активна'}
                    {purchase.purchase.status === 'completed' && 'Завершена'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Код приглашения</p>
                  <p className="font-mono font-semibold text-[#111]">
                    {purchase.purchase.invite_code}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">План сбора</p>
                  <p className="font-semibold text-[#111]">
                    {formatPrice(purchase.purchase.target_amount)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Собрано</p>
                  <p className="font-semibold text-green-600">
                    {formatPrice(purchase.purchase.collected_amount)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Участников</p>
                  <p className="font-semibold text-[#111]">
                    {purchase.members.filter(m => m.member.status === 'accepted').length}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Дедлайн</p>
                  <p className="font-semibold text-[#111]">
                    {formatDate(purchase.purchase.deadline)}
                  </p>
                </div>
              </div>

              {purchase.purchase.description && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Описание</p>
                  <p className="text-[#111]">{purchase.purchase.description}</p>
                </div>
              )}

              {/* Статистика по участникам */}
              <div>
                <h3 className="font-semibold text-[#111] mb-3">Статистика участников</h3>
                <div className="space-y-2">
                  {purchase.members
                    .filter(m => m.member.cart_total > 0)
                    .sort((a, b) => b.member.cart_total - a.member.cart_total)
                    .map(member => (
                      <div key={member.member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#D77E6C] text-white rounded-full flex items-center justify-center font-medium">
                            {member.user.first_name?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-[#111]">
                              {member.user.first_name} {member.user.last_name}
                            </p>
                            <p className="text-sm text-gray-500">{member.user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#111]">
                            {formatPrice(member.member.cart_total)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {member.member.status === 'purchased' ? 'Оплачено' : 'В корзине'}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Вкладка Участники */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              {/* Приглашение нового участника */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-3">Пригласить участника</h3>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="flex-1 px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleInvite}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Пригласить
                  </button>
                </div>
              </div>

              {/* Список участников */}
              <div className="space-y-2">
                {purchase.members.map(member => (
                  <div key={member.member.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-[#111]">
                          {member.user.first_name} {member.user.last_name}
                          {member.isOrganizer && (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                              Организатор
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">{member.user.email}</p>
                        <p className="text-xs text-gray-400">
                          Статус: {
                            member.member.status === 'invited' ? 'Приглашен' :
                            member.member.status === 'accepted' ? 'Участвует' :
                            member.member.status === 'purchased' ? 'Оплатил' :
                            member.member.status === 'left' ? 'Вышел' :
                            'Удален'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.member.cart_total > 0 && (
                        <span className="text-sm font-medium text-gray-600">
                          {formatPrice(member.member.cart_total)}
                        </span>
                      )}
                      {!member.isOrganizer && member.member.status === 'accepted' && (
                        <button
                          onClick={() => handleRemoveMember(
                            member.member.id,
                            `${member.user.first_name} ${member.user.last_name}`
                          )}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Вкладка Настройки */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Название закупки
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Описание
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      План сбора
                    </label>
                    <input
                      type="number"
                      value={editForm.targetAmount}
                      onChange={(e) => setEditForm({ ...editForm, targetAmount: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Дедлайн
                    </label>
                    <input
                      type="date"
                      value={editForm.deadline}
                      onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C]"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={handleSaveSettings}
                      className="flex-1 py-2 bg-[#D77E6C] text-white rounded-lg hover:bg-[#C56D5C] transition-colors flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Сохранить
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-[#111] mb-2">{purchase.purchase.title}</h3>
                      <p className="text-gray-600">{purchase.purchase.description || 'Без описания'}</p>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">План сбора</p>
                      <p className="font-semibold text-[#111]">
                        {formatPrice(purchase.purchase.target_amount)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Дедлайн</p>
                      <p className="font-semibold text-[#111]">
                        {formatDate(purchase.purchase.deadline)}
                      </p>
                    </div>
                  </div>

                  {/* Опасная зона */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-red-600 mb-3">Опасная зона</h3>
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Отменить закупку
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Модалка отмены закупки */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-[#111] mb-1">
                  Отменить закупку?
                </h3>
                <p className="text-sm text-gray-600">
                  Это действие нельзя отменить. Все участники получат уведомление об отмене.
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Причина отмены *
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Укажите причину отмены закупки"
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleCancel}
                disabled={!cancelReason.trim()}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Отменить закупку
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}