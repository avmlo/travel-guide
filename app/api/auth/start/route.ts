import { NextResponse } from 'next/server'
import { getStytchClient } from '@/lib/stytch'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const stytch = getStytchClient()
    const loginRedirectUrl = process.env.STYTCH_LOGIN_REDIRECT_URL
    const loginExpirationMinutes = 30

    if (!loginRedirectUrl) {
      return NextResponse.json({ error: 'Missing STYTCH_LOGIN_REDIRECT_URL' }, { status: 500 })
    }

    await stytch.magicLinks.email.loginOrCreate({
      email,
      login_magic_link_url: loginRedirectUrl,
      login_expiration_minutes: loginExpirationMinutes,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to start login' }, { status: 500 })
  }
}


