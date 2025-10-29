import { NextResponse } from 'next/server'
import { getStytchClient, STYTCH_SESSION_COOKIE } from '@/lib/stytch'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=missing_token', url))
  }

  try {
    const stytch = getStytchClient()
    const { session_token, session } = await stytch.magicLinks.authenticate({
      token,
      session_duration_minutes: 60,
    })

    const res = NextResponse.redirect(new URL('/', url))
    res.cookies.set(STYTCH_SESSION_COOKIE, session_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      expires: new Date(session.expires_at),
    })
    return res
  } catch {
    return NextResponse.redirect(new URL('/login?error=auth_failed', url))
  }
}


