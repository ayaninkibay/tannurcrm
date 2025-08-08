// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export async function middleware(request: NextRequest) {
  console.log('⏱ middleware start →', request.nextUrl.pathname)
  console.log('⏱ middleware headers.cookie →', request.headers.get('cookie'))

  const response = NextResponse.next()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const header = request.headers.get('cookie') ?? ''
          const arr = header
            .split('; ')
            .filter(Boolean)
            .map(str => {
              const [name, ...rest] = str.split('=')
              return { name, value: rest.join('=') }
            })
          console.log('middleware.cookies.getAll →', arr)
          return arr
        },
        setAll(list) {
          console.log('middleware.cookies.setAll →', list)
          list.forEach(c => response.cookies.set(c))
        },
      },
    }
  )

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()
  console.log('middleware → supabase.auth.getUser error:', authError)
  console.log('middleware → supabase.auth.getUser user:', user)

  const isProtected = request.nextUrl.pathname.startsWith('/dealer')
  if (isProtected && !user) {
    console.log('middleware → redirecting to /signin')
    const url = request.nextUrl.clone()
    url.pathname = '/signin'
    return NextResponse.redirect(url)
  }

  console.log('middleware → allow')
  return response
}

export const config = {
  matcher: ['/dealer/:path*']
}
