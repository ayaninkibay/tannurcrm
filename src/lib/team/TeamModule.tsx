// lib/team/TeamModule.tsx
// Модуль с хуками для работы с командой (БЕЗ UI компонентов)

import { useEffect, useState, useCallback } from 'react';
import { TeamService, type TeamMember } from './TeamService';
import type { TeamStatsData } from '../../types/team.types';  // ⭐ ИМПОРТИРУЕМ НОВЫЙ ТИП

// ===============================
// ХУКИ ДЛЯ РАБОТЫ С КОМАНДОЙ
// ===============================

/**
 * Хук для работы с командой пользователя
 * Загружает всю иерархию команды через оптимизированный RPC
 * 
 * @param userId - ID пользователя
 * @param useCache - Использовать кэш (по умолчанию true)
 * 
 * @example
 * const { members, loading, error, refreshTree } = useTeamTree(userId);
 */
export function useTeamTree(userId?: string, useCache: boolean = true) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeamMembers = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await TeamService.getMyTeam(userId, useCache);
      setMembers(data);
    } catch (err) {
      console.error('❌ Ошибка загрузки команды:', err);
      setError('Не удалось загрузить данные команды');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [userId, useCache]);

  useEffect(() => {
    if (userId) {
      loadTeamMembers();
    } else {
      setLoading(false);
    }
  }, [userId, loadTeamMembers]);

  const refreshTree = () => {
    TeamService.clearCache(userId);
    loadTeamMembers();
  };

  return {
    members,
    loading,
    error,
    refreshTree
  };
}

/**
 * Хук для получения только прямых рефералов (быстрый запрос)
 * 
 * @param userId - ID пользователя
 * 
 * @example
 * const { members, loading, refreshReferrals } = useDirectReferrals(userId);
 */
export function useDirectReferrals(userId?: string) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDirectReferrals = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await TeamService.getDirectReferrals(userId);
      setMembers(data);
    } catch (err) {
      console.error('❌ Ошибка загрузки прямых рефералов:', err);
      setError('Не удалось загрузить рефералов');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadDirectReferrals();
    } else {
      setLoading(false);
    }
  }, [userId, loadDirectReferrals]);

  const refreshReferrals = () => {
    loadDirectReferrals();
  };

  return {
    members,
    loading,
    error,
    refreshReferrals
  };
}

/**
 * Хук для получения прямых рефералов с их статистикой
 * Включает размер команды каждого реферала и их оборот
 * 
 * @param userId - ID пользователя
 * 
 * @example
 * const { referrals, loading } = useDirectReferralsWithStats(userId);
 */
export function useDirectReferralsWithStats(userId?: string) {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReferralsWithStats = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await TeamService.getDirectReferralsWithStats(userId);
      setReferrals(data);
    } catch (err) {
      console.error('❌ Ошибка загрузки статистики рефералов:', err);
      setError('Не удалось загрузить статистику');
      setReferrals([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadReferralsWithStats();
    } else {
      setLoading(false);
    }
  }, [userId, loadReferralsWithStats]);

  const refreshReferrals = () => {
    loadReferralsWithStats();
  };

  return {
    referrals,
    loading,
    error,
    refreshReferrals
  };
}

/**
 * ⭐ ОБНОВЛЕННЫЙ ХУК - Получить статистику команды
 * Теперь возвращает TeamStatsData вместо TeamStats
 * 
 * @param userId - ID пользователя
 * 
 * @example
 * const { stats, loading, refreshStats } = useTeamStats(userId);
 */
export function useTeamStats(userId?: string) {
  const [stats, setStats] = useState<TeamStatsData>({  // ⭐ ИСПОЛЬЗУЕМ TeamStatsData
    totalMembers: 0,
    directMembers: 0,
    totalTurnover: 0,
    activeMembersCount: 0,
    maxDepth: 0,
    goal: 10,
    remaining: 10
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      // ⭐ ИСПОЛЬЗУЕМ getTeamStats из TeamService
      const data = await TeamService.getTeamStats(userId);
      setStats(data);
    } catch (err) {
      console.error('❌ Ошибка загрузки статистики:', err);
      setError('Не удалось загрузить статистику');
      
      // ⭐ В случае ошибки оставляем дефолтные значения
      setStats({
        totalMembers: 0,
        directMembers: 0,
        totalTurnover: 0,
        activeMembersCount: 0,
        maxDepth: 0,
        goal: 10,
        remaining: 10
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadStats();
    } else {
      setLoading(false);
    }
  }, [userId, loadStats]);

  const refreshStats = () => {
    loadStats();
  };

  return { 
    stats, 
    loading, 
    error,
    refreshStats 
  };
}

/**
 * Хук для получения команды определенного уровня иерархии
 * 
 * @param userId - ID пользователя
 * @param level - Уровень иерархии (0 = сам пользователь, 1 = прямые рефералы, и т.д.)
 * 
 * @example
 * const { members, loading } = useTeamByLevel(userId, 2); // 2-й уровень
 */
export function useTeamByLevel(userId?: string, level: number = 1) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeamByLevel = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await TeamService.getTeamByLevel(userId, level);
      setMembers(data);
    } catch (err) {
      console.error('❌ Ошибка загрузки команды по уровню:', err);
      setError(`Не удалось загрузить команду ${level} уровня`);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [userId, level]);

  useEffect(() => {
    if (userId) {
      loadTeamByLevel();
    } else {
      setLoading(false);
    }
  }, [userId, level, loadTeamByLevel]);

  const refreshTeam = () => {
    loadTeamByLevel();
  };

  return {
    members,
    loading,
    error,
    refreshTeam
  };
}

/**
 * Хук для получения статистики по уровням иерархии
 * Возвращает количество участников и оборот на каждом уровне
 * 
 * @param userId - ID пользователя
 * 
 * @example
 * const { levelStats, loading } = useTeamStatsByLevel(userId);
 */
export function useTeamStatsByLevel(userId?: string) {
  const [levelStats, setLevelStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLevelStats = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await TeamService.getTeamStatsByLevel(userId);
      setLevelStats(data);
    } catch (err) {
      console.error('❌ Ошибка загрузки статистики по уровням:', err);
      setError('Не удалось загрузить статистику по уровням');
      setLevelStats([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadLevelStats();
    } else {
      setLoading(false);
    }
  }, [userId, loadLevelStats]);

  const refreshStats = () => {
    loadLevelStats();
  };

  return {
    levelStats,
    loading,
    error,
    refreshStats
  };
}

/**
 * Хук для поиска в команде
 * Поиск по имени, email, телефону через оптимизированный SQL запрос
 * 
 * @param userId - ID пользователя
 * 
 * @example
 * const { results, loading, search, clearSearch } = useTeamSearch(userId);
 * search('Айгерим'); // Поиск
 */
export function useTeamSearch(userId?: string) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    if (!userId || !query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await TeamService.searchTeam(userId, query);
      setResults(data);
    } catch (err) {
      console.error('❌ Ошибка поиска:', err);
      setError('Ошибка поиска');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setResults([]);
    setError(null);
  };

  return {
    results,
    loading,
    error,
    search,
    clearSearch
  };
}

/**
 * Хук для получения топ участников команды по обороту
 * 
 * @param userId - ID пользователя
 * @param limit - Количество участников (по умолчанию 10)
 * 
 * @example
 * const { performers, loading } = useTopPerformers(userId, 5); // Топ-5
 */
export function useTopPerformers(userId?: string, limit: number = 10) {
  const [performers, setPerformers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTopPerformers = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await TeamService.getTopPerformers(userId, limit);
      setPerformers(data);
    } catch (err) {
      console.error('❌ Ошибка загрузки топ участников:', err);
      setError('Не удалось загрузить топ участников');
      setPerformers([]);
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    if (userId) {
      loadTopPerformers();
    } else {
      setLoading(false);
    }
  }, [userId, limit, loadTopPerformers]);

  const refreshPerformers = () => {
    loadTopPerformers();
  };

  return {
    performers,
    loading,
    error,
    refreshPerformers
  };
}

/**
 * Хук для получения информации о целях пользователя
 * 
 * @param userId - ID пользователя
 * 
 * @example
 * const { goalInfo, loading } = useUserGoalInfo(userId);
 */
export function useUserGoalInfo(userId?: string) {
  const [goalInfo, setGoalInfo] = useState({
    currentGoal: 10,
    progress: 0,
    isConfirmed: false,
    goalDescription: 'Пригласите 10 участников для подтверждения статуса'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGoalInfo = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await TeamService.getUserGoalInfo(userId);
      setGoalInfo(data);
    } catch (err) {
      console.error('❌ Ошибка загрузки информации о целях:', err);
      setError('Не удалось загрузить информацию о целях');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadGoalInfo();
    } else {
      setLoading(false);
    }
  }, [userId, loadGoalInfo]);

  const refreshGoalInfo = () => {
    loadGoalInfo();
  };

  return {
    goalInfo,
    loading,
    error,
    refreshGoalInfo
  };
}

/**
 * Хук для пагинации команды
 * 
 * @param userId - ID пользователя
 * @param pageSize - Размер страницы (по умолчанию 50)
 * 
 * @example
 * const { data, total, page, setPage, loading } = useTeamPagination(userId, 20);
 */
export function useTeamPagination(userId?: string, pageSize: number = 50) {
  const [data, setData] = useState<TeamMember[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await TeamService.getTeamPaginated(userId, page, pageSize);
      setData(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error('❌ Ошибка загрузки страницы:', err);
      setError('Не удалось загрузить данные');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [userId, page, pageSize]);

  useEffect(() => {
    if (userId) {
      loadPage();
    } else {
      setLoading(false);
    }
  }, [userId, page, pageSize, loadPage]);

  const nextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const refreshPage = () => {
    loadPage();
  };

  return {
    data,
    total,
    totalPages,
    page,
    loading,
    error,
    setPage: goToPage,
    nextPage,
    prevPage,
    refreshPage
  };
}

// ===============================
// ЭКСПОРТЫ
// ===============================

export { TeamService, type TeamMember } from './TeamService';
export type { TeamStatsData } from '@/types/team.types';  // ⭐ ЭКСПОРТИРУЕМ НОВЫЙ ТИП