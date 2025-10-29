import { NextResponse } from 'next/server'
import { clearSessionCookie, getSessionTokenFromCookies, getStytchClient } from '@/lib/stytch'

export async function POST() {
  try {
    const token = await getSessionTokenFromCookies()
    if (token) {
      const stytch = getStytchClient()
      await stytch.sessions.revoke({ session_token: token })
    }
  } catch {
    // ignore
  }

  await clearSessionCookie()
  return NextResponse.json({ ok: true })
}


