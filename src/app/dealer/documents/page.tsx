'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import Footer from '@/components/Footer';
import { useTranslate } from '@/hooks/useTranslate';
import { useDocumentModule } from '@/lib/documents/useDocumentModule';

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

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    return `${(bytes / (1024 * 1024)).toFixed(1)} ${t('MB')}`;
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    await downloadDocument(fileUrl, fileName);
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-8 p-2 md:p-6">
        <MoreHeaderAD title={t('Документы Tannur')} />
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#DC7C67] border-t-transparent"></div>
        </div>
        <Footer />
      </div>
    );
  }

  const fileBlock = (category: any) => (
    <div className="bg-white rounded-2xl p-4 sm:p-6 flex-1 h-full w-full">
      <h2 className="text-sm md:text-lg text-gray-800 mb-4 flex items-center gap-2">
        {category.icon_src && (
          <Image src={category.icon_src} alt="icon" width={18} height={18} />
        )}
        {t(category.name)}
        <span className="text-xs text-gray-500 ml-auto">
          ({category.documents.length} {t('файлов')})
        </span>
      </h2>

      <div className="flex flex-col gap-3">
        {category.documents.length > 0 ? (
          category.documents.map((document: any) => (
            <div
              key={document.id}
              className="bg-[#F2F2F2] flex items-center justify-between px-3 sm:px-4 py-2 rounded-xl group hover:bg-gray-200 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Image
                  src="/icons/Icon file gray.png"
                  alt="file"
                  width={16}
                  height={16}
                  className="object-contain flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm text-gray-800 truncate block">
                    {document.name}
                  </span>
                  {document.file_size && (
                    <span className="text-xs text-gray-500">
                      {formatFileSize(document.file_size)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-2">
                <button 
                  onClick={() => handleDownload(document.file_url, document.file_name)}
                  className="p-1 hover:bg-gray-300 rounded transition-colors" 
                  aria-label="download"
                  title={t('Скачать файл')}
                >
                  <Image
                    src="/icons/Icon download.png"
                    alt="download"
                    width={14}
                    height={14}
                  />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Image
              src="/icons/Icon file gray.png"
              alt="no files"
              width={32}
              height={32}
              className="mx-auto mb-2 opacity-50"
            />
            <p className="text-sm">{t('В этой категории пока нет файлов')}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-8 p-2 md:p-6 relative">
      <div className="flex-1 flex flex-col gap-4 sm:gap-6">
        <MoreHeaderAD title={t('Документы Tannur')} />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-blue-700 text-sm">
              {t('Здесь вы можете просматривать и скачивать документы, загруженные администратором')}
            </span>
          </div>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {categories.map((category) => (
              <div key={category.id}>
                {fileBlock(category)}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center">
            <Image
              src="/icons/Icon file gray.png"
              alt="no documents"
              width={48}
              height={48}
              className="mx-auto mb-4 opacity-50"
            />
            <p className="text-gray-500 mb-2">{t('Документы пока не загружены')}</p>
            <p className="text-sm text-gray-400">{t('Обратитесь к администратору для получения документов')}</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}