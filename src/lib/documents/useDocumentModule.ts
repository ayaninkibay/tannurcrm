'use client';

import { useState, useCallback } from 'react';
import { DocumentService, CategoryWithFiles } from './DocumentService';

export interface UseDocumentModuleReturn {
  // Состояние
  categories: CategoryWithFiles[];
  loading: boolean;
  uploading: boolean;
  error: string | null;
  
  // Методы
  loadDocuments: () => Promise<void>;
  uploadDocument: (categoryId: string, file: File) => Promise<{ success: boolean; error?: string }>;
  deleteDocument: (categoryId: string, fileName: string) => Promise<{ success: boolean; error?: string }>;
  downloadDocument: (fileUrl: string, fileName: string) => Promise<void>;
  updateCategoryName: (categoryId: string, newName: string) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

export const useDocumentModule = (): UseDocumentModuleReturn => {
  const [categories, setCategories] = useState<CategoryWithFiles[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const documentService = new DocumentService();

  // Загрузка документов
  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await documentService.getCategoriesWithFiles();
      
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

  // Обновление названия категории
  const updateCategoryName = useCallback(async (categoryId: string, newName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      
      const result = await documentService.updateCategoryName(categoryId, newName);
      
      if (result.success) {
        // Обновляем локальное состояние
        setCategories(prev => prev.map(category => 
          category.id === categoryId
            ? { ...category, name: newName }
            : category
        ));
        return { success: true };
      } else {
        const errorMessage = result.error || 'Ошибка обновления категории';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Загрузка файла
  const uploadDocument = useCallback(async (categoryId: string, file: File): Promise<{ success: boolean; error?: string }> => {
    try {
      setUploading(true);
      setError(null);
      
      const result = await documentService.uploadFile(categoryId, file);
      
      if (result.success) {
        // Перезагружаем список файлов
        await loadDocuments();
        return { success: true };
      } else {
        const errorMessage = result.error || 'Ошибка загрузки файла';
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
  }, [loadDocuments]);

  // Удаление файла
  const deleteDocument = useCallback(async (categoryId: string, fileName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      
      const result = await documentService.deleteFile(categoryId, fileName);
      
      if (result.success) {
        // Перезагружаем список файлов
        await loadDocuments();
        return { success: true };
      } else {
        const errorMessage = result.error || 'Ошибка удаления файла';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [loadDocuments]);

  // Скачивание файла
  const downloadDocument = useCallback(async (fileUrl: string, fileName: string) => {
    try {
      setError(null);
      
      const result = await documentService.downloadFile(fileUrl);
      
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
    updateCategoryName,
    clearError
  };
};