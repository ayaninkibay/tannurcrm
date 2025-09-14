// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export async function middleware(request: NextRequest) {
  console.log('⏱ middleware start →', request.nextUrl.pathname)

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Устанавливаем куки с правильными настройками
            const cookieOptions = {
              ...options,
              httpOnly: false, // Позволяем доступ из JavaScript
              secure: process.env.NODE_ENV === 'production', // HTTPS только в продакшене
              sameSite: 'lax' as const, // Защита от CSRF
              maxAge: 60 * 60 * 24 * 7 // 7 дней
            }
            request.cookies.set({ name, value, ...cookieOptions })
            response.cookies.set({ name, value, ...cookieOptions })
          })
        },
      },
    }
  )

  try {
    // Получаем сессию - Supabase автоматически обновит токен если нужно
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Session error in middleware:', error)
    }

    // Получаем пользователя
    const { data: { user } } = await supabase.auth.getUser()

    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dealer') ||
                           request.nextUrl.pathname.startsWith('/admin') ||
                           request.nextUrl.pathname.startsWith('/celebrity')

    const isAuthRoute = request.nextUrl.pathname === '/signin' || 
                       request.nextUrl.pathname === '/signup'

    // Если пользователь не авторизован и пытается попасть на защищенную страницу
    if (isProtectedRoute && !user) {
      console.log('middleware → redirecting to /signin (no user)')
      const url = request.nextUrl.clone()
      url.pathname = '/signin'
      url.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    // Если пользователь авторизован и находится на странице входа
    if (isAuthRoute && user) {
      console.log('middleware → redirecting to / (already signed in)')
      const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/'
      const url = request.nextUrl.clone()
      url.pathname = redirectTo
      url.searchParams.delete('redirectTo')
      return NextResponse.redirect(url)
    }

    console.log('middleware → allow', { 
      user: user?.email || 'anonymous',
      path: request.nextUrl.pathname,
      sessionExists: !!session
    })

  } catch (error) {
    console.error('middleware → error:', error)
    
    // В случае ошибки, проверяем защищенные маршруты
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dealer') ||
                           request.nextUrl.pathname.startsWith('/admin') ||
                           request.nextUrl.pathname.startsWith('/celebrity')
    
    if (isProtectedRoute) {
      console.log('middleware → redirecting to /signin (auth error)')
      const url = request.nextUrl.clone()
      url.pathname = '/signin'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't need auth
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ]
}