# Morphic Analysis: Building AI-Powered Search for Urban Manual

**Date:** October 26, 2025
**Source:** https://github.com/miurla/morphic & https://morphic.sh

---

## Overview

Morphic is an **AI-powered search engine with a generative UI** that provides interactive, conversational search experiences. It's perfect inspiration for Urban Manual's destination search.

---

## Key Features Observed

### 1. **Generative UI Components**

**What it does:**
- AI generates dynamic UI components based on search results
- Shows images, charts, source cards, and text in a structured layout
- Real-time streaming of results as they're generated

**Example from demo:**
- Query: "Why is Nvidia growing rapidly?"
- Generated:
  - Search query chip: "Nvidia growth reasons 2023"
  - Image carousel (4 charts/graphs)
  - Source cards (3 articles with titles and links)
  - Structured text response with sections
  - Related questions at the bottom

### 2. **Search Modes**

**Two modes available:**
- **Speed Mode** - Fast responses
- **Search Mode** - More comprehensive, web search included

### 3. **Interactive Elements**

- **Related Questions** - AI suggests follow-up questions
- **Source Cards** - Clickable cards showing where info came from
- **Image Results** - Visual content displayed prominently
- **Copy/Retry** - Actions on each response
- **Follow-up Chat** - Continue conversation in context

### 4. **Real-time Streaming**

- Results stream in real-time
- Shows "Searching..." state
- Progressive enhancement of UI as data arrives

---

## Tech Stack (from GitHub)

### Core Framework
- **Next.js 15** - App Router, React Server Components
- **TypeScript** - Type safety
- **Vercel AI SDK** - Text streaming / Generative UI
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library

### AI & Search
- **OpenAI** - Default AI provider
- **Tavily AI** - Default search provider
- **SearXNG** - Alternative self-hosted search
- **Exa** - Neural search
- **Firecrawl** - Web scraping

### Authentication
- **Supabase Auth** - User authentication
- Email/Password + Google OAuth

### Data Storage
- **Upstash Redis** - Chat history
- **Supabase** - User data

### Key Libraries
- `ai` - Vercel AI SDK
- `@ai-sdk/openai` - OpenAI integration
- `@ai-sdk/anthropic` - Claude integration
- `tavily` - Search API
- `@supabase/supabase-js` - Database
- `@upstash/redis` - Redis client

---

## Architecture

```
User Query
    ↓
Next.js Server Action
    ↓
AI Provider (OpenAI/Claude)
    ↓
Search Provider (Tavily/SearXNG)
    ↓
Generative UI Components (RSC)
    ↓
Stream to Client
    ↓
Interactive UI
```

---

## Key Files (from GitHub)

### Core Components
- `app/` - Next.js app directory
- `components/` - React components
- `lib/` - Utility functions
- `public/config/models.json` - Model configuration

### Important Features
- **Generative UI** - AI creates UI components dynamically
- **RSC (React Server Components)** - Server-side rendering
- **Streaming** - Real-time response streaming
- **Tool Calling** - AI can invoke search tools

---

## What Makes Morphic Special

### 1. **Generative UI**
Instead of just text responses, AI generates:
- Image grids
- Source cards
- Charts/graphs
- Structured layouts
- Interactive elements

### 2. **Conversational Search**
- Follow-up questions
- Context awareness
- Related queries
- Natural language

### 3. **Source Transparency**
- Shows where information comes from
- Clickable source cards
- Image attribution
- "View more" for additional sources

### 4. **Speed vs Depth**
- Speed mode: Quick answers
- Search mode: Comprehensive research

---

## How to Adapt for Urban Manual

### Concept: "Urban Search" - AI-Powered Destination Discovery

**User Query Examples:**
- "Find me a cozy cafe in Tokyo with good coffee"
- "Show me Michelin-starred restaurants in London under £100"
- "I want a minimalist hotel in Paris with a rooftop"
- "What are the best design-focused destinations in Berlin?"

### Generative UI Components for Urban Manual

#### 1. **Destination Cards**
```
┌─────────────────────────────────┐
│  [Image]                        │
│  Sketch London                  │
│  ⭐⭐⭐ Michelin                │
│  Restaurant · Mayfair           │
│  "Modern British cuisine..."    │
│  [View Details]                 │
└─────────────────────────────────┘
```

#### 2. **Map View**
```
┌─────────────────────────────────┐
│  Interactive Map                │
│  • Pins for each destination    │
│  • Cluster nearby locations     │
│  • Click to see details         │
└─────────────────────────────────┘
```

#### 3. **Filter Chips**
```
[Michelin ⭐] [Cozy 🏠] [Modern 🎨] [£££]
```

#### 4. **Comparison Table**
```
┌──────────┬──────────┬──────────┐
│ Sketch   │ Crispin  │ Kiln     │
│ £££      │ ££       │ ££       │
│ ⭐⭐⭐  │ ⭐       │ ⭐       │
└──────────┴──────────┴──────────┘
```

#### 5. **Related Searches**
```
→ Similar restaurants in Mayfair
→ Other Michelin-starred in London
→ Restaurants with afternoon tea
```

---

## Implementation Plan for Urban Manual

### Phase 1: Core Search (Week 1-2)

**Setup:**
```bash
# Install dependencies
pnpm add ai @ai-sdk/openai @ai-sdk/anthropic
pnpm add @supabase/supabase-js
pnpm add @upstash/redis
```

**Create Search API:**
```typescript
// app/api/search/route.ts
import { createAI, getMutableAIState, streamUI } from 'ai/rsc'
import { openai } from '@ai-sdk/openai'

export async function POST(req: Request) {
  const { query } = await req.json()
  
  const result = await streamUI({
    model: openai('gpt-4o'),
    messages: [
      {
        role: 'system',
        content: 'You are an expert in finding design-focused destinations.'
      },
      {
        role: 'user',
        content: query
      }
    ],
    text: ({ content }) => <SearchResults content={content} />,
    tools: {
      searchDestinations: {
        description: 'Search for destinations in the database',
        parameters: z.object({
          query: z.string(),
          city: z.string().optional(),
          category: z.string().optional(),
          priceRange: z.string().optional()
        }),
        generate: async function* ({ query, city, category, priceRange }) {
          yield <SearchingState query={query} />
          
          // Query Supabase
          const destinations = await searchSupabase({
            query,
            city,
            category,
            priceRange
          })
          
          return <DestinationGrid destinations={destinations} />
        }
      }
    }
  })
  
  return result.toAIStreamResponse()
}
```

### Phase 2: Generative UI Components (Week 3-4)

**Destination Card Component:**
```typescript
// components/search/DestinationCard.tsx
export function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition">
      <img 
        src={destination.main_image} 
        alt={destination.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-bold text-lg">{destination.name}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {destination.michelin_stars && (
            <span>{'⭐'.repeat(destination.michelin_stars)} Michelin</span>
          )}
          <span>{destination.category}</span>
          <span>·</span>
          <span>{destination.city}</span>
        </div>
        <p className="text-sm mt-2 line-clamp-2">{destination.ai_summary}</p>
        <Link href={`/${destination.slug}`} className="mt-4 btn-primary">
          View Details
        </Link>
      </div>
    </div>
  )
}
```

**Map Component:**
```typescript
// components/search/DestinationMap.tsx
'use client'

export function DestinationMap({ destinations }: { destinations: Destination[] }) {
  return (
    <div className="w-full h-96 rounded-lg overflow-hidden">
      <GoogleMap
        center={{ lat: destinations[0].latitude, lng: destinations[0].longitude }}
        zoom={13}
      >
        {destinations.map(dest => (
          <Marker
            key={dest.slug}
            position={{ lat: dest.latitude, lng: dest.longitude }}
            onClick={() => showDestinationPopup(dest)}
          />
        ))}
      </GoogleMap>
    </div>
  )
}
```

### Phase 3: Advanced Features (Week 5-6)

**AI-Powered Recommendations:**
```typescript
tools: {
  getRecommendations: {
    description: 'Get personalized recommendations based on user preferences',
    parameters: z.object({
      vibes: z.array(z.string()),
      priceRange: z.string(),
      occasion: z.string()
    }),
    generate: async function* ({ vibes, priceRange, occasion }) {
      yield <ThinkingState message="Finding perfect matches..." />
      
      // Use AI embeddings for semantic search
      const recommendations = await semanticSearch({
        vibes,
        priceRange,
        occasion
      })
      
      return <RecommendationGrid destinations={recommendations} />
    }
  },
  
  compareDestinations: {
    description: 'Compare multiple destinations side by side',
    parameters: z.object({
      slugs: z.array(z.string())
    }),
    generate: async function* ({ slugs }) {
      const destinations = await getDestinations(slugs)
      return <ComparisonTable destinations={destinations} />
    }
  }
}
```

---

## Key Differences: Morphic vs Urban Manual

| Feature | Morphic | Urban Manual |
|---------|---------|--------------|
| **Search Domain** | General web | Curated destinations |
| **Data Source** | Web scraping | Supabase database |
| **Results** | Articles, images | Destinations, venues |
| **UI Components** | Text, images, sources | Cards, maps, filters |
| **Follow-up** | Related questions | Similar destinations |
| **Authentication** | Optional | Required for saves |

---

## Cost Estimate

### Using Morphic's Stack:

**AI Costs (OpenAI):**
- GPT-4o: $2.50 / 1M input tokens
- GPT-4o-mini: $0.15 / 1M input tokens
- Estimated: $20-50/month for 1,000 searches

**Search Costs:**
- Tavily: Free tier (1,000 searches/month)
- Paid: $50/month for 10,000 searches

**Infrastructure:**
- Vercel: Free tier (hobby)
- Supabase: Free tier
- Upstash Redis: Free tier (10K commands/day)

**Total:** $0-100/month depending on usage

---

## Recommended Approach for Urban Manual

### Option 1: Full Morphic Clone (Complex)
- Fork Morphic repository
- Adapt for destinations instead of web search
- Replace Tavily with Supabase queries
- Customize UI components

**Pros:**
- ✅ Full generative UI
- ✅ Proven architecture
- ✅ Advanced features

**Cons:**
- ❌ Complex setup
- ❌ Requires AI expertise
- ❌ Higher costs

### Option 2: Morphic-Inspired (Recommended)
- Build custom search with Vercel AI SDK
- Use generative UI for results
- Keep existing Urban Manual design
- Add AI-powered recommendations

**Pros:**
- ✅ Simpler implementation
- ✅ Matches existing design
- ✅ Lower costs
- ✅ Easier to maintain

**Cons:**
- ⚠️ Less advanced than full Morphic
- ⚠️ Need to build some features from scratch

### Option 3: Hybrid (Best of Both)
- Use Morphic's AI SDK patterns
- Keep Urban Manual's existing UI
- Add generative components selectively
- Integrate with existing search

**Pros:**
- ✅ Best of both worlds
- ✅ Incremental implementation
- ✅ Flexible approach

**Cons:**
- ⚠️ Requires careful integration

---

## Next Steps

Would you like me to:
1. **Build a Morphic-inspired search** for Urban Manual?
2. **Create a proof-of-concept** with generative UI?
3. **Implement AI-powered recommendations** using Vercel AI SDK?
4. **Design the search UI** with generative components?

Let me know which direction you'd like to explore!

