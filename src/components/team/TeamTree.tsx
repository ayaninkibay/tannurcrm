'use client';

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, Grid3x3, List, Search, MoreHorizontal, Users, User, Phone, Briefcase, CheckCircle } from 'lucide-react';

interface TeamMember {
  id: string;
  parentId: string | null;
  name: string;
  position?: string;
  profession?: string;
  role?: string;
  verified: boolean;
  teamCount?: number;
  avatar?: string;
  phone?: string;
  referralCode?: string;
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
  isLoading?: boolean;
}

const findNodeById = (node: TreeNode, id: string): TreeNode | null => {
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
};

const buildTree = (members: TeamMember[]): TreeNode[] => {
  if (!members || !Array.isArray(members)) {
    return [];
  }

  if (members.length === 0) {
    return [];
  }
  
  const memberMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  members.forEach((member, index) => {
    if (member && typeof member === 'object' && member.id && typeof member.id === 'string') {
      memberMap.set(member.id, {
        ...member,
        children: [],
        level: 0,
        expanded: false
      });
    }
  });

  members.forEach((member, index) => {
    if (!member || !member.id) {
      return;
    }
    
    const node = memberMap.get(member.id);
    if (!node) {
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

  return roots.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
};

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

  return (
    <div className="relative">
      <div 
        onClick={() => onSelect(member)}
        className={`w-48 sm:w-56 rounded-xl shadow-sm border cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
          isCurrentUser 
            ? 'bg-white border-[#DC7C67] border-2' 
            : 'bg-white border-gray-200 hover:border-gray-300'
        }`}
        role="button"
        tabIndex={0}
        aria-label={`Карточка сотрудника ${member.name}`}
      >
        <div className="flex items-center justify-between p-2 pb-1">
          <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${member.verified ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-xs text-gray-500 font-medium truncate">
              {member.referralCode || member.id.substring(0, 6)}
            </span>
          </div>
          {isCurrentUser && (
            <div className="px-2 py-0.5 bg-[#DC7C67] text-white text-xs rounded-full font-medium">
              Вы
            </div>
          )}
        </div>

        <div className="px-2 pb-2 text-center">
          <div className="w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
            {member.avatar ? (
              <img 
                src={member.avatar} 
                alt={`Аватар ${member.name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-bold text-xs text-gray-600">
                {member.name ? member.name.charAt(0).toUpperCase() : '?'}
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-1 mb-2">
            <h3 className="font-semibold text-gray-900 text-xs leading-tight truncate">
              {member.name || 'Без имени'}
            </h3>
            {member.verified && (
              <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
            )}
          </div>

          {member.phone && (
            <div className="flex items-center justify-center gap-1 text-xs text-gray-600 mb-1 truncate">
              <Phone className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{member.phone}</span>
            </div>
          )}

          {member.profession && (
            <div className="flex items-center justify-center gap-1 text-xs text-gray-600 mb-2 truncate">
              <Briefcase className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{member.profession}</span>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 text-xs text-gray-600">
            {hasChildren && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{member.children.length}</span>
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
      </div>

      {hasChildren && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(member.id);
            }}
            className="w-5 h-5 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:border-[#DC7C67] hover:bg-[#DC7C67] hover:text-white transition-all shadow-sm"
            aria-label={member.expanded ? 'Свернуть' : 'Развернуть'}
          >
            <svg 
              className={`w-3 h-3 transition-transform duration-200 ${member.expanded ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}

      {member.expanded && hasChildren && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -z-10">
          <div className="w-0.5 h-6 bg-gray-300"></div>
        </div>
      )}
    </div>
  );
};

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

interface TableViewProps {
  members: TeamMember[];
  selectedId: string | null;
  onSelectMember: (member: TeamMember) => void;
  currentUserId?: string;
}

const TableView: React.FC<TableViewProps> = ({ members, selectedId, onSelectMember, currentUserId }) => {
  const [sortField, setSortField] = useState<keyof TeamMember>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAndSortedMembers = useMemo(() => {
    let filtered = members;
    
    // Фильтрация по поисковому запросу
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = members.filter(member => 
        (member.name && member.name.toLowerCase().includes(query)) ||
        (member.id && member.id.toLowerCase().includes(query)) ||
        (member.position && member.position.toLowerCase().includes(query)) ||
        (member.profession && member.profession.toLowerCase().includes(query)) ||
        (member.referralCode && member.referralCode.toLowerCase().includes(query))
      );
    }
    
    // Сортировка
    return [...filtered].sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      const comparison = aVal.toString().localeCompare(bVal.toString());
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [members, sortField, sortDirection, searchQuery]);

  const handleSort = (field: keyof TeamMember) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">


      {/* Таблица */}
      <div className="flex-1 overflow-auto">
        {filteredAndSortedMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Users className="w-10 h-10 text-gray-300 mb-4" />
            <h3 className="text-base font-medium text-gray-900 mb-2">
              {searchQuery ? 'Ничего не найдено' : 'Нет участников команды'}
            </h3>
            <p className="text-sm text-gray-500">
              {searchQuery 
                ? 'Попробуйте изменить поисковый запрос' 
                : 'Пригласите участников для отображения команды'
              }
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {[
                  { key: 'name', label: 'Участник' },
                  { key: 'id', label: 'ID' },
                  { key: 'position', label: 'Профессия' },
                  { key: 'teamCount', label: 'Команда' },
                  { key: 'verified', label: 'Статус' }
                ].map(({ key, label }) => (
                  <th 
                    key={key}
                    onClick={() => handleSort(key as keyof TeamMember)}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      <svg 
                        className={`w-3 h-3 transform transition-transform ${
                          sortField === key ? (sortDirection === 'asc' ? 'rotate-0' : 'rotate-180') : ''
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4" />
                      </svg>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedMembers.map(member => (
                <tr
                  key={member.id}
                  onClick={() => onSelectMember(member)}
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                    member.id === currentUserId ? 'bg-orange-50' : ''
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-gray-600 text-sm">
                            {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 truncate text-sm">
                            {member.name || 'Без имени'}
                          </span>
                          {member.verified && (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          )}
                          {member.id === currentUserId && (
                            <span className="px-2 py-0.5 bg-[#DC7C67] text-white text-xs rounded-full flex-shrink-0">
                              Вы
                            </span>
                          )}
                        </div>
                        {member.phone && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Phone className="w-3 h-3" />
                            <span className="truncate">{member.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-gray-600 font-mono">
                      {member.referralCode || member.id.substring(0, 8)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      <span className="truncate">{member.position || member.profession || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {member.teamCount !== undefined && member.teamCount > 0 ? (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-[#DC7C67]" />
                        <span className="font-semibold text-[#DC7C67] text-sm">{member.teamCount}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {member.verified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3" />
                        Проверен
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Не проверен
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// Простые заглушки для шиммеров
const ListShimmer = () => (
    <div className="p-4 space-y-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        ))}
    </div>
);

const TreeShimmer = () => (
    <div className="flex items-center justify-center h-full animate-pulse">
        <div className="flex flex-col items-center">
            <div className="w-48 h-32 bg-gray-200 rounded-xl"></div>
            <div className="w-0.5 h-16 bg-gray-300"></div>
            <div className="flex justify-center gap-8 mt-4">
                <div className="w-48 h-32 bg-gray-200 rounded-xl"></div>
                <div className="w-48 h-32 bg-gray-200 rounded-xl"></div>
            </div>
        </div>
    </div>
);


const TeamTree: React.FC<TeamTreeProps> = ({ 
  members = [], 
  currentUserId, 
  onSelectMember,
  onEditMember,
  className = '',
  isLoading = false
}) => {
  const validMembers = useMemo(() => {
    if (!members || !Array.isArray(members)) {
      return [];
    }
    
    const filtered = members.filter((m, index) => {
      const isValid = m && typeof m === 'object' && m.id && typeof m.id === 'string';
      return isValid;
    });
    
    return filtered;
  }, [members]);
  
  const [expandedNodes, setExpandedNodes] = useState(new Set<string>());
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [highlightedMemberId, setHighlightedMemberId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('list'); // Изменили дефолт на 'list'
  const [searchQuery, setSearchQuery] = useState('');

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

  const treeRoots = useMemo(() => {
    const roots = buildTree(validMembers);
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

  useEffect(() => {
    if (treeRoots && treeRoots.length > 0) {
      const rootIds = treeRoots.map(root => root.id);
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
    }
  };

  if (isLoading) {
    return (
      <div className={`w-full ${viewMode === 'list' ? 'h-full' : 'h-screen'} ${className}`}>
        {viewMode === 'list' ? <ListShimmer /> : <TreeShimmer />}
      </div>
    );
  }

  if (validMembers.length === 0) {
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

  return (
    <div className={`flex flex-col w-full ${viewMode === 'list' ? 'min-h-0 h-full' : 'h-screen'} ${className}`}>
      <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-white z-50 gap-3 sm:gap-0">
        <div className="flex items-center gap-3">
          <h1 className="text-base sm:text-lg font-semibold text-gray-900">
            Команда
          </h1>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{validMembers.length}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="border border-gray-300 rounded-lg flex-1 sm:flex-initial min-w-0 sm:w-48">
            <div className="flex items-center">
              <div className="p-2 flex-shrink-0">
                <Search className="w-3 h-3 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                className="flex-1 pr-2 py-1.5 text-xs border-0 focus:outline-none bg-transparent min-w-0"
              />
            </div>
          </div>

          {viewMode === 'tree' && (
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button 
                onClick={zoomOut} 
                className="p-1.5 hover:bg-gray-100 transition-colors disabled:opacity-50"
                disabled={zoom <= 0.3}
                aria-label="Уменьшить"
              >
                <ZoomOut className="w-3 h-3 text-gray-600" />
              </button>
              <span className="px-2 text-xs text-gray-600 min-w-[35px] text-center border-x border-gray-300">
                {Math.round(zoom * 100)}%
              </span>
              <button 
                onClick={zoomIn} 
                className="p-1.5 hover:bg-gray-100 transition-colors disabled:opacity-50"
                disabled={zoom >= 2}
                aria-label="Увеличить"
              >
                <ZoomIn className="w-3 h-3 text-gray-600" />
              </button>
            </div>
          )}

          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 transition-all ${
                viewMode === 'list' ? 'bg-[#DC7C67] text-white' : 'text-gray-600 hover:bg-gray-100'
              } rounded-l-lg`}
              aria-label="Списочный вид"
            >
              <List className="w-3 h-3" />
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`p-1.5 transition-all border-l border-gray-300 ${
                viewMode === 'tree' ? 'bg-[#DC7C67] text-white' : 'text-gray-600 hover:bg-gray-100'
              } rounded-r-lg`}
              aria-label="Древовидный вид"
            >
              <Grid3x3 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <div className={`flex-1 relative overflow-hidden ${viewMode === 'list' ? 'h-full' : ''}`}>
        {viewMode === 'list' ? (
          <TableView
            members={validMembers}
            selectedId={selectedMemberId}
            onSelectMember={handleSelect}
            currentUserId={currentUserId}
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100">
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
            </div>

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
          </>
        )}
      </div>
    </div>
  );
};

export default TeamTree;