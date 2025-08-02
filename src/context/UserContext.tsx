'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type UserProfile = {
  first_name: string
  last_name: string
  phone: string
  region: string
  avatar_url: string
  referral_code: string
  role: string
  is_confirmed: boolean
}

interface UserContextValue {
  profile: UserProfile | null
  loading: boolean
}

const UserContext = createContext<UserContextValue>({
  profile: null,
  loading: true,
})

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) return setLoading(false)

      const { data, error } = await supabase
        .from('users')
        .select('first_name, last_name, phone, region, avatar_url, referral_code, is_confirmed, role')
        .eq('id', user.id)
        .single()

      if (!error && data) setProfile(data)
      setLoading(false)
    }

    loadUser()
  }, [])

  return (
    <UserContext.Provider value={{ profile, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
