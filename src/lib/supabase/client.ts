// src/lib/supabase/client.ts
'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

// Создаем типизированный клиент с улучшенными настройками
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: {
        // Используем localStorage для надежного хранения сессии
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
      },
      // Добавляем настройки для автоматического обновления токена
      refreshSession: {
        // Обновляем токен за 60 секунд до истечения
        autoRefreshInterval: 60
      }
    },
    // Добавляем глобальные настройки для автоматического повтора запросов
    global: {
      headers: {
        'x-client-info': 'supabase-js/web'
      }
    },
    // Настройки для realtime (если используется)
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
)

// Функция для проверки и обновления сессии
export async function refreshSession() {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession()
    if (error) {
      console.error('Error refreshing session:', error)
      return null
    }
    return session
  } catch (error) {
    console.error('Failed to refresh session:', error)
    return null
  }
}

// Функция для проверки валидности токена
export async function validateSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      return false
    }
    
    // Проверяем, не истек ли токен
    const expiresAt = session.expires_at
    if (expiresAt) {
      const now = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = expiresAt - now
      
      // Если токен истекает менее чем через 5 минут, обновляем его
      if (timeUntilExpiry < 300) {
        console.log('Token expiring soon, refreshing...')
        const newSession = await refreshSession()
        return !!newSession
      }
    }
    
    return true
  } catch (error) {
    console.error('Session validation error:', error)
    return false
  }
}

// Экспортируем типизированный тип клиента
export type TypedSupabaseClient = typeof supabase