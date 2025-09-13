'use client';

import { AcademyProvider } from '@/lib/academy/AcademyModule';
import CoursePageContent from './CoursePageContent';

export default function CoursePage() {
  return (
    <AcademyProvider>
      <CoursePageContent />
    </AcademyProvider>
  );
}