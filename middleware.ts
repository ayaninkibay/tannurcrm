import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

// Импортируем только то, что нужно
const hasPageAccess = async (supabase: any, userId: string, pathname: string): Promise<boolean> => {
  // Встроенная упрощенная проверка прав
  const { data: userData } = await supabase
    .from('users')
    .select('role, permissions')
    .eq('id', userId)
    .single()

  const permissions = userData?.permissions || []
  
  // Базовая логика проверки прав
  if (permissions.includes('*')) return true
  
  // Здесь ваша логика проверки из permissions.ts
  // но только критичная часть
  return permissions.some((p: string) => pathname.startsWith(p))
}

const isProtectedAdminRoute = (pathname: string): boolean => {
  return pathname.startsWith('/admin/finance') ||
         pathname.startsWith('/admin/warehouse') ||
         pathname.startsWith('/admin/teamcontent')
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Оптимизация: создаем клиент только если нужно
  const pathname = request.nextUrl.pathname
  const isProtectedRoute = pathname.startsWith('/dealer') ||
                          pathname.startsWith('/admin') ||
                          pathname.startsWith('/celebrity')
  
  const isAuthRoute = pathname === '/signin' || pathname === '/signup'

  // Если это не защищенный роут и не auth - пропускаем
  if (!isProtectedRoute && !isAuthRoute) {
    return response
  }

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
    const { data: { user } } = await supabase.auth.getUser()

    // Неавторизованный на защищенной странице
    if (isProtectedRoute && !user) {
      return NextResponse.rewrite(new URL('/not-found', request.url))
    }

    // Авторизованный на странице входа
    if (isAuthRoute && user) {
      const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/'
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }

    // Проверка прав доступа к админским страницам
    if (user && isProtectedAdminRoute(pathname)) {
      const hasAccess = await hasPageAccess(supabase, user.id, pathname)
      
      if (!hasAccess) {
        return NextResponse.rewrite(new URL('/not-found', request.url))
      }
    }

  } catch (error) {
    console.error('Middleware error:', error)
    
    if (isProtectedRoute) {
      return NextResponse.rewrite(new URL('/not-found', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ]
}