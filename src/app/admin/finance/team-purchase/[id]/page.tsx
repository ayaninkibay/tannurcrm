'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/context/UserContext';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
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
  Clock,
  Calendar,
  FileText,
  Package,
  ChevronDown,
  ChevronUp,
  Info,
  AlertCircle,
  Eye,
  EyeOff,
  TrendingUp,
  Zap
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

// Таблица процентов бонусов
const BONUS_LEVELS = [
  { min: 300000, percent: 5 },
  { min: 1000000, percent: 8 },
  { min: 3000000, percent: 10 },
  { min: 5000000, percent: 13 },
  { min: 10000000, percent: 15 },
  { min: 20000000, percent: 18 },
  { min: 50000000, percent: 20 },
  { min: 100000000, percent: 21 },
  { min: 150000000, percent: 22 },
  { min: 200000000, percent: 23 },
  { min: 300000000, percent: 24 },
  { min: 400000000, percent: 25 },
  { min: 500000000, percent: 26 },
  { min: 700000000, percent: 27 },
  { min: 1000000000, percent: 28 }
];

// Функция для получения процента по сумме
const getPercentByAmount = (amount: number): number => {
  for (let i = BONUS_LEVELS.length - 1; i >= 0; i--) {
    if (amount >= BONUS_LEVELS[i].min) {
      return BONUS_LEVELS[i].percent;
    }
  }
  return 0;
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

// Детальное объяснение бонуса с формулами
const DetailedBonusExplanation = ({ 
  bonus, 
  isPersonal = false,
  showFormulas = false 
}: {
  bonus: BonusDetail;
  isPersonal: boolean;
  showFormulas: boolean;
}) => {
  const beneficiaryName = `${bonus.beneficiary.first_name} ${bonus.beneficiary.last_name}`;
  const contributorName = `${bonus.contributor.first_name} ${bonus.contributor.last_name}`;
  
  if (showFormulas) {
    // Для личного бонуса - упрощенный вид
    if (isPersonal) {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-gray-600">Покупка на сумму:</div>
            <div className="font-semibold text-gray-900">
              {bonus.contribution_amount.toLocaleString()} ₸
            </div>
            
            <div className="text-gray-600">Процент:</div>
            <div className="font-semibold text-gray-900">
              {bonus.beneficiary_percent}%
            </div>
            
            <div className="col-span-2 border-t border-gray-200 pt-2 mt-2">
              <div className="font-mono text-xs text-gray-600 mb-1">
                {bonus.beneficiary_percent}% × {bonus.contribution_amount.toLocaleString()}₸
              </div>
              <div className="text-sm">
                <span className="font-semibold text-gray-900">Итого бонус:</span>{' '}
                <span className="font-bold text-[#E89380]">
                  {bonus.bonus_amount.toLocaleString()} ₸
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Для дифференциального бонуса - полный вид
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-gray-600">База расчета:</div>
          <div className="font-semibold text-gray-900">
            {bonus.contribution_amount.toLocaleString()} ₸
          </div>
          
          <div className="text-gray-600">Получатель:</div>
          <div className="font-semibold text-gray-900">
            {beneficiaryName}: {bonus.beneficiary_percent}%
          </div>
          
          <div className="text-gray-600">От кого:</div>
          <div className="font-semibold text-gray-900">
            {contributorName}: {bonus.contributor_percent}%
          </div>
          
          <div className="text-gray-600">Получаемая разница:</div>
          <div className="font-bold text-green-600">
            {bonus.received_percent}%
          </div>
          
          <div className="col-span-2 border-t border-gray-200 pt-2 mt-2">
            <div className="font-mono text-xs text-gray-600 mb-1">
              ({bonus.beneficiary_percent}% - {bonus.contributor_percent}%) × {bonus.contribution_amount.toLocaleString()}₸
            </div>
            <div className="text-sm">
              <span className="font-semibold text-gray-900">Итого бонус:</span>{' '}
              <span className="font-bold text-[#E89380]">
                {bonus.bonus_amount.toLocaleString()} ₸
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Краткий вид
  return (
    <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-xs">
      <div className="flex items-start gap-2">
        <Info className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          {isPersonal ? (
            <div>
              <span className="text-gray-600">Бонус:</span>{' '}
              <span className="font-semibold text-gray-900">{bonus.beneficiary_percent}%</span>{' '}
              <span className="text-gray-600">от своего вклада</span>{' '}
              <span className="font-semibold">{bonus.contribution_amount.toLocaleString()} ₸</span>{' '}
              <span className="text-gray-600">=</span>{' '}
              <span className="font-bold text-[#E89380]">{bonus.bonus_amount.toLocaleString()} ₸</span>
            </div>
          ) : (
            <div>
              <span className="text-gray-600">От</span>{' '}
              <span className="font-semibold">{contributorName}:</span>{' '}
              <span className="font-mono text-gray-700">
                ({bonus.beneficiary_percent}% - {bonus.contributor_percent}%)
              </span>{' '}
              <span className="text-gray-600">×</span>{' '}
              <span className="font-semibold">{bonus.contribution_amount.toLocaleString()} ₸</span>{' '}
              <span className="text-gray-600">=</span>{' '}
              <span className="font-bold text-[#E89380]">{bonus.bonus_amount.toLocaleString()} ₸</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Объяснение почему нет бонуса
const NoBonusExplanation = ({ 
  potentialBeneficiary, 
  contributor,
  teamPercent 
}: {
  potentialBeneficiary: any;
  contributor: any;
  teamPercent: number;
}) => {
  const beneficiaryPercent = Math.max(
    getPercentByAmount(potentialBeneficiary.contribution_actual || 0),
    getPercentByAmount(potentialBeneficiary.user.personal_turnover || 0)
  );
  
  const contributorPercent = Math.max(
    getPercentByAmount(contributor.contribution_actual || 0),
    getPercentByAmount(contributor.user.personal_turnover || 0)
  );

  let reason = '';
  let icon = AlertCircle;
  
  if (beneficiaryPercent <= contributorPercent) {
    reason = `Не получает: ${beneficiaryPercent}% ≤ ${contributorPercent}% участника`;
  } else if (beneficiaryPercent > teamPercent) {
    reason = `Ограничен командным процентом: ${beneficiaryPercent}% > ${teamPercent}%`;
  }

  if (!reason) return null;

  return (
    <div className="bg-orange-50 border border-orange-200 rounded px-3 py-2 text-xs">
      <div className="flex items-start gap-2">
        <AlertCircle className="w-3 h-3 text-orange-500 flex-shrink-0 mt-0.5" />
        <span className="text-orange-700">{reason}</span>
      </div>
    </div>
  );
};

// Статистика иерархии
const HierarchyStats = ({ 
  purchase, 
  bonuses, 
  teamPercent 
}: { 
  purchase: TeamPurchaseDetail;
  bonuses: BonusDetail[];
  teamPercent: number;
}) => {
  const totalPossible = purchase.paid_amount * (teamPercent / 100);
  const totalDistributed = bonuses.reduce((sum, b) => sum + b.bonus_amount, 0);
  const efficiency = (totalDistributed / totalPossible) * 100;
  const maxLevel = Math.max(...bonuses.map(b => b.hierarchy_level), 0);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-gray-600" />
        Анализ распределения
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-xs text-gray-600 mb-1">Командный %</div>
          <div className="font-bold text-lg text-gray-900">{teamPercent}%</div>
        </div>
        <div>
          <div className="text-xs text-gray-600 mb-1">Уровней иерархии</div>
          <div className="font-bold text-lg text-gray-900">{maxLevel + 1}</div>
        </div>
        <div>
          <div className="text-xs text-gray-600 mb-1">Распределено</div>
          <div className="font-bold text-lg text-[#E89380]">
            {totalDistributed.toLocaleString()} ₸
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-600 mb-1">Распределено из 100%</div>
          <div className="font-bold text-lg text-gray-900">{efficiency.toFixed(1)}%</div>
        </div>
      </div>
      {efficiency < 95 && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
          <AlertCircle className="w-3 h-3 inline mr-1" />
          Часть бонусов не распределена из-за преваышения личного процента участников над вышестоящими в иерархии.
        </div>
      )}
    </div>
  );
};

// Компонент симулятора
const BonusSimulator = ({ 
  purchase,
  onClose 
}: { 
  purchase: TeamPurchaseDetail;
  onClose: () => void;
}) => {
  const [simValues, setSimValues] = useState<{[key: string]: number}>({});
  const [simResults, setSimResults] = useState<any>(null);

  useEffect(() => {
    const initial: {[key: string]: number} = {};
    purchase.members.forEach(m => {
      initial[m.user_id] = m.contribution_actual;
    });
    setSimValues(initial);
  }, [purchase]);

  const calculateSimulation = () => {
    const totalAmount = Object.values(simValues).reduce((sum, val) => sum + val, 0);
    const teamPercent = getPercentByAmount(totalAmount);
    
    // Здесь упрощенный расчет для демонстрации
    const results = purchase.members.map(member => {
      const contribution = simValues[member.user_id] || 0;
      const personalPercent = getPercentByAmount(contribution);
      const personalBonus = contribution * (Math.min(personalPercent, teamPercent) / 100);
      
      return {
        userId: member.user_id,
        name: `${member.user.first_name} ${member.user.last_name}`,
        contribution,
        personalBonus,
        totalBonus: personalBonus // В реальности нужно считать иерархию
      };
    });

    setSimResults({
      totalAmount,
      teamPercent,
      results
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Симулятор бонусов (расчитывается бонус только от личного вклада)</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-3 mb-6">
            {purchase.members.map(member => (
              <div key={member.user_id} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-32">
                  {member.user.first_name} {member.user.last_name}
                </span>
                <input
                  type="number"
                  value={simValues[member.user_id] || 0}
                  onChange={(e) => setSimValues({
                    ...simValues,
                    [member.user_id]: parseInt(e.target.value) || 0
                  })}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm"
                  placeholder="Сумма вклада"
                />
              </div>
            ))}
          </div>
          
          <button
            onClick={calculateSimulation}
            className="w-full px-4 py-2 bg-[#E89380] text-white rounded-lg hover:bg-[#E89380]/90 font-semibold"
          >
            Рассчитать
          </button>
          
          {simResults && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="mb-3">
                <span className="text-sm text-gray-600">Общая сумма:</span>{' '}
                <span className="font-bold">{simResults.totalAmount.toLocaleString()} ₸</span>
                <span className="text-sm text-gray-600 ml-3">Командный %:</span>{' '}
                <span className="font-bold">{simResults.teamPercent}%</span>
              </div>
              <div className="space-y-2">
                {simResults.results.map((r: any) => (
                  <div key={r.userId} className="flex justify-between text-sm">
                    <span className="text-gray-600">{r.name}</span>
                    <span className="font-semibold text-[#E89380]">
                      {r.totalBonus.toLocaleString()} ₸
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Компонент элемента списка участника с иерархией
const TeamMemberItem = React.memo(({
  member,
  bonuses,
  purchase,
  level = 0,
  isExpanded,
  onToggle,
  showFormulas,
  children,
  parentMember = null,
  isOrganizer
}: {
  member: any;
  bonuses: BonusDetail[];
  purchase: TeamPurchaseDetail;
  level?: number;
  isExpanded: boolean;
  onToggle: () => void;
  showFormulas: boolean;
  children?: React.ReactNode;
  parentMember?: any;
  isOrganizer: boolean;
}) => {
  const user = member.user;
  const contribution = member.contribution_actual;
  const avatarColor = getAvatarColor(`${user.first_name} ${user.last_name}`);
  
  const userBonuses = bonuses.filter((b: BonusDetail) => b.beneficiary_id === user.id);
  const personalBonus = userBonuses.find((b: BonusDetail) => b.contributor_id === user.id);
  const differentialBonuses = userBonuses.filter((b: BonusDetail) => b.contributor_id !== user.id);
  const totalBonus = userBonuses.reduce((sum, b) => sum + b.bonus_amount, 0);

  const memberPercent = Math.max(
    getPercentByAmount(contribution),
    getPercentByAmount(user.personal_turnover || 0)
  );

  const teamPercent = getPercentByAmount(purchase.paid_amount);

  // Функция для рекурсивного поиска всех потомков
  const getAllDescendants = (userId: string): any[] => {
    const descendants: any[] = [];
    const directChildren = purchase.members.filter(m => m.user.parent_id === userId);
    
    directChildren.forEach(child => {
      descendants.push(child);
      // Рекурсивно добавляем потомков каждого ребенка
      descendants.push(...getAllDescendants(child.user_id));
    });
    
    return descendants;
  };

  // Получаем ВСЕХ потомков (не только прямых детей)
  const allDescendants = getAllDescendants(user.id);

  return (
    <>
      <div className="group border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 bg-white">
        <div className="flex items-center py-3 px-4 md:px-6">
          {/* Иерархия с линиями */}
          <div style={{ marginLeft: `${level * 24}px` }} className="flex items-center flex-1 min-w-0 relative">
            {level > 0 && (
              <>
                <div className="absolute -left-3 top-1/2 w-3 h-px bg-gray-300"></div>
                <div className="absolute -left-3 -top-3 w-px h-[calc(50%+12px)] bg-gray-300"></div>
              </>
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
                <span className="hidden md:inline">
                  Уровень: {user.personal_level || 0}% • Лич. товарооборот: {user.personal_turnover?.toLocaleString() || 0} ₸
                </span>
                <span className="md:hidden">
                  {user.personal_level || 0}% • {(user.personal_turnover / 1000000).toFixed(1)}М ₸
                </span>
              </div>
            </div>
          </div>

          {/* Процент в иерархии */}
          <div className="hidden sm:block w-16 text-center mx-2">
            <div className="text-lg font-bold text-gray-900">{memberPercent}%</div>
            <div className="text-xs text-gray-500">макс</div>
          </div>

          {/* Вклад */}
          <div className="hidden md:block w-28 text-right mr-4">
            <span className="text-sm font-semibold text-gray-900">
              {contribution.toLocaleString()} ₸
            </span>
          </div>

          {/* Общий бонус */}
          <div className="w-24 md:w-32 text-right mr-2">
            <span className="text-base md:text-lg font-bold text-[#E89380]">
              {totalBonus.toLocaleString()} ₸
            </span>
            {userBonuses.length > 0 && (
              <div className="text-xs text-gray-500">
                {userBonuses.length === 1 ? 'бонус' : `${userBonuses.length} бон.`}
              </div>
            )}
          </div>

          {/* Кнопка для разворачивания деталей */}
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
        </div>

        {/* Детальная информация о бонусах */}
        {isExpanded && (
          <div className="px-4 md:px-6 pb-3" style={{ marginLeft: `${level * 24}px` }}>
            <div className="ml-12 space-y-2">
              {/* Личный бонус */}
              {personalBonus && (
                <DetailedBonusExplanation 
                  bonus={personalBonus} 
                  isPersonal={true}
                  showFormulas={showFormulas}
                />
              )}
              
              {/* Полученные командные бонусы */}
              {differentialBonuses.map((bonus) => (
                <DetailedBonusExplanation 
                  key={bonus.id} 
                  bonus={bonus} 
                  isPersonal={false}
                  showFormulas={showFormulas}
                />
              ))}

              {/* Показываем почему НЕ получил от ВСЕХ потомков в иерархии */}
              {allDescendants.map(descendant => {
                const descendantPercent = Math.max(
                  getPercentByAmount(descendant.contribution_actual),
                  getPercentByAmount(descendant.user.personal_turnover || 0)
                );
                
                const didReceive = differentialBonuses.some(b => b.contributor_id === descendant.user_id);
                
                // Показываем объяснение если НЕ получил и процент потомка >= моего
                if (!didReceive && descendantPercent >= memberPercent && descendant.contribution_actual > 0) {
                  // Определяем уровень в иерархии
                  const isDirectChild = descendant.user.parent_id === user.id;
                  const hierarchyNote = isDirectChild ? '' : ' (поддилер)';
                  
                  return (
                    <div key={descendant.user_id} className="bg-orange-50 border border-orange-200 rounded px-3 py-2 text-xs">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-3 h-3 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div className="text-orange-700">
                          <span>
                            Не получает от <span className="font-semibold">{descendant.user.first_name} {descendant.user.last_name}</span>{hierarchyNote}:
                          </span>{' '}
                          <span>
                            Личный процент {memberPercent}% ≤ {descendantPercent}% участника
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })}

              {/* Если вообще нет бонусов и есть вклад - показываем только личный */}
              {personalBonus === undefined && contribution > 0 && memberPercent > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-xs text-gray-600">
                  <Info className="w-3 h-3 inline mr-1" />
                  Должен был получить личный бонус: {memberPercent}% от {contribution.toLocaleString()} ₸ = {(contribution * Math.min(memberPercent, teamPercent) / 100).toLocaleString()} ₸
                </div>
              )}
              
              {/* Если процент 0% */}
              {contribution > 0 && memberPercent === 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-xs text-gray-600">
                  <Info className="w-3 h-3 inline mr-1" />
                  Нет бонуса: сумма вклада {contribution.toLocaleString()} ₸ недостаточна для получения процента (минимум 300,000 ₸)
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Дочерние элементы */}
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
  const [showFormulas, setShowFormulas] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);

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

    const renderMember = (member: any, level = 0, parentMember: any = null): React.ReactNode => {
  const children = purchase.members.filter(m => m.user.parent_id === member.user.id);
  const isExpanded = expandedItems.has(member.user.id);

  // ➡️ Определяем, является ли участник организатором
  const isOrganizer = purchase.initiator_id === member.user.id;

  return (
    <TeamMemberItem
      key={member.user.id}
      member={member}
      bonuses={bonuses}
      purchase={purchase}
      level={level}
      isExpanded={isExpanded}
      onToggle={() => toggleExpanded(member.user.id)}
      showFormulas={showFormulas}
      parentMember={parentMember}
      // ➡️ Передаем переменную как пропс
      isOrganizer={isOrganizer}
        >
          {children.length > 0 && (
            <div className="relative">
              {children.map(child => renderMember(child, level + 1, member))}
            </div>
          )}
        </TeamMemberItem>
      );
    };

    return rootMembers.map(member => renderMember(member, 0));
  }, [purchase, bonuses, expandedItems, showFormulas]);

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
  const teamPercent = getPercentByAmount(purchase.paid_amount);
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="min-h-screen">
      <div className="mx-auto">
                {/* Шапка */}
                <header className="mb-6">
                  <MoreHeaderAD title={'Просмотр командной закупки'} showBackButton={true} />
                </header>
        {/* Заголовок и основная информация */}
        <div className="bg-white px-4 rounded-2xl md:px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">

              <div>
                <h1 className="text-lg md:text-xl font-bold text-gray-900">{purchase.title}</h1>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1 text-xs md:text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(purchase.created_at).toLocaleDateString('ru-RU')}
                  </span>
                  {purchase.completed_at && (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Завершено
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
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowFormulas(!showFormulas)}
                className="px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
              >
                {showFormulas ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="hidden sm:inline">Формулы</span>
              </button>
              
              <button
                onClick={() => setShowSimulator(true)}
                className="px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
              >
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Симулятор</span>
              </button>

              {isAdmin && (
                <>
                  {!purchase.bonuses_calculated && (
                    <button
                      onClick={calculateBonuses}
                      disabled={isCalculating}
                      className="px-3 py-2 bg-[#E89380] text-white rounded-lg hover:bg-[#E89380]/90 disabled:opacity-50 flex items-center gap-2 text-sm"
                    >
                      {isCalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                      <span className="hidden sm:inline">Рассчитать</span>
                    </button>
                  )}
                  {purchase.bonuses_calculated && !purchase.bonuses_approved && (
                    <button
                      onClick={approveBonuses}
                      disabled={isApproving}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 text-sm"
                    >
                      {isApproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      <span className="hidden sm:inline">Одобрить</span>
                    </button>
                  )}
                  {purchase.bonuses_approved && (
                    <button
                      onClick={payoutBonuses}
                      disabled={isPayingOut}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 text-sm"
                    >
                      {isPayingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                      <span className="hidden sm:inline">Выплатить</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Статистические карточки */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
    <div className="bg-white rounded-lg p-3 border border-gray-200">
        <div className="flex items-center gap-2 mb-1">
            <Coins className="w-4 h-4 text-gray-500" />
            <span className="text-xs md:text-sm font-medium text-gray-600">Общая сумма</span>
        </div>
        <p className="text-lg md:text-xl font-bold text-gray-900">
            {purchase.paid_amount.toLocaleString()} ₸
        </p>
        <p className="text-xs text-gray-500">из {purchase.target_amount.toLocaleString()} ₸</p>
    </div>

    <div className="bg-white rounded-lg p-3 border border-gray-200">
        <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-xs md:text-sm font-medium text-gray-600">Участников</span>
        </div>
        <p className="text-lg md:text-xl font-bold text-gray-900">{purchase.members.length}</p>
        <p className="text-xs text-gray-500">активных</p>
    </div>

    <div className="bg-[#E89380]/10 rounded-lg p-3 border border-[#E89380]/30">
        <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-[#E89380]" />
            <span className="text-xs md:text-sm font-medium text-gray-600">Всего бонусов</span>
        </div>
        <p className="text-lg md:text-xl font-bold text-[#E89380]">
            {totalBonuses.toLocaleString()} ₸
        </p>
        <p className="text-xs text-gray-500">начислено</p>
    </div>

    <div className="bg-white rounded-lg p-3 border border-gray-200">
        <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-gray-500" />
            <span className="text-xs md:text-sm font-medium text-gray-600">Процент</span>
        </div>
        <p className="text-lg md:text-xl font-bold text-gray-900">{teamPercent}%</p>
        <p className="text-xs text-gray-500">командный</p>
    </div>
</div>
          {/* Статистика иерархии */}
          {bonuses.length > 0 && (
            <div className="mt-4">
              <HierarchyStats 
                purchase={purchase}
                bonuses={bonuses}
                teamPercent={teamPercent}
              />
            </div>
          )}
        </div>

        {/* Заголовки колонок */}
        <div className="bg-white border-b border-gray-200 sticky mt-5 top-0 z-10">
          <div className="px-4 md:px-6 py-2">
            <div className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="flex-1">Участник</div>
              <div className="hidden sm:block w-16 text-center mx-2">%</div>
              <div className="hidden md:block w-28 text-right mr-4">Вклад</div>
              <div className="w-24 md:w-32 text-right mr-2">Бонус</div>
              <div className="w-6"></div>
            </div>
          </div>
        </div>

        {/* Список участников с иерархией */}
        <div className="bg-white">
          {buildHierarchy()}
        </div>

        {/* Статус расчетов */}
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="px-4 md:px-6 py-3">
            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  purchase.bonuses_calculated ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <span className={`${
                  purchase.bonuses_calculated ? 'text-green-700' : 'text-gray-500'
                }`}>
                  Рассчитаны
                  {purchase.bonuses_calculated_at && (
                    <span className="ml-1 text-gray-400 hidden md:inline">
                      ({new Date(purchase.bonuses_calculated_at).toLocaleDateString('ru-RU')})
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  purchase.bonuses_approved ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <span className={`${
                  purchase.bonuses_approved ? 'text-green-700' : 'text-gray-500'
                }`}>
                  Одобрены
                  {purchase.bonuses_approved_at && (
                    <span className="ml-1 text-gray-400 hidden md:inline">
                      ({new Date(purchase.bonuses_approved_at).toLocaleDateString('ru-RU')})
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-1 text-gray-500 ml-auto">
                <Clock className="w-3 h-3" />
                Обновлено: {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Симулятор */}
      {showSimulator && (
        <BonusSimulator 
          purchase={purchase}
          onClose={() => setShowSimulator(false)}
        />
      )}
    </div>
  );
}