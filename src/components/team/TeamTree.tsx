import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ZoomIn, ZoomOut, Grid3x3, List, Briefcase, User, Search, ChevronDown, ChevronRight, Home, Target } from 'lucide-react';

const CARD_WIDTH  = 220;
const CARD_HEIGHT = 200;
// =================== TYPES ===================
interface TeamMember {
  id: string;
  parentId: string | null;
  name: string;
  avatar?: string;
  tariff: 'Basic' | 'Business' | 'Premium' | 'Enterprise';
  role: string;
  verified: boolean;
  teamCount?: number;
}

interface TreeNode extends TeamMember {
  children: TreeNode[];
  level: number;
  x?: number;
  y?: number;
  collapsed?: boolean;
  totalDescendants?: number;
}

interface TeamTreeProps {
  members: TeamMember[];
  currentUserId?: string; // ID текущего пользователя для функции "Найти меня"
  onSelectMember?: (member: TeamMember) => void;
  onEditMember?: (member: TeamMember) => void;
  className?: string;
}

// =================== TREE BUILDER UTILITY ===================
const buildTree = (members: TeamMember[]): TreeNode[] => {
  const memberMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];
  
  // Create nodes
  members.forEach(member => {
    memberMap.set(member.id, { 
      ...member, 
      children: [], 
      level: 0,
      collapsed: false,
      totalDescendants: 0
    });
  });
  
  // Build relationships
  members.forEach(member => {
    const node = memberMap.get(member.id)!;
    if (member.parentId && memberMap.has(member.parentId)) {
      const parent = memberMap.get(member.parentId)!;
      parent.children.push(node);
      node.level = parent.level + 1;
    } else {
      roots.push(node);
    }
  });
  
  // Calculate total descendants
  const calculateDescendants = (node: TreeNode): number => {
    let count = node.children.length;
    node.children.forEach(child => {
      count += calculateDescendants(child);
    });
    node.totalDescendants = count;
    return count;
  };
  
  roots.forEach(root => calculateDescendants(root));
  
  const H_SPACING = 100;
  const V_SPACING = 120;
  
  const calculateWidth = (node: TreeNode): number => {
    if (node.collapsed || node.children.length === 0) {
      return CARD_WIDTH;
    }
    const childrenWidth = node.children.reduce((sum, child) => 
      sum + calculateWidth(child) + H_SPACING, -H_SPACING
    );
    return Math.max(CARD_WIDTH, childrenWidth);
  };
  
  const calculatePositions = (node: TreeNode, x: number, y: number) => {
    node.x = x;
    node.y = y;
    
    if (!node.collapsed && node.children.length > 0) {
      const nodeWidth = calculateWidth(node);
      const nodeCenter = x + CARD_WIDTH / 2;
      let childX = nodeCenter - nodeWidth / 2;
      
      node.children.forEach(child => {
        const childWidth = calculateWidth(child);
        const childCenter = childX + childWidth / 2;
        calculatePositions(
          child, 
          childCenter - CARD_WIDTH / 2, 
          y + CARD_HEIGHT + V_SPACING
        );
        childX += childWidth + H_SPACING;
      });
    }
  };
  
  // Center the tree
  const totalWidth = roots.reduce((sum, root) => sum + calculateWidth(root) + H_SPACING * 2, 0);
  let currentX = Math.max(100, (typeof window !== 'undefined' ? window.innerWidth - totalWidth : 1200 - totalWidth) / 2);
  
  roots.forEach(root => {
    const width = calculateWidth(root);
    calculatePositions(root, currentX, 80);
    currentX += width + H_SPACING * 2;
  });
  
  return roots;
};

// =================== BREADCRUMBS ===================
const Breadcrumbs: React.FC<{
  member: TeamMember | null;
  members: TeamMember[];
  onNavigate: (id: string) => void;
}> = ({ member, members, onNavigate }) => {
  if (!member) return null;
  
  const path: TeamMember[] = [];
  let current: TeamMember | undefined = member;
  
  while (current) {
    path.unshift(current);
    current = members.find(m => m.id === current?.parentId);
  }
  
  return (
    <div className="absolute top-14 left-4 bg-white rounded-lg shadow-md px-3 py-2 z-40 max-w-[calc(100%-2rem)] overflow-x-auto">
      <div className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap">
        <button
          onClick={() => onNavigate('')}
          className="text-gray-400 hover:text-gray-600"
        >
          <Home className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
        {path.map((item, index) => (
          <React.Fragment key={item.id}>
            <span className="text-gray-400">/</span>
            <button
              onClick={() => onNavigate(item.id)}
              className={`hover:text-blue-600 transition-colors truncate max-w-[100px] sm:max-w-[150px] ${
                index === path.length - 1 ? 'text-gray-900 font-medium' : 'text-gray-600'
              }`}
            >
              {item.name}
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// =================== SEARCH BAR ===================
const SearchBar: React.FC<{
  onSearch: (query: string) => void;
  onClear: () => void;
}> = ({ onSearch, onClear }) => {
  const [query, setQuery] = useState('');
  
  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      onSearch(value);
    } else {
      onClear();
    }
  };
  
  return (
    <div className="absolute top-4 left-4 z-50 bg-white rounded-lg shadow-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Поиск по имени или ID..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-4 py-2 w-48 sm:w-64 text-sm border-0 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

// =================== MEMBER CARD COMPONENT ===================
const MemberCard: React.FC<{
  member: TreeNode;
  isSelected: boolean;
  isHighlighted: boolean;
  onSelect: () => void;
  onToggleCollapse?: () => void;
}> = ({ member, isSelected, isHighlighted, onSelect, onToggleCollapse }) => {
  const tariffColors = {
    Basic: 'text-gray-600',
    Business: 'text-blue-600',
    Premium: 'text-purple-600',
    Enterprise: 'text-orange-600'
  };

  return (
    <div
      className={`absolute bg-white rounded-2xl shadow-md border-2 transition-all duration-300 hover:shadow-lg cursor-pointer
        ${isSelected ? 'border-blue-500 shadow-xl ring-2 ring-blue-200' : 
          isHighlighted ? 'border-yellow-400 shadow-xl ring-2 ring-yellow-200' : 
          'border-gray-200 hover:border-gray-300'}
      `}
      style={{
        left: `${member.x}px`,
        top: `${member.y}px`,
        width: '220px',
        zIndex: isSelected || isHighlighted ? 100 : member.level + 10
      }}
      onClick={onSelect}
    >
      <div className="p-4">
        {/* Collapse/Expand button */}
        {member.children.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse?.();
            }}
            className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            {member.collapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
        )}
        
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <div className="relative mb-3">
            {member.avatar ? (
              <div className="w-14 h-14 rounded-full overflow-auto border-2 border-orange-400">
                <img 
                  src={member.avatar} 
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="w-7 h-7 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Name and Verification */}
          <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-1 mb-1 text-center">
            {member.name}
            {member.verified && (
              <img 
                src="/icons/IconCheckMarkBlue.svg" 
                alt="Verified" 
                className="w-4 h-4"
              />
            )}
          </h3>
          
          {/* ID */}
          <p className="text-xs text-gray-500 mb-2">ID: {member.id}</p>
          
          {/* Tariff */}
          <div className="text-xs mb-2">
            <span className="text-gray-500">Тариф: </span>
            <span className={`font-medium ${tariffColors[member.tariff]}`}>
              {member.tariff}
            </span>
          </div>
          
          {/* Role with Icon */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
            <Briefcase className="w-3 h-3 text-gray-400" />
            <span>{member.role}</span>
          </div>
          
          {/* Team stats badges */}
          <div className="flex gap-2 text-xs">
            {member.children.length > 0 && (
              <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                Прямых: {member.children.length}
              </div>
            )}
            {(member.totalDescendants ?? 0) > 0 && (
              <div className="bg-green-50 text-green-700 px-2 py-1 rounded-full">
                Всего: {member.totalDescendants}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// =================== CONNECTION LINES ===================
const ConnectionLines: React.FC<{
  nodes: TreeNode[];
  width: number;
  height: number;
}> = ({ nodes, width, height }) => {
  const lines: React.ReactElement[] = [];

const drawLines = (parent: TreeNode) => {
  if (parent.collapsed || parent.children.length === 0) return;

  const parentX = (parent.x ?? 0) + CARD_WIDTH/2;
  const parentY = (parent.y ?? 0) + CARD_HEIGHT;

  parent.children.forEach(child => {
    // ← «== null» отсекает только undefined и null
    if (child.x == null || child.y == null) return;

    const childX = child.x + CARD_WIDTH/2;
    const childY = child.y;
    const midY   = parentY + (childY - parentY)/2;

    lines.push(
      <g key={`line-${parent.id}-${child.id}`}>
        <line x1={parentX} y1={parentY} x2={parentX} y2={midY}
              stroke="#0e3d8f" strokeWidth={2}/>
        <line x1={parentX} y1={midY}   x2={childX}  y2={midY}
              stroke="#5e0da0" strokeWidth={2}/>
        <line x1={childX}  y1={midY}   x2={childX}  y2={childY}
              stroke="#da0994" strokeWidth={2}/>
      </g>
    );
    drawLines(child);
  });
};

  nodes.forEach(drawLines);

  return (
    <svg
      width={width}
      height={height}
      className="absolute top-0 left-0 pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {lines}
    </svg>
  );
};

// =================== GRID BACKGROUND ===================
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

// =================== TABLE VIEW ===================
const TableView: React.FC<{
  members: TeamMember[];
  selectedId: string | null;
  onSelectMember: (id: string) => void;
}> = ({ members, selectedId, onSelectMember }) => {
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
                            <img src="/icons/IconCheckMarkBlue.svg" alt="V" className="w-3 h-3 sm:w-4 sm:h-4" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500 sm:hidden">{member.id}</div>
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

// =================== CONTROLS ===================
const Controls: React.FC<{
  viewMode: 'tree' | 'table';
  onViewChange: (mode: 'tree' | 'table') => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFindMe?: () => void;
  hasCurrentUser?: boolean;
}> = ({ viewMode, onViewChange, zoom, onZoomIn, onZoomOut, onReset, onFindMe, hasCurrentUser }) => {
  return (
    <div className="absolute top-4 right-4 z-50 flex flex-col sm:flex-row gap-2">
      {/* View Mode Toggle */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-1 flex">
        <button
          onClick={() => onViewChange('tree')}
          className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded flex items-center gap-1 sm:gap-2 transition-colors text-xs sm:text-sm ${
            viewMode === 'tree' 
              ? 'bg-blue-500 text-white' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Grid3x3 className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Дерево</span>
        </button>
        <button
          onClick={() => onViewChange('table')}
          className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded flex items-center gap-1 sm:gap-2 transition-colors text-xs sm:text-sm ${
            viewMode === 'table' 
              ? 'bg-blue-500 text-white' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <List className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Список</span>
        </button>
      </div>
      
      {/* Tree controls */}
      {viewMode === 'tree' && (
        <>
          {/* Find me button */}
          {hasCurrentUser && (
            <button
              onClick={onFindMe}
              className="p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
              title="Найти меня"
            >
              <Target className="w-4 h-4 text-gray-600" />
            </button>
          )}
          
          {/* Zoom controls */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-1 flex gap-1">
            <button
              onClick={onZoomOut}
              className="p-1.5 sm:p-2 hover:bg-gray-50 rounded transition-colors"
              title="Уменьшить"
            >
              <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
            </button>
            <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 min-w-[50px] sm:min-w-[60px] text-center border-x border-gray-200">
              {Math.round(zoom * 100)}%
            </div>
            <button
              onClick={onZoomIn}
              className="p-1.5 sm:p-2 hover:bg-gray-50 rounded transition-colors"
              title="Увеличить"
            >
              <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
            </button>
          </div>
          
          <button
            onClick={onReset}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white hover:bg-gray-50 rounded-lg shadow-md border border-gray-200 transition-colors text-xs sm:text-sm text-gray-700"
          >
            <span className="hidden sm:inline">Сброс</span>
            <span className="sm:hidden">↺</span>
          </button>
        </>
      )}
    </div>
  );
};

// =================== MAIN TEAM TREE COMPONENT ===================
const TeamTree: React.FC<TeamTreeProps> = ({ 
  members, 
  currentUserId,
  onSelectMember,
  onEditMember,
  className = ''
}) => {

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [highlightedMemberId, setHighlightedMemberId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'table'>('tree');
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartDistance = useRef<number>(0);
  
  // Build tree with collapse state
  const treeNodes = useMemo(() => {
    const nodes = buildTree(members);
    // Apply collapse state
    const applyCollapse = (node: TreeNode) => {
      node.collapsed = collapsedNodes.has(node.id);
      node.children.forEach(applyCollapse);
    };
    nodes.forEach(applyCollapse);
    return nodes;
  }, [members, collapsedNodes]);
  // вычисляем общий размер «холста», который займут все карточки
const [totalSize, setTotalSize] = useState({ width: 0, height: 0 });

useEffect(() => {
  let maxX = 0, maxY = 0;

  const traverse = (node: TreeNode) => {
    if (node.x !== undefined && node.y !== undefined) {
      maxX = Math.max(maxX, node.x + CARD_WIDTH);
      maxY = Math.max(maxY, node.y + CARD_HEIGHT);
    }
    node.children.forEach(traverse);
  };

  treeNodes.forEach(traverse);
  setTotalSize({ width: maxX, height: maxY });
}, [treeNodes]);
// ——————————————————————————————————————————————————————————————————

  // Set initial zoom based on screen size
  useEffect(() => {
    const setInitialView = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setZoom(0.6);
      } else if (width < 1024) {
        setZoom(0.8);
      } else {
        setZoom(1);
      }
    };

    setInitialView();
    window.addEventListener('resize', setInitialView);
    return () => window.removeEventListener('resize', setInitialView);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (viewMode !== 'tree') return;
      
      const step = 50;
      switch(e.key) {
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
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [viewMode]);

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistance.current = distance;
    } else if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      if (touchStartDistance.current > 0) {
        const scale = distance / touchStartDistance.current;
        setZoom(prev => Math.max(0.3, Math.min(2, prev * (1 + (scale - 1) * 0.01))));
      }
    } else if (e.touches.length === 1 && isDragging) {
      setOffset({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDistance.current = 0;
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!e.ctrlKey && viewMode === 'tree') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom controls
  const handleZoomIn = () => {
    const maxZoom = window.innerWidth < 768 ? 1.5 : 2;
    setZoom(prev => Math.min(maxZoom, prev + 0.1));
  };

  const handleZoomOut = () => {
    const minZoom = window.innerWidth < 768 ? 0.3 : 0.5;
    setZoom(prev => Math.max(minZoom, prev - 0.1));
  };

  const handleReset = () => {
    const width = window.innerWidth;
    if (width < 768) {
      setZoom(0.6);
    } else if (width < 1024) {
      setZoom(0.8);
    } else {
      setZoom(1);
    }
    setOffset({ x: 0, y: 0 });
    setHighlightedMemberId(null);
  };

  // Handle member selection
  const handleSelectMember = (memberId: string) => {
    setSelectedMemberId(memberId);
    const member = members.find(m => m.id === memberId);
    if (member && onSelectMember) {
      onSelectMember(member);
    }
  };

  // Toggle collapse
  const handleToggleCollapse = (nodeId: string) => {
    setCollapsedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const foundMember = members.find(m => 
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.id.toLowerCase().includes(query.toLowerCase())
    );
    
    if (foundMember) {
      setHighlightedMemberId(foundMember.id);
      centerOnMember(foundMember.id);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setHighlightedMemberId(null);
  };

  // Find me functionality
  const handleFindMe = () => {
    if (currentUserId) {
      setSelectedMemberId(currentUserId);
      setHighlightedMemberId(currentUserId);
      centerOnMember(currentUserId);
    }
  };

  // Center view on specific member
  const centerOnMember = (memberId: string) => {
    const findNode = (nodes: TreeNode[]): TreeNode | null => {
      for (const node of nodes) {
        if (node.id === memberId) return node;
        const found = findNode(node.children);
        if (found) return found;
      }
      return null;
    };
    
    const node = findNode(treeNodes);
    if (node && node.x !== undefined && node.y !== undefined) {
      const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
      const containerHeight = containerRef.current?.clientHeight || window.innerHeight;
      
      setOffset({
        x: containerWidth / 2 - (node.x + 110) * zoom,
        y: containerHeight / 2 - (node.y + 100) * zoom
      });
    }
  };

  // Navigate via breadcrumbs
  const handleNavigate = (memberId: string) => {
    if (memberId) {
      setSelectedMemberId(memberId);
      centerOnMember(memberId);
    } else {
      setSelectedMemberId(null);
      handleReset();
    }
  };

  // Zoom with Ctrl + Scroll
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey && viewMode === 'tree') {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(prev => Math.max(0.3, Math.min(2, prev * delta)));
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [viewMode]);

  // Render tree nodes
  const renderTree = (nodes: TreeNode[]) => {
    const allNodes: React.ReactElement[] = [];
    
    const render = (node: TreeNode) => {
      allNodes.push(
        <MemberCard
          key={node.id}
          member={node}
          isSelected={selectedMemberId === node.id}
          isHighlighted={highlightedMemberId === node.id}
          onSelect={() => handleSelectMember(node.id)}
          onToggleCollapse={() => handleToggleCollapse(node.id)}
        />
      );
      if (!node.collapsed) {
        node.children.forEach(render);
      }
    };
    
    nodes.forEach(render);
    return allNodes;
  };

  const selectedMember = members.find(m => m.id === selectedMemberId) || null;

  return (
    <div className={`relative w-full h-full bg-[#FAFAFA] overflow-auto ${className}`}>
      {viewMode === 'tree' && (
        <>
          <SearchBar onSearch={handleSearch} onClear={handleClearSearch} />
          <Breadcrumbs
            member={selectedMember}
            members={members}
            onNavigate={handleNavigate}
          />
        </>
      )}
      
      <Controls
        viewMode={viewMode}
        onViewChange={setViewMode}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        onFindMe={handleFindMe}
        hasCurrentUser={!!currentUserId}
      />
      
      {viewMode === 'tree' ? (
        <div
          ref={containerRef}
          className="w-full h-full overflow-auto relative"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ 
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none'
          }}
        >
          <TreeGrid />
<div
  className="absolute"
  style={{
    width:  totalSize.width,
    height: totalSize.height,
    transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
    transformOrigin: 'center center',
    transition: isDragging ? 'none' : 'transform 0.3s ease'
  }}
>
  {/* Передаём ширину/высоту в ConnectionLines */}
  <ConnectionLines
    nodes={treeNodes}
    width={totalSize.width}
    height={totalSize.height}
  />
  {renderTree(treeNodes)}
</div>
        </div>
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
  );
};

export default TeamTree;