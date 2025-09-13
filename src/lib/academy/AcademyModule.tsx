// lib/academy/AcademyModule.tsx

'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { academyService } from './AcademyService';
import type { Database } from '@/types/supabase';

type Course = Database['public']['Tables']['courses']['Row'];
type Lesson = Database['public']['Tables']['course_lessons']['Row'];

interface CreateCourseInput {
  title: string;
  category: string;
  language: string;
  shortDescription: string;
  fullDescription: string;
  difficultyLevel: string;
  tags: string[];
  isPublished: boolean;
  coverImage: File | null;
}

interface UpdateCourseInput {
  title?: string;
  category?: string;
  language?: string;
  shortDescription?: string;
  fullDescription?: string;
  difficultyLevel?: string;
  tags?: string[];
  isPublished?: boolean;
  coverImage?: File | null;
}

interface CreateLessonInput {
  courseId: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  durationMinutes?: number;
  orderIndex: number;
  isPublished: boolean;
  isPreview: boolean;
  homework?: string;
  attachments?: string[];
  quizData?: any;
}

interface UpdateLessonInput {
  courseId?: string;
  title?: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  durationMinutes?: number;
  orderIndex?: number;
  isPublished?: boolean;
  isPreview?: boolean;
  homework?: string;
  attachments?: string[];
  quizData?: any;
}

interface CourseProgress {
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  totalWatchTime: number;
}

interface AcademyContextType {
  // State
  courses: Course[];
  currentCourse: Course | null;
  lessons: Lesson[];
  currentLesson: Lesson | null;
  loading: boolean;
  error: string | null;
  filters: {
    category?: string;
    isPublished?: boolean;
  };
  courseProgress: CourseProgress | null;

  // Course actions
  loadCourses: (filters?: any) => Promise<void>;
  loadCourse: (id: string) => Promise<void>;
  createCourse: (data: CreateCourseInput) => Promise<Course | null>;
  updateCourse: (id: string, data: UpdateCourseInput) => Promise<Course | null>;
  deleteCourse: (id: string) => Promise<boolean>;

  // Lesson actions
  loadLessons: (courseId: string) => Promise<void>;
  loadLesson: (id: string) => Promise<void>;
  createLesson: (data: CreateLessonInput) => Promise<Lesson | null>;
  updateLesson: (id: string, data: UpdateLessonInput) => Promise<Lesson | null>;
  deleteLesson: (id: string) => Promise<boolean>;

  // File upload
  uploadCourseCover: (courseId: string, file: File) => Promise<string | null>;
  uploadLessonVideo: (lessonId: string, file: File) => Promise<string | null>;
  uploadLessonMaterial: (lessonId: string, file: File) => Promise<string | null>;

  // Progress
  updateProgress: (lessonId: string, data: any) => Promise<void>;
  loadCourseProgress: (userId: string, courseId: string) => Promise<void>;

  // Utils
  setFilters: (filters: any) => void;
  clearError: () => void;
}

const AcademyContext = createContext<AcademyContextType | undefined>(undefined);

export function AcademyProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({});
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);

  // Course methods
  const loadCourses = useCallback(async (customFilters?: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await academyService.getCourses(customFilters || filters);
      setCourses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadCourse = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await academyService.getCourse(id);
      setCurrentCourse(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCourse = useCallback(async (data: CreateCourseInput): Promise<Course | null> => {
    setLoading(true);
    setError(null);
    try {
      const courseData = {
        title: data.title,
        category: data.category,
        language: data.language,
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription,
        difficultyLevel: data.difficultyLevel,
        tags: data.tags,
        isPublished: data.isPublished,
        coverImage: data.coverImage
      };

      const course = await academyService.createCourse(courseData);
      
      await loadCourses();
      return course;
    } catch (err: any) {
      setError(err.message || 'Failed to create course');
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadCourses]);

  const updateCourse = useCallback(async (id: string, data: UpdateCourseInput): Promise<Course | null> => {
    setLoading(true);
    setError(null);
    try {
      const updates = {
        title: data.title,
        category: data.category,
        language: data.language,
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription,
        difficultyLevel: data.difficultyLevel,
        tags: data.tags,
        isPublished: data.isPublished,
        coverImage: data.coverImage
      };

      const course = await academyService.updateCourse(id, updates);
      
      await loadCourses();
      return course;
    } catch (err: any) {
      setError(err.message || 'Failed to update course');
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadCourses]);

  const deleteCourse = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const success = await academyService.deleteCourse(id);
      if (success) {
        await loadCourses();
      }
      return success;
    } catch (err: any) {
      setError(err.message || 'Failed to delete course');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadCourses]);

  // Lesson methods
  const loadLessons = useCallback(async (courseId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await academyService.getLessons(courseId);
      setLessons(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load lessons');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLesson = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await academyService.getLesson(id);
      setCurrentLesson(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load lesson');
    } finally {
      setLoading(false);
    }
  }, []);

  const createLesson = useCallback(async (data: CreateLessonInput): Promise<Lesson | null> => {
    setLoading(true);
    setError(null);
    try {
      // Преобразуем данные в формат для AcademyService
      const lessonData = {
        courseId: data.courseId,  // Используем courseId вместо course_id
        title: data.title,
        description: data.description,
        content: data.content,
        videoUrl: data.videoUrl,
        thumbnail: data.thumbnailUrl,  // thumbnail вместо thumbnail_url
        durationMinutes: data.durationMinutes,
        orderIndex: data.orderIndex,
        isPublished: data.isPublished,
        isPreview: data.isPreview,
        homework: data.homework,
        attachments: data.attachments,
        quizData: data.quizData,
        moduleName: undefined  // Добавим, если нужно
      };

      const lesson = await academyService.createLesson(lessonData);
      
      if (lesson) {
        await loadLessons(data.courseId);
      }
      
      return lesson;
    } catch (err: any) {
      setError(err.message || 'Failed to create lesson');
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadLessons]);

  const updateLesson = useCallback(async (id: string, data: UpdateLessonInput): Promise<Lesson | null> => {
    setLoading(true);
    setError(null);
    try {
      const updates = {
        title: data.title,
        description: data.description,
        content: data.content,
        videoUrl: data.videoUrl,
        thumbnail: data.thumbnailUrl,  // thumbnail вместо thumbnail_url
        durationMinutes: data.durationMinutes,
        orderIndex: data.orderIndex,
        isPublished: data.isPublished,
        isPreview: data.isPreview,
        homework: data.homework,
        attachments: data.attachments,
        quizData: data.quizData,
        moduleName: undefined  // Добавим, если нужно
      };

      const lesson = await academyService.updateLesson(id, updates);
      
      if (lesson && data.courseId) {
        await loadLessons(data.courseId);
      }
      
      return lesson;
    } catch (err: any) {
      setError(err.message || 'Failed to update lesson');
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadLessons]);

  const deleteLesson = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const success = await academyService.deleteLesson(id);
      return success;
    } catch (err: any) {
      setError(err.message || 'Failed to delete lesson');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // File upload methods
  const uploadCourseCover = useCallback(async (courseId: string, file: File): Promise<string | null> => {
    try {
      return await academyService.uploadCourseCover(courseId, file);
    } catch (err: any) {
      setError(err.message || 'Failed to upload cover');
      return null;
    }
  }, []);

  const uploadLessonVideo = useCallback(async (lessonId: string, file: File): Promise<string | null> => {
    try {
      return await academyService.uploadLessonVideo(lessonId, file);
    } catch (err: any) {
      setError(err.message || 'Failed to upload video');
      return null;
    }
  }, []);

  const uploadLessonMaterial = useCallback(async (lessonId: string, file: File): Promise<string | null> => {
    try {
      return await academyService.uploadLessonMaterial(lessonId, file);
    } catch (err: any) {
      setError(err.message || 'Failed to upload material');
      return null;
    }
  }, []);

  // Progress methods
  const updateProgress = useCallback(async (lessonId: string, data: any) => {
    try {
      await academyService.updateStudentProgress({
        userId: data.userId,
        lessonId,
        courseId: data.courseId,
        isCompleted: data.isCompleted,
        watchTime: data.watchTime,
        quizScore: data.quizScore
      });
    } catch (err: any) {
      console.error('Failed to update progress:', err);
    }
  }, []);

  const loadCourseProgress = useCallback(async (userId: string, courseId: string) => {
    try {
      const progress = await academyService.getCourseProgress(userId, courseId);
      setCourseProgress(progress);
    } catch (err: any) {
      console.error('Failed to load progress:', err);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AcademyContextType = {
    courses,
    currentCourse,
    lessons,
    currentLesson,
    loading,
    error,
    filters,
    courseProgress,
    loadCourses,
    loadCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    loadLessons,
    loadLesson,
    createLesson,
    updateLesson,
    deleteLesson,
    uploadCourseCover,
    uploadLessonVideo,
    uploadLessonMaterial,
    updateProgress,
    loadCourseProgress,
    setFilters,
    clearError
  };

  return <AcademyContext.Provider value={value}>{children}</AcademyContext.Provider>;
}

export function useAcademyModule() {
  const context = useContext(AcademyContext);
  if (!context) {
    throw new Error('useAcademyModule must be used within AcademyProvider');
  }
  return context;
}