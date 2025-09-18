import { supabase } from '@/lib/supabase/client';

export interface DocumentCategory {
  id: string;
  name: string;
  icon_src: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface StorageFile {
  id: string;
  name: string;
  size: number;
  created_at: string;
  updated_at: string;
  category_id: string;
  public_url: string;
}

export interface CategoryWithFiles extends DocumentCategory {
  files: StorageFile[];
}

export class DocumentService {
  // Получение всех категорий с файлами из Storage
  async getCategoriesWithFiles(): Promise<{ success: boolean; data?: CategoryWithFiles[]; error?: string }> {
    try {
      // Получаем категории
      const { data: categories, error: categoriesError } = await supabase
        .from('document_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (categoriesError) {
        return { success: false, error: categoriesError.message };
      }

      // Для каждой категории получаем файлы из Storage
      const categoriesWithFiles: CategoryWithFiles[] = [];
      
      for (const category of categories || []) {
        // Получаем список файлов из Storage для данной категории
        const { data: files, error: filesError } = await supabase.storage
          .from('documents')
          .list(category.id, {
            limit: 100,
            offset: 0
          });

        if (filesError) {
          console.error(`Error loading files for category ${category.id}:`, filesError);
          categoriesWithFiles.push({ ...category, files: [] });
          continue;
        }

        // Преобразуем файлы в нужный формат
        const storageFiles: StorageFile[] = (files || [])
          .filter(file => file.name !== '.emptyFolderPlaceholder') // Исключаем служебные файлы
          .map(file => {
            const { data: urlData } = supabase.storage
              .from('documents')
              .getPublicUrl(`${category.id}/${file.name}`);

            // Извлекаем читаемое имя из имени файла
            // Формат: timestamp_random_originalname.ext
            let displayName = file.name;
            const parts = file.name.split('_');
            if (parts.length >= 3) {
              // Убираем timestamp и random часть, оставляем оригинальное имя
              displayName = parts.slice(2).join('_');
            }

            return {
              id: file.id || `${category.id}-${file.name}`,
              name: displayName,
              size: file.metadata?.size || 0,
              created_at: file.created_at || new Date().toISOString(),
              updated_at: file.updated_at || new Date().toISOString(),
              category_id: category.id,
              public_url: urlData.publicUrl
            };
          });

        categoriesWithFiles.push({
          ...category,
          files: storageFiles
        });
      }

      return { success: true, data: categoriesWithFiles };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка' 
      };
    }
  }

  // Обновление названия категории
  async updateCategoryName(categoryId: string, newName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('document_categories')
        .update({ 
          name: newName,
          updated_at: new Date().toISOString()
        })
        .eq('id', categoryId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка обновления категории' 
      };
    }
  }

  // Загрузка файла в Storage
  async uploadFile(categoryId: string, file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Очищаем имя файла от специальных символов, но сохраняем его читаемым
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9а-яА-Я.\-_ ]/g, '');
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      
      // Сохраняем оригинальное имя в новом имени файла
      const fileName = `${timestamp}_${randomString}_${cleanFileName}`;
      const filePath = `${categoryId}/${fileName}`;

      // Загружаем файл
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        return { success: false, error: error.message };
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

  // Удаление файла из Storage
  async deleteFile(categoryId: string, fileName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const filePath = `${categoryId}/${fileName}`;
      
      const { error } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка удаления файла' 
      };
    }
  }

  // Скачивание файла
  async downloadFile(publicUrl: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Извлекаем путь из публичного URL
      const urlParts = publicUrl.split('/storage/v1/object/public/documents/');
      if (urlParts.length !== 2) {
        return { success: false, error: 'Неверный URL файла' };
      }

      const filePath = decodeURIComponent(urlParts[1]);

      // Создаем подписанный URL для скачивания
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 3600); // URL действителен 1 час

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, url: data.signedUrl };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка получения ссылки' 
      };
    }
  }
}