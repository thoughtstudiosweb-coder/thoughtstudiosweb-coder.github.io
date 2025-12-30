import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from './auth'

export async function requireAuth(request: NextRequest) {
  const session = await getSession()
  
  if (!session || !session.loggedIn) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  
  return null
}

