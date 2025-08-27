'use client';

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, Grid3x3, List, Search, Target, MoreHorizontal, Users, User } from 'lucide-react';

// Типы данных
interface TeamMember {
  id: string;
  parentId: string | null;
  name: string;
  position?: string;
  profession?: string;
  tariff?: string;
  role?: string;
  verified: boolean;
  teamCount?: number;
  avatar?: string;
}

interface TreeNode extends TeamMember {
  children: TreeNode[];
  level: number;
  expanded: boolean;
}

interface TeamTreeProps {
  members?: TeamMember[];
  currentUserId?: string;
  onSelectMember?: (member: TeamMember) => void;
  onEditMember?: (member: TeamMember) => void;
  className?: string;
}

// Цвета для позиций
const POSITION_COLORS = {
  'CEO': 'bg-purple-100 text-purple-700 border-purple-200',
  'CTO': 'bg-blue-100 text-blue-700 border-blue-200',
  'Manager': 'bg-green-100 text-green-700 border-green-200',
  'Developer': 'bg-orange-100 text-orange-700 border-orange-200',
  'Designer': 'bg-pink-100 text-pink-700 border-pink-200',
  'Partner': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Member': 'bg-gray-100 text-gray-700 border-gray-200',
  'Ambassador': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'default': 'bg-gray-100 text-gray-700 border-gray-200'
};

// Вспомогательная функция для поиска узла по ID
const findNodeById = (node: TreeNode, id: string): TreeNode | null => {
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
};

// Построение дерева с подсчетом потомков
const buildTree = (members: TeamMember[]): TreeNode[] => {
  console.log('🌳 buildTree вызвана с:', { members, type: typeof members, isArray: Array.isArray(members) });
  
  // Усиленная защита от неправильных данных
  if (!members || !Array.isArray(members)) {
    console.warn('⚠️ buildTree: получен некорректный массив members:', members);
    return [];
  }

  if (members.length === 0) {
    console.warn('⚠️ buildTree: получен пустой массив members');
    return [];
  }
  
  const memberMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  // Создаем узлы с дополнительными проверками
  members.forEach((member, index) => {
    if (member && typeof member === 'object' && member.id && typeof member.id === 'string') {
      memberMap.set(member.id, {
        ...member,
        children: [],
        level: 0,
        expanded: false
      });
    } else {
      console.warn(`⚠️ buildTree: пропущен некорректный member[${index}]:`, member);
    }
  });

  console.log('✅ buildTree: создано узлов в memberMap:', memberMap.size);

  // Строим иерархию
  members.forEach((member, index) => {
    if (!member || !member.id) {
      console.warn(`⚠️ buildTree: пропущен member без ID[${index}]:`, member);
      return;
    }
    
    const node = memberMap.get(member.id);
    if (!node) {
      console.warn(`⚠️ buildTree: не найден node для member.id=${member.id}`);
      return;
    }
    
    if (member.parentId && memberMap.has(member.parentId)) {
      const parent = memberMap.get(member.parentId);
      if (parent) {
        parent.children.push(node);
        node.level = parent.level + 1;
      }
    } else {
      roots.push(node);
    }
  });

  console.log('✅ buildTree: найдено корневых узлов:', roots.length);

  // Сортируем детей по имени
  const sortChildren = (nodes: TreeNode[]) => {
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        node.children.sort((a, b) => 
          (a.name || '').localeCompare(b.name || '')
        );
        sortChildren(node.children);
      }
    });
  };
  sortChildren(roots);

  const result = roots.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  console.log('✅ buildTree: возвращает корней:', result.length);
  return result;
};

// Современная карточка участника
interface MemberCardProps {
  member: TreeNode;
  onToggle: (id: string) => void;
  onSelect: (member: TeamMember) => void;
  isCurrentUser: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
}

const MemberCard: React.FC<MemberCardProps> = ({ 
  member, 
  onToggle, 
  onSelect, 
  isCurrentUser, 
  isSelected, 
  isHighlighted 
}) => {
  const hasChildren = member.children && member.children.length > 0;

  const getPositionColor = (position?: string, role?: string) => {
    const key = position || role || 'default';
    return POSITION_COLORS[key as keyof typeof POSITION_COLORS] || POSITION_COLORS.default;
  };

  return (
    <div className="relative">
      <div 
        onClick={() => onSelect(member)}
        className={`w-64 rounded-2xl shadow-sm border cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
          isCurrentUser 
            ? 'bg-white border-[#DC7C67] border-2 ring-1 ring-[#DC7C67]/20' 
            : isSelected 
            ? 'bg-white border-[#DC7C67] border-2 shadow-[#DC7C67]/20 scale-105' 
            : isHighlighted 
            ? 'bg-white border-yellow-400 border-2 shadow-yellow-400/20' 
            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-gray-200/50'
        }`}
        role="button"
        tabIndex={0}
        aria-label={`Карточка сотрудника ${member.name}`}
      >
        {/* Заголовок карточки */}
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${member.verified ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-xs text-gray-500 font-medium">ID: {member.id}</span>
          </div>
          <div className="flex items-center gap-1">
            {isCurrentUser && (
              <div className="px-2 py-1 bg-[#DC7C67] text-white text-xs rounded-full font-medium">
                Это вы
              </div>
            )}
            <button 
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              onClick={(e) => e.stopPropagation()}
              aria-label="Дополнительные действия"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Основное содержимое */}
        <div className="px-4 pb-4 text-center">
          {/* Аватар */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500">
            {member.avatar ? (
              <img 
                src={member.avatar} 
                alt={`Аватар ${member.name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/80">
                <span className="font-bold text-sm text-gray-600">
                  {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                </span>
              </div>
            )}
          </div>

          {/* Имя и верификация */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <h3 className="font-bold text-gray-900 text-base leading-tight">
              {member.name || 'Без имени'}
            </h3>
            {member.verified && (
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Профессия или роль */}
          {(member.profession || member.role) && (
            <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 bg-blue-50 text-blue-700 border border-blue-200">
              {member.profession || member.role}
            </div>
          )}

          {/* Статистика команды */}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
            {hasChildren && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>Подчиненных: {member.children.length}</span>
              </div>
            )}
            {member.teamCount !== undefined && member.teamCount > 0 && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="font-semibold text-[#DC7C67]">{member.teamCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Кнопка разворачивания */}
        {hasChildren && (
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle(member.id);
              }}
              className="w-7 h-7 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:border-[#DC7C67] hover:bg-[#DC7C67] hover:text-white transition-all shadow-md hover:shadow-lg"
              aria-label={member.expanded ? 'Свернуть' : 'Развернуть'}
            >
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${member.expanded ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Соединительная линия */}
      {member.expanded && hasChildren && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -z-10">
          <div className="w-0.5 h-8 bg-gray-300"></div>
        </div>
      )}
    </div>
  );
};

// Рендер узла дерева с улучшенными соединительными линиями
interface TreeNodeProps {
  node: TreeNode;
  expandedNodes: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (member: TeamMember) => void;
  currentUserId?: string;
  selectedId: string | null;
  highlightedId: string | null;
  level?: number;
}

const TreeNodeComponent: React.FC<TreeNodeProps> = ({ 
  node, 
  expandedNodes, 
  onToggle, 
  onSelect, 
  currentUserId, 
  selectedId, 
  highlightedId, 
  level = 0 
}) => {
  const isExpanded = expandedNodes.has(node.id);
  const isCurrentUser = node.id === currentUserId;
  const isSelected = selectedId === node.id;
  const isHighlighted = highlightedId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      <MemberCard
        member={{...node, expanded: isExpanded}}
        onToggle={onToggle}
        onSelect={onSelect}
        isCurrentUser={isCurrentUser}
        isSelected={isSelected}
        isHighlighted={isHighlighted}
      />

      {isExpanded && hasChildren && (
        <div className="relative mt-8">
          {/* Горизонтальная линия для множественных детей */}
          {node.children.length > 1 && (
            <div 
              className="absolute bg-gray-300 h-0.5 -z-10"
              style={{
                top: '-12px',
                left: `${100 / node.children.length / 2}%`,
                right: `${100 / node.children.length / 2}%`
              }}
            />
          )}

          <div className="flex items-start gap-12 pt-4">
            {node.children.map((child) => (
              <div key={child.id} className="relative">
                {/* Вертикальная линия для каждого ребенка */}
                {node.children.length > 1 && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-gray-300 -translate-y-4 -z-10" />
                )}
                <TreeNodeComponent
                  node={child}
                  expandedNodes={expandedNodes}
                  onToggle={onToggle}
                  onSelect={onSelect}
                  currentUserId={currentUserId}
                  selectedId={selectedId}
                  highlightedId={highlightedId}
                  level={level + 1}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Хук для зума и панорамирования
const usePanAndZoom = () => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: -100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const zoomIn = useCallback(() => setZoom(prev => Math.min(2, prev + 0.2)), []);
  const zoomOut = useCallback(() => setZoom(prev => Math.max(0.3, prev - 0.2)), []);
  const resetPanZoom = useCallback(() => { 
    setZoom(1); 
    setOffset({ x: 0, y: 0 }); 
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  }, [offset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStart.current = { 
        x: e.touches[0].clientX - offset.x, 
        y: e.touches[0].clientY - offset.y 
      };
    }
  }, [offset]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      e.preventDefault();
      setOffset({
        x: e.touches[0].clientX - dragStart.current.x,
        y: e.touches[0].clientY - dragStart.current.y
      });
    }
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(prev => Math.max(0.3, Math.min(2, prev + delta)));
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  return {
    zoom, offset, isDragging,
    zoomIn, zoomOut, resetPanZoom,
    handleMouseDown, handleMouseMove, handleMouseUp,
    handleTouchStart, handleTouchMove, handleTouchEnd,
    setOffset
  };
};

// Табличный вид
interface TableViewProps {
  members: TeamMember[];
  selectedId: string | null;
  onSelectMember: (member: TeamMember) => void;
  currentUserId?: string;
}

const TableView: React.FC<TableViewProps> = ({ members, selectedId, onSelectMember, currentUserId }) => {
  const [sortField, setSortField] = useState<keyof TeamMember>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      const comparison = aVal.toString().localeCompare(bVal.toString());
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [members, sortField, sortDirection]);

  const handleSort = (field: keyof TeamMember) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          Список участников команды ({members.length})
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {[
                { key: 'name', label: 'Сотрудник' },
                { key: 'id', label: 'ID' },
                { key: 'position', label: 'Должность' },
                { key: 'verified', label: 'Статус' }
              ].map(({ key, label }) => (
                <th 
                  key={key}
                  onClick={() => handleSort(key as keyof TeamMember)}
                  className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {label}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedMembers.map(member => (
              <tr
                key={member.id}
                onClick={() => onSelectMember(member)}
                className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedId === member.id ? 'bg-blue-50 border-l-4 border-[#DC7C67]' : ''
                } ${member.id === currentUserId ? 'bg-orange-50' : ''}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-gray-600 text-sm">
                          {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{member.name || 'Без имени'}</span>
                        {member.id === currentUserId && (
                          <span className="px-2 py-0.5 bg-[#DC7C67] text-white text-xs rounded-full">
                            Вы
                          </span>
                        )}
                      </div>
                      {member.teamCount !== undefined && member.teamCount > 0 && (
                        <div className="text-sm text-gray-500">
                          Команда: {member.teamCount} чел.
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                  {member.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${
                    POSITION_COLORS[(member.position || member.role || 'default') as keyof typeof POSITION_COLORS] || POSITION_COLORS.default
                  }`}>
                    {member.position || member.role || 'Участник'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {member.verified ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Верифицирован
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      Не верифицирован
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Главный компонент
const TeamTree: React.FC<TeamTreeProps> = ({ 
  members = [], 
  currentUserId, 
  onSelectMember,
  onEditMember,
  className = ''
}) => {
  console.log('🌳 TeamTree рендер с props:', {
    members,
    membersType: typeof members,
    membersIsArray: Array.isArray(members),
    membersLength: members?.length,
    currentUserId
  });

  // Защита от undefined или null с улучшенной фильтрацией
  const validMembers = useMemo(() => {
    console.log('🔍 Обработка members в useMemo:', members);
    
    if (!members || !Array.isArray(members)) {
      console.warn('⚠️ members не является массивом:', members);
      return [];
    }
    
    const filtered = members.filter((m, index) => {
      const isValid = m && typeof m === 'object' && m.id && typeof m.id === 'string';
      if (!isValid) {
        console.warn(`⚠️ Отфильтрован некорректный member[${index}]:`, m);
      }
      return isValid;
    });
    
    console.log('✅ Отфильтрованные members:', filtered.length, 'из', members.length);
    return filtered;
  }, [members]);
  
  const [expandedNodes, setExpandedNodes] = useState(new Set<string>());
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [highlightedMemberId, setHighlightedMemberId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const { 
    zoom, 
    offset, 
    isDragging, 
    zoomIn, 
    zoomOut, 
    resetPanZoom, 
    handleMouseDown, 
    handleMouseMove, 
    handleMouseUp,
    handleTouchStart,
    handleTouchMove, 
    handleTouchEnd
  } = usePanAndZoom();

  // Используем защищенный массив для построения дерева
  const treeRoots = useMemo(() => {
    console.log('🏗️ Создание treeRoots из validMembers:', validMembers.length);
    const roots = buildTree(validMembers);
    console.log('✅ treeRoots создан:', roots.length, 'корней');
    return roots;
  }, [validMembers]);

  const handleToggle = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  const handleSelect = useCallback((member: TeamMember) => {
    setSelectedMemberId(member.id);
    onSelectMember?.(member);
  }, [onSelectMember]);

  const handleSearch = useCallback((query: string) => {
    const foundMember = validMembers.find(m =>
      (m.name && m.name.toLowerCase().includes(query.toLowerCase())) ||
      (m.id && m.id.toLowerCase().includes(query.toLowerCase())) ||
      (m.position && m.position.toLowerCase().includes(query.toLowerCase())) ||
      (m.profession && m.profession.toLowerCase().includes(query.toLowerCase())) ||
      (m.role && m.role.toLowerCase().includes(query.toLowerCase()))
    );
    setHighlightedMemberId(foundMember?.id || null);

    // Автоматически разворачиваем путь до найденного элемента
    if (foundMember) {
      const expandPath = (memberId: string) => {
        const member = validMembers.find(m => m.id === memberId);
        if (member?.parentId) {
          setExpandedNodes(prev => new Set([...prev, member.parentId!]));
          expandPath(member.parentId);
        }
      };
      expandPath(foundMember.id);
    }
  }, [validMembers]);

  const handleClearSearch = useCallback(() => {
    setHighlightedMemberId(null);
    setSearchQuery('');
  }, []);

  const handleFindMe = useCallback(() => {
    if (currentUserId) {
      setSelectedMemberId(currentUserId);
      setHighlightedMemberId(currentUserId);
      
      // Разворачиваем путь до текущего пользователя
      const expandPath = (memberId: string) => {
        const member = validMembers.find(m => m.id === memberId);
        if (member?.parentId) {
          setExpandedNodes(prev => new Set([...prev, member.parentId!]));
          expandPath(member.parentId);
        }
      };
      expandPath(currentUserId);
    }
  }, [currentUserId, validMembers]);

  // Автоматическое раскрытие первого уровня при загрузке
  useEffect(() => {
    if (treeRoots && treeRoots.length > 0) {
      const rootIds = treeRoots.map(root => root.id);
      console.log('🌐 Автораскрытие корневых узлов:', rootIds);
      setExpandedNodes(new Set(rootIds));
    }
  }, [treeRoots]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim()) {
      handleSearch(value);
    } else {
      handleClearSearch();
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchQuery('');
      handleClearSearch();
      setIsSearchExpanded(false);
    }
  };

  if (validMembers.length === 0) {
    console.log('📭 Показываем пустое состояние');
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет данных о команде</h3>
          <p className="text-gray-500">Добавьте участников для отображения структуры</p>
        </div>
      </div>
    );
  }

  console.log('🎨 Рендерим TeamTree с', validMembers.length, 'участниками');

  return (
    <div className={`flex flex-col w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}>
      {/* Панель управления */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border-b border-gray-200 z-50 gap-3 sm:gap-0">
        <div className="flex items-center gap-4">
          <h1 className="text-base sm:text-lg font-semibold text-gray-900">
            Древо команды
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {viewMode === 'tree' && (
            <div className="border border-gray-300 rounded-lg flex-1 sm:flex-initial min-w-0 sm:w-64">
              <div className="flex items-center">
                <div className="p-2 flex-shrink-0">
                  <Search className="w-4 h-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Поиск по имени, ID, должности..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  className="flex-1 pr-3 py-2 text-sm border-0 focus:outline-none bg-transparent min-w-0"
                />
              </div>
            </div>
          )}

          {viewMode === 'tree' && (
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button 
                onClick={zoomOut} 
                className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                disabled={zoom <= 0.3}
                aria-label="Уменьшить"
              >
                <ZoomOut className="w-4 h-4 text-gray-600" />
              </button>
              <span className="px-2 text-xs sm:text-sm text-gray-600 min-w-[45px] text-center border-x border-gray-300">
                {Math.round(zoom * 100)}%
              </span>
              <button 
                onClick={zoomIn} 
                className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                disabled={zoom >= 2}
                aria-label="Увеличить"
              >
                <ZoomIn className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}

          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('tree')}
              className={`p-2 transition-all ${
                viewMode === 'tree' ? 'bg-[#DC7C67] text-white' : 'text-gray-600 hover:bg-gray-100'
              } rounded-l-lg`}
              aria-label="Древовидный вид"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-all border-l border-gray-300 ${
                viewMode === 'list' ? 'bg-[#DC7C67] text-white' : 'text-gray-600 hover:bg-gray-100'
              } rounded-r-lg`}
              aria-label="Списочный вид"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Основная область */}
      <div className="flex-1 relative overflow-hidden bg-white">
        <div className="absolute inset-0 opacity-30">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />
        </div>

        {viewMode === 'tree' ? (
          <div
            className="absolute inset-0 cursor-grab active:cursor-grabbing touch-pan-x touch-pan-y"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <div
              className="absolute transform-gpu select-none"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
                transformOrigin: 'center center'
              }}
            >
              <div className="flex flex-col items-center gap-10 sm:gap-20 p-10 sm:p-20">
                {currentUserId && (() => {
                  const currentUser = validMembers.find(m => m.id === currentUserId);
                  const parent = currentUser?.parentId ? validMembers.find(m => m.id === currentUser.parentId) : null;
                  
                  if (parent) {
                    const parentNode = treeRoots.find(root => findNodeById(root, parent.id));
                    if (!parentNode) {
                      const tempParentNode = {
                        ...parent,
                        children: [],
                        level: 0,
                        expanded: false
                      };
                      return (
                        <div key={`parent-${parent.id}`} className="mb-5 sm:mb-10">
                          <TreeNodeComponent
                            node={tempParentNode}
                            expandedNodes={new Set()}
                            onToggle={() => {}}
                            onSelect={handleSelect}
                            currentUserId={currentUserId}
                            selectedId={selectedMemberId}
                            highlightedId={highlightedMemberId}
                          />
                        </div>
                      );
                    }
                  }
                  return null;
                })()}
                
                {treeRoots.map(root => (
                  <TreeNodeComponent
                    key={root.id}
                    node={root}
                    expandedNodes={expandedNodes}
                    onToggle={handleToggle}
                    onSelect={handleSelect}
                    currentUserId={currentUserId}
                    selectedId={selectedMemberId}
                    highlightedId={highlightedMemberId}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 overflow-auto p-4 sm:p-8">
            <TableView
              members={validMembers}
              selectedId={selectedMemberId}
              onSelectMember={handleSelect}
              currentUserId={currentUserId}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamTree;