'use server'

import config from '@payload-config'

export const restRequest = async ({ url, method, body, headers }: {
  url: string
  method: string
  body?: any
  headers?: HeadersInit
}) => {
  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (body) {
    requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body)
  }

  const request = new Request(url, requestOptions)

  // Import the appropriate handler dynamically
  const { REST_GET, REST_POST, REST_PATCH, REST_DELETE } = await import('@payloadcms/next/routes')

  let response

  switch (method) {
    case 'GET':
      response = await REST_GET(request, { config })
      break
    case 'POST':
      response = await REST_POST(request, { config })
      break
    case 'PATCH':
      response = await REST_PATCH(request, { config })
      break
    case 'DELETE':
      response = await REST_DELETE(request, { config })
      break
    default:
      throw new Error(`Unsupported method: ${method}`)
  }

  return response
}
