'use client';

import React from 'react';
import Image from 'next/image';

interface SponsorCardProps {
  variant?: 'dark' | 'light';
  sponsor?: {
    name: string;
    avatar: string;
    status: string;
    phone: string;
    is_confirmed: boolean;
  };
}

export default function SponsorCard({ 
  variant = 'dark',
  sponsor = {
    name: 'Маргұза Қағыбат',
    avatar: '/icons/Users avatar 7.png',
    status: 'Основатель',
    phone: '+7 707 700 00 02',
    is_confirmed: true
  }
}: SponsorCardProps) {
  const isDark = variant === 'dark';
  const bgGradient = isDark 
    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' 
    : 'bg-gradient-to-br from-gray-100 via-gray-50 to-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const secondaryTextColor = isDark ? 'text-gray-300' : 'text-gray-600';
  const iconSuffix = isDark ? '_white' : '';

  return (
    <div className="w-full">
      <p className="text-sm font-medium text-gray-900 mb-3">Мой спонсор</p>

      <div className={`relative ${bgGradient} rounded-xl p-5 overflow-hidden  duration-300`}>
        {/* Background Pattern */}
        <div className={`absolute top-2 right-2 w-16 h-16 opacity-10 ${textColor}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="currentColor">
            <circle cx="20" cy="20" r="2" />
            <circle cx="40" cy="20" r="2" />
            <circle cx="60" cy="20" r="2" />
            <circle cx="80" cy="20" r="2" />
            <circle cx="20" cy="40" r="2" />
            <circle cx="40" cy="40" r="2" />
            <circle cx="60" cy="40" r="2" />
            <circle cx="80" cy="40" r="2" />
            <circle cx="20" cy="60" r="2" />
            <circle cx="40" cy="60" r="2" />
            <circle cx="60" cy="60" r="2" />
            <circle cx="80" cy="60" r="2" />
            <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="0.5" rx="8" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header with Avatar and Info */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${isDark ? 'border-white/20' : 'border-gray-200'} shadow-md`}>
                <Image
                  src={sponsor.avatar}
                  alt="sponsor avatar"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Online status indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
            </div>
            
            <div className="flex-1">
              <div className={`flex items-center gap-2 mb-1 ${textColor}`}>
                <span className="text-sm font-semibold">{sponsor.name}</span>
                {sponsor.is_confirmed && (
                  <div className="p-0.5 bg-blue-500 rounded-full">
                    <Image 
                      src={`/icons/confirmed${iconSuffix}.svg`} 
                      alt="verified" 
                      width={10} 
                      height={10}
                    />
                  </div>
                )}
              </div>
              <div className={`flex items-center gap-1.5 ${secondaryTextColor}`}>
                <Image
                  src={`/icons/crown${iconSuffix}.svg`}
                  alt="crown"
                  width={12}
                  height={12}
                  className="text-yellow-500"
                />
                <span className="text-xs font-medium">{sponsor.status}</span>
              </div>
            </div>
          </div>

          {/* Footer with Phone and Button */}
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-1.5 text-xs ${secondaryTextColor}`}>
              <Image
                src={`/icons/buttom/tell${iconSuffix}.svg`}
                alt="phone"
                width={12}
                height={12}
              />
              <span className="font-medium">{sponsor.phone}</span>
            </div>
            
            <button className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 ${
              isDark 
                ? 'bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm' 
                : 'bg-gray-900/10 hover:bg-gray-900/20 border border-gray-300 text-gray-900'
            }`}>
              <Image
                src="/icons/userblack.svg"
                alt="profile"
                width={12}
                height={12}
              />
              <span>Профиль</span>
            </button>
          </div>

          {/* Additional info bar */}
          <div className={`mt-4 pt-3 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <div className="flex justify-between text-xs">
              <div className={`flex items-center gap-1 ${secondaryTextColor}`}>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Активен сейчас</span>
              </div>
              <div className={`${secondaryTextColor}`}>
                <span>Рефералов: </span>
                <span className={`font-semibold ${textColor}`}>47</span>
              </div>
            </div>
          </div>
        </div>

        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-xl ${isDark ? 'bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5' : 'bg-gradient-to-br from-blue-500/3 via-purple-500/3 to-pink-500/3'} pointer-events-none`}></div>
      </div>
    </div>
  );
}