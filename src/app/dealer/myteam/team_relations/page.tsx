'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, Package, TrendingUp, Clock, Target, Plus, Minus,
  UserPlus, CheckCircle, AlertCircle, Gift, Trophy, ShoppingCart,
  MoreVertical, Calendar, X, Share2, Copy, Crown, Star,
  CreditCard, Truck, Settings, ChevronRight, LogOut, UserX,
  Play, Mail, FileCheck, DollarSign, Bell, ArrowRight, Zap,
  Sparkles, Eye
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
import { teamPurchaseService } from '@/lib/team-purchase/TeamPurchaseService';
import { TEAM_PURCHASE_RULES } from '@/lib/team-purchase/BusinessRules';

// Типы
import type { TeamPurchase, TeamPurchaseView } from '@/types';

export default function TeamPurchasePage() {
  const router = useRouter();
  const { t } = useTranslate();
  const { profile: currentUser, loading: userLoading } = useUser();

  // Состояния
  const [selectedPurchase, setSelectedPurchase] = useState<TeamPurchaseView | null>(null);
  const [showManagement, setShowManagement] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
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

  const handleOpenManagement = async (purchaseId: string) => {
    await teamPurchase.loadPurchaseDetails(purchaseId);
    if (teamPurchase.currentPurchase) {
      setSelectedPurchase(teamPurchase.currentPurchase);
      setShowManagement(true);
    }
  };

  const handleViewDetails = async (purchaseId: string) => {
    try {
      console.log('=== ЗАГРУЗКА ОТЧЕТА ===');
      console.log('Purchase ID:', purchaseId);
      
      // Загружаем данные через сервис
      const details = await teamPurchaseService.getPurchaseDetails(purchaseId);
      
      console.log('=== ДАННЫЕ ИЗ СЕРВИСА ===');
      console.log('Purchase:', details.purchase);
      console.log('Members count:', details.members?.length);
      
      // Если members пустой, загрузим напрямую из БД для любого статуса
      if (!details.members || details.members.length === 0) {
        console.log('⚠️ Нет участников! Загружаем напрямую из БД...');
        
        // Загружаем ВСЕХ участников напрямую из Supabase
        const { supabase } = await import('@/lib/supabase/client');
        
        // Сначала загружаем участников
        const { data: allMembers, error: membersError } = await supabase
          .from('team_purchase_members')
          .select('*')
          .eq('team_purchase_id', purchaseId);
        
        if (membersError) {
          console.error('Ошибка загрузки участников:', membersError);
        } else if (allMembers && allMembers.length > 0) {
          console.log('=== ЗАГРУЖЕНО ИЗ team_purchase_members ===');
          console.log('Всего записей:', allMembers.length);
          
          // Загружаем данные пользователей отдельно
          const userIds = allMembers.map(m => m.user_id).filter(Boolean);
          const { data: users, error: usersError } = await supabase
            .from('users')
            .select('*')
            .in('id', userIds);
          
          if (usersError) {
            console.error('Ошибка загрузки users:', usersError);
          }
          
          // Создаем map для быстрого поиска
          const usersMap = new Map(users?.map(u => [u.id, u]) || []);
          
          // Формируем memberViews для отображения
          const memberViews = allMembers.map(member => {
            console.log(`Участник ${member.user_id}:`, {
              status: member.status,
              contribution_target: member.contribution_target,
              contribution_actual: member.contribution_actual
            });
            
            return {
              member: member,
              user: usersMap.get(member.user_id) || null,
              cartItems: [],
              order: null,
              isOrganizer: member.role === 'organizer',
              hasPaid: member.status === 'purchased'
            };
          });
          
          // Обновляем details с реальными участниками
          details.members = memberViews;
          details.totalMembers = memberViews.length;
          
          console.log('✅ Загружено участников:', memberViews.length);
          console.log('Сумма contribution_actual:', allMembers.reduce((sum, m) => sum + (m.contribution_actual || 0), 0));
        } else {
          console.log('❌ Нет записей в team_purchase_members для этой закупки');
        }
      }
      
      setSelectedPurchase(details);
      setShowDetails(true);
    } catch (error) {
      console.error('❌ ОШИБКА загрузки отчета:', error);
      toast.error(t('Ошибка загрузки деталей'));
    }
  };

  const handleOpenInviteModal = (purchase: TeamPurchase) => {
    setInvitePurchaseId(purchase.id);
    setInvitePurchaseTitle(purchase.title);
    setInvitePurchaseCode(purchase.invite_code);
    setShowInviteModal(true);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ru-RU', { useGrouping: true }).replace(/,/g, ' ');
  };

  const formatDate = (date: string | null) => {
    if (!date) return t('Не установлен');
    return new Date(date).toLocaleDateString('ru-RU');
  };

  const getDaysLeft = (deadline: string | null) => {
    if (!deadline) return null
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  };

  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min(100, (current / target) * 100);
  };

  // Группировка закупок по статусам
  const groupedPurchases = {
    forming: teamPurchase.purchases.filter(p => p.status === 'forming'),
    active: teamPurchase.purchases.filter(p => p.status === 'active'),
    confirming: teamPurchase.purchases.filter(p => p.status === 'confirming'),
    completed: teamPurchase.purchases.filter(p => p.status === 'completed' || p.status === 'cancelled')
  };

  // Статистика
  const stats = {
    total: teamPurchase.purchases.length,
    totalCollected: teamPurchase.purchases.reduce((sum, p) => sum + (p.collected_amount || 0), 0)
  };

  if (userLoading || teamPurchase.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#D77E6C] border-t-transparent"></div>
      </div>
    );
  }

  if (!currentUser) return null;

  const PurchaseCard = ({ purchase }: { purchase: TeamPurchase }) => {
    const isOrganizer = purchase.initiator_id === currentUser?.id;
    const isFinanceOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'finance';
    const progress = calculateProgress(purchase.collected_amount || 0, purchase.target_amount);
    const daysLeft = getDaysLeft(purchase.deadline);

    return (
      <div className="bg-white rounded-3xl p-5 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
        {/* Декоративные элементы */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D77E6C]/10 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#E89380]/10 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative">
          {/* Заголовок и статус */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-base mb-2 group-hover:text-[#D77E6C] transition-colors">
                {purchase.title}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                {isOrganizer && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-gradient-to-r from-[#D77E6C]/10 to-[#E89380]/10 text-[#D77E6C] rounded-lg font-medium">
                    <Crown className="w-3.5 h-3.5" />
                    {t('Организатор')}
                  </span>
                )}
                {daysLeft !== null && daysLeft <= 3 && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg font-medium animate-pulse">
                    <Clock className="w-3.5 h-3.5" />
                    {t('Осталось {n} дн').replace('{n}', String(daysLeft))}
                  </span>
                )}
                {purchase.status === 'active' && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-green-50 text-green-600 rounded-lg font-medium">
                    <Zap className="w-3.5 h-3.5" />
                    {t('Активна')}
                  </span>
                )}
              </div>
            </div>

            {/* Быстрые действия */}
            <div className="flex items-center gap-1">
              {/* Кнопка просмотра участников для активных и формирующихся закупок */}
              {['active', 'forming'].includes(purchase.status) && (
                <button
                  onClick={() => handleViewDetails(purchase.id)}
                  className="p-2 hover:bg-[#D77E6C]/10 rounded-xl transition-colors"
                  title={t('Посмотреть участников')}
                >
                  <Eye className="w-4 h-4 text-[#D77E6C]" />
                </button>
              )}
              {/* Кнопка приглашения для формирующихся и активных закупок */}
              {['forming', 'active'].includes(purchase.status) && isOrganizer && (
                <button
                  onClick={() => handleOpenInviteModal(purchase)}
                  className="px-3 py-1.5 bg-[#D77E6C] text-white text-xs font-medium rounded-lg hover:bg-[#C66B5A] transition-colors flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  {t('Пригласить')}
                </button>
              )}
            </div>
          </div>

          {/* Прогресс */}
          <div className="space-y-3 mb-4">
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-sm text-gray-500">{t('Прогресс')}</span>
                <span className="text-2xl font-bold text-[#D77E6C]">{Math.round(progress)}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-700 ease-out relative"
                  style={{
                    width: `${progress}%`,
                    background: purchase.status === 'active' 
                      ? 'linear-gradient(90deg, #D77E6C 0%, #E89380 100%)'
                      : 'linear-gradient(90deg, #9CA3AF 0%, #D1D5DB 100%)'
                  }}
                >
                  {progress > 50 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {t('Собрано:')} <span className="font-semibold text-gray-900">{formatPrice(purchase.collected_amount || 0)} ₸</span>
              </span>
              <span className="text-gray-600">
                {t('Цель:')} <span className="font-semibold text-gray-900">{formatPrice(purchase.target_amount)} ₸</span>
              </span>
            </div>
          </div>

          {/* Действия */}
          <div className="flex gap-2">
            {purchase.status === 'forming' && isOrganizer && (
              <>
                <button
                  onClick={() => handleOpenManagement(purchase.id)}
                  className="flex-1 py-2.5 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 text-sm font-medium rounded-2xl hover:from-gray-200 hover:to-gray-100 transition-all"
                >
                  {t('Управление')}
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
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#D77E6C] to-[#E89380] text-white text-sm font-medium rounded-2xl hover:from-[#C66B5A] hover:to-[#D77E6C] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                >
                  <Play className="w-4 h-4" />
                  {t('Начать')}
                </button>
              </>
            )}

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
                className="flex-1 py-2.5 bg-gradient-to-r from-[#D77E6C] to-[#E89380] text-white text-sm font-medium rounded-2xl hover:from-[#C66B5A] hover:to-[#D77E6C] transition-all shadow-md hover:shadow-lg"
              >
                {t('Присоединиться')}
              </button>
            )}

            {purchase.status === 'active' && (
              <>
                <button
                  type="button" // ВАЖНО! Добавьте type="button"
                  onClick={(e) => {
                    e.preventDefault(); // Предотвращаем отправку формы
                    e.stopPropagation(); // Останавливаем всплытие события
                    handleOpenPurchase(purchase.id, true);
                  }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#D77E6C] to-[#E89380] text-white text-sm font-medium rounded-2xl hover:from-[#C66B5A] hover:to-[#D77E6C] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {t('Выбрать товары')}
                </button>
                {isOrganizer && (
                  <>
                    <button
                      onClick={() => handleOpenManagement(purchase.id)}
                      className="px-3 py-2.5 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-2xl hover:from-gray-200 hover:to-gray-100 transition-all"
                      title={t('Управление')}
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(t('Завершить активную фазу и передать на проверку?'))) {
                          const result = await teamPurchaseLifecycleService.moveToConfirming(purchase.id);
                          if (result.success) {
                            toast.success(result.message);
                            await teamPurchase.loadPurchases();
                          } else {
                            toast.error(result.message);
                          }
                        }
                      }}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 text-white text-sm font-medium rounded-2xl hover:from-amber-600 hover:to-amber-500 transition-all shadow-md hover:shadow-lg"
                      title={t('На проверку')}
                    >
                      <FileCheck className="w-4 h-4" />
                    </button>
                  </>
                )}
              </>
            )}

            {purchase.status === 'confirming' && (isOrganizer || isFinanceOrAdmin) && (
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
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium rounded-2xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-md hover:shadow-lg"
              >
                {t('Завершить проверку')}
              </button>
            )}

            {purchase.status === 'confirming' && !(isOrganizer || isFinanceOrAdmin) && (
              <div className="flex-1 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-sm font-medium rounded-2xl text-center">
                {t('На проверке')}
              </div>
            )}

            {purchase.status === 'completed' && (
              <button
                onClick={() => handleViewDetails(purchase.id)}
                className="flex-1 py-2.5 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 text-sm font-medium rounded-2xl hover:from-gray-200 hover:to-gray-100 transition-all"
              >
                {t('Посмотреть отчет')}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="p-4 sm:p-6">
        <MoreHeaderDE title={t('Командные закупки')} showBackButton={true} />

        <div className="mt-6">
          {/* Блок приглашений для дилеров */}
          {currentUser?.role === 'dealer' && (
            <TeamPurchaseInvitations 
              userId={currentUser.id} 
              onAccept={() => teamPurchase.loadPurchases()}
            />
          )}

          {/* Общая статистика */}
          <div className="bg-gradient-to-r from-[#D77E6C]/10 via-[#E89380]/10 to-white rounded-3xl p-6 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#D77E6C]/20 to-transparent rounded-full -translate-y-20 translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#E89380]/20 to-transparent rounded-full translate-y-16 -translate-x-16"></div>
            
            <div className="relative flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-[#D77E6C]">{stats.total}</h2>
                <p className="text-sm text-[#D77E6C]/70 font-medium mt-1">{t('Всего закупок')}</p>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-bold text-[#D77E6C]">{formatPrice(stats.totalCollected)} ₸</h2>
                <p className="text-sm text-[#D77E6C]/70 font-medium mt-1">{t('Общая сумма')}</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl font-medium hover:from-gray-800 hover:to-gray-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                {t('Создать')}
              </button>
            </div>
          </div>

          {/* Секции по статусам */}
          <div className="space-y-8">
            {/* Активные */}
            {groupedPurchases.active.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2.5 h-2.5 bg-[#D77E6C] rounded-full animate-pulse"></div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('Активные закупки')}</h3>
                  <span className="px-2.5 py-1 bg-[#D77E6C]/10 text-[#D77E6C] rounded-lg text-sm font-medium">
                    {groupedPurchases.active.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedPurchases.active.map(purchase => (
                    <PurchaseCard key={purchase.id} purchase={purchase} />
                  ))}
                </div>
              </div>
            )}

            {/* На сборе */}
            {groupedPurchases.forming.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2.5 h-2.5 bg-amber-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('Сбор участников')}</h3>
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium">
                    {groupedPurchases.forming.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedPurchases.forming.map(purchase => (
                    <PurchaseCard key={purchase.id} purchase={purchase} />
                  ))}
                </div>
              </div>
            )}

            {/* На проверке */}
            {groupedPurchases.confirming.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('На проверке')}</h3>
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                    {groupedPurchases.confirming.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedPurchases.confirming.map(purchase => (
                    <PurchaseCard key={purchase.id} purchase={purchase} />
                  ))}
                </div>
              </div>
            )}

            {/* Завершенные */}
            {groupedPurchases.completed.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2.5 h-2.5 bg-gray-400 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('Завершенные')}</h3>
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                    {groupedPurchases.completed.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedPurchases.completed.map(purchase => (
                    <PurchaseCard key={purchase.id} purchase={purchase} />
                  ))}
                </div>
              </div>
            )}

            {/* Пустое состояние */}
            {stats.total === 0 && (
              <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-3xl p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#D77E6C]/10 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#E89380]/10 to-transparent rounded-full translate-y-24 -translate-x-24"></div>
                
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#D77E6C]/10 to-[#E89380]/10 rounded-3xl flex items-center justify-center mx-auto mb-5">
                    <ShoppingCart className="w-10 h-10 text-[#D77E6C]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {t('Нет командных закупок')}
                  </h3>
                  <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
                    {t('Создайте первую закупку и получайте бонусы вместе с командой')}
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D77E6C] to-[#E89380] text-white rounded-2xl font-medium hover:from-[#C66B5A] hover:to-[#D77E6C] transition-all shadow-md hover:shadow-lg group"
                  >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    {t('Создать закупку')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Модалка создания */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-gray-900">{t('Создать закупку')}</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  {t('Название')} *
                </label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder={t('Например: Закупка печей Tannur')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D77E6C] transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  {t('Описание')}
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder={t('Опишите цель закупки')}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D77E6C] transition-colors resize-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    {t('План сбора')}
                  </label>
                  <input
                    type="text"
                    value={formatPrice(createForm.targetAmount)}
                    onChange={(e) => {
                      const numValue = Number(e.target.value.replace(/\s/g, ''));
                      if (!isNaN(numValue)) {
                        setCreateForm({ ...createForm, targetAmount: numValue });
                      }
                    }}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D77E6C] transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    {t('Дедлайн')}
                  </label>
                  <input
                    type="date"
                    value={createForm.deadline}
                    onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D77E6C] transition-colors text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-xl font-medium hover:from-gray-200 hover:to-gray-100 transition-colors"
              >
                {t('Отмена')}
              </button>
              <button
                onClick={handleCreatePurchase}
                disabled={!createForm.title}
                className="flex-1 py-2.5 bg-gradient-to-r from-[#D77E6C] to-[#E89380] text-white rounded-xl font-medium hover:from-[#C66B5A] hover:to-[#D77E6C] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                {t('Создать')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка деталей/отчета */}
      {showDetails && selectedPurchase && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('Отчет по закупке')}
              </h2>
              <button onClick={() => setShowDetails(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Информация о закупке */}
            <div className="mb-5">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{selectedPurchase.purchase.title}</h3>
              <p className="text-sm text-gray-600">
                {t('Участников:')} {selectedPurchase.members?.length || 0}
              </p>
            </div>

            {/* Список участников - компактный */}
            <div className="space-y-2">
              {selectedPurchase.members && selectedPurchase.members.length > 0 ? (
                <>
                  {selectedPurchase.members
                    .filter(m => m.member.status !== 'removed' && m.member.contribution_actual > 0)
                    .sort((a, b) => (b.member.contribution_actual || 0) - (a.member.contribution_actual || 0))
                    .map((memberView, index) => {
                      const member = memberView.member;
                      const user = memberView.user;
                      
                      return (
                        <div key={member.id} className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-500 w-6">
                              {index + 1}.
                            </span>
                            <div>
                              <p className="font-medium text-gray-900">
                                {user?.first_name && user?.last_name 
                                  ? `${user.first_name} ${user.last_name}`
                                  : user?.name || user?.email || 'Участник'}
                                {memberView.isOrganizer && (
                                  <span className="ml-2 text-xs text-[#D77E6C]">
                                    {t('организатор')}
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500">
                                {t('Присоединился:')} {new Date(member.joined_at || member.created_at).toLocaleDateString('ru-RU')}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-semibold text-[#D77E6C]">
                              {formatPrice(member.contribution_actual || 0)} ₸
                            </p>
                            {member.status === 'purchased' && (
                              <p className="text-xs text-green-600">{t('Оплачено')}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  
                  {/* Итоговая сумма */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center px-3">
                      <span className="font-semibold text-gray-900">
                        {t('Итого:')}
                      </span>
                      <span className="text-xl font-bold text-[#D77E6C]">
                        {formatPrice(
                          selectedPurchase.members
                            .filter(m => m.member.status !== 'removed')
                            .reduce((sum, m) => sum + (m.member.contribution_actual || 0), 0)
                        )} ₸
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <p className="text-gray-500">{t('Нет данных о закупках')}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowDetails(false)}
              className="w-full mt-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              {t('Закрыть')}
            </button>
          </div>
        </div>
      )}

      {/* Остальные модалки */}
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