/* Payload CMS API Routes - Next.js 16 Compatible */
import config from '@payload-config'
import { createPayloadRoutes } from '@/lib/payloadRouteCompat'

const routes = createPayloadRoutes({ config })

export const GET = routes.GET
export const POST = routes.POST
export const DELETE = routes.DELETE
export const PATCH = routes.PATCH
export const OPTIONS = routes.OPTIONS
