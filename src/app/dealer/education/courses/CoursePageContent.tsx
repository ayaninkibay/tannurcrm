'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import { ArrowLeft, BookOpen, Clock, Award, FileDown, Play, Lock } from 'lucide-react';
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

  // Функция для извлечения ID YouTube видео
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  useEffect(() => {
    if (courseId) {
      loadCourse(courseId);
      loadLessons(courseId);
    }
  }, [courseId]);

  useEffect(() => {
    if (lessonId) {
      loadLesson(lessonId);
      setVideoError(false); // Сбрасываем ошибку при загрузке нового урока
    } else if (lessons.length > 0 && !currentLesson) {
      // Автоматически выбираем первый урок
      router.push(`?id=${courseId}&lesson=${lessons[0].id}`);
    }
  }, [lessonId, lessons]);

  const openLesson = (selectedLessonId: string) => {
    router.push(`?id=${courseId}&lesson=${selectedLessonId}`);
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '—';
    if (minutes < 60) return `${minutes} ${t('мин')}`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins ? `${hours} ${t('ч')} ${mins} ${t('мин')}` : `${hours} ${t('ч')}`;
  };

  if (loading) {
    return (
      <div className="p-2 md:p-6">
        <MoreHeaderDE title={t('Загрузка...')} showBackButton={true} />
        <div className="mt-6 flex justify-center">
          <div className="text-gray-500">{t('Загрузка курса...')}</div>
        </div>
      </div>
    );
  }

  if (error || !currentCourse) {
    return (
      <div className="p-2 md:p-6">
        <MoreHeaderDE title={t('Ошибка')} showBackButton={true} />
        <div className="mt-6 bg-red-50 rounded-xl p-4">
          <div className="text-red-600">{error || t('Курс не найден')}</div>
          <Link 
            href="/dealer/education" 
            className="mt-4 inline-flex items-center gap-2 text-[#D77E6C] hover:text-[#C66B5A]"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('Вернуться к курсам')}
          </Link>
        </div>
      </div>
    );
  }

  const activeLessonIndex = lessons.findIndex(l => l.id === currentLesson?.id) + 1;

  return (
    <div className="p-2 md:p-6">
      <MoreHeaderDE title={t('Курс')} showBackButton={true} />

      {/* Header */}
      <div className="mt-4 rounded-2xl p-6 md:p-8 text-white bg-[#D77E6C]">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">
          {currentLesson ? (
            <>
              {t('Урок {n}: {title}')
                .replace('{n}', String(activeLessonIndex))
                .replace('{title}', currentLesson.title)}
            </>
          ) : (
            currentCourse.title
          )}
        </h1>
        <p className="text-white/90 text-sm md:text-base">
          {t('Курс: {title}').replace('{title}', currentCourse.title)}
        </p>
        <div className="flex flex-wrap gap-4 md:gap-6 mt-5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <span className="text-sm">
              {currentLesson ? (
                t('Урок {n} из {total}')
                  .replace('{n}', String(activeLessonIndex))
                  .replace('{total}', String(lessons.length))
              ) : (
                `${lessons.length} ${t('уроков')}`
              )}
            </span>
          </div>
          {currentLesson?.duration_minutes && (
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm">{formatDuration(currentLesson.duration_minutes)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            <span className="text-sm">{t('Сертификат после курса')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentLesson && (
            <>
              {/* Video Player */}
              <div className="bg-white rounded-2xl border border-gray-100 p-3 md:p-4 mb-4">
                <div className="relative w-full rounded-xl overflow-hidden bg-black">
                  {currentLesson.video_url && !videoError ? (
                    // Проверяем, является ли это YouTube ссылкой
                    (currentLesson.video_url.includes('youtube.com') || currentLesson.video_url.includes('youtu.be')) ? (
                      <div className="aspect-video">
                        <iframe
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${getYouTubeId(currentLesson.video_url)}`}
                          title={currentLesson.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <video 
                        key={currentLesson.id} 
                        className="w-full h-auto aspect-video" 
                        controls 
                        poster={currentLesson.thumbnail_url || currentCourse.cover_image || undefined}
                        onError={() => setVideoError(true)}
                      >
                        <source src={currentLesson.video_url} type="video/mp4" />
                        {t('Ваш браузер не поддерживает видео')}
                      </video>
                    )
                  ) : (
                    <div className="aspect-video flex items-center justify-center bg-gray-900 text-gray-200">
                      <div className="text-center">
                        <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <div className="text-sm">
                          {videoError ? t('Ошибка загрузки видео') : t('Видео недоступно')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-700">
                  {t('Смотрим: {title}').replace('{title}', currentLesson.title)}
                </div>
              </div>

              {/* Lesson Description */}
              {(currentLesson.description || currentLesson.content) && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{t('О уроке')}</h3>
                  <div className="text-sm text-gray-700 leading-6 whitespace-pre-wrap">
                    {currentLesson.description || currentLesson.content}
                  </div>
                </div>
              )}

              {/* Homework */}
              {currentLesson.homework && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{t('Домашнее задание')}</h3>
                  <div className="text-sm text-gray-700 leading-6 whitespace-pre-wrap">
                    {currentLesson.homework}
                  </div>
                </div>
              )}

              {/* Materials */}
              {currentLesson.attachments && currentLesson.attachments.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">{t('Материалы урока')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentLesson.attachments.map((attachment, i) => (
                      <a       
                        key={i}
                        href={attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200 hover:shadow-sm transition-shadow"
                      >   
                        <span className="text-sm text-gray-800 truncate">
                          {t('Материал')} {i + 1}
                        </span>
                        <FileDown className="w-4 h-4 text-gray-600 flex-shrink-0 ml-2" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!currentLesson && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('О курсе')}</h2>
              <div className="text-sm text-gray-700 leading-6 whitespace-pre-wrap">
                {currentCourse.full_description || currentCourse.short_description}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('Уроки')}</h3>
            <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
              {lessons.map((lesson, index) => {
                const isActive = currentLesson?.id === lesson.id;
                const isLocked = !lesson.is_preview && !lesson.is_published;
                
                return (
                  <button
                    key={lesson.id}
                    onClick={() => !isLocked && openLesson(lesson.id)}
                    disabled={isLocked}
                    className={`w-full text-left flex items-center justify-between gap-3 px-3 py-2 rounded-xl border transition-colors ${
                      isActive 
                        ? 'border-[#D77E6C] bg-[#D77E6C]/5' 
                        : isLocked
                        ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                        : 'border-gray-200 hover:bg-gray-50 cursor-pointer'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {index + 1}. {lesson.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDuration(lesson.duration_minutes)}
                      </div>
                    </div>
                    {isLocked ? (
                      <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    ) : (
                      <Play className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <Link
            href="/dealer/education"
            className="inline-flex items-center gap-2 text-[#D77E6C] hover:text-[#C66B5A] text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('Вернуться к курсам')}
          </Link>
        </aside>
      </div>
    </div>
  );
}