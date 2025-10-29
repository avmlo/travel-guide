import * as stytch from 'stytch'

export const stytchClient = new stytch.Client({
  project_id: process.env.STYTCH_PROJECT_ID || '',
  secret: process.env.STYTCH_SECRET || '',
})

export type StytchUser = {
  user_id: string
  email: string
  name?: string
  phone_number?: string
  created_at: string
}

