'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/context/UserContext';
import { teamPurchaseBonusService } from '@/lib/team-purchase/TeamPurchaseBonusService';
import { 
  ArrowLeft,
  Users,
  TrendingUp,
  Calculator,
  CheckCircle,
  DollarSign,
  Clock,
  AlertCircle,
  Loader2,
  Download,
  Eye
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
    };
  }>;
};

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

  useEffect(() => {
    if (purchaseId) {
      loadPurchaseDetails();
    }
  }, [purchaseId]);

  const loadPurchaseDetails = async () => {
    try {
      setIsLoading(true);

      // Загружаем данные закупки с исправленным запросом
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('team_purchases')
        .select(`
          *,
          initiator:users!team_purchases_initiator_id_fkey (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('id', purchaseId)
        .single();

      if (purchaseError) {
        console.error('Purchase error:', purchaseError);
        throw purchaseError;
      }

      // Загружаем участников с исправленным запросом
      const { data: membersData, error: membersError } = await supabase
        .from('team_purchase_members')
        .select(`
          *,
          user:users!team_purchase_members_user_id_fkey (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('team_purchase_id', purchaseId)
        .eq('status', 'purchased');

      if (membersError) {
        console.error('Members error:', membersError);
        throw membersError;
      }

      setPurchase({
        ...purchaseData,
        members: membersData || []
      });

      // Если бонусы рассчитаны, загружаем их
      if (purchaseData.bonuses_calculated) {
        await loadBonuses();
      }
    } catch (error) {
      console.error('Error loading purchase details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBonuses = async () => {
    try {
      const { data: bonusesData, error: bonusesError } = await supabase
        .from('team_purchase_bonuses')
        .select(`
          *,
          beneficiary:users!team_purchase_bonuses_beneficiary_id_fkey (
            id,
            first_name,
            last_name,
            email,
            personal_turnover
          ),
          contributor:users!team_purchase_bonuses_contributor_id_fkey (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('team_purchase_id', purchaseId)
        .order('hierarchy_level', { ascending: true });

      if (bonusesError) {
        console.error('Bonuses error:', bonusesError);
        throw bonusesError;
      }
      
      setBonuses(bonusesData || []);
    } catch (error) {
      console.error('Error loading bonuses:', error);
    }
  };

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
      console.error('Error calculating bonuses:', error);
      alert('Ошибка при расчете бонусов');
    } finally {
      setIsCalculating(false);
    }
  };

  const approveBonuses = async () => {
    if (!profile?.id) {
      alert('Необходима авторизация');
      return;
    }
    
    try {
      setIsApproving(true);
      
      const result = await teamPurchaseBonusService.approveBonuses(purchaseId, profile.id);

      if (result?.success) {
        alert(`Бонусы одобрены! Количество: ${result.approved_count}, Сумма: ${result.total_amount} ₸`);
        await loadPurchaseDetails();
      } else {
        alert(result?.error || 'Ошибка при одобрении бонусов');
      }
    } catch (error) {
      console.error('Error approving bonuses:', error);
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
        alert(`Бонусы выплачены! Количество: ${result.paid_count}, Сумма: ${result.total_paid} ₸`);
        await loadPurchaseDetails();
      } else {
        alert(result?.error || 'Ошибка при выплате бонусов');
      }
    } catch (error) {
      console.error('Error paying out bonuses:', error);
      alert('Ошибка при выплате бонусов');
    } finally {
      setIsPayingOut(false);
    }
  };

  const getHierarchyBadge = (level: number) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800'
    ];
    
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${colors[level % colors.length]}`}>
        Уровень {level + 1}
      </span>
    );
  };

  const groupBonusesByBeneficiary = () => {
    const grouped: { [key: string]: { user: any; bonuses: BonusDetail[]; total: number } } = {};
    
    bonuses.forEach(bonus => {
      const key = bonus.beneficiary_id;
      if (!grouped[key]) {
        grouped[key] = {
          user: bonus.beneficiary,
          bonuses: [],
          total: 0
        };
      }
      grouped[key].bonuses.push(bonus);
      grouped[key].total += bonus.bonus_amount;
    });
    
    return Object.values(grouped).sort((a, b) => b.total - a.total);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Закупка не найдена</p>
        </div>
      </div>
    );
  }

  const totalBonuses = bonuses.reduce((sum, b) => sum + b.bonus_amount, 0);
  const groupedBonuses = groupBonusesByBeneficiary();

  // Проверяем права администратора
  const isAdmin = profile?.role === 'admin';
  const canCalculate = isAdmin && purchase.status === 'completed' && !purchase.bonuses_calculated;
  const canApprove = isAdmin && purchase.bonuses_calculated && !purchase.bonuses_approved;
  const canPayout = isAdmin && purchase.bonuses_approved && purchase.status === 'completed';

  return (
    <div className="w-full h-full p-2 md:p-4 lg:p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Назад</span>
          </button>
          
          {isAdmin && (
            <div className="flex items-center gap-3">
              {canCalculate && (
                <button
                  onClick={calculateBonuses}
                  disabled={isCalculating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isCalculating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Calculator className="w-4 h-4" />
                  )}
                  Рассчитать бонусы
                </button>
              )}
              
              {canApprove && (
                <button
                  onClick={approveBonuses}
                  disabled={isApproving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isApproving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Одобрить бонусы
                </button>
              )}
              
              {canPayout && (
                <button
                  onClick={payoutBonuses}
                  disabled={isPayingOut}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isPayingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <DollarSign className="w-4 h-4" />
                  )}
                  Выплатить бонусы
                </button>
              )}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{purchase.title}</h1>
          {purchase.description && (
            <p className="text-gray-600 mb-4">{purchase.description}</p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Организатор</p>
              <p className="font-semibold">
                {purchase.initiator?.first_name} {purchase.initiator?.last_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Оплачено</p>
              <p className="font-semibold">{(purchase.paid_amount || 0).toLocaleString()} ₸</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Участников</p>
              <p className="font-semibold">{purchase.members.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Всего бонусов</p>
              <p className="font-semibold text-purple-600">
                {totalBonuses.toLocaleString()} ₸
              </p>
            </div>
          </div>

          {/* Статусы бонусов */}
          <div className="mt-4 flex gap-4">
            {purchase.bonuses_calculated && (
              <span className="text-sm text-green-600">
                ✓ Бонусы рассчитаны {purchase.bonuses_calculated_at && 
                  `(${new Date(purchase.bonuses_calculated_at).toLocaleDateString()})`}
              </span>
            )}
            {purchase.bonuses_approved && (
              <span className="text-sm text-green-600">
                ✓ Бонусы одобрены {purchase.bonuses_approved_at && 
                  `(${new Date(purchase.bonuses_approved_at).toLocaleDateString()})`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Участники закупки</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Участник
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Вклад
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Статус
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {purchase.members.map((member) => (
                <tr key={member.id}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">
                        {member.user?.first_name} {member.user?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{member.user?.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">
                      {member.contribution_actual.toLocaleString()} ₸
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-lg text-xs">
                      Оплачено
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bonuses by Beneficiary */}
      {bonuses.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Начисления по получателям</h2>
          <div className="space-y-4">
            {groupedBonuses.map(({ user, bonuses, total }) => (
              <div key={user?.id || Math.random()} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-lg">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">
                      {total.toLocaleString()} ₸
                    </p>
                    <p className="text-sm text-gray-500">
                      {bonuses.length} начислений
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {bonuses.map((bonus) => (
                    <div key={bonus.id} className="flex items-center justify-between py-2 border-t">
                      <div className="flex items-center gap-3">
                        {getHierarchyBadge(bonus.hierarchy_level)}
                        <div>
                          <p className="text-sm">
                            От: {bonus.contributor?.first_name} {bonus.contributor?.last_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {bonus.contribution_amount.toLocaleString()} ₸ × {bonus.received_percent}%
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold">
                        {bonus.bonus_amount.toLocaleString()} ₸
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Bonuses Table */}
      {bonuses.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Детальная таблица бонусов</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Получатель
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    От кого
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Уровень
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    База
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    % Получателя
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    % Плательщика
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Разница
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Бонус
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bonuses.map((bonus) => (
                  <tr key={bonus.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {bonus.beneficiary?.first_name} {bonus.beneficiary?.last_name}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{bonus.contributor?.first_name} {bonus.contributor?.last_name}</p>
                    </td>
                    <td className="px-4 py-3">
                      {getHierarchyBadge(bonus.hierarchy_level)}
                    </td>
                    <td className="px-4 py-3">
                      {bonus.contribution_amount.toLocaleString()} ₸
                    </td>
                    <td className="px-4 py-3">
                      {bonus.beneficiary_percent}%
                    </td>
                    <td className="px-4 py-3">
                      {bonus.contributor_percent}%
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-purple-600">
                        {bonus.received_percent}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">
                        {bonus.bonus_amount.toLocaleString()} ₸
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}