'use client';

import { useState, useCallback } from 'react';
import { DocumentService, CategoryWithDocuments, UploadDocumentData } from './DocumentService';

export interface UseDocumentModuleReturn {
  // Состояние
  categories: CategoryWithDocuments[];
  loading: boolean;
  uploading: boolean;
  error: string | null;
  
  // Методы
  loadDocuments: () => Promise<void>;
  uploadDocument: (data: UploadDocumentData) => Promise<{ success: boolean; error?: string }>;
  deleteDocument: (documentId: string) => Promise<{ success: boolean; error?: string }>;
  downloadDocument: (fileUrl: string, fileName: string) => Promise<void>;
  clearError: () => void;
}

export const useDocumentModule = (): UseDocumentModuleReturn => {
  const [categories, setCategories] = useState<CategoryWithDocuments[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const documentService = new DocumentService();

  // Загрузка документов
  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await documentService.getCategoriesWithDocuments();
      
      if (result.success && result.data) {
        setCategories(result.data);
      } else {
        setError(result.error || 'Ошибка загрузки документов');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузка документа
  const uploadDocument = useCallback(async (data: UploadDocumentData): Promise<{ success: boolean; error?: string }> => {
    try {
      setUploading(true);
      setError(null);
      
      const result = await documentService.createDocument(data);
      
      if (result.success && result.data) {
        // Обновляем локальное состояние
        setCategories(prev => prev.map(category => 
          category.id === data.category_id
            ? {
                ...category,
                documents: [result.data!, ...category.documents]
              }
            : category
        ));
        return { success: true };
      } else {
        const errorMessage = result.error || 'Ошибка загрузки документа';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setUploading(false);
    }
  }, []);

  // Удаление документа
  const deleteDocument = useCallback(async (documentId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      
      const result = await documentService.deleteDocument(documentId);
      
      if (result.success) {
        // Обновляем локальное состояние
        setCategories(prev => prev.map(category => ({
          ...category,
          documents: category.documents.filter(doc => doc.id !== documentId)
        })));
        return { success: true };
      } else {
        const errorMessage = result.error || 'Ошибка удаления документа';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Скачивание документа
  const downloadDocument = useCallback(async (fileUrl: string, fileName: string) => {
    try {
      setError(null);
      
      const result = await documentService.getDownloadUrl(fileUrl);
      
      if (result.success && result.url) {
        // Создаем ссылку для скачивания
        const link = document.createElement('a');
        link.href = result.url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setError(result.error || 'Ошибка скачивания файла');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    }
  }, []);

  // Очистка ошибки
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    categories,
    loading,
    uploading,
    error,
    loadDocuments,
    uploadDocument,
    deleteDocument,
    downloadDocument,
    clearError
  };
};