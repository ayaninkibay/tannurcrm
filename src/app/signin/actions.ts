// app/signin/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

/**
 * Server Action для входа.
 * Использует наш SSR-клиент, который автоматически ставит Set-Cookie.
 */
export async function loginUser(email: string, password: string) {
  // 1) Инициализируем SSR-клиент Supabase
  const supabase = await getSupabaseServer()

  // 2) Выполняем вход по email/password — в ответ придут Set-Cookie
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    // При любых ошибках от Auth бросаем, их можно отобразить клиенту
    throw new Error(error.message)
  }

  // 3) Сбрасываем кеш защищённого маршрута и редиректим пользователя
  revalidatePath('/dealer/shop')
  redirect('/dealer/shop')
}
