'use client';

import Image from 'next/image';
import { useUser } from '@/context/UserContext';

export default function UserProfileCard() {
  const { profile, loading } = useUser();

  if (loading) {
    return (
      <div className="w-full bg-white rounded-2xl p-6 transition-all duration-300 ease-in-out h-full">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
        <div className="flex gap-4">
          <div className="w-24 h-24 bg-gray-200 rounded-xl animate-pulse shrink-0" />
          <div className="flex flex-1 min-w-0 flex-col justify-center space-y-2">
            <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-full bg-white rounded-2xl p-6 transition-all duration-300 ease-in-out h-full">
        <p className="text-gray-500">Профиль не найден</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-md font-semibold text-[#111]">Мой профиль</h2>
        <Image 
          src="/icons/buttom/more.svg" 
          alt="more" 
          width={4} 
          height={4} 
          className="opacity-60 hover:opacity-100 cursor-pointer transition-opacity"
        />
      </div>

      <div className="flex gap-4 items-center flex-wrap sm:flex-nowrap">
        <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-300 shrink-0">
          <Image
            src={profile.avatar_url || '/img/avatar-default.png'}
            alt="avatar"
            width={96}
            height={96}
            className="object-cover w-full h-full"
            unoptimized={profile.avatar_url?.includes('supabase')}
          />
        </div>

        <div className="flex flex-col justify-center flex-1 min-w-[100px] space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm md:text-base font-semibold text-[#111] truncate">
              {profile.first_name} {profile.last_name}
            </p>
            {profile.is_confirmed && (
              <Image 
                src="/icons/confirmed.svg" 
                alt="confirmed" 
                width={16} 
                height={16}
                className="flex-shrink-0"
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