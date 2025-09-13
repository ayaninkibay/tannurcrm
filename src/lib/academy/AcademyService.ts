// src/lib/academy/AcademyService.ts

import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';
import type {
  CreateCourseInput,
  UpdateCourseInput,
  CreateLessonInput,
  UpdateLessonInput,
  StudentProgress,
  StudentProgressInput
} from '@/types/custom.types';

// Типы из базы данных
type DbCourse = Database['public']['Tables']['courses']['Row'];
type DbCourseInsert = Database['public']['Tables']['courses']['Insert'];
type DbCourseUpdate = Database['public']['Tables']['courses']['Update'];

type DbCourseLesson = Database['public']['Tables']['course_lessons']['Row'];
type DbCourseLessonInsert = Database['public']['Tables']['course_lessons']['Insert'];
type DbCourseLessonUpdate = Database['public']['Tables']['course_lessons']['Update'];

// Расширенные типы с relations
export interface Course extends DbCourse {
  author?: any;
  lessons?: CourseLesson[];
  progress?: CourseProgress;
}

export interface CourseLesson extends DbCourseLesson {
  course?: any;
  progress?: LessonProgress;
}

export interface CourseProgress {
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  totalWatchTime: number;
}

export interface LessonProgress {
  isCompleted: boolean;
  watchTime: number;
  completedAt?: string;
  quizScore?: number;
}

class AcademyService {
  // ========================================
  // РАБОТА С КУРСАМИ
  // ========================================

  /**
   * Получить все курсы (алиас для совместимости)
   */
  async getCourses(filters?: {
    isPublished?: boolean;
    category?: string;
    authorId?: string;
  }): Promise<Course[]> {
    return this.getAllCourses(filters);
  }

  /**
   * Получить все курсы
   */
  async getAllCourses(filters?: {
    isPublished?: boolean;
    category?: string;
    authorId?: string;
  }): Promise<Course[]> {
    try {
      let query = supabase
        .from('courses')
        .select(`
          *,
          author:users!courses_author_id_fkey(
            id, 
            email, 
            first_name, 
            last_name,
            avatar_url
          )
        `)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });

      if (filters?.isPublished !== undefined) {
        query = query.eq('is_published', filters.isPublished);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.authorId) {
        query = query.eq('author_id', filters.authorId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data as Course[]) || [];
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  /**
   * Получить курс по ID или slug
   */
  async getCourse(identifier: string): Promise<Course | null> {
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
      
      let query = supabase
        .from('courses')
        .select(`
          *,
          author:users!courses_author_id_fkey(
            id, 
            email, 
            first_name, 
            last_name,
            avatar_url
          )
        `);

      if (isUUID) {
        query = query.eq('id', identifier);
      } else {
        query = query.eq('slug', identifier);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      // Увеличиваем счетчик просмотров
      if (data) {
        await supabase.rpc('increment_course_views' as any, { course_id: data.id });
      }

      return data as Course;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  }

  /**
   * Получить курс с уроками
   */
  async getCourseWithLessons(courseId: string): Promise<Course | null> {
    try {
      const course = await this.getCourse(courseId);
      if (!course) return null;

      const lessons = await this.getCourseLessons(courseId);
      return { ...course, lessons };
    } catch (error) {
      console.error('Error fetching course with lessons:', error);
      throw error;
    }
  }

  /**
   * Создать новый курс
   */
  async createCourse(input: CreateCourseInput): Promise<Course> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Не авторизован');

      let coverImageUrl: string | null = null;
      if (input.coverImage instanceof File) {
        coverImageUrl = await this.uploadCourseImage(input.coverImage, 'covers');
      } else if (typeof input.coverImage === 'string') {
        coverImageUrl = input.coverImage;
      }

      const insertData: DbCourseInsert = {
        title: input.title,
        category: input.category,
        language: input.language || 'ru',
        short_description: input.shortDescription || null,
        full_description: input.fullDescription || null,
        cover_image: coverImageUrl,
        is_published: input.isPublished || false,
        author_id: userData.user.id,
        difficulty_level: input.difficultyLevel || null,
        tags: input.tags || []
      };

      const { data, error } = await supabase
        .from('courses')
        .insert(insertData as DbCourseInsert)
        .select()
        .single();

      if (error) throw error;
      return data as Course;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  /**
   * Обновить курс
   */
  async updateCourse(courseId: string, input: UpdateCourseInput): Promise<Course> {
    try {
      const updateData: DbCourseUpdate = {};

      if (input.title !== undefined) updateData.title = input.title;
      if (input.category !== undefined) updateData.category = input.category;
      if (input.language !== undefined) updateData.language = input.language;
      if (input.shortDescription !== undefined) updateData.short_description = input.shortDescription;
      if (input.fullDescription !== undefined) updateData.full_description = input.fullDescription;
      if (input.isPublished !== undefined) updateData.is_published = input.isPublished;
      if (input.difficultyLevel !== undefined) updateData.difficulty_level = input.difficultyLevel;
      if (input.tags !== undefined) updateData.tags = input.tags;

      if (input.coverImage instanceof File) {
        updateData.cover_image = await this.uploadCourseImage(input.coverImage, 'covers');
      } else if (input.coverImage === null) {
        updateData.cover_image = null;
      } else if (typeof input.coverImage === 'string') {
        updateData.cover_image = input.coverImage;
      }

      const { data, error } = await supabase
        .from('courses')
        .update(updateData as DbCourseUpdate)
        .eq('id', courseId)
        .select()
        .single();

      if (error) throw error;
      return data as Course;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }

  /**
   * Удалить курс
   */
  async deleteCourse(courseId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }

  // ========================================
  // РАБОТА С УРОКАМИ
  // ========================================

  /**
   * Получить все уроки курса (алиас для совместимости)
   */
  async getLessons(courseId: string): Promise<CourseLesson[]> {
    return this.getCourseLessons(courseId);
  }

  /**
   * Получить все уроки курса
   */
  async getCourseLessons(courseId: string): Promise<CourseLesson[]> {
    try {
      const { data, error } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('module_name', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) throw error;
      return (data as CourseLesson[]) || [];
    } catch (error) {
      console.error('Error fetching lessons:', error);
      throw error;
    }
  }

  /**
   * Получить урок по ID
   */
  async getLesson(lessonId: string): Promise<CourseLesson | null> {
    try {
      const { data, error } = await supabase
        .from('course_lessons')
        .select(`
          *,
          course:courses(
            id,
            title,
            slug,
            author_id
          )
        `)
        .eq('id', lessonId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data as CourseLesson;
    } catch (error) {
      console.error('Error fetching lesson:', error);
      throw error;
    }
  }

  /**
   * Создать новый урок
   */
  async createLesson(input: CreateLessonInput): Promise<CourseLesson> {
    try {
      const { data: maxOrderData } = await supabase
        .from('course_lessons')
        .select('order_index')
        .eq('course_id', input.courseId)
        .order('order_index', { ascending: false })
        .limit(1)
        .single();

      const nextOrderIndex = maxOrderData ? (maxOrderData as any).order_index + 1 : 0;

      let thumbnailUrl: string | null = null;
      if (input.thumbnail instanceof File) {
        thumbnailUrl = await this.uploadCourseImage(input.thumbnail, 'lessons');
      } else if (typeof input.thumbnail === 'string') {
        thumbnailUrl = input.thumbnail;
      }

      const insertData: DbCourseLessonInsert = {
        course_id: input.courseId,
        title: input.title,
        description: input.description || null,
        content: input.content || null,
        video_url: input.videoUrl || null,
        thumbnail_url: thumbnailUrl,
        module_name: input.moduleName || null,
        order_index: input.orderIndex ?? nextOrderIndex,
        duration_minutes: input.durationMinutes || 0,
        is_preview: input.isPreview || false,
        is_published: input.isPublished || false,
        homework: input.homework || null,
        quiz_data: input.quizData || null,
        attachments: input.attachments || []
      };

      const { data, error } = await supabase
        .from('course_lessons')
        .insert(insertData as DbCourseLessonInsert)
        .select()
        .single();

      if (error) throw error;
      return data as CourseLesson;
    } catch (error) {
      console.error('Error creating lesson:', error);
      throw error;
    }
  }

  /**
   * Обновить урок
   */
  async updateLesson(lessonId: string, input: UpdateLessonInput): Promise<CourseLesson> {
    try {
      const updateData: DbCourseLessonUpdate = {};

      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.content !== undefined) updateData.content = input.content;
      if (input.videoUrl !== undefined) updateData.video_url = input.videoUrl;
      if (input.moduleName !== undefined) updateData.module_name = input.moduleName;
      if (input.orderIndex !== undefined) updateData.order_index = input.orderIndex;
      if (input.durationMinutes !== undefined) updateData.duration_minutes = input.durationMinutes;
      if (input.isPreview !== undefined) updateData.is_preview = input.isPreview;
      if (input.isPublished !== undefined) updateData.is_published = input.isPublished;
      if (input.homework !== undefined) updateData.homework = input.homework;
      if (input.quizData !== undefined) updateData.quiz_data = input.quizData;
      if (input.attachments !== undefined) updateData.attachments = input.attachments;

      if (input.thumbnail instanceof File) {
        updateData.thumbnail_url = await this.uploadCourseImage(input.thumbnail, 'lessons');
      } else if (input.thumbnail === null) {
        updateData.thumbnail_url = null;
      } else if (typeof input.thumbnail === 'string') {
        updateData.thumbnail_url = input.thumbnail;
      }

      const { data, error } = await supabase
        .from('course_lessons')
        .update(updateData as DbCourseLessonUpdate)
        .eq('id', lessonId)
        .select()
        .single();

      if (error) throw error;
      return data as CourseLesson;
    } catch (error) {
      console.error('Error updating lesson:', error);
      throw error;
    }
  }

  /**
   * Удалить урок
   */
  async deleteLesson(lessonId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('course_lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting lesson:', error);
      throw error;
    }
  }

  /**
   * Изменить порядок уроков
   */
  async reorderLessons(courseId: string, lessonIds: string[]): Promise<void> {
    try {
      const updates = lessonIds.map((id, index) => 
        supabase
          .from('course_lessons')
          .update({ order_index: index } as DbCourseLessonUpdate)
          .eq('id', id)
          .eq('course_id', courseId)
      );

      await Promise.all(updates);
    } catch (error) {
      console.error('Error reordering lessons:', error);
      throw error;
    }
  }

  // ========================================
  // РАБОТА С ПРОГРЕССОМ
  // ========================================

  /**
   * Получить прогресс курса для пользователя
   */
  async getCourseProgress(userId: string, courseId: string): Promise<CourseProgress> {
    try {
      const { data, error } = await supabase
        .rpc('get_course_progress' as any, {
          p_user_id: userId,
          p_course_id: courseId
        });

      if (error) throw error;

      return (data as CourseProgress) || {
        totalLessons: 0,
        completedLessons: 0,
        progressPercentage: 0,
        totalWatchTime: 0
      };
    } catch (error) {
      console.error('Error fetching course progress:', error);
      return {
        totalLessons: 0,
        completedLessons: 0,
        progressPercentage: 0,
        totalWatchTime: 0
      };
    }
  }

  /**
   * Обновить прогресс урока
   */
  async updateLessonProgress(input: StudentProgressInput): Promise<void> {
    try {
      const { error } = await supabase
        .from('student_progress')
        .upsert({
          user_id: input.userId,
          course_id: input.courseId,
          lesson_id: input.lessonId,
          is_completed: input.isCompleted || false,
          watch_time: input.watchTime || 0,
          quiz_score: input.quizScore || null,
          completed_at: input.isCompleted ? new Date().toISOString() : null,
          last_accessed: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      throw error;
    }
  }

  /**
   * Отметить урок как завершенный
   */
  async markLessonComplete(userId: string, lessonId: string): Promise<void> {
    try {
      const lesson = await this.getLesson(lessonId);
      if (!lesson) throw new Error('Урок не найден');

      await this.updateLessonProgress({
        userId,
        courseId: lesson.course_id,
        lessonId,
        isCompleted: true
      });
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      throw error;
    }
  }

  // ========================================
  // МЕТОДЫ ДЛЯ ЗАГРУЗКИ ФАЙЛОВ (Алиасы для совместимости)
  // ========================================

  /**
   * Загрузить обложку курса
   */
  async uploadCourseCover(courseId: string, file: File): Promise<string | null> {
    try {
      const url = await this.uploadCourseImage(file, 'covers');
      
      // Обновляем курс с новой обложкой
      await supabase
        .from('courses')
        .update({ cover_image: url })
        .eq('id', courseId);
      
      return url;
    } catch (error) {
      console.error('Error uploading course cover:', error);
      return null;
    }
  }

  /**
   * Загрузить видео урока
   */
  async uploadLessonVideo(lessonId: string, file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `videos/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('academy')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('academy')
        .getPublicUrl(fileName);
      
      // Обновляем урок с новым видео
      await supabase
        .from('course_lessons')
        .update({ video_url: data.publicUrl })
        .eq('id', lessonId);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading lesson video:', error);
      return null;
    }
  }

  /**
   * Загрузить материал урока
   */
  async uploadLessonMaterial(lessonId: string, file: File): Promise<string | null> {
    try {
      const url = await this.uploadAttachment(file);
      
      // Получаем текущие вложения урока
      const { data: lesson } = await supabase
        .from('course_lessons')
        .select('attachments')
        .eq('id', lessonId)
        .single();
      
      if (lesson) {
        const attachments = lesson.attachments || [];
        attachments.push(url);
        
        // Обновляем урок с новым вложением
        await supabase
          .from('course_lessons')
          .update({ attachments })
          .eq('id', lessonId);
      }
      
      return url;
    } catch (error) {
      console.error('Error uploading lesson material:', error);
      return null;
    }
  }

  /**
   * Обновить прогресс студента (алиас)
   */
  async updateStudentProgress(input: StudentProgressInput): Promise<void> {
    return this.updateLessonProgress(input);
  }

  // ========================================
  // РАБОТА С ИЗОБРАЖЕНИЯМИ
  // ========================================

  /**
   * Загрузить изображение курса
   */
  private async uploadCourseImage(file: File, folder: 'covers' | 'lessons'): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('academy')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('academy')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  /**
   * Загрузить файл материала
   */
  async uploadAttachment(file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `attachments/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('academy')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('academy')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  }

  /**
   * Удалить изображение
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const url = new URL(imageUrl);
      const path = url.pathname.split('/').slice(-2).join('/');

      const { error } = await supabase.storage
        .from('academy')
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  // ========================================
  // ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ
  // ========================================

  /**
   * Получить категории курсов
   */
  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('category')
        .eq('is_published', true);

      if (error) throw error;

      const categories = [...new Set((data as any[] || []).map(item => item.category))];
      return categories.sort();
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  /**
   * Поиск курсов
   */
  async searchCourses(query: string): Promise<Course[]> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .or(`title.ilike.%${query}%,short_description.ilike.%${query}%,tags.cs.{${query}}`)
        .order('views_count', { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data as Course[]) || [];
    } catch (error) {
      console.error('Error searching courses:', error);
      return [];
    }
  }

  /**
   * Получить популярные курсы
   */
  async getPopularCourses(limit: number = 6): Promise<Course[]> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('views_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data as Course[]) || [];
    } catch (error) {
      console.error('Error fetching popular courses:', error);
      return [];
    }
  }

  /**
   * Получить рекомендованные курсы
   */
  async getRecommendedCourses(userId: string, limit: number = 4): Promise<Course[]> {
    try {
      // В будущем здесь будет логика рекомендаций на основе прогресса пользователя
      // Пока возвращаем новые курсы
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data as Course[]) || [];
    } catch (error) {
      console.error('Error fetching recommended courses:', error);
      return [];
    }
  }
}

// Экспортируем singleton экземпляр
export const academyService = new AcademyService();