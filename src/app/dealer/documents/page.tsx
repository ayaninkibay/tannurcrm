'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { useTranslate } from '@/hooks/useTranslate';
import { useDocumentModule } from '@/lib/documents/useDocumentModule';
import { 
  FileText, 
  Download, 
  FolderOpen, 
  Info,
  File,
  FileVideo,
  FileImage,
  FilePlus
} from 'lucide-react';

export default function DealerDocumentsPage() {
  const { t } = useTranslate();
  
  const {
    categories,
    loading,
    error,
    loadDocuments,
    downloadDocument,
    clearError
  } = useDocumentModule();

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

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
      return <FileText className="w-5 h-5 text-[#DC7C67]" />;
    }
    if (['mp4', 'avi', 'mov', 'mkv'].includes(extension || '')) {
      return <FileVideo className="w-5 h-5 text-[#DC7C67]" />;
    }
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension || '')) {
      return <FileImage className="w-5 h-5 text-[#DC7C67]" />;
    }
    return <File className="w-5 h-5 text-[#DC7C67]" />;
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    await downloadDocument(fileUrl, fileName);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="space-y-8 p-2 md:p-6">
          <MoreHeaderAD title={t('Документы Tannur')} />
          <div className="flex justify-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#DC7C67] border-t-transparent"></div>
              <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 border-4 border-[#DC7C67] opacity-20"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const FileCard = ({ category }: { category: any }) => (
    <div className="bg-white rounded-2xl hover:shadow-sm transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Заголовок категории */}
      <div className="bg-gradient-to-r from-[#DC7C67] to-[#E89380] p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
            {category.icon_src ? (
              <Image src={category.icon_src} alt="icon" width={20} height={20} />
            ) : (
              <FolderOpen className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-sm md:text-base">
              {t(category.name)}
            </h3>
            <p className="text-white/80 text-xs">
              {category.files.length} {t('файлов')}
            </p>
          </div>
        </div>
      </div>

      {/* Список файлов */}
      <div className="p-4 sm:p-5 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
        {category.files.length > 0 ? (
          category.files.map((file: any) => (
            <div
              key={file.id}
              className="group flex items-center justify-between p-3 bg-gray-50 hover:bg-orange-50 rounded-xl transition-all duration-200 cursor-pointer"
              onClick={() => handleDownload(file.public_url, file.name)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 bg-white rounded-lg group-hover:bg-orange-100 transition-colors">
                  {getFileIcon(file.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate group-hover:text-[#DC7C67] transition-colors">
                    {file.name}
                  </p>
                  {file.size > 0 && (
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  )}
                </div>
              </div>

              <button 
                className="p-2 hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                aria-label="download"
                title={t('Скачать файл')}
              >
                <Download className="w-4 h-4 text-[#DC7C67]" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
              <FilePlus className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">{t('В этой категории пока нет файлов')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('Файлы появятся после загрузки')}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="space-y-6 sm:space-y-8 p-2 md:p-6">
        <MoreHeaderAD title={t('Документы Tannur')} />

        {/* Ошибка */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Info className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-red-800 text-sm font-medium">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="p-1 hover:bg-red-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}


        {/* Сетка категорий */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {categories.map((category) => (
              <FileCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <div className="inline-flex p-6 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full mb-6">
              <FolderOpen className="w-12 h-12 text-[#DC7C67]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {t('Документы пока не загружены')}
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              {t('Обратитесь к администратору для получения необходимых документов. Они появятся здесь после загрузки.')}
            </p>
          </div>
        )}
      </div>


      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #DC7C67;
          border-radius: 10px;
          opacity: 0.6;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #C66B5A;
        }
      `}</style>
    </div>
  );
}