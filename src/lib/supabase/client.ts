// src/lib/supabase/client.ts
'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

// Упрощенная конфигурация без кастомных cookies
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  }
)