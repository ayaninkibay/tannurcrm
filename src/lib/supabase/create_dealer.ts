import { supabase } from './client';

/**
 * Функция для создания нового дилера через Edge Function.
 * Использует уже существующий клиент Supabase.
 * @param {string} email - Электронная почта нового дилера.
 * @param {string} password - Пароль для нового дилера.
 * @returns {Promise<string|null>} Возвращает UUID нового пользователя или null в случае ошибки.
 */
export async function createNewDealer(email: string, password: string): Promise<string | null> {
  // Получаем текущую сессию пользователя
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('Ошибка при получении сессии:', sessionError.message);
    return null;
  }

  if (!session) {
    console.error('Пользователь не авторизован.');
    return null;
  }

  try {
    // ВАЖНО: Замените URL на URL вашей развернутой функции
    const response = await fetch('https://<ВАШ_ID_ПРОЕКТА>.supabase.co/functions/v1/create-dealer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Отправляем JWT текущего авторизованного пользователя
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Ошибка при создании дилера:', data.error || 'Неизвестная ошибка');
      return null;
    }

    console.log('Новый дилер успешно создан:', data.user_id);
    return data.user_id;

  } catch (error: any) {
    console.error('Непредвиденная ошибка:', error.message);
    return null;
  }
}
