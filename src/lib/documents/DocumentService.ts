import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';

type DocumentCategoryRow = Database['public']['Tables']['document_categories']['Row'];
type DocumentRow = Database['public']['Tables']['documents']['Row'];
type DocumentInsert = Database['public']['Tables']['documents']['Insert'];

export interface DocumentWithCategory extends DocumentRow {
  category: DocumentCategoryRow;
}

export interface CategoryWithDocuments extends DocumentCategoryRow {
  documents: DocumentRow[];
}

export interface UploadDocumentData {
  category_id: string;
  name: string;
  file: File;
}

export class DocumentService {
  // Получение всех категорий с документами
  async getCategoriesWithDocuments(): Promise<{ success: boolean; data?: CategoryWithDocuments[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('document_categories')
        .select(`
          *,
          documents:documents(*)
        `)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        return { success: false, error: error.message };
      }

      // Фильтруем активные документы и сортируем по дате создания
      const categoriesWithDocuments = (data || []).map(category => ({
        ...category,
        documents: (category.documents || [])
          .filter((doc: any) => doc.is_active)
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      }));

      return { success: true, data: categoriesWithDocuments };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка' 
      };
    }
  }

  // Загрузка файла в Supabase Storage
  async uploadFile(file: File, categoryId: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Генерируем уникальное имя файла
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `documents/${categoryId}/${fileName}`;

      // Загружаем файл в Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        return { success: false, error: uploadError.message };
      }

      // Получаем публичный URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      return { success: true, url: urlData.publicUrl };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка загрузки файла' 
      };
    }
  }

  // Создание документа
  async createDocument(data: UploadDocumentData): Promise<{ success: boolean; data?: DocumentRow; error?: string }> {
    try {
      // Сначала загружаем файл
      const uploadResult = await this.uploadFile(data.file, data.category_id);
      
      if (!uploadResult.success || !uploadResult.url) {
        return { success: false, error: uploadResult.error || 'Ошибка загрузки файла' };
      }

      // Получаем текущего пользователя
      const { data: { user } } = await supabase.auth.getUser();

      // Создаем запись документа
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert({
          category_id: data.category_id,
          name: data.name,
          file_name: data.file.name,
          file_size: data.file.size,
          file_type: data.file.type,
          file_url: uploadResult.url,
          uploaded_by: user?.id || null,
          is_active: true
        })
        .select()
        .single();

      if (documentError) {
        // Если создание записи не удалось, удаляем загруженный файл
        const filePath = uploadResult.url.split('/').pop();
        if (filePath) {
          await supabase.storage
            .from('documents')
            .remove([`documents/${data.category_id}/${filePath}`]);
        }
        return { success: false, error: documentError.message };
      }

      return { success: true, data: documentData };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка' 
      };
    }
  }

  // Удаление документа
  async deleteDocument(documentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Сначала получаем информацию о документе
      const { data: document, error: getError } = await supabase
        .from('documents')
        .select('file_url, category_id')
        .eq('id', documentId)
        .single();

      if (getError || !document) {
        return { success: false, error: getError?.message || 'Документ не найден' };
      }

      // Удаляем файл из Storage
      const fileName = document.file_url.split('/').pop();
      if (fileName) {
        const filePath = `documents/${document.category_id}/${fileName}`;
        await supabase.storage
          .from('documents')
          .remove([filePath]);
      }

      // Удаляем запись из базы данных
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) {
        return { success: false, error: deleteError.message };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка' 
      };
    }
  }

  // Получение URL для скачивания файла
  async getDownloadUrl(fileUrl: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Извлекаем путь к файлу из полного URL
      const urlParts = fileUrl.split('/');
      const fileName = urlParts.pop();
      const categoryPath = urlParts.slice(-2, -1)[0];
      
      if (!fileName || !categoryPath) {
        return { success: false, error: 'Неверный URL файла' };
      }

      const filePath = `documents/${categoryPath}/${fileName}`;

      // Создаем подписанный URL для скачивания (действителен 1 час)
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 3600);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, url: data.signedUrl };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка получения ссылки для скачивания' 
      };
    }
  }
}