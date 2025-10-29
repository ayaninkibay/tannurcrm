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

  const updateProfileState = useCallback((newProfile: UserProfile | null) => {
    if (!mountedRef.current) return
    
    globalProfileCache = newProfile
    setProfile(newProfile)
    
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
        
        return now - updateTime < 15 * 60 * 1000
      }
    } catch (error) {
      console.error('Error loading profile from localStorage:', error)
    }
    return false
  }, [])

  const loadUser = useCallback(async (forceRefresh = false, source = 'manual') => {
    if (loadingRef.current && !forceRefresh) return
    if (!mountedRef.current) return
    
    try {
      loadingRef.current = true

      if (!forceRefresh && globalProfileCache && !globalLoadingState) {
        return
      }

      if (!forceRefresh && !isInitialized) {
        const isFreshCache = loadFromStorage()
        updateLoadingState(false)
        isInitialized = true
        
        if (isFreshCache && globalProfileCache) {
          return
        }
        
        if (globalProfileCache) {
          updateLoadingState(false)
        }
      }

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
        updateProfileState(null)
        updateLoadingState(false)
        isInitialized = true
        return
      }

      const cachedUserId = localStorage.getItem(STORAGE_KEYS.USER_ID)
      if (cachedUserId && cachedUserId !== session.user.id) {
        globalProfileCache = null
        localStorage.removeItem(STORAGE_KEYS.PROFILE)
        localStorage.removeItem(STORAGE_KEYS.LAST_UPDATE)
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      if (!mountedRef.current) return
      
      if (!error && data) {
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

  const logout = useCallback(async () => {
    try {
      updateLoadingState(true)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }
      
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

  const refreshProfile = useCallback(async () => {
    await loadUser(true, 'refresh')
  }, [loadUser])

  useEffect(() => {
    mountedRef.current = true

    if (!isInitialized) {
      loadUser(false, 'mount')
    } else if (globalProfileCache && !profile) {
      setProfile(globalProfileCache)
      setLoading(false)
    }

    if (!authSubscription) {
      authSubscription = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mountedRef.current) return

          switch (event) {
            case 'SIGNED_OUT':
              updateProfileState(null)
              globalProfileCache = null
              isInitialized = false
              break
              
            case 'SIGNED_IN':
              if (session?.user) {
                if (!globalProfileCache || globalProfileCache.id !== session.user.id) {
                  await loadUser(true, 'signin')
                }
              }
              break
              
            case 'TOKEN_REFRESHED':
              break
              
            case 'INITIAL_SESSION':
              if (!isInitialized) {
                if (session?.user && !globalProfileCache) {
                  await loadUser(false, 'initial')
                } else if (!session?.user) {
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

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.PROFILE && mountedRef.current) {
        try {
          if (e.newValue) {
            const newProfile = JSON.parse(e.newValue)
            globalProfileCache = newProfile
            setProfile(newProfile)
            updateLoadingState(false)
          } else {
            globalProfileCache = null
            setProfile(null)
            updateLoadingState(false)
          }
        } catch (error) {
          console.error('Error parsing profile from storage event:', error)
        }
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && globalProfileCache) {
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