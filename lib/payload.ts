import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@/payload.config'

let cachedPayload: any = null

export async function getPayload() {
  if (cachedPayload) {
    return cachedPayload
  }

  cachedPayload = await getPayloadHMR({ config: configPromise })
  return cachedPayload
}
