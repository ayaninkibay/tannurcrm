import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: Request) {
  try {
    const { iin } = await request.json()

    if (!iin) {
      return NextResponse.json(
        { error: 'IIN is required' },
        { status: 400 }
      )
    }

    // Валидация IIN формата (12 цифр)
    if (!/^\d{12}$/.test(iin)) {
      return NextResponse.json(
        { error: 'IIN must be 12 digits', available: false },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Проверяем, существует ли пользователь с таким IIN
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('iin', parseInt(iin))
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to check IIN availability' },
        { status: 500 }
      )
    }

    // Если data есть - IIN занят
    return NextResponse.json({
      available: !data,
      iin: iin
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}