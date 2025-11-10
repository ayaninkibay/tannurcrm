'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslate } from '@/hooks/useTranslate';
import { bonusEventService, BonusEvent, LeaderboardEntry } from '@/lib/bonus_event/BonusEventService';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import {
  Trophy,
  Users,
  TrendingUp,
  Package,
  Target,
  Calendar,
  Award,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Edit2,
  Star,
  Clock,
  BarChart3,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle
} from 'lucide-react';

type SortField = 'rank' | 'name' | 'personal' | 'team' | 'total' | 'orders' | 'achieved';
type SortDirection = 'asc' | 'desc';
type AchievementFilter = 'all' | 'achieved' | 'none';

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslate();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<BonusEvent | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [includeTeam, setIncludeTeam] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [achievementFilter, setAchievementFilter] = useState<AchievementFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('total');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const loadLeaderboard = useCallback(async (eventData: BonusEvent) => {
    setLoadingLeaderboard(true);
    try {
      // Загружаем ВСЕ данные сразу (limit = 1000)
      const data = await bonusEventService.getAdminLeaderboard(
        eventData.start_date,
        eventData.end_date,
        includeTeam,
        1000
      );

      // Add achieved targets info
      const leaderboardWithTargets = data.map((entry: any) => {
        const achievedTargets = eventData.targets?.filter(target =>
          entry.total_turnover >= target.target_amount
        ) || [];

        return {
          ...entry,
          achieved_targets: achievedTargets.map(t => ({
            target_id: t.id || '',
            target_amount: t.target_amount,
            reward_title: t.reward_title,
            reward_description: t.reward_description || '',
            reward_icon: t.reward_icon,
            is_achieved: true,
            achievement_date: null
          }))
        };
      });

      setLeaderboard(leaderboardWithTargets);
      setCurrentPage(1); // Reset to first page
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoadingLeaderboard(false);
    }
  }, [includeTeam]);

  const loadEventData = useCallback(async () => {
    setLoading(true);
    try {
      const eventData = await bonusEventService.getBonusEventById(eventId);
      setEvent(eventData);
      if (eventData) {
        loadLeaderboard(eventData);
      }
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  }, [eventId, loadLeaderboard]);

  useEffect(() => {
    if (eventId) {
      loadEventData();
    }
  }, [eventId, loadEventData]);

  useEffect(() => {
    if (event) {
      loadLeaderboard(event);
    }
  }, [event, loadLeaderboard]);

  const handleIncludeTeamToggle = () => {
    setIncludeTeam(!includeTeam);
  };

  const toggleRowExpansion = (userId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedRows(newExpanded);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  // Filtered, sorted, and paginated data
  const processedLeaderboard = useMemo(() => {
    let filtered = [...leaderboard];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.full_name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone.includes(query)
      );
    }

    // Achievement filter
    if (achievementFilter === 'achieved') {
      filtered = filtered.filter(user => user.achieved_targets.length > 0);
    } else if (achievementFilter === 'none') {
      filtered = filtered.filter(user => user.achieved_targets.length === 0);
    }

    // Sorting
    filtered.sort((a, b) => {
      let compareValue = 0;

      switch (sortField) {
        case 'rank':
          compareValue = a.rank_position - b.rank_position;
          break;
        case 'name':
          compareValue = a.full_name.localeCompare(b.full_name);
          break;
        case 'personal':
          compareValue = b.personal_turnover - a.personal_turnover;
          break;
        case 'team':
          compareValue = b.team_turnover - a.team_turnover;
          break;
        case 'total':
          compareValue = b.total_turnover - a.total_turnover;
          break;
        case 'orders':
          compareValue = b.total_orders - a.total_orders;
          break;
        case 'achieved':
          compareValue = b.achieved_targets.length - a.achieved_targets.length;
          break;
      }

      return sortDirection === 'asc' ? -compareValue : compareValue;
    });

    return filtered;
  }, [leaderboard, searchQuery, achievementFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(processedLeaderboard.length / itemsPerPage);
  const paginatedLeaderboard = processedLeaderboard.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: string): number => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-[#D77E6C]" />
      : <ChevronDown className="w-4 h-4 text-[#D77E6C]" />;
  };

  if (loading) {
    return (
      <div className="p-2 md:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-48 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-2 md:p-6">
        <MoreHeaderAD title={t('Событие не найдено')} />
        <div className="mt-6 bg-red-50 rounded-lg p-4">
          <div className="text-red-600 text-sm">{t('Событие не найдено')}</div>
        </div>
      </div>
    );
  }

  // Calculate statistics from ALL data
  const totalTurnover = leaderboard.reduce((sum, user) => sum + user.total_turnover, 0);
  const totalOrders = leaderboard.reduce((sum, user) => sum + user.total_orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalTurnover / totalOrders : 0;
  const daysRemaining = getDaysRemaining(event.end_date);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <MoreHeaderAD title={event.title} showBackButton={true}/>
      </div>

      {/* Event Info Card */}
      <div className="bg-gradient-to-br from-[#D77E6C] to-[#C66B5A] rounded-2xl p-6 md:p-8 mb-6 text-white relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full"></div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{event.title}</h1>
              {event.description && (
                <p className="text-white/90 text-sm md:text-base max-w-2xl">
                  {event.description}
                </p>
              )}
            </div>
            <button
              onClick={() => router.push(`/admin/dashboard/bonus_events/create_bonus_event?id=${eventId}`)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              <span className="hidden md:inline">{t('Редактировать')}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm opacity-90">{t('Период')}</span>
              </div>
              <p className="text-sm font-semibold">
                {formatDate(event.start_date)}
              </p>
              <p className="text-xs opacity-75">-</p>
              <p className="text-sm font-semibold">
                {formatDate(event.end_date)}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm opacity-90">{t('Осталось')}</span>
              </div>
              <p className="text-2xl font-bold">{daysRemaining}</p>
              <p className="text-xs opacity-75">{t('дней')}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4" />
                <span className="text-sm opacity-90">{t('Целей')}</span>
              </div>
              <p className="text-2xl font-bold">{event.targets?.length || 0}</p>
              <p className="text-xs opacity-75">{t('наград')}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4" />
                <span className="text-sm opacity-90">{t('Приоритет')}</span>
              </div>
              <p className="text-2xl font-bold">{event.priority || 0}</p>
              <p className="text-xs opacity-75">{t('уровень')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {leaderboard.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-gray-900">
                  {bonusEventService.formatAmount(totalTurnover)}
                </p>
                <p className="text-xs md:text-sm text-gray-600">{t('Общий оборот')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{totalOrders}</p>
                <p className="text-xs md:text-sm text-gray-600">{t('Всего заказов')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{leaderboard.length}</p>
                <p className="text-xs md:text-sm text-gray-600">{t('Участников')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-gray-900">
                  {bonusEventService.formatAmount(avgOrderValue)}
                </p>
                <p className="text-xs md:text-sm text-gray-600">{t('Средний чек')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Targets */}
      {event.targets && event.targets.length > 0 && (
        <div className="bg-white rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-[#D77E6C]" />
            {t('Цели события')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {event.targets.map((target, index) => {
              const achievedCount = leaderboard.filter(user =>
                user.total_turnover >= target.target_amount
              ).length;
              const achievedPercent = leaderboard.length > 0
                ? (achievedCount / leaderboard.length) * 100
                : 0;

              return (
                <div key={target.id || index} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{bonusEventService.getRewardIcon(target.reward_icon)}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{target.reward_title}</p>
                      <p className="text-sm text-gray-600">
                        {t('Цель')}: {bonusEventService.formatAmount(target.target_amount)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t('Достигли')}</span>
                      <span className="font-medium">
                        {achievedCount}/{leaderboard.length} ({Math.round(achievedPercent)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500"
                        style={{ width: `${achievedPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-white rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#D77E6C]" />
                {t('Рейтинг участников')}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {t('Показано')} {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, processedLeaderboard.length)} {t('из')} {processedLeaderboard.length}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  showFilters ? 'bg-[#D77E6C] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                {t('Фильтры')}
              </button>
              <button
                onClick={handleIncludeTeamToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  includeTeam
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Users className="w-4 h-4" />
                {includeTeam ? t('С командами') : t('Без команд')}
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('Поиск')}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder={t('Имя, email или телефон...')}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D77E6C] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Achievement Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('Достижения')}
                  </label>
                  <select
                    value={achievementFilter}
                    onChange={(e) => {
                      setAchievementFilter(e.target.value as AchievementFilter);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D77E6C] focus:border-transparent"
                  >
                    <option value="all">{t('Все участники')}</option>
                    <option value="achieved">{t('Есть достижения')}</option>
                    <option value="none">{t('Нет достижений')}</option>
                  </select>
                </div>

                {/* Items per page */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('Записей на странице')}
                  </label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D77E6C] focus:border-transparent"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {loadingLeaderboard ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('rank')}
                    >
                      <div className="flex items-center gap-2">
                        {t('Место')}
                        <SortIcon field="rank" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        {t('Участник')}
                        <SortIcon field="name" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('personal')}
                    >
                      <div className="flex items-center gap-2">
                        {t('Личный оборот')}
                        <SortIcon field="personal" />
                      </div>
                    </th>
                    {includeTeam && (
                      <th 
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('team')}
                      >
                        <div className="flex items-center gap-2">
                          {t('Оборот команды')}
                          <SortIcon field="team" />
                        </div>
                      </th>
                    )}
                    <th 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('total')}
                    >
                      <div className="flex items-center gap-2">
                        {t('Общий оборот')}
                        <SortIcon field="total" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('orders')}
                    >
                      <div className="flex items-center gap-2">
                        {t('Заказов')}
                        <SortIcon field="orders" />
                      </div>
                    </th>
                    {includeTeam && (
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Команда')}
                      </th>
                    )}
                    <th 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('achieved')}
                    >
                      <div className="flex items-center gap-2">
                        {t('Достигнутые цели')}
                        <SortIcon field="achieved" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('Действия')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedLeaderboard.map((user, index) => {
                    const isExpanded = expandedRows.has(user.user_id);
                    const globalRank = (currentPage - 1) * itemsPerPage + index + 1;

                    return (
                      <React.Fragment key={user.user_id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                              globalRank <= 3
                                ? 'bg-orange-100 text-orange-600 font-bold'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {globalRank}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.full_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {bonusEventService.formatAmount(user.personal_turnover)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.personal_orders} {t('заказов')}
                            </div>
                          </td>
                          {includeTeam && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user.team_turnover > 0 ? (
                                <div className="text-sm font-semibold text-emerald-600">
                                  +{bonusEventService.formatAmount(user.team_turnover)}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">—</span>
                              )}
                              {user.team_orders > 0 && (
                                <div className="text-xs text-gray-500">
                                  {user.team_orders} {t('заказов')}
                                </div>
                              )}
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-[#D77E6C]">
                              {bonusEventService.formatAmount(user.total_turnover)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-sm font-medium text-gray-900">
                              {user.total_orders}
                            </span>
                          </td>
                          {includeTeam && (
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {user.team_members_count > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                                  <Users className="w-3 h-3" />
                                  {user.team_members_count}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400">—</span>
                              )}
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col items-center gap-2">
                              <div className="flex gap-1">
                                {event.targets?.slice(0, 3).map((target, idx) => {
                                  const isAchieved = user.total_turnover >= target.target_amount;
                                  return (
                                    <div
                                      key={idx}
                                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                                        isAchieved
                                          ? 'bg-green-100 text-green-700'
                                          : 'bg-gray-100 text-gray-400'
                                      }`}
                                      title={target.reward_title}
                                    >
                                      {bonusEventService.getRewardIcon(target.reward_icon)}
                                    </div>
                                  );
                                })}
                              </div>
                              <span className="text-xs text-gray-500">
                                {user.achieved_targets.length}/{event.targets?.length || 0}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => toggleRowExpansion(user.user_id)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-gray-600" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-600" />
                              )}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={includeTeam ? 9 : 7} className="px-6 py-4 bg-gray-50">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                    {t('Детальная информация')}
                                  </h4>
                                  <dl className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <dt className="text-gray-500">{t('Телефон')}:</dt>
                                      <dd className="font-medium">{user.phone || '—'}</dd>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <dt className="text-gray-500">{t('Роль')}:</dt>
                                      <dd className="font-medium">{user.role}</dd>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <dt className="text-gray-500">{t('Последний заказ')}:</dt>
                                      <dd className="font-medium">
                                        {user.last_order_date
                                          ? bonusEventService.formatDate(user.last_order_date)
                                          : '—'}
                                      </dd>
                                    </div>
                                  </dl>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                    {t('Прогресс по целям')}
                                  </h4>
                                  <div className="space-y-2">
                                    {event.targets?.map((target, idx) => {
                                      const progress = Math.min(100, (user.total_turnover / target.target_amount) * 100);
                                      const isAchieved = progress >= 100;
                                      return (
                                        <div key={idx} className="flex items-center gap-2">
                                          <span className="text-sm">
                                            {bonusEventService.getRewardIcon(target.reward_icon)}
                                          </span>
                                          <div className="flex-1">
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                              <div
                                                className={`h-1.5 rounded-full ${
                                                  isAchieved 
                                                    ? 'bg-gradient-to-r from-green-400 to-green-600'
                                                    : 'bg-gradient-to-r from-orange-400 to-orange-600'
                                                }`}
                                                style={{ width: `${progress}%` }}
                                              />
                                            </div>
                                          </div>
                                          <span className={`text-xs font-medium ${
                                            isAchieved ? 'text-green-600' : 'text-gray-600'
                                          }`}>
                                            {Math.round(progress)}%
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}

                  {paginatedLeaderboard.length === 0 && (
                    <tr>
                      <td colSpan={includeTeam ? 9 : 7} className="px-6 py-12 text-center text-gray-500">
                        {searchQuery || achievementFilter !== 'all' 
                          ? t('Нет результатов по заданным фильтрам')
                          : t('Пока нет участников с товарооборотом')
                        }
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {t('Показано')} {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, processedLeaderboard.length)} {t('из')} {processedLeaderboard.length} {t('участников')}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-[#D77E6C] text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}