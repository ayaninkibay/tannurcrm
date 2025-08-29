'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useUser } from '@/context/UserContext';
import { useTranslate } from '@/hooks/useTranslate';

interface ReferralLinkProps {
  referralCode?: string;
  variant?: 'orange' | 'gray';
}

export default function ReferralLink({
  referralCode,
  variant = 'orange'
}: ReferralLinkProps) {
  const { t } = useTranslate();
  const { profile, loading: loadingProfile } = useUser();
  const [copied, setCopied] = useState(false);

  const code = referralCode || profile?.referral_code || 'USER2024';
  const fullLink = `https://tannur.app/${code}`;
  const isOrange = variant === 'orange';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Ошибка копирования ссылки:', err);
      const textArea = document.createElement('textarea');
      textArea.value = fullLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loadingProfile && !referralCode) {
    return (
      <div className="w-full">
        <div className="h-4 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded mb-3 animate-pulse" />
        <div className="bg-gray-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
            <div className="h-3 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="h-4 w-40 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="text-sm font-medium text-gray-900 mb-3">{t('Реферальная ссылка')}</p>

      <div className={`rounded-xl p-4 relative overflow-hidden ${isOrange ? 'bg-[#DC7C67]' : 'bg-gray-100'}`}>
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-16 h-16 opacity-5">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="currentColor">
            <circle cx="50" cy="30" r="8" />
            <circle cx="70" cy="50" r="6" />
            <circle cx="30" cy="60" r="4" />
          </svg>
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className={`flex items-center gap-2 mb-3 ${isOrange ? 'text-white' : 'text-gray-700'}`}>
            <div className={`p-1.5 rounded-lg ${isOrange ? 'bg-white/10' : 'bg-gray-200'}`}>
              <Image
                src={isOrange ? '/icons/buttom/share_white.svg' : '/icons/buttom/share_black.svg'}
                alt={t('Поделиться')}
                width={14}
                height={14}
              />
            </div>
            <span className="text-sm font-medium">{t('Ссылка для приглашения')}</span>
          </div>

          {/* Link Container */}
          <div className={`bg-white rounded-lg p-3 ${isOrange ? 'shadow-sm' : 'border border-gray-200'}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <span className="text-sm">
                  <span className="text-gray-400">tannur.app/</span>
                  <span className="font-semibold text-[#DC7C67]">
                    {code}
                  </span>
                </span>
              </div>

              <button
                onClick={handleCopy}
                className={`p-2 rounded-lg transition-all hover:scale-110 ${
                  copied ? 'bg-green-50 text-green-600' : 'hover:bg-gray-50'
                }`}
                title={t('Копировать ссылку')}
              >
                {copied ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <Image
                    src="/icons/buttom/copy_black.svg"
                    alt={t('Копировать')}
                    width={16}
                    height={16}
                  />
                )}
              </button>
            </div>
          </div>

          {/* Success Message */}
          {copied && (
            <div className={`flex items-center gap-1.5 text-xs mt-2 transition-opacity duration-200 ${isOrange ? 'text-white/90' : 'text-gray-600'}`}>
              <div className="w-1 h-1 bg-current rounded-full"></div>
              {t('Ссылка скопирована!')}
            </div>
          )}

          {/* Simple stats */}
          <div className={`mt-4 pt-3 flex justify-between text-xs border-t ${isOrange ? 'border-white/20 text-white/90' : 'border-gray-200 text-gray-600'}`}>
            <span>
              {t('Переходов: {n}').replace('{n}', '24')}
            </span>
            <span>
              {t('Активных: {n}').replace('{n}', '8')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
