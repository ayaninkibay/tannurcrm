'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslate } from '@/hooks/useTranslate';
import { useUser } from '@/context/UserContext';
import { SponsorService } from '@/lib/sponsor/sponsorService';

interface SponsorCardProps {
  variant?: 'dark' | 'light' | 'minimal';
}

interface Sponsor {
  id: string;
  name: string;
  avatar: string;
  status: string;
  phone: string;
  is_confirmed: boolean;
  referrals_count: number;
}

export default function SponsorCard({ 
  variant = 'dark'
}: SponsorCardProps) {
  const { t } = useTranslate();
  const { profile, loading: userLoading } = useUser();
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSponsor, setHasSponsor] = useState(false);

  // Стили для вариантов
  const getVariantStyles = () => {
    switch (variant) {
      case 'light':
        return {
          bg: 'bg-white border border-gray-200',
          text: 'text-gray-900',
          secondary: 'text-gray-600',
          skeleton: 'bg-gray-200'
        };
      case 'minimal':
        return {
          bg: 'bg-gray-50 border border-gray-100',
          text: 'text-gray-800',
          secondary: 'text-gray-500',
          skeleton: 'bg-gray-200'
        };
      default: // dark
        return {
          bg: 'bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50',
          text: 'text-white',
          secondary: 'text-slate-300',
          skeleton: 'bg-slate-700'
        };
    }
  };

  const styles = getVariantStyles();

  useEffect(() => {
    if (userLoading) return;
    
    if (!profile) {
      setError('Пользователь не авторизован');
      setLoading(false);
      return;
    }

    fetchSponsorData();
  }, [profile, userLoading]);

  const fetchSponsorData = async () => {
    if (!profile?.id) return;
    
    try {
      setLoading(true);
      setError(null);

      const response = await SponsorService.getUserSponsor(profile.id);
      setSponsor(response.sponsor);
      setHasSponsor(response.has_sponsor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка
  if (userLoading || loading) {
    return (
      <div className="w-full">
        <p className="text-sm font-medium text-gray-900 mb-3">{t('Мой спонсор')}</p>
        <div className={`${styles.bg} rounded-lg p-4 shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full animate-pulse ${styles.skeleton}`}></div>
            <div className="flex-1 space-y-2">
              <div className={`h-3 w-20 rounded animate-pulse ${styles.skeleton}`}></div>
              <div className={`h-2 w-16 rounded animate-pulse ${styles.skeleton}`}></div>
            </div>
            <div className={`h-4 w-6 rounded animate-pulse ${styles.skeleton}`}></div>
          </div>
        </div>
      </div>
    );
  }

  // Ошибка
  if (error) {
    return (
      <div className="w-full">
        <p className="text-sm font-medium text-gray-900 mb-3">{t('Мой спонсор')}</p>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{t('Ошибка загрузки спонсора')}</span>
          </div>
          <button 
            onClick={fetchSponsorData}
            className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
          >
            {t('Повторить')}
          </button>
        </div>
      </div>
    );
  }

  // Нет спонсора
  if (!hasSponsor || !sponsor) {
    return (
      <div className="w-full">
        <p className="text-sm font-medium text-gray-900 mb-3">{t('Мой спонсор')}</p>
        
        <div className={`${styles.bg} rounded-lg p-4 shadow-sm`}>
          <div className="text-center">
            <div className={`w-8 h-8 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-2`}>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className={`text-xs ${styles.text} font-medium mb-1`}>
              {t('Нет спонсора')}
            </p>
            <p className={`text-xs ${styles.secondary}`}>
              {t('Обратитесь к администратору')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Карточка спонсора
  return (
    <div className="w-full">
      <p className="text-sm font-medium text-gray-900 mb-3">{t('Мой спонсор')}</p>
      
      <div className={`${styles.bg} rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200`}>
        <div className="flex items-center gap-3">
          {/* Аватар */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/10">
              <Image
                src={sponsor.avatar}
                alt={sponsor.name}
                width={40}
                height={40}
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/icons/Users avatar 7.png';
                }}
              />
            </div>
            {sponsor.is_confirmed && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></div>
            )}
          </div>
          
          {/* Информация */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className={`text-sm font-semibold ${styles.text} truncate`}>
                {sponsor.name}
              </p>
              {sponsor.is_confirmed && (
                <svg className="w-3 h-3 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`text-xs ${styles.secondary}`}>
                {t(sponsor.status)}
              </span>
              <span className={`text-xs font-medium ${styles.text}`}>
                {sponsor.referrals_count} {t('реф.')}
              </span>
            </div>
          </div>
        </div>
        
        {/* Телефон внизу */}
        {sponsor.phone && (
          <div className="mt-3 pt-3 border-t border-gray-200/10">
            <div className="flex items-center gap-1.5">
              <svg className={`w-3 h-3 ${styles.secondary}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className={`text-xs ${styles.secondary}`}>
                {sponsor.phone}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}