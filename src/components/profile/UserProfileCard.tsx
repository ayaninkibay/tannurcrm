'use client';

import React from 'react';
import Image from 'next/image';
import { useUser } from '@/context/UserContext';
import { useTranslate } from '@/hooks/useTranslate';

export default function UserProfileCard() {
  const { profile, loading } = useUser();
  const { t } = useTranslate();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse" />
          <div className="w-6 h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full animate-pulse" />
        </div>
        
        <div className="flex gap-4 items-start">
          <div className="w-20 h-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl animate-pulse shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-40 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
            <div className="h-3 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
            <div className="h-3 w-28 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center space-y-2">
                <div className="h-5 w-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse mx-auto" />
                <div className="h-3 w-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-center h-32">
          <p className="text-gray-500">{t('Профиль не найден')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-sm transition-all duration-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-md font-semibold text-[#111]">{t('Мой профиль')}</h2>
        <div className="relative w-4 h-4">
          <Image 
            src="/icons/buttom/more.svg" 
            alt={t('Ещё')}
            fill
            style={{ objectFit: 'contain' }}
            className="opacity-60 hover:opacity-100 cursor-pointer transition-opacity"
          />
        </div>
      </div>

      {/* Profile Info */}
      <div className="flex gap-4 items-center flex-wrap sm:flex-nowrap">
        {/* Simple Avatar */}
        <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-300 shrink-0">
          <Image
            src={profile.avatar_url || '/img/avatar-default.png'}
            alt="avatar"
            width={96}
            height={96}
            className="object-cover"
            unoptimized={profile.avatar_url?.includes('supabase')}
            priority={true} 
          />
        </div>

        {/* User Details */}
        <div className="flex flex-col justify-center flex-1 min-w-[100px] space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm md:text-base font-semibold text-[#111] truncate">
              {profile.first_name} {profile.last_name}
            </p>
            {profile.is_confirmed && (
              <Image 
                src="/icons/confirmed.svg" 
                alt={t('Подтвержден')}
                width={16} 
                height={16}
                style={{ width: '16px', height: '16px' }}
              />
            )}
          </div>
          
          {profile.referral_code && (
            <p className="text-sm text-[#111] font-medium truncate">
              {profile.referral_code}
            </p>
          )}
          
          {profile.region && (
            <p className="text-sm text-gray-500 truncate">
              📍 {profile.region}
            </p>
          )}
          
          {profile.phone && (
            <p className="text-sm text-gray-500 truncate">
              📱 {profile.phone}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-gray-100" />
    </div>
  );
}
