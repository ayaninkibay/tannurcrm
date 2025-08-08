'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'

// 1. Определяем тип для профиля пользователя на основе вашей схемы Supabase.
// Это обеспечивает строгую типизацию и автодополнение.
type UserProfile = Database['public']['Tables']['users']['Row']

// 2. Создаем интерфейс для контекста, который будет содержать профиль и состояние загрузки.
interface UserContextValue {
  profile: UserProfile | null
  loading: boolean
}

// 3. Создаем сам контекст с начальными значениями.
const UserContext = createContext<UserContextValue>({
  profile: null,
  loading: true,
})

// 4. Компонент-провайдер, который будет загружать данные пользователя и предоставлять их всем дочерним компонентам.
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      // Получаем текущего пользователя из Supabase
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setLoading(false)
        return
      }

      // Если пользователь найден, получаем его профиль из таблицы 'users'
      const { data, error } = await supabase
        .from('users')
        .select('first_name, last_name, phone, region, avatar_url, referral_code, is_confirmed, role')
        .eq('id', user.id)
        .single()

      if (!error && data) {
        setProfile(data)
      }
      setLoading(false)
    }

    loadUser()
  }, []) // Зависимости пусты, поэтому эффект запускается только один раз при монтировании

  return (
    <UserContext.Provider value={{ profile, loading }}>
      {children}
    </UserContext.Provider>
  )
}

// 5. Хук для использования контекста в компонентах.
export const useUser = () => useContext(UserContext)
