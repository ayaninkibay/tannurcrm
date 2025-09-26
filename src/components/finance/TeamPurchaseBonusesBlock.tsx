'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  Calculator,
  DollarSign,
  Loader2
} from 'lucide-react';

type TeamPurchaseWithBonuses = {
  id: string;
  title: string;
  initiator_id: string;
  target_amount: number;
  collected_amount: number;
  status: string;
  created_at: string;
  completed_at: string | null;
  bonuses_calculated: boolean;
  bonuses_calculated_at: string | null;
  bonuses_approved: boolean;
  bonuses_approved_at: string | null;
  initiator: {
    first_name: string;
    last_name: string;
    email: string;
  };
  total_bonus_amount?: number;
  bonus_count?: number;
  members_count?: number;
};

export default function TeamPurchaseBonusesBlock() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<TeamPurchaseWithBonuses[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [calculatingId, setCalculatingId] = useState<string | null>(null);

  useEffect(() => {
    loadTeamPurchases();
  }, []);

  const loadTeamPurchases = async () => {
    try {
      setIsLoading(true);
      
      // Загружаем командные закупки
      const { data: purchasesData, error } = await supabase
        .from('team_purchases')
        .select(`
          *,
          initiator:initiator_id (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .in('status', ['forming', 'active', 'completed', 'purchasing', 'confirming'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Для каждой закупки получаем статистику по бонусам
      const purchasesWithStats = await Promise.all(
        (purchasesData || []).map(async (purchase) => {
          // Получаем количество участников
          const { count: membersCount } = await supabase
            .from('team_purchase_members')
            .select('*', { count: 'exact', head: true })
            .eq('team_purchase_id', purchase.id)
            .eq('status', 'purchased');

          // Если бонусы рассчитаны, получаем статистику
          if (purchase.bonuses_calculated) {
            const { data: bonusStats } = await supabase
              .from('team_purchase_bonuses_final')
              .select('bonus_amount')
              .eq('team_purchase_id', purchase.id);

            const totalBonus = bonusStats?.reduce((sum, b) => sum + (b.bonus_amount || 0), 0) || 0;
            const bonusCount = bonusStats?.length || 0;

            return {
              ...purchase,
              total_bonus_amount: totalBonus,
              bonus_count: bonusCount,
              members_count: membersCount || 0
            };
          }

          return {
            ...purchase,
            members_count: membersCount || 0
          };
        })
      );

      setPurchases(purchasesWithStats);
    } catch (error) {
      console.error('Error loading team purchases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateBonuses = async (purchaseId: string) => {
    try {
      setCalculatingId(purchaseId);
      
      // Вызываем функцию расчета
      const { data, error } = await supabase
        .rpc('calculate_team_purchase_bonuses', {
          p_team_purchase_id: purchaseId
        });

      if (error) throw error;

      if (data?.success) {
        alert(`Бонусы рассчитаны! Всего: ${data.total_bonuses} ₸`);
        await loadTeamPurchases(); // Перезагружаем данные
      } else {
        alert(data?.error || 'Ошибка при расчете бонусов');
      }
    } catch (error) {
      console.error('Error calculating bonuses:', error);
      alert('Ошибка при расчете бонусов');
    } finally {
      setCalculatingId(null);
    }
  };

  const getStatusBadge = (purchase: TeamPurchaseWithBonuses) => {
    if (purchase.bonuses_approved) {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-medium flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Бонусы одобрены
        </span>
      );
    }
    if (purchase.bonuses_calculated) {
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-xs font-medium flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Ожидает одобрения
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-lg text-xs font-medium flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        Бонусы не рассчитаны
      </span>
    );
  };

  const navigateToDetails = (purchaseId: string) => {
    router.push(`/admin/finance/team-purchase/${purchaseId}`);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Командные закупки</h2>
              <p className="text-sm text-gray-500">Управление бонусами командных закупок</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Закупка
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Организатор
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Сумма
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Участники
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Бонусы
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {purchases.map((purchase) => (
              <tr 
                key={purchase.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {purchase.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(purchase.created_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm text-gray-900">
                      {purchase.initiator.first_name} {purchase.initiator.last_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {purchase.initiator.email}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {purchase.collected_amount?.toLocaleString()} ₸
                    </p>
                    <p className="text-xs text-gray-500">
                      Цель: {purchase.target_amount?.toLocaleString()} ₸
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {purchase.members_count}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {purchase.total_bonus_amount ? (
                    <div>
                      <p className="text-sm font-semibold text-purple-600">
                        {purchase.total_bonus_amount.toLocaleString()} ₸
                      </p>
                      <p className="text-xs text-gray-500">
                        {purchase.bonus_count} начислений
                      </p>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(purchase)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {!purchase.bonuses_calculated && purchase.status === 'completed' && (
                      <button
                        onClick={() => calculateBonuses(purchase.id)}
                        disabled={calculatingId === purchase.id}
                        className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors disabled:opacity-50"
                        title="Рассчитать бонусы"
                      >
                        {calculatingId === purchase.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Calculator className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => navigateToDetails(purchase.id)}
                      className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                      title="Подробнее"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {purchases.length === 0 && (
          <div className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Нет командных закупок</p>
          </div>
        )}
      </div>
    </div>
  );
}