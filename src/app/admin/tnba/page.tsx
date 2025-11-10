'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { useTranslate } from '@/hooks/useTranslate';
import { AcademyProvider, useAcademyModule } from '@/lib/academy/AcademyModule';
import { useDocumentModule } from '@/lib/documents/useDocumentModule';
import { 
  BookOpen, 
  Edit2, 
  Eye, 
  Trash2,
  Plus,
  Grid3x3,
  Users,
  BarChart3,
  Upload,
  Download,
  FileText,
  FileVideo,
  FileImage,
  File,
  Folder,
  X,
  Check
} from 'lucide-react';

export default function AcademyTannurPage() {
  return (
    <AcademyProvider>
      <AcademyContent />
    </AcademyProvider>
  );
}

function AcademyContent() {
  const router = useRouter();
  const { t } = useTranslate();
  const [mounted, setMounted] = useState(false);
  
  const { 
    courses, 
    loading, 
    error,
    loadCourses,
    deleteCourse 
  } = useAcademyModule();

  const {
    categories,
    loading: docsLoading,
    uploading,
    error: docsError,
    loadDocuments,
    uploadDocument,
    deleteDocument,
    downloadDocument,
    updateCategoryName,
    clearError
  } = useDocumentModule();

  const [dragOver, setDragOver] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const fileInputRefs = React.useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    setMounted(true);
    loadCourses();
    loadDocuments();
  }, [loadCourses, loadDocuments]);

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm(t('Вы уверены, что хотите удалить этот курс?'))) {
      await deleteCourse(courseId);
      loadCourses();
    }
  };

  const calculateTotalLessons = () => {
    return courses.reduce((total, course) => total + (course.lessons_count || 0), 0);
  };

  // Document handlers
  const handleFileUpload = async (categoryId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await uploadDocument(categoryId, file);
    }
  };

  const handleDragOver = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    setDragOver(categoryId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    setDragOver(null);
    handleFileUpload(categoryId, e.dataTransfer.files);
  };

  const handleDeleteFile = async (category: any, file: any) => {
    if (confirm(t('Вы уверены, что хотите удалить этот документ?'))) {
      const urlParts = file.public_url.split('/');
      const fullFileName = urlParts[urlParts.length - 1];
      await deleteDocument(category.id, decodeURIComponent(fullFileName));
    }
  };

  const startEditCategory = (categoryId: string, currentName: string) => {
    setEditingCategory(categoryId);
    setEditName(currentName);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditName('');
  };

  const saveEdit = async (categoryId: string) => {
    if (!editName.trim()) return;
    
    const result = await updateCategoryName(categoryId, editName.trim());
    if (result.success) {
      setEditingCategory(null);
      setEditName('');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['pdf', 'doc', 'docx', 'txt'].includes(extension || '')) {
      return <FileText className="w-4 h-4 text-[#D77E6C]" />;
    }
    if (['mp4', 'avi', 'mov', 'mkv'].includes(extension || '')) {
      return <FileVideo className="w-4 h-4 text-[#D77E6C]" />;
    }
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension || '')) {
      return <FileImage className="w-4 h-4 text-[#D77E6C]" />;
    }
    return <File className="w-4 h-4 text-[#D77E6C]" />;
  };

  const FileUploadArea = ({ categoryId }: { categoryId: string }) => (
    <div
      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
        dragOver === categoryId
          ? 'border-[#D77E6C] bg-orange-50'
          : 'border-gray-300 hover:border-gray-400 bg-gray-50'
      } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      onDragOver={(e) => handleDragOver(e, categoryId)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, categoryId)}
      onClick={() => !uploading && fileInputRefs.current[categoryId]?.click()}
    >
      <input
        ref={(el) => {
          fileInputRefs.current[categoryId] = el;
        }}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFileUpload(categoryId, e.target.files)}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4,.avi,.mov"
        disabled={uploading}
      />

      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
          {uploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#D77E6C] border-t-transparent"></div>
          ) : (
            <Upload className="w-6 h-6 text-[#D77E6C]" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">
            {uploading ? t('Загрузка...') : t('Загрузить файлы')}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {t('Перетащите или нажмите для выбора')}
          </p>
        </div>
      </div>
    </div>
  );

  if (!mounted) {
    return (
      <div className="p-2 md:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-48 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (loading || docsLoading) {
    return (
      <div className="p-2 md:p-6">
        <MoreHeaderAD title={t('Академия TNBA')} />
        <div className="mt-6 flex justify-center">
          <div className="text-gray-500 text-sm">{t('Загрузка...')}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2 md:p-6">
        <MoreHeaderAD title={t('Академия TNBA')} />
        <div className="mt-6 bg-red-50 rounded-lg p-4">
          <div className="text-red-600 text-sm">Ошибка: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="flex">
        <MoreHeaderAD title={t('Академия Tannur')} />
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8 mt-4 md:mt-6">
        <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 bg-[#D77E6C]/10 rounded-lg">
              <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-[#D77E6C]" />
            </div>
            <div>
              <div className="text-lg md:text-xl font-semibold text-gray-900">{courses.length}</div>
              <div className="text-xs md:text-sm text-gray-500">{t('Курсов')}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
            </div>
            <div>
              <div className="text-lg md:text-xl font-semibold text-gray-900">
                {courses.filter(c => c.is_published).length}
              </div>
              <div className="text-xs md:text-sm text-gray-500">{t('Опубликовано')}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Edit2 className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            </div>
            <div>
              <div className="text-lg md:text-xl font-semibold text-gray-900">
                {courses.filter(c => !c.is_published).length}
              </div>
              <div className="text-xs md:text-sm text-gray-500">{t('Черновиков')}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-lg md:text-xl font-semibold text-gray-900">{calculateTotalLessons()}</div>
              <div className="text-xs md:text-sm text-gray-500">{t('Уроков')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Section Header */}
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <div className="p-2 bg-[#D77E6C] rounded-lg">
          <Grid3x3 className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">{t('Управление курсами')}</h2>
      </div>

      {/* Courses Grid */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#D77E6C]/5 rounded-full"></div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-[#D77E6C]/8 rounded-full"></div>
              <div className="absolute top-1/2 right-2 w-8 h-8 bg-[#D77E6C]/10 rounded-full"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-gradient-to-br from-[#D77E6C] to-[#C66B5A] rounded-xl shadow-sm">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => router.push(`/admin/tnba/course?id=${course.id}`)}
                      className="p-2 hover:bg-blue-50 rounded-xl transition-colors"
                      title={t('Просмотр')}
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => router.push(`/admin/tnba/create_cours?id=${course.id}`)}
                      className="p-2 hover:bg-[#D77E6C]/10 rounded-xl transition-colors"
                      title={t('Редактировать')}
                    >
                      <Edit2 className="w-4 h-4 text-[#D77E6C]" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-2 hover:bg-red-50 rounded-xl transition-colors"
                      title={t('Удалить')}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-semibold text-gray-900 mb-4 line-clamp-2 min-h-[48px] group-hover:text-[#C66B5A] transition-colors">
                  {course.title}
                </h3>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full">
                    <Users className="w-4 h-4" />
                    <span>{course.lessons_count || 0} уроков</span>
                  </div>
                  <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                    course.is_published 
                      ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' 
                      : 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
                  }`}>
                    {course.is_published ? t('Опубликован') : t('Черновик')}
                  </span>
                </div>

                {course.category && (
                  <div className="text-sm text-gray-500 mb-6 bg-gray-50 px-3 py-1.5 rounded-lg inline-block">
                    {course.category}
                  </div>
                )}

                <button
                  onClick={() => router.push(`/admin/tnba/create_cours?id=${course.id}`)}
                  className="w-full bg-gradient-to-r from-[#D77E6C] to-[#C66B5A] hover:from-[#C66B5A] hover:to-[#B55A4A] text-white py-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                >
                  <Edit2 className="w-4 h-4" />
                  {t('Редактировать')}
                </button>
              </div>
            </div>
          ))}

          <Link
            href="/admin/tnba/create_cours"
            className="bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#D77E6C]/50 p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-all duration-300 group min-h-[280px] relative overflow-hidden"
          >
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-[#D77E6C]/5 rounded-full group-hover:bg-[#D77E6C]/10 transition-colors duration-300"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-[#D77E6C]/8 rounded-full group-hover:bg-[#D77E6C]/12 transition-colors duration-300"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-[#D77E6C]/20 group-hover:to-[#C66B5A]/20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300">
                <Plus className="w-8 h-8 text-gray-500 group-hover:text-[#D77E6C] transition-colors duration-300" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-3 group-hover:text-[#C66B5A] transition-colors duration-300">{t('Создать новый курс')}</h3>
              <p className="text-sm text-gray-500 group-hover:text-[#D77E6C] transition-colors duration-300">{t('Добавьте новый курс в академию')}</p>
            </div>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12 text-center mb-12">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('Пока нет курсов')}</h3>
            <p className="text-sm text-gray-500 mb-6">{t('Создайте первый курс для академии TNBA')}</p>
            <Link
              href="/admin/tnba/create_cours"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#D77E6C] hover:bg-[#C66B5A] text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('Создать курс')}
            </Link>
          </div>
        </div>
      )}

      {/* Documents Section */}
      <div className="mt-12 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#D77E6C] rounded-lg">
            <Folder className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">{t('Управление документами')}</h2>
        </div>

        {docsError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
            <span className="text-red-700 text-sm">{docsError}</span>
            <button onClick={clearError} className="text-red-500 hover:text-red-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  {editingCategory === category.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && saveEdit(category.id)}
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C] focus:border-transparent"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEdit(category.id)}
                        className="p-1.5 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Check className="w-4 h-4 text-green-600" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Folder className="w-5 h-5 text-[#D77E6C]" />
                        <h3 className="text-base font-semibold text-gray-900">
                          {t(category.name)}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEditCategory(category.id, category.name)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title={t('Редактировать название')}
                        >
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </button>
                        <span className="text-sm text-gray-500 ml-2">
                          {category.files.length}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-2 max-h-[300px] overflow-y-auto mb-4">
                  {category.files.map((file) => (
                    <div 
                      key={file.id} 
                      className="group flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getFileIcon(file.name)}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-gray-800 truncate">{file.name}</p>
                          {file.size > 0 && (
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDeleteFile(category, file)}
                          className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                          title={t('Удалить')}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                        <button 
                          onClick={() => downloadDocument(file.public_url, file.name)}
                          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                          title={t('Скачать')}
                        >
                          <Download className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <FileUploadArea categoryId={category.id} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}