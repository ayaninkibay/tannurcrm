'use client';

import { useState, useCallback, useEffect } from 'react';
import { TeamService, User, TeamMemberData, UserRole } from './team.service';

export interface TeamStatistics {
  dealers: number;
  celebrities: number;
  employees: number;
}

export interface UseTeamModuleReturn {
  // Данные
  dealers: TeamMemberData[];
  celebrities: TeamMemberData[];
  employees: TeamMemberData[];
  statistics: TeamStatistics;
  
  // Состояния
  loading: boolean;
  error: string | null;
  searchQuery: string;
  
  // Методы
  loadAllUsers: () => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
  refreshData: () => Promise<void>;
  
  // Дополнительные методы
  getUsersByRole: (role: UserRole | UserRole[]) => Promise<User[]>;
  updateUserStatus: (userId: string, status: 'active' | 'blocked') => Promise<void>;
}

export const useTeamModule = (): UseTeamModuleReturn => {
  // Состояния для данных
  const [dealers, setDealers] = useState<TeamMemberData[]>([]);
  const [celebrities, setCelebrities] = useState<TeamMemberData[]>([]);
  const [employees, setEmployees] = useState<TeamMemberData[]>([]);
  const [statistics, setStatistics] = useState<TeamStatistics>({
    dealers: 0,
    celebrities: 0,
    employees: 0
  });
  
  // Состояния UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Сервис
  const service = new TeamService();

  // Загрузка всех пользователей
  const loadAllUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Параллельная загрузка всех данных
      const [dealersResult, celebritiesResult, employeesResult, statsResult] = await Promise.all([
        service.getDealers(),
        service.getCelebrities(),
        service.getEmployees(),
        service.getUsersStatistics()
      ]);

      // Обработка дилеров
      if (dealersResult.success && dealersResult.data) {
        const transformedDealers = dealersResult.data.map(user => 
          service.transformToTeamMember(user)
        );
        setDealers(transformedDealers);
      } else if (dealersResult.error) {
        console.error('Error loading dealers:', dealersResult.error);
      }

      // Обработка знаменитостей
      if (celebritiesResult.success && celebritiesResult.data) {
        const transformedCelebrities = celebritiesResult.data.map(user => 
          service.transformToTeamMember(user)
        );
        setCelebrities(transformedCelebrities);
      } else if (celebritiesResult.error) {
        console.error('Error loading celebrities:', celebritiesResult.error);
      }

      // Обработка сотрудников
      if (employeesResult.success && employeesResult.data) {
        const transformedEmployees = employeesResult.data.map(user => 
          service.transformToTeamMember(user)
        );
        setEmployees(transformedEmployees);
      } else if (employeesResult.error) {
        console.error('Error loading employees:', employeesResult.error);
      }

      // Обновление статистики
      if (statsResult.success && statsResult.data) {
        setStatistics(statsResult.data);
      }

      // Проверка на общие ошибки
      const hasErrors = [dealersResult, celebritiesResult, employeesResult].some(r => !r.success);
      if (hasErrors) {
        setError('Некоторые данные не удалось загрузить');
      }

    } catch (err) {
      console.error('Critical error loading users:', err);
      setError(err instanceof Error ? err.message : 'Критическая ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, []);

  // Поиск пользователей
  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      await loadAllUsers();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await service.searchUsers(query);
      
      if (result.success && result.data) {
        // Группируем результаты по ролям
        const dealerUsers = result.data.filter(u => u.role === 'dealer');
        const celebrityUsers = result.data.filter(u => u.role === 'celebrity');
        const employeeUsers = result.data.filter(u => 
          ['manager', 'financier', 'warehouseman', 'admin'].includes(u.role || '')
        );

        // Преобразуем и обновляем состояния
        setDealers(dealerUsers.map(u => service.transformToTeamMember(u)));
        setCelebrities(celebrityUsers.map(u => service.transformToTeamMember(u)));
        setEmployees(employeeUsers.map(u => service.transformToTeamMember(u)));

        // Обновляем статистику
        setStatistics({
          dealers: dealerUsers.length,
          celebrities: celebrityUsers.length,
          employees: employeeUsers.length
        });
      } else {
        setError(result.error || 'Ошибка поиска');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка поиска');
    } finally {
      setLoading(false);
    }
  }, [loadAllUsers]);

  // Получение пользователей по роли (для других компонентов)
  const getUsersByRole = useCallback(async (role: UserRole | UserRole[]): Promise<User[]> => {
    const roles = Array.isArray(role) ? role : [role];
    const result = await service.getUsersByRole(roles);
    return result.success && result.data ? result.data : [];
  }, []);

  // Обновление статуса пользователя
  const updateUserStatus = useCallback(async (userId: string, status: 'active' | 'blocked') => {
    try {
      setLoading(true);
      // TODO: Реализовать обновление статуса в базе данных
      console.log(`Updating user ${userId} status to ${status}`);
      
      // После обновления перезагружаем данные
      await loadAllUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления статуса');
    } finally {
      setLoading(false);
    }
  }, [loadAllUsers]);

  // Обновление данных
  const refreshData = useCallback(async () => {
    await loadAllUsers();
  }, [loadAllUsers]);

  // Очистка ошибки
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Загрузка данных при монтировании
  useEffect(() => {
    loadAllUsers();
  }, [loadAllUsers]);

  return {
    // Данные
    dealers,
    celebrities,
    employees,
    statistics,
    
    // Состояния
    loading,
    error,
    searchQuery,
    
    // Методы
    loadAllUsers,
    searchUsers,
    setSearchQuery,
    clearError,
    refreshData,
    
    // Дополнительные методы
    getUsersByRole,
    updateUserStatus
  };
};