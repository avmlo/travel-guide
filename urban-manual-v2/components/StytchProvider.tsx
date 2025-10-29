'use client'

import { StytchProvider as StytchProviderBase } from '@stytch/nextjs'
import { createStytchUIClient } from '@stytch/nextjs/ui'
import { ReactNode } from 'react'

const stytch = createStytchUIClient(
  process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN || ''
)

export function StytchProvider({ children }: { children: ReactNode }) {
  return <StytchProviderBase stytch={stytch}>{children}</StytchProviderBase>
}

