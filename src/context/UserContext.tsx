//src/context/UserContext.tsx

'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'

type UserProfile = Database['public']['Tables']['users']['Row']

interface UserContextValue {
  profile: UserProfile | null
  loading: boolean
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const UserContext = createContext<UserContextValue>({
  profile: null,
  loading: true,
  logout: async () => {},
  refreshProfile: async () => {},
})

// Глобальные переменные для синхронизации между экземплярами
let globalProfileCache: UserProfile | null = null
let globalLoadingState = true
let isInitialized = false
let authSubscription: any = null

// Ключи для localStorage
const STORAGE_KEYS = {
  PROFILE: 'tannur_user_profile',
  LAST_UPDATE: 'tannur_profile_last_update',
  USER_ID: 'tannur_user_id'
}

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(globalProfileCache)
  const [loading, setLoading] = useState(globalLoadingState)
  const router = useRouter()
  const loadingRef = useRef(false)
  const mountedRef = useRef(true)

  // Синхронизация локального состояния с глобальным кэшем
  const updateProfileState = useCallback((newProfile: UserProfile | null) => {
    if (!mountedRef.current) return
    
    globalProfileCache = newProfile
    setProfile(newProfile)
    
    // Сохраняем в localStorage для синхронизации между вкладками
    try {
      if (newProfile) {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newProfile))
        localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, Date.now().toString())
        localStorage.setItem(STORAGE_KEYS.USER_ID, newProfile.id)
      } else {
        localStorage.removeItem(STORAGE_KEYS.PROFILE)
        localStorage.removeItem(STORAGE_KEYS.LAST_UPDATE)
        localStorage.removeItem(STORAGE_KEYS.USER_ID)
      }
    } catch (error) {
      console.error('Error saving profile to localStorage:', error)
    }
  }, [])

  const updateLoadingState = useCallback((newLoading: boolean) => {
    if (!mountedRef.current) return
    
    globalLoadingState = newLoading
    setLoading(newLoading)
  }, [])

  // Загрузка профиля из localStorage
  const loadFromStorage = useCallback(() => {
    try {
      const cachedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE)
      const lastUpdate = localStorage.getItem(STORAGE_KEYS.LAST_UPDATE)
      
      if (cachedProfile) {
        const profileData = JSON.parse(cachedProfile)
        const updateTime = lastUpdate ? parseInt(lastUpdate) : 0
        const now = Date.now()
        
        globalProfileCache = profileData
        setProfile(profileData)
        console.log('Profile loaded from cache:', profileData.email)
        
        // Возвращаем true если кэш свежий (15 минут)
        return now - updateTime < 15 * 60 * 1000
      }
    } catch (error) {
      console.error('Error loading profile from localStorage:', error)
    }
    return false
  }, [])

  // Основная функция загрузки профиля
  const loadUser = useCallback(async (forceRefresh = false, source = 'manual') => {
    if (loadingRef.current && !forceRefresh) return
    if (!mountedRef.current) return
    
    try {
      loadingRef.current = true
      console.log(`Loading user profile (source: ${source}, force: ${forceRefresh})`)

      // Если есть свежий кэш и не принудительное обновление
      if (!forceRefresh && globalProfileCache && !globalLoadingState) {
        console.log('Using cached profile')
        return
      }

      // Пробуем загрузить из localStorage при инициализации
      if (!forceRefresh && !isInitialized) {
        const isFreshCache = loadFromStorage()
        updateLoadingState(false)
        isInitialized = true
        
        if (isFreshCache && globalProfileCache) {
          console.log('Fresh cache found, skipping DB load')
          return
        }
        
        if (globalProfileCache) {
          console.log('Stale cache found, will refresh in background')
          updateLoadingState(false)
        }
      }

      // Получаем сессию - Supabase сам обновит токен если нужно
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('Session error:', sessionError)
        if (!globalProfileCache) {
          updateProfileState(null)
        }
        updateLoadingState(false)
        return
      }

      if (!session?.user) {
        console.log('No authenticated session found')
        updateProfileState(null)
        updateLoadingState(false)
        isInitialized = true
        return
      }

      console.log('Authenticated session found:', session.user.email)

      // Проверяем не изменился ли пользователь
      const cachedUserId = localStorage.getItem(STORAGE_KEYS.USER_ID)
      if (cachedUserId && cachedUserId !== session.user.id) {
        console.log('User changed, clearing cache')
        globalProfileCache = null
        localStorage.removeItem(STORAGE_KEYS.PROFILE)
        localStorage.removeItem(STORAGE_KEYS.LAST_UPDATE)
      }

      // Загружаем профиль из БД
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      if (!mountedRef.current) return
      
      if (!error && data) {
        console.log('Profile loaded successfully from DB:', data.email, data.role)
        updateProfileState(data)
      } else {
        console.error('Error loading profile from database:', error)
        if (!globalProfileCache) {
          updateProfileState(null)
        }
      }

      isInitialized = true
    } catch (error) {
      console.error('Error in loadUser:', error)
      if (!globalProfileCache) {
        updateProfileState(null)
      }
    } finally {
      updateLoadingState(false)
      loadingRef.current = false
    }
  }, [updateProfileState, updateLoadingState, loadFromStorage])

  // Функция выхода
  const logout = useCallback(async () => {
    try {
      updateLoadingState(true)
      console.log('Logging out...')
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }
      
      // Очищаем состояние
      updateProfileState(null)
      globalProfileCache = null
      isInitialized = false
      
      router.push('/signin')
      
    } catch (error) {
      console.error('Logout error:', error)
      updateProfileState(null)
      globalProfileCache = null
      isInitialized = false
    } finally {
      updateLoadingState(false)
    }
  }, [router, updateProfileState, updateLoadingState])

  // Функция обновления профиля
  const refreshProfile = useCallback(async () => {
    console.log('Refreshing profile...')
    await loadUser(true, 'refresh')
  }, [loadUser])

  // Инициализация и подписка на auth events
  useEffect(() => {
    mountedRef.current = true

    // Инициализируем только если еще не инициализировали
    if (!isInitialized) {
      loadUser(false, 'mount')
    } else if (globalProfileCache && !profile) {
      setProfile(globalProfileCache)
      setLoading(false)
    }

    // Создаем подписку на auth события только один раз
    if (!authSubscription) {
      authSubscription = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, !!session?.user)
          
          if (!mountedRef.current) return

          switch (event) {
            case 'SIGNED_OUT':
              console.log('User signed out')
              updateProfileState(null)
              globalProfileCache = null
              isInitialized = false
              break
              
            case 'SIGNED_IN':
              if (session?.user) {
                console.log('User signed in, loading profile...')
                if (!globalProfileCache || globalProfileCache.id !== session.user.id) {
                  await loadUser(true, 'signin')
                }
              }
              break
              
            case 'TOKEN_REFRESHED':
              console.log('Token refreshed successfully')
              // Не нужно ничего делать - сессия обновилась автоматически
              break
              
            case 'INITIAL_SESSION':
              console.log('Initial session event')
              if (!isInitialized) {
                if (session?.user && !globalProfileCache) {
                  console.log('Initial session with user, loading profile...')
                  await loadUser(false, 'initial')
                } else if (!session?.user) {
                  console.log('Initial session without user')
                  updateProfileState(null)
                  updateLoadingState(false)
                  isInitialized = true
                }
              }
              break
          }
        }
      )
    }

    return () => {
      mountedRef.current = false
    }
  }, [loadUser, updateProfileState, updateLoadingState, profile])

  // Синхронизация между вкладками через storage events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.PROFILE && mountedRef.current) {
        try {
          if (e.newValue) {
            const newProfile = JSON.parse(e.newValue)
            globalProfileCache = newProfile
            setProfile(newProfile)
            updateLoadingState(false)
            console.log('Profile synced from another tab:', newProfile.email)
          } else {
            globalProfileCache = null
            setProfile(null)
            updateLoadingState(false)
            console.log('Profile cleared from another tab')
          }
        } catch (error) {
          console.error('Error parsing profile from storage event:', error)
        }
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && globalProfileCache) {
        // Проверяем профиль когда вкладка становится активной
        // Supabase сам обновит токен если нужно
        console.log('Tab became visible, checking session...')
        loadUser(false, 'visibility')
      }
    }

    window.addEventListener('storage', handleStorageChange)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [updateLoadingState, loadUser])

  // Cleanup при размонтировании последнего экземпляра
  useEffect(() => {
    return () => {
      if (authSubscription) {
        authSubscription.data.subscription.unsubscribe()
        authSubscription = null
      }
    }
  }, [])

  return (
    <UserContext.Provider value={{ profile, loading, logout, refreshProfile }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)