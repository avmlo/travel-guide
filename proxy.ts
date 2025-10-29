import { NextResponse, type NextRequest } from 'next/server'
import { STYTCH_SESSION_COOKIE } from '@/lib/stytch'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isStudio = pathname.startsWith('/studio')
  if (!isStudio) return NextResponse.next()

  const sessionToken = request.cookies.get(STYTCH_SESSION_COOKIE)?.value
  if (!sessionToken) {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Edge runtime: avoid importing Node SDK here. Presence of cookie is sufficient to allow.
  return NextResponse.next()
}

export const config = {
  matcher: ['/studio/:path*'],
}


