import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ZoomIn, ZoomOut, Grid3x3, List, Briefcase, User, Search, ChevronDown, ChevronRight, Target } from 'lucide-react';

// ==========================================================
// 🚀 КОНСТАНТЫ И ТИПЫ
// ==========================================================
const CARD_WIDTH = 220;
const CARD_HEIGHT = 200;
const H_SPACING = 100;
const V_SPACING = 120;

interface TeamMember {
  id: string;
  parentId: string | null;
  name: string;
  avatar?: string;
  tariff: 'Basic' | 'Business' | 'Premium' | 'Enterprise';
  role: string;
  verified: boolean;
  teamCount?: number;
  isMainPerson?: boolean;
  isParentOfMain?: boolean;
}

interface TreeNode extends TeamMember {
  children: TreeNode[];
  level: number;
  x: number;
  y: number;
  collapsed: boolean;
  totalDescendants: number;
}

interface TeamTreeProps {
  members: TeamMember[];
  currentUserId?: string;
  onSelectMember?: (member: TeamMember) => void;
  onEditMember?: (member: TeamMember) => void;
  className?: string;
}

// ==========================================================
// 🌳 УТИЛИТЫ ДЛЯ ПОСТРОЕНИЯ ДЕРЕВА
// ==========================================================
const buildAndLayoutTree = (members: TeamMember[], collapsedNodes: Set<string>): TreeNode[] => {
  const memberMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  members.forEach(member => {
    memberMap.set(member.id, {
      ...member,
      children: [],
      level: 0,
      collapsed: collapsedNodes.has(member.id),
      totalDescendants: 0,
      x: 0, y: 0
    });
  });

  members.forEach(member => {
    const node = memberMap.get(member.id)!;
    if (member.parentId && memberMap.has(member.parentId)) {
      const parent = memberMap.get(member.parentId)!;
      if (!parent.children) parent.children = [];
      parent.children.push(node);
      node.level = parent.level + 1;
    } else {
      roots.push(node);
    }
  });

  const calculateDescendants = (node: TreeNode): number => {
    if (!node.children || node.children.length === 0) {
      node.totalDescendants = 0;
      return 0;
    }
    let count = node.children.length;
    node.children.forEach(child => {
      count += calculateDescendants(child);
    });
    node.totalDescendants = count;
    return count;
  };
  roots.forEach(root => calculateDescendants(root));

  const calculateSubtreeWidth = (node: TreeNode): number => {
    if (node.collapsed || !node.children || node.children.length === 0) {
      return CARD_WIDTH;
    }
    const childrenWidth = node.children.reduce((sum, child) =>
      sum + calculateSubtreeWidth(child) + H_SPACING, -H_SPACING
    );
    return Math.max(CARD_WIDTH, childrenWidth);
  };

  const calculatePositions = (node: TreeNode, x: number, y: number) => {
    node.x = x;
    node.y = y;

    if (!node.collapsed && node.children && node.children.length > 0) {
      const nodeSubtreeWidth = calculateSubtreeWidth(node);
      const parentCenter = x + CARD_WIDTH / 2;
      let currentChildX = parentCenter - nodeSubtreeWidth / 2;

      node.children.forEach(child => {
        const childSubtreeWidth = calculateSubtreeWidth(child);
        const childCenter = currentChildX + childSubtreeWidth / 2;
        calculatePositions(
          child,
          childCenter - CARD_WIDTH / 2,
          y + CARD_HEIGHT + V_SPACING
        );
        currentChildX += childSubtreeWidth + H_SPACING;
      });
    }
  };

  const totalTreeWidth = roots.reduce((sum, root) => sum + calculateSubtreeWidth(root) + H_SPACING * 2, 0);
  let initialX = Math.max(100, (typeof window !== 'undefined' ? window.innerWidth - totalTreeWidth : 1200 - totalTreeWidth) / 2);

  roots.forEach(root => {
    const rootWidth = calculateSubtreeWidth(root);
    calculatePositions(root, initialX, 80);
    initialX += rootWidth + H_SPACING * 2;
  });

  return roots;
};

// ==========================================================
// ⚙️ КАРТОЧКА СОТРУДНИКА
// ==========================================================
interface MemberCardProps {
  member: TreeNode;
  isSelected: boolean;
  isHighlighted: boolean;
  onSelect: (id: string) => void;
  onToggleCollapse: (id: string) => void;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, isSelected, isHighlighted, onSelect, onToggleCollapse }) => {
  const tariffColors = {
    Basic: 'text-gray-600',
    Business: 'text-blue-600',
    Premium: 'text-purple-600',
    Enterprise: 'text-orange-600'
  };

  const isMainPerson = member.isMainPerson;
  const isParentOfMain = member.isParentOfMain;

  return (
    <div
      className={`absolute rounded-2xl shadow border-1 transition-all duration-300 cursor-pointer
        ${isSelected ? 'border-[#D77E6C] shadow' :
          isHighlighted ? 'border-yellow-400 shadow' :
          'border-gray-200 hover:border-gray-300'}
      `}
      style={{
        left: `${member.x}px`,
        top: `${member.y}px`,
        width: `${CARD_WIDTH}px`,
        backgroundColor: isMainPerson ? '#3A3D43' : isParentOfMain ? '#D77E6C' : '#F9FAFB',
        zIndex: isSelected || isHighlighted ? 100 : member.level + 10
      }}
      onClick={() => onSelect(member.id)}
    >
      <div className="p-4">
        {member.children.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse(member.id);
            }}
            className={`absolute top-2 right-2 p-1 rounded-full transition-colors ${
              isMainPerson || isParentOfMain ? 'hover:bg-white/20' : 'hover:bg-gray-100'
            }`}
          >
            {member.collapsed ? (
              <ChevronRight className={`w-4 h-4 ${isMainPerson || isParentOfMain ? 'text-white' : 'text-gray-500'}`} />
            ) : (
              <ChevronDown className={`w-4 h-4 ${isMainPerson || isParentOfMain ? 'text-white' : 'text-gray-500'}`} />
            )}
          </button>
        )}
        
        <div className="flex flex-col items-center">
          <div className="relative mb-3">
            {member.avatar ? (
              <div className={`w-14 h-14 rounded-full overflow-hidden border-2 ${
                isMainPerson ? 'border-white' : isParentOfMain ? 'border-white' : 'border-orange-400'
              }`}>
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                isMainPerson || isParentOfMain ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                <User className={`w-7 h-7 ${isMainPerson || isParentOfMain ? 'text-white' : 'text-gray-400'}`} />
              </div>
            )}
          </div>
          
          <h3 className={`font-semibold text-sm flex items-center gap-1 mb-1 text-center ${
            isMainPerson || isParentOfMain ? 'text-white' : 'text-gray-900'
          }`}>
            {member.name}
            {member.verified && (
                          <img src="/icons/confirmed.svg" alt="Verified" className="w-4 h-4 inline-block ml-1" />
                        )}
          </h3>
          
          <p className={`text-xs mb-2 ${isMainPerson || isParentOfMain ? 'text-white/80' : 'text-gray-500'}`}>
            ID: {member.id}
          </p>
          
          <div className="text-xs mb-2">
            <span className={isMainPerson || isParentOfMain ? 'text-white/70' : 'text-gray-500'}>Статус: </span>
            <span className={`font-medium ${
              isMainPerson || isParentOfMain ? 'text-white' : tariffColors[member.tariff]
            }`}>
              {member.tariff}
            </span>
          </div>
          
          <div className={`flex items-center gap-1.5 text-xs mb-2 ${
            isMainPerson || isParentOfMain ? 'text-white/80' : 'text-gray-600'
          }`}>
            <Briefcase className={`w-3 h-3 ${isMainPerson || isParentOfMain ? 'text-white/60' : 'text-gray-400'}`} />
            <span>{member.role}</span>
          </div>
          
          <div className="flex gap-2 text-xs">
            {member.children.length > 0 && (
              <div className={`px-2 py-1 rounded-full ${
                isMainPerson || isParentOfMain ? 'bg-white/20 text-white' : 'bg-gray-200 text-black'
              }`}>
                Прямых: {member.children.length}
              </div>
            )}
            {(member.totalDescendants ?? 0) > 0 && (
              <div className={`px-2 py-1 rounded-full ${
                isMainPerson || isParentOfMain ? 'bg-white/20 text-white' : 'bg-gray-200 text-[#D77E6C]'
              }`}>
                Всего: {member.totalDescendants}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================================
// 🔗 ЛИНИИ СОЕДИНЕНИЯ
// ==========================================================
interface ConnectionLinesProps {
  nodes: TreeNode[];
}

const ConnectionLines: React.FC<ConnectionLinesProps> = ({ nodes }) => {
  const lines: React.ReactElement[] = [];

  const drawLines = (parent: TreeNode) => {
    if (parent.collapsed || !parent.children || parent.children.length === 0) return;

    const parentX = parent.x + CARD_WIDTH / 2;
    const parentY = parent.y + CARD_HEIGHT;

    parent.children.forEach(child => {
      if (child.x === undefined || child.y === undefined) return;

      const childX = child.x + CARD_WIDTH / 2;
      const childY = child.y;
      const midY = parentY + (childY - parentY) / 2;

      lines.push(
        <g key={`line-${parent.id}-${child.id}`}>
          <line x1={parentX} y1={parentY} x2={parentX} y2={midY}
                stroke="#CCCCCC" strokeWidth={2} />
          <line x1={parentX} y1={midY} x2={childX} y2={midY}
                stroke="#CCCCCC" strokeWidth={2} />
          <line x1={childX} y1={midY} x2={childX} y2={childY}
                stroke="#CCCCCC" strokeWidth={2} />
        </g>
      );
      drawLines(child);
    });
  };

  nodes.forEach(drawLines);

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none w-full h-full"
      style={{ 
        zIndex: 0,
        overflow: 'visible'
      }}
    >
      {lines}
    </svg>
  );
};

// ==========================================================
// 🏞️ ФОНОВАЯ СЕТКА
// ==========================================================
const TreeGrid: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
};

// ==========================================================
// 📊 ТАБЛИЧНОЕ ПРЕДСТАВЛЕНИЕ
// ==========================================================
interface TableViewProps {
  members: TeamMember[];
  selectedId: string | null;
  onSelectMember: (id: string) => void;
}

const TableView: React.FC<TableViewProps> = ({ members, selectedId, onSelectMember }) => {
  return (
    <div className="bg-white rounded-lg overflow-auto w-full h-full">
      <div className="min-w-full inline-block align-middle">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Сотрудник
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Должность
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Тариф
                </th>
                <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Руководитель
                </th>
                <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Статус
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr
                  key={member.id}
                  onClick={() => onSelectMember(member.id)}
                  className={`hover:bg-gray-50 cursor-pointer ${
                    selectedId === member.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                        {member.avatar ? (
                          <img className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" src={member.avatar} alt="" />
                        ) : (
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-2 sm:ml-4">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 flex items-center gap-1">
                          <span className="truncate max-w-[100px] sm:max-w-none">{member.name}</span>
                          {member.verified && (
                            <img src="/icons/confirmed.svg" alt="Verified" className="w-4 h-4 inline-block ml-1" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500 sm:hidden">ID: {member.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                    {member.id}
                  </td>
                  <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {member.role}
                  </td>
                  <td className="hidden md:table-cell px-6 py-3 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      member.tariff === 'Basic' ? 'text-gray-600' :
                      member.tariff === 'Business' ? 'text-blue-600' :
                      member.tariff === 'Premium' ? 'text-purple-600' :
                      'text-orange-600'
                    }`}>
                      {member.tariff}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                    {member.parentId || '—'}
                  </td>
                  <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-center">
                    {member.verified ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <span className="hidden sm:inline">Верифицирован</span>
                        <span className="sm:hidden">✓</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <span className="hidden sm:inline">Не верифицирован</span>
                        <span className="sm:hidden">✗</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================================
// 🔍 ПАНЕЛЬ ПОИСКА
// ==========================================================
interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onClear }) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim()) {
      onSearch(value);
    } else {
      onClear();
    }
  };

  const handleToggle = () => {
    if (isExpanded && query) {
      setQuery('');
      onClear();
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="absolute top-4 left-4 z-50">
      <div className={`bg-white rounded-lg shadow-md transition-all duration-300 ${
        isExpanded ? 'w-48 sm:w-56' : 'w-10'
      }`}>
        <div className="relative flex items-center">
          <button
            onClick={handleToggle}
            className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Search className="w-4 h-4 text-gray-600" />
          </button>
          {isExpanded && (
            <input
              type="text"
              placeholder="Поиск..."
              value={query}
              onChange={handleChange}
              autoFocus
              className="flex-1 pr-3 py-2 text-sm border-0 focus:outline-none"
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================================
// 🎛️ ЭЛЕМЕНТЫ УПРАВЛЕНИЯ
// ==========================================================
interface ControlsProps {
  viewMode: 'tree' | 'table';
  onViewChange: (mode: 'tree' | 'table') => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFindMe?: () => void;
  hasCurrentUser: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  viewMode, onViewChange, zoom, onZoomIn, onZoomOut, onReset, onFindMe, hasCurrentUser
}) => {
  return (
    <>
      {/* Режим просмотра - справа сверху */}
      <div className="absolute top-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-1 flex">
          <button
            onClick={() => onViewChange('tree')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'tree'
                ? 'bg-black text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewChange('table')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'table'
                ? 'bg-black text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Зум - слева под поиском */}
      {viewMode === 'tree' && (
        <div className="absolute top-16 left-4 z-50">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-1 flex gap-1">
            <button
              onClick={onZoomOut}
              className="p-2 hover:bg-gray-50 rounded transition-colors"
            >
              <ZoomOut className="w-4 h-4 text-gray-600" />
            </button>
            <div className="px-3 py-2 text-sm font-medium text-gray-700 min-w-[60px] text-center border-x border-gray-200">
              {Math.round(zoom * 100)}%
            </div>
            <button
              onClick={onZoomIn}
              className="p-2 hover:bg-gray-50 rounded transition-colors"
            >
              <ZoomIn className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Найти меня - справа снизу */}
      {viewMode === 'tree' && hasCurrentUser && (
        <div className="absolute bottom-4 right-4 z-50">
          <button
            onClick={onFindMe}
            className="p-3 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Найти меня"
          >
            <Target className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}
    </>
  );
};

// ==========================================================
// 🪝 ХУК ДЛЯ УПРАВЛЕНИЯ ПАНОРАМИРОВАНИЕМ И МАСШТАБИРОВАНИЕМ
// ==========================================================
interface PanZoomHookOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  initialZoom?: number;
  initialOffset?: { x: number; y: number };
  minZoom?: number;
  maxZoom?: number;
}

const usePanAndZoom = (options: PanZoomHookOptions) => {
  const {
    containerRef,
    initialZoom = 1,
    initialOffset = { x: 0, y: 0 },
    minZoom = 0.3,
    maxZoom = 2
  } = options;

  const [zoom, setZoom] = useState(initialZoom);
  const [offset, setOffset] = useState(initialOffset);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const touchStartDistance = useRef<number>(0);

  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(maxZoom, prev + 0.1));
  }, [maxZoom]);

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(minZoom, prev - 0.1));
  }, [minZoom]);

  const resetPanZoom = useCallback(() => {
    setZoom(initialZoom);
    setOffset(initialOffset);
  }, [initialZoom, initialOffset]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.ctrlKey) return;
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

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistance.current = distance;
    } else if (e.touches.length === 1) {
      setIsDragging(true);
      dragStart.current = {
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y
      };
    }
    e.preventDefault();
  }, [offset]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (touchStartDistance.current > 0) {
        const scale = distance / touchStartDistance.current;
        setZoom(prev => Math.max(minZoom, Math.min(maxZoom, prev * (1 + (scale - 1) * 0.05))));
        touchStartDistance.current = distance;
      }
    } else if (e.touches.length === 1 && isDragging) {
      setOffset({
        x: e.touches[0].clientX - dragStart.current.x,
        y: e.touches[0].clientY - dragStart.current.y
      });
    }
    e.preventDefault();
  }, [isDragging, minZoom, maxZoom]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    touchStartDistance.current = 0;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(prev => Math.max(minZoom, Math.min(maxZoom, prev * delta)));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [containerRef, minZoom, maxZoom]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 50;
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setOffset(prev => ({ ...prev, y: prev.y + step }));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setOffset(prev => ({ ...prev, y: prev.y - step }));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setOffset(prev => ({ ...prev, x: prev.x + step }));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setOffset(prev => ({ ...prev, x: prev.x - step }));
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut]);

  return {
    zoom,
    offset,
    isDragging,
    zoomIn,
    zoomOut,
    resetPanZoom,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    setOffset,
    setZoom
  };
};

// ==========================================================
// 🌲 КОМПОНЕНТ ДЕРЕВА
// ==========================================================
interface TreeGraphProps {
  treeNodes: TreeNode[];
  selectedMemberId: string | null;
  highlightedMemberId: string | null;
  onSelectMember: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  zoom: number;
  offset: { x: number; y: number };
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onMouseLeave: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

const TreeGraph: React.FC<TreeGraphProps> = ({
  treeNodes,
  selectedMemberId,
  highlightedMemberId,
  onSelectMember,
  onToggleCollapse,
  zoom,
  offset,
  isDragging,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}) => {
  const contentDimensions = useMemo(() => {
    let minX = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let minY = Infinity;
    
    const traverseAll = (node: TreeNode) => {
      if (node.x !== undefined && node.y !== undefined) {
        minX = Math.min(minX, node.x);
        maxX = Math.max(maxX, node.x + CARD_WIDTH);
        minY = Math.min(minY, node.y);
        maxY = Math.max(maxY, node.y + CARD_HEIGHT);
      }
      node.children.forEach(traverseAll);
    };
    
    treeNodes.forEach(traverseAll);

    if (minX === Infinity) {
      minX = 0;
      maxX = CARD_WIDTH;
      minY = 0;
      maxY = CARD_HEIGHT;
    }

    const padding = 200;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;
    
    return { width, height, minX: minX - padding, minY: minY - padding };
  }, [treeNodes]);

  const renderTreeNodes = useCallback((nodes: TreeNode[]) => {
    const allRenderedNodes: React.ReactElement[] = [];

    const render = (node: TreeNode) => {
      allRenderedNodes.push(
        <MemberCard
          key={node.id}
          member={node}
          isSelected={selectedMemberId === node.id}
          isHighlighted={highlightedMemberId === node.id}
          onSelect={onSelectMember}
          onToggleCollapse={onToggleCollapse}
        />
      );
      if (!node.collapsed) {
        node.children.forEach(render);
      }
    };

    nodes.forEach(render);
    return allRenderedNodes;
  }, [selectedMemberId, highlightedMemberId, onSelectMember, onToggleCollapse]);

  return (
    <div
      className="w-full h-full overflow-hidden relative"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none'
      }}
    >
      <TreeGrid />
      <div
        className="absolute"
        style={{
          width: `${Math.max(contentDimensions.width, 10000)}px`,
          height: `${Math.max(contentDimensions.height, 10000)}px`,
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transformOrigin: 'top left',
        }}
      >
        <ConnectionLines nodes={treeNodes} />
        {renderTreeNodes(treeNodes)}
      </div>
    </div>
  );
};

// ==========================================================
// 🚀 ГЛАВНЫЙ КОМПОНЕНТ TEAMTREE
// ==========================================================
const TeamTree: React.FC<TeamTreeProps> = ({
  members,
  currentUserId,
  onSelectMember,
  onEditMember,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [highlightedMemberId, setHighlightedMemberId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'table'>('tree');
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
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
    handleMouseLeave,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    setOffset,
    setZoom
  } = usePanAndZoom({
    containerRef,
    initialZoom: 1,
    initialOffset: { x: 0, y: 0 }
  });

  const { nodes: treeNodes, minXAll, maxXAll, minYAll, maxYAll } = useMemo(() => {
    const nodes = buildAndLayoutTree(members, collapsedNodes);
    
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    if (nodes.length === 0) {
      minX = 0;
      maxX = CARD_WIDTH;
      minY = 0;
      maxY = CARD_HEIGHT;
    } else {
      nodes.forEach(node => {
        const traverseForBounds = (n: TreeNode) => {
          if (n.x !== undefined && n.y !== undefined) {
            minX = Math.min(minX, n.x);
            maxX = Math.max(maxX, n.x + CARD_WIDTH);
            minY = Math.min(minY, n.y);
            maxY = Math.max(maxY, n.y + CARD_HEIGHT);
          }
          n.children.forEach(traverseForBounds);
        };
        traverseForBounds(node);
      });
    }

    if (minX === Infinity || maxX === -Infinity || minY === Infinity || maxY === -Infinity) {
      minX = 0;
      maxX = CARD_WIDTH;
      minY = 0;
      maxY = CARD_HEIGHT;
    }

    return { nodes, minXAll: minX, maxXAll: maxX, minYAll: minY, maxYAll: maxY };
  }, [members, collapsedNodes]);

  useEffect(() => {
    const setInitialView = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        
        let newZoom = 1;
        if (containerWidth < 768) {
          newZoom = 0.6;
        } else if (containerWidth < 1024) {
          newZoom = 0.8;
        } else {
          newZoom = 1;
        }
        setZoom(newZoom);

        const treeActualWidth = maxXAll - minXAll;
        const treeActualHeight = maxYAll - minYAll;

        const centerOfTreeX = minXAll + treeActualWidth / 2;
        const centerOfTreeY = minYAll + treeActualHeight / 2;

        const initialOffsetX = (containerWidth / 2) - (centerOfTreeX * newZoom);
        const initialOffsetY = (containerHeight / 2) - (centerOfTreeY * newZoom);

        setOffset({ x: initialOffsetX, y: initialOffsetY });
      }
    };

    setInitialView();
    window.addEventListener('resize', setInitialView);
    return () => window.removeEventListener('resize', setInitialView);
  }, [setOffset, setZoom, minXAll, maxXAll, minYAll, maxYAll]);

  const handleSelectMember = useCallback((memberId: string) => {
    setSelectedMemberId(memberId);
    const member = members.find(m => m.id === memberId);
    if (member && onSelectMember) {
      onSelectMember(member);
    }
  }, [members, onSelectMember]);

  const handleToggleCollapse = useCallback((nodeId: string) => {
    setCollapsedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  const centerOnMember = useCallback((memberId: string) => {
    const findNode = (nodes: TreeNode[]): TreeNode | null => {
      for (const node of nodes) {
        if (node.id === memberId) return node;
        const found = findNode(node.children);
        if (found) return found;
      }
      return null;
    };

    const node = findNode(treeNodes);
    if (node && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      setOffset({
        x: (containerWidth / 2) - ((node.x + CARD_WIDTH / 2) * zoom),
        y: (containerHeight / 2) - ((node.y + CARD_HEIGHT / 2) * zoom)
      });
    }
  }, [treeNodes, zoom, setOffset]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    const foundMember = members.find(m =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.id.toLowerCase().includes(query.toLowerCase())
    );

    if (foundMember) {
      setHighlightedMemberId(foundMember.id);
      centerOnMember(foundMember.id);
    } else {
      setHighlightedMemberId(null);
    }
  }, [members, centerOnMember]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setHighlightedMemberId(null);
  }, []);

  const handleFindMe = useCallback(() => {
    if (currentUserId) {
      setSelectedMemberId(currentUserId);
      setHighlightedMemberId(currentUserId);
      centerOnMember(currentUserId);
    }
  }, [currentUserId, centerOnMember]);

  return (
    <div className={`relative w-full h-full bg-[#FAFAFA] ${className}`}>
      {viewMode === 'tree' && (
        <SearchBar onSearch={handleSearch} onClear={handleClearSearch} />
      )}
      
      <Controls
        viewMode={viewMode}
        onViewChange={setViewMode}
        zoom={zoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onReset={resetPanZoom}
        onFindMe={handleFindMe}
        hasCurrentUser={!!currentUserId}
      />
      
      <div ref={containerRef} className="w-full h-full relative overflow-hidden">
        {viewMode === 'tree' ? (
          <TreeGraph
            treeNodes={treeNodes}
            selectedMemberId={selectedMemberId}
            highlightedMemberId={highlightedMemberId}
            onSelectMember={handleSelectMember}
            onToggleCollapse={handleToggleCollapse}
            zoom={zoom}
            offset={offset}
            isDragging={isDragging}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        ) : (
          <div className="p-4 sm:p-8 pt-16 sm:pt-20 h-full">
            <TableView
              members={members}
              selectedId={selectedMemberId}
              onSelectMember={handleSelectMember}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamTree;