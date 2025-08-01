'use client';

import React from 'react';
import MoreHeader from '@/components/header/MoreHeader';

export default function CelebrityMyPage() {
  return (
    <main className="min-h-screen bg-[#F6F6F6]">
      {/* Заголовок */}
      <MoreHeader title="Моя страница" />

      {/* Заглушка контента */}
      <div className="mt-8 flex-1 flex items-center justify-center">
        <p className="text-xl text-gray-500">
          Здесь будет контент раздела «Моя страница» направления Селебрити
        </p>
      </div>
    </main>
  );
}
