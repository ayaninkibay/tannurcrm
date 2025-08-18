'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'

// 1. Определяем тип для профиля пользователя на основе вашей схемы Supabase.
// Это обеспечивает строгую типизацию и автодополнение.
type UserProfile = Database['public']['Tables']['users']['Row']

// 2. Создаем интерфейс для контекста, который будет содержать профиль, состояние загрузки и функцию logout.
interface UserContextValue {
  profile: UserProfile | null
  loading: boolean
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

// 3. Создаем сам контекст с начальными значениями.
const UserContext = createContext<UserContextValue>({
  profile: null,
  loading: true,
  logout: async () => {},
  refreshProfile: async () => {},
})

// 4. Компонент-провайдер, который будет загружать данные пользователя и предоставлять их всем дочерним компонентам.
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Функция для загрузки/обновления профиля пользователя
  const loadUser = useCallback(async () => {
    try {
      // Получаем текущего пользователя из Supabase
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setProfile(null)
        setLoading(false)
        return
      }

      // Если пользователь найден, получаем его профиль из таблицы 'users'
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!error && data) {
        setProfile(data)
      } else {
        setProfile(null)
      }
    } catch (error) {
      console.error('UserProvider: Ошибка при загрузке профиля:', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Функция для выхода из системы
  const logout = useCallback(async () => {
    try {
      setLoading(true)
      
      // Выполняем выход через Supabase Auth
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }
      
      // Очищаем профиль из состояния
      setProfile(null)
      
      // Перенаправляем на страницу входа
      router.push('/signin')
      
    } catch (error) {
      console.error('UserProvider: Ошибка при выходе из системы:', error)
      // Даже если произошла ошибка, пытаемся очистить локальное состояние
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [router])

  // Функция для обновления профиля (может быть полезна после обновления данных)
  const refreshProfile = useCallback(async () => {
    await loadUser()
  }, [loadUser])

  // Загружаем пользователя при монтировании компонента
  useEffect(() => {
    loadUser()
  }, [loadUser])

  // Подписываемся на изменения состояния аутентификации
  useEffect(() => {
    // Слушаем изменения состояния авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setProfile(null)
        } else if (event === 'SIGNED_IN' && session) {
          // При входе перезагружаем профиль
          await loadUser()
        }
      }
    )

    // Отписываемся при размонтировании
    return () => {
      subscription.unsubscribe()
    }
  }, [loadUser])

  return (
    <UserContext.Provider value={{ profile, loading, logout, refreshProfile }}>
      {children}
    </UserContext.Provider>
  )
}

// 5. Хук для использования контекста в компонентах.
export const useUser = () => useContext(UserContext)