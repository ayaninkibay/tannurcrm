import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ZoomIn, ZoomOut, Grid3x3, Users, List, Briefcase, User } from 'lucide-react';

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
}

interface TeamTreeProps {
  members: TeamMember[];
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
    memberMap.set(member.id, { ...member, children: [], level: 0 });
  });
  
  // Build relationships and count team members
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
  
  // Calculate positions
  const calculatePositions = (nodes: TreeNode[], startX = 0, startY = 0) => {
    const CARD_WIDTH = 220;
    const CARD_HEIGHT = 180;
    const H_SPACING = 80;
    const V_SPACING = 100;
    
    let currentX = startX;
    
    nodes.forEach(node => {
      node.x = currentX;
      node.y = startY;
      
      if (node.children.length > 0) {
        const childrenWidth = node.children.length * (CARD_WIDTH + H_SPACING) - H_SPACING;
        const childStartX = node.x - childrenWidth / 2 + CARD_WIDTH / 2;
        calculatePositions(node.children, childStartX, startY + CARD_HEIGHT + V_SPACING);
      }
      
      currentX += CARD_WIDTH + H_SPACING;
    });
  };
  
  calculatePositions(roots, 500, 80);
  return roots;
};

// =================== MEMBER CARD COMPONENT ===================
const MemberCard: React.FC<{
  member: TreeNode;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ member, isSelected, onSelect }) => {
  const tariffColors = {
    Basic: 'text-gray-600',
    Business: 'text-blue-600',
    Premium: 'text-purple-600',
    Enterprise: 'text-orange-600'
  };

  return (
    <div
      className={`absolute bg-white rounded-2xl shadow-md border transition-all duration-300 hover:shadow-lg cursor-pointer
        ${isSelected ? 'border-blue-400 shadow-xl' : 'border-gray-200 hover:border-gray-300'}
      `}
      style={{
        left: `${member.x}px`,
        top: `${member.y}px`,
        width: '220px',
        zIndex: isSelected ? 100 : member.level + 10
      }}
      onClick={onSelect}
    >
      <div className="p-5">
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <div className="relative mb-3">
            {member.avatar ? (
              <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-orange-400 p-0.5">
                <img 
                  src={member.avatar} 
                  alt={member.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Name and Verification */}
          <h3 className="font-semibold text-gray-900 text-base flex items-center gap-1.5 mb-1">
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
          <p className="text-sm text-gray-500 mb-2">ID: {member.id}</p>
          
          {/* Tariff */}
          <div className="text-sm mb-3">
            <span className="text-gray-500">Тариф: </span>
            <span className={`font-medium ${tariffColors[member.tariff]}`}>
              {member.tariff}
            </span>
          </div>
          
          {/* Role with Icon */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Briefcase className="w-4 h-4 text-gray-400" />
            <span>{member.role}</span>
          </div>
          
          {/* Team Count */}
          {member.children.length > 0 && (
            <div className="text-sm text-gray-500">
              Команда: {member.children.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =================== CONNECTION LINES ===================
const ConnectionLines: React.FC<{ nodes: TreeNode[] }> = ({ nodes }) => {
  const lines: React.ReactElement[] = [];
  
  const drawLines = (parent: TreeNode) => {
    if (parent.children.length === 0) return;
    
    const parentX = (parent.x || 0) + 110; // Center of parent card
    const parentY = (parent.y || 0) + 180; // Bottom of parent card
    
    // Draw horizontal line if multiple children
    if (parent.children.length > 1) {
      const firstChildX = (parent.children[0].x || 0) + 110;
      const lastChildX = (parent.children[parent.children.length - 1].x || 0) + 110;
      const horizontalY = parentY + 50;
      
      // Vertical line from parent
      lines.push(
        <line
          key={`${parent.id}-vertical`}
          x1={parentX}
          y1={parentY}
          x2={parentX}
          y2={horizontalY}
          stroke="#D1D5DB"
          strokeWidth="2"
        />
      );
      
      // Horizontal line connecting all children
      lines.push(
        <line
          key={`${parent.id}-horizontal`}
          x1={firstChildX}
          y1={horizontalY}
          x2={lastChildX}
          y2={horizontalY}
          stroke="#D1D5DB"
          strokeWidth="2"
        />
      );
      
      // Lines to each child
      parent.children.forEach(child => {
        const childX = (child.x || 0) + 110;
        const childY = child.y || 0;
        
        lines.push(
          <line
            key={`${parent.id}-${child.id}`}
            x1={childX}
            y1={horizontalY}
            x2={childX}
            y2={childY}
            stroke="#D1D5DB"
            strokeWidth="2"
          />
        );
      });
    } else {
      // Single child - direct line
      const child = parent.children[0];
      const childX = (child.x || 0) + 110;
      const childY = child.y || 0;
      
      lines.push(
        <line
          key={`${parent.id}-${child.id}`}
          x1={parentX}
          y1={parentY}
          x2={childX}
          y2={childY}
          stroke="#D1D5DB"
          strokeWidth="2"
        />
      );
    }
    
    // Recursively draw lines for children
    parent.children.forEach(child => drawLines(child));
  };
  
  nodes.forEach(drawLines);
  
  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
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
    <div className="bg-white rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Сотрудник
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Должность
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Тариф
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Руководитель
            </th>
            <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Статус
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {members.map((member) => (
            <tr
              key={member.id}
              onClick={() => onSelectMember(member.id)}
              className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedId === member.id ? 'bg-blue-50' : ''
              }`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {member.avatar ? (
                      <img className="h-10 w-10 rounded-full" src={member.avatar} alt="" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                      {member.name}
                      {member.verified && (
                        <img src="/icons/IconCheckMarkBlue.svg" alt="Verified" className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {member.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {member.role}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`text-sm font-medium ${
                  member.tariff === 'Basic' ? 'text-gray-600' :
                  member.tariff === 'Business' ? 'text-blue-600' :
                  member.tariff === 'Premium' ? 'text-purple-600' :
                  'text-orange-600'
                }`}>
                  {member.tariff}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {member.parentId || '—'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                {member.verified ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Верифицирован
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Не верифицирован
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
}> = ({ viewMode, onViewChange, zoom, onZoomIn, onZoomOut, onReset }) => {
  return (
    <div className="absolute top-4 right-4 z-50 flex gap-3">
      {/* View Mode Toggle */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-1 flex">
        <button
          onClick={() => onViewChange('tree')}
          className={`px-3 py-2 rounded flex items-center gap-2 transition-colors text-sm ${
            viewMode === 'tree' 
              ? 'bg-blue-500 text-white' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Grid3x3 className="w-4 h-4" />
          Дерево
        </button>
        <button
          onClick={() => onViewChange('table')}
          className={`px-3 py-2 rounded flex items-center gap-2 transition-colors text-sm ${
            viewMode === 'table' 
              ? 'bg-blue-500 text-white' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <List className="w-4 h-4" />
          Список
        </button>
      </div>
      
      {/* Zoom Controls - Only show in tree mode */}
      {viewMode === 'tree' && (
        <>
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-1 flex gap-1">
            <button
              onClick={onZoomOut}
              className="p-2 hover:bg-gray-50 rounded transition-colors"
              title="Уменьшить"
            >
              <ZoomOut className="w-4 h-4 text-gray-600" />
            </button>
            <div className="px-3 py-2 text-sm font-medium text-gray-700 min-w-[60px] text-center border-x border-gray-200">
              {Math.round(zoom * 100)}%
            </div>
            <button
              onClick={onZoomIn}
              className="p-2 hover:bg-gray-50 rounded transition-colors"
              title="Увеличить"
            >
              <ZoomIn className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          
          <button
            onClick={onReset}
            className="px-4 py-2 bg-white hover:bg-gray-50 rounded-lg shadow-md border border-gray-200 transition-colors text-sm text-gray-700"
          >
            Сброс
          </button>
        </>
      )}
    </div>
  );
};

// =================== MAIN TEAM TREE COMPONENT ===================
const TeamTree: React.FC<TeamTreeProps> = ({ 
  members, 
  onSelectMember,
  onEditMember,
  className = ''
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'table'>('tree');
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const treeNodes = useMemo(() => buildTree(members), [members]);

  // Handle member selection
  const handleSelectMember = (memberId: string) => {
    setSelectedMemberId(memberId);
    const member = members.find(m => m.id === memberId);
    if (member && onSelectMember) {
      onSelectMember(member);
    }
  };

  // Zoom with Ctrl + Scroll
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey && viewMode === 'tree') {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(prev => Math.max(0.5, Math.min(2, prev * delta)));
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [viewMode]);

  // Drag functionality
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

  // Render tree nodes
  const renderTree = (nodes: TreeNode[]) => {
    const allNodes: React.ReactElement[] = [];
    
    const render = (node: TreeNode) => {
      allNodes.push(
        <MemberCard
          key={node.id}
          member={node}
          isSelected={selectedMemberId === node.id}
          onSelect={() => handleSelectMember(node.id)}
        />
      );
      node.children.forEach(render);
    };
    
    nodes.forEach(render);
    return allNodes;
  };

  return (
    <div className={`relative w-full h-full bg-[#FAFAFA] overflow-hidden ${className}`}>
      <div className="absolute top-4 left-4 z-50">
        <h2 className="text-xl font-semibold text-gray-900">Древо команды</h2>
      </div>
      
      <Controls
        viewMode={viewMode}
        onViewChange={setViewMode}
        zoom={zoom}
        onZoomIn={() => setZoom(prev => Math.min(2, prev + 0.1))}
        onZoomOut={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
        onReset={() => {
          setZoom(1);
          setOffset({ x: 0, y: 0 });
        }}
      />
      
      {viewMode === 'tree' ? (
        <div
          ref={containerRef}
          className="w-full h-full overflow-hidden relative"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <TreeGrid />
          <div
            className="absolute"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transformOrigin: 'top left',
              transition: isDragging ? 'none' : 'transform 0.3s ease'
            }}
          >
            <ConnectionLines nodes={treeNodes} />
            {renderTree(treeNodes)}
          </div>
        </div>
      ) : (
        <div className="p-8 pt-20 h-full overflow-auto">
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