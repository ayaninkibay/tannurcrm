'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { bonusEventService, BonusEvent, LeaderboardEntry } from '@/lib/bonus_event/BonusEventService';
import { useTranslate } from '@/hooks/useTranslate';
import { Trophy, Users, TrendingUp, Package, Target, Calendar, Award, ChevronDown, ChevronUp } from 'lucide-react';

export const BonusSystemStrategy: React.FC = () => {
  const { t } = useTranslate();
  const router = useRouter();
  const [events, setEvents] = useState<BonusEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [includeTeam, setIncludeTeam] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const activeEvents = await bonusEventService.getActiveBonusEvents();
      setEvents(activeEvents);
      if (activeEvents.length > 0 && activeEvents[0].id) {
        setSelectedEventId(activeEvents[0].id);
        loadLeaderboard(activeEvents[0].id);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async (eventId: string) => {
    setLoadingLeaderboard(true);
    
    try {
      const event = await bonusEventService.getBonusEventById(eventId);
      if (!event) return;

      // Используем новый оптимизированный метод
      const data = await bonusEventService.getAdminLeaderboard(
        event.start_date,
        event.end_date,
        includeTeam,
        limit
      );
      
      // Добавляем информацию о достигнутых целях
      const leaderboardWithTargets = data.map((entry: any) => {
        const achievedTargets = event.targets?.filter(target => 
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
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId);
    loadLeaderboard(eventId);
  };

  const handleIncludeTeamToggle = () => {
    setIncludeTeam(!includeTeam);
    if (selectedEventId) {
      loadLeaderboard(selectedEventId);
    }
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

  const selectedEvent = events.find(e => e.id === selectedEventId);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Статистика
  const totalTurnover = leaderboard.reduce((sum, user) => sum + user.total_turnover, 0);
  const totalOrders = leaderboard.reduce((sum, user) => sum + user.total_orders, 0);
  const avgTurnover = leaderboard.length > 0 ? totalTurnover / leaderboard.length : 0;
  const avgOrderValue = totalOrders > 0 ? totalTurnover / totalOrders : 0;

  return (
    <div className="space-y-6">
      {/* Шапка с выбором события */}
      <div className="bg-white rounded-2xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('Управление бонусными событиями')}</h2>
            <p className="text-gray-600 mt-1">{t('Отслеживайте прогресс участников в реальном времени')}</p>
          </div>
          <div className="flex items-center gap-3">
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
            <button
              onClick={() => router.push('/admin/dashboard/create_event')}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
            >
              + {t('Создать событие')}
            </button>
          </div>
        </div>

        {/* Селектор события */}
        {events.length > 0 && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('Выберите событие')}
            </label>
            <select
              value={selectedEventId || ''}
              onChange={(e) => handleEventChange(e.target.value)}
              className="w-full md:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.title} ({new Date(event.start_date).toLocaleDateString('ru-RU')} - {new Date(event.end_date).toLocaleDateString('ru-RU')})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Статистика события */}
      {selectedEvent && leaderboard.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {bonusEventService.formatAmount(totalTurnover)}
                </p>
                <p className="text-sm text-gray-600">{t('Общий оборот')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                <p className="text-sm text-gray-600">{t('Всего заказов')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{leaderboard.length}</p>
                <p className="text-sm text-gray-600">{t('Активных участников')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {bonusEventService.formatAmount(avgOrderValue)}
                </p>
                <p className="text-sm text-gray-600">{t('Средний чек')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Информация о целях события */}
      {selectedEvent && (
        <div className="bg-white rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">{t('Цели события')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {selectedEvent.targets?.map((target, index) => {
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

      {/* Таблица участников */}
      {selectedEvent && (
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{t('Рейтинг участников')}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {t('Всего участников')}: {leaderboard.length}
                </p>
              </div>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  if (selectedEventId) loadLeaderboard(selectedEventId);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={500}>500</option>
              </select>
            </div>
          </div>

          {loadingLeaderboard ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('Место')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('Участник')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('Личный оборот')}
                    </th>
                    {includeTeam && (
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Оборот команды')}
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('Общий оборот')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('Заказов')}
                    </th>
                    {includeTeam && (
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Команда')}
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('Достигнутые цели')}
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('Действия')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard.map((user) => {
                    const isExpanded = expandedRows.has(user.user_id);
                    
                    return (
                      <React.Fragment key={user.user_id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                              user.rank_position <= 3 
                                ? 'bg-orange-100 text-orange-600 font-bold' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {user.rank_position}
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
                            <div className="flex gap-1">
                              {selectedEvent.targets?.map((target, idx) => {
                                const isAchieved = user.total_turnover >= target.target_amount;
                                return (
                                  <div
                                    key={idx}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
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
                            <span className="text-xs text-gray-500 mt-1">
                              {user.achieved_targets.length} {t('из')} {selectedEvent.targets?.length || 0}
                            </span>
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
                                    {selectedEvent.targets?.map((target, idx) => {
                                      const progress = Math.min(100, (user.total_turnover / target.target_amount) * 100);
                                      return (
                                        <div key={idx} className="flex items-center gap-2">
                                          <span className="text-sm">
                                            {bonusEventService.getRewardIcon(target.reward_icon)}
                                          </span>
                                          <div className="flex-1">
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                              <div 
                                                className="h-1.5 rounded-full bg-gradient-to-r from-orange-400 to-orange-600"
                                                style={{ width: `${progress}%` }}
                                              />
                                            </div>
                                          </div>
                                          <span className="text-xs font-medium text-gray-600">
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
                  
                  {leaderboard.length === 0 && (
                    <tr>
                      <td colSpan={includeTeam ? 9 : 7} className="px-6 py-12 text-center text-gray-500">
                        {t('Пока нет участников с товарооборотом')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};