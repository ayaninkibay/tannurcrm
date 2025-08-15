'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Package, TrendingUp, Clock, Target, Plus, Minus,
  UserPlus, CheckCircle, AlertCircle, Gift, Trophy, ShoppingCart,
  MoreVertical, Calendar, X, Share2, Copy, Crown, Star,
  CreditCard, Truck, Settings, ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Компоненты
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import TeamPurchaseFlow from '@/components/team-purchase/TeamPurchaseFlow';
import TeamPurchaseProductSelector from '@/components/team-purchase/TeamPurchaseProductSelector';
import BonusDisplay from '@/components/team-purchase/BonusDisplay';

// Контекст пользователя
import { useUser } from '@/context/UserContext';

// Модули и сервисы
import { useTeamPurchaseModule } from '@/lib/team-purchase/TeamPurchaseModule';
import { teamPurchaseCartService } from '@/lib/team-purchase/TeamPurchaseCartService';
import { productService } from '@/lib/product/ProductService';

// Типы
import type { TeamPurchase, TeamPurchaseView, Product } from '@/types';

export default function TeamPurchasePage() {
  const router = useRouter();
  
  // Используем контекст пользователя вместо локального состояния
  const { profile: currentUser, loading: userLoading } = useUser();
  
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'completed'>('active');
  const [selectedPurchase, setSelectedPurchase] = useState<TeamPurchaseView | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showBonusDisplay, setShowBonusDisplay] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  
  // Форма создания закупки
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    targetAmount: 500000,
    minContribution: 10000,
    deadline: '',
    maxMembers: 50
  });

  // Используем модуль командных закупок
  const teamPurchase = useTeamPurchaseModule(currentUser);

  // Проверка авторизации
  useEffect(() => {
    if (!userLoading && !currentUser) {
      router.push('/signin');
    }
  }, [userLoading, currentUser, router]);

  // Загрузка закупок при изменении пользователя
  useEffect(() => {
    if (currentUser) {
      teamPurchase.loadPurchases();
    }
  }, [currentUser]);

  // Создание закупки
  const handleCreatePurchase = async () => {
    if (!createForm.title || !createForm.deadline) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    await teamPurchase.createPurchase(createForm);
    setShowCreateModal(false);
    setCreateForm({
      title: '',
      description: '',
      targetAmount: 500000,
      minContribution: 10000,
      deadline: '',
      maxMembers: 50
    });
  };

  // Открытие деталей закупки
  const handleOpenPurchase = async (purchaseId: string) => {
    await teamPurchase.loadPurchaseDetails(purchaseId);
    if (teamPurchase.currentPurchase) {
      setSelectedPurchase(teamPurchase.currentPurchase);
      
      // Загружаем корзину если статус active
      if (teamPurchase.currentPurchase.purchase.status === 'active') {
        await teamPurchase.loadMemberCart(purchaseId);
      }
    }
  };

  // Копирование ссылки приглашения
  const handleCopyInviteLink = async (purchaseId: string) => {
    const link = await teamPurchase.getInviteLink(purchaseId);
    setInviteLink(link);
    await navigator.clipboard.writeText(link);
    toast.success('Ссылка скопирована');
  };

  // Фильтрация закупок по статусу
  const filteredPurchases = teamPurchase.purchases.filter(p => {
    if (activeTab === 'active') return ['forming', 'active', 'purchasing'].includes(p.status);
    if (activeTab === 'pending') return p.status === 'confirming';
    if (activeTab === 'completed') return p.status === 'completed';
    return true;
  });

  // Форматирование
  const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} ₸`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString('ru-RU');

  // Расчет статистики
  const stats = {
    active: teamPurchase.purchases.filter(p => ['forming', 'active', 'purchasing'].includes(p.status)).length,
    completed: teamPurchase.purchases.filter(p => p.status === 'completed').length,
    totalSaved: teamPurchase.purchases.reduce((sum, p) => sum + (p.collected_amount * 0.25), 0),
    averageDiscount: 25
  };

  // Показываем загрузку пока загружается пользователь или закупки
  if (userLoading || teamPurchase.loading) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D77E6C] border-t-transparent"></div>
      </div>
    );
  }

  // Если пользователь не авторизован (на всякий случай)
  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <MoreHeaderDE title="Командные покупки" showBackButton={true} />
      
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-[#D77E6C]/10 rounded-lg">
                <Users className="w-5 h-5 text-[#D77E6C]" />
              </div>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-[#111]">{stats.active}</div>
            <div className="text-sm text-gray-500">активных закупок</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.averageDiscount}%</div>
            <div className="text-sm text-gray-500">средняя скидка</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Trophy className="w-5 h-5 text-blue-600" />
              </div>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-[#111]">{stats.completed}</div>
            <div className="text-sm text-gray-500">успешных закупок</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Gift className="w-5 h-5 text-yellow-600" />
              </div>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-[#111]">{formatPrice(stats.totalSaved)}</div>
            <div className="text-sm text-gray-500">сэкономлено всего</div>
          </div>
        </div>

        {/* Табы */}
        <div className="bg-white rounded-xl border border-gray-200 p-1 mb-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'active'
                  ? 'bg-[#D77E6C] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Активные
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'pending'
                  ? 'bg-[#D77E6C] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              На подтверждении
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'completed'
                  ? 'bg-[#D77E6C] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Завершенные
            </button>
          </div>
        </div>

        {/* Список командных закупок */}
        <div className="space-y-6">
          {filteredPurchases.map(purchase => (
            <div key={purchase.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[#111] mb-2">
                      {purchase.title}
                    </h3>
                    <p className="text-gray-500">
                      Заказ #{purchase.id.slice(0, 8)}
                    </p>
                  </div>
                  
                  {/* Статус */}
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    purchase.status === 'forming' ? 'bg-yellow-100 text-yellow-700' :
                    purchase.status === 'active' ? 'bg-green-100 text-green-700' :
                    purchase.status === 'purchasing' ? 'bg-blue-100 text-blue-700' :
                    purchase.status === 'confirming' ? 'bg-orange-100 text-orange-700' :
                    purchase.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {purchase.status === 'forming' && 'Формируется'}
                    {purchase.status === 'active' && 'Активна'}
                    {purchase.status === 'purchasing' && 'Идет оплата'}
                    {purchase.status === 'confirming' && 'Подтверждение'}
                    {purchase.status === 'completed' && 'Завершена'}
                    {purchase.status === 'cancelled' && 'Отменена'}
                  </div>
                </div>

                {/* Прогресс */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Прогресс сбора</span>
                    <span className="text-sm font-medium text-[#111]">
                      {formatPrice(purchase.collected_amount)} / {formatPrice(purchase.target_amount)}
                    </span>
                  </div>
                  <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#D77E6C] to-[#E89380] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (purchase.collected_amount / purchase.target_amount) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Информация */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-6">
                    {purchase.deadline && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          До {formatDate(purchase.deadline)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Мин. вклад: {formatPrice(purchase.min_contribution)}
                      </span>
                    </div>
                  </div>

                  {/* Действия */}
                  <div className="flex gap-3">
                    {purchase.status === 'forming' && (
                      <>
                        {purchase.initiator_id === currentUser?.id ? (
                          <>
                            <button
                              onClick={() => teamPurchase.startPurchase(purchase.id)}
                              disabled={purchase.collected_amount < 300000}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Начать закупку
                            </button>
                            <button
                              onClick={() => handleCopyInviteLink(purchase.id)}
                              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => teamPurchase.leavePurchase(purchase.id)}
                            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Выйти
                          </button>
                        )}
                      </>
                    )}

                    {purchase.status === 'active' && (
                      <button
                        onClick={() => {
                          handleOpenPurchase(purchase.id);
                          setShowProductSelector(true);
                        }}
                        className="px-4 py-2 bg-[#D77E6C] text-white rounded-lg hover:bg-[#C56D5C] transition-colors flex items-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Выбрать товары
                      </button>
                    )}

                    {purchase.status === 'purchasing' && (
                      <button
                        onClick={() => handleOpenPurchase(purchase.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        Оплатить
                      </button>
                    )}

                    {purchase.status === 'completed' && (
                      <button
                        onClick={() => setShowBonusDisplay(true)}
                        className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <Trophy className="w-4 h-4" />
                        Мои бонусы
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenPurchase(purchase.id)}
                      className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Подробнее
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredPurchases.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#111] mb-2">
                Нет {activeTab === 'active' ? 'активных' : 
                      activeTab === 'pending' ? 'ожидающих' : 
                      'завершенных'} закупок
              </h3>
              <p className="text-gray-500">
                Создайте новую командную закупку или дождитесь приглашения
              </p>
            </div>
          )}
        </div>

        {/* Кнопка создания */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#111] mb-2">
            Хотите организовать командную закупку?
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Объедините усилия с другими дилерами для получения максимальной скидки
          </p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-[#D77E6C] text-white rounded-xl font-medium hover:bg-[#C56D5C] transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Создать командную закупку
          </button>
        </div>
      </div>

      {/* Модалка детальной информации */}
      {selectedPurchase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <TeamPurchaseFlow
              purchase={selectedPurchase}
              currentUserId={currentUser?.id || ''}
              onRefresh={() => handleOpenPurchase(selectedPurchase.purchase.id)}
              onStart={() => teamPurchase.startPurchase(selectedPurchase.purchase.id)}
              onComplete={() => teamPurchase.completePurchase(selectedPurchase.purchase.id)}
              onCancel={() => teamPurchase.cancelPurchase(selectedPurchase.purchase.id, 'Отменено организатором')}
              onInvite={() => {
                setShowInviteModal(true);
                handleCopyInviteLink(selectedPurchase.purchase.id);
              }}
              onLeave={() => teamPurchase.leavePurchase(selectedPurchase.purchase.id)}
            />
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedPurchase(null)}
                className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка создания закупки */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#111]">Создать командную закупку</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название закупки *
                </label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="Например: Закупка печей Tannur - Декабрь 2024"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Опишите цель закупки и преимущества"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Целевая сумма *
                  </label>
                  <input
                    type="number"
                    value={createForm.targetAmount}
                    onChange={(e) => setCreateForm({ ...createForm, targetAmount: Number(e.target.value) })}
                    min={300000}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C]"
                  />
                  <p className="text-xs text-gray-500 mt-1">Минимум 300,000 ₸</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Мин. вклад участника
                  </label>
                  <input
                    type="number"
                    value={createForm.minContribution}
                    onChange={(e) => setCreateForm({ ...createForm, minContribution: Number(e.target.value) })}
                    min={5000}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дедлайн сбора *
                  </label>
                  <input
                    type="date"
                    value={createForm.deadline}
                    onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Макс. участников
                  </label>
                  <input
                    type="number"
                    value={createForm.maxMembers}
                    onChange={(e) => setCreateForm({ ...createForm, maxMembers: Number(e.target.value) })}
                    min={2}
                    max={100}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C]"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Важно!</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Вы как организатор вносите 30% от целевой суммы</li>
                      <li>• Закупка начнется при достижении минимальной суммы 300,000 ₸</li>
                      <li>• Участники смогут присоединиться по ссылке-приглашению</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleCreatePurchase}
                disabled={!createForm.title || !createForm.deadline}
                className="flex-1 py-3 bg-[#D77E6C] text-white rounded-xl font-medium hover:bg-[#C56D5C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Создать закупку
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка приглашения */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#111]">Пригласить участников</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ссылка для приглашения
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteLink}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm"
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(inviteLink);
                      toast.success('Скопировано');
                    }}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Поделитесь этой ссылкой с другими дилерами. 
                  Они смогут присоединиться к закупке и указать свой планируемый вклад.
                </p>
              </div>

              <button
                onClick={() => setShowInviteModal(false)}
                className="w-full py-3 bg-[#D77E6C] text-white rounded-xl font-medium hover:bg-[#C56D5C] transition-colors"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка выбора товаров */}
      {showProductSelector && teamPurchase.currentPurchase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <TeamPurchaseProductSelector
              purchaseId={teamPurchase.currentPurchase.purchase.id}
              userId={currentUser?.id || ''}
              contributionLimit={
                teamPurchase.currentPurchase.members.find(m => m.user.id === currentUser?.id)?.member.contribution_target || 0
              }
              currentTotal={
                teamPurchase.currentPurchase.members.find(m => m.user.id === currentUser?.id)?.member.cart_total || 0
              }
              cart={teamPurchase.memberCart}
              onAddToCart={teamPurchase.addToCart}
              onRemoveFromCart={teamPurchase.removeFromCart}
              onUpdateQuantity={teamPurchase.updateCartQuantity}
            />
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowProductSelector(false)}
                className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Закрыть
              </button>
              <button
                onClick={async () => {
                  await teamPurchase.checkoutCart();
                  setShowProductSelector(false);
                }}
                className="flex-1 py-3 bg-[#D77E6C] text-white rounded-xl font-medium hover:bg-[#C56D5C] transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Оформить заказ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка отображения бонусов */}
      {showBonusDisplay && currentUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#111]">Мои бонусы</h2>
              <button
                onClick={() => setShowBonusDisplay(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <BonusDisplay userId={currentUser.id} showHistory={true} />
          </div>
        </div>
      )}
    </div>
  );
}