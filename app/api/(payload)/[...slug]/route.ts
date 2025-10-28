import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@/payload.config'

export const GET = async (req: Request) => {
  const payload = await getPayloadHMR({ config: configPromise })

  return payload.handleRequest({
    request: req,
  })
}

export const POST = async (req: Request) => {
  const payload = await getPayloadHMR({ config: configPromise })

  return payload.handleRequest({
    request: req,
  })
}

export const PUT = async (req: Request) => {
  const payload = await getPayloadHMR({ config: configPromise })

  return payload.handleRequest({
    request: req,
  })
}

export const PATCH = async (req: Request) => {
  const payload = await getPayloadHMR({ config: configPromise })

  return payload.handleRequest({
    request: req,
  })
}

export const DELETE = async (req: Request) => {
  const payload = await getPayloadHMR({ config: configPromise })

  return payload.handleRequest({
    request: req,
  })
}
