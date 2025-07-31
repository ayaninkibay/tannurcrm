'use client';

import React from 'react';
import SponsorCard from '@/components/blocks/SponsorCard';

export default function TestSponsorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-10">
      <div className="bg-white p-4 rounded-xl w-96">
        <SponsorCard variant="gray" />
      </div>
    </div>
  );
}