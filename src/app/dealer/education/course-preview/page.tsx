'use client';

import { AcademyProvider } from '@/lib/academy/AcademyModule';
import CoursePreviewContent from './CoursePreviewContent';

export default function CoursePreviewPage() {
  return (
    <AcademyProvider>
      <CoursePreviewContent />
    </AcademyProvider>
  );
}