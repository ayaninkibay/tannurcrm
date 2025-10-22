'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import { 
  Grid3x3, 
  Bookmark, 
  BookOpen, 
  ArrowRight,
  Play,
  Clock,
  BookMarked,
  FileText,
  Download,
  FolderOpen,
  File,
  FileVideo,
  FileImage,
  FilePlus,
  Lock
} from 'lucide-react';
import { useTranslate } from '@/hooks/useTranslate';
import { AcademyProvider, useAcademyModule } from '@/lib/academy/AcademyModule';
import { useDocumentModule } from '@/lib/documents/useDocumentModule';
import { useUser } from '@/context/UserContext';

// Кэш данных вне компонента для сохранения между ре-рендерами
const dataCache = {
  courses: null as any[] | null,
  lessons: null as any[] | null,
  categories: null as any[] | null,
  introCourseId: null as string | null,
  timestamp: 0,
  CACHE_DURATION: 5 * 60 * 1000 // 5 минут
};

// Компонент всплывающего уведомления
function ComingSoonTooltip({ show, x, y }: { show: boolean; x: number; y: number }) {
  const { t } = useTranslate();
  
  if (!show) return null;
  
  return (
    <div 
      className="fixed z-50 pointer-events-none"
      style={{ 
        left: `${x}px`, 
        top: `${y}px`,
        transform: 'translate(-50%, -120%)'
      }}
    >
      <div className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap animate-fade-in-up">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4" />
          {t('Скоро будет доступно')}
        </div>
      </div>
    </div>
  );
}

// Компонент карточки документа
function DocumentCard({ category }: { category: any }) {
  const { t } = useTranslate();
  const [isExpanded, setIsExpanded] = useState(false);
  const { profile } = useUser();
  const { downloadDocument } = useDocumentModule();
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0 });

  const userRole = profile?.role;

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['pdf', 'doc', 'docx', 'txt'].includes(extension || '')) {
      return <FileText className="w-5 h-5 text-[#D77E6C]" />;
    }
    if (['mp4', 'avi', 'mov', 'mkv'].includes(extension || '')) {
      return <FileVideo className="w-5 h-5 text-[#D77E6C]" />;
    }
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension || '')) {
      return <FileImage className="w-5 h-5 text-[#D77E6C]" />;
    }
    return <File className="w-5 h-5 text-[#D77E6C]" />;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = async (e: React.MouseEvent, fileUrl: string, fileName: string) => {
    e.stopPropagation();
    
    // Проверка роли для не-админов
    if (userRole !== 'admin') {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setTooltip({
        show: true,
        x: rect.left + rect.width / 2,
        y: rect.top
      });
      setTimeout(() => setTooltip({ show: false, x: 0, y: 0 }), 2000);
      return;
    }

    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка при скачивании файла:', error);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (userRole !== 'admin') {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setTooltip({
        show: true,
        x: rect.left + rect.width / 2,
        y: rect.top
      });
      setTimeout(() => setTooltip({ show: false, x: 0, y: 0 }), 2000);
      return;
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <ComingSoonTooltip show={tooltip.show} x={tooltip.x} y={tooltip.y} />
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-[#D77E6C]/30 hover:shadow-md transition-all">
      <button
        onClick={handleCardClick}
        className="w-full p-6 text-left"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-[#D77E6C]" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
              {category.name}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <File className="w-4 h-4" />
                <span>{category.documents?.length || 0} {t('файлов')}</span>
              </div>
            </div>
          </div>
        </div>
      </button>

      {isExpanded && category.documents && category.documents.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50 p-4">
          <div className="space-y-2">
            {category.documents.map((doc: any) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 mr-3">
                  {getFileIcon(doc.file_name)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.file_name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{formatFileSize(doc.file_size)}</span>
                      {doc.uploaded_at && (
                        <>
                          <span>•</span>
                          <span>{new Date(doc.uploaded_at).toLocaleDateString('ru-RU')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDownload(e, doc.file_url, doc.file_name)}
                  className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={t('Скачать')}
                >
                  <Download className="w-5 h-5 text-[#D77E6C]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  );
}

function EducationContent() {
  const { t } = useTranslate();
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  const { profile, loading: userLoading } = useUser();
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0 });
  
  const { courses, lessons, loading, loadCourses, loadLessons } = useAcademyModule();
  const {
    categories,
    loading: docsLoading,
    loadDocuments,
    downloadDocument
  } = useDocumentModule();

  const [introLessons, setIntroLessons] = useState<any[]>(dataCache.lessons || []);
  const [introCourseId, setIntroCourseId] = useState<string | null>(dataCache.introCourseId);
  const [coursesLoaded, setCoursesLoaded] = useState(false);
  const [displayCourses, setDisplayCourses] = useState<any[]>(dataCache.courses || []);
  const [displayCategories, setDisplayCategories] = useState<any[]>(dataCache.categories || []);
  const isInitialMount = useRef(true);

  const userRole = profile?.role;

  // Проверяем актуальность кэша
  const isCacheValid = () => {
    const now = Date.now();
    return dataCache.timestamp && (now - dataCache.timestamp) < dataCache.CACHE_DURATION;
  };

  // Загружаем данные с учетом кэша
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      
      // Если кэш валиден, используем его
      if (isCacheValid() && dataCache.courses && dataCache.categories) {
        setDisplayCourses(dataCache.courses);
        setDisplayCategories(dataCache.categories);
        if (dataCache.lessons) {
          setIntroLessons(dataCache.lessons);
        }
        setCoursesLoaded(true);
        // Все равно загружаем документы для обновления
        loadDocuments();
        return;
      }
      
      // Иначе загружаем свежие данные
      Promise.all([
        loadCourses({ isPublished: true }),
        loadDocuments()
      ]).then(() => {
        setCoursesLoaded(true);
        dataCache.timestamp = Date.now();
      });
    }
  }, [loadCourses, loadDocuments]);

  // Сохраняем курсы в кэш и обновляем отображаемые курсы
  useEffect(() => {
    if (courses.length > 0 && coursesLoaded) {
      dataCache.courses = courses;
      setDisplayCourses(courses);
    }
  }, [courses, coursesLoaded]);

  // Сохраняем категории в кэш и обновляем отображаемые категории
  useEffect(() => {
    if (categories && categories.length > 0) {
      dataCache.categories = categories;
      setDisplayCategories(categories);
    }
  }, [categories]);

  // Загружаем уроки только когда найден курс
  useEffect(() => {
    if (!coursesLoaded) return;
    
    const introCourse = displayCourses.find(course => 
      course.title === 'Знакомство c Tannur' || 
      course.title === 'Знакомство с Tannur'
    );
    
    if (introCourse && introCourse.id !== introCourseId) {
      setIntroCourseId(introCourse.id);
      dataCache.introCourseId = introCourse.id;
      
      // Если кэш валиден и уроки есть, не перезагружаем
      if (isCacheValid() && dataCache.lessons && dataCache.lessons.length > 0) {
        setIntroLessons(dataCache.lessons);
      } else {
        loadLessons(introCourse.id);
      }
    }
  }, [coursesLoaded, displayCourses, introCourseId, loadLessons]);

  // Обновляем уроки и сохраняем в кэш
  useEffect(() => {
    if (introCourseId && lessons.length > 0) {
      setIntroLessons(lessons);
      dataCache.lessons = lessons;
    }
  }, [lessons, introCourseId]);

  const formatLessonDuration = (minutes: number | null) => {
    if (!minutes) return '—';
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins ? `${hours} ч ${mins} мин` : `${hours} ч`;
  };

  const handleRestrictedAction = (e: React.MouseEvent) => {
    if (userRole !== 'admin') {
      e.preventDefault();
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setTooltip({
        show: true,
        x: rect.left + rect.width / 2,
        y: rect.top
      });
      setTimeout(() => setTooltip({ show: false, x: 0, y: 0 }), 2000);
      return false;
    }
    return true;
  };

  const handleTabChange = (tab: 'all' | 'saved', e: React.MouseEvent) => {
    if (userRole !== 'admin') {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setTooltip({
        show: true,
        x: rect.left + rect.width / 2,
        y: rect.top
      });
      setTimeout(() => setTooltip({ show: false, x: 0, y: 0 }), 2000);
      return;
    }
    setActiveTab(tab);
  };

  if (userLoading || (loading || !coursesLoaded) && !isCacheValid()) {
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
    <div className="p-2 md:p-6 relative">
      {/* Всплывающее уведомление */}
      <ComingSoonTooltip show={tooltip.show} x={tooltip.x} y={tooltip.y} />

      <MoreHeaderDE title={t('Академия TNBA')} />

      {/* Tab Navigation */}
      <div className="mb-6 mt-6">
        <div className="flex gap-2">
          <button
            onClick={(e) => handleTabChange('all', e)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'all' ? 'bg-[#D77E6C] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
            <span>{t('Все курсы')}</span>
          </button>
          <button
            onClick={(e) => handleTabChange('saved', e)}
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
          {displayCourses.length > 0 && (
            <div className="mb-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {displayCourses.slice(0, 4).map((course) => (
                  <Link
                    key={course.id}
                    href={userRole === 'admin' ? `/dealer/education/course-preview?id=${course.id}` : '#'}
                    onClick={(e) => handleRestrictedAction(e)}
                    className="bg-white border border-gray-100 rounded-xl p-4 hover:border-[#D77E6C]/30 hover:shadow-sm transition-all block"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-[#D77E6C]/10 rounded-lg text-[#D77E6C]">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <span className="text-lg font-bold text-gray-900">{course.lessons_count || 0}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{course.title}</p>
                    <p className="text-xs text-gray-500">{t('Курс')}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Lessons Section */}
          {introCourseId && (
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">{t('Популярные уроки')}</h2>
              <Link
                href={userRole === 'admin' ? `/dealer/education/course-preview?id=${introCourseId}` : '#'}
                onClick={(e) => handleRestrictedAction(e)}
                className="text-[#D77E6C] hover:text-[#C66B5A] text-sm font-medium flex items-center gap-1 transition-colors"
              >
                {t('Все уроки курса')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Lessons Grid */}
          {introLessons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {introLessons.slice(0, 4).map((lesson: any, index) => (
                <Link
                  key={lesson.id}
                  href={userRole === 'admin' ? `/dealer/education/courses?id=${introCourseId}&lesson=${lesson.id}` : '#'}
                  onClick={(e) => handleRestrictedAction(e)}
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
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center mb-12">
              <Play className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{t('В этом курсе пока нет уроков')}</p>
            </div>
          ) : null}

          {/* Documents Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">{t('Документы')}</h2>
            </div>

            {docsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#D77E6C] border-t-transparent"></div>
              </div>
            ) : categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {categories.map((category) => (
                  <DocumentCard key={category.id} category={category} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="inline-flex p-6 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full mb-6">
                  <FolderOpen className="w-12 h-12 text-[#D77E6C]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {t('Документы пока не загружены')}
                </h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  {t('Обратитесь к администратору для получения необходимых документов')}
                </p>
              </div>
            )}
          </div>

          {/* Empty state for no courses */}
          {displayCourses.length === 0 && coursesLoaded && (
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
              onClick={(e) => handleTabChange('all', e)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#D77E6C] hover:bg-[#C66B5A] text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Grid3x3 className="w-4 h-4" />
              {t('Перейти к курсам')}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #D77E6C;
          border-radius: 10px;
          opacity: 0.6;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #C66B5A;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate(-50%, -100%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -120%);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default function EducationPage() {
  return (
    <AcademyProvider>
      <EducationContent />
    </AcademyProvider>
  );
}