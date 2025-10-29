import { getSessionTokenFromCookies, getStytchClient } from '@/lib/stytch'

export type AuthSession = {
  userId: string
  expiresAt: string
} | null

export async function getCurrentSession(): Promise<AuthSession> {
  try {
    const token = await getSessionTokenFromCookies()
    if (!token) return null
    const stytch = getStytchClient()
    const { session } = await stytch.sessions.authenticate({ session_token: token })
    return {
      userId: session.user_id,
      expiresAt: session.expires_at ?? new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    }
  } catch {
    return null
  }
}


