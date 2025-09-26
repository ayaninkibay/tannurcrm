'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/context/UserContext';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { teamPurchaseBonusService } from '@/lib/team-purchase/TeamPurchaseBonusService';
import {
  Calculator,
  CheckCircle,
  Loader2,
  Users,
  Award,
  Coins,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Info,
  AlertCircle,
  Eye,
  EyeOff,
  TrendingUp,
  RefreshCw,
  UserX,
  DollarSign,
  Lock,
  AlertTriangle
} from 'lucide-react';

type TurnoverData = {
  user_id: string;
  personal_turnover: number;
  bonus_percent: number;
};

type UserData = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  parent_id?: string;
};

type BonusDetail = {
  id: string;
  beneficiary_id: string;
  contributor_id: string;
  hierarchy_level: number;
  contribution_amount: number;
  beneficiary_percent: number;
  contributor_percent: number;
  received_percent: number;
  bonus_amount: number;
  calculation_details: any;
  updated_at: string;
  balance_transaction_id?: string | null;
  beneficiary: UserData & {
    current_turnover?: number;
    current_percent?: number;
  };
  contributor: UserData & {
    current_turnover?: number;
    current_percent?: number;
  };
};

type TeamMember = {
  id: string;
  user_id: string;
  contribution_actual: number;
  status: string;
  user: UserData & {
    personal_turnover?: number;
    bonus_percent?: number;
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
  bonuses_transferred_to_balance: boolean;
  bonuses_transferred_at: string | null;
  initiator: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  members: TeamMember[];
};

// Модальное окно подтверждения выплаты
const PayoutConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  totalAmount,
  recipientsCount
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  totalAmount: number;
  recipientsCount: number;
}) => {
  const [confirmText, setConfirmText] = useState('');
  const isConfirmed = confirmText === 'ВЫПЛАТИТЬ';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Подтверждение выплаты бонусов
            </h3>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="font-semibold text-red-800 mb-2">
                ⚠️ ВНИМАНИЕ! Это необратимое действие
              </p>
              <ul className="space-y-1 text-red-700 text-sm">
                <li>• Будет выплачено: <span className="font-bold">{totalAmount.toLocaleString()} ₸</span></li>
                <li>• Получателей: <span className="font-bold">{recipientsCount}</span></li>
                <li>• Деньги будут зачислены на балансы</li>
                <li>• После выплаты изменения невозможны</li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Для подтверждения введите <span className="font-bold text-gray-900">ВЫПЛАТИТЬ</span> в поле ниже:
              </p>
              
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Введите ВЫПЛАТИТЬ"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            disabled={!isConfirmed}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors font-semibold ${
              isConfirmed
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Выплатить
          </button>
        </div>
      </div>
    </div>
  );
};

// Модальное окно финализации
const FinalizationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  purchaseTitle 
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  purchaseTitle: string;
}) => {
  if (!isOpen) return null;

  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysRemaining = Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Подтверждение финализации
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                Вы уверены, что хотите финализировать бонусы для закупки 
                <span className="font-semibold text-gray-900"> "{purchaseTitle}"</span>?
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="font-semibold text-yellow-800 mb-1">
                  ⚠️ Важная информация:
                </p>
                <ul className="space-y-1 text-yellow-700 text-xs">
                  <li>• До конца месяца осталось <span className="font-bold">{daysRemaining} {daysRemaining === 1 ? 'день' : daysRemaining < 5 ? 'дня' : 'дней'}</span></li>
                  <li>• После финализации бонусы будут зафиксированы</li>
                  <li>• Изменения в товарообороте НЕ повлияют на финальные суммы</li>
                  <li>• Preview будет продолжать обновляться для информации</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="font-semibold text-blue-800 mb-1">
                  💡 Рекомендация:
                </p>
                <p className="text-blue-700 text-xs">
                  Финализацию лучше проводить в последние дни месяца, когда товарооборот уже сформирован.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-[#E89380] text-white rounded-lg hover:bg-[#E89380]/90 transition-colors font-semibold"
          >
            Финализировать
          </button>
        </div>
      </div>
    </div>
  );
};

// Компонент для отображения после выплаты
const PaymentCompletedPanel = ({ 
  purchase,
  bonuses,
  totalAmount,
  recipientsCount
}: {
  purchase: TeamPurchaseDetail;
  bonuses: BonusDetail[];
  totalAmount: number;
  recipientsCount: number;
}) => {
  return (
    <div className="space-y-4 mt-4">
      <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-green-900 mb-1">
              Бонусы выплачены
            </h4>
            <p className="text-green-800 text-sm mb-3">
              Все бонусы успешно начислены на балансы пользователей
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="bg-white/50 rounded p-2">
                <div className="text-green-600 text-xs">Выплачено</div>
                <div className="font-bold text-green-900">{totalAmount.toLocaleString()} ₸</div>
              </div>
              <div className="bg-white/50 rounded p-2">
                <div className="text-green-600 text-xs">Получателей</div>
                <div className="font-bold text-green-900">{recipientsCount}</div>
              </div>
              <div className="bg-white/50 rounded p-2">
                <div className="text-green-600 text-xs">Дата выплаты</div>
                <div className="font-bold text-green-900">
                  {purchase.bonuses_transferred_at 
                    ? new Date(purchase.bonuses_transferred_at).toLocaleDateString('ru-RU')
                    : new Date().toLocaleDateString('ru-RU')}
                </div>
              </div>
              <div className="bg-white/50 rounded p-2">
                <div className="text-green-600 text-xs">Статус</div>
                <div className="font-bold text-green-900">Завершено</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Lock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-yellow-900 mb-1">
              Изменения заблокированы
            </p>
            <p className="text-yellow-700 text-sm">
              После выплаты бонусов любые изменения невозможны. Данные зафиксированы и защищены от редактирования.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Панель управления после финализации
const FinalizedControls = ({
  purchase,
  bonuses,
  onApprove,
  onPayout,
  isApproving,
  isPayingOut,
  hasPayments
}: {
  purchase: TeamPurchaseDetail;
  bonuses: BonusDetail[];
  onApprove: () => void;
  onPayout: () => void;
  isApproving: boolean;
  isPayingOut: boolean;
  hasPayments: boolean;
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  if (hasPayments) {
    return (
      <PaymentCompletedPanel
        purchase={purchase}
        bonuses={bonuses}
        totalAmount={bonuses.reduce((sum, b) => sum + b.bonus_amount, 0)}
        recipientsCount={new Set(bonuses.map(b => b.beneficiary_id)).size}
      />
    );
  }
  
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Бонусы финализированы
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-green-700">Месяц:</span>
              <p className="font-semibold text-green-900">
                {new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div>
              <span className="text-green-700">Сумма к выплате:</span>
              <p className="font-semibold text-green-900">
                {bonuses.reduce((sum, b) => sum + b.bonus_amount, 0).toLocaleString()} ₸
              </p>
            </div>
            <div>
              <span className="text-green-700">Получателей:</span>
              <p className="font-semibold text-green-900">
                {new Set(bonuses.map(b => b.beneficiary_id)).size}
              </p>
            </div>
            <div>
              <span className="text-green-700">Статус:</span>
              <p className="font-semibold text-green-900">
                {purchase.bonuses_approved ? 'Одобрено' : 'Ожидает одобрения'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {!purchase.bonuses_approved && (
            <button
              onClick={onApprove}
              disabled={isApproving}
              className="px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
            >
              {isApproving ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <CheckCircle className="w-3 h-3" />
              )}
              Одобрить
            </button>
          )}
          
          {purchase.bonuses_approved && (
            <button
              onClick={onPayout}
              disabled={isPayingOut}
              className="px-3 py-1.5 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1"
            >
              {isPayingOut ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <DollarSign className="w-3 h-3" />
              )}
              Выплатить
            </button>
          )}
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 flex items-center gap-1"
          >
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Детали
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-green-200">
          <div className="space-y-2">
            <h5 className="font-semibold text-green-900 text-sm mb-2">История действий:</h5>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-3 h-3" />
                <span>Финализировано: {new Date().toLocaleDateString('ru-RU')}</span>
              </div>
              {purchase.bonuses_approved_at && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-3 h-3" />
                  <span>Одобрено: {new Date(purchase.bonuses_approved_at).toLocaleDateString('ru-RU')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Утилиты
const getInitials = (firstName: string, lastName: string): string => {
  if (!firstName || !lastName) return 'UN';
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

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

// Компонент для неучаствующего родителя
const NonParticipantItem = ({ 
  user,
  level,
  children
}: {
  user: UserData;
  level: number;
  children?: React.ReactNode;
}) => {
  const avatarColor = getAvatarColor(`${user.first_name} ${user.last_name}`);
  
  return (
    <>
      <div className="border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center py-2 px-4 md:px-6 opacity-60">
          <div style={{ marginLeft: `${level * 24}px` }} className="flex items-center flex-1 min-w-0 relative">
            {level > 0 && (
              <>
                <div className="absolute -left-3 top-1/2 w-3 h-px bg-gray-300"></div>
                <div className="absolute -left-3 -top-3 w-px h-[calc(50%+12px)] bg-gray-300"></div>
              </>
            )}

            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs mr-3 flex-shrink-0 relative"
              style={{ backgroundColor: avatarColor }}
            >
              {getInitials(user.first_name, user.last_name)}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                <UserX className="w-2.5 h-2.5 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-600 text-sm">
                  {user.first_name} {user.last_name}
                </h3>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                  Не участвует
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 italic mr-8">
            Промежуточное звено
          </div>
        </div>
      </div>
      {children}
    </>
  );
};

// Детальное объяснение бонуса
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
    if (isPersonal) {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-gray-600">Вклад участника:</div>
            <div className="font-semibold">{bonus.contribution_amount.toLocaleString()} ₸</div>
            
            <div className="text-gray-600">Процент участника:</div>
            <div className="font-bold text-green-600">{bonus.beneficiary_percent}%</div>
            
            <div className="col-span-2 border-t pt-2 mt-2">
              <div className="font-mono text-xs text-gray-600">
                {bonus.beneficiary_percent}% × {bonus.contribution_amount.toLocaleString()}₸
              </div>
              <div className="text-sm">
                <span className="font-semibold">Личный бонус:</span>{' '}
                <span className="font-bold text-[#E89380]">
                  {bonus.bonus_amount.toLocaleString()} ₸
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-gray-600">Вклад участника:</div>
          <div>
            <span className="font-semibold text-blue-700">{contributorName}</span>
            <div className="font-semibold">{bonus.contribution_amount.toLocaleString()} ₸</div>
          </div>
          
          <div className="text-gray-600">Мой процент:</div>
          <div className="font-semibold text-green-600">{bonus.beneficiary_percent}%</div>
          
          <div className="text-gray-600">Процент {bonus.contributor.first_name}:</div>
          <div className="font-semibold">{bonus.contributor_percent}%</div>
          
          <div className="text-gray-600">Получаемая разница:</div>
          <div className="font-bold text-green-600">{bonus.received_percent}%</div>
          
          <div className="col-span-2 border-t pt-2 mt-2">
            <div className="font-mono text-xs text-gray-600">
              ({bonus.beneficiary_percent}% - {bonus.contributor_percent}%) × 
              <span className="text-blue-700 font-semibold"> {bonus.contribution_amount.toLocaleString()}₸</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Дифференциальный бонус: {bonus.received_percent}% × {bonus.contribution_amount.toLocaleString()}₸
            </div>
            <div className="text-sm mt-1">
              <span className="font-semibold">Дифференциальный бонус:</span>{' '}
              <span className="font-bold text-[#E89380]">
                {bonus.bonus_amount.toLocaleString()} ₸
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <span className="font-semibold text-blue-700">{contributorName}:</span>{' '}
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

// Статистика иерархии
const HierarchyStats = ({ purchase, bonuses }: { purchase: TeamPurchaseDetail; bonuses: BonusDetail[] }) => {
  const totalDistributed = bonuses.reduce((sum, b) => sum + b.bonus_amount, 0);
  const maxLevel = Math.max(...bonuses.map(b => b.hierarchy_level), 0);
  
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-gray-600" />
        Анализ распределения бонусов
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <div className="text-xs text-gray-600 mb-1">Уровней иерархии</div>
          <div className="font-bold text-lg text-gray-900">{maxLevel + 1}</div>
        </div>
        <div>
          <div className="text-xs text-gray-600 mb-1">Всего участников</div>
          <div className="font-bold text-lg text-gray-900">{purchase.members.length}</div>
        </div>
        <div>
          <div className="text-xs text-gray-600 mb-1">Распределено бонусов</div>
          <div className="font-bold text-lg text-[#E89380]">
            {totalDistributed.toLocaleString()} ₸
          </div>
        </div>
      </div>
      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
        <Info className="w-3 h-3 inline mr-1" />
        Бонусы рассчитаны на основе текущего товарооборота из user_turnover_current
      </div>
    </div>
  );
};

// Компонент участника
const TeamMemberItem = React.memo(({
  member,
  bonuses,
  purchase,
  level = 0,
  isExpanded,
  onToggle,
  showFormulas,
  children,
  isOrganizer,
  turnoverMap,
  allUsersMap
}: {
  member: TeamMember;
  bonuses: BonusDetail[];
  purchase: TeamPurchaseDetail;
  level?: number;
  isExpanded: boolean;
  onToggle: () => void;
  showFormulas: boolean;
  children?: React.ReactNode;
  isOrganizer: boolean;
  turnoverMap: Map<string, TurnoverData>;
  allUsersMap: Map<string, UserData>;
}) => {
  const user = member.user;
  const contribution = member.contribution_actual;
  const avatarColor = getAvatarColor(`${user.first_name} ${user.last_name}`);
  
  const userBonuses = bonuses.filter((b: BonusDetail) => b.beneficiary_id === user.id);
  const personalBonus = userBonuses.find((b: BonusDetail) => b.contributor_id === user.id);
  const differentialBonuses = userBonuses.filter((b: BonusDetail) => b.contributor_id !== user.id);
  const totalBonus = userBonuses.reduce((sum, b) => sum + b.bonus_amount, 0);

  const turnoverData = turnoverMap.get(user.id);
  const memberPercent = turnoverData?.bonus_percent || personalBonus?.beneficiary_percent || 0;
  const memberTurnover = turnoverData?.personal_turnover || 0;

  const getAllDescendants = (userId: string): TeamMember[] => {
    const descendants: TeamMember[] = [];
    
    purchase.members.forEach(m => {
      let currentId = m.user_id;
      let currentParentId = m.user.parent_id;
      
      while (currentParentId) {
        if (currentParentId === userId) {
          descendants.push(m);
          break;
        }
        
        const parent = purchase.members.find(p => p.user_id === currentParentId);
        if (parent) {
          currentParentId = parent.user.parent_id;
        } else {
          const parentUser = allUsersMap.get(currentParentId);
          if (parentUser) {
            currentParentId = parentUser.parent_id;
          } else {
            break;
          }
        }
      }
    });
    
    return descendants;
  };

  const allDescendants = getAllDescendants(user.id);

  return (
    <>
      <div className="group border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 bg-white">
        <div className="flex items-center py-3 px-4 md:px-6">
          <div style={{ marginLeft: `${level * 24}px` }} className="flex items-center flex-1 min-w-0 relative">
            {level > 0 && (
              <>
                <div className="absolute -left-3 top-1/2 w-3 h-px bg-gray-300"></div>
                <div className="absolute -left-3 -top-3 w-px h-[calc(50%+12px)] bg-gray-300"></div>
              </>
            )}

            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs mr-3 flex-shrink-0"
              style={{ backgroundColor: avatarColor }}
            >
              {getInitials(user.first_name, user.last_name)}
            </div>

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
                  Товарооборот: {memberTurnover.toLocaleString()} ₸
                </span>
                <span className="md:hidden">
                  {(memberTurnover / 1000000).toFixed(1)}М ₸
                </span>
              </div>
            </div>
          </div>

          <div className="hidden sm:block w-16 text-center mx-2">
            <div className="text-lg font-bold text-gray-900">{memberPercent}%</div>
            <div className="text-xs text-gray-500">бонус</div>
          </div>

          <div className="hidden md:block w-28 text-right mr-4">
            <span className="text-sm font-semibold text-gray-900">
              {contribution.toLocaleString()} ₸
            </span>
          </div>

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

        {isExpanded && (
          <div className="px-4 md:px-6 pb-3" style={{ marginLeft: `${level * 24}px` }}>
            <div className="ml-12 space-y-2">
              {personalBonus && (
                <DetailedBonusExplanation 
                  bonus={personalBonus} 
                  isPersonal={true}
                  showFormulas={showFormulas}
                />
              )}
              
              {differentialBonuses.map((bonus) => (
                <DetailedBonusExplanation 
                  key={bonus.id} 
                  bonus={bonus} 
                  isPersonal={false}
                  showFormulas={showFormulas}
                />
              ))}

              {allDescendants.map(descendant => {
                const descendantTurnover = turnoverMap.get(descendant.user_id);
                const descendantPercent = descendantTurnover?.bonus_percent || 0;
                
                const didReceive = differentialBonuses.some(b => b.contributor_id === descendant.user_id);
                
                if (!didReceive && descendant.contribution_actual > 0 && memberPercent > 0) {
                  let reason = '';
                  if (descendantPercent >= memberPercent) {
                    reason = `Личный процент ${memberPercent}% ≤ ${descendantPercent}% участника`;
                  }
                  
                  if (reason) {
                    return (
                      <div key={descendant.user_id} className="bg-orange-50 border border-orange-200 rounded px-3 py-2 text-xs">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-3 h-3 text-orange-500 flex-shrink-0 mt-0.5" />
                          <div className="text-orange-700">
                            <span>
                              Не получает от <span className="font-semibold">
                                {descendant.user.first_name} {descendant.user.last_name}
                              </span>:
                            </span>{' '}
                            <span>{reason}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                }
                return null;
              })}

              {personalBonus === undefined && contribution > 0 && memberPercent === 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-xs text-gray-600">
                  <Info className="w-3 h-3 inline mr-1" />
                  Нет бонуса: недостаточный товарооборот для получения процента
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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
  const [turnoverMap, setTurnoverMap] = useState<Map<string, TurnoverData>>(new Map());
  const [allUsersMap, setAllUsersMap] = useState<Map<string, UserData>>(new Map());
  const [isPreview, setIsPreview] = useState(true);
  const [isFinalized, setIsFinalized] = useState(false);
  const [hasPayments, setHasPayments] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isPayingOut, setIsPayingOut] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set<string>());
  const [showFormulas, setShowFormulas] = useState(false);
  const [showFinalizationModal, setShowFinalizationModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

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
        .select(`
          *,
          user:users!team_purchase_members_user_id_fkey (
            id, first_name, last_name, email, parent_id
          )
        `)
        .eq('team_purchase_id', purchaseId)
        .eq('status', 'purchased');

      if (membersError) throw membersError;

      const allUserIds = new Set<string>();
      (membersData || []).forEach(m => {
        allUserIds.add(m.user_id);
        if (m.user.parent_id) allUserIds.add(m.user.parent_id);
      });

      const { data: allUsers } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, parent_id')
        .in('id', Array.from(allUserIds));

      const usersMap = new Map<string, UserData>();
      (allUsers || []).forEach(u => usersMap.set(u.id, u));
      setAllUsersMap(usersMap);

      const { data: turnoverData } = await supabase
        .from('user_turnover_current')
        .select('user_id, personal_turnover, bonus_percent');

      const turnoverMapData = new Map<string, TurnoverData>();
      (turnoverData || []).forEach(t => {
        turnoverMapData.set(t.user_id, t);
      });
      setTurnoverMap(turnoverMapData);

      const enhancedMembers = (membersData || []).map(member => {
        const turnover = turnoverMapData.get(member.user_id);
        return {
          ...member,
          user: {
            ...member.user,
            personal_turnover: turnover?.personal_turnover || 0,
            bonus_percent: turnover?.bonus_percent || 0
          }
        };
      });

      setPurchase({
        ...purchaseData,
        members: enhancedMembers
      });

      setHasPayments(purchaseData.bonuses_transferred_to_balance || false);

      await loadBonuses();
      await checkFinalizationStatus();
    } catch (error) {
      console.error('Error loading purchase details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [purchaseId]);

  const loadBonuses = async () => {
    try {
      const finalStats = await teamPurchaseBonusService.getFinalStats(purchaseId);
      
      if (finalStats.data?.transferredCount > 0) {
        setHasPayments(true);
        const result = await teamPurchaseBonusService.getFinalBonuses(purchaseId);
        if (result.success) {
          setBonuses(result.data);
          setIsPreview(false);
        }
      } else if (finalStats.data?.isFinalized) {
        const result = await teamPurchaseBonusService.getFinalBonuses(purchaseId);
        if (result.success) {
          setBonuses(result.data);
          setIsPreview(false);
        }
      } else {
        const result = await teamPurchaseBonusService.getPreviewBonuses(purchaseId);
        if (result.success) {
          setBonuses(result.data);
          setIsPreview(true);
        }
      }
    } catch (error) {
      console.error('Error loading bonuses:', error);
    }
  };

  const checkFinalizationStatus = async () => {
    try {
      const stats = await teamPurchaseBonusService.getFinalStats(purchaseId);
      setIsFinalized(stats.data?.isFinalized || false);
      setHasPayments(stats.data?.transferredCount > 0);
    } catch (error) {
      console.error('Error checking finalization status:', error);
    }
  };

  useEffect(() => {
    if (purchaseId) {
      loadPurchaseDetails();
    }
  }, [purchaseId, loadPurchaseDetails]);

  const updatePreview = async () => {
    try {
      setIsCalculating(true);
      const result = await teamPurchaseBonusService.calculatePreviewBonuses(purchaseId);
      
      if (result.success) {
        alert('✅ Preview бонусов обновлен!');
        await loadBonuses();
      } else {
        alert(`❌ Ошибка: ${result.error || 'Не удалось обновить preview'}`);
      }
    } catch (error) {
      console.error('Error updating preview:', error);
      alert('❌ Ошибка при обновлении preview');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleFinalizationClick = () => {
    setShowFinalizationModal(true);
  };

  const finalizeBonuses = async () => {
    setShowFinalizationModal(false);
    try {
      setIsFinalizing(true);
      const result = await teamPurchaseBonusService.finalizeBonuses(purchaseId);
      
      if (result.success) {
        const successMessage = `✅ Бонусы успешно финализированы!\nСумма: ${result.total_amount?.toLocaleString()} ₸\nКоличество: ${result.count} записей`;
        alert(successMessage);
        setIsFinalized(true);
        await checkFinalizationStatus();
      } else {
        alert(`❌ Ошибка: ${result.error || 'Не удалось финализировать бонусы'}`);
      }
    } catch (error) {
      console.error('Error finalizing bonuses:', error);
      alert('❌ Произошла ошибка при финализации');
    } finally {
      setIsFinalizing(false);
    }
  };

  const approveBonuses = async () => {
    if (!confirm('Вы уверены, что хотите одобрить бонусы к выплате?')) return;
    
    try {
      setIsApproving(true);
      const result = await teamPurchaseBonusService.approveFinalBonuses(purchaseId, profile?.id);
      
      if (result.success) {
        alert(`✅ Одобрено ${result.approved_count} бонусов`);
        await loadPurchaseDetails();
      } else {
        alert(`❌ Ошибка: ${result.error}`);
      }
    } catch (error) {
      alert('❌ Ошибка при одобрении');
    } finally {
      setIsApproving(false);
    }
  };

  const handlePayoutClick = () => {
    setShowPayoutModal(true);
  };

  const payoutBonuses = async () => {
    setShowPayoutModal(false);
    try {
      setIsPayingOut(true);
      const result = await teamPurchaseBonusService.payoutFinalBonuses(purchaseId);
      
      if (result.success) {
        alert(`✅ Успешно начислено на баланс!\n${result.message}`);
        setHasPayments(true);
        await loadPurchaseDetails();
        await loadBonuses();
      } else {
        alert(`❌ Ошибка: ${result.error}`);
      }
    } catch (error) {
      alert('❌ Ошибка при начислении на баланс');
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
    const organizer = purchase.members.find(m => m.user_id === purchase.initiator_id);
    if (!organizer) return null;

    const renderMemberWithChildren = (member: TeamMember, level = 0): React.ReactNode => {
      const directChildren = purchase.members.filter(m => m.user.parent_id === member.user_id);
      const isExpanded = expandedItems.has(member.user_id);
      const isOrganizer = member.user_id === purchase.initiator_id;
      
      const childrenByIntermediateParent = new Map<string | null, TeamMember[]>();
      
      purchase.members.forEach(m => {
        let currentParentId = m.user.parent_id;
        let immediateParentId = m.user.parent_id;
        
        while (currentParentId) {
          if (currentParentId === member.user_id) {
            if (immediateParentId !== member.user_id && !membersMap.has(immediateParentId)) {
              if (!childrenByIntermediateParent.has(immediateParentId)) {
                childrenByIntermediateParent.set(immediateParentId, []);
              }
              childrenByIntermediateParent.get(immediateParentId)!.push(m);
            } else if (immediateParentId === member.user_id) {
              if (!childrenByIntermediateParent.has(null)) {
                childrenByIntermediateParent.set(null, []);
              }
              childrenByIntermediateParent.get(null)!.push(m);
            }
            break;
          }
          
          const parent = membersMap.get(currentParentId);
          if (parent) {
            currentParentId = parent.user.parent_id;
          } else {
            const parentUser = allUsersMap.get(currentParentId);
            if (parentUser) {
              currentParentId = parentUser.parent_id;
            } else {
              break;
            }
          }
        }
      });

      return (
        <TeamMemberItem
          key={member.user_id}
          member={member}
          bonuses={bonuses}
          purchase={purchase}
          level={level}
          isExpanded={isExpanded}
          onToggle={() => toggleExpanded(member.user_id)}
          showFormulas={showFormulas}
          isOrganizer={isOrganizer}
          turnoverMap={turnoverMap}
          allUsersMap={allUsersMap}
        >
          {childrenByIntermediateParent.get(null)?.map(child => 
            renderMemberWithChildren(child, level + 1)
          )}
          
          {Array.from(childrenByIntermediateParent.entries()).map(([intermediateId, children]) => {
            if (intermediateId === null) return null;
            
            const intermediateUser = allUsersMap.get(intermediateId);
            if (!intermediateUser) return null;
            
            return (
              <NonParticipantItem 
                key={intermediateId} 
                user={intermediateUser} 
                level={level + 1}
              >
                {children.map(child => 
                  renderMemberWithChildren(child, level + 2)
                )}
              </NonParticipantItem>
            );
          })}
        </TeamMemberItem>
      );
    };

    return renderMemberWithChildren(organizer, 0);
  }, [purchase, bonuses, expandedItems, showFormulas, turnoverMap, allUsersMap]);

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
    <div className="min-h-screen">
      <div className="mx-auto">
        <header className="mb-6">
          <MoreHeaderAD title={'Просмотр командной закупки'} showBackButton={true} />
        </header>
        
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

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowFormulas(!showFormulas)}
                className="px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
              >
                {showFormulas ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="hidden sm:inline">Формулы</span>
              </button>

              {isAdmin && !hasPayments && (
                <>
                  <button
                    onClick={updatePreview}
                    disabled={isCalculating}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 text-sm"
                  >
                    {isCalculating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">Обновить Preview</span>
                  </button>

                  {!isFinalized && (
                    <button
                      onClick={handleFinalizationClick}
                      disabled={isFinalizing}
                      className="px-3 py-2 bg-[#E89380] text-white rounded-lg hover:bg-[#E89380]/90 disabled:opacity-50 flex items-center gap-2 text-sm"
                    >
                      {isFinalizing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline">Финализировать</span>
                    </button>
                  )}
                </>
              )}
              
              {hasPayments && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-500 rounded-lg">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm">Изменения заблокированы</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="w-4 h-4 text-gray-500" />
                <span className="text-xs md:text-sm font-medium text-gray-600">Общая сумма</span>
              </div>
              <p className="text-lg md:text-xl font-bold text-gray-900">
                {purchase.paid_amount.toLocaleString()} ₸
              </p>
            </div>

            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-xs md:text-sm font-medium text-gray-600">Участников</span>
              </div>
              <p className="text-lg md:text-xl font-bold text-gray-900">{purchase.members.length}</p>
            </div>

            <div className="bg-[#E89380]/10 rounded-lg p-3 border border-[#E89380]/30">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-[#E89380]" />
                <span className="text-xs md:text-sm font-medium text-gray-600">Всего бонусов</span>
              </div>
              <p className="text-lg md:text-xl font-bold text-[#E89380]">
                {totalBonuses.toLocaleString()} ₸
              </p>
            </div>
          </div>

          {bonuses.length > 0 && (
            <>
              {!hasPayments && (
                <div className={`${isFinalized ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-3 mt-4`}>
                  <div className="flex items-start gap-2">
                    <Info className={`w-4 h-4 ${isFinalized ? 'text-green-600' : 'text-blue-600'} mt-0.5`} />
                    <div className="text-sm">
                      <p className={`font-semibold ${isFinalized ? 'text-green-900' : 'text-blue-900'} mb-1`}>
                        {isFinalized ? 'Финальный расчет' : 'Предварительный расчет (Preview)'}
                      </p>
                      <p className={`${isFinalized ? 'text-green-700' : 'text-blue-700'} text-xs`}>
                        Проценты основаны на текущем товарообороте из user_turnover_current.
                        {!isFinalized && ' Данные обновляются автоматически.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isFinalized && (
                <FinalizedControls
                  purchase={purchase}
                  bonuses={bonuses}
                  onApprove={approveBonuses}
                  onPayout={handlePayoutClick}
                  isApproving={isApproving}
                  isPayingOut={isPayingOut}
                  hasPayments={hasPayments}
                />
              )}
              
              <div className="mt-4">
                <HierarchyStats purchase={purchase} bonuses={bonuses} />
              </div>
            </>
          )}
        </div>

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

        <div className="bg-white">
          {buildHierarchy()}
        </div>

        <div className="bg-gray-50 border-t border-gray-200">
          <div className="px-4 md:px-6 py-3">
            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${hasPayments ? 'bg-green-500' : (isFinalized ? 'bg-green-500' : 'bg-blue-500')}`}></div>
                <span className={`${hasPayments ? 'text-green-700' : (isFinalized ? 'text-green-700' : 'text-blue-700')}`}>
                  {hasPayments ? 'Выплачено' : (isFinalized ? 'Финализировано' : 'Preview режим')}
                </span>
              </div>

              {hasPayments && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-green-700 font-semibold">
                    Деньги на балансах
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1 text-gray-500 ml-auto">
                <Clock className="w-3 h-3" />
                Обновлено: {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <FinalizationModal
        isOpen={showFinalizationModal}
        onClose={() => setShowFinalizationModal(false)}
        onConfirm={finalizeBonuses}
        purchaseTitle={purchase?.title || ''}
      />

      <PayoutConfirmationModal
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        onConfirm={payoutBonuses}
        totalAmount={totalBonuses}
        recipientsCount={new Set(bonuses.map(b => b.beneficiary_id)).size}
      />
    </div>
  );
}