// lib/team/TeamModule.tsx

import React, { useEffect, useState } from 'react';
import { TeamService, type TeamMember, type TeamStats } from './TeamService';
import TeamTree from '@/components/team/TeamTree';
import TeamCard from '@/components/blocks/TeamCard';
import { Users } from 'lucide-react';

// ===============================
// ХУКИ ДЛЯ РАБОТЫ С КОМАНДОЙ
// ===============================

/**
 * Хук для работы с древом команды пользователя
 */
export function useTeamTree(userId?: string) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadTeamMembers();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const loadTeamMembers = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      
      const data = await TeamService.getMyTeam(userId);
      setMembers(data);
    } catch (err) {
      console.error('Ошибка загрузки членов команды:', err);
      setError('Не удалось загрузить данные команды');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshTree = () => {
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
 * Хук для получения команды дилера (для админов)
 */
export function useDealerTeam(dealerId?: string) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dealerId) {
      loadDealerTeam();
    } else {
      setLoading(false);
    }
  }, [dealerId]);

  const loadDealerTeam = async () => {
    if (!dealerId) return;

    try {
      setLoading(true);
      setError(null);
      
      const data = await TeamService.getDealerTeam(dealerId);
      setMembers(data);
    } catch (err) {
      console.error('Ошибка загрузки команды дилера:', err);
      setError('Не удалось загрузить команду дилера');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshTeam = () => {
    loadDealerTeam();
  };

  return {
    members,
    loading,
    error,
    refreshTeam
  };
}

/**
 * Хук для получения всех пользователей (для админской панели)
 */
export function useAllMembers() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllMembers();
  }, []);

  const loadAllMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await TeamService.getAllMembers();
      setMembers(data);
    } catch (err) {
      console.error('Ошибка загрузки всех пользователей:', err);
      setError('Не удалось загрузить список пользователей');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshMembers = () => {
    loadAllMembers();
  };

  return {
    members,
    loading,
    error,
    refreshMembers
  };
}

/**
 * Хук для получения статистики команды
 */
export function useTeamStats(userId?: string) {
  const [stats, setStats] = useState<TeamStats>({
    totalMembers: 0,
    directMembers: 0,
    totalTurnover: 0,
    activeMembersCount: 0,
    goal: 9800000,
    remaining: 9800000
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadStats();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const loadStats = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      
      const data = await TeamService.getTeamStats(userId);
      setStats(data);
    } catch (err) {
      console.error('Ошибка загрузки статистики:', err);
      setError('Не удалось загрузить статистику');
    } finally {
      setLoading(false);
    }
  };

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

// ===============================
// КОМПОНЕНТЫ-ОБЕРТКИ
// ===============================

/**
 * Компонент-обертка для древа команды
 */
interface TreeModuleProps {
  userId?: string;
  currentUserId?: string;
  onSelectMember?: (member: TeamMember) => void;
  onEditMember?: (member: TeamMember) => void;
  className?: string;
  mode?: 'user' | 'dealer' | 'admin';
}

export const TreeModule: React.FC<TreeModuleProps> = ({
  userId,
  currentUserId,
  onSelectMember,
  onEditMember,
  className,
  mode = 'user'
}) => {
  // Выбираем нужный хук в зависимости от режима
  const userTeam = useTeamTree(mode === 'user' ? userId : undefined);
  const dealerTeam = useDealerTeam(mode === 'dealer' ? userId : undefined);
  const allMembers = useAllMembers();

  // Определяем активные данные
  const activeData = mode === 'admin' ? allMembers : mode === 'dealer' ? dealerTeam : userTeam;
  const { members, loading, error } = activeData;
  const refreshFunction = 'refreshTree' in activeData ? activeData.refreshTree : 
                         'refreshTeam' in activeData ? activeData.refreshTeam : 
                         activeData.refreshMembers;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#DC7C67] mb-4"></div>
          <p className="text-gray-600">Загрузка данных команды...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refreshFunction}
            className="px-6 py-2.5 bg-gradient-to-r from-[#DC7C67] to-[#E89380] text-white rounded-xl hover:shadow-lg transition-all duration-300 text-sm font-medium hover:scale-[1.02] active:scale-[0.98]"
          >
            Повторить попытку
          </button>
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#DC7C67]/10 to-[#E89380]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-[#DC7C67]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {mode === 'admin' ? 'Нет пользователей' : 'Команда пуста'}
          </h3>
          <p className="text-gray-600 mb-4">
            {mode === 'admin' 
              ? 'В системе пока нет зарегистрированных пользователей' 
              : 'Пригласите участников для отображения структуры команды'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <TeamTree
      members={members}
      currentUserId={currentUserId}
      onSelectMember={onSelectMember}
      onEditMember={onEditMember}
      className={className}
      isLoading={loading}
    />
  );
};

/**
 * Компонент-обертка для карточки команды
 */
interface TeamCardModuleProps {
  userId?: string;
  title?: string;
  variant?: 'color' | 'white';
  showButton?: boolean;
  className?: string;
}

export const TeamCardModule: React.FC<TeamCardModuleProps> = ({
  userId,
  title = 'Моя команда',
  variant = 'white',
  showButton = true,
  className
}) => {
  const { stats, loading } = useTeamStats(userId);

  return (
    <div className={className}>
      <TeamCard
        title={title}
        count={loading ? 0 : stats.totalMembers}
        goal={loading ? 10 : stats.goal}  // Используем динамическую цель из статистики
        showButton={showButton}
        variant={variant}
      />
    </div>
  );
};

/**
 * Компонент для отображения статистики команды
 */
interface TeamStatsModuleProps {
  userId?: string;
  className?: string;
}

export const TeamStatsModule: React.FC<TeamStatsModuleProps> = ({
  userId,
  className
}) => {
  const { stats, loading, error } = useTeamStats(userId);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 h-4 rounded mb-2"></div>
        <div className="bg-gray-200 h-4 rounded mb-1"></div>
        <div className="bg-gray-200 h-4 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-500 text-sm ${className}`}>
        {error}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Всего участников:</span>
          <span className="font-semibold">{stats.totalMembers}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Прямых подчиненных:</span>
          <span className="font-semibold">{stats.directMembers}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Активных участников:</span>
          <span className="font-semibold">{stats.activeMembersCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Общий оборот:</span>
          <span className="font-semibold">{stats.totalTurnover.toLocaleString()} ₸</span>
        </div>
      </div>
    </div>
  );
};

// ===============================
// ЭКСПОРТЫ
// ===============================

export { TeamService, type TeamMember, type TeamStats } from './TeamService';
export default TreeModule;