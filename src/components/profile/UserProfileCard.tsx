'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { useTranslate } from '@/hooks/useTranslate';
import { Briefcase, MapPin, Phone, Crown, Star, Shield, Package, ChevronRight } from 'lucide-react';

interface UserProfileCardProps {
  href?: string;
}

export default function UserProfileCard({ href = '/dealer/profile' }: UserProfileCardProps) {
  const { profile, loading } = useUser();
  const { t } = useTranslate();
  const router = useRouter();

  // Функция для получения данных роли
  const getRoleData = (role: string | null) => {
    switch(role) {
      case 'admin':
        return {
          name: t('Администратор'),
          icon: Shield
        };
      case 'dealer':
        return {
          name: t('Дилер'),
          icon: Package
        };
      case 'celebrity':
        return {
          name: t('Селебрити'),
          icon: Star
        };
      default:
        return {
          name: t('Пользователь'),
          icon: null
        };
    }
  };

  const handleClick = () => {
    router.push(href);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-center h-20">
          <p className="text-gray-400 text-sm">{t('Профиль не найден')}</p>
        </div>
      </div>
    );
  }

  const roleData = getRoleData(profile.role);
  const RoleIcon = roleData.icon;

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer relative"
    >
      {/* Верхняя полоса */}
      <div className="h-1 bg-[#E89480]" />
      
      {/* Стрелка справа сверху */}
      <div className="absolute top-3 right-3 p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
      
      <div className="p-5">
        <div className="flex items-center gap-4">
          {/* Аватар */}
          <div className="relative">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-50 border-2 border-white shadow-lg">
              <Image
                src={profile.avatar_url || '/img/avatar-default.png'}
                alt="avatar"
                width={56}
                height={56}
                className="object-cover"
                unoptimized={profile.avatar_url?.includes('supabase')}
                priority={true} 
              />
            </div>
            {profile.is_confirmed && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Информация */}
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 text-base truncate">
                {profile.first_name} {profile.last_name}
              </h3>
            </div>
            
            {/* Роль с цветом #E09080 */}
            <div className="flex items-center gap-2 mt-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md" 
                   style={{ backgroundColor: '#FFF5F3', borderWidth: '1px', borderColor: '#FFE5E0' }}>
                {RoleIcon && (
                  <RoleIcon className="w-3.5 h-3.5" style={{ color: '#E09080' }} strokeWidth={2} />
                )}
                <span className="text-xs font-medium" style={{ color: '#E09080' }}>
                  {roleData.name}
                </span>
              </div>
            </div>

            {/* Email */}
            {profile.email && (
              <p className="text-xs text-gray-400 mt-1.5 truncate">
                {profile.email}
              </p>
            )}
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
          {/* Профессия */}
          {profile.profession && (
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500 font-medium">
                {profile.profession}
              </span>
            </div>
          )}
          
          {/* Регион */}
          {profile.region && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-400">
                {profile.region}
              </span>
            </div>
          )}
          
          {/* Телефон */}
          {profile.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-400">{profile.phone}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}