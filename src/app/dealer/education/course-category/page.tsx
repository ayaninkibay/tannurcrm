'use client';

import { AcademyProvider } from '@/lib/academy/AcademyModule';
import CourseCategoryContent from './CourseCategoryContent';

export default function CourseCategoryPage() {
  return (
    <AcademyProvider>
      <CourseCategoryContent />
    </AcademyProvider>
  );
}