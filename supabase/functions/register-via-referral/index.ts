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

// Функция генерации уникального referral_code
async function generateUniqueReferralCode(supabaseAdmin: any): Promise<string> {
  let attempts = 0
  const maxAttempts = 10
  
  while (attempts < maxAttempts) {
    // Генерируем код в формате KZ + 10 случайных цифр
    const randomNum = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')
    const code = `KZ${randomNum}`
    
    // Проверяем, существует ли такой код
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('referral_code', code)
      .maybeSingle()
    
    if (error) {
      console.error('Error checking referral code:', error)
      attempts++
      continue
    }
    
    // Если код не найден - он уникален
    if (!data) {
      return code
    }
    
    attempts++
  }
  
  throw new Error('Failed to generate unique referral code')
}

serve(async (req) => {
  // Обработка CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Получаем данные из запроса
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
      referral_code,
      parent_id
    } = await req.json()

    // Валидация обязательных полей
    if (!email || !password || !first_name || !last_name || !phone) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Email, password, first name, last name and phone are required' 
        }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Валидация referral_code и parent_id
    if (!referral_code || !parent_id) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Referral code and parent ID are required' 
        }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    console.log('Registering user via referral:', { 
      email, 
      first_name, 
      last_name, 
      phone,
      referral_code,
      parent_id: parent_id.slice(0, 8) + '...'
    })

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Проверяем, что parent существует и активен
    const { data: parentUser, error: parentError } = await supabaseAdmin
      .from('users')
      .select('id, first_name, last_name, referral_code, status, is_confirmed, role')
      .eq('id', parent_id)
      .eq('referral_code', referral_code)
      .single()

    if (parentError || !parentUser) {
      console.error('Parent validation error:', parentError)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid referral code or parent user not found' 
        }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Проверяем, что parent имеет право приглашать
    if (!['dealer', 'admin', 'celebrity'].includes(parentUser.role)) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Referrer does not have permission to invite users' 
        }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    // Для регистрации через реферальную ссылку НЕ требуем, чтобы parent был активен
    // Это позволит дилерам приглашать даже если они еще не оплатили подписку
    console.log('Parent user validated successfully')

    // Проверяем, что email еще не занят
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (existingUser) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Email already registered' 
        }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    console.log('Creating user with Admin API...')

    // Создаем пользователя через Admin API
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password: password,
      email_confirm: true, // Автоматически подтверждаем email
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
      return new Response(
        JSON.stringify({ 
          success: false,
          error: createError.message 
        }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    console.log('User created. Generating referral code...')

    // Генерируем уникальный referral_code
    let newReferralCode: string
    try {
      newReferralCode = await generateUniqueReferralCode(supabaseAdmin)
      console.log('Generated referral code:', newReferralCode)
    } catch (error) {
      console.error('Error generating referral code:', error)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Failed to generate referral code' 
        }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    console.log('Updating profile with full data...')

    // Обновляем профиль пользователя с полными данными
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        role: 'dealer',
        first_name: first_name,
        last_name: last_name,
        phone: phone,
        iin: iin ? parseInt(iin) : null,
        region: region || null,
        instagram: instagram || null,
        profession: profession || null,
        parent_id: parent_id, // Устанавливаем parent_id
        referral_code: newReferralCode, // Устанавливаем сгенерированный код
        status: 'inactive', // Новый пользователь неактивен до подтверждения
        is_confirmed: false,
        avatar_url: null
      })
      .eq('id', newUser.user!.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Failed to update user profile: ' + updateError.message 
        }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    console.log('User registered successfully via referral:', newUser.user!.id)

    // Возвращаем успешный результат
    return new Response(
      JSON.stringify({ 
        success: true,
        user_id: newUser.user!.id,
        referral_code: newReferralCode,
        message: 'Registration successful. You can now sign in.',
        referrer_name: `${parentUser.first_name || ''} ${parentUser.last_name || ''}`.trim()
      }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (e) {
    console.error('Unexpected error:', e)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error: ' + e.message 
      }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})