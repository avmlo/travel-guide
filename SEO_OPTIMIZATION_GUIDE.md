# SEO Optimization Guide for Urban Manual

**Date:** October 27, 2025
**Goal:** Restructure and optimize Urban Manual for maximum search engine visibility

---

## Current SEO Analysis

### **What You Have (Good!):**
- ✅ Sitemap.xml (dynamic, includes all destinations and cities)
- ✅ Robots.txt (properly configured)
- ✅ Clean URL structure (`/destination/[slug]`, `/city/[city]`)
- ✅ Next.js App Router (SEO-friendly by default)

### **What's Missing (Opportunities!):**
- ❌ Dynamic metadata for each page
- ❌ Structured data (JSON-LD)
- ❌ Open Graph images
- ❌ Breadcrumbs
- ❌ Internal linking strategy
- ❌ Content optimization
- ❌ Image optimization
- ❌ Performance optimization

---

## SEO Optimization Plan

### **Priority 1: Metadata & Structured Data** (Highest Impact)

#### **1.1 Dynamic Metadata for Destination Pages**

Current problem: All destination pages have the same title/description.

**Solution:**

```typescript
// app/destination/[slug]/page.tsx
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  
  const { data: destination } = await supabase
    .from('destinations')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!destination) {
    return {
      title: 'Destination Not Found | Urban Manual',
    }
  }

  const title = `${destination.name} - ${destination.city} | Urban Manual`
  const description = destination.description || 
    `Discover ${destination.name}, a curated ${destination.category.toLowerCase()} in ${destination.city}. ${destination.michelin_stars ? `${destination.michelin_stars} Michelin star${destination.michelin_stars > 1 ? 's' : ''}. ` : ''}Part of Urban Manual's collection of exceptional destinations worldwide.`

  return {
    title,
    description,
    keywords: [
      destination.name,
      destination.city,
      destination.country,
      destination.category,
      'curated destinations',
      'design-focused travel',
      ...(destination.vibe_tags || []),
      ...(destination.keywords || [])
    ].filter(Boolean),
    
    // Open Graph
    openGraph: {
      title,
      description,
      url: `https://theurbanmanual.com/destination/${destination.slug}`,
      siteName: 'Urban Manual',
      images: destination.main_image ? [
        {
          url: destination.main_image,
          width: 1200,
          height: 630,
          alt: `${destination.name} in ${destination.city}`,
        }
      ] : [],
      locale: 'en_US',
      type: 'website',
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: destination.main_image ? [destination.main_image] : [],
      creator: '@urbanmanual', // Your Twitter handle
    },
    
    // Additional
    alternates: {
      canonical: `https://theurbanmanual.com/destination/${destination.slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}
```

#### **1.2 Dynamic Metadata for City Pages**

```typescript
// app/city/[city]/page.tsx
import type { Metadata } from 'next'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  
  const { data: destinations, count } = await supabase
    .from('destinations')
    .select('*', { count: 'exact' })
    .eq('city', params.city)

  const cityName = params.city
  const title = `${cityName} - Curated Destinations | Urban Manual`
  const description = `Discover ${count} exceptional destinations in ${cityName}. Handpicked restaurants, cafes, hotels, and cultural spaces. Your design-focused guide to ${cityName}.`

  return {
    title,
    description,
    keywords: [
      cityName,
      `${cityName} restaurants`,
      `${cityName} cafes`,
      `${cityName} hotels`,
      `best places in ${cityName}`,
      'curated travel guide',
    ],
    openGraph: {
      title,
      description,
      url: `https://theurbanmanual.com/city/${cityName}`,
      siteName: 'Urban Manual',
      type: 'website',
    },
    alternates: {
      canonical: `https://theurbanmanual.com/city/${cityName}`,
    },
  }
}
```

#### **1.3 Enhanced Root Layout Metadata**

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://theurbanmanual.com'),
  title: {
    default: 'Urban Manual - Curated Design-Focused Destinations Worldwide',
    template: '%s | Urban Manual',
  },
  description: 'Discover 921+ exceptional destinations worldwide. Handpicked restaurants, cafes, hotels, bars, and cultural spaces. Your guide to design-focused travel.',
  keywords: [
    'curated destinations',
    'design hotels',
    'boutique restaurants',
    'specialty cafes',
    'travel guide',
    'design-focused travel',
    'urban exploration',
    'Michelin restaurants',
    'architectural destinations',
  ],
  authors: [{ name: 'Urban Manual' }],
  creator: 'Urban Manual',
  publisher: 'Urban Manual',
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://theurbanmanual.com',
    siteName: 'Urban Manual',
    title: 'Urban Manual - Curated Design-Focused Destinations',
    description: 'Discover 921+ exceptional destinations worldwide.',
    images: [
      {
        url: '/og-image.jpg', // Create this!
        width: 1200,
        height: 630,
        alt: 'Urban Manual - Curated Destinations',
      },
    ],
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'Urban Manual - Curated Design-Focused Destinations',
    description: 'Discover 921+ exceptional destinations worldwide.',
    creator: '@urbanmanual',
    images: ['/og-image.jpg'],
  },
  
  // Icons (you already have this)
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  
  manifest: '/site.webmanifest',
  
  // Verification (add when you have accounts)
  verification: {
    google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  alternates: {
    canonical: 'https://theurbanmanual.com',
  },
}
```

---

### **Priority 2: Structured Data (JSON-LD)** (High Impact)

Structured data helps Google understand your content and show rich snippets.

#### **2.1 Organization Schema (Root Layout)**

```typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Urban Manual',
    url: 'https://theurbanmanual.com',
    logo: 'https://theurbanmanual.com/logo.png',
    description: 'Curated design-focused destinations worldwide',
    sameAs: [
      'https://instagram.com/urbanmanual',
      'https://twitter.com/urbanmanual',
      // Add your social media URLs
    ],
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

#### **2.2 Restaurant/Place Schema (Destination Pages)**

```typescript
// app/destination/[slug]/page.tsx
export default async function DestinationPage({ params }: Props) {
  const destination = await getDestination(params.slug)
  
  // Generate structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': destination.category === 'Restaurant' ? 'Restaurant' : 
             destination.category === 'Hotel' ? 'Hotel' :
             destination.category === 'Cafe' ? 'CafeOrCoffeeShop' :
             'LocalBusiness',
    name: destination.name,
    description: destination.description,
    image: destination.main_image,
    url: `https://theurbanmanual.com/destination/${destination.slug}`,
    
    address: destination.address ? {
      '@type': 'PostalAddress',
      streetAddress: destination.address,
      addressLocality: destination.city,
      addressCountry: destination.country,
    } : undefined,
    
    geo: destination.latitude && destination.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: destination.latitude,
      longitude: destination.longitude,
    } : undefined,
    
    telephone: destination.phone,
    url: destination.website,
    
    priceRange: destination.price_range,
    
    // Michelin stars as aggregate rating
    ...(destination.michelin_stars && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: destination.michelin_stars,
        bestRating: 3,
        worstRating: 1,
      },
    }),
    
    // Opening hours (if you have this data)
    ...(destination.opening_hours && {
      openingHoursSpecification: destination.opening_hours,
    }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Your page content */}
    </>
  )
}
```

#### **2.3 Breadcrumb Schema**

```typescript
// components/Breadcrumbs.tsx
export function Breadcrumbs({ items }: { items: Array<{ name: string; url: string }> }) {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://theurbanmanual.com${item.url}`,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-gray-600">
        {items.map((item, index) => (
          <span key={item.url}>
            {index > 0 && ' / '}
            {index === items.length - 1 ? (
              <span className="text-black">{item.name}</span>
            ) : (
              <Link href={item.url} className="hover:underline">
                {item.name}
              </Link>
            )}
          </span>
        ))}
      </nav>
    </>
  )
}

// Usage in destination page:
<Breadcrumbs
  items={[
    { name: 'Home', url: '/' },
    { name: destination.city, url: `/city/${destination.city}` },
    { name: destination.name, url: `/destination/${destination.slug}` },
  ]}
/>
```

---

### **Priority 3: URL Structure & Internal Linking** (Medium-High Impact)

#### **3.1 Add Category Pages**

Create category-specific pages for better SEO:

```
/category/restaurants
/category/cafes
/category/hotels
/category/bars
```

```typescript
// app/category/[category]/page.tsx
export async function generateStaticParams() {
  return [
    { category: 'restaurants' },
    { category: 'cafes' },
    { category: 'hotels' },
    { category: 'bars' },
    { category: 'shops' },
    { category: 'bakeries' },
  ]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = params.category
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1)
  
  return {
    title: `Best ${categoryName} Worldwide | Urban Manual`,
    description: `Discover exceptional ${category} curated by Urban Manual. Design-focused, architecturally significant, and culturally rich destinations.`,
  }
}
```

#### **3.2 Add Country Pages**

```
/country/japan
/country/france
/country/usa
```

#### **3.3 Internal Linking Strategy**

```typescript
// components/RelatedDestinations.tsx
export function RelatedDestinations({ destination }: { destination: Destination }) {
  // Show destinations in same city
  // Show destinations in same category
  // Show destinations with similar vibes
  
  return (
    <section>
      <h2>More in {destination.city}</h2>
      {/* Destination cards */}
      
      <h2>More {destination.category}s</h2>
      {/* Destination cards */}
    </section>
  )
}
```

---

### **Priority 4: Content Optimization** (Medium Impact)

#### **4.1 Add Rich Content to Destination Pages**

```typescript
// Enhance destination content with:
- Detailed description (300-500 words)
- Why it's special
- What to order/see
- Best time to visit
- Nearby attractions
- User tips
```

#### **4.2 Add City Guides**

```typescript
// app/city/[city]/page.tsx
// Add introductory content:
- Overview of the city
- Why it's worth visiting
- Best neighborhoods
- Getting around
- When to visit
```

#### **4.3 Add Blog/Editorial Section**

```
/editorial/best-cafes-tokyo
/editorial/michelin-restaurants-paris
/editorial/design-hotels-london
```

This creates more entry points for SEO!

---

### **Priority 5: Image Optimization** (Medium Impact)

#### **5.1 Use Next.js Image Component**

```typescript
import Image from 'next/image'

<Image
  src={destination.main_image}
  alt={`${destination.name} in ${destination.city}`}
  width={1200}
  height={800}
  priority={true} // For above-the-fold images
  quality={85}
/>
```

#### **5.2 Add Alt Text to All Images**

```typescript
// Good alt text:
alt={`Interior of ${destination.name}, a ${destination.category.toLowerCase()} in ${destination.city}`}

// Not just:
alt={destination.name}
```

#### **5.3 Generate Open Graph Images**

Create dynamic OG images for each destination:

```typescript
// app/destination/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og'

export default async function Image({ params }: { params: { slug: string } }) {
  const destination = await getDestination(params.slug)
  
  return new ImageResponse(
    (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
      }}>
        <img src={destination.main_image} alt="" />
        <div style={{ padding: 40 }}>
          <h1>{destination.name}</h1>
          <p>{destination.city}</p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
```

---

### **Priority 6: Performance Optimization** (Medium Impact)

#### **6.1 Enable Static Generation**

```typescript
// app/destination/[slug]/page.tsx
export async function generateStaticParams() {
  const supabase = createClient()
  const { data: destinations } = await supabase
    .from('destinations')
    .select('slug')
  
  return destinations?.map((dest) => ({
    slug: dest.slug,
  })) || []
}

// This pre-renders all destination pages at build time!
```

#### **6.2 Add Loading States**

```typescript
// app/destination/[slug]/loading.tsx
export default function Loading() {
  return <DestinationSkeleton />
}
```

#### **6.3 Optimize Fonts**

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      {children}
    </html>
  )
}
```

---

### **Priority 7: Technical SEO** (Low-Medium Impact)

#### **7.1 Add RSS Feed**

```typescript
// app/feed.xml/route.ts
export async function GET() {
  const destinations = await getRecentDestinations(20)
  
  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Urban Manual</title>
    <link>https://theurbanmanual.com</link>
    <description>Curated design-focused destinations</description>
    ${destinations.map(dest => `
      <item>
        <title>${dest.name}</title>
        <link>https://theurbanmanual.com/destination/${dest.slug}</link>
        <description>${dest.description}</description>
        <pubDate>${new Date(dest.created_at).toUTCString()}</pubDate>
      </item>
    `).join('')}
  </channel>
</rss>`

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
```

#### **7.2 Add 404 Page with SEO**

```typescript
// app/not-found.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Not Found | Urban Manual',
  robots: {
    index: false,
    follow: true,
  },
}

export default function NotFound() {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>Explore our destinations instead:</p>
      {/* Show popular destinations */}
    </div>
  )
}
```

#### **7.3 Implement Canonical URLs**

Already covered in metadata, but ensure consistency!

---

## Implementation Checklist

### **Week 1: Metadata & Structured Data**
- [ ] Add dynamic metadata to destination pages
- [ ] Add dynamic metadata to city pages
- [ ] Enhance root layout metadata
- [ ] Add Organization schema
- [ ] Add Restaurant/Place schema
- [ ] Add Breadcrumb schema

### **Week 2: URL Structure & Content**
- [ ] Create category pages
- [ ] Create country pages
- [ ] Add related destinations component
- [ ] Enhance destination descriptions
- [ ] Add city guide content

### **Week 3: Images & Performance**
- [ ] Convert all images to Next.js Image
- [ ] Add proper alt text
- [ ] Generate OG images
- [ ] Enable static generation
- [ ] Optimize fonts

### **Week 4: Technical SEO**
- [ ] Add RSS feed
- [ ] Create 404 page
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Analytics 4
- [ ] Monitor Core Web Vitals

---

## Expected SEO Impact

### **Short Term (1-3 months):**
- ✅ Better indexing of all pages
- ✅ Rich snippets in search results
- ✅ Improved click-through rates
- ✅ Better social media previews

### **Medium Term (3-6 months):**
- ✅ Ranking for destination-specific keywords
- ✅ Ranking for city + category keywords
- ✅ Featured snippets for some queries
- ✅ Increased organic traffic (2-3x)

### **Long Term (6-12 months):**
- ✅ Authority in design/travel niche
- ✅ Ranking for competitive keywords
- ✅ Consistent organic growth
- ✅ 5-10x organic traffic

---

## Tools to Use

### **SEO Analysis:**
- Google Search Console (free)
- Google Analytics 4 (free)
- Ahrefs or SEMrush (paid, $99-199/month)
- Screaming Frog (free for 500 URLs)

### **Testing:**
- Google Rich Results Test
- PageSpeed Insights
- Lighthouse (built into Chrome)
- Schema.org Validator

### **Monitoring:**
- Google Search Console
- Vercel Analytics (free)
- Plausible or Fathom (privacy-friendly)

---

## Quick Wins (Do These First!)

1. **Add dynamic metadata** (2 hours, huge impact)
2. **Add structured data** (3 hours, huge impact)
3. **Optimize images** (4 hours, medium impact)
4. **Enable static generation** (1 hour, medium impact)
5. **Add breadcrumbs** (2 hours, small-medium impact)

**Total: 12 hours for 80% of SEO benefits!**

---

## Next Steps

Would you like me to:
1. **Implement the metadata changes** - Add dynamic metadata to all pages?
2. **Create the structured data** - Add JSON-LD schemas?
3. **Build category/country pages** - Expand URL structure?
4. **Set up analytics** - Google Search Console + GA4?
5. **Do everything** - Complete SEO overhaul?

Let me know what you'd like to tackle first!

