'use client';

import React from 'react';
import { useUser } from '@/context/UserContext';
import { BonusProgramView } from '@/components/bonus/BonusProgramView';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import { useTranslate } from '@/hooks/useTranslate';

export default function BonusProgramPage() {
  const { t } = useTranslate();
  const { profile: user } = useUser();

  return (
    <div className="p-2 md:p-6 space-y-6">
      <MoreHeaderDE title={t('Бонусная программа')} />
      <BonusProgramView userId={user?.id} />
    </div>
  );
}