import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Optimized Middleware:
 * Only handles basic session & authentication.
 * Role-based access (RBAC) is moved to layout.tsx/page.tsx for better performance.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Using getSession() instead of getUser() in middleware is MUCH faster 
  // because it only checks the JWT, not a server-side request to Supabase Auth.
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname
  const isAuthRoute = path.startsWith('/login') || path.startsWith('/register')
  const isPublicRoute = path === '/' || path.startsWith('/unauthorized') || path.startsWith('/api')

  // 1. Not authenticated -> redirect to login (except public/auth routes)
  if (!session && !isAuthRoute && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 2. Authenticated users shouldn't be on auth routes
  if (session && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard' // Default redirect, specific RBAC handled in layouts
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
