'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, Package, TrendingUp, Clock, Target, Plus, Minus,
  UserPlus, CheckCircle, AlertCircle, Gift, Trophy, ShoppingCart,
  MoreVertical, Calendar, X, Share2, Copy, Crown, Star,
  CreditCard, Truck, Settings, ChevronRight, LogOut, UserX,
  Play, Mail, FileCheck, DollarSign, Bell
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useTranslate } from '@/hooks/useTranslate';
// Компоненты
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import TeamPurchaseProductSelector from '@/components/team-purchase/TeamPurchaseProductSelector';
import TeamPurchaseManagement from '@/components/team-purchase/TeamPurchaseManagement';
import BonusIndicator from '@/components/team-purchase/BonusIndicator';
import TeamPurchaseInviteModal from '@/components/team-purchase/TeamPurchaseInviteModal';
import TeamPurchaseInvitations from '@/components/team-purchase/TeamPurchaseInvitations';

// Контекст и сервисы
import { useUser } from '@/context/UserContext';
import { useTeamPurchaseModule } from '@/lib/team-purchase/TeamPurchaseModule';
import { teamPurchaseLifecycleService } from '@/lib/team-purchase/TeamPurchaseLifecycleService';
import { TEAM_PURCHASE_RULES } from '@/lib/team-purchase/BusinessRules';

// Типы
import type { TeamPurchase, TeamPurchaseView } from '@/types';

export default function TeamPurchasePage() {
  const router = useRouter();
  const { t } = useTranslate();
  const { profile: currentUser, loading: userLoading } = useUser();

  // Состояния
  const [activeTab, setActiveTab] = useState<'forming' | 'active' | 'confirming' | 'completed'>('forming');
  const [selectedPurchase, setSelectedPurchase] = useState<TeamPurchaseView | null>(null);
  const [showManagement, setShowManagement] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  
  // Данные для модалки приглашений
  const [invitePurchaseId, setInvitePurchaseId] = useState('');
  const [invitePurchaseTitle, setInvitePurchaseTitle] = useState('');
  const [invitePurchaseCode, setInvitePurchaseCode] = useState('');

  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    targetAmount: 1000000,
    deadline: ''
  });

  const teamPurchase = useTeamPurchaseModule(currentUser);

  useEffect(() => {
    if (!userLoading && !currentUser) {
      router.push('/signin');
    }
  }, [userLoading, currentUser, router]);

  useEffect(() => {
    if (currentUser) {
      teamPurchase.loadPurchases();
    }
  }, [currentUser]);

  const handleCreatePurchase = async () => {
    if (!createForm.title) {
      toast.error(t('Введите название закупки'));
      return;
    }

    try {
      await teamPurchase.createPurchase(createForm);
      setShowCreateModal(false);
      setCreateForm({ title: '', description: '', targetAmount: 1000000, deadline: '' });
      toast.success(t('Закупка создана! Пригласите участников'));
    } catch (error) {
      toast.error(t('Ошибка создания закупки'));
    }
  };

  const handleOpenPurchase = async (purchaseId: string, openSelector = false) => {
    await teamPurchase.loadPurchaseDetails(purchaseId);
    if (teamPurchase.currentPurchase) {
      setSelectedPurchase(teamPurchase.currentPurchase);
      await teamPurchase.loadMemberCart(purchaseId);
      if (openSelector) setShowProductSelector(true);
    }
  };

  const handleCopyInviteLink = async (purchaseId: string) => {
    const link = await teamPurchase.getInviteLink(purchaseId);
    setInviteLink(link);
    await navigator.clipboard.writeText(link);
    toast.success(t('Ссылка скопирована'));
  };

  const handleOpenInviteModal = (purchase: TeamPurchase) => {
    setInvitePurchaseId(purchase.id);
    setInvitePurchaseTitle(purchase.title);
    setInvitePurchaseCode(purchase.invite_code);
    setShowInviteModal(true);
  };

  // Фильтрация закупок
  const filteredPurchases = teamPurchase.purchases.filter(p => {
    if (activeTab === 'forming') return p.status === 'forming';
    if (activeTab === 'active') return p.status === 'active';
    if (activeTab === 'confirming') return p.status === 'confirming';
    if (activeTab === 'completed') return p.status === 'completed' || p.status === 'cancelled';
    return false;
  });

  const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} ₸`;
  const formatDate = (date: string | null) => {
    if (!date) return t('Не установлен');
    return new Date(date).toLocaleDateString('ru-RU');
  };

  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min(100, (current / target) * 100);
  };

  // Статистика
  const stats = {
    forming: teamPurchase.purchases.filter(p => p.status === 'forming').length,
    active: teamPurchase.purchases.filter(p => p.status === 'active').length,
    confirming: teamPurchase.purchases.filter(p => p.status === 'confirming').length,
    completed: teamPurchase.purchases.filter(p => p.status === 'completed').length
  };

  if (userLoading || teamPurchase.loading) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D77E6C] border-t-transparent"></div>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#F6F6F6] p-5">
      <MoreHeaderDE title={t('Командные закупки')} showBackButton={true} />

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        
        {/* Блок приглашений для дилеров */}
        {currentUser?.role === 'dealer' && (
          <TeamPurchaseInvitations 
            userId={currentUser.id} 
            onAccept={() => teamPurchase.loadPurchases()}
          />
        )}

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Users className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold text-[#111]">{stats.forming}</span>
            </div>
            <div className="text-sm text-gray-500">{t('На сборе')}</div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-[#111]">{stats.active}</span>
            </div>
            <div className="text-sm text-gray-500">{t('Активных')}</div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-[#111]">{stats.confirming}</span>
            </div>
            <div className="text-sm text-gray-500">{t('На проверке')}</div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-2xl font-bold text-[#111]">{stats.completed}</span>
            </div>
            <div className="text-sm text-gray-500">{t('Завершено')}</div>
          </div>
        </div>

        {/* Вкладки */}
        <div className="bg-white rounded-xl border border-gray-200 p-1 mb-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('forming')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'forming'
                  ? 'bg-[#D77E6C] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t('Сбор')} {stats.forming > 0 && `(${stats.forming})`}
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'active'
                  ? 'bg-[#D77E6C] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t('Активные')} {stats.active > 0 && `(${stats.active})`}
            </button>
            <button
              onClick={() => setActiveTab('confirming')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'confirming'
                  ? 'bg-[#D77E6C] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t('На проверке')} {stats.confirming > 0 && `(${stats.confirming})`}
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'completed'
                  ? 'bg-[#D77E6C] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t('Завершенные')} {stats.completed > 0 && `(${stats.completed})`}
            </button>
          </div>
        </div>

        {/* Список закупок */}
        <div className="space-y-4">
          {filteredPurchases.map(purchase => {
            const isOrganizer = purchase.initiator_id === currentUser?.id;
            const isFinanceOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'finance';
            
            return (
              <div key={purchase.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-[#111] mb-2">{purchase.title}</h3>
                      <div className="flex items-center gap-4">
                        {isOrganizer && (
                          <span className="flex items-center gap-1 text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                            <Crown className="w-3 h-3" />
                            {t('Организатор')}
                          </span>
                        )}
                        <span className={`text-sm font-medium ${
                          purchase.status === 'active' ? 'text-green-600' :
                          purchase.status === 'forming' ? 'text-yellow-600' :
                          purchase.status === 'confirming' ? 'text-blue-600' :
                          purchase.status === 'completed' ? 'text-gray-600' :
                          'text-red-600'
                        }`}>
                          {purchase.status === 'forming' && t('⏳ Сбор участников')}
                          {purchase.status === 'active' && t('✅ Активна - идут покупки')}
                          {purchase.status === 'confirming' && t('🔍 На проверке')}
                          {purchase.status === 'completed' && t('🏁 Завершена')}
                          {purchase.status === 'cancelled' && t('❌ Отменена')}
                        </span>
                      </div>
                    </div>

                    {/* Действия для разных статусов */}
                    <div className="flex gap-2">
                      {/* FORMING - управление, приглашение и старт */}
                      {purchase.status === 'forming' && isOrganizer && (
                        <>
                          <button
                            onClick={async () => {
                              await teamPurchase.loadPurchaseDetails(purchase.id);
                              if (teamPurchase.currentPurchase) {
                                setSelectedPurchase(teamPurchase.currentPurchase);
                                setShowManagement(true);
                              }
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title={t('Управление')}
                          >
                            <Settings className="w-5 h-5 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleOpenInviteModal(purchase)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            title={t('Пригласить дилеров')}
                          >
                            <UserPlus className="w-4 h-4" />
                            {t('Пригласить')}
                          </button>
                          <button
                            onClick={async () => {
                              const result = await teamPurchaseLifecycleService.startActivePurchase(purchase.id);
                              if (result.success) {
                                toast.success(result.message);
                                await teamPurchase.loadPurchases();
                              } else {
                                toast.error(result.message);
                              }
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                          >
                            <Play className="w-4 h-4" />
                            {t('Начать')}
                          </button>
                        </>
                      )}

                      {/* ACTIVE - управление, приглашение и переход к проверке */}
                      {purchase.status === 'active' && (
                        <>
                          {isOrganizer && (
                            <>
                              <button
                                onClick={async () => {
                                  await teamPurchase.loadPurchaseDetails(purchase.id);
                                  if (teamPurchase.currentPurchase) {
                                    setSelectedPurchase(teamPurchase.currentPurchase);
                                    setShowManagement(true);
                                  }
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                                title={t('Управление')}
                              >
                                <Settings className="w-5 h-5 text-gray-600" />
                              </button>
                              <button
                                onClick={() => handleOpenInviteModal(purchase)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                                title={t('Пригласить еще дилеров')}
                              >
                                <UserPlus className="w-4 h-4 text-gray-600" />
                              </button>
                              <button
                                onClick={async () => {
                                  const result = await teamPurchaseLifecycleService.moveToConfirming(purchase.id);
                                  if (result.success) {
                                    toast.success(result.message);
                                    if (result.stats) {
                                      toast(`Оплатили: ${result.stats.paidMembers}/${result.stats.totalMembers}. Сумма: ${result.stats.totalAmount.toLocaleString('ru-RU')} ₸`, {
                                        icon: '📊',
                                        duration: 5000
                                      });
                                    }
                                    await teamPurchase.loadPurchases();
                                  } else {
                                    toast.error(result.message);
                                  }
                                }}
                                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2"
                                title={t('Все сделали заказы? Передать на проверку')}
                              >
                                <FileCheck className="w-4 h-4" />
                                {t('На проверку')}
                              </button>
                            </>
                          )}
                        </>
                      )}

                      {/* CONFIRMING - только финансист может завершить */}
                      {purchase.status === 'confirming' && (
                        <>
                          {(isOrganizer || isFinanceOrAdmin) && (
                            <button
                              onClick={async () => {
                                if (confirm(t('Подтвердить завершение закупки?'))) {
                                  const result = await teamPurchaseLifecycleService.completeAfterVerification(
                                    purchase.id,
                                    currentUser?.id || ''
                                  );
                                  if (result.success) {
                                    toast.success(result.message);
                                    await teamPurchase.loadPurchases();
                                  } else {
                                    toast.error(result.message);
                                  }
                                }
                              }}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                            >
                              <Trophy className="w-4 h-4" />
                              {t('Завершить проверку')}
                            </button>
                          )}
                        </>
                      )}

                      {/* Копирование ссылки доступно всегда для forming и active */}
                      {['forming', 'active'].includes(purchase.status) && (
                        <button
                          onClick={() => handleCopyInviteLink(purchase.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title={t('Скопировать ссылку')}
                        >
                          <Share2 className="w-5 h-5 text-gray-600" />
                        </button>
                      )}
                    </div>
                  </div>

                {/* Прогресс плана */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">{t('Собрано')}</span>
                    <span className="text-sm font-medium">
                      {formatPrice(purchase.collected_amount || 0)} / {formatPrice(purchase.target_amount)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#D77E6C] to-[#E89380] transition-all"
                      style={{ width: `${calculateProgress(purchase.collected_amount || 0, purchase.target_amount)}%` }}
                    />
                  </div>
                </div>

                  {/* Дедлайн если есть */}
                  {purchase.deadline && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>{t('Дедлайн:')} {formatDate(purchase.deadline)}</span>
                    </div>
                  )}

                  {/* Кнопки действий внизу карточки */}
                  <div className="flex gap-3 mt-4">
                    {/* В активной фазе - можно покупать */}
                    {purchase.status === 'active' && (
                      <button
                        onClick={() => handleOpenPurchase(purchase.id, true)}
                        className="flex-1 py-3 bg-[#D77E6C] text-white rounded-xl font-medium hover:bg-[#C56D5C] flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        {t('Выбрать товары')}
                      </button>
                    )}
                    
                    {/* В фазе формирования - можно присоединиться */}
                    {purchase.status === 'forming' && !isOrganizer && (
                      <button
                        onClick={async () => {
                          const contribution = prompt(t('Планируемая сумма покупки (₸):'), '50000');
                          if (contribution) {
                            await teamPurchase.joinPurchase(
                              purchase.invite_code, 
                              Number(contribution)
                            );
                          }
                        }}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        <UserPlus className="w-5 h-5" />
                        {t('Присоединиться')}
                      </button>
                    )}

                    {/* На проверке - только информация */}
                    {purchase.status === 'confirming' && (
                      <div className="flex-1 py-3 bg-blue-100 text-blue-700 rounded-xl font-medium flex items-center justify-center gap-2">
                        <Clock className="w-5 h-5" />
                        {t('Ожидает проверки финансистом')}
                      </div>
                    )}

                    {/* Завершена - можно посмотреть отчет */}
                    {purchase.status === 'completed' && (
                      <button
                        onClick={() => handleOpenPurchase(purchase.id)}
                        className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                      >
                        {t('Посмотреть отчет')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredPurchases.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#111] mb-2">
                {activeTab === 'forming' && t('Нет закупок на сборе')}
                {activeTab === 'active' && t('Нет активных закупок')}
                {activeTab === 'confirming' && t('Нет закупок на проверке')}
                {activeTab === 'completed' && t('Нет завершенных закупок')}
              </h3>
              <p className="text-gray-500">
                {t('Создайте новую закупку или дождитесь приглашения')}
              </p>
            </div>
          )}
        </div>

        {/* Кнопка создания */}
        <div className="mt-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full py-4 bg-gradient-to-r from-[#D77E6C] to-[#E89380] text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t('Создать новую командную закупку')}
          </button>
        </div>
      </div>

      {/* Модалка создания */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#111]">{t('Создать командную закупку')}</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Название закупки *')}
                </label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder={t('Например: Закупка печей Tannur - Январь 2025')}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Описание')}
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder={t('Опишите цель закупки')}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('План сбора')}
                  </label>
                  <input
                    type="number"
                    value={createForm.targetAmount}
                    onChange={(e) => setCreateForm({ ...createForm, targetAmount: Number(e.target.value) })}
                    min={100000}
                    step={100000}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C]"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('Это просто план, не ограничение')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('Дедлайн (опционально)')}
                  </label>
                  <input
                    type="date"
                    value={createForm.deadline}
                    onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C]"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">{t('Новый процесс закупок:')}</p>
                    <ul className="space-y-1 text-xs">
                      <li>{t('1️⃣ Создание - приглашайте участников')}</li>
                      <li>{t('2️⃣ Начать - активация без проверок')}</li>
                      <li>{t('3️⃣ Активная фаза - все покупают')}</li>
                      <li>{t('4️⃣ На проверку - когда все готовы')}</li>
                      <li>{t('5️⃣ Завершение - финансист проверяет')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
              >
                {t('Отмена')}
              </button>
              <button
                onClick={handleCreatePurchase}
                disabled={!createForm.title}
                className="flex-1 py-3 bg-[#D77E6C] text-white rounded-xl font-medium hover:bg-[#C56D5C] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('Создать закупку')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка выбора товаров */}
      {showProductSelector && teamPurchase.currentPurchase && (
        <TeamPurchaseProductSelector
          purchaseId={teamPurchase.currentPurchase.purchase.id}
          userId={currentUser?.id || ''}
          onClose={() => setShowProductSelector(false)}
          onCheckout={async () => {
            try {
              await teamPurchase.checkoutCart();
              setShowProductSelector(false);
              toast.success(t('Заказ оформлен! Переход к оплате...'));
            } catch (error) {
              console.error('Error during checkout:', error);
              toast.error(t('Ошибка оформления заказа'));
            }
          }}
        />
      )}

      {/* Модалка управления */}
      {showManagement && selectedPurchase && (
        <TeamPurchaseManagement
          purchase={selectedPurchase}
          onClose={() => {
            setShowManagement(false);
            setSelectedPurchase(null);
          }}
          onUpdate={() => teamPurchase.loadPurchases()}
          onRemoveMember={async (memberId) => {
            const result = await teamPurchaseLifecycleService.removeMember(
              selectedPurchase.purchase.id,
              memberId,
              currentUser?.id || ''
            );
            if (!result.success) {
              throw new Error(result.message);
            }
          }}
          onUpdateSettings={async (settings) => {
            const result = await teamPurchaseLifecycleService.updatePurchaseSettings(
              selectedPurchase.purchase.id,
              currentUser?.id || '',
              settings
            );
            if (!result.success) {
              throw new Error(result.message);
            }
          }}
          onInviteUser={async (email) => {
            const result = await teamPurchaseLifecycleService.inviteUser(
              selectedPurchase.purchase.id,
              email,
              currentUser?.id || ''
            );
            if (!result.success) {
              throw new Error(result.message);
            }
          }}
          onCancelPurchase={async (reason) => {
            const result = await teamPurchaseLifecycleService.cancelPurchase(
              selectedPurchase.purchase.id,
              currentUser?.id || '',
              reason
            );
            if (!result.success) {
              throw new Error(result.message);
            }
          }}
        />
      )}

      {/* Модалка массового приглашения */}
      {showInviteModal && invitePurchaseId && (
        <TeamPurchaseInviteModal
          purchaseId={invitePurchaseId}
          purchaseTitle={invitePurchaseTitle}
          currentUserId={currentUser?.id || ''}
          inviteCode={invitePurchaseCode}
          onClose={() => {
            setShowInviteModal(false);
            setInvitePurchaseId('');
            setInvitePurchaseTitle('');
            setInvitePurchaseCode('');
          }}
          onInvited={() => {
            teamPurchase.loadPurchases();
          }}
        />
      )}
    </div>
  );
}