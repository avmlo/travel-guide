# Connect Forked Morphic to Supabase: Complete Guide

**Date:** October 26, 2025
**Goal:** Connect your forked Morphic to Urban Manual's Supabase database

---

## Prerequisites

Before starting, gather these from your Supabase dashboard:

1. **Supabase URL**: `https://avdnefdfwvpjkuanhdwk.supabase.co`
2. **Anon/Public Key**: Found in Settings → API
3. **Service Role Key**: Found in Settings → API (keep secret!)

---

## Step 1: Install Supabase Client

```bash
# Navigate to your forked Morphic directory
cd morphic

# Install Supabase client
npm install @supabase/supabase-js
# or
bun add @supabase/supabase-js
```

---

## Step 2: Configure Environment Variables

### Edit `.env.local`:

```bash
# Open the file
nano .env.local
```

### Add these variables:

```bash
# ============================================
# SUPABASE CONFIGURATION
# ============================================

# Your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://avdnefdfwvpjkuanhdwk.supabase.co

# Public anon key (safe for client-side)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Service role key (server-side only, keep secret!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ============================================
# AI CONFIGURATION (Keep existing)
# ============================================

# OpenAI API Key
OPENAI_API_KEY=sk-...

# ============================================
# OPTIONAL: Redis for chat history
# ============================================

UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# ============================================
# REMOVE THESE (Not needed for Urban Manual)
# ============================================

# TAVILY_API_KEY=...
# SEARXNG_API_URL=...
# EXA_API_KEY=...
```

---

## Step 3: Create Supabase Client

### Create `lib/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

// Client-side Supabase client (uses anon key)
export const createBrowserClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Server-side Supabase client (uses service role key)
export const createServerClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false
      }
    }
  )
}

// Default export for server actions
export const supabase = createServerClient()
```

---

## Step 4: Generate TypeScript Types from Supabase

### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref avdnefdfwvpjkuanhdwk

# Generate types
supabase gen types typescript --project-id avdnefdfwvpjkuanhdwk > lib/supabase/types.ts
```

### Option B: Manual Type Definition

Create `lib/supabase/types.ts`:

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      destinations: {
        Row: {
          slug: string
          name: string
          city: string
          country: string
          category: string
          main_image: string | null
          content: string | null
          rating: number | null
          michelin_stars: number | null
          price_range: string | null
          vibe_tags: string[] | null
          keywords: string[] | null
          ai_summary: string | null
          latitude: number | null
          longitude: number | null
          website: string | null
          instagram: string | null
          phone: string | null
          email: string | null
          neighborhood: string | null
          architectural_style: string | null
          designer_name: string | null
          year_established: number | null
          amenities: string[] | null
          cuisine_type: string[] | null
          opening_hours: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          slug: string
          name: string
          city: string
          country: string
          category: string
          main_image?: string | null
          content?: string | null
          rating?: number | null
          michelin_stars?: number | null
          price_range?: string | null
          vibe_tags?: string[] | null
          keywords?: string[] | null
          ai_summary?: string | null
          latitude?: number | null
          longitude?: number | null
          website?: string | null
          instagram?: string | null
          phone?: string | null
          email?: string | null
          neighborhood?: string | null
          architectural_style?: string | null
          designer_name?: string | null
          year_established?: number | null
          amenities?: string[] | null
          cuisine_type?: string[] | null
          opening_hours?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          slug?: string
          name?: string
          city?: string
          country?: string
          category?: string
          main_image?: string | null
          content?: string | null
          rating?: number | null
          michelin_stars?: number | null
          price_range?: string | null
          vibe_tags?: string[] | null
          keywords?: string[] | null
          ai_summary?: string | null
          latitude?: number | null
          longitude?: number | null
          website?: string | null
          instagram?: string | null
          phone?: string | null
          email?: string | null
          neighborhood?: string | null
          architectural_style?: string | null
          designer_name?: string | null
          year_established?: number | null
          amenities?: string[] | null
          cuisine_type?: string[] | null
          opening_hours?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Helper type for destinations
export type Destination = Database['public']['Tables']['destinations']['Row']
```

---

## Step 5: Create Search Functions

### Create `lib/supabase/search.ts`:

```typescript
'use server'

import { supabase } from './client'
import { Destination } from './types'

export interface SearchParams {
  query?: string
  city?: string
  category?: string
  priceRange?: string
  vibes?: string[]
  michelinStars?: number
  limit?: number
  offset?: number
}

export interface SearchResult {
  destinations: Destination[]
  total: number
  hasMore: boolean
}

/**
 * Search destinations in Supabase
 */
export async function searchDestinations(
  params: SearchParams
): Promise<SearchResult> {
  const {
    query,
    city,
    category,
    priceRange,
    vibes,
    michelinStars,
    limit = 20,
    offset = 0
  } = params

  try {
    // Start building the query
    let dbQuery = supabase
      .from('destinations')
      .select('*', { count: 'exact' })

    // Filter by city
    if (city) {
      dbQuery = dbQuery.eq('city', city)
    }

    // Filter by category
    if (category) {
      dbQuery = dbQuery.eq('category', category)
    }

    // Filter by price range
    if (priceRange) {
      dbQuery = dbQuery.eq('price_range', priceRange)
    }

    // Filter by Michelin stars
    if (michelinStars !== undefined) {
      dbQuery = dbQuery.eq('michelin_stars', michelinStars)
    }

    // Filter by vibe tags
    if (vibes && vibes.length > 0) {
      dbQuery = dbQuery.contains('vibe_tags', vibes)
    }

    // Text search across multiple fields
    if (query && query.trim()) {
      const searchTerm = `%${query.trim()}%`
      dbQuery = dbQuery.or(
        `name.ilike.${searchTerm},` +
        `content.ilike.${searchTerm},` +
        `neighborhood.ilike.${searchTerm},` +
        `architectural_style.ilike.${searchTerm},` +
        `designer_name.ilike.${searchTerm}`
      )
    }

    // Order by rating (highest first), then by name
    dbQuery = dbQuery
      .order('rating', { ascending: false, nullsLast: true })
      .order('name', { ascending: true })

    // Pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1)

    // Execute query
    const { data, error, count } = await dbQuery

    if (error) {
      console.error('Supabase search error:', error)
      throw new Error(`Search failed: ${error.message}`)
    }

    return {
      destinations: data as Destination[],
      total: count || 0,
      hasMore: (count || 0) > offset + limit
    }
  } catch (error) {
    console.error('Search error:', error)
    throw error
  }
}

/**
 * Get a single destination by slug
 */
export async function getDestination(
  slug: string
): Promise<Destination | null> {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null
      }
      throw error
    }

    return data as Destination
  } catch (error) {
    console.error('Get destination error:', error)
    return null
  }
}

/**
 * Get multiple destinations by slugs
 */
export async function getDestinations(
  slugs: string[]
): Promise<Destination[]> {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .in('slug', slugs)

    if (error) {
      throw error
    }

    return data as Destination[]
  } catch (error) {
    console.error('Get destinations error:', error)
    return []
  }
}

/**
 * Get similar destinations based on a given destination
 */
export async function getSimilarDestinations(
  slug: string,
  limit: number = 6
): Promise<Destination[]> {
  try {
    // First, get the reference destination
    const destination = await getDestination(slug)
    if (!destination) return []

    // Search for similar destinations
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('city', destination.city)
      .eq('category', destination.category)
      .neq('slug', slug)
      .order('rating', { ascending: false, nullsLast: true })
      .limit(limit)

    if (error) {
      throw error
    }

    return data as Destination[]
  } catch (error) {
    console.error('Get similar destinations error:', error)
    return []
  }
}

/**
 * Get all unique cities
 */
export async function getCities(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('city')
      .order('city')

    if (error) {
      throw error
    }

    // Get unique cities
    const cities = [...new Set(data.map(d => d.city))].filter(Boolean)
    return cities as string[]
  } catch (error) {
    console.error('Get cities error:', error)
    return []
  }
}

/**
 * Get all unique categories
 */
export async function getCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('category')
      .order('category')

    if (error) {
      throw error
    }

    // Get unique categories
    const categories = [...new Set(data.map(d => d.category))].filter(Boolean)
    return categories as string[]
  } catch (error) {
    console.error('Get categories error:', error)
    return []
  }
}

/**
 * Get destination statistics
 */
export async function getStats() {
  try {
    const { count: total } = await supabase
      .from('destinations')
      .select('*', { count: 'exact', head: true })

    const { data: cities } = await supabase
      .from('destinations')
      .select('city')

    const { data: categories } = await supabase
      .from('destinations')
      .select('category')

    const uniqueCities = [...new Set(cities?.map(d => d.city) || [])].length
    const uniqueCategories = [...new Set(categories?.map(d => d.category) || [])].length

    return {
      totalDestinations: total || 0,
      totalCities: uniqueCities,
      totalCategories: uniqueCategories
    }
  } catch (error) {
    console.error('Get stats error:', error)
    return {
      totalDestinations: 0,
      totalCities: 0,
      totalCategories: 0
    }
  }
}
```

---

## Step 6: Test the Connection

### Create `lib/supabase/test.ts`:

```typescript
import { searchDestinations, getDestination, getStats } from './search'

async function testConnection() {
  console.log('🧪 Testing Supabase connection...\n')

  try {
    // Test 1: Get stats
    console.log('Test 1: Getting database stats...')
    const stats = await getStats()
    console.log('✅ Stats:', stats)
    console.log()

    // Test 2: Search all destinations
    console.log('Test 2: Searching all destinations...')
    const allResults = await searchDestinations({ limit: 5 })
    console.log(`✅ Found ${allResults.total} total destinations`)
    console.log(`✅ Retrieved ${allResults.destinations.length} destinations:`)
    allResults.destinations.forEach(d => {
      console.log(`   - ${d.name} (${d.city})`)
    })
    console.log()

    // Test 3: Search by city
    console.log('Test 3: Searching destinations in London...')
    const londonResults = await searchDestinations({ city: 'London', limit: 3 })
    console.log(`✅ Found ${londonResults.total} destinations in London`)
    londonResults.destinations.forEach(d => {
      console.log(`   - ${d.name}`)
    })
    console.log()

    // Test 4: Search by query
    console.log('Test 4: Searching for "cafe"...')
    const cafeResults = await searchDestinations({ query: 'cafe', limit: 3 })
    console.log(`✅ Found ${cafeResults.total} cafes`)
    cafeResults.destinations.forEach(d => {
      console.log(`   - ${d.name} (${d.city})`)
    })
    console.log()

    // Test 5: Get specific destination
    if (allResults.destinations.length > 0) {
      const firstSlug = allResults.destinations[0].slug
      console.log(`Test 5: Getting destination by slug (${firstSlug})...`)
      const destination = await getDestination(firstSlug)
      console.log('✅ Destination:', destination?.name)
      console.log()
    }

    console.log('🎉 All tests passed!')
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run tests
testConnection()
```

### Run the test:

```bash
# Using Bun
bun run lib/supabase/test.ts

# Using Node
npx tsx lib/supabase/test.ts

# Or add to package.json scripts:
# "test:supabase": "tsx lib/supabase/test.ts"
npm run test:supabase
```

Expected output:
```
🧪 Testing Supabase connection...

Test 1: Getting database stats...
✅ Stats: { totalDestinations: 921, totalCities: 45, totalCategories: 6 }

Test 2: Searching all destinations...
✅ Found 921 total destinations
✅ Retrieved 5 destinations:
   - Sketch London (London)
   - The Wolseley (London)
   - Crispin (London)
   - ...

Test 3: Searching destinations in London...
✅ Found 234 destinations in London
   - Sketch London
   - The Wolseley
   - Crispin

Test 4: Searching for "cafe"...
✅ Found 156 cafes
   - Blue Bottle Coffee (Tokyo)
   - Cafe de Flore (Paris)
   - ...

Test 5: Getting destination by slug (sketch-london)...
✅ Destination: Sketch London

🎉 All tests passed!
```

---

## Step 7: Integrate with Morphic's AI

### Find the AI chat route (usually `app/api/chat/route.ts`)

### Replace the search tool:

```typescript
import { searchDestinations, getDestination, getSimilarDestinations } from '@/lib/supabase/search'
import { z } from 'zod'

// Define the search tool
const tools = {
  searchDestinations: {
    description: 'Search for curated destinations (restaurants, cafes, hotels, bars, shops, bakeries) in the Urban Manual database',
    parameters: z.object({
      query: z.string().optional().describe('Search query or description'),
      city: z.string().optional().describe('Filter by city name'),
      category: z.enum(['Restaurant', 'Cafe', 'Hotel', 'Bar', 'Shop', 'Bakery']).optional(),
      priceRange: z.string().optional().describe('Price range: £, ££, £££, or ££££'),
      vibes: z.array(z.string()).optional().describe('Vibe tags like "cozy", "modern", "minimalist"'),
      michelinStars: z.number().optional().describe('Filter by Michelin stars (1, 2, or 3)'),
      limit: z.number().default(10).describe('Maximum number of results')
    }),
    execute: async (params: any) => {
      const results = await searchDestinations(params)
      return {
        destinations: results.destinations,
        total: results.total,
        summary: `Found ${results.total} destinations${params.city ? ` in ${params.city}` : ''}`
      }
    }
  },

  getDestinationDetails: {
    description: 'Get detailed information about a specific destination by its slug',
    parameters: z.object({
      slug: z.string().describe('The destination slug/identifier')
    }),
    execute: async ({ slug }: { slug: string }) => {
      const destination = await getDestination(slug)
      if (!destination) {
        return { error: 'Destination not found' }
      }
      return destination
    }
  },

  getSimilarDestinations: {
    description: 'Find destinations similar to a given one',
    parameters: z.object({
      slug: z.string().describe('The destination slug to find similar ones for'),
      limit: z.number().default(6).describe('Maximum number of similar destinations')
    }),
    execute: async ({ slug, limit }: { slug: string; limit: number }) => {
      const similar = await getSimilarDestinations(slug, limit)
      return {
        destinations: similar,
        count: similar.length
      }
    }
  }
}
```

### Update the system prompt:

```typescript
const systemPrompt = `You are an expert travel advisor for Urban Manual, specializing in design-focused, curated destinations worldwide.

You have access to a database of 921 carefully selected destinations including:
- Restaurants (many with Michelin stars)
- Cafes (specialty coffee, design-focused)
- Hotels (boutique, design hotels)
- Bars (cocktail bars, wine bars)
- Shops (design, fashion, lifestyle)
- Bakeries (artisanal, specialty)

Your role is to:
1. Understand what the user is looking for
2. Search the destination database using the searchDestinations tool
3. Provide personalized, thoughtful recommendations
4. Explain why each destination matches their preferences
5. Suggest related destinations or follow-up searches

When searching, consider:
- Location (city, neighborhood)
- Category and type
- Vibe and atmosphere (cozy, modern, minimalist, luxurious, etc.)
- Price range (£, ££, £££, ££££)
- Special features (Michelin stars, design awards, architectural style)
- User preferences and context

Always be specific, informative, and enthusiastic. Use the rich data available (vibe tags, architectural style, designer names, etc.) to provide detailed, helpful responses.

When you find destinations, present them in an engaging way and suggest related searches or follow-up questions.`
```

---

## Step 8: Verify Everything Works

### Create a simple test page `app/test/page.tsx`:

```typescript
import { searchDestinations, getStats } from '@/lib/supabase/search'

export default async function TestPage() {
  const stats = await getStats()
  const results = await searchDestinations({ limit: 5 })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-bold">Database Stats</h2>
          <p>Total Destinations: {stats.totalDestinations}</p>
          <p>Cities: {stats.totalCities}</p>
          <p>Categories: {stats.totalCategories}</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-bold mb-2">Sample Destinations</h2>
          <ul className="space-y-2">
            {results.destinations.map(dest => (
              <li key={dest.slug}>
                <strong>{dest.name}</strong> - {dest.city} ({dest.category})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
```

### Visit the test page:

```bash
# Start dev server
bun dev

# Open browser
open http://localhost:3000/test
```

You should see your destination data displayed!

---

## Troubleshooting

### Issue 1: "Cannot find module '@supabase/supabase-js'"

**Solution:**
```bash
npm install @supabase/supabase-js
# or
bun add @supabase/supabase-js
```

### Issue 2: "Invalid API key"

**Solution:**
- Check your `.env.local` file
- Make sure you copied the correct keys from Supabase dashboard
- Restart your dev server after changing `.env.local`

### Issue 3: "No data returned"

**Solution:**
- Check if your `destinations` table has data
- Verify table name is exactly "destinations" (case-sensitive)
- Check RLS (Row Level Security) policies in Supabase

### Issue 4: "RLS policy violation"

**Solution:**
```sql
-- Run this in Supabase SQL Editor
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access"
ON destinations
FOR SELECT
TO public
USING (true);
```

### Issue 5: TypeScript errors

**Solution:**
```bash
# Regenerate types
supabase gen types typescript --project-id avdnefdfwvpjkuanhdwk > lib/supabase/types.ts

# Or use the manual type definition provided in Step 4
```

---

## Next Steps

Now that Supabase is connected:

1. ✅ **Test the connection** - Run the test script
2. ✅ **Verify data** - Check the test page
3. ✅ **Try a search** - Use the AI chat interface
4. ✅ **Add UI components** - Build destination cards
5. ✅ **Deploy** - Push to Vercel

---

## Summary

You've now:
- ✅ Installed Supabase client
- ✅ Configured environment variables
- ✅ Created TypeScript types
- ✅ Built search functions
- ✅ Integrated with Morphic's AI
- ✅ Tested the connection

Your forked Morphic is now connected to your Supabase database and ready to search your 921 curated destinations!

---

## Quick Reference

### Environment Variables Needed:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://avdnefdfwvpjkuanhdwk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
OPENAI_API_KEY=sk-...
```

### Key Files Created:
- `lib/supabase/client.ts` - Supabase client setup
- `lib/supabase/types.ts` - TypeScript types
- `lib/supabase/search.ts` - Search functions
- `lib/supabase/test.ts` - Connection tests

### Commands:
```bash
# Test connection
bun run lib/supabase/test.ts

# Start dev server
bun dev

# Generate types
supabase gen types typescript --project-id avdnefdfwvpjkuanhdwk > lib/supabase/types.ts
```

Need help with any step? Let me know!

