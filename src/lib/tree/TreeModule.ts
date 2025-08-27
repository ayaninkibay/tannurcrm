// modules/TreeModule.ts

import { TreeService, TreeMember } from '@/services/TreeService';
import { useEffect, useState } from 'react';

// Хук для работы с древом команды
export function useTeamTree(userId?: string) {
  const [members, setMembers] = useState<TreeMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTeamMembers();
  }, [userId]);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data: TreeMember[];
      
      if (userId) {
        // Если указан userId, загружаем команду конкретного дилера
        data = await TreeService.getDealerTeam(userId);
      } else {
        // Иначе загружаем всех пользователей
        data = await TreeService.getAllMembers();
      }
      
      setMembers(data);
    } catch (err) {
      console.error('Ошибка загрузки членов команды:', err);
      setError('Не удалось загрузить данные команды');
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

// Хук для получения статистики команды
export function useTeamStats(userId: string) {
  const [stats, setStats] = useState({
    totalMembers: 0,
    directMembers: 0,
    totalTurnover: 0,
    activeMembersCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadStats();
    }
  }, [userId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await TreeService.getTeamStats(userId);
      setStats(data);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading };
}

// Компонент-обертка для древа команды
import React from 'react';
import TeamTree from '@/components/TeamTree';

interface TreeModuleProps {
  userId?: string; // ID пользователя для отображения его команды
  currentUserId?: string; // ID текущего авторизованного пользователя
  onSelectMember?: (member: TreeMember) => void;
  className?: string;
}

export const TreeModule: React.FC<TreeModuleProps> = ({
  userId,
  currentUserId,
  onSelectMember,
  className
}) => {
  const { members, loading, error, refreshTree } = useTeamTree(userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Загрузка данных команды...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refreshTree}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Повторить попытку
          </button>
        </div>
      </div>
    );
  }

  return (
    <TeamTree
      members={members}
      currentUserId={currentUserId}
      onSelectMember={onSelectMember}
      className={className}
    />
  );
};

// Экспортируем все необходимое
export { TreeService, type TreeMember } from '@/services/TreeService';
export default TreeModule;