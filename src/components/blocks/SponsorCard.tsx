'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useTranslate } from '@/hooks/useTranslate';
import { useUser } from '@/context/UserContext';
import { SponsorService, type Sponsor } from '@/lib/sponsor/sponsorService';

export default function SponsorCard() {
  const { t } = useTranslate();
  const { profile, loading: userLoading } = useUser();
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSponsor, setHasSponsor] = useState(false);

  const fetchSponsorData = useCallback(async () => {
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
  }, [profile?.id]);

  useEffect(() => {
    if (userLoading) return;

    if (!profile) {
      setError('Пользователь не авторизован');
      setLoading(false);
      return;
    }

    fetchSponsorData();
  }, [profile, userLoading, fetchSponsorData]);

  // Загрузка
  if (userLoading || loading) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
        <div className="bg-[#E09080] h-1"></div>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">{t('Мой спонсор')}</h3>
            <div className="w-7 h-7 bg-gray-100 rounded-lg animate-pulse"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gray-100 animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-gray-100 animate-pulse"></div>
              <div className="h-3 w-24 rounded bg-gray-100 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Ошибка
  if (error) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
        <div className="bg-red-500 h-1"></div>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">{t('Мой спонсор')}</h3>
            <button 
              onClick={fetchSponsorData}
              className="px-2.5 py-1 bg-[#E09080] hover:bg-[#d17d6d] text-white text-xs font-medium rounded-lg transition-colors"
            >
              {t('Обновить')}
            </button>
          </div>
          <div className="bg-red-50 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-red-900">{t('Ошибка загрузки')}</p>
                <p className="text-xs text-red-700 mt-0.5">{t('Попробуйте обновить')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Нет спонсора
  if (!hasSponsor || !sponsor) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#E09080] to-[#e5a599] h-1"></div>
        <div className="p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-4">{t('Мой спонсор')}</h3>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">{t('Спонсор не назначен')}</p>
                <p className="text-xs text-gray-600 mt-0.5">{t('Обратитесь к администратору')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Карточка спонсора
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300">
      <div className="bg-gradient-to-r from-[#E09080] to-[#e5a599] h-1"></div>
      
      <div className="p-5">
        {/* Заголовок с бейджем */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-gray-800">{t('Мой спонсор')}</h3>
          <div className="px-2.5 py-1 bg-gradient-to-r from-[#E09080]/20 to-[#e5a599]/20 rounded-full flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-[#E09080]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <span className="text-xs font-bold text-[#E09080]">{sponsor.referrals_count}</span>
            <span className="text-xs text-gray-600">{t('команда')}</span>
          </div>
        </div>
        
        {/* Основной контент */}
        <div className="bg-white rounded-xl p-3.5 border border-gray-100">
          <div className="flex items-center gap-3">
            {/* Аватар - ИСПРАВЛЕНО */}
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100">
                <Image
                  src={sponsor.avatar || '/icons/Users avatar 7.png'}
                  alt={sponsor.name}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/icons/Users avatar 7.png';
                  }}
                />
              </div>
              {sponsor.is_confirmed && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Информация */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {sponsor.name}
              </p>
              {sponsor.profession && (
                <p className="text-xs text-gray-600 mt-0.5 truncate">
                  {sponsor.profession}
                </p>
              )}
              
              {/* Контакты */}
              {sponsor.phone && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-700 font-medium">
                    {sponsor.phone}
                  </span>
                </div>
              )}
            </div>

            {/* Кнопки действий */}
            <div className="flex gap-2 flex-shrink-0">
              {sponsor.phone && (
                <>
                  <a 
                    href={`tel:${sponsor.phone}`}
                    className="w-10 h-10 bg-gradient-to-br from-[#E09080] to-[#e5a599] rounded-xl flex items-center justify-center transform hover:scale-105 transition-all shadow-sm"
                  >
                    <svg className="w-4.5 h-4.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </a>
                  <a 
                    href={`https://wa.me/${sponsor.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center transform hover:scale-105 transition-all shadow-sm"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}