import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  // Protect admin routes (except login)
  const pathname = request.nextUrl.pathname
  
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionCookie = request.cookies.get('session')?.value
    
    if (!sessionCookie) {
      const url = new URL('/admin/login', request.url)
      return NextResponse.redirect(url)
    }
    
    try {
      const session = await decrypt(sessionCookie)
      
      if (!session || !(session as any).loggedIn) {
        const url = new URL('/admin/login', request.url)
        return NextResponse.redirect(url)
      }
    } catch (error) {
      // Invalid session, redirect to login
      const url = new URL('/admin/login', request.url)
      return NextResponse.redirect(url)
    }
  }

  // Add pathname to headers for layout to use
  const response = NextResponse.next()
  response.headers.set('x-pathname', pathname)
  
  // Add security headers to prevent "Not Secure" warnings
  // These headers help browsers trust the site
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Only set HSTS if we're on HTTPS (Vercel always uses HTTPS)
  if (request.url.startsWith('https://')) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  
  return response
}

export const config = {
  matcher: '/admin/:path*',
}

