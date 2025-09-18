'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import { 
  ArrowLeft, BookOpen, Clock, Award, FileDown, Play, Lock, 
  ChevronDown, ChevronRight, CheckCircle, Circle, Download,
  Eye, User, Calendar, Target, Zap
} from 'lucide-react';
import { useTranslate } from '@/hooks/useTranslate';
import { useAcademyModule } from '@/lib/academy/AcademyModule';

export default function CoursePage() {
  const { t } = useTranslate();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const courseId = searchParams?.get('id');
  const lessonId = searchParams?.get('lesson');
  
  const { 
    currentCourse,
    currentLesson,
    lessons,
    loading,
    error,
    loadCourse,
    loadLessons,
    loadLesson
  } = useAcademyModule();

  const [videoError, setVideoError] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    course: true,
    lessons: true,
    currentLesson: false
  });

  // Функция для извлечения ID YouTube видео
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  useEffect(() => {
    if (courseId) {
      setLoadingStates(prev => ({ ...prev, course: true, lessons: true }));
      
      Promise.all([
        loadCourse(courseId),
        loadLessons(courseId)
      ]).then(() => {
        setLoadingStates(prev => ({ ...prev, course: false, lessons: false }));
      }).catch(() => {
        setLoadingStates(prev => ({ ...prev, course: false, lessons: false }));
      });
    }
  }, [courseId]);

  useEffect(() => {
    if (lessonId) {
      setLoadingStates(prev => ({ ...prev, currentLesson: true }));
      setVideoError(false);
      
      loadLesson(lessonId).then(() => {
        setLoadingStates(prev => ({ ...prev, currentLesson: false }));
      }).catch(() => {
        setLoadingStates(prev => ({ ...prev, currentLesson: false }));
      });
    } else if (lessons.length > 0 && !currentLesson && !loadingStates.lessons) {
      router.push(`?id=${courseId}&lesson=${lessons[0].id}`);
    }
  }, [lessonId, lessons, loadingStates.lessons]);

  const openLesson = (selectedLessonId: string) => {
    router.push(`?id=${courseId}&lesson=${selectedLessonId}`);
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '—';
    if (minutes < 60) return `${minutes}м`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins ? `${hours}ч ${mins}м` : `${hours}ч`;
  };

  const getCurrentLessonIndex = () => {
    return lessons.findIndex(l => l.id === currentLesson?.id);
  };

  const getNextLesson = () => {
    const currentIndex = getCurrentLessonIndex();
    if (currentIndex < lessons.length - 1) {
      return lessons[currentIndex + 1];
    }
    return null;
  };

  const getPrevLesson = () => {
    const currentIndex = getCurrentLessonIndex();
    if (currentIndex > 0) {
      return lessons[currentIndex - 1];
    }
    return null;
  };

  if (loadingStates.course || loadingStates.lessons) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 md:p-6">
          {/* Header Skeleton */}
          <div className="animate-pulse mb-6">
            <div className="h-12 bg-gray-200 rounded-lg w-1/3"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content Skeleton */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl p-6 border border-gray-200 animate-pulse">
                {/* Video Player Skeleton */}
                <div className="w-full max-w-4xl mx-auto mb-6">
                  <div className="aspect-video bg-gray-200 rounded-2xl"></div>
                </div>
                
                {/* Title and Controls Skeleton */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="flex gap-4">
                      <div className="h-5 bg-gray-200 rounded w-20"></div>
                      <div className="h-5 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-10 bg-gray-200 rounded-xl w-20"></div>
                    <div className="h-10 bg-gray-200 rounded-xl w-20"></div>
                  </div>
                </div>
              </div>
              
              {/* Content Sections Skeleton */}
              <div className="mt-6 space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-gray-200 rounded"></div>
                    <div className="h-5 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar Skeleton */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                <div className="flex justify-between items-center mb-4">
                  <div className="h-5 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="h-2 bg-gray-200 rounded mb-6"></div>
                
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-4 border border-gray-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="w-4 h-4 bg-gray-200 rounded-full mt-0.5"></div>
                        <div className="flex-1">
                          <div className="flex gap-2 mb-2">
                            <div className="h-4 bg-gray-200 rounded w-8"></div>
                            <div className="h-4 bg-gray-200 rounded w-12"></div>
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if ((!loadingStates.course && !currentCourse) || error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 md:p-6">
          <div className="max-w-2xl mx-auto text-center mt-20">
            <div className="bg-white rounded-3xl p-12 border border-gray-200">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('Курс недоступен')}</h2>
              <p className="text-gray-600 mb-2">
                {error || t('Курс не найден или был удален')}
              </p>
              <p className="text-sm text-gray-500 mb-8">
                {t('Возможно, курс еще не опубликован или у вас нет доступа к нему')}
              </p>
              <Link 
                href="/dealer/education" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#D77E6C] hover:bg-[#C66B5A] text-white rounded-xl font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('Вернуться к курсам')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = getCurrentLessonIndex();
  const progress = lessons.length > 0 ? ((currentIndex + 1) / lessons.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 md:p-6">
        <MoreHeaderDE title={currentCourse.title} showBackButton={true} />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {currentLesson ? (
              <div className="space-y-6">
                {/* Video Player */}
                <div className="bg-white rounded-3xl p-6 border border-gray-200 relative overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#D77E6C]/5 rounded-full"></div>
                  <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-[#D77E6C]/8 rounded-full"></div>
                  
                  <div className="relative z-10">
                    <div className="w-full max-w-4xl mx-auto">
                      <div className="aspect-video bg-black rounded-2xl overflow-hidden mb-4" style={{ maxHeight: '600px' }}>
                        {currentLesson.video_url && !videoError ? (
                          (currentLesson.video_url.includes('youtube.com') || currentLesson.video_url.includes('youtu.be')) ? (
                            <iframe
                              className="w-full h-full"
                              src={`https://www.youtube.com/embed/${getYouTubeId(currentLesson.video_url)}`}
                              title={currentLesson.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />
                          ) : (
                            <video 
                              key={currentLesson.id} 
                              className="w-full h-full" 
                              controls 
                              poster={currentLesson.thumbnail_url || currentCourse.cover_image || undefined}
                              onError={() => setVideoError(true)}
                            >
                              <source src={currentLesson.video_url} type="video/mp4" />
                              {t('Ваш браузер не поддерживает видео')}
                            </video>
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-200">
                            <div className="text-center">
                              <Play className="w-20 h-20 mx-auto mb-4 opacity-50" />
                              <div className="text-lg font-medium mb-2">
                                {videoError ? t('Ошибка загрузки видео') : t('Видео недоступно')}
                              </div>
                              <p className="text-gray-400 text-sm">
                                {t('Проверьте подключение к интернету')}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Lesson Info */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {currentLesson.title}
                        </h2>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDuration(currentLesson.duration_minutes)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {t('Урок')} {currentIndex + 1} из {lessons.length}
                          </div>
                        </div>
                      </div>

                      {/* Navigation */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => getPrevLesson() && openLesson(getPrevLesson()!.id)}
                          disabled={!getPrevLesson()}
                          className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {t('Назад')}
                        </button>
                        <button
                          onClick={() => getNextLesson() && openLesson(getNextLesson()!.id)}
                          disabled={!getNextLesson()}
                          className="px-4 py-2 bg-[#D77E6C] hover:bg-[#C66B5A] text-white rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {t('Далее')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Sections */}
                <div className="grid grid-cols-1 gap-6">
                  {/* Description */}
                  {(currentLesson.description || currentLesson.content) && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="w-5 h-5 text-[#D77E6C]" />
                        <h3 className="text-lg font-semibold text-gray-900">{t('Описание урока')}</h3>
                      </div>
                      <div className="prose prose-sm max-w-none text-gray-700">
                        {currentLesson.description || currentLesson.content}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Homework */}
                    {currentLesson.homework && (
                      <div className="bg-white rounded-2xl p-6 border border-gray-200 relative overflow-hidden">
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#D77E6C]/5 rounded-full"></div>
                        <div className="absolute -bottom-3 -left-3 w-16 h-16 bg-[#D77E6C]/8 rounded-full"></div>
                        
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-[#D77E6C]/10 rounded-lg">
                              <Zap className="w-5 h-5 text-[#D77E6C]" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{t('Практическое задание')}</h3>
                          </div>
                          <div className="text-gray-700 text-sm leading-relaxed">
                            {currentLesson.homework}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Materials */}
                    {currentLesson.attachments && currentLesson.attachments.length > 0 && (
                      <div className="bg-white rounded-2xl p-6 border border-gray-200 relative overflow-hidden">
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#D77E6C]/5 rounded-full"></div>
                        <div className="absolute -bottom-3 -left-3 w-16 h-16 bg-[#D77E6C]/8 rounded-full"></div>
                        
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-[#D77E6C]/10 rounded-lg">
                              <Download className="w-5 h-5 text-[#D77E6C]" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{t('Материалы урока')}</h3>
                          </div>
                          <div className="space-y-3">
                            {currentLesson.attachments.map((attachment, i) => (
                              <a
                                key={i}
                                href={attachment}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 border border-gray-100 hover:border-gray-200 transition-all group"
                              >
                                <span className="text-sm font-medium text-gray-800">
                                  {t('Материал')} {i + 1}
                                </span>
                                <FileDown className="w-4 h-4 text-[#D77E6C] group-hover:text-[#C66B5A] transition-colors" />
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Course Overview */
              <div className="bg-white rounded-3xl p-8 border border-gray-200 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#D77E6C]/5 rounded-full"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#D77E6C]/8 rounded-full"></div>
                
                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <Award className="w-16 h-16 text-[#D77E6C] mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">{currentCourse.title}</h2>
                    <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
                      {currentCourse.full_description || currentCourse.short_description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gray-50 rounded-2xl">
                      <BookOpen className="w-8 h-8 text-[#D77E6C] mx-auto mb-3" />
                      <div className="text-2xl font-bold text-gray-900">{lessons.length}</div>
                      <div className="text-gray-600 text-sm">{t('уроков')}</div>
                    </div>
                    
                    <div className="text-center p-6 bg-gray-50 rounded-2xl">
                      <Clock className="w-8 h-8 text-[#D77E6C] mx-auto mb-3" />
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.round(lessons.reduce((total, lesson) => total + (lesson.duration_minutes || 0), 0) / 60) || '—'}
                      </div>
                      <div className="text-gray-600 text-sm">{t('часов')}</div>
                    </div>
                    
                    <div className="text-center p-6 bg-gray-50 rounded-2xl">
                      <Award className="w-8 h-8 text-[#D77E6C] mx-auto mb-3" />
                      <div className="text-2xl font-bold text-gray-900">★</div>
                      <div className="text-gray-600 text-sm">{t('Сертификат')}</div>
                    </div>
                  </div>

                  {lessons.length > 0 && (
                    <div className="text-center mt-8">
                      <button
                        onClick={() => openLesson(lessons[0].id)}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-[#D77E6C] hover:bg-[#C66B5A] text-white rounded-2xl text-lg font-semibold transition-colors"
                      >
                        <Play className="w-5 h-5" />
                        {t('Начать обучение')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{t('Содержание курса')}</h3>
                <span className="text-sm text-gray-500">{currentIndex + 1}/{lessons.length}</span>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{t('Прогресс')}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div 
                    className="h-full bg-[#D77E6C] rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {lessons.map((lesson, index) => {
                  const isActive = currentLesson?.id === lesson.id;
                  const isCompleted = index < currentIndex;
                  const isLocked = !lesson.is_preview && !lesson.is_published;
                  
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => !isLocked && openLesson(lesson.id)}
                      disabled={isLocked}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                        isActive 
                          ? 'border-[#D77E6C] bg-[#D77E6C]/5 shadow-sm' 
                          : isLocked
                          ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                          : 'border-gray-200 hover:border-[#D77E6C]/30 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {isLocked ? (
                            <Lock className="w-4 h-4 text-gray-400" />
                          ) : isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : isActive ? (
                            <Play className="w-4 h-4 text-[#D77E6C]" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {index + 1}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDuration(lesson.duration_minutes)}
                            </span>
                          </div>
                          
                          <h4 className={`text-sm font-medium leading-snug ${
                            isActive ? 'text-[#D77E6C]' : 'text-gray-900'
                          }`}>
                            {lesson.title}
                          </h4>
                          
                          {lesson.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {lesson.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link 
                  href="/dealer/education"
                  className="flex items-center justify-center gap-2 w-full py-3 text-[#D77E6C] hover:text-[#C66B5A] text-sm font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('К списку курсов')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}