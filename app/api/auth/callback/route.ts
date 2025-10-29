import { NextResponse } from 'next/server'
import { getStytchClient, setSessionCookie } from '@/lib/stytch'

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
      session_management_type: 'maintain',
    })

    const response = NextResponse.redirect(new URL('/', url))
    await setSessionCookie(session_token, new Date(session.expires_at))
    return response
  } catch {
    return NextResponse.redirect(new URL('/login?error=auth_failed', url))
  }
}


