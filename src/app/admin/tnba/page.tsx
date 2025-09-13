'use client';

import { AcademyProvider } from '@/lib/academy/AcademyModule';
import AcademyTannurContent from './AcademyTannurContent';

export default function AcademyTannurPage() {
  return (
    <AcademyProvider>
      <AcademyTannurContent />
    </AcademyProvider>
  );
}