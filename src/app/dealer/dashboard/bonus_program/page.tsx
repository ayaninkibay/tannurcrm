'use client';

import React from 'react';
import { useUser } from '@/context/UserContext';
import { BonusEventProgressView } from '@/components/bonus/BonusEventProgressView';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import { useTranslate } from '@/hooks/useTranslate';

export default function BonusProgramPage() {
  const { t } = useTranslate();
  const { profile: user } = useUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-2 md:p-6 space-y-6">
        <MoreHeaderDE title={t('Бонусная программа')} />
        
        {user?.id ? (
          <BonusEventProgressView userId={user.id} />
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}