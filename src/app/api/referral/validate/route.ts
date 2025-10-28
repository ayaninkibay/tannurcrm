import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      )
    }

    // Создаем Supabase клиент (анонимный, т.к. пользователь не авторизован)
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Вызываем RPC функцию для получения данных владельца
    const { data, error } = await supabase
      .rpc('get_user_by_referral_code', { p_referral_code: code })
      .single()

    if (error) {
      console.error('RPC error:', error)
      return NextResponse.json(
        { error: 'Failed to validate referral code', valid: false },
        { status: 500 }
      )
    }

    // Если данных нет - код недействителен
    if (!data) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Referral code not found or inactive' 
        },
        { status: 404 }
      )
    }

    // Проверяем, активен ли владелец
    if (!data.is_active) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Referral code owner is inactive or not confirmed' 
        },
        { status: 403 }
      )
    }

    // Возвращаем данные владельца
    return NextResponse.json({
      valid: true,
      referrer: {
        id: data.user_id,
        firstName: data.first_name,
        lastName: data.last_name,
        fullName: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
        avatarUrl: data.avatar_url,
        role: data.role,
        teamSize: data.team_size || 0,
        referralCode: data.referral_code
      }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', valid: false },
      { status: 500 }
    )
  }
}