import { cookies } from 'next/headers'
import { Client, envs } from 'stytch'
import { getEnv } from './env'

export function getStytchClient() {
  const env = getEnv()
  if (!env.STYTCH_PROJECT_ID || !env.STYTCH_SECRET) {
    throw new Error('Missing STYTCH_PROJECT_ID or STYTCH_SECRET')
  }
  return new Client({
    project_id: env.STYTCH_PROJECT_ID,
    secret: env.STYTCH_SECRET,
    env: env.STYTCH_ENV === 'live' ? envs.live : envs.test,
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

export async function getOptionalSession() {
  try {
    const token = await getSessionTokenFromCookies()
    if (!token) return null
    const stytch = getStytchClient()
    const { session } = await stytch.sessions.authenticate({ session_token: token })
    return session
  } catch {
    return null
  }
}

export async function requireSession() {
  const session = await getOptionalSession()
  if (!session) throw new Error('Not authenticated')
  return session
}


