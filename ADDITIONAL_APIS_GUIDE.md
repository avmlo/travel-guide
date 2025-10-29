# Additional APIs for Urban Manual

**Date:** October 26, 2025
**Focus:** Free/Affordable APIs to enhance Urban Manual

## Overview

Beyond Google Maps APIs, there are numerous other APIs that can significantly enhance Urban Manual's functionality. This guide categorizes them by use case and provides implementation examples.

---

## 1. Travel & Location APIs

### 1.1. Foursquare Places API

**What it does:** Rich venue data, tips, photos, and recommendations.

**Why use it:**
- 105M+ venues worldwide
- User tips and recommendations
- Venue photos
- Popularity data
- Categories and tags

**Free Tier:**
- 50,000 API calls/day
- All endpoints included

**Integration:**
```typescript
// lib/foursquare.ts
const FOURSQUARE_API_KEY = process.env.FOURSQUARE_API_KEY

export async function searchVenue(name: string, location: string) {
  const response = await fetch(
    `https://api.foursquare.com/v3/places/search?query=${name}&near=${location}`,
    {
      headers: {
        'Authorization': FOURSQUARE_API_KEY,
      }
    }
  )
  return response.json()
}

export async function getVenueDetails(fsqId: string) {
  const response = await fetch(
    `https://api.foursquare.com/v3/places/${fsqId}`,
    {
      headers: {
        'Authorization': FOURSQUARE_API_KEY,
      }
    }
  )
  return response.json()
}

export async function getVenueTips(fsqId: string) {
  const response = await fetch(
    `https://api.foursquare.com/v3/places/${fsqId}/tips`,
    {
      headers: {
        'Authorization': FOURSQUARE_API_KEY,
      }
    }
  )
  return response.json()
}
```

**Use Cases:**
- Get user tips and recommendations
- Find similar venues
- Get venue photos
- Verify venue information

---

### 1.2. Yelp Fusion API

**What it does:** Business data, reviews, ratings, and photos.

**Why use it:**
- Extensive review database
- High-quality photos
- Business hours and attributes
- Price levels
- User ratings

**Free Tier:**
- 5,000 API calls/day
- All endpoints

**Integration:**
```typescript
// lib/yelp.ts
const YELP_API_KEY = process.env.YELP_API_KEY

export async function searchBusiness(name: string, location: string) {
  const response = await fetch(
    `https://api.yelp.com/v3/businesses/search?term=${name}&location=${location}`,
    {
      headers: {
        'Authorization': `Bearer ${YELP_API_KEY}`,
      }
    }
  )
  return response.json()
}

export async function getBusinessDetails(businessId: string) {
  const response = await fetch(
    `https://api.yelp.com/v3/businesses/${businessId}`,
    {
      headers: {
        'Authorization': `Bearer ${YELP_API_KEY}`,
      }
    }
  )
  return response.json()
}

export async function getBusinessReviews(businessId: string) {
  const response = await fetch(
    `https://api.yelp.com/v3/businesses/${businessId}/reviews`,
    {
      headers: {
        'Authorization': `Bearer ${YELP_API_KEY}`,
      }
    }
  )
  return response.json()
}
```

**Use Cases:**
- Aggregate reviews from multiple sources
- Get business photos
- Verify business information
- Show ratings and reviews

---

### 1.3. OpenWeatherMap API

**What it does:** Weather data for any location.

**Why use it:**
- Current weather
- 5-day forecast
- Historical data
- Weather alerts

**Free Tier:**
- 1,000 API calls/day
- Current weather + forecasts

**Integration:**
```typescript
// lib/weather.ts
const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY

export async function getCurrentWeather(lat: number, lon: number) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
  )
  return response.json()
}

export async function getForecast(lat: number, lon: number) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
  )
  return response.json()
}
```

**Use Cases:**
- Show weather at destination
- Suggest indoor/outdoor activities based on weather
- Display in destination cards
- Travel planning

---

### 1.4. Amadeus Travel API

**What it does:** Flight, hotel, and travel data.

**Why use it:**
- Flight search
- Hotel search
- Airport information
- Travel recommendations

**Free Tier:**
- 2,000 API calls/month
- All endpoints (test environment)

**Use Cases:**
- Show nearby hotels
- Flight information
- Travel planning
- Airport transfers

---

## 2. Content & Media APIs

### 2.1. Unsplash API

**What it does:** High-quality free stock photos.

**Why use it:**
- 3M+ high-resolution photos
- Free to use
- Curated collections
- Search by keyword

**Free Tier:**
- 50 requests/hour
- Unlimited for demo apps

**Integration:**
```typescript
// lib/unsplash.ts
import { createApi } from 'unsplash-js'

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY!,
})

export async function searchPhotos(query: string, perPage: number = 10) {
  const result = await unsplash.search.getPhotos({
    query,
    perPage,
    orientation: 'landscape',
  })
  
  return result.response?.results.map(photo => ({
    id: photo.id,
    url: photo.urls.regular,
    thumbnail: photo.urls.small,
    photographer: photo.user.name,
    downloadUrl: photo.links.download_location,
  }))
}
```

**Use Cases:**
- Placeholder images for destinations without photos
- City/location background images
- Blog post images
- Social media content

---

### 2.2. Pexels API

**What it does:** Free stock photos and videos.

**Why use it:**
- High-quality media
- Videos included
- Curated collections
- No attribution required

**Free Tier:**
- Unlimited requests
- Rate limited to 200/hour

**Integration:**
```typescript
// lib/pexels.ts
const PEXELS_API_KEY = process.env.PEXELS_API_KEY

export async function searchPhotos(query: string, perPage: number = 15) {
  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${query}&per_page=${perPage}`,
    {
      headers: {
        'Authorization': PEXELS_API_KEY,
      }
    }
  )
  return response.json()
}

export async function getCuratedPhotos(perPage: number = 15) {
  const response = await fetch(
    `https://api.pexels.com/v1/curated?per_page=${perPage}`,
    {
      headers: {
        'Authorization': PEXELS_API_KEY,
      }
    }
  )
  return response.json()
}
```

**Use Cases:**
- Destination background images
- City hero images
- Category illustrations
- Blog content

---

### 2.3. Giphy API

**What it does:** GIFs and stickers.

**Why use it:**
- Animated content
- Reactions
- Stickers
- Trending GIFs

**Free Tier:**
- 42 requests/hour
- All endpoints

**Use Cases:**
- Fun loading states
- Social features
- Reactions to destinations
- Animated content

---

## 3. AI & Machine Learning APIs

### 3.1. OpenAI API (Already Using!)

**Additional Use Cases:**
- **GPT-4 Vision**: Analyze destination photos
- **DALL-E 3**: Generate custom destination images
- **Embeddings**: Semantic search
- **Whisper**: Audio transcription (user reviews)

**New Implementation Ideas:**
```typescript
// lib/openai-vision.ts
import OpenAI from 'openai'

const openai = new OpenAI()

export async function analyzeDestinationPhoto(imageUrl: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Analyze this destination photo. Describe the atmosphere, design style, and key visual elements." },
          { type: "image_url", image_url: { url: imageUrl } }
        ],
      },
    ],
  })
  
  return response.choices[0].message.content
}

export async function generateDestinationImage(prompt: string) {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: `A beautiful, editorial-style photo of ${prompt}. Minimalist, clean, high-end aesthetic.`,
    size: "1792x1024",
    quality: "hd",
  })
  
  return response.data[0].url
}
```

---

### 3.2. Anthropic Claude API

**What it does:** Advanced AI assistant (alternative to OpenAI).

**Why use it:**
- Longer context window (200K tokens)
- Better at analysis
- Strong reasoning
- Vision capabilities

**Free Tier:**
- $5 free credit

**Use Cases:**
- Analyze long destination descriptions
- Generate detailed travel guides
- Compare multiple destinations
- Extract structured data

---

### 3.3. Hugging Face API

**What it does:** Access to thousands of AI models.

**Why use it:**
- Image classification
- Sentiment analysis
- Text summarization
- Translation

**Free Tier:**
- 30,000 requests/month

**Integration:**
```typescript
// lib/huggingface.ts
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY

export async function classifyImage(imageUrl: string) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/google/vit-base-patch16-224",
    {
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
      },
      method: "POST",
      body: JSON.stringify({ inputs: imageUrl }),
    }
  )
  return response.json()
}

export async function analyzeSentiment(text: string) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english",
    {
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
      },
      method: "POST",
      body: JSON.stringify({ inputs: text }),
    }
  )
  return response.json()
}
```

**Use Cases:**
- Classify destination photos
- Analyze review sentiment
- Translate descriptions
- Summarize long content

---

## 4. Social & Communication APIs

### 4.1. Instagram Basic Display API

**What it does:** Access Instagram photos and profile data.

**Why use it:**
- Show Instagram feed
- Display photos from destinations
- Social proof
- User-generated content

**Free Tier:**
- Free with Instagram Business account

**Use Cases:**
- Show destination Instagram feeds
- User-generated content
- Social proof
- Photo galleries

---

### 4.2. Twitter/X API

**What it does:** Access tweets and social data.

**Why use it:**
- Social mentions
- Trending destinations
- User sentiment
- Real-time updates

**Free Tier:**
- Basic tier available

**Use Cases:**
- Show social buzz
- Trending destinations
- User mentions
- Social proof

---

### 4.3. Discord API

**What it does:** Create Discord integrations.

**Why use it:**
- Community building
- Notifications
- User engagement
- Bot interactions

**Free Tier:**
- Unlimited

**Use Cases:**
- Urban Manual community
- Destination alerts
- User discussions
- Travel planning groups

---

## 5. Currency & Finance APIs

### 5.1. ExchangeRate-API

**What it does:** Real-time currency exchange rates.

**Why use it:**
- Convert prices
- Show local currency
- Budget planning
- Price comparisons

**Free Tier:**
- 1,500 requests/month

**Integration:**
```typescript
// lib/currency.ts
export async function convertCurrency(
  amount: number,
  from: string,
  to: string
) {
  const response = await fetch(
    `https://api.exchangerate-api.com/v4/latest/${from}`
  )
  const data = await response.json()
  
  return {
    amount: amount * data.rates[to],
    rate: data.rates[to],
    from,
    to,
  }
}
```

**Use Cases:**
- Show prices in user's currency
- Budget calculators
- Price comparisons
- Travel cost estimation

---

### 5.2. CoinGecko API (Crypto)

**What it does:** Cryptocurrency prices and data.

**Why use it:**
- Accept crypto payments
- Show crypto prices
- Payment options

**Free Tier:**
- 10-50 calls/minute

**Use Cases:**
- Crypto payment options
- Price display
- Alternative payment methods

---

## 6. Data & Information APIs

### 6.1. Wikipedia API

**What it does:** Access Wikipedia content.

**Why use it:**
- City information
- Historical context
- Destination background
- Educational content

**Free Tier:**
- Unlimited (with rate limiting)

**Integration:**
```typescript
// lib/wikipedia.ts
export async function getCityInfo(cityName: string) {
  const response = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cityName)}`
  )
  return response.json()
}
```

**Use Cases:**
- City descriptions
- Historical context
- Background information
- Educational content

---

### 6.2. REST Countries API

**What it does:** Country information and data.

**Why use it:**
- Country details
- Flags
- Languages
- Currencies
- Timezones

**Free Tier:**
- Unlimited

**Integration:**
```typescript
// lib/countries.ts
export async function getCountryInfo(countryName: string) {
  const response = await fetch(
    `https://restcountries.com/v3.1/name/${countryName}`
  )
  return response.json()
}
```

**Use Cases:**
- Country information
- Travel requirements
- Currency information
- Language guides

---

### 6.3. Nominatim (OpenStreetMap)

**What it does:** Free geocoding and reverse geocoding.

**Why use it:**
- Alternative to Google Geocoding
- Free and open-source
- No API key required

**Free Tier:**
- Unlimited (with usage policy)

**Integration:**
```typescript
// lib/nominatim.ts
export async function geocode(address: string) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
    {
      headers: {
        'User-Agent': 'UrbanManual/1.0'
      }
    }
  )
  return response.json()
}
```

**Use Cases:**
- Free geocoding
- Address lookup
- Location search
- Map data

---

## 7. Productivity & Utility APIs

### 7.1. QR Code API

**What it does:** Generate QR codes.

**Why use it:**
- Share destinations
- Mobile-friendly sharing
- Print materials
- Marketing

**Free Tier:**
- Unlimited

**Integration:**
```typescript
// lib/qrcode.ts
export function generateQRCode(url: string, size: number = 200) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`
}
```

**Use Cases:**
- Share destination links
- Print guides
- Mobile sharing
- Marketing materials

---

### 7.2. PDF Generation APIs

**What it does:** Generate PDFs from HTML.

**Why use it:**
- Travel guides
- Itineraries
- Printable lists
- Reports

**Options:**
- **PDFShift**: 250 PDFs/month free
- **HTML2PDF**: Self-hosted
- **Puppeteer**: Self-hosted

**Use Cases:**
- Printable travel guides
- Itinerary PDFs
- Saved lists
- Reports

---

## 8. Analytics & Tracking APIs

### 8.1. IP Geolocation API

**What it does:** Detect user location from IP.

**Why use it:**
- Auto-detect user location
- Personalize content
- Show nearby destinations
- Analytics

**Free Tier:**
- 1,000 requests/day (ipapi.co)

**Integration:**
```typescript
// lib/geolocation.ts
export async function getUserLocation() {
  const response = await fetch('https://ipapi.co/json/')
  return response.json()
}
```

**Use Cases:**
- Auto-detect user city
- Personalize homepage
- Show nearby destinations
- Analytics

---

## Priority Implementation Roadmap

### Phase 1: Essential Data (Week 1-2)
1. **Foursquare** - Venue tips and recommendations
2. **Yelp** - Reviews and ratings
3. **OpenWeatherMap** - Weather data
4. **ExchangeRate-API** - Currency conversion

### Phase 2: Media & Content (Week 3-4)
5. **Unsplash** - High-quality photos
6. **OpenAI Vision** - Photo analysis
7. **Wikipedia** - City information
8. **QR Code** - Easy sharing

### Phase 3: Advanced Features (Month 2)
9. **Instagram API** - Social content
10. **IP Geolocation** - User location
11. **REST Countries** - Country data
12. **Hugging Face** - AI features

---

## Cost Summary

| API | Free Tier | Estimated Monthly Cost |
|-----|-----------|------------------------|
| Foursquare | 50K/day | $0 |
| Yelp | 5K/day | $0 |
| OpenWeatherMap | 1K/day | $0 |
| Unsplash | 50/hour | $0 |
| Pexels | 200/hour | $0 |
| ExchangeRate | 1.5K/month | $0 |
| Wikipedia | Unlimited | $0 |
| REST Countries | Unlimited | $0 |
| Nominatim | Unlimited | $0 |
| QR Code | Unlimited | $0 |
| **Total** | | **$0/month** |

---

## Next Steps

Would you like me to:
1. **Implement specific APIs** - Pick any from the list
2. **Create a data enrichment pipeline** - Combine multiple APIs
3. **Build a specific feature** - Like weather-aware recommendations
4. **Set up API aggregation** - Combine data from multiple sources

All of these APIs have generous free tiers and can significantly enhance Urban Manual!

