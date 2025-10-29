# Fork Morphic for Urban Manual: Complete Guide

**Date:** October 26, 2025
**Goal:** Fork Morphic and replace web search with Urban Manual destination search

---

## Overview

Instead of searching the web, we'll make Morphic search your Supabase database of 921 curated destinations. Users will get the same beautiful generative UI, but with your own data.

---

## Part 1: Fork and Setup

### Step 1: Fork the Repository

```bash
# Go to GitHub and fork
https://github.com/miurla/morphic

# Or use GitHub CLI
gh repo fork miurla/morphic --clone

# Navigate to the forked repo
cd morphic

# Rename for clarity
git remote rename origin upstream
git remote add origin git@github.com:YOUR_USERNAME/urban-manual-search.git
```

### Step 2: Install Dependencies

```bash
# Install with Bun (recommended) or npm
bun install

# Or with npm
npm install
```

### Step 3: Configure Environment Variables

```bash
# Copy example env file
cp .env.local.example .env.local

# Edit .env.local
nano .env.local
```

**Required variables:**
```bash
# AI Provider (choose one)
OPENAI_API_KEY=sk-...                    # OpenAI (recommended)
# OR
ANTHROPIC_API_KEY=sk-ant-...             # Claude

# Supabase (your existing credentials)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Redis (optional - for chat history)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Remove these (we don't need web search)
# TAVILY_API_KEY=...
# SEARXNG_API_URL=...
# EXA_API_KEY=...
```

### Step 4: Test the Base Installation

```bash
# Run development server
bun dev

# Visit http://localhost:3000
```

You should see the Morphic interface. Now let's adapt it!

---

## Part 2: Replace Web Search with Destination Search

### Step 1: Create Supabase Client

Create `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseServiceKey)

export type Destination = {
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
  neighborhood: string | null
  architectural_style: string | null
  amenities: string[] | null
}
```

### Step 2: Create Destination Search Function

Create `lib/search-destinations.ts`:

```typescript
import { supabase, type Destination } from './supabase'

export interface SearchParams {
  query: string
  city?: string
  category?: string
  priceRange?: string
  vibes?: string[]
  limit?: number
}

export async function searchDestinations({
  query,
  city,
  category,
  priceRange,
  vibes,
  limit = 10
}: SearchParams): Promise<Destination[]> {
  let dbQuery = supabase
    .from('destinations')
    .select('*')

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

  // Filter by vibes (if vibe_tags column exists)
  if (vibes && vibes.length > 0) {
    dbQuery = dbQuery.contains('vibe_tags', vibes)
  }

  // Text search across multiple fields
  if (query) {
    dbQuery = dbQuery.or(
      `name.ilike.%${query}%,` +
      `content.ilike.%${query}%,` +
      `neighborhood.ilike.%${query}%,` +
      `architectural_style.ilike.%${query}%`
    )
  }

  // Order by rating (highest first)
  dbQuery = dbQuery.order('rating', { ascending: false })

  // Limit results
  dbQuery = dbQuery.limit(limit)

  const { data, error } = await dbQuery

  if (error) {
    console.error('Search error:', error)
    throw error
  }

  return data as Destination[]
}

// Get destination by slug
export async function getDestination(slug: string): Promise<Destination | null> {
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Get destination error:', error)
    return null
  }

  return data as Destination
}

// Get similar destinations
export async function getSimilarDestinations(
  slug: string,
  limit: number = 5
): Promise<Destination[]> {
  const destination = await getDestination(slug)
  if (!destination) return []

  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .eq('city', destination.city)
    .eq('category', destination.category)
    .neq('slug', slug)
    .limit(limit)

  if (error) {
    console.error('Similar destinations error:', error)
    return []
  }

  return data as Destination[]
}
```

### Step 3: Create Destination UI Components

Create `components/destination-card.tsx`:

```typescript
import Image from 'next/image'
import Link from 'next/link'
import { type Destination } from '@/lib/supabase'

export function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <Link 
      href={`/destination/${destination.slug}`}
      className="block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      {destination.main_image && (
        <div className="relative w-full h-48">
          <Image
            src={destination.main_image}
            alt={destination.name}
            fill
            className="object-cover"
          />
        </div>
      )}
      
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{destination.name}</h3>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          {destination.michelin_stars && (
            <span className="text-yellow-600">
              {'⭐'.repeat(destination.michelin_stars)} Michelin
            </span>
          )}
          <span>{destination.category}</span>
          <span>·</span>
          <span>{destination.city}</span>
        </div>

        {destination.vibe_tags && destination.vibe_tags.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-2">
            {destination.vibe_tags.slice(0, 3).map(tag => (
              <span 
                key={tag}
                className="text-xs px-2 py-1 bg-gray-100 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {destination.ai_summary && (
          <p className="text-sm text-gray-700 line-clamp-2">
            {destination.ai_summary}
          </p>
        )}

        {destination.price_range && (
          <div className="mt-2 text-sm font-medium text-gray-900">
            {destination.price_range}
          </div>
        )}
      </div>
    </Link>
  )
}
```

Create `components/destination-grid.tsx`:

```typescript
import { type Destination } from '@/lib/supabase'
import { DestinationCard } from './destination-card'

export function DestinationGrid({ destinations }: { destinations: Destination[] }) {
  if (destinations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No destinations found. Try a different search.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {destinations.map(destination => (
        <DestinationCard key={destination.slug} destination={destination} />
      ))}
    </div>
  )
}
```

### Step 4: Replace Search Tool in AI Actions

Find the file `lib/agents/search.tsx` (or similar) and replace with:

```typescript
import { createStreamableUI, createStreamableValue } from 'ai/rsc'
import { searchDestinations, type SearchParams } from '@/lib/search-destinations'
import { DestinationGrid } from '@/components/destination-grid'

export async function searchTool(params: SearchParams) {
  'use server'

  const streamableUI = createStreamableUI()
  const streamableText = createStreamableValue('')

  ;(async () => {
    // Show searching state
    streamableUI.update(
      <div className="flex items-center gap-2 text-gray-600">
        <div className="animate-spin">🔍</div>
        <span>Searching destinations...</span>
      </div>
    )

    try {
      // Search destinations
      const destinations = await searchDestinations(params)

      // Update with results
      streamableUI.done(
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Found {destinations.length} destinations
            </h2>
            {params.city && (
              <span className="text-sm text-gray-600">in {params.city}</span>
            )}
          </div>
          <DestinationGrid destinations={destinations} />
        </div>
      )

      // Generate AI summary
      const summary = generateSummary(destinations, params.query)
      streamableText.done(summary)
    } catch (error) {
      streamableUI.done(
        <div className="text-red-600">
          Error searching destinations. Please try again.
        </div>
      )
    }
  })()

  return {
    ui: streamableUI.value,
    text: streamableText.value
  }
}

function generateSummary(destinations: any[], query: string): string {
  if (destinations.length === 0) {
    return `I couldn't find any destinations matching "${query}". Try adjusting your search criteria.`
  }

  const cities = [...new Set(destinations.map(d => d.city))]
  const categories = [...new Set(destinations.map(d => d.category))]

  return `I found ${destinations.length} destinations${
    cities.length > 0 ? ` across ${cities.join(', ')}` : ''
  }. The results include ${categories.join(', ')}. ${
    destinations[0].name
  } is particularly noteworthy${
    destinations[0].michelin_stars
      ? ` with ${destinations[0].michelin_stars} Michelin star(s)`
      : ''
  }.`
}
```

### Step 5: Update AI System Prompt

Find `lib/agents/index.tsx` or similar and update the system prompt:

```typescript
const systemPrompt = `You are an expert travel advisor specializing in design-focused, 
curated destinations. You have access to a database of 921 carefully selected restaurants, 
cafes, hotels, bars, shops, and bakeries from around the world.

Your role is to:
1. Understand what the user is looking for
2. Search the destination database
3. Provide personalized recommendations
4. Explain why each destination matches their preferences

When searching, consider:
- Location (city, neighborhood)
- Category (restaurant, cafe, hotel, etc.)
- Vibe (cozy, modern, minimalist, luxurious, etc.)
- Price range
- Special features (Michelin stars, design awards, etc.)

Always be specific and explain your recommendations. Use the destination data to provide 
rich, detailed responses.`
```

### Step 6: Update Tools Configuration

Find where tools are defined (usually in `lib/agents/` or `app/api/chat/route.ts`) and replace the search tool:

```typescript
const tools = {
  searchDestinations: {
    description: 'Search for curated destinations (restaurants, cafes, hotels, etc.) in the Urban Manual database',
    parameters: z.object({
      query: z.string().describe('The search query or description of what the user wants'),
      city: z.string().optional().describe('Filter by city name'),
      category: z.enum(['Restaurant', 'Cafe', 'Hotel', 'Bar', 'Shop', 'Bakery']).optional(),
      priceRange: z.string().optional().describe('Price range like £, ££, £££'),
      vibes: z.array(z.string()).optional().describe('Vibe tags like "cozy", "modern", "minimalist"'),
      limit: z.number().default(10).describe('Maximum number of results')
    }),
    execute: searchTool
  },
  
  getDestinationDetails: {
    description: 'Get detailed information about a specific destination',
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
      limit: z.number().default(5)
    }),
    execute: async ({ slug, limit }: { slug: string; limit: number }) => {
      const similar = await getSimilarDestinations(slug, limit)
      return similar
    }
  }
}
```

---

## Part 3: Customize the UI

### Step 1: Update Homepage

Edit `app/page.tsx`:

```typescript
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Urban Manual Search</h1>
          <p className="text-gray-600">
            Discover 921 curated design-focused destinations worldwide
          </p>
        </div>

        <SearchInterface />

        <div className="grid grid-cols-2 gap-4">
          <ExampleQuery query="Find me a cozy cafe in Tokyo" />
          <ExampleQuery query="Michelin-starred restaurants in London" />
          <ExampleQuery query="Minimalist hotels in Paris" />
          <ExampleQuery query="Best design shops in Berlin" />
        </div>
      </div>
    </div>
  )
}
```

### Step 2: Update Branding

Edit `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: 'Urban Manual Search',
  description: 'AI-powered search for curated design destinations',
  // ... other metadata
}
```

### Step 3: Customize Example Queries

Edit the example queries to match Urban Manual's use cases:

```typescript
const exampleQueries = [
  "Find me a cozy cafe in Tokyo with good coffee",
  "Show me Michelin-starred restaurants in London under £100",
  "I want a minimalist hotel in Paris with a rooftop",
  "What are the best design-focused destinations in Berlin?",
  "Compare Sketch London vs The Wolseley",
  "Find restaurants similar to Crispin in Spitalfields"
]
```

---

## Part 4: Remove Unnecessary Features

### Remove Web Search Providers

```bash
# Remove Tavily
npm uninstall tavily

# Remove SearXNG config
rm searxng-settings.yml
rm searxng-limiter.toml

# Remove Exa
# (if installed)
```

### Clean Up Environment Variables

Remove from `.env.local`:
```bash
# Remove these lines
TAVILY_API_KEY=
SEARXNG_API_URL=
EXA_API_KEY=
FIRECRAWL_API_KEY=
```

### Remove Video Search

Find and remove video search components:
```bash
# Search for video-related files
find . -name "*video*" -type f

# Remove or comment out video search functionality
```

---

## Part 5: Add Urban Manual Specific Features

### Feature 1: Map View

Install Google Maps:
```bash
npm install @vis.gl/react-google-maps
```

Create `components/destination-map.tsx`:

```typescript
'use client'

import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps'
import { type Destination } from '@/lib/supabase'

export function DestinationMap({ destinations }: { destinations: Destination[] }) {
  if (destinations.length === 0) return null

  const center = {
    lat: destinations[0].latitude || 0,
    lng: destinations[0].longitude || 0
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
        <Map
          defaultCenter={center}
          defaultZoom={13}
          mapId="urban-manual-map"
        >
          {destinations.map(dest => (
            dest.latitude && dest.longitude && (
              <Marker
                key={dest.slug}
                position={{ lat: dest.latitude, lng: dest.longitude }}
                title={dest.name}
              />
            )
          ))}
        </Map>
      </APIProvider>
    </div>
  )
}
```

Add map tool to AI:

```typescript
{
  showMap: {
    description: 'Show destinations on an interactive map',
    parameters: z.object({
      destinations: z.array(z.any())
    }),
    execute: async ({ destinations }) => {
      return <DestinationMap destinations={destinations} />
    }
  }
}
```

### Feature 2: Filter Chips

Create `components/filter-chips.tsx`:

```typescript
'use client'

export function FilterChips({ 
  onFilterChange 
}: { 
  onFilterChange: (filters: any) => void 
}) {
  const categories = ['Restaurant', 'Cafe', 'Hotel', 'Bar', 'Shop', 'Bakery']
  const priceRanges = ['£', '££', '£££', '££££']
  const vibes = ['cozy', 'modern', 'minimalist', 'luxurious', 'rustic']

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        <span className="text-sm font-medium">Category:</span>
        {categories.map(cat => (
          <button
            key={cat}
            className="px-3 py-1 text-sm border rounded-full hover:bg-gray-100"
            onClick={() => onFilterChange({ category: cat })}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        <span className="text-sm font-medium">Price:</span>
        {priceRanges.map(price => (
          <button
            key={price}
            className="px-3 py-1 text-sm border rounded-full hover:bg-gray-100"
            onClick={() => onFilterChange({ priceRange: price })}
          >
            {price}
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        <span className="text-sm font-medium">Vibe:</span>
        {vibes.map(vibe => (
          <button
            key={vibe}
            className="px-3 py-1 text-sm border rounded-full hover:bg-gray-100"
            onClick={() => onFilterChange({ vibes: [vibe] })}
          >
            {vibe}
          </button>
        ))}
      </div>
    </div>
  )
}
```

### Feature 3: Comparison Table

Create `components/comparison-table.tsx`:

```typescript
import { type Destination } from '@/lib/supabase'

export function ComparisonTable({ destinations }: { destinations: Destination[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-4 text-left">Feature</th>
            {destinations.map(dest => (
              <th key={dest.slug} className="p-4 text-left">
                {dest.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="p-4 font-medium">Category</td>
            {destinations.map(dest => (
              <td key={dest.slug} className="p-4">{dest.category}</td>
            ))}
          </tr>
          <tr className="border-b">
            <td className="p-4 font-medium">Location</td>
            {destinations.map(dest => (
              <td key={dest.slug} className="p-4">{dest.city}</td>
            ))}
          </tr>
          <tr className="border-b">
            <td className="p-4 font-medium">Price Range</td>
            {destinations.map(dest => (
              <td key={dest.slug} className="p-4">{dest.price_range || 'N/A'}</td>
            ))}
          </tr>
          <tr className="border-b">
            <td className="p-4 font-medium">Michelin Stars</td>
            {destinations.map(dest => (
              <td key={dest.slug} className="p-4">
                {dest.michelin_stars ? '⭐'.repeat(dest.michelin_stars) : 'N/A'}
              </td>
            ))}
          </tr>
          <tr className="border-b">
            <td className="p-4 font-medium">Vibe</td>
            {destinations.map(dest => (
              <td key={dest.slug} className="p-4">
                {dest.vibe_tags?.slice(0, 2).join(', ') || 'N/A'}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
```

Add comparison tool:

```typescript
{
  compareDestinations: {
    description: 'Compare multiple destinations side by side',
    parameters: z.object({
      slugs: z.array(z.string()).describe('Array of destination slugs to compare')
    }),
    execute: async ({ slugs }) => {
      const destinations = await Promise.all(
        slugs.map(slug => getDestination(slug))
      )
      const validDestinations = destinations.filter(d => d !== null)
      return <ComparisonTable destinations={validDestinations} />
    }
  }
}
```

---

## Part 6: Deploy

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Settings → Environment Variables
```

### Option 2: Docker

```bash
# Build Docker image
docker build -t urban-manual-search .

# Run container
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=... \
  -e NEXT_PUBLIC_SUPABASE_URL=... \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  -e SUPABASE_SERVICE_ROLE_KEY=... \
  urban-manual-search
```

---

## Summary

### What You've Built:

✅ **Morphic-powered search** with generative UI
✅ **Your own destination data** from Supabase
✅ **AI-powered recommendations** and insights
✅ **Beautiful UI components** (cards, maps, filters)
✅ **Comparison tools** for destinations
✅ **Related searches** and follow-ups

### What's Different from Original Morphic:

- ❌ No web search (Tavily, SearXNG, Exa)
- ❌ No video search
- ✅ Supabase database search
- ✅ Destination-specific UI
- ✅ Map integration
- ✅ Filter chips
- ✅ Comparison tables

### Cost:

- **AI (OpenAI):** $20-50/month
- **Infrastructure:** $0 (Vercel free tier)
- **Total:** $20-50/month

---

## Next Steps

1. **Fork the repo** and set up locally
2. **Replace search** with Supabase queries
3. **Customize UI** for destinations
4. **Add Urban Manual features** (maps, filters, comparison)
5. **Deploy** to Vercel
6. **Test** with real queries

Would you like me to start implementing this? I can:
1. Fork and set up the repo
2. Implement the Supabase integration
3. Create the destination UI components
4. Deploy a working demo

Let me know!

