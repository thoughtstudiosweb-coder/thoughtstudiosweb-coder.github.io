import { NextResponse } from 'next/server'

export async function GET() {
  // Chrome DevTools workspace detection - return empty JSON
  return NextResponse.json({}, { status: 200 })
}

