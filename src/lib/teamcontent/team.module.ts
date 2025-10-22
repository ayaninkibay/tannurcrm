// src/lib/teamcontent/team.module.ts

'use client';

import { useState, useCallback, useEffect } from 'react';
import { TeamService, User, TeamMemberData, PaginationParams } from './team.service';

export interface TeamStatistics {
  dealers: number;
  celebrities: number;
  employees: number;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface UseTeamModuleReturn {
  dealers: TeamMemberData[];
  celebrities: TeamMemberData[];
  employees: TeamMemberData[];
  statistics: TeamStatistics;
  pagination: PaginationState;
  
  loading: boolean;
  error: string | null;
  searchQuery: string;
  isSearching: boolean;
  
  loadUsers: (page?: number) => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
  refreshData: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  setPageSize: (size: number) => Promise<void>;
}

export const useTeamModule = (selectedTab: 'dealers' | 'stars' | 'employees' = 'dealers'): UseTeamModuleReturn => {
  const [dealers, setDealers] = useState<TeamMemberData[]>([]);
  const [celebrities, setCelebrities] = useState<TeamMemberData[]>([]);
  const [employees, setEmployees] = useState<TeamMemberData[]>([]);
  const [statistics, setStatistics] = useState<TeamStatistics>({
    dealers: 0,
    celebrities: 0,
    employees: 0
  });
  
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const service = new TeamService();

  const loadUsers = useCallback(async (page: number = pagination.page) => {
    try {
      setLoading(true);
      setError(null);
      setIsSearching(false);

      const params: PaginationParams = {
        page,
        pageSize: pagination.pageSize
      };

      let result;
      
      switch (selectedTab) {
        case 'dealers':
          result = await service.getDealers(params);
          break;
        case 'stars':
          result = await service.getCelebrities(params);
          break;
        case 'employees':
          result = await service.getEmployees(params);
          break;
      }

      if (result.success && result.data) {
        const transformed = result.data.map(user => service.transformToTeamMember(user));
        
        if (selectedTab === 'dealers') setDealers(transformed);
        if (selectedTab === 'stars') setCelebrities(transformed);
        if (selectedTab === 'employees') setEmployees(transformed);

        if (result.pagination) {
          setPagination(result.pagination);
        }
      } else {
        setError(result.error || 'Ошибка загрузки данных');
      }

    } catch (err) {
      console.error('Error loading users:', err);
      setError(err instanceof Error ? err.message : 'Критическая ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, [selectedTab, pagination.pageSize]);

  const loadStatistics = useCallback(async () => {
    const result = await service.getUsersStatistics();
    if (result.success && result.data) {
      setStatistics(result.data);
    }
  }, []);

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setIsSearching(false);
      await loadUsers(1);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setIsSearching(true);

      const params: PaginationParams = {
        page: 1,
        pageSize: pagination.pageSize
      };

      const result = await service.searchUsers(query, params);
      
      if (result.success && result.data) {
        const dealerUsers = result.data.filter(u => u.role === 'dealer');
        const celebrityUsers = result.data.filter(u => u.role === 'celebrity');
        const employeeUsers = result.data.filter(u => 
          ['admin', 'financier', 'user'].includes(u.role || '')
        );

        setDealers(dealerUsers.map(u => service.transformToTeamMember(u)));
        setCelebrities(celebrityUsers.map(u => service.transformToTeamMember(u)));
        setEmployees(employeeUsers.map(u => service.transformToTeamMember(u)));

        if (result.pagination) {
          setPagination(result.pagination);
        }
      } else {
        setError(result.error || 'Ошибка поиска');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка поиска');
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize, loadUsers]);

  const goToPage = useCallback(async (page: number) => {
    if (isSearching) {
      await searchUsers(searchQuery);
    } else {
      await loadUsers(page);
    }
  }, [isSearching, searchQuery, searchUsers, loadUsers]);

  const setPageSize = useCallback(async (size: number) => {
    setPagination(prev => ({ ...prev, pageSize: size, page: 1 }));
    await loadUsers(1);
  }, [loadUsers]);

  const refreshData = useCallback(async () => {
    await Promise.all([
      loadUsers(1),
      loadStatistics()
    ]);
  }, [loadUsers, loadStatistics]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    loadUsers(1);
    loadStatistics();
  }, [selectedTab]);

  return {
    dealers,
    celebrities,
    employees,
    statistics,
    pagination,
    
    loading,
    error,
    searchQuery,
    isSearching,
    
    loadUsers,
    searchUsers,
    setSearchQuery,
    clearError,
    refreshData,
    goToPage,
    setPageSize
  };
};