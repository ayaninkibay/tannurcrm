// src/components/product/TeamMemberRow.tsx
'use client';

import React from 'react';
import { useTranslate } from '@/hooks/useTranslate';

export interface TeamMember {
  id: string;
  name: string;
  profession?: string;
  date?: string;
  status?: 'active' | 'blocked';
  commands?: number;
  avatar?: string;
}

interface TeamMemberRowProps {
  member: TeamMember;
  onClick?: (member: TeamMember) => void;
  className?: string;
}

const TeamMemberRow: React.FC<TeamMemberRowProps> = ({
  member,
  onClick,
  className = '',
}) => {
  const { t } = useTranslate();
  const handleClick = () => onClick?.(member);

  const getInitials = (name: string): string =>
    (name || '??')
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return t('АКТИВЕН');
      case 'blocked':
        return t('БЛОК');
      default:
        return t('НЕИЗВЕСТНО');
    }
  };

  const commandsValue = (member.commands ?? 0);

  return (
    <tr
      className={`hover:bg-gray-50 transition-colors cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#DC7C67] to-[#BE345D] rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
            {member.avatar ? (
              <img
                src={member.avatar}
                alt={member.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-xs sm:text-sm font-medium text-white">
                {getInitials(member.name)}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
              {member.name}
            </div>
            <div className="text-xs text-gray-500 truncate sm:hidden">
              {member.profession || t('Не указано')}
            </div>
          </div>
        </div>
      </td>

      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
        <span className="text-xs sm:text-sm text-gray-600">
          {member.profession || t('Не указано')}
        </span>
      </td>

      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
        <span className="text-xs sm:text-sm text-gray-600">{member.date || '-'}</span>
      </td>

      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell">
        <span className="text-xs sm:text-sm text-gray-900 font-mono bg-gray-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-center">
          {member.id || 'N/A'}
        </span>
      </td>

      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-xs sm:text-sm font-medium text-gray-900">
            {commandsValue.toLocaleString()}
          </span>
          {commandsValue > 50 && (
            <span className="ml-1 sm:ml-2 inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              {t('Топ')}
            </span>
          )}
        </div>
      </td>

      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
        <span
          className={`inline-flex px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 text-xs font-medium rounded-full ${getStatusColor(
            member.status || 'unknown'
          )}`}
        >
          {getStatusText(member.status || 'unknown')}
        </span>
      </td>
    </tr>
  );
};

export default TeamMemberRow;
