// src/lib/academy/AcademyService.ts

import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';
import type {
  CreateCourseInput,
  UpdateCourseInput,
  CreateLessonInput,
  UpdateLessonInput
} from '@/types/custom.types';

// Явно определяем типы из базы данных
type DbCourse = Database['public']['Tables']['courses']['Row'];
type DbCourseInsert = Database['public']['Tables']['courses']['Insert'];
type DbCourseUpdate = Database['public']['Tables']['courses']['Update'];

type DbCourseLesson = Database['public']['Tables']['course_lessons']['Row'];
type DbCourseLessonInsert = Database['public']['Tables']['course_lessons']['Insert'];
type DbCourseLessonUpdate = Database['public']['Tables']['course_lessons']['Update'];

// Расширенные типы с relations
interface Course extends DbCourse {
  author?: any;
}

interface CourseLesson extends DbCourseLesson {
  course?: any;
}

class AcademyService {
  // ========================================
  // РАБОТА С КУРСАМИ
  // ========================================

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
      // Проверяем, UUID это или slug
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
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      // Увеличиваем счетчик просмотров
      if (data) {
        // ИСПРАВЛЕНИЕ: добавляем 'as any' для RPC функции
        await supabase.rpc('increment_course_views' as any, { course_id: data.id });
      }

      return data as Course;
    } catch (error) {
      console.error('Error fetching course:', error);
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

      // Загружаем обложку если есть
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

      // ИСПРАВЛЕНИЕ: добавляем приведение типа
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

      // Копируем только переданные поля
      if (input.title !== undefined) updateData.title = input.title;
      if (input.category !== undefined) updateData.category = input.category;
      if (input.language !== undefined) updateData.language = input.language;
      if (input.shortDescription !== undefined) updateData.short_description = input.shortDescription;
      if (input.fullDescription !== undefined) updateData.full_description = input.fullDescription;
      if (input.isPublished !== undefined) updateData.is_published = input.isPublished;
      if (input.difficultyLevel !== undefined) updateData.difficulty_level = input.difficultyLevel;
      if (input.tags !== undefined) updateData.tags = input.tags;

      // Загружаем новую обложку если есть
      if (input.coverImage instanceof File) {
        updateData.cover_image = await this.uploadCourseImage(input.coverImage, 'covers');
      } else if (input.coverImage === null) {
        updateData.cover_image = null;
      } else if (typeof input.coverImage === 'string') {
        updateData.cover_image = input.coverImage;
      }

      // ИСПРАВЛЕНИЕ: добавляем приведение типа
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
   * Получить все уроки курса
   */
  async getCourseLessons(courseId: string): Promise<CourseLesson[]> {
    try {
      const { data, error } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('course_id', courseId)
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
      // Получаем максимальный order_index для курса
      const { data: maxOrderData } = await supabase
        .from('course_lessons')
        .select('order_index')
        .eq('course_id', input.courseId)
        .order('order_index', { ascending: false })
        .limit(1)
        .single();

      const nextOrderIndex = maxOrderData ? (maxOrderData as any).order_index + 1 : 0;

      // Загружаем превью если есть
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

      // ИСПРАВЛЕНИЕ: добавляем приведение типа
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

      // Копируем только переданные поля
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

      // Загружаем новое превью если есть
      if (input.thumbnail instanceof File) {
        updateData.thumbnail_url = await this.uploadCourseImage(input.thumbnail, 'lessons');
      } else if (input.thumbnail === null) {
        updateData.thumbnail_url = null;
      } else if (typeof input.thumbnail === 'string') {
        updateData.thumbnail_url = input.thumbnail;
      }

      // ИСПРАВЛЕНИЕ: добавляем приведение типа
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
      // ИСПРАВЛЕНИЕ: добавляем приведение типа в update
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
   * Удалить изображение
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Извлекаем путь из URL
      const url = new URL(imageUrl);
      const path = url.pathname.split('/').slice(-2).join('/');

      const { error } = await supabase.storage
        .from('academy')
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting image:', error);
      // Не выбрасываем ошибку, т.к. удаление изображения не критично
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
}

export const academyService = new AcademyService();