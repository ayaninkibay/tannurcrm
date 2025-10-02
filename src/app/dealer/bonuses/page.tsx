// src/app/dealer/bonuses/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, Users, DollarSign, Target, Calendar,
  ChevronRight, ChevronDown, Award, Clock, Info,
  UserPlus, Activity, Zap, ArrowUp, ArrowDown,
  Trophy, Loader2, AlertCircle, ChevronLeft,
  Sparkles, TrendingDown, Gift, Star, Layers,
  CheckCircle, XCircle
} from 'lucide-react';
import { BonusService } from '@/lib/bonuses/BonusService';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';

export default function DealerBonusesPage() {
  const { profile, loading: userLoading } = useUser();
  const router = useRouter();
  
  const [selectedMonth, setSelectedMonth] = useState(BonusService.getCurrentMonth());
  const [turnoverData, setTurnoverData] = useState<any>(null);
  const [bonusLevels, setBonusLevels] = useState<any[]>([]);
  const [currentLevel, setCurrentLevel] = useState<any>(null);
  const [nextLevel, setNextLevel] = useState<any>(null);
  const [teamTree, setTeamTree] = useState<any>(null);
  const [monthlyBonuses, setMonthlyBonuses] = useState<any[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState(new Set<string>());
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (profile && !userLoading) {
      loadData();
    }
  }, [profile, userLoading, selectedMonth]);

  const loadData = async () => {
    if (!profile) return;
    
    try {
      setLoading(true);
      
      // Загружаем все данные
      const [levels, turnover, tree, bonuses, transactions] = await Promise.all([
        BonusService.getBonusLevels(),
        BonusService.getTurnoverForMonth(selectedMonth),
        BonusService.buildTeamTree(profile.id),
        BonusService.getMonthlyBonuses(selectedMonth, profile.id),
        BonusService.getUserTransactionHistory(profile.id)
      ]);

      setBonusLevels(levels);
      
      // Находим данные текущего пользователя
      const userTurnover = turnover.data.find(
        (u: any) => u.user_id === profile.id || u.users?.id === profile.id
      );
      setTurnoverData(userTurnover);

      // Определяем текущий и следующий уровень
      if (userTurnover && levels.length > 0) {
        const totalAmount = userTurnover.total_turnover || 0;
        const current = levels.find(
          l => totalAmount >= l.min_amount && (!l.max_amount || totalAmount <= l.max_amount)
        );
        setCurrentLevel(current);
        
        const nextIdx = levels.findIndex(l => l.id === current?.id);
        if (nextIdx !== -1 && nextIdx < levels.length - 1) {
          setNextLevel(levels[nextIdx + 1]);
        } else {
          setNextLevel(null);
        }
      }

      // Обновляем дерево команды с данными за месяц
      const updatedTree = await updateTreeWithMonthData(tree, turnover.data);
      setTeamTree(updatedTree);
      
      setMonthlyBonuses(bonuses);
      setTransactionHistory(transactions);
      
      // Автоматически раскрываем первый уровень
      if (updatedTree && updatedTree.children) {
        const initialExpanded = new Set<string>();
        initialExpanded.add(updatedTree.id);
        setExpandedNodes(initialExpanded);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTreeWithMonthData = async (tree: any, monthData: any[]) => {
    if (!tree) return null;
    
    const updateNode = (node: any) => {
      const data = monthData.find(u => u.user_id === node.id || u.users?.id === node.id);
      if (data) {
        node.personal_turnover = data.personal_turnover || 0;
        node.team_turnover = (data.total_turnover || 0) - (data.personal_turnover || 0);
        node.total_turnover = data.total_turnover || 0;
        node.bonus_percent = data.bonus_percent || 0;
      } else {
        node.personal_turnover = 0;
        node.team_turnover = 0;
        node.total_turnover = 0;
        node.bonus_percent = 0;
      }
      
      if (node.children) {
        node.children.forEach(updateNode);
      }
    };
    
    updateNode(tree);
    return tree;
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

  const renderTeamNode = (node: any, level = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
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
                    {hasChildren && (
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                        {directChildren} прямых
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{node.email}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs text-gray-500">Личный</div>
                  <div className="font-medium">{BonusService.formatCurrency(node.personal_turnover || 0)}</div>
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
                    {BonusService.formatCurrency(node.total_turnover || 0)}
                  </div>
                </div>
                
                <div className="text-right min-w-[80px]">
                  <div className="text-xs text-gray-500">Процент</div>
                  <div className="font-bold text-orange-600">{node.bonus_percent || 0}%</div>
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

  // Расчет прогресса
  const calculateProgress = () => {
    if (!currentLevel || !nextLevel || !turnoverData) return 0;
    
    const current = turnoverData.total_turnover || 0;
    const start = currentLevel.min_amount;
    const end = nextLevel.min_amount;
    
    return Math.min(100, ((current - start) / (end - start)) * 100);
  };

  // Расчет бонусов
  const personalBonus = monthlyBonuses
    .filter(b => b.bonus_type === 'personal' && b.beneficiary_id === profile?.id)
    .reduce((sum, b) => sum + b.bonus_amount, 0);
    
  const differentialBonus = monthlyBonuses
    .filter(b => b.bonus_type === 'differential' && b.beneficiary_id === profile?.id)
    .reduce((sum, b) => sum + b.bonus_amount, 0);
    
  const totalBonus = personalBonus + differentialBonus;

  // Подсчет команды
  const countTeamMembers = (node: any): { direct: number; total: number } => {
    if (!node || !node.children) return { direct: 0, total: 0 };
    
    let total = node.children.length;
    const direct = node.children.length;
    
    node.children.forEach((child: any) => {
      const childCount = countTeamMembers(child);
      total += childCount.total;
    });
    
    return { direct, total };
  };

  const teamStats = teamTree ? countTeamMembers(teamTree) : { direct: 0, total: 0 };

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#D77E6C]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4">
      <MoreHeaderDE title="Мои бонусы" />
      
      <div className="mt-4">
        {/* Селектор месяца */}
        <div className="bg-white rounded-2xl  p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Calendar className="h-6 w-6 text-[#D77E6C]" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {BonusService.getMonthName(selectedMonth)}
                </h2>
                <p className="text-sm text-gray-500">Данные за выбранный период</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const date = new Date(selectedMonth + '-01');
                  date.setMonth(date.getMonth() - 1);
                  setSelectedMonth(date.toISOString().substring(0, 7));
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#D77E6C]/20 focus:border-[#D77E6C]"
                max={BonusService.getCurrentMonth()}
              />
              <button
                onClick={() => {
                  const date = new Date(selectedMonth + '-01');
                  date.setMonth(date.getMonth() + 1);
                  const nextMonth = date.toISOString().substring(0, 7);
                  if (nextMonth <= BonusService.getCurrentMonth()) {
                    setSelectedMonth(nextMonth);
                  }
                }}
                disabled={selectedMonth >= BonusService.getCurrentMonth()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Уровень достижений */}
        <div className="bg-gradient-to-r from-[#D96366] via-[#E8838C] to-[#D77E6C] rounded-2xl p-6 mb-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Ваш уровень достижений</h3>
            <Trophy className="h-6 w-6 text-yellow-300" />
          </div>
          
          {currentLevel && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                    <span className="text-2xl font-bold">{currentLevel.bonus_percent}%</span>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{currentLevel.name}</p>
                    <p className="text-sm text-white/80">
                      Минимум: {BonusService.formatCurrency(currentLevel.min_amount)}
                    </p>
                  </div>
                </div>
                <Star className="h-8 w-8 text-yellow-300 fill-yellow-300" />
              </div>

              {nextLevel && (
                <>
                  <div className="relative">
                    <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-300 to-yellow-400 transition-all duration-700"
                        style={{ width: `${calculateProgress()}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-white/80">
                        Текущий: {BonusService.formatCurrency(turnoverData?.total_turnover || 0)}
                      </span>
                      <span className="text-xs text-white/80">
                        Цель: {BonusService.formatCurrency(nextLevel.min_amount)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur rounded-xl">
                    <div>
                      <p className="text-sm text-white/80">Следующий уровень</p>
                      <p className="font-bold">{nextLevel.name} • {nextLevel.bonus_percent}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white/80">Осталось</p>
                      <p className="text-lg font-bold text-yellow-300">
                        {BonusService.formatCurrency(nextLevel.min_amount - (turnoverData?.total_turnover || 0))}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Статистика карточки */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Личный оборот</p>
                <p className="text-xl font-bold text-gray-900">
                  {BonusService.formatCurrency(turnoverData?.personal_turnover || 0)}
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
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>

        {/* Табы */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'overview', name: 'Обзор', icon: TrendingUp },
                { id: 'bonuses', name: `Бонусы`, icon: DollarSign },
                { id: 'team', name: `Команда (${teamStats.total})`, icon: Users },
                { id: 'history', name: 'История', icon: Clock }
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
            {/* Обзор - показываем ВСЕХ прямых партнеров */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {teamTree && teamTree.children && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Мои прямые партнеры ({teamTree.children.length})
                    </h3>
                    <div className="space-y-2">
                      {teamTree.children.length > 0 ? (
                        teamTree.children
                          .sort((a: any, b: any) => b.total_turnover - a.total_turnover)
                          .map((partner: any, index: number) => (
                            <div key={partner.id} className={`flex items-center justify-between p-4 rounded-lg transition-colors
                              ${partner.total_turnover > 0 ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-50/50'}`}>
                              <div className="flex items-center gap-4">
                                <span className={`text-lg font-bold ${partner.total_turnover > 0 ? 'text-[#D77E6C]' : 'text-gray-400'}`}>
                                  #{index + 1}
                                </span>
                                <div>
                                  <p className="font-medium text-gray-900">{partner.name}</p>
                                  <p className="text-sm text-gray-500">{partner.email}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                {partner.total_turnover > 0 ? (
                                  <>
                                    <p className="font-bold text-gray-900">
                                      {BonusService.formatCurrency(partner.total_turnover)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {partner.bonus_percent}% бонус
                                    </p>
                                  </>
                                ) : (
                                  <p className="text-sm text-gray-400">Нет активности</p>
                                )}
                              </div>
                            </div>
                          ))
                      ) : (
                        <p className="text-center text-gray-500 py-4">У вас пока нет прямых партнеров</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

           
            {/* Бонусы - без путающей информации */}
            {activeTab === 'bonuses' && (
              <div className="space-y-6">
                {/* Сводка без лишней информации в итоговом блоке */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-600">Личные бонусы</p>
                      <DollarSign className="h-5 w-5 text-[#D77E6C]" />
                    </div>
                    <p className="text-2xl font-bold text-[#D77E6C]">
                      {BonusService.formatCurrency(personalBonus)}
                    </p>
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">База:</span>
                        <span className="font-medium">{BonusService.formatCurrency(turnoverData?.personal_turnover || 0)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Ставка:</span>
                        <span className="font-medium">{turnoverData?.bonus_percent || 0}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-600">Дифференциальные</p>
                      <Layers className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-purple-600">
                      {BonusService.formatCurrency(differentialBonus)}
                    </p>
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">От команды:</span>
                        <span className="font-medium">{BonusService.formatCurrency((turnoverData?.total_turnover || 0) - (turnoverData?.personal_turnover || 0))}</span>
                      </div>
                      {differentialBonus === 0 && turnoverData && ((turnoverData.total_turnover - turnoverData.personal_turnover) > 0) && (
                        <p className="text-xs text-yellow-700 mt-1">
                          Партнеры ≥ {turnoverData.bonus_percent}%
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-700">Итого к получению</p>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-700">
                      {BonusService.formatCurrency(totalBonus)}
                    </p>
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-xs text-green-600">
                        За {BonusService.getMonthName(selectedMonth)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Объяснение как отдельный блок */}
                <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  <p className="font-medium mb-1">Как рассчитывается ваш процент:</p>
                  <p className="text-xs">
                    Личный оборот ({BonusService.formatCurrency(turnoverData?.personal_turnover || 0)}) + 
                    Командный оборот ({BonusService.formatCurrency((turnoverData?.total_turnover || 0) - (turnoverData?.personal_turnover || 0))}) = 
                    Общий оборот ({BonusService.formatCurrency(turnoverData?.total_turnover || 0)}) → 
                    <span className="font-medium text-[#D77E6C]"> {turnoverData?.bonus_percent || 0}% ({currentLevel?.name})</span>
                  </p>
                </div>

                {/* Детализация */}
                {monthlyBonuses.length > 0 || personalBonus > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тип</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Источник</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">База</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Расчет</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {personalBonus > 0 && (
                          <tr className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 text-xs rounded-full bg-[#D77E6C]/10 text-[#D77E6C]">
                                Личный
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">Собственные продажи</td>
                            <td className="px-4 py-3 text-sm">
                              {BonusService.formatCurrency(turnoverData?.personal_turnover || 0)}
                            </td>
                            <td className="px-4 py-3 text-xs font-mono">
                              × {turnoverData?.bonus_percent || 0}%
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-green-600">
                              {BonusService.formatCurrency(personalBonus)}
                            </td>
                          </tr>
                        )}
                        
                        {monthlyBonuses
                          .filter(b => b.beneficiary_id === profile?.id && b.bonus_type === 'differential')
                          .map((bonus, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                                  Дифференц.
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <div>
                                  <p className="font-medium">{bonus.contributor?.first_name} {bonus.contributor?.last_name}</p>
                                  <p className="text-xs text-gray-500">{bonus.contributor?.email}</p>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {BonusService.formatCurrency(bonus.order_amount)}
                              </td>
                              <td className="px-4 py-3 text-xs font-mono">
                                × {bonus.bonus_percent}%
                              </td>
                              <td className="px-4 py-3 text-sm font-bold text-green-600">
                                {BonusService.formatCurrency(bonus.bonus_amount)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500 border border-gray-200 rounded-lg">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Нет данных о бонусах за выбранный месяц</p>
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
                      </div>
                    </div>
                    
                    {teamTree.children.map((child: any) => renderTeamNode(child, 0))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500 border border-gray-200 rounded-lg">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>У вас пока нет команды</p>
                  </div>
                )}
              </div>
            )}

            {/* История без колонки "Перевод" */}
            {activeTab === 'history' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">История транзакций</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Операция</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Описание</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactionHistory.length > 0 ? transactionHistory.slice(0, 50).map((transaction: any, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(transaction.created_at).toLocaleDateString('ru-RU')}
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
                            {transaction.notes || transaction.source_name || '-'}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
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
    </div>
  );
}