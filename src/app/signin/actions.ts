// app/signin/actions.ts
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getSupabaseServer } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

export async function loginUser(email: string, password: string) {
  console.log('loginUser → called with:', { email })

  // tmp: логируем куки ДО попытки логина
  const before = await cookies().getAll()
  console.log('loginUser → cookies before:', before)

  const supabase = await getSupabaseServer()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  console.log('loginUser → signInWithPassword result:', { data, error })
  if (error) throw new Error(error.message)

  // и сразу логируем куки ПОСЛЕ (они должны измениться)
  const after = await cookies().getAll()
  console.log('loginUser → cookies after:', after)

  revalidatePath('/dealer/shop')
  console.log('loginUser → redirecting to /dealer/shop')
  redirect('/dealer/shop')
}
