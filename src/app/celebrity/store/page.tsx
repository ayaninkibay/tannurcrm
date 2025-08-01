    'use client';

import React from 'react';
import MoreHeader from '@/components/header/MoreHeader';

export default function CelebrityStorePage() {
  return (
    <main className="min-h-screen bg-[#F6F6F6]">
      {/* Заголовок */}
      <MoreHeader title="Магазин Селебрити" />

      {/* Заглушка контента */}
      <div className="mt-8 flex-1 flex items-center justify-center">
        <p className="text-xl text-gray-500">
          Здесь будет страница “Магазин” направления «Селебрити»
        </p>
      </div>
    </main>
  );
}
