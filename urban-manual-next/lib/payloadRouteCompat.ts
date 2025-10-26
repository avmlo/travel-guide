/**
 * Compatibility wrapper for Payload CMS route handlers to work with Next.js 16
 * Next.js 16 changed the route handler signature to require params as a Promise
 */
import type { NextRequest } from 'next/server'
import { REST_DELETE, REST_GET, REST_OPTIONS, REST_PATCH, REST_POST } from '@payloadcms/next/routes'

type RouteConfig = {
  config: any
}

type RouteArgs = {
  params: Promise<{ slug?: string[] }>
}

// Helper to wrap Payload handlers for Next.js 16 compatibility
const wrapHandler = (handler: Function) => {
  return async (req: NextRequest, args: RouteArgs) => {
    // Await params to satisfy Next.js 16 requirements
    await args.params
    // Call the Payload handler (it returns a Response directly)
    return handler(req)
  }
}

export const createPayloadRoutes = (routeConfig: RouteConfig) => ({
  GET: wrapHandler((req: NextRequest) => REST_GET(req, routeConfig)),
  POST: wrapHandler((req: NextRequest) => REST_POST(req, routeConfig)),
  DELETE: wrapHandler((req: NextRequest) => REST_DELETE(req, routeConfig)),
  PATCH: wrapHandler((req: NextRequest) => REST_PATCH(req, routeConfig)),
  OPTIONS: wrapHandler((req: NextRequest) => REST_OPTIONS(req)),
})
