'use client';

import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useTranslate } from '@/hooks/useTranslate';

interface ReferralLinkProps {
  referralCode?: string;
}

export default function ReferralLink({ referralCode }: ReferralLinkProps) {
  const { t } = useTranslate();
  const { profile, loading: loadingProfile } = useUser();
  const [copied, setCopied] = useState(false);

  const code = referralCode || profile?.referral_code || 'USER2024';
  const fullLink = `https://tnba.kz/${code}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Ошибка копирования ссылки:', err);
      const textArea = document.createElement('textarea');
      textArea.value = fullLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (loadingProfile && !referralCode) {
    return (
      <div className="w-full">
        <div className="relative bg-white border border-gray-100 rounded-xl overflow-hidden">
          {/* Top Brand Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#DC7C67]"></div>
          
          <div className="p-5 pt-6">
            <div className="h-4 w-32 bg-gray-100 rounded mb-3 animate-pulse" />
            <div className="h-11 bg-gray-50 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-all duration-200">
        {/* Top Brand Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#DC7C67] to-[#E89480]"></div>
        
        <div className="p-5 pt-6">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-0.5">
                {t('Реферальная ссылка')}
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                {t('Пригласите друзей в команду')}
              </p>
            </div>
            
            {/* Team Icon */}
            <div className="p-1.5 bg-gray-50 rounded-lg">
              <svg 
                className="w-4 h-4 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                />
              </svg>
            </div>
          </div>

          {/* Link Container */}
          <div className="relative bg-gray-50 rounded-lg p-3 group">
            <div className="flex items-center justify-between gap-3">
              {/* Link Display */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  {/* Link Icon */}
                  <div className="flex-shrink-0">
                    <svg 
                      className="w-3.5 h-3.5 text-gray-400" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" 
                      />
                    </svg>
                  </div>

                  {/* URL */}
                  <div className="flex items-baseline gap-0.5 text-sm font-medium">
                    <span className="text-gray-500">tnba.kz/</span>
                    <span className="text-[#DC7C67] font-semibold">{code}</span>
                  </div>
                </div>
              </div>

              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className={`
                  relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                  text-xs font-medium transition-all duration-200 active:scale-95
                  ${copied 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }
                `}
              >
                <div className="relative">
                  {/* Copy Icon */}
                  <svg 
                    className={`w-3.5 h-3.5 transition-all duration-200 ${
                      copied ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
                    }`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" 
                    />
                  </svg>

                  {/* Check Icon */}
                  <svg 
                    className={`w-3.5 h-3.5 absolute inset-0 transition-all duration-200 ${
                      copied ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                    }`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2.5} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                </div>
                <span className="whitespace-nowrap">
                  {copied ? t('Готово') : t('Копировать')}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}