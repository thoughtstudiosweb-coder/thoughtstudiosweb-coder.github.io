import { NextRequest, NextResponse } from 'next/server'
import { encrypt } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminEmail || !adminPassword) {
      console.error('Admin credentials not configured in .env.local')
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    if (email === adminEmail && password === adminPassword) {
      const session = await encrypt({ email, loggedIn: true })
      
      const response = NextResponse.json({ success: true })
      // Always use Secure flag on Vercel (HTTPS) or when VERCEL env var is set
      // This prevents "Not Secure" warnings in browsers
      const isSecure = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' || request.url.startsWith('https://')
      response.cookies.set('session', session, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      })
      
      return response
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    )
  }
}

