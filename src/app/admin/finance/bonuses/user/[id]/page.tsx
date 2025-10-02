// src/app/admin/finance/bonuses/user/[id]/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, Users, TrendingUp, DollarSign, Calendar, 
  ChevronRight, ChevronDown, Package, CreditCard, UserCheck, 
  Layers, Activity, RefreshCw, AlertCircle, Info, History,
  CheckCircle, Clock, X
} from 'lucide-react';
import { BonusService } from '@/lib/bonuses/BonusService';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';

export default function AdminUserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = params.id as string;
  
  // Берем месяц из URL параметра или используем текущий
  const [selectedMonth, setSelectedMonth] = useState(
    searchParams.get('month') || BonusService.getCurrentMonth()
  );
  
  const [userDetails, setUserDetails] = useState<any>(null);
  const [monthlyBonuses, setMonthlyBonuses] = useState<any[]>([]);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [teamTree, setTeamTree] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [turnoverData, setTurnoverData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedNodes, setExpandedNodes] = useState(new Set<string>());
  const [isCalculating, setIsCalculating] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [monthStatus, setMonthStatus] = useState<any>(null);

  useEffect(() => {
    if (userId) {
      loadUserData();
      checkMonthStatus();
    }
  }, [userId, selectedMonth]);

  const checkMonthStatus = async () => {
    try {
      const status = await BonusService.getMonthStatus(selectedMonth);
      setMonthStatus(status);
    } catch (err) {
      console.error('Error checking month status:', err);
    }
  };

const loadUserData = async () => {
  try {
    setLoading(true);
    setError(null);

    // Загружаем основные данные
    const [details, orders, transactions, stats] = await Promise.all([
      BonusService.getUserBonusDetails(userId),
      BonusService.getUserOrderHistory(userId),
      BonusService.getUserTransactionHistory(userId),
      BonusService.getUserBonusStatistics(userId)
    ]);

    // Загружаем бонусы за выбранный месяц
    const bonuses = await BonusService.getMonthlyBonuses(selectedMonth, userId);
    
    // Загружаем данные товарооборота за месяц
    const allTurnoverData = await BonusService.getTurnoverForMonth(selectedMonth);
    const userTurnover = allTurnoverData.data.find(
      (u: any) => u.user_id === userId || u.users?.id === userId
    );

    // Строим дерево команды с данными за выбранный месяц
    const tree = await buildTeamTreeWithMonthData(userId, selectedMonth, allTurnoverData.data);

    setUserDetails(details);
    setMonthlyBonuses(bonuses);
    setOrderHistory(orders);
    setTransactionHistory(transactions);
    setTeamTree(tree);
    setStatistics(stats);
    setTurnoverData(userTurnover);
    
    // Автоматически раскрываем первый уровень команды
    if (tree && tree.children) {
      const initialExpanded = new Set<string>();
      initialExpanded.add(tree.id);
      setExpandedNodes(initialExpanded);
    }
  } catch (err) {
    console.error('Error loading user data:', err);
    setError('Ошибка загрузки данных пользователя');
  } finally {
    setLoading(false);
  }
};

// Добавьте новую функцию для построения дерева с данными за месяц
const buildTeamTreeWithMonthData = async (
  rootUserId: string, 
  month: string, 
  monthTurnoverData: any[]
) => {
  const tree = await BonusService.buildTeamTree(rootUserId);
  
  // Рекурсивная функция для обновления данных в дереве
  const updateNodeWithMonthData = (node: any) => {
    // Находим данные товарооборота для этого пользователя за месяц
    const turnoverData = monthTurnoverData.find(
      (u: any) => u.user_id === node.id || u.users?.id === node.id
    );
    
    if (turnoverData) {
      node.turnover = turnoverData.personal_turnover || 0;
      node.team_turnover = turnoverData.total_turnover - turnoverData.personal_turnover || 0;
      node.total_turnover = turnoverData.total_turnover || 0;
      node.bonus_percent = turnoverData.bonus_percent || 0;
      node.bonus_amount = (turnoverData.personal_turnover || 0) * (turnoverData.bonus_percent || 0) / 100;
    } else {
      // Если данных нет, обнуляем
      node.turnover = 0;
      node.team_turnover = 0;
      node.total_turnover = 0;
      node.bonus_percent = 0;
      node.bonus_amount = 0;
    }
    
    // Обрабатываем детей
    if (node.children && node.children.length > 0) {
      node.children.forEach((child: any) => updateNodeWithMonthData(child));
    }
  };
  
  updateNodeWithMonthData(tree);
  return tree;
};

  const handleCalculatePreview = async () => {
    try {
      setIsCalculating(true);
      const preview = await BonusService.calculateMonthlyBonuses(selectedMonth);
      setPreviewData(preview);
      
      if (preview.success) {
        // Перезагружаем данные бонусов
        const bonuses = await BonusService.getMonthlyBonuses(selectedMonth, userId);
        setMonthlyBonuses(bonuses);
        alert(`Превью рассчитано: ${preview.total_bonuses} бонусов на сумму ${BonusService.formatCurrency(preview.total_amount)}`);
      }
    } catch (err) {
      console.error('Calculation error:', err);
      alert('Ошибка расчета превью');
    } finally {
      setIsCalculating(false);
    }
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const expandAll = () => {
    const allNodes = new Set<string>();
    const collectNodeIds = (node: any) => {
      allNodes.add(node.id);
      if (node.children) {
        node.children.forEach((child: any) => collectNodeIds(child));
      }
    };
    if (teamTree) {
      collectNodeIds(teamTree);
    }
    setExpandedNodes(allNodes);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const calculateNodeStats = (node: any): { totalMembers: number; totalTurnover: number } => {
    let totalMembers = 0;
    let totalTurnover = node.turnover || 0;
    
    if (node.children && node.children.length > 0) {
      node.children.forEach((child: any) => {
        const childStats = calculateNodeStats(child);
        totalMembers += childStats.totalMembers + 1;
        totalTurnover += childStats.totalTurnover;
      });
    }
    
    return { totalMembers, totalTurnover };
  };

  const renderTeamNode = (node: any, level = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const nodeStats = calculateNodeStats(node);
    const directChildren = node.children?.length || 0;
    
    return (
      <div key={node.id} className="select-none">
        <div 
          className={`
            flex items-center gap-2 py-3 px-4 hover:bg-gray-50 transition-colors
            ${level === 0 ? 'bg-gradient-to-r from-[#D77E6C]/5 to-transparent border-l-4 border-[#D77E6C]' : ''}
            ${level === 1 ? 'border-l-2 border-gray-300' : ''}
          `}
          style={{ marginLeft: `${level * 24}px` }}
        >
          <div className="flex items-center gap-2 flex-1">
            {hasChildren && (
              <button 
                onClick={() => toggleNode(node.id)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-6" />}
            
            <div className="flex-1 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{node.name}</span>
                    {level === 0 && (
                      <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-[#D77E6C]/10 to-[#C66B5A]/10 text-[#D77E6C] rounded-full">
                        Основной
                      </span>
                    )}
                    {hasChildren && (
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                        {directChildren} прямых / {nodeStats.totalMembers} всего
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{node.email}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs text-gray-500">Личный</div>
                  <div className="font-medium">{BonusService.formatCurrency(node.turnover || 0)}</div>
                </div>
                
                {hasChildren && (
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Командный</div>
                    <div className="font-medium text-purple-600">
                      {BonusService.formatCurrency(node.team_turnover || 0)}
                    </div>
                  </div>
                )}
                
                <div className="text-right">
                  <div className="text-xs text-gray-500">Общий</div>
                  <div className="font-medium text-[#D77E6C]">
                    {BonusService.formatCurrency(node.total_turnover || nodeStats.totalTurnover)}
                  </div>
                </div>
                
                <div className="text-right min-w-[80px]">
                  <div className="text-xs text-gray-500">Процент</div>
                  <div className="font-bold text-orange-600">{node.bonus_percent}%</div>
                </div>
                
                <div className="text-right min-w-[100px]">
                  <div className="text-xs text-gray-500">Бонус</div>
                  <div className="font-bold text-green-600">
                    {BonusService.formatCurrency(node.bonus_amount || 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="border-l-2 border-gray-200" style={{ marginLeft: `${level * 24 + 12}px` }}>
            {node.children.map((child: any) => renderTeamNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D77E6C]"></div>
      </div>
    );
  }

  if (error || !userDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">{error || 'Пользователь не найден'}</p>
          <button
            onClick={() => router.push('/admin/finance/bonuses')}
            className="mt-4 px-4 py-2 bg-[#D77E6C] text-white rounded-lg hover:bg-[#C66B5A]"
          >
            Вернуться к списку
          </button>
        </div>
      </div>
    );
  }

  // Вычисления для текущего месяца
  const currentTurnover = turnoverData || {
    personal_turnover: 0,
    team_turnover: 0,
    total_turnover: 0,
    bonus_percent: 0
  };

  const personalBonus = monthlyBonuses
    .filter((b: any) => b.bonus_type === 'personal' && b.beneficiary_id === userId)
    .reduce((sum: number, b: any) => sum + b.bonus_amount, 0);

  const differentialBonus = monthlyBonuses
    .filter((b: any) => b.bonus_type === 'differential' && b.beneficiary_id === userId)
    .reduce((sum: number, b: any) => sum + b.bonus_amount, 0);

  const totalBonus = personalBonus + differentialBonus;

  const teamLevels = statistics?.team?.levels_deep || 0;
  const directMembers = statistics?.team?.direct_members || 0;
  const totalMembers = statistics?.team?.total_members || 0;

  return (
    <div className="min-h-screen p-2 sm:p-4">
      <header className="flex">
        <MoreHeaderAD title="Детали пользователя" />
      </header>

      {/* Хедер с информацией */}
      <div className="mb-6 mt-4">
        <button
          onClick={() => router.push('/admin/finance/bonuses')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Назад к списку
        </button>
        
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {userDetails.user_info.full_name || userDetails.user_info.email}
              </h1>
              <p className="text-gray-600">{userDetails.user_info.email}</p>
              <p className="text-gray-500">{userDetails.user_info.phone}</p>
              <div className="flex gap-4 mt-2">
                <span className="px-3 py-1 bg-gradient-to-r from-[#D77E6C]/10 to-[#C66B5A]/10 text-[#D77E6C] text-xs rounded-full font-medium">
                  {userDetails.user_info.role}
                </span>
                {userDetails.bonus_level && (
                  <span 
                    className="px-3 py-1 text-xs rounded-full font-medium"
                    style={{
                      backgroundColor: `${userDetails.bonus_level.color}20`,
                      color: userDetails.bonus_level.color
                    }}
                  >
                    {userDetails.bonus_level.name}
                  </span>
                )}
              </div>
            </div>
            
            {/* Селектор месяца */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D77E6C]/20 focus:border-[#D77E6C] transition-all"
                  max={BonusService.getCurrentMonth()}
                />
                {monthStatus && (
                  <div className="flex gap-2">
                    {monthStatus.isCurrentMonth && (
                      <span className="px-3 py-1.5 bg-[#D77E6C]/10 text-[#D77E6C] rounded-full text-xs font-medium">
                        Текущий
                      </span>
                    )}
                    {monthStatus.isHistorical && (
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        <History className="inline h-3 w-3 mr-1" />
                        Архив
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Статистика карточки за выбранный месяц */}
<div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
  <div className="bg-white rounded-xl border border-gray-200 p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-600">Личный оборот</p>
        <p className="text-xl font-bold text-gray-900">
          {BonusService.formatCurrency(turnoverData?.personal_turnover || 0)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {BonusService.getMonthName(selectedMonth)}
        </p>
      </div>
      <TrendingUp className="h-6 w-6 text-[#D77E6C]" />
    </div>
  </div>

  <div className="bg-white rounded-xl border border-gray-200 p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-600">Командный оборот</p>
        <p className="text-xl font-bold text-gray-900">
          {BonusService.formatCurrency(
            turnoverData ? (turnoverData.total_turnover - turnoverData.personal_turnover) : 0
          )}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {BonusService.getMonthName(selectedMonth)}
        </p>
      </div>
      <Users className="h-6 w-6 text-green-500" />
    </div>
  </div>

  <div className="bg-white rounded-xl border border-gray-200 p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-600">Личный бонус</p>
        <p className="text-xl font-bold text-gray-900">
          {BonusService.formatCurrency(personalBonus)}
        </p>
        <p className="text-xs text-gray-500">
          {turnoverData?.bonus_percent || 0}%
        </p>
      </div>
      <DollarSign className="h-6 w-6 text-yellow-500" />
    </div>
  </div>

  <div className="bg-white rounded-xl border border-gray-200 p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-600">Диф. бонус</p>
        <p className="text-xl font-bold text-gray-900">
          {BonusService.formatCurrency(differentialBonus)}
        </p>
        <p className="text-xs text-gray-500">
          От команды
        </p>
      </div>
      <Layers className="h-6 w-6 text-purple-500" />
    </div>
  </div>

  <div className="bg-white rounded-xl border border-gray-200 p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-600">Итого бонус</p>
        <p className="text-xl font-bold text-green-600">
          {BonusService.formatCurrency(totalBonus)}
        </p>
        <p className="text-xs text-gray-500">
          За {BonusService.getMonthName(selectedMonth)}
        </p>
      </div>
      <CheckCircle className="h-6 w-6 text-green-500" />
    </div>
  </div>
</div>

      {/* Кнопка расчета превью если нет данных */}
      {monthlyBonuses.length === 0 && !monthStatus?.isFinalized && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-900">Нет данных о бонусах за этот месяц</p>
                <p className="text-sm text-yellow-700">Рассчитайте превью для просмотра детальных бонусов</p>
              </div>
            </div>
            <button
              onClick={handleCalculatePreview}
              disabled={isCalculating}
              className="px-4 py-2 bg-gradient-to-r from-[#D77E6C] to-[#C66B5A] text-white rounded-lg hover:from-[#C66B5A] hover:to-[#B55A4A] disabled:opacity-50 flex items-center gap-2 transition-all"
            >
              {isCalculating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Расчет...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Рассчитать превью
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Табы */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Обзор', icon: TrendingUp },
              { id: 'bonuses', name: `Бонусы (${monthlyBonuses.length})`, icon: DollarSign },
              { id: 'team', name: `Команда (${totalMembers})`, icon: Users },
              { id: 'orders', name: 'Заказы', icon: Package },
              { id: 'transactions', name: 'Транзакции', icon: CreditCard }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all
                  ${activeTab === tab.id
                    ? 'border-[#D77E6C] text-[#D77E6C]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon className="h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
{/* Обзор */}
{activeTab === 'overview' && (
  <div className="space-y-6">
    {/* Информация о команде */}
    {statistics && statistics.team && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Прямые партнеры</p>
              <p className="text-2xl font-bold text-gray-900">{directMembers}</p>
            </div>
            <UserCheck className="h-8 w-8 text-[#D77E6C]" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Вся команда</p>
              <p className="text-2xl font-bold text-gray-900">{totalMembers}</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Активные партнеры</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.team.active_members}</p>
            </div>
            <Activity className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>
    )}

    {/* Топ партнеры за выбранный месяц */}
    {teamTree && teamTree.children && teamTree.children.length > 0 && (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Топ партнеры за {BonusService.getMonthName(selectedMonth)}
        </h3>
        <div className="space-y-2">
          {teamTree.children
            .filter((child: any) => child.total_turnover > 0)
            .sort((a: any, b: any) => b.total_turnover - a.total_turnover)
            .slice(0, 5)
            .map((performer: any, index: number) => (
              <div key={performer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-[#D77E6C]">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-gray-900">{performer.name}</p>
                    <p className="text-sm text-gray-500">{performer.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {BonusService.formatCurrency(performer.total_turnover)}
                  </p>
                  <p className="text-sm text-gray-500">общий оборот за месяц</p>
                </div>
              </div>
            ))}
        </div>
        {teamTree.children.filter((c: any) => c.total_turnover > 0).length === 0 && (
          <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
            Нет активных партнеров за {BonusService.getMonthName(selectedMonth)}
          </div>
        )}
      </div>
    )}
  </div>
)}

{/* Вкладка Бонусы */}
{activeTab === 'bonuses' && (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">
      Детализация бонусов за {BonusService.getMonthName(selectedMonth)}
    </h3>
    
    {monthlyBonuses.length > 0 || turnoverData ? (
      <>
        {/* Сводка по типам бонусов с расчетами */}
        <div className="grid grid-cols-3 gap-4">
          {/* Личный бонус */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">Личные бонусы</p>
              <DollarSign className="h-5 w-5 text-[#D77E6C]" />
            </div>
            <p className="text-2xl font-bold text-[#D77E6C]">
              {BonusService.formatCurrency(personalBonus)}
            </p>
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
              <p className="text-xs text-gray-500">Личный товарооборот:</p>
              <p className="text-sm font-medium">{BonusService.formatCurrency(turnoverData?.personal_turnover || 0)}</p>
              <p className="text-xs text-gray-500">Ваш процент:</p>
              <p className="text-sm font-medium">{turnoverData?.bonus_percent || 0}%</p>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400">Расчет:</p>
                <p className="text-xs font-mono">
                  {BonusService.formatCurrency(turnoverData?.personal_turnover || 0)} × {turnoverData?.bonus_percent || 0}%
                </p>
              </div>
            </div>
          </div>

          {/* Дифференциальный бонус */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">Дифференциальные</p>
              <Layers className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {BonusService.formatCurrency(differentialBonus)}
            </p>
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
              <p className="text-xs text-gray-500">Командный товарооборот:</p>
              <p className="text-sm font-medium">
                {BonusService.formatCurrency((turnoverData?.total_turnover || 0) - (turnoverData?.personal_turnover || 0))}
              </p>
              {differentialBonus === 0 && turnoverData && ((turnoverData.total_turnover - turnoverData.personal_turnover) > 0) && (
                <div className="mt-2 p-2 bg-yellow-50 rounded">
                  <p className="text-xs text-yellow-800">
                    <AlertCircle className="h-3 w-3 inline mr-1" />
                    Нет дифференциала: партнеры в команде имеют % ≥ {turnoverData.bonus_percent}%
                  </p>
                </div>
              )}
              {differentialBonus > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-gray-400">От партнеров с меньшим %</p>
                </div>
              )}
            </div>
          </div>

          {/* Итого */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-700">Итого к получению</p>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-700">
              {BonusService.formatCurrency(totalBonus)}
            </p>
            <div className="mt-3 pt-3 border-t border-green-200 space-y-1">
              <p className="text-xs text-green-700">Общий товарооборот:</p>
              <p className="text-sm font-medium text-green-900">
                {BonusService.formatCurrency(turnoverData?.total_turnover || 0)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-green-700">Определяет ваш %:</span>
                <span className="px-2 py-0.5 bg-green-600 text-white rounded text-xs font-bold">
                  {turnoverData?.bonus_percent || 0}%
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Личный + Командный = Общий → %
              </p>
            </div>
          </div>
        </div>

        {/* Детальная таблица всех бонусов */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Детализация начислений</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тип</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Источник</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">База</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Расчет</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Личный бонус */}
                {personalBonus > 0 && (
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-[#D77E6C]/10 text-[#D77E6C]">
                        Личный
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">Собственные продажи</p>
                        <p className="text-xs text-gray-500">Ваш личный товарооборот</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {BonusService.formatCurrency(turnoverData?.personal_turnover || 0)}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="font-mono">
                        {BonusService.formatCurrency(turnoverData?.personal_turnover || 0)} × {turnoverData?.bonus_percent || 0}%
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">
                      {BonusService.formatCurrency(personalBonus)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        preview
                      </span>
                    </td>
                  </tr>
                )}

                {/* Дифференциальные бонусы */}
                {monthlyBonuses
                  .filter((bonus: any) => bonus.beneficiary_id === userId && bonus.bonus_type === 'differential')
                  .map((bonus: any) => (
                    <tr key={bonus.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                          Дифференц.
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">
                            {bonus.contributor?.first_name} {bonus.contributor?.last_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {bonus.contributor?.email} (Уровень {bonus.hierarchy_level})
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {BonusService.formatCurrency(bonus.order_amount)}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div className="font-mono">
                          {BonusService.formatCurrency(bonus.order_amount)} × {bonus.bonus_percent}%
                        </div>
                        <div className="text-gray-500 mt-1">
                          (Ваш {turnoverData?.bonus_percent}% - Их %)
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-green-600">
                        {BonusService.formatCurrency(bonus.bonus_amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          bonus.status === 'paid' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {bonus.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                {/* Если есть командный товарооборот, но нет дифференциальных бонусов */}
                {differentialBonus === 0 && turnoverData && ((turnoverData.total_turnover - turnoverData.personal_turnover) > 0) && (
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-600">
                        Не получен
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-500">Командный товарооборот</p>
                        <p className="text-xs text-gray-400">Партнеры с % ≥ вашего</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {BonusService.formatCurrency((turnoverData.total_turnover - turnoverData.personal_turnover))}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      <div>Разница % = 0 или отрицательная</div>
                      <div className="mt-1">Все партнеры имеют ≥{turnoverData.bonus_percent}%</div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-400">
                      0 ₸
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                        blocked
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </>
    ) : (
      <div className="p-8 text-center text-gray-500 border border-gray-200 rounded-lg">
        <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p>Нет данных о бонусах за выбранный месяц</p>
        {!monthStatus?.isFinalized && (
          <button
            onClick={handleCalculatePreview}
            disabled={isCalculating}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-[#D77E6C] to-[#C66B5A] text-white rounded-lg hover:from-[#C66B5A] hover:to-[#B55A4A] disabled:opacity-50"
          >
            {isCalculating ? 'Расчет...' : 'Рассчитать превью'}
          </button>
        )}
      </div>
    )}
  </div>
)}

          {/* Команда */}
          {activeTab === 'team' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Структура команды
                  {totalMembers > 0 && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({directMembers} прямых / {totalMembers} всего / {teamLevels} уровней)
                    </span>
                  )}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={expandAll}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Развернуть все
                  </button>
                  <button
                    onClick={collapseAll}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Свернуть все
                  </button>
                </div>
              </div>
              
              {teamTree && teamTree.children && teamTree.children.length > 0 ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 flex items-center justify-between text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex-1">Партнер</div>
                    <div className="flex gap-6">
                      <div className="text-right min-w-[100px]">Личный</div>
                      <div className="text-right min-w-[100px]">Командный</div>
                      <div className="text-right min-w-[100px]">Общий</div>
                      <div className="text-right min-w-[80px]">Процент</div>
                      <div className="text-right min-w-[100px]">Бонус</div>
                    </div>
                  </div>
                  
                  {renderTeamNode(teamTree)}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 border border-gray-200 rounded-lg">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>У пользователя пока нет команды</p>
                </div>
              )}
            </div>
          )}

          {/* Заказы */}
          {activeTab === 'orders' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">История заказов</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Номер</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус заказа</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус оплаты</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderHistory
                      .filter((order: any) => {
                        const orderDate = new Date(order.created_at);
                        const monthDate = new Date(selectedMonth + '-01');
                        const nextMonth = new Date(monthDate);
                        nextMonth.setMonth(nextMonth.getMonth() + 1);
                        return orderDate >= monthDate && orderDate < nextMonth;
                      })
                      .map((order: any) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium">
                            {order.order_number || `#${order.id.slice(0, 8)}`}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('ru-RU')}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {BonusService.formatCurrency(order.total_amount)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                              {order.order_status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              order.payment_status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.payment_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                
                {orderHistory.filter((order: any) => {
                  const orderDate = new Date(order.created_at);
                  const monthDate = new Date(selectedMonth + '-01');
                  const nextMonth = new Date(monthDate);
                  nextMonth.setMonth(nextMonth.getMonth() + 1);
                  return orderDate >= monthDate && orderDate < nextMonth;
                }).length === 0 && (
                  <div className="py-8 text-center text-gray-500">
                    Нет заказов за выбранный месяц
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Транзакции */}
          {activeTab === 'transactions' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">История транзакций</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тип</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Операция</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Описание</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactionHistory.length > 0 ? transactionHistory.map((transaction: any) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(transaction.created_at).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {transaction.transaction_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            transaction.operation === 'credit'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.operation === 'credit' ? 'Пополнение' : 'Списание'}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-sm font-medium ${
                          transaction.operation === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.operation === 'credit' ? '+' : '-'}
                          {BonusService.formatCurrency(transaction.amount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {transaction.notes}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            transaction.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          Транзакций не найдено
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}