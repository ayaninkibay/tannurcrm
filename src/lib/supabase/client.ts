'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

// Создаем типизированный клиент с правильными настройками
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      // Включаем автоматическое обновление токена
      autoRefreshToken: true,
      // Сохраняем сессию в localStorage
      persistSession: true,
      // Обнаруживаем сессию в URL (для email подтверждений и т.д.)
      detectSessionInUrl: true,
      // Используем PKCE для безопасности
      flowType: 'pkce',
      // Настройки хранилища
      storage: {
        getItem: (key: string) => {
          if (typeof window === 'undefined') return null
          return window.localStorage.getItem(key)
        },
        setItem: (key: string, value: string) => {
          if (typeof window === 'undefined') return
          window.localStorage.setItem(key, value)
        },
        removeItem: (key: string) => {
          if (typeof window === 'undefined') return
          window.localStorage.removeItem(key)
        }
      }
    },
    // Глобальные настройки
    global: {
      headers: {
        'x-client-info': 'tannur-web-client'
      }
    }
  }
)

// Функция для проверки валидности сессии
export async function validateSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Session validation error:', error)
      return false
    }
    
    return !!session?.user
  } catch (error) {
    console.error('Session validation error:', error)
    return false
  }
}

// Функция для получения пользователя
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Get user error:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('Get user error:', error)
    return null
  }
}

// Экспортируем типизированный тип клиента
export type TypedSupabaseClient = typeof supabase