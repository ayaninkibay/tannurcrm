'use client';

import { AcademyProvider } from '@/lib/academy/AcademyModule';
import AdminCourseContent from './AdminCourseContent';

export default function AdminCoursePage() {
  return (
    <AcademyProvider>
      <AdminCourseContent />
    </AcademyProvider>
  );
}