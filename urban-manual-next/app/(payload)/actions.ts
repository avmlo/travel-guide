'use server'

/**
 * Server function to proxy API requests from Payload Admin UI
 * This allows the client-side admin panel to communicate with the server
 */
export const restRequest = async (args: any) => {
  const { url, method, body, headers } = args

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

  // Make the request to the API endpoint
  // The API routes at /api/* will handle this via the REST handlers
  const response = await fetch(url, requestOptions)

  return response
}
