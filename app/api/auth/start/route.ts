import { NextResponse } from 'next/server'
import { getStytchClient } from '@/lib/stytch'

export async function POST(request: Request) {
  try {
    let email: string | null = null
    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const body = await request.json()
      email = body?.email ?? null
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      email = String(form.get('email') || '')
    }
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

    if (contentType.includes('application/json')) {
      return NextResponse.json({ ok: true })
    }
    const url = new URL('/login?sent=1', request.url)
    return NextResponse.redirect(url)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to start login' }, { status: 500 })
  }
}


