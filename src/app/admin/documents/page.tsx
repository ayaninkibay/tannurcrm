'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { useTranslate } from '@/hooks/useTranslate';
import { useDocumentModule } from '@/lib/documents/useDocumentModule';

export default function AdminDocumentsPage() {
  const { t } = useTranslate();
  
  const {
    categories,
    loading,
    uploading,
    error,
    loadDocuments,
    uploadDocument,
    deleteDocument,
    downloadDocument,
    clearError
  } = useDocumentModule();

  const [dragOver, setDragOver] = React.useState<string | null>(null);
  const fileInputRefs = React.useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleFileUpload = async (categoryId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await uploadDocument({
        category_id: categoryId,
        name: file.name,
        file: file
      });
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

  const handleDeleteFile = async (categoryId: string, documentId: string) => {
    if (confirm(t('Вы уверены, что хотите удалить этот документ?'))) {
      await deleteDocument(documentId);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    return `${(bytes / (1024 * 1024)).toFixed(1)} ${t('MB')}`;
  };

  const FileUploadArea = ({ categoryId }: { categoryId: string }) => (
    <div
      className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer ${
        dragOver === categoryId
          ? 'border-[#DC7C67] bg-orange-50'
          : 'border-gray-300 hover:border-gray-400'
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

      <div className="flex flex-col items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
          {uploading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#DC7C67] border-t-transparent"></div>
          ) : (
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          )}
        </div>
        <span className="text-xs text-gray-500">
          {uploading ? t('Загрузка...') : t('Перетащите файлы или нажмите')}
        </span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-8 p-2 md:p-6">
        <MoreHeaderAD title={t('Документы Tannur')} />
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#DC7C67] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-8 p-2 md:p-6 relative">
      <div className="flex-1 flex flex-col gap-4 sm:gap-6">
        <MoreHeaderAD title={t('Документы Tannur')} />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
            <span className="text-red-700">{error}</span>
            <button onClick={clearError} className="text-red-500 hover:text-red-700">×</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-2xl p-4 sm:p-6">
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
                {category.documents.map((document) => (
                  <div key={document.id} className="bg-[#F2F2F2] flex items-center justify-between px-3 sm:px-4 py-2 rounded-xl group hover:bg-gray-200 transition-colors">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Image src="/icons/Icon file gray.png" alt="file" width={16} height={16} className="flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs sm:text-sm text-gray-800 truncate block">{document.name}</span>
                        {document.file_size && (
                          <span className="text-xs text-gray-500">{formatFileSize(document.file_size)}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-2">
                      <button
                        onClick={() => handleDeleteFile(category.id, document.id)}
                        className="p-1 hover:bg-red-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => downloadDocument(document.file_url, document.file_name)}
                        className="p-1 hover:bg-gray-300 rounded transition-colors"
                      >
                        <Image src="/icons/Icon download.png" alt="download" width={14} height={14} />
                      </button>
                    </div>
                  </div>
                ))}

                <FileUploadArea categoryId={category.id} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}