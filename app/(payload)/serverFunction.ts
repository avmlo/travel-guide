'use server'

import type { ServerFunctionClient } from 'payload'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'

// Server function handler for Payload admin panel
export const serverFunction: ServerFunctionClient = async (functionArgs) => {
  const { name, args } = functionArgs

  try {
    const payload = await getPayloadHMR({ config })

    // Handle different server function types
    switch (name) {
      default:
        console.warn(`Unknown server function: ${name}`)
        return null
    }
  } catch (error) {
    console.error('Error in serverFunction:', error)
    throw error
  }
}
