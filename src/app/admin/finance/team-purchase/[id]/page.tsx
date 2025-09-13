'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/context/UserContext';
import { teamPurchaseBonusService } from '@/lib/team-purchase/TeamPurchaseBonusService';
import {
  ArrowLeft,
  Calculator,
  CheckCircle,
  DollarSign,
  Loader2,
  Users,
  Award,
  Coins,
  MoreVertical,
  Clock,
  Calendar,
  FileText,
  Package,
  ChevronDown,
  ChevronUp,
  Info,
  TrendingUp,
  Target
} from 'lucide-react';

type BonusDetail = {
  id: string;
  beneficiary_id: string;
  contributor_id: string;
  hierarchy_level: number;
  contribution_amount: number;
  team_bonus_percent: number;
  beneficiary_percent: number;
  contributor_percent: number;
  received_percent: number;
  bonus_amount: number;
  calculation_status: string;
  payment_status: string;
  calculation_details: any;
  beneficiary: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    personal_level: number;
    personal_turnover: number;
  };
  contributor: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
};

type TeamPurchaseDetail = {
  id: string;
  title: string;
  description: string;
  initiator_id: string;
  target_amount: number;
  collected_amount: number;
  paid_amount: number;
  status: string;
  created_at: string;
  completed_at: string | null;
  bonuses_calculated: boolean;
  bonuses_calculated_at: string | null;
  bonuses_approved: boolean;
  bonuses_approved_at: string | null;
  bonuses_approved_by: string | null;
  initiator: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  members: Array<{
    id: string;
    user_id: string;
    contribution_actual: number;
    status: string;
    user: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      parent_id?: string;
      personal_level: number;
      personal_turnover: number;
    };
  }>;
};

// Функция для получения инициалов
const getInitials = (firstName: string, lastName: string): string => {
  if (!firstName || !lastName) return 'UN';
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Функция для генерации цвета аватара на основе имени
const getAvatarColor = (name: string): string => {
  const colors = [
    '#E89380', '#6B73FF', '#9333EA', '#F59E0B', '#EF4444',
    '#10B981', '#3B82F6', '#8B5CF6', '#F97316', '#06B6D4'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Функция для форматирования статуса
const getStatusText = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'forming': 'Формируется',
    'active': 'Активная',
    'purchasing': 'Закупка',
    'completed': 'Завершена',
    'cancelled': 'Отменена'
  };
  return statusMap[status] || status;
};

// Компонент для отображения детальной информации о бонусе - КОМПАКТНАЯ ВЕРСИЯ
const BonusExplanation = ({ bonus, isPersonal = false }: {
  bonus: BonusDetail;
  isPersonal: boolean;
}) => {
  const beneficiaryName = `${bonus.beneficiary.first_name} ${bonus.beneficiary.last_name}`;
  const contributorName = `${bonus.contributor.first_name} ${bonus.contributor.last_name}`;
  const contribution = bonus.contribution_amount;
  
  return (
    <div className="bg-blue-50/50 border border-blue-100 rounded px-2 py-1 text-xs text-blue-700 flex items-center gap-2">
      <Info className="w-3 h-3 text-blue-500 flex-shrink-0" />
      {isPersonal ? (
        <span>
          Личный бонус: <strong>{bonus.beneficiary_percent}%</strong> от вклада {contribution.toLocaleString()} ₸ = <strong>{bonus.bonus_amount.toLocaleString()} ₸</strong>
        </span>
      ) : (
        <span>
          От {contributorName}: ({bonus.beneficiary_percent}% - {bonus.contributor_percent}%) × {contribution.toLocaleString()} ₸ = <strong>{bonus.bonus_amount.toLocaleString()} ₸</strong>
        </span>
      )}
    </div>
  );
};

// Компонент элемента списка участника
const TeamMemberItem = React.memo(({
  member,
  bonuses,
  purchase,
  level = 0,
  isExpanded,
  onToggle,
  children
}: {
  member: any;
  bonuses: BonusDetail[];
  purchase: TeamPurchaseDetail;
  level?: number;
  isExpanded: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) => {
  const user = member.user;
  const contribution = member.contribution_actual;

  const userBonuses = bonuses.filter((b: BonusDetail) => b.beneficiary_id === user.id);
  const personalBonus = userBonuses.find((b: BonusDetail) => b.contributor_id === user.id);
  const differentialBonuses = userBonuses.filter((b: BonusDetail) => b.contributor_id !== user.id);
  const totalBonus = userBonuses.reduce((sum, b) => sum + b.bonus_amount, 0);

  const isOrganizer = user.id === purchase.initiator_id;
  const avatarColor = getAvatarColor(user.first_name + user.last_name);

  return (
    <>
      {/* Основная строка */}
      <div className="group border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 bg-white">
        <div className="flex items-center py-3 px-6">
          {/* Отступ для уровня вложенности */}
          <div style={{ marginLeft: `${level * 20}px` }} className="flex items-center flex-1 min-w-0 relative">
            {/* Вертикальная линия для иерархии */}
            {level > 0 && (
              <div className="absolute -left-2 top-0 w-px h-full bg-gray-200"></div>
            )}

            {/* Аватар */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs mr-3 flex-shrink-0"
              style={{ backgroundColor: avatarColor }}
            >
              {getInitials(user.first_name, user.last_name)}
            </div>

            {/* Информация о пользователе */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {user.first_name} {user.last_name}
                </h3>
                {isOrganizer && (
                  <span className="inline-block text-xs bg-[#E89380] text-white px-2 py-0.5 rounded">
                    Организатор
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                Уровень: {user.personal_level || 0}% • Оборот: {user.personal_turnover?.toLocaleString() || 0} ₸
              </div>
            </div>
          </div>

          {/* Вклад */}
          <div className="hidden md:block w-28 text-right mr-4">
            <span className="text-sm font-semibold text-gray-900">
              {contribution.toLocaleString()} ₸
            </span>
          </div>

          {/* Общий бонус */}
          <div className="w-32 text-right mr-2">
            <span className="text-lg font-bold text-[#E89380]">
              {totalBonus.toLocaleString()} ₸
            </span>
            {userBonuses.length > 0 && (
              <div className="text-xs text-gray-500">
                {userBonuses.length === 1 ? 'Личный' : `${userBonuses.length} бонуса`}
              </div>
            )}
          </div>

          {/* Кнопка для разворачивания деталей */}
          {userBonuses.length > 0 && (
            <button
              onClick={onToggle}
              className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
          )}
        </div>

        {/* Детальная информация о бонусах - МИНИМАЛИСТИЧНАЯ ВЕРСИЯ */}
        {isExpanded && userBonuses.length > 0 && (
          <div className="px-6 pb-2 pl-20">
            <div className="space-y-1">
              {/* Личный бонус */}
              {personalBonus && (
                <BonusExplanation bonus={personalBonus} isPersonal={true} />
              )}
              
              {/* Командные бонусы */}
              {differentialBonuses.map((bonus) => (
                <BonusExplanation key={bonus.id} bonus={bonus} isPersonal={false} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Дочерние элементы (иерархия) */}
      {children}
    </>
  );
});

// Основной компонент
export default function TeamPurchaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { profile } = useUser();
  const purchaseId = params.id as string;

  const [purchase, setPurchase] = useState<TeamPurchaseDetail | null>(null);
  const [bonuses, setBonuses] = useState<BonusDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isPayingOut, setIsPayingOut] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set<string>());

  const loadPurchaseDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('team_purchases')
        .select(`*, initiator:users!team_purchases_initiator_id_fkey (id, first_name, last_name, email, phone)`)
        .eq('id', purchaseId)
        .single();

      if (purchaseError) throw purchaseError;

      const { data: membersData, error: membersError } = await supabase
        .from('team_purchase_members')
        .select(`*, user:users!team_purchase_members_user_id_fkey (id, first_name, last_name, email, parent_id, personal_level, personal_turnover)`)
        .eq('team_purchase_id', purchaseId)
        .eq('status', 'purchased');

      if (membersError) throw membersError;

      setPurchase({
        ...purchaseData,
        members: membersData || []
      });

      if (purchaseData.bonuses_calculated) {
        await loadBonuses();
      }
    } catch (error) {
      console.error('Error loading purchase details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [purchaseId]);

  const loadBonuses = async () => {
    try {
      const { data: bonusesData, error } = await supabase
        .from('team_purchase_bonuses')
        .select(`*, beneficiary:users!team_purchase_bonuses_beneficiary_id_fkey (id, first_name, last_name, email, personal_turnover, personal_level), contributor:users!team_purchase_bonuses_contributor_id_fkey (id, first_name, last_name, email)`)
        .eq('team_purchase_id', purchaseId)
        .order('hierarchy_level', { ascending: true });

      if (error) throw error;
      setBonuses(bonusesData || []);
    } catch (error) {
      console.error('Error loading bonuses:', error);
    }
  };

  useEffect(() => {
    if (purchaseId) {
      loadPurchaseDetails();
    }
  }, [purchaseId, loadPurchaseDetails]);

  const calculateBonuses = async () => {
    try {
      setIsCalculating(true);
      const result = await teamPurchaseBonusService.calculateBonuses(purchaseId);
      if (result?.success) {
        alert(`Бонусы рассчитаны! Всего: ${result.total_bonuses} ₸`);
        await loadPurchaseDetails();
      } else {
        alert(result?.error || 'Ошибка при расчете бонусов');
      }
    } catch (error) {
      alert('Ошибка при расчете бонусов');
    } finally {
      setIsCalculating(false);
    }
  };

  const approveBonuses = async () => {
    if (!profile?.id) return;
    try {
      setIsApproving(true);
      const result = await teamPurchaseBonusService.approveBonuses(purchaseId, profile.id);
      if (result?.success) {
        alert(`Бонусы одобрены!`);
        await loadPurchaseDetails();
      } else {
        alert(result?.error || 'Ошибка при одобрении бонусов');
      }
    } catch (error) {
      alert('Ошибка при одобрении бонусов');
    } finally {
      setIsApproving(false);
    }
  };

  const payoutBonuses = async () => {
    try {
      setIsPayingOut(true);
      const result = await teamPurchaseBonusService.payoutBonuses(purchaseId);
      if (result?.success) {
        alert(`Бонусы выплачены!`);
        await loadPurchaseDetails();
      } else {
        alert(result?.error || 'Ошибка при выплате бонусов');
      }
    } catch (error) {
      alert('Ошибка при выплате бонусов');
    } finally {
      setIsPayingOut(false);
    }
  };

  const toggleExpanded = (userId: string) => {
    setExpandedItems(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(userId)) {
        newExpanded.delete(userId);
      } else {
        newExpanded.add(userId);
      }
      return newExpanded;
    });
  };

  const buildHierarchy = useCallback(() => {
    if (!purchase || !purchase.members || purchase.members.length === 0) {
      return (
        <div className="px-6 py-8 text-center text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Нет данных об участниках</p>
        </div>
      );
    }

    const membersMap = new Map(purchase.members.map(m => [m.user_id, m]));
    const rootMembers = purchase.members.filter(m => !m.user.parent_id || !membersMap.has(m.user.parent_id));

    const renderMember = (member: any, level = 0): React.ReactNode => {
      const children = purchase.members.filter(m => m.user.parent_id === member.user.id);
      const isExpanded = expandedItems.has(member.user.id);

      return (
        <TeamMemberItem
          key={member.user.id}
          member={member}
          bonuses={bonuses}
          purchase={purchase}
          level={level}
          isExpanded={isExpanded}
          onToggle={() => toggleExpanded(member.user.id)}
        >
          {children.length > 0 && (
            <div className="relative">
              {children.map(child => renderMember(child, level + 1))}
            </div>
          )}
        </TeamMemberItem>
      );
    };

    return rootMembers.map(member => renderMember(member, 0));
  }, [purchase, bonuses, expandedItems]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#E89380]" />
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500">Закупка не найдена</p>
      </div>
    );
  }

  const totalBonuses = bonuses.reduce((sum, b) => sum + b.bonus_amount, 0);
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        {/* БЛОК 1: Заголовок и основная информация */}
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          {/* Навигация и заголовок */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{purchase.title}</h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(purchase.created_at).toLocaleDateString('ru-RU')}
                  </span>
                  {purchase.completed_at && (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Завершено {new Date(purchase.completed_at).toLocaleDateString('ru-RU')}
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    purchase.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {getStatusText(purchase.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Кнопки управления */}
            {isAdmin && (
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4" />
                  Экспорт
                </button>
                {!purchase.bonuses_calculated && (
                  <button
                    onClick={calculateBonuses}
                    disabled={isCalculating}
                    className="px-3 py-2 bg-[#E89380] text-white rounded-lg hover:bg-[#E89380]/90 disabled:opacity-50 flex items-center gap-2 text-sm"
                  >
                    {isCalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                    Рассчитать
                  </button>
                )}
                {purchase.bonuses_calculated && !purchase.bonuses_approved && (
                  <button
                    onClick={approveBonuses}
                    disabled={isApproving}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 text-sm"
                  >
                    {isApproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Одобрить
                  </button>
                )}
                {purchase.bonuses_approved && (
                  <button
                    onClick={payoutBonuses}
                    disabled={isPayingOut}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 text-sm"
                  >
                    {isPayingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                    Выплатить
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Статистические карточки - компактные */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Общая сумма</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{purchase.paid_amount.toLocaleString()} ₸</p>
              <p className="text-xs text-gray-500">из {purchase.target_amount.toLocaleString()} ₸</p>
            </div>

            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Участников</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{purchase.members.length}</p>
              <p className="text-xs text-gray-500">активных</p>
            </div>

            <div className="bg-[#E89380]/10 rounded-lg p-3 border border-[#E89380]/30">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-[#E89380]" />
                <span className="text-sm font-medium text-gray-600">Всего бонусов</span>
              </div>
              <p className="text-xl font-bold text-[#E89380]">{totalBonuses.toLocaleString()} ₸</p>
              <p className="text-xs text-gray-500">начислено</p>
            </div>

            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Процент</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{bonuses[0]?.team_bonus_percent || 0}%</p>
              <p className="text-xs text-gray-500">от закупки</p>
            </div>
          </div>
        </div>

        {/* БЛОК 2: Заголовки колонок */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-2">
            <div className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="flex-1">Участник</div>
              <div className="hidden md:block w-28 text-right mr-4">Вклад</div>
              <div className="w-32 text-right mr-2">Бонус</div>
              <div className="w-6"></div>
            </div>
          </div>
        </div>

        {/* БЛОК 3: Список участников с иерархией */}
        <div className="bg-white">
          {buildHierarchy()}
        </div>

        {/* БЛОК 4: Статус расчетов - компактный */}
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="px-6 py-3">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  purchase.bonuses_calculated ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <span className={`text-xs ${
                  purchase.bonuses_calculated ? 'text-green-700' : 'text-gray-500'
                }`}>
                  Рассчитаны
                  {purchase.bonuses_calculated_at && (
                    <span className="ml-1 text-gray-400">
                      ({new Date(purchase.bonuses_calculated_at).toLocaleDateString('ru-RU')})
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  purchase.bonuses_approved ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <span className={`text-xs ${
                  purchase.bonuses_approved ? 'text-green-700' : 'text-gray-500'
                }`}>
                  Одобрены
                  {purchase.bonuses_approved_at && (
                    <span className="ml-1 text-gray-400">
                      ({new Date(purchase.bonuses_approved_at).toLocaleDateString('ru-RU')})
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                Обновлено: {new Date().toLocaleDateString('ru-RU')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}