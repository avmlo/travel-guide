# Google APIs Implementation Guide for Urban Manual

**Date:** October 26, 2025
**Enabled APIs:** 16 Google APIs

## Overview

You have an excellent set of Google APIs enabled. This document outlines which APIs are most valuable for Urban Manual, how to implement them, and specific use cases with code examples.

---

## Priority Matrix

| Priority | API | Use Case | Complexity | Impact |
|----------|-----|----------|------------|--------|
| 🔥 **High** | Places API (New) | Enrich destinations, reviews, photos | Medium | Very High |
| 🔥 **High** | Geocoding API | Convert addresses to coordinates | Low | High |
| 🔥 **High** | Maps JavaScript API | Interactive maps | Medium | High |
| 🔥 **High** | Directions API | Route planning between destinations | Low | High |
| 🟡 **Medium** | Distance Matrix API | Calculate travel times | Low | Medium |
| 🟡 **Medium** | Time Zone API | Show local times | Low | Medium |
| 🟡 **Medium** | Maps Static API | Generate map thumbnails | Low | Medium |
| 🟢 **Low** | Geolocation API | User location detection | Low | Low |
| 🟢 **Low** | Routes API | Advanced routing | High | Medium |
| 🟢 **Low** | Roads API | Snap to roads | Low | Low |

---

## 1. Places API (New) - 🔥 HIGHEST PRIORITY

### What It Does
The new Places API provides comprehensive information about destinations including:
- Business details (hours, phone, website)
- User reviews and ratings
- High-quality photos
- Real-time popularity data
- Price levels

### Why Implement First
This is the **most valuable API** for Urban Manual because it can:
- Automatically enrich your 921 destinations with accurate data
- Keep information up-to-date
- Add social proof (reviews, ratings)
- Provide high-quality images

### Implementation

#### Step 1: Install SDK
```bash
pnpm add @googlemaps/places
```

#### Step 2: Create Places Service
Create: `lib/google-places.ts`

```typescript
import { PlacesClient } from '@googlemaps/places'

const placesClient = new PlacesClient({
  apiKey: process.env.GOOGLE_PLACES_API_KEY!,
})

export async function enrichDestination(name: string, city: string) {
  try {
    // Search for the place
    const searchResponse = await placesClient.searchText({
      textQuery: `${name} ${city}`,
      fields: [
        'places.id',
        'places.displayName',
        'places.formattedAddress',
        'places.location',
        'places.rating',
        'places.userRatingCount',
        'places.priceLevel',
        'places.websiteUri',
        'places.internationalPhoneNumber',
        'places.regularOpeningHours',
        'places.photos',
        'places.reviews',
        'places.types',
      ],
    })

    const place = searchResponse.places?.[0]
    if (!place) return null

    return {
      placeId: place.id,
      name: place.displayName?.text,
      address: place.formattedAddress,
      coordinates: {
        lat: place.location?.latitude,
        lng: place.location?.longitude,
      },
      rating: place.rating,
      totalReviews: place.userRatingCount,
      priceLevel: place.priceLevel,
      website: place.websiteUri,
      phone: place.internationalPhoneNumber,
      openingHours: place.regularOpeningHours?.weekdayDescriptions,
      photos: place.photos?.map(photo => ({
        name: photo.name,
        widthPx: photo.widthPx,
        heightPx: photo.heightPx,
        // Use the photo reference to get the actual image
        url: `https://places.googleapis.com/v1/${photo.name}/media?key=${process.env.GOOGLE_PLACES_API_KEY}&maxWidthPx=1200`,
      })),
      reviews: place.reviews?.map(review => ({
        author: review.authorAttribution?.displayName,
        rating: review.rating,
        text: review.text?.text,
        time: review.publishTime,
      })),
      types: place.types,
    }
  } catch (error) {
    console.error('Error enriching destination:', error)
    return null
  }
}
```

#### Step 3: Create Enrichment API Route
Create: `app/api/enrich-destination/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { enrichDestination } from '@/lib/google-places'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { slug } = await request.json()
  const supabase = createClient()

  // Get destination from database
  const { data: destination } = await supabase
    .from('destinations')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!destination) {
    return NextResponse.json({ error: 'Destination not found' }, { status: 404 })
  }

  // Enrich with Google Places data
  const enrichedData = await enrichDestination(destination.name, destination.city)

  if (!enrichedData) {
    return NextResponse.json({ error: 'Could not enrich destination' }, { status: 500 })
  }

  // Update database
  const { data: updated } = await supabase
    .from('destinations')
    .update({
      google_place_id: enrichedData.placeId,
      address: enrichedData.address,
      latitude: enrichedData.coordinates.lat,
      longitude: enrichedData.coordinates.lng,
      rating: enrichedData.rating,
      total_reviews: enrichedData.totalReviews,
      price_level: enrichedData.priceLevel,
      website: enrichedData.website,
      phone: enrichedData.phone,
      opening_hours: enrichedData.openingHours,
      google_photos: enrichedData.photos,
      google_reviews: enrichedData.reviews,
      last_enriched: new Date().toISOString(),
    })
    .eq('slug', slug)
    .select()
    .single()

  return NextResponse.json({ success: true, data: updated })
}
```

#### Step 4: Bulk Enrichment Script
Create: `scripts/enrich-all-destinations.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import { enrichDestination } from '../lib/google-places'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function enrichAll() {
  // Fetch all destinations
  const { data: destinations } = await supabase
    .from('destinations')
    .select('slug, name, city')
    .is('google_place_id', null) // Only enrich those not yet enriched

  console.log(`Enriching ${destinations?.length} destinations...`)

  for (const dest of destinations || []) {
    console.log(`Enriching: ${dest.name}`)
    
    const enrichedData = await enrichDestination(dest.name, dest.city)
    
    if (enrichedData) {
      await supabase
        .from('destinations')
        .update({
          google_place_id: enrichedData.placeId,
          address: enrichedData.address,
          latitude: enrichedData.coordinates.lat,
          longitude: enrichedData.coordinates.lng,
          rating: enrichedData.rating,
          total_reviews: enrichedData.totalReviews,
          website: enrichedData.website,
          phone: enrichedData.phone,
        })
        .eq('slug', dest.slug)
      
      console.log(`✅ Enriched: ${dest.name}`)
    } else {
      console.log(`❌ Failed: ${dest.name}`)
    }

    // Rate limiting: Wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log('✅ All destinations enriched!')
}

enrichAll()
```

### Use Cases in UI

#### Show Reviews
```typescript
// components/DestinationReviews.tsx
export function DestinationReviews({ reviews }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Reviews</h3>
      {reviews?.map((review, i) => (
        <div key={i} className="border-b pb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">{review.author}</span>
            <span className="text-yellow-500">{'⭐'.repeat(review.rating)}</span>
          </div>
          <p className="text-gray-600">{review.text}</p>
        </div>
      ))}
    </div>
  )
}
```

---

## 2. Geocoding API - 🔥 HIGH PRIORITY

### What It Does
Converts addresses to coordinates (and vice versa).

### Why Implement
- Map destinations accurately
- Enable location-based search
- Calculate distances

### Implementation

Create: `lib/geocoding.ts`

```typescript
export async function geocodeAddress(address: string) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
  )
  const data = await response.json()
  
  if (data.results?.[0]) {
    const { lat, lng } = data.results[0].geometry.location
    return { lat, lng, formattedAddress: data.results[0].formatted_address }
  }
  
  return null
}

export async function reverseGeocode(lat: number, lng: number) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`
  )
  const data = await response.json()
  
  return data.results?.[0]?.formatted_address || null
}
```

### Use Cases
- Geocode all destinations on import
- Show "Near Me" functionality
- Display destinations on map

---

## 3. Maps JavaScript API - 🔥 HIGH PRIORITY

### What It Does
Interactive, customizable maps for your website.

### Why Implement
- Show destinations on interactive map
- Cluster nearby destinations
- Custom map styling to match Urban Manual aesthetic

### Implementation

#### Step 1: Install Package
```bash
pnpm add @vis.gl/react-google-maps
```

#### Step 2: Create Map Component
Create: `components/DestinationMap.tsx`

```typescript
'use client'

import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps'

interface Destination {
  id: string
  name: string
  latitude: number
  longitude: number
  category: string
}

export function DestinationMap({ destinations }: { destinations: Destination[] }) {
  const center = destinations[0] 
    ? { lat: destinations[0].latitude, lng: destinations[0].longitude }
    : { lat: 51.5074, lng: -0.1278 } // Default to London

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <Map
        defaultCenter={center}
        defaultZoom={12}
        mapId="urban-manual-map" // Create this in Google Cloud Console
        style={{ width: '100%', height: '600px' }}
        gestureHandling="greedy"
        disableDefaultUI={false}
      >
        {destinations.map((dest) => (
          <AdvancedMarker
            key={dest.id}
            position={{ lat: dest.latitude, lng: dest.longitude }}
            title={dest.name}
          >
            <Pin
              background={getCategoryColor(dest.category)}
              borderColor="#000"
              glyphColor="#fff"
            />
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  )
}

function getCategoryColor(category: string) {
  const colors = {
    restaurant: '#ef4444',
    cafe: '#f59e0b',
    hotel: '#3b82f6',
    bar: '#8b5cf6',
    shop: '#10b981',
    bakery: '#ec4899',
  }
  return colors[category] || '#6b7280'
}
```

#### Step 3: Add to Destination Page
```typescript
// app/destinations/[slug]/page.tsx
import { DestinationMap } from '@/components/DestinationMap'

export default async function DestinationPage({ params }) {
  const destination = await getDestination(params.slug)
  
  return (
    <div>
      {/* ... other content ... */}
      
      <DestinationMap destinations={[destination]} />
    </div>
  )
}
```

### Advanced: City Overview Map
```typescript
// app/cities/[city]/page.tsx
export default async function CityPage({ params }) {
  const destinations = await getDestinationsByCity(params.city)
  
  return (
    <div>
      <h1>{params.city}</h1>
      <DestinationMap destinations={destinations} />
    </div>
  )
}
```

---

## 4. Directions API - 🔥 HIGH PRIORITY

### What It Does
Calculate routes between destinations.

### Why Implement
- Create multi-destination itineraries
- Show walking/transit directions
- Calculate travel time between spots

### Implementation

Create: `lib/directions.ts`

```typescript
export async function getDirections(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  mode: 'walking' | 'driving' | 'transit' | 'bicycling' = 'walking'
) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=${mode}&key=${process.env.GOOGLE_MAPS_API_KEY}`
  )
  const data = await response.json()
  
  if (data.routes?.[0]) {
    const route = data.routes[0]
    const leg = route.legs[0]
    
    return {
      distance: leg.distance.text,
      duration: leg.duration.text,
      steps: leg.steps.map(step => ({
        instruction: step.html_instructions,
        distance: step.distance.text,
        duration: step.duration.text,
      })),
      polyline: route.overview_polyline.points,
    }
  }
  
  return null
}
```

### Use Case: Itinerary Builder
```typescript
// components/ItineraryBuilder.tsx
export function ItineraryBuilder({ destinations }) {
  const [routes, setRoutes] = useState([])
  
  async function calculateRoutes() {
    const newRoutes = []
    
    for (let i = 0; i < destinations.length - 1; i++) {
      const route = await getDirections(
        { lat: destinations[i].latitude, lng: destinations[i].longitude },
        { lat: destinations[i + 1].latitude, lng: destinations[i + 1].longitude }
      )
      newRoutes.push(route)
    }
    
    setRoutes(newRoutes)
  }
  
  return (
    <div>
      <button onClick={calculateRoutes}>Calculate Route</button>
      {routes.map((route, i) => (
        <div key={i}>
          <p>{destinations[i].name} → {destinations[i + 1].name}</p>
          <p>{route.distance} • {route.duration}</p>
        </div>
      ))}
    </div>
  )
}
```

---

## 5. Distance Matrix API - 🟡 MEDIUM PRIORITY

### What It Does
Calculate distances and travel times between multiple origins and destinations.

### Why Implement
- "Destinations near this one"
- Sort by distance from user
- Optimize itinerary order

### Implementation

```typescript
export async function getDistanceMatrix(
  origins: Array<{ lat: number; lng: number }>,
  destinations: Array<{ lat: number; lng: number }>
) {
  const originsStr = origins.map(o => `${o.lat},${o.lng}`).join('|')
  const destinationsStr = destinations.map(d => `${d.lat},${d.lng}`).join('|')
  
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originsStr}&destinations=${destinationsStr}&mode=walking&key=${process.env.GOOGLE_MAPS_API_KEY}`
  )
  const data = await response.json()
  
  return data.rows.map((row, i) => ({
    origin: origins[i],
    distances: row.elements.map((el, j) => ({
      destination: destinations[j],
      distance: el.distance?.text,
      duration: el.duration?.text,
      distanceValue: el.distance?.value, // in meters
      durationValue: el.duration?.value, // in seconds
    })),
  }))
}
```

### Use Case: Find Nearby Destinations
```typescript
// app/api/nearby/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  
  const destination = await getDestination(slug)
  const allDestinations = await getAllDestinations()
  
  // Calculate distances
  const distances = await getDistanceMatrix(
    [{ lat: destination.latitude, lng: destination.longitude }],
    allDestinations.map(d => ({ lat: d.latitude, lng: d.longitude }))
  )
  
  // Sort by distance
  const nearby = allDestinations
    .map((dest, i) => ({
      ...dest,
      distance: distances[0].distances[i].distanceValue,
      walkingTime: distances[0].distances[i].duration,
    }))
    .filter(d => d.distance < 1000) // Within 1km
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5)
  
  return NextResponse.json(nearby)
}
```

---

## 6. Time Zone API - 🟡 MEDIUM PRIORITY

### What It Does
Get the time zone for any location.

### Why Implement
- Show local time for destinations
- Display opening hours in local time
- Useful for international travelers

### Implementation

```typescript
export async function getTimeZone(lat: number, lng: number) {
  const timestamp = Math.floor(Date.now() / 1000)
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${process.env.GOOGLE_MAPS_API_KEY}`
  )
  const data = await response.json()
  
  return {
    timeZoneId: data.timeZoneId,
    timeZoneName: data.timeZoneName,
    rawOffset: data.rawOffset,
    dstOffset: data.dstOffset,
  }
}

export function getLocalTime(lat: number, lng: number) {
  const tz = await getTimeZone(lat, lng)
  const now = new Date()
  const localTime = new Date(now.getTime() + (tz.rawOffset + tz.dstOffset) * 1000)
  
  return localTime.toLocaleTimeString('en-US', { 
    timeZone: tz.timeZoneId,
    hour: '2-digit',
    minute: '2-digit'
  })
}
```

---

## 7. Maps Static API - 🟡 MEDIUM PRIORITY

### What It Does
Generate static map images.

### Why Implement
- Social media preview images
- Email thumbnails
- Fast loading placeholders

### Implementation

```typescript
export function getStaticMapUrl(
  lat: number,
  lng: number,
  zoom: number = 15,
  width: number = 600,
  height: number = 400
) {
  const markers = `markers=color:red%7C${lat},${lng}`
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&${markers}&key=${process.env.GOOGLE_MAPS_API_KEY}`
}
```

### Use Case: OG Images
```typescript
// app/destinations/[slug]/opengraph-image.tsx
export default async function Image({ params }) {
  const destination = await getDestination(params.slug)
  
  const mapUrl = getStaticMapUrl(
    destination.latitude,
    destination.longitude,
    14,
    1200,
    630
  )
  
  return new ImageResponse(
    (
      <div style={{ display: 'flex' }}>
        <img src={mapUrl} alt="Map" />
      </div>
    )
  )
}
```

---

## Implementation Priority & Timeline

### Week 1: Foundation
1. ✅ Places API (New) - Enrich all destinations
2. ✅ Geocoding API - Add coordinates to all destinations

### Week 2: Interactive Features  
3. ✅ Maps JavaScript API - Add interactive maps
4. ✅ Directions API - Itinerary builder

### Week 3: Enhancement
5. ✅ Distance Matrix API - Nearby destinations
6. ✅ Time Zone API - Local times
7. ✅ Maps Static API - Social previews

---

## Cost Estimation

| API | Free Tier | Estimated Monthly Cost |
|-----|-----------|------------------------|
| Places API (New) | $200 credit | ~$50 (after enrichment) |
| Geocoding | 40,000 requests | $0 (within free tier) |
| Maps JavaScript | 28,000 loads | $0 (within free tier) |
| Directions | 40,000 requests | $0 (within free tier) |
| Distance Matrix | 40,000 elements | $0 (within free tier) |
| Time Zone | 40,000 requests | $0 (within free tier) |
| Maps Static | 28,000 loads | $0 (within free tier) |
| **Total** | **$200/month credit** | **~$0-50/month** |

**Note:** Google provides $200 free credit monthly, which covers most use cases.

---

## Next Steps

Would you like me to:
1. **Start with Places API enrichment** - Enrich all 921 destinations
2. **Implement interactive maps** - Add Maps JavaScript API
3. **Build itinerary planner** - Use Directions API
4. **Create a complete implementation** - All APIs together

Let me know which API you'd like to implement first, and I'll create a detailed step-by-step guide!

