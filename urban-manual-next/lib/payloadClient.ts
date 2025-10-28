/**
 * Payload CMS Client Wrapper
 * Provides a Supabase-like interface for Payload CMS
 * This minimizes changes needed in frontend components
 */

interface QueryOptions {
  select?: string
  limit?: number
  offset?: number
  order?: { column: string; ascending?: boolean }
  filter?: Record<string, any>
}

class PayloadClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = '/api'
  }

  /**
   * Query builder for Payload collections
   */
  from(collection: string) {
    return new PayloadQueryBuilder(collection, this.baseUrl)
  }

  /**
   * Auth methods (if using Payload auth)
   */
  auth = {
    getUser: async () => {
      try {
        const response = await fetch(`${this.baseUrl}/users/me`, {
          credentials: 'include',
        })

        if (!response.ok) {
          return { data: { user: null }, error: null }
        }

        const user = await response.json()
        return { data: { user }, error: null }
      } catch (error) {
        return { data: { user: null }, error }
      }
    },

    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      try {
        const response = await fetch(`${this.baseUrl}/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include',
        })

        if (!response.ok) {
          const error = await response.json()
          return { data: { user: null, session: null }, error }
        }

        const data = await response.json()
        return { data: { user: data.user, session: data.token }, error: null }
      } catch (error) {
        return { data: { user: null, session: null }, error }
      }
    },

    signOut: async () => {
      try {
        await fetch(`${this.baseUrl}/users/logout`, {
          method: 'POST',
          credentials: 'include',
        })
        return { error: null }
      } catch (error) {
        return { error }
      }
    },
  }
}

class PayloadQueryBuilder {
  private collection: string
  private baseUrl: string
  private queryOptions: QueryOptions = {}

  constructor(collection: string, baseUrl: string) {
    this.collection = collection
    this.baseUrl = baseUrl
  }

  select(fields: string = '*') {
    this.queryOptions.select = fields
    return this
  }

  limit(count: number) {
    this.queryOptions.limit = count
    return this
  }

  offset(count: number) {
    this.queryOptions.offset = count
    return this
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.queryOptions.order = { column, ascending: options?.ascending ?? true }
    return this
  }

  eq(field: string, value: any) {
    if (!this.queryOptions.filter) {
      this.queryOptions.filter = {}
    }
    this.queryOptions.filter[field] = { equals: value }
    return this
  }

  neq(field: string, value: any) {
    if (!this.queryOptions.filter) {
      this.queryOptions.filter = {}
    }
    this.queryOptions.filter[field] = { not_equals: value }
    return this
  }

  in(field: string, values: any[]) {
    if (!this.queryOptions.filter) {
      this.queryOptions.filter = {}
    }
    this.queryOptions.filter[field] = { in: values }
    return this
  }

  ilike(field: string, pattern: string) {
    if (!this.queryOptions.filter) {
      this.queryOptions.filter = {}
    }
    this.queryOptions.filter[field] = { like: pattern }
    return this
  }

  /**
   * Execute the query
   */
  async execute() {
    try {
      const params = new URLSearchParams()

      if (this.queryOptions.limit) {
        params.append('limit', this.queryOptions.limit.toString())
      }

      if (this.queryOptions.offset) {
        params.append('page', Math.floor((this.queryOptions.offset / (this.queryOptions.limit || 10)) + 1).toString())
      }

      if (this.queryOptions.filter) {
        params.append('where', JSON.stringify(this.queryOptions.filter))
      }

      if (this.queryOptions.order) {
        params.append('sort', `${this.queryOptions.order.ascending ? '' : '-'}${this.queryOptions.order.column}`)
      }

      const url = `${this.baseUrl}/${this.collection}?${params.toString()}`

      const response = await fetch(url, {
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        return { data: null, error }
      }

      const result = await response.json()
      return { data: result.docs || result, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Alias for execute() to match Supabase API
   */
  async then(resolve: (value: any) => void, reject?: (reason: any) => void) {
    const result = await this.execute()

    if (result.error && reject) {
      reject(result.error)
    } else {
      resolve(result)
    }
  }

  /**
   * Insert data
   */
  async insert(data: any | any[]) {
    try {
      const isArray = Array.isArray(data)
      const insertData = isArray ? data : [data]

      const promises = insertData.map(item =>
        fetch(`${this.baseUrl}/${this.collection}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
          credentials: 'include',
        }).then(res => res.json())
      )

      const results = await Promise.all(promises)
      return { data: isArray ? results : results[0], error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Update data
   */
  async update(data: any) {
    try {
      if (!this.queryOptions.filter) {
        throw new Error('Update requires a filter (use .eq() or other filters)')
      }

      // For Payload, we need to get the IDs first, then update
      const { data: items, error: fetchError } = await this.execute()

      if (fetchError || !items) {
        return { data: null, error: fetchError }
      }

      const promises = items.map((item: any) =>
        fetch(`${this.baseUrl}/${this.collection}/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          credentials: 'include',
        }).then(res => res.json())
      )

      const results = await Promise.all(promises)
      return { data: results, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Delete data
   */
  async delete() {
    try {
      if (!this.queryOptions.filter) {
        throw new Error('Delete requires a filter (use .eq() or other filters)')
      }

      // Get items to delete
      const { data: items, error: fetchError } = await this.execute()

      if (fetchError || !items) {
        return { data: null, error: fetchError }
      }

      const promises = items.map((item: any) =>
        fetch(`${this.baseUrl}/${this.collection}/${item.id}`, {
          method: 'DELETE',
          credentials: 'include',
        })
      )

      await Promise.all(promises)
      return { data: items, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Get single item
   */
  async single() {
    this.queryOptions.limit = 1
    const result = await this.execute()

    if (result.data && Array.isArray(result.data)) {
      return { data: result.data[0] || null, error: result.error }
    }

    return result
  }
}

// Export singleton instance
export const payloadClient = new PayloadClient()

// Also export for compatibility
export { PayloadClient }
