'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Package, TrendingUp, Clock, Target, Plus, Minus,
  UserPlus, CheckCircle, AlertCircle, Gift, Trophy, ShoppingCart,
  MoreVertical, Calendar, X, Share2, Copy, Crown, Star,
  CreditCard, Truck, Settings, ChevronRight, LogOut, UserX,
  Play, Mail
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Компоненты
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import TeamPurchaseProductSelector from '@/components/team-purchase/TeamPurchaseProductSelector';
import TeamPurchaseManagement from '@/components/team-purchase/TeamPurchaseManagement';
import BonusIndicator from '@/components/team-purchase/BonusIndicator';

// Контекст и сервисы
import { useUser } from '@/context/UserContext';
import { useTeamPurchaseModule } from '@/lib/team-purchase/TeamPurchaseModule';
import { teamPurchaseLifecycleService } from '@/lib/team-purchase/TeamPurchaseLifecycleService';
import { TEAM_PURCHASE_RULES } from '@/lib/team-purchase/BusinessRules';

// Типы
import type { TeamPurchase, TeamPurchaseView } from '@/types';

export default function TeamPurchasePage() {
  const router = useRouter();
  const { profile: currentUser, loading: userLoading } = useUser();
  
  // Вкладки: Активные, Сбор, Завершенные, Приглашения
  const [activeTab, setActiveTab] = useState<'active' | 'forming' | 'completed' | 'invitations'>('active');
  const [selectedPurchase, setSelectedPurchase] = useState<TeamPurchaseView | null>(null);
  const [showManagement, setShowManagement] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  
  // Форма создания
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    targetAmount: 1000000, // План по умолчанию 1М
    deadline: ''
  });

  // Модуль командных закупок
  const teamPurchase = useTeamPurchaseModule(currentUser);

  // Проверка авторизации
  useEffect(() => {
    if (!userLoading && !currentUser) {
      router.push('/signin');
    }
  }, [userLoading, currentUser, router]);

  // Загрузка закупок
  useEffect(() => {
    if (currentUser) {
      teamPurchase.loadPurchases();
    }
  }, [currentUser]);

  // Создание закупки
  const handleCreatePurchase = async () => {
    if (!createForm.title) {
      toast.error('Введите название закупки');
      return;
    }

    try {
      await teamPurchase.createPurchase(createForm);
      setShowCreateModal(false);
      setCreateForm({
        title: '',
        description: '',
        targetAmount: 1000000,
        deadline: ''
      });
      toast.success('Закупка создана! Пригласите участников');
    } catch (error) {
      toast.error('Ошибка создания закупки');
    }
  };

  // Открытие деталей
  const handleOpenPurchase = async (purchaseId: string, openSelector = false) => {
    await teamPurchase.loadPurchaseDetails(purchaseId);
    if (teamPurchase.currentPurchase) {
      setSelectedPurchase(teamPurchase.currentPurchase);
      await teamPurchase.loadMemberCart(purchaseId);
      
      // Если нужно открыть селектор товаров
      if (openSelector) {
        setShowProductSelector(true);
      }
    }
  };

  // Начать активную фазу
  const handleStartActive = async (purchaseId: string) => {
    try {
      const result = await teamPurchaseLifecycleService.startActivePurchase(purchaseId);
      if (result.success) {
        toast.success(result.message);
        await teamPurchase.loadPurchases();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Ошибка активации');
    }
  };

  // Выход из закупки
  const handleLeavePurchase = async (purchaseId: string) => {
    if (confirm('Вы уверены, что хотите выйти из закупки?')) {
      try {
        const result = await teamPurchaseLifecycleService.leavePurchase(purchaseId, currentUser?.id || '');
        if (result.success) {
          toast.success(result.message);
          setSelectedPurchase(null);
          await teamPurchase.loadPurchases();
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error('Ошибка выхода');
      }
    }
  };

  // Принять приглашение
  const handleAcceptInvite = async (purchaseId: string, inviteCode: string) => {
    try {
      const result = await teamPurchaseLifecycleService.joinByInviteCode(inviteCode, currentUser?.id || '');
      if (result.success) {
        toast.success(result.message);
        await teamPurchase.loadPurchases();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Ошибка принятия приглашения');
    }
  };

  // Копирование ссылки
  const handleCopyInviteLink = async (purchaseId: string) => {
    const link = await teamPurchase.getInviteLink(purchaseId);
    setInviteLink(link);
    await navigator.clipboard.writeText(link);
    toast.success('Ссылка скопирована');
  };

  // Оформление заказа с проверкой минимальной суммы
  const handleCheckout = async () => {
    if (!teamPurchase.currentPurchase || !currentUser) return;

    // Проверяем минимальную сумму
    const validation = await teamPurchaseLifecycleService.validateCheckout(
      teamPurchase.currentPurchase.purchase.id,
      currentUser.id
    );

    if (!validation.canCheckout) {
      toast.error(validation.message);
      return;
    }

    // Оформляем заказ
    await teamPurchase.checkoutCart();
    setShowProductSelector(false);
    toast.success('Заказ оформлен!');
  };

  // Фильтрация закупок по вкладкам
  const filteredPurchases = teamPurchase.purchases.filter(p => {
    // Для первой версии без детальной информации о членах
    // просто фильтруем по статусу
    
    if (activeTab === 'active') {
      return p.status === 'active';
    }
    if (activeTab === 'forming') {
      return p.status === 'forming';
    }
    if (activeTab === 'completed') {
      return ['completed', 'cancelled'].includes(p.status);
    }
    if (activeTab === 'invitations') {
      // Для приглашений нужно проверять детали, пока возвращаем false
      return false;
    }
    return false;
  });

  // Форматирование
  const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} ₸`;
  const formatDate = (date: string | null) => {
    if (!date) return 'Не установлен';
    return new Date(date).toLocaleDateString('ru-RU');
  };

  // Расчет прогресса
  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min(100, (current / target) * 100);
  };

  // Статистика
  const stats = {
    active: teamPurchase.purchases.filter(p => p.status === 'active').length,
    forming: teamPurchase.purchases.filter(p => p.status === 'forming').length,
    completed: teamPurchase.purchases.filter(p => p.status === 'completed').length,
    invitations: 0 // Временно 0, так как нужна детальная информация
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
    <div className="min-h-screen bg-[#F6F6F6]">
      <MoreHeaderDE title="Командные закупки" showBackButton={true} />
      
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        
        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-[#111]">{stats.active}</span>
            </div>
            <div className="text-sm text-gray-500">Активных</div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Users className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold text-[#111]">{stats.forming}</span>
            </div>
            <div className="text-sm text-gray-500">На сборе</div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-2xl font-bold text-[#111]">{stats.completed}</span>
            </div>
            <div className="text-sm text-gray-500">Завершено</div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-[#111]">{stats.invitations}</span>
            </div>
            <div className="text-sm text-gray-500">Приглашений</div>
          </div>
        </div>

        {/* Вкладки */}
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
              onClick={() => setActiveTab('forming')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'forming'
                  ? 'bg-[#D77E6C] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Сбор
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
            <button
              onClick={() => setActiveTab('invitations')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all relative ${
                activeTab === 'invitations'
                  ? 'bg-[#D77E6C] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Приглашения
              {stats.invitations > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {stats.invitations}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Список закупок */}
        <div className="space-y-4">
          {filteredPurchases.map(purchase => {
            const isOrganizer = purchase.initiator_id === currentUser?.id;
            // Получаем cart_total из members если есть, иначе 0
            let cartTotal = 0;
            
            // Если есть детальная информация с members
            if (selectedPurchase && selectedPurchase.purchase.id === purchase.id) {
              const member = selectedPurchase.members?.find(m => m.user.id === currentUser?.id);
              cartTotal = member?.member.cart_total || 0;
            }
            
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
                            Организатор
                          </span>
                        )}
                        <span className={`text-sm font-medium ${
                          purchase.status === 'active' ? 'text-green-600' :
                          purchase.status === 'forming' ? 'text-yellow-600' :
                          purchase.status === 'completed' ? 'text-gray-600' :
                          'text-red-600'
                        }`}>
                          {purchase.status === 'forming' && '⏳ Сбор участников'}
                          {purchase.status === 'active' && '✅ Активна'}
                          {purchase.status === 'completed' && '🏁 Завершена'}
                          {purchase.status === 'cancelled' && '❌ Отменена'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Действия */}
                    <div className="flex gap-2">
                      {purchase.status === 'forming' && isOrganizer && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedPurchase(purchase as any);
                              setShowManagement(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="Управление"
                          >
                            <Settings className="w-5 h-5 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleStartActive(purchase.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                          >
                            <Play className="w-4 h-4" />
                            Начать
                          </button>
                        </>
                      )}
                      
                      {purchase.status === 'active' && (
                        <>
                          {isOrganizer && (
                            <button
                              onClick={() => {
                                setSelectedPurchase(purchase as any);
                                setShowManagement(true);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                              title="Управление"
                            >
                              <Settings className="w-5 h-5 text-gray-600" />
                            </button>
                          )}
                          {!isOrganizer && (
                            <button
                              onClick={() => handleLeavePurchase(purchase.id)}
                              className="p-2 hover:bg-red-50 rounded-lg"
                              title="Выйти"
                            >
                              <LogOut className="w-5 h-5 text-red-600" />
                            </button>
                          )}
                        </>
                      )}
                      
                      {activeTab === 'invitations' && (
                        <button
                          onClick={() => handleAcceptInvite(purchase.id, purchase.invite_code)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Принять
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleCopyInviteLink(purchase.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title="Скопировать ссылку"
                      >
                        <Share2 className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Прогресс плана */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">План сбора</span>
                      <span className="text-sm font-medium">
                        {formatPrice(purchase.collected_amount)} / {formatPrice(purchase.target_amount)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#D77E6C] to-[#E89380] transition-all"
                        style={{ width: `${calculateProgress(purchase.collected_amount, purchase.target_amount)}%` }}
                      />
                    </div>
                  </div>

                  {/* Кнопки действий */}
                  <div className="flex gap-3 mt-4">
                    {purchase.status === 'active' && (
                      <>
                        <button
                          onClick={() => handleOpenPurchase(purchase.id, true)}
                          className="flex-1 py-3 bg-[#D77E6C] text-white rounded-xl font-medium hover:bg-[#C56D5C] flex items-center justify-center gap-2"
                        >
                          <ShoppingCart className="w-5 h-5" />
                          Выбрать товары
                        </button>
                      </>
                    )}
                    
                    {purchase.status === 'forming' && !isOrganizer && (
                      <button
                        onClick={() => handleOpenPurchase(purchase.id)}
                        className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                      >
                        Подробнее
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
                {activeTab === 'active' && 'Нет активных закупок'}
                {activeTab === 'forming' && 'Нет закупок на сборе'}
                {activeTab === 'completed' && 'Нет завершенных закупок'}
                {activeTab === 'invitations' && 'Нет приглашений'}
              </h3>
              <p className="text-gray-500">
                {activeTab === 'invitations' 
                  ? 'Вы не получали приглашений в закупки'
                  : 'Создайте новую закупку или дождитесь приглашения'}
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
            Создать новую командную закупку
          </button>
        </div>
      </div>

      {/* Модалка создания */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#111]">Создать командную закупку</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
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
                  placeholder="Например: Закупка печей Tannur - Январь 2025"
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
                  placeholder="Опишите цель закупки"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    План сбора
                  </label>
                  <input
                    type="number"
                    value={createForm.targetAmount}
                    onChange={(e) => setCreateForm({ ...createForm, targetAmount: Number(e.target.value) })}
                    min={100000}
                    step={100000}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C]"
                  />
                  <p className="text-xs text-gray-500 mt-1">Это просто план, не ограничение</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дедлайн (опционально)
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
                    <p className="font-medium mb-1">Как это работает:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Закупка создается со статусом "Сбор участников"</li>
                      <li>• Вы можете пригласить других дилеров по ссылке</li>
                      <li>• Когда все готовы - нажмите "Начать" для активации</li>
                      <li>• Минимальная сумма заказа на человека: {formatPrice(TEAM_PURCHASE_RULES.finance.MIN_PERSONAL_PURCHASE)}</li>
                      <li>• Чем больше сумма - тем выше бонусы!</li>
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
                Отмена
              </button>
              <button
                onClick={handleCreatePurchase}
                disabled={!createForm.title}
                className="flex-1 py-3 bg-[#D77E6C] text-white rounded-xl font-medium hover:bg-[#C56D5C] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Создать закупку
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
            // После сохранения корзины в БД, переходим к оплате
            try {
              await teamPurchase.checkoutCart();
              setShowProductSelector(false);
              toast.success('Заказ оформлен! Переход к оплате...');
              // Здесь можно добавить редирект на страницу оплаты
              // router.push('/payment');
            } catch (error) {
              console.error('Error during checkout:', error);
              toast.error('Ошибка оформления заказа');
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
    </div>
  );
}