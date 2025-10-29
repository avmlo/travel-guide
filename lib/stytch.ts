import { cookies } from 'next/headers'
import { StytchB2C } from 'stytch'

export function getStytchClient() {
  const projectId = process.env.STYTCH_PROJECT_ID
  const secret = process.env.STYTCH_SECRET
  const env = process.env.STYTCH_ENV || 'test'

  if (!projectId || !secret) {
    throw new Error('Missing STYTCH_PROJECT_ID or STYTCH_SECRET')
  }

  return new StytchB2C({
    project_id: projectId,
    secret,
    env: env === 'live' ? StytchB2C.envs.live : StytchB2C.envs.test,
  })
}

export const STYTCH_SESSION_COOKIE = 'stytch_session'

export async function getSessionTokenFromCookies() {
  const store = await cookies()
  return store.get(STYTCH_SESSION_COOKIE)?.value || null
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const store = await cookies()
  store.set(STYTCH_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    expires: expiresAt,
  })
}

export async function clearSessionCookie() {
  const store = await cookies()
  store.delete(STYTCH_SESSION_COOKIE)
}


