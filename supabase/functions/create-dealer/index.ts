import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Получаем service_role_key из переменных окружения
// Убедитесь, что вы добавили его в Supabase CLI:
// supabase secrets set --env-file .env.local
// где .env.local содержит SUPABASE_SERVICE_ROLE_KEY=ВАШ_SERVICE_ROLE_KEY
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase URL or Service Role Key in environment variables.')
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const { email, password } = await req.json()

  // 1. Создаем клиент Supabase с service_role_key для вызова функций с повышенными правами
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  // 2. Проверяем роль пользователя, который ВЫЗЫВАЕТ эту Edge Function (дилер или админ)
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response('Unauthorized: Missing Authorization header', { status: 401 })
  }
  const token = authHeader.replace('Bearer ', '')

  // Проверяем токен, чтобы получить роль вызывающего пользователя
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

  if (authError || !user) {
    console.error('Auth Error:', authError?.message || 'User not found')
    return new Response('Unauthorized: Invalid or expired token', { status: 401 })
  }

  // Получаем claims из JWT
  const userClaims = user.app_metadata.claims
  const callerRole = userClaims?.user_role // Ваша кастомная роль из JWT

  // 3. Проверяем, имеет ли вызывающий право создавать дилера
  if (callerRole !== 'admin' && callerRole !== 'dealer') {
    return new Response('Forbidden: Only admins or dealers can create new dealers', { status: 403 })
  }

  // 4. Вызываем PostgreSQL функцию для создания нового пользователя с ролью 'dealer'
  try {
    const { data, error } = await supabaseAdmin.rpc('create_new_app_user', {
      new_email: email,
      new_password: password,
      new_role: 'dealer' // <-- Здесь мы жестко задаем, что создается именно дилер
    })

    if (error) {
      console.error('Error calling create_new_app_user:', error.message)
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    return new Response(JSON.stringify({ user_id: data }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (e) {
    console.error('Unexpected error:', e.message)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})