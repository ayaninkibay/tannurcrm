// src/lib/supabase/server.ts
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export async function getSupabaseServer() {
  const cookieStore = await cookies()
  
  // Логируем все куки из Next.js
  console.log('getSupabaseServer → cookieStore.getAll():', cookieStore.getAll())

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const arr = cookieStore.getAll().map(({ name, value }) => ({ name, value }))
          console.log('getSupabaseServer.cookies.getAll → returning:', arr)
          return arr
        },
        setAll(cookiesToSet) {
          console.log('getSupabaseServer.cookies.setAll → writing:', cookiesToSet)
          cookiesToSet.forEach(({ name, value, options }) => {
            // Устанавливаем куки с правильными настройками для долгосрочного хранения
            cookieStore.set(name, value, {
              ...options,
              // Разрешаем доступ из JavaScript для синхронизации с клиентом
              httpOnly: false,
              // HTTPS только в продакшене
              secure: process.env.NODE_ENV === 'production',
              // Защита от CSRF атак
              sameSite: 'lax',
              // Увеличиваем время жизни куки до 7 дней
              maxAge: options?.maxAge || 60 * 60 * 24 * 7,
              // Указываем путь для доступности на всем сайте
              path: '/'
            })
          })
        },
      },
    }
  )

  return supabase
}

// Утилитарная функция для получения пользователя на сервере
export async function getServerUser() {
  const supabase = await getSupabaseServer()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('getServerUser error:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('getServerUser catch error:', error)
    return null
  }
}

// Утилитарная функция для получения сессии на сервере
export async function getServerSession() {
  const supabase = await getSupabaseServer()
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('getServerSession error:', error)
      return null
    }
    
    return session
  } catch (error) {
    console.error('getServerSession catch error:', error)
    return null
  }
}