import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from './lib/auth'

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
  return response
}

export const config = {
  matcher: '/admin/:path*',
}

