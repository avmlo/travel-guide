import { NextResponse, type NextRequest } from 'next/server'
import { getStytchClient, STYTCH_SESSION_COOKIE } from '@/lib/stytch'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isStudio = pathname.startsWith('/studio')
  if (!isStudio) return NextResponse.next()

  const sessionToken = request.cookies.get(STYTCH_SESSION_COOKIE)?.value
  if (!sessionToken) {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  try {
    const stytch = getStytchClient()
    await stytch.sessions.authenticate({ session_token: sessionToken })
    return NextResponse.next()
  } catch {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: ['/studio/:path*'],
}


