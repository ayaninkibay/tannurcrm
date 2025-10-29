// src/lib/supabase/client.ts

'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

// Экспортируем ФУНКЦИЮ для создания клиента
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
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
      global: {
        headers: {
          'x-client-info': 'tannur-web-client'
        }
      }
    }
  )
}

// Создаем глобальный экземпляр для обратной совместимости
export const supabase = createClient()

// Функция для проверки валидности сессии
export async function validateSession() {
  try {
    const client = createClient()
    const { data: { session }, error } = await client.auth.getSession()
    
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
    const client = createClient()
    const { data: { user }, error } = await client.auth.getUser()
    
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
export type TypedSupabaseClient = ReturnType<typeof createClient>