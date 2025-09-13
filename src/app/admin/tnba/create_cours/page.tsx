'use client';

import { AcademyProvider } from '@/lib/academy/AcademyModule';
import CreateCourseContent from './CreateCourseContent';

export default function CreateCoursePage() {
  return (
    <AcademyProvider>
      <CreateCourseContent />
    </AcademyProvider>
  );
}