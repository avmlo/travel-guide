type Env = {
  NEXT_PUBLIC_SANITY_PROJECT_ID: string
  NEXT_PUBLIC_SANITY_DATASET: string
  STYTCH_PROJECT_ID: string
  STYTCH_SECRET: string
  STYTCH_ENV: 'test' | 'live'
  STYTCH_LOGIN_REDIRECT_URL: string
}

export function getEnv(): Env {
  const {
    NEXT_PUBLIC_SANITY_PROJECT_ID,
    NEXT_PUBLIC_SANITY_DATASET = 'production',
    STYTCH_PROJECT_ID,
    STYTCH_SECRET,
    STYTCH_ENV = 'test',
    STYTCH_LOGIN_REDIRECT_URL,
  } = process.env

  const missing: string[] = []
  if (!NEXT_PUBLIC_SANITY_PROJECT_ID) missing.push('NEXT_PUBLIC_SANITY_PROJECT_ID')
  if (!NEXT_PUBLIC_SANITY_DATASET) missing.push('NEXT_PUBLIC_SANITY_DATASET')
  if (!STYTCH_PROJECT_ID) missing.push('STYTCH_PROJECT_ID')
  if (!STYTCH_SECRET) missing.push('STYTCH_SECRET')
  if (!STYTCH_LOGIN_REDIRECT_URL) missing.push('STYTCH_LOGIN_REDIRECT_URL')

  if (missing.length) {
    // We do not throw in production serverless cold start; let callers handle defaults
    // but we provide a clear error for when these are needed.
    console.warn(`Missing env vars: ${missing.join(', ')}`)
  }

  return {
    NEXT_PUBLIC_SANITY_PROJECT_ID: NEXT_PUBLIC_SANITY_PROJECT_ID || 'placeholder',
    NEXT_PUBLIC_SANITY_DATASET,
    STYTCH_PROJECT_ID: STYTCH_PROJECT_ID || '',
    STYTCH_SECRET: STYTCH_SECRET || '',
    STYTCH_ENV: (STYTCH_ENV as 'test' | 'live') || 'test',
    STYTCH_LOGIN_REDIRECT_URL: STYTCH_LOGIN_REDIRECT_URL || '',
  }
}


