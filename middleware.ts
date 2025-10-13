// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'
import { hasPageAccess } from './src/lib/permissions/permissions'
import { isProtectedAdminRoute } from './src/lib/permissions/permissions-config'

export async function middleware(request: NextRequest) {
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
            const cookieOptions = {
              ...options,
              httpOnly: false,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax' as const,
              maxAge: 60 * 60 * 24 * 7
            }
            request.cookies.set({ name, value, ...cookieOptions })
            response.cookies.set({ name, value, ...cookieOptions })
          })
        },
      },
    }
  )

  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Session error in middleware:', error)
    }

    const { data: { user } } = await supabase.auth.getUser()

    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dealer') ||
                           request.nextUrl.pathname.startsWith('/admin') ||
                           request.nextUrl.pathname.startsWith('/celebrity')

    const isAuthRoute = request.nextUrl.pathname === '/signin' || 
                       request.nextUrl.pathname === '/signup'

    // 🔒 Если неавторизованный пытается попасть на защищенную страницу - показываем 404
    if (isProtectedRoute && !user) {
      return NextResponse.rewrite(new URL('/not-found', request.url))
    }

    // Если пользователь авторизован и находится на странице входа
    if (isAuthRoute && user) {
      const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/'
      const url = request.nextUrl.clone()
      url.pathname = redirectTo
      url.searchParams.delete('redirectTo')
      return NextResponse.redirect(url)
    }

    // 🔐 ПРОВЕРКА ПРАВ ДОСТУПА К АДМИНСКИМ СТРАНИЦАМ
    if (user && isProtectedAdminRoute(request.nextUrl.pathname)) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, permissions')
        .eq('id', user.id)
        .single()

      if (userError) {
        return NextResponse.rewrite(new URL('/not-found', request.url))
      }

      const userPermissions = userData?.permissions || []
      const hasAccess = hasPageAccess(userPermissions, request.nextUrl.pathname)

      if (!hasAccess) {
        return NextResponse.rewrite(new URL('/not-found', request.url))
      }
    }

  } catch (error) {
    console.error('Middleware error:', error)
    
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dealer') ||
                           request.nextUrl.pathname.startsWith('/admin') ||
                           request.nextUrl.pathname.startsWith('/celebrity')
    
    if (isProtectedRoute) {
      return NextResponse.rewrite(new URL('/not-found', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ]
}