// src/lib/user/UserService.ts

// Импорт клиента Supabase для клиентской стороны, так как этот сервис
// будет использоваться в хуках и компонентах.
import { supabase } from '@/lib/supabase/client';

// Импорт типов данных для обеспечения типобезопасности.
import { Database } from '@/types/supabase';

// Определяем удобные псевдонимы типов для операций с таблицей 'users'
type UserRow = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

/**
 * Сервис для взаимодействия с данными пользователя в Supabase.
 * Инкапсулирует всю логику работы с таблицей 'users' и хранилищем 'avatars'.
 */
class UserService {

  /**
   * Получает данные профиля пользователя из таблицы 'users' по ID.
   * @param {string} userId - ID пользователя, чей профиль нужно получить.
   * @returns {Promise<UserRow | null>} Объект профиля пользователя или null, если не найден.
   * @throws {Error} Если произошла ошибка при запросе к базе данных.
   */
  async fetchUserProfile(userId: string): Promise<UserRow | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn(`UserService: Профиль пользователя с ID ${userId} не найден.`);
        return null;
      }
      console.error('UserService: Ошибка при получении профиля пользователя:', error.message);
      throw new Error(`Не удалось загрузить профиль пользователя: ${error.message}`);
    }
    return data;
  }

  /**
   * Обновляет данные профиля пользователя в таблице 'users'.
   * @param {string} userId - ID пользователя, чей профиль нужно обновить.
   * @param {UserUpdate} updates - Объект с полями, которые нужно обновить.
   * @returns {Promise<UserRow | null>} Обновленный объект профиля пользователя или null.
   * @throws {Error} Если произошла ошибка при обновлении в базе данных.
   */
  async updateProfile(userId: string, updates: UserUpdate): Promise<UserRow | null> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('UserService: Ошибка при обновлении профиля пользователя:', error.message);
      throw new Error(`Не удалось обновить профиль пользователя: ${error.message}`);
    }
    return data;
  }

  /**
   * Загружает файл аватара в Supabase Storage.
   * @param {string} userId - ID пользователя, который используется в пути к файлу.
   * @param {File} file - Объект файла для загрузки.
   * @returns {Promise<string>} Публичный URL загруженного аватара.
   * @throws {Error} Если произошла ошибка при загрузке файла или получении URL.
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const filePath = `${userId}/${Date.now()}-${file.name}`; // Путь в бакете 'avatars'

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('UserService: Ошибка при загрузке аватара:', uploadError.message);
      throw new Error(`Не удалось загрузить аватар: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    if (!publicUrlData.publicUrl) {
      throw new Error('Не удалось получить публичный URL аватара.');
    }
    return publicUrlData.publicUrl;
  }

  /**
   * Выполняет выход пользователя из системы.
   * Завершает текущую сессию и удаляет токены аутентификации.
   * @returns {Promise<void>}
   * @throws {Error} Если произошла ошибка при выходе из системы.
   */
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('UserService: Ошибка при выходе из системы:', error.message);
      throw new Error(`Не удалось выйти из системы: ${error.message}`);
    }
    
    console.log('UserService: Пользователь успешно вышел из системы');
  }
}

// Экспортируем единственный экземпляр класса, чтобы его можно было
// импортировать в другие файлы (например, UserModule)
export const userService = new UserService();