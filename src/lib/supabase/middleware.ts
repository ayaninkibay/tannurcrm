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
            request.cookies.set({ name, value, ...options })
            response.cookies.set({ name, value, ...options })
          })
        },
      },
    }
  )

  try {
    // ВАЖНО: Используем getSession вместо getUser для обновления токена
    const { data: { session }, error } = await supabase.auth.getSession()
    
    // Если есть сессия, обновляем токен если необходимо
    if (session) {
      const expiresAt = session.expires_at
      if (expiresAt) {
        const now = Math.floor(Date.now() / 1000)
        const timeUntilExpiry = expiresAt - now
        
        // Обновляем токен если он истекает менее чем через 10 минут
        if (timeUntilExpiry < 600) {
          console.log('Token expiring soon in middleware, refreshing...')
          const { data: { session: newSession }, error: refreshError } = 
            await supabase.auth.refreshSession()
          
          if (refreshError) {
            console.error('Failed to refresh session in middleware:', refreshError)
          } else {
            console.log('Session refreshed successfully in middleware')
          }
        }
      }
    }

    // Получаем пользователя после возможного обновления сессии
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
      path: request.nextUrl.pathname 
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