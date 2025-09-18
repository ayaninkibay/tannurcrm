'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { useTranslate } from '@/hooks/useTranslate';
import { useDocumentModule } from '@/lib/documents/useDocumentModule';
import { 
  Edit2, 
  Check, 
  X, 
  Upload,
  Trash2,
  Download,
  FileText,
  FileVideo,
  FileImage,
  File,
  Folder
} from 'lucide-react';

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
    updateCategoryName,
    clearError
  } = useDocumentModule();

  const [dragOver, setDragOver] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const fileInputRefs = React.useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

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
      return <FileText className="w-4 h-4 text-[#DC7C67]" />;
    }
    if (['mp4', 'avi', 'mov', 'mkv'].includes(extension || '')) {
      return <FileVideo className="w-4 h-4 text-[#DC7C67]" />;
    }
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension || '')) {
      return <FileImage className="w-4 h-4 text-[#DC7C67]" />;
    }
    return <File className="w-4 h-4 text-[#DC7C67]" />;
  };

  const FileUploadArea = ({ categoryId }: { categoryId: string }) => (
    <div
      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
        dragOver === categoryId
          ? 'border-[#DC7C67] bg-orange-50'
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
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#DC7C67] border-t-transparent"></div>
          ) : (
            <Upload className="w-6 h-6 text-[#DC7C67]" />
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

  if (loading) {
    return (
      <div className="min-h-screen p-2 md:p-6">
        <MoreHeaderAD title={t('Управление документами')} />
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-[#DC7C67] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 md:p-6">
      <div className="mx-auto">
        <MoreHeaderAD title={t('Управление документами')} />

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
            <span className="text-red-700 text-sm">{error}</span>
            <button onClick={clearError} className="text-red-500 hover:text-red-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Заголовок категории */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  {editingCategory === category.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && saveEdit(category.id)}
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC7C67] focus:border-transparent"
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
                        <Folder className="w-5 h-5 text-[#DC7C67]" />
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

              {/* Список файлов */}
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