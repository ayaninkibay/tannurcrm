// src/lib/user/UserModule.ts

import { useEffect, useState, useCallback } from 'react';
// Импортируем наш "Склад" (UserService), который умеет работать с БД
// Предполагаем, что сервис находится в 'src/lib/services/UserService'
import { userService } from '@/lib/user/UserService';
// Импортируем типы из "Офиса" для UserRow и UserUpdate
import { Database } from '@/types/supabase';
// Импортируем useRouter для редиректа после выхода
import { useRouter } from 'next/navigation';

// Типы для данных, которые будет возвращать наш хук
type UserProfile = Database['public']['Tables']['users']['Row'];
type UserUpdateData = Database['public']['Tables']['users']['Update'];

// Типы для возвращаемых значений хука
interface UseUserModuleReturn {
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  // Функции для взаимодействия с данными
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (userId: string, updates: UserUpdateData) => Promise<void>;
  // Теперь функция uploadUserAvatar возвращает Promise<void>, так как она сама обновляет профиль
  uploadUserAvatar: (userId: string, file: File) => Promise<void>;
  // Новая функция для выхода из профиля
  logout: () => Promise<void>;
}

export const useUserModule = (): UseUserModuleReturn => {
  // 1. Состояние данных для "Витрины" (UI)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // По умолчанию false
  const [error, setError] = useState<string | null>(null);
  
  // Добавляем роутер для навигации после выхода
  const router = useRouter();

  // 2. Функция для загрузки профиля пользователя
  const fetchProfile = useCallback(async (userId: string) => {
    setIsLoading(true); // Указываем, что началась загрузка
    setError(null);    // Сбрасываем предыдущие ошибки
    try {
      // Здесь предполагается, что userService.fetchUserProfile существует
      // и получает данные пользователя из БД
      const data = await userService.fetchUserProfile(userId);
      setUserProfile(data); // Обновляем состояние профиля
    } catch (err: any) {
      console.error("useUserModule: Ошибка при загрузке профиля:", err.message);
      setError(err.message || "Не удалось загрузить профиль."); // Записываем ошибку
    } finally {
      setIsLoading(false); // Загрузка завершена (успешно или с ошибкой)
    }
  }, []);

  // 3. Функция для обновления профиля пользователя
  const updateProfile = useCallback(async (userId: string, updates: UserUpdateData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Обращаемся к "Складу" (UserService) для обновления данных
      const updatedData = await userService.updateProfile(userId, updates);
      if (updatedData) {
        setUserProfile(updatedData); // Обновляем состояние профиля после успешного обновления
      }
    } catch (err: any) {
      console.error("useUserModule: Ошибка при обновлении профиля:", err.message);
      setError(err.message || "Не удалось обновить профиль.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 4. Функция для загрузки аватара
  const uploadUserAvatar = useCallback(async (userId: string, file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Загружаем файл аватара через сервис
      const avatarUrl = await userService.uploadAvatar(userId, file);
      
      if (!avatarUrl) {
        throw new Error("Не удалось загрузить файл аватара.");
      }

      // 2. Обновляем URL аватара в профиле пользователя в базе данных
      const updatedProfile = await userService.updateProfile(userId, { avatar_url: avatarUrl });

      if (updatedProfile) {
        // 3. Если обновление прошло успешно, обновляем локальное состояние хука
        setUserProfile(updatedProfile);
      } else {
        throw new Error("Не удалось обновить профиль пользователя после загрузки аватара.");
      }
    } catch (err: any) {
      console.error("useUserModule: Ошибка при загрузке аватара:", err.message);
      setError(err.message || "Не удалось загрузить аватар.");
    } finally {
      setIsLoading(false);
    }
  }, []); // Зависимости пусты, так как мы используем userService, который не меняется

  // 5. Функция для выхода из профиля
  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Вызываем функцию logout из UserService
      await userService.logout();
      
      // Очищаем локальное состояние профиля
      setUserProfile(null);
      
      // Опционально: перенаправляем на страницу входа или главную
      // Вы можете изменить путь в зависимости от вашей структуры приложения
      router.push('/login');
      
    } catch (err: any) {
      console.error("useUserModule: Ошибка при выходе из системы:", err.message);
      setError(err.message || "Не удалось выйти из системы.");
      // Не пробрасываем ошибку дальше, чтобы пользователь мог попробовать еще раз
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // 6. Возвращаем состояние и функции для использования в компонентах "Витрины"
  return {
    userProfile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    uploadUserAvatar,
    logout, // Добавляем функцию logout в возвращаемый объект
  };
};