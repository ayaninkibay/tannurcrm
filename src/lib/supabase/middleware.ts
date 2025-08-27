// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export async function middleware(request: NextRequest) {
  console.log('⏱ middleware start →', request.nextUrl.pathname)

  const response = NextResponse.next()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookieNames = request.cookies.getAll()
          console.log('middleware.cookies.getAll →', cookieNames.length, 'cookies')
          return cookieNames
        },
        setAll(cookiesToSet) {
          console.log('middleware.cookies.setAll →', cookiesToSet.length, 'cookies to set')
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
              ...options,
              // Обеспечиваем правильные настройки безопасности
              httpOnly: options?.httpOnly ?? false,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax'
            })
          })
        },
      },
    }
  )

  try {
    // Проверяем сессию с таймаутом
    const sessionPromise = supabase.auth.getUser()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Auth timeout')), 3000)
    )

    const { data: { user }, error: authError } = await Promise.race([
      sessionPromise,
      timeoutPromise
    ]) as any

    if (authError && authError.message !== 'Auth timeout') {
      console.log('middleware → auth error:', authError.message)
    }

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
      path: request.nextUrl.pathname 
    })

  } catch (error) {
    console.error('middleware → error:', error)
    
    // В случае ошибки, пропускаем запрос но логируем проблему
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dealer') ||
                           request.nextUrl.pathname.startsWith('/admin') ||
                           request.nextUrl.pathname.startsWith('/celebrity')
    
    if (isProtectedRoute) {
      // При ошибке авторизации на защищенной странице, перенаправляем на signin
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
    '/dealer/:path*',
    '/admin/:path*', 
    '/celebrity/:path*',
    '/signin',
    '/signup'
  ]
}