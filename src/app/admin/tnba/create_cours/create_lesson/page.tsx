'use client';

import { AcademyProvider } from '@/lib/academy/AcademyModule';
import CreateLessonContent from './CreateLessonContent';

export default function CreateLessonPage() {
  return (
    <AcademyProvider>
      <CreateLessonContent />
    </AcademyProvider>
  );
}