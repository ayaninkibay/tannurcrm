'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import { 
  Grid3x3, 
  Bookmark, 
  BookOpen, 
  ArrowRight,
  Play,
  Clock,
  Award,
  BookMarked
} from 'lucide-react';
import { useTranslate } from '@/hooks/useTranslate';
import { useAcademyModule } from '@/lib/academy/AcademyModule';

export default function EducationContent() {
  const { t } = useTranslate();
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  
  const { courses, lessons, loading, loadCourses, loadLessons } = useAcademyModule();
  const [introLessons, setIntroLessons] = useState<any[]>([]);
  const [introCourseId, setIntroCourseId] = useState<string | null>(null);
  const [coursesLoaded, setCoursesLoaded] = useState(false);

  // Загружаем курсы только один раз
  useEffect(() => {
    if (!coursesLoaded) {
      loadCourses({ isPublished: true }).then(() => {
        setCoursesLoaded(true);
      });
    }
  }, []);

  // Загружаем уроки только когда найден курс
  useEffect(() => {
    if (!coursesLoaded) return;
    
    const introCourse = courses.find(course => 
      course.title === 'Знакомство c Tannur' || 
      course.title === 'Знакомство с Tannur'
    );
    
    if (introCourse && introCourse.id !== introCourseId) {
      setIntroCourseId(introCourse.id);
      loadLessons(introCourse.id);
    }
  }, [coursesLoaded, courses, introCourseId, loadLessons]);

  // Обновляем уроки только когда они загружены
  useEffect(() => {
    if (introCourseId && lessons.length > 0) {
      setIntroLessons(lessons);
    }
  }, [lessons, introCourseId]);

  // Подсчет общего количества часов
  const calculateTotalHours = () => {
    let totalHours = 0;
    
    courses.forEach(course => {
      if (course.duration_hours) {
        totalHours += course.duration_hours;
      }
    });
    
    if (totalHours > 0) {
      return `${Math.round(totalHours)}+ часов`;
    }
    return 'Доступно';
  };

  const formatDuration = (hours: number | null) => {
    if (!hours) return '—';
    if (hours < 1) return `${Math.round(hours * 60)} мин`;
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h} ч ${m} мин` : `${h} ч`;
  };

  const formatLessonDuration = (minutes: number | null) => {
    if (!minutes) return '—';
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins ? `${hours} ч ${mins} мин` : `${hours} ч`;
  };

  if (loading && !coursesLoaded) {
    return (
      <div className="p-2 md:p-6">
        <MoreHeaderDE title={t('Академия TNBA')} />
        <div className="mt-6 flex justify-center">
          <div className="text-gray-500">{t('Загрузка...')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6">
      <MoreHeaderDE title={t('Академия TNBA')} />

      {/* Hero Section */}
      <div className="mt-6 bg-gradient-to-r from-[#D77E6C] to-[#E09080] rounded-2xl p-6 md:p-8 text-white mb-8">
        <div className="max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">{t('Развивайте навыки вместе с Tannur')}</h1>
          <p className="text-white/90 text-sm md:text-base">{t('Пройдите обучение и станьте экспертом в продажах косметики')}</p>
          <div className="flex flex-wrap gap-4 md:gap-6 mt-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm">
                {courses.length > 0 ? `${courses.length} ${courses.length === 1 ? 'курс' : courses.length < 5 ? 'курса' : 'курсов'}` : 'Доступно'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm">{calculateTotalHours()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span className="text-sm">{t('Сертификаты')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Grid3x3 className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            {activeTab === 'all' ? t('Курсы') : t('Сохраненные курсы')}
          </h2>
        </div>

        <div className="flex bg-white rounded-lg p-1 shadow-sm w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'all' ? 'bg-[#D77E6C] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
            <span>{t('Все курсы')}</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'saved' ? 'bg-[#D77E6C] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>{t('Сохраненные')}</span>
          </button>
        </div>
      </div>

      {activeTab === 'all' ? (
        <>
          {/* Courses Grid */}
          {courses.length > 0 && (
            <div className="mb-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {courses.slice(0, 4).map((course) => (
                  <Link
                    key={course.id}
                    href={`/dealer/education/course-preview?id=${course.id}`}
                    className="bg-white border border-gray-100 rounded-xl p-4 hover:border-[#D77E6C]/30 hover:shadow-sm transition-all block"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-[#D77E6C]/10 rounded-lg text-[#D77E6C]">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <span className="text-lg font-bold text-gray-900">{course.lessons_count || 0}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{course.title}</p>
                    <p className="text-xs text-gray-500">{t('уроков')}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Lessons Section Header */}
          {introCourseId && (
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">{t('Уроки')}</h2>
              <Link
                href={`/dealer/education/course-preview?id=${introCourseId}`}
                className="text-[#D77E6C] hover:text-[#C66B5A] text-sm font-medium flex items-center gap-1 transition-colors"
              >
                {t('Все уроки курса')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Lessons Grid */}
          {introLessons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {introLessons.slice(0, 4).map((lesson: any, index) => (
                <Link
                  key={lesson.id}
                  href={`/dealer/education/courses?id=${introCourseId}&lesson=${lesson.id}`}
                  className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-200 group block"
                >
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    {lesson.thumbnail_url ? (
                      <img 
                        src={lesson.thumbnail_url} 
                        alt={lesson.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-[#D77E6C] ml-1" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <span className="inline-block text-xs text-[#D77E6C] font-medium mb-2">
                      {t('Урок')} {index + 1}
                    </span>
                    <h3 className="text-base font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[48px]">
                      {lesson.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatLessonDuration(lesson.duration_minutes)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 group-hover:bg-[#D77E6C] text-gray-700 group-hover:text-white py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2">
                      <span>{t('Смотреть урок')}</span>
                      <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : introCourseId ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <Play className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{t('В этом курсе пока нет уроков')}</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{t('Создайте курс "Знакомство c Tannur" для отображения уроков')}</p>
            </div>
          )}

          {/* Empty state for no courses */}
          {courses.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('Курсы появятся здесь')}</h3>
              <p className="text-sm text-gray-500">{t('Пока курсов нет, но они скоро появятся')}</p>
            </div>
          )}
        </>
      ) : (
        /* Saved courses tab */
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="max-w-sm mx-auto">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookMarked className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('Нет сохраненных курсов')}</h3>
            <p className="text-sm text-gray-500 mb-6">{t('Сохраняйте интересные курсы, чтобы вернуться к ним позже')}</p>
            <button 
              onClick={() => setActiveTab('all')}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#D77E6C] hover:bg-[#C66B5A] text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Grid3x3 className="w-4 h-4" />
              {t('Перейти к курсам')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}