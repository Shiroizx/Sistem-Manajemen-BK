import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

/**
 * Middleware for route protection and role-based access control.
 * 
 * Rules:
 * 1. Refresh the session securely
 * 2. Redirect unauthenticated users from /admin or /student to /login
 * 3. Redirect students from /admin/* to /student
 * 4. Redirect admins from /student/* to /admin
 */
export async function middleware(request: NextRequest) {
  const { supabase, response } = await updateSession(request)

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Public routes that don't require authentication
  // / is the public landing page for NIS search
  // /student is also public for backward compatibility
  const publicRoutes = ['/login', '/', '/student']
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'))

  // Protected routes: /admin and /guru-bk require authentication
  const protectedRoutes = ['/admin', '/guru-bk']
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // If accessing a protected route without authentication
  if (!user && !isPublicRoute && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated, check role-based access
  if (user) {
    // Fetch user profile to get role using maybeSingle to handle missing profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    const userRole = profile?.role as 'admin' | 'student' | 'guru_bk' | undefined

    // If profile doesn't exist or error, redirect to login
    if (profileError || !profile) {
      if (pathname !== '/login') {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      return response
    }

    // Rule 3: Only admin can access /admin routes
    if (userRole !== 'admin' && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Rule 4: Only guru_bk can access /guru-bk routes
    if (userRole !== 'guru_bk' && pathname.startsWith('/guru-bk')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Rule 5: Redirect authenticated users from login to their dashboard
    if (pathname === '/login') {
      if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      } else if (userRole === 'guru_bk') {
        return NextResponse.redirect(new URL('/guru-bk', request.url))
      }
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
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

