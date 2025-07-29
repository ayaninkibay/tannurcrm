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
        setAll(list) {
          console.log('getSupabaseServer.cookies.setAll → writing:', list)
          list.forEach((c) => cookieStore.set(c))
        },
      },
    }
  )

  return supabase
}
