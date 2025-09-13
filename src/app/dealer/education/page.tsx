'use client';

import { AcademyProvider } from '@/lib/academy/AcademyModule';
import EducationContent from './EducationContent';

export default function EducationPage() {
  return (
    <AcademyProvider>
      <EducationContent />
    </AcademyProvider>
  );
}