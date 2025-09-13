import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS заголовки
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Получаем все данные из формы - ДОБАВЛЕНЫ НЕДОСТАЮЩИЕ ПОЛЯ!
    const { 
      email, 
      password, 
      first_name, 
      last_name, 
      phone, 
      iin,
      region,
      instagram,
      profession,
      parent_id 
    } = await req.json()

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    console.log('Creating dealer with data:', { 
      email, 
      first_name, 
      last_name, 
      phone, 
      iin: iin ? iin.slice(0, 3) + '***' + iin.slice(-2) : null,
      region,
      instagram,
      profession,
      parent_id 
    })

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Проверяем права вызывающего пользователя
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Проверяем роль
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile || !['admin', 'dealer'].includes(userProfile.role)) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), { 
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Creating user with Admin API...')

    // Создаем пользователя с metadata - ДОБАВЛЕНЫ ВСЕ ПОЛЯ!
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        role: 'dealer',
        first_name: first_name,
        last_name: last_name,
        phone: phone,
        iin: iin,
        region: region,
        instagram: instagram,
        profession: profession
      }
    })

    if (createError) {
      console.error('Error creating user:', createError)
      return new Response(JSON.stringify({ error: createError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    console.log('User created. Updating profile with full data...')

    // Обновляем запись с полными данными - ТЕПЕРЬ ПЕРЕМЕННЫЕ ОПРЕДЕЛЕНЫ!
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        role: 'dealer',
        first_name: first_name || null,
        last_name: last_name || null,
        phone: phone || null,
        iin: iin ? parseInt(iin) : null,
        region: region || null,
        instagram: instagram || null,
        profession: profession || null,
        avatar_url: null,  // Принудительно устанавливаем null
        status: 'inactive',
        parent_id: parent_id || null,
        is_confirmed: false
      })
      .eq('id', newUser.user!.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return new Response(JSON.stringify({ error: 'Failed to update user profile: ' + updateError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    console.log('Dealer created successfully:', newUser.user!.id)

    return new Response(JSON.stringify({ 
      user_id: newUser.user!.id,
      success: true,
      message: 'Dealer created successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (e) {
    console.error('Unexpected error:', e)
    return new Response(JSON.stringify({ error: 'Internal server error: ' + e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})