# Urban Manual: Database Enrichment Plan

This document outlines a comprehensive strategy for enriching the Supabase database with additional metadata and "breadcrumbs" for each destination. The goal is to enable better AI-powered suggestions, improved search functionality, and more personalized recommendations.

---

## 1. Current Database Schema Analysis

### Existing Fields
The current `destinations` table contains the following fields:

| Field | Type | Current Status | Notes |
|-------|------|----------------|-------|
| `slug` | TEXT | ✅ Complete | Primary key, unique identifier |
| `name` | TEXT | ✅ Complete | Destination name |
| `city` | TEXT | ✅ Complete | City location |
| `category` | TEXT | ✅ Complete | Basic category (Dining, Hotel, Cafe, etc.) |
| `content` | TEXT | ✅ Complete | Description text |
| `subline` | TEXT | ⚠️ Mostly empty | Short tagline |
| `main_image` | TEXT | ⚠️ Some missing | Primary image URL |
| `michelin_stars` | INTEGER | ✅ Complete | Michelin rating (0-3) |
| `crown` | BOOLEAN | ✅ Complete | Featured/premium flag |
| `lat` | DOUBLE | ✅ 95% complete | Latitude coordinates |
| `long` | DOUBLE | ✅ 95% complete | Longitude coordinates |
| `created_at` | TIMESTAMPTZ | ✅ Complete | Timestamp |

### Missing Critical Data
- **No price range information** ($, $$, $$$, $$$$)
- **No opening hours** or business hours
- **No contact information** (phone, email, website)
- **No social media links** (Instagram, Facebook)
- **No tags or keywords** for better search
- **No architectural style** or design period
- **No amenities** (WiFi, outdoor seating, wheelchair accessible)
- **No atmosphere descriptors** (cozy, modern, rustic, etc.)
- **No color palette** data for visual search
- **No designer/architect** attribution
- **No year established** or historical context
- **No reservation links** or booking information
- **No dress code** or special requirements
- **No parking information**
- **No nearby transit** information

---

## 2. Proposed New Database Fields

### 2.1 Essential Metadata

```sql
-- Contact & Links
website TEXT,
phone TEXT,
email TEXT,
instagram TEXT,
facebook TEXT,
google_maps_url TEXT,
booking_url TEXT,

-- Business Information
price_range TEXT, -- '$', '$$', '$$$', '$$$$'
opening_hours JSONB, -- {"monday": "9:00-17:00", "tuesday": "9:00-17:00", ...}
accepts_reservations BOOLEAN DEFAULT false,
reservation_required BOOLEAN DEFAULT false,
dress_code TEXT, -- 'casual', 'smart casual', 'formal'

-- Location Details
neighborhood TEXT,
address TEXT,
postal_code TEXT,
country TEXT,
timezone TEXT,
```

### 2.2 Design & Atmosphere

```sql
-- Design Attributes
architectural_style TEXT, -- 'Art Deco', 'Mid-Century Modern', 'Contemporary', etc.
design_period TEXT, -- '1920s', '1950s', '2000s', etc.
designer_name TEXT,
architect_name TEXT,
interior_designer TEXT,
year_established INTEGER,

-- Atmosphere & Vibe
vibe_tags TEXT[], -- ['cozy', 'minimalist', 'luxurious', 'vibrant']
atmosphere TEXT, -- 'intimate', 'lively', 'quiet', 'romantic'
lighting TEXT, -- 'dim', 'bright', 'natural'
noise_level TEXT, -- 'quiet', 'moderate', 'loud'
```

### 2.3 Visual & Sensory

```sql
-- Visual Attributes
color_palette JSONB, -- {"primary": "#F5F5DC", "secondary": "#8B4513", ...}
dominant_colors TEXT[], -- ['beige', 'brown', 'white']
materials TEXT[], -- ['wood', 'concrete', 'marble', 'glass']
interior_style TEXT, -- 'industrial', 'scandinavian', 'japanese', 'eclectic'

-- Additional Images
additional_images TEXT[], -- Array of image URLs
image_credits JSONB, -- {"main": "photographer_name", ...}
```

### 2.4 Practical Information

```sql
-- Amenities
amenities TEXT[], -- ['wifi', 'outdoor_seating', 'wheelchair_accessible', 'parking']
payment_methods TEXT[], -- ['cash', 'credit_card', 'mobile_payment']
languages_spoken TEXT[], -- ['english', 'japanese', 'mandarin']

-- Accessibility
wheelchair_accessible BOOLEAN DEFAULT false,
elevator_available BOOLEAN DEFAULT false,
accessible_restroom BOOLEAN DEFAULT false,
braille_menu BOOLEAN DEFAULT false,

-- Parking & Transit
parking_available BOOLEAN DEFAULT false,
parking_type TEXT, -- 'street', 'lot', 'valet', 'none'
nearest_metro TEXT,
metro_distance_meters INTEGER,
```

### 2.5 Culinary Details (for Dining/Cafe)

```sql
-- Cuisine & Dining
cuisine_type TEXT[], -- ['french', 'japanese', 'fusion']
dietary_options TEXT[], -- ['vegetarian', 'vegan', 'gluten_free']
signature_dishes TEXT[], -- ['truffle pasta', 'wagyu steak']
chef_name TEXT,
tasting_menu_available BOOLEAN DEFAULT false,
average_meal_duration_minutes INTEGER,
```

### 2.6 Accommodation Details (for Hotels)

```sql
-- Hotel Specific
room_count INTEGER,
room_types TEXT[], -- ['single', 'double', 'suite']
hotel_chain TEXT,
star_rating DECIMAL(2,1), -- 3.5, 4.0, 5.0
check_in_time TIME,
check_out_time TIME,
pet_friendly BOOLEAN DEFAULT false,
```

### 2.7 AI & Search Optimization

```sql
-- Search & Discovery
keywords TEXT[], -- ['minimalist', 'design', 'coffee', 'brunch']
search_tags TEXT[], -- For full-text search optimization
related_destinations TEXT[], -- Slugs of similar destinations
popularity_score INTEGER DEFAULT 0, -- Based on saves/visits
trending_score INTEGER DEFAULT 0, -- Time-weighted popularity

-- AI Metadata
embedding_vector VECTOR(1536), -- For semantic search (OpenAI embeddings)
ai_summary TEXT, -- AI-generated short summary
ai_highlights TEXT[], -- AI-extracted key features
sentiment_score DECIMAL(3,2), -- From reviews/descriptions
```

### 2.8 User-Generated & Dynamic

```sql
-- User Engagement
total_saves INTEGER DEFAULT 0,
total_visits INTEGER DEFAULT 0,
average_rating DECIMAL(3,2),
review_count INTEGER DEFAULT 0,

-- Seasonal & Temporal
best_season TEXT, -- 'spring', 'summer', 'fall', 'winter', 'year_round'
peak_hours TEXT[], -- ['12:00-14:00', '19:00-21:00']
special_events JSONB, -- {"christmas": "special_menu", ...}
last_updated TIMESTAMPTZ DEFAULT NOW(),
data_quality_score INTEGER DEFAULT 0, -- Completeness metric
```

---

## 3. Data Sources & APIs

### 3.1 Free APIs (Within Tier Limits)

| API | Data Available | Free Tier Limit | Use Case |
|-----|----------------|-----------------|----------|
| **Google Places API** | Address, phone, website, opening hours, photos, ratings | 28,000 requests/month | Primary source for business info |
| **OpenStreetMap Overpass API** | Location data, amenities, building info | Unlimited (fair use) | Backup for location data |
| **Foursquare Places API** | Venue details, tips, photos, categories | 50,000 calls/day | Venue enrichment |
| **Yelp Fusion API** | Business details, reviews, photos, hours | 5,000 calls/day | Reviews and ratings |
| **OpenWeatherMap API** | Weather data for seasonal recommendations | 1,000 calls/day | Seasonal planning |
| **Unsplash API** | High-quality photos | 50 requests/hour | Backup images |
| **Wikipedia API** | Historical context, descriptions | Unlimited | Historical information |
| **Wikidata API** | Structured data (architect, year, style) | Unlimited | Design metadata |

### 3.2 Web Scraping Sources

- **Instagram** - Extract color palettes from photos, engagement metrics
- **Google Maps** - Reviews, Q&A, popular times
- **Michelin Guide** - Detailed restaurant information
- **Design blogs** - Architectural details, designer info
- **Official websites** - Direct business information

### 3.3 AI-Powered Enrichment

- **OpenAI GPT-4** - Generate summaries, extract keywords, sentiment analysis
- **OpenAI DALL-E** - Generate placeholder images if needed
- **OpenAI Embeddings** - Create vector embeddings for semantic search
- **Color Thief** - Extract color palettes from images
- **TensorFlow.js** - Image classification for atmosphere detection

---

## 4. Enrichment Strategy

### Phase 1: Essential Business Information (Priority 1)
**Goal:** Add critical missing data for all 921 destinations

**Data to fetch:**
- Website URLs
- Phone numbers
- Opening hours
- Price range
- Google Maps links
- Instagram handles

**Method:**
1. Use Google Places API as primary source
2. Fall back to Foursquare/Yelp for missing data
3. Manual verification for high-profile destinations

**Estimated time:** 2-3 hours (automated script)
**API costs:** Within free tier

---

### Phase 2: Design & Atmosphere Metadata (Priority 2)
**Goal:** Add design-focused metadata for better recommendations

**Data to fetch:**
- Architectural style
- Designer/architect names
- Year established
- Vibe tags (cozy, modern, minimalist, etc.)
- Materials and interior style

**Method:**
1. Query Wikidata for architect/designer info
2. Use GPT-4 to analyze existing descriptions and extract design keywords
3. Manual curation for featured destinations
4. Web scraping from design blogs and official sites

**Estimated time:** 4-6 hours (semi-automated)
**API costs:** ~$5-10 for GPT-4 calls

---

### Phase 3: Visual Enrichment (Priority 3)
**Goal:** Add visual metadata for Color Palette Explorer and visual search

**Data to fetch:**
- Additional high-quality images
- Color palettes extracted from images
- Dominant colors and materials
- Image credits

**Method:**
1. Fetch additional images from Google Places, Unsplash, Instagram
2. Use Color Thief library to extract color palettes
3. Store 5-color palette for each destination
4. Classify images by season if multiple available

**Estimated time:** 3-4 hours (automated)
**API costs:** Within free tier

---

### Phase 4: Practical Information (Priority 4)
**Goal:** Add amenities and accessibility information

**Data to fetch:**
- Amenities (WiFi, outdoor seating, parking)
- Accessibility features
- Payment methods
- Languages spoken
- Nearest transit information

**Method:**
1. Extract from Google Places API
2. Parse from existing descriptions using GPT-4
3. Cross-reference with OpenStreetMap data
4. Manual verification for accessibility info

**Estimated time:** 2-3 hours (automated)
**API costs:** Within free tier

---

### Phase 5: AI Optimization (Priority 5)
**Goal:** Enable semantic search and AI-powered recommendations

**Data to fetch:**
- Vector embeddings for each destination
- AI-generated summaries
- Keyword extraction
- Sentiment scores
- Related destination suggestions

**Method:**
1. Generate OpenAI embeddings for each destination description
2. Use GPT-4 to create concise summaries (50-100 words)
3. Extract keywords and tags using NLP
4. Calculate similarity scores between destinations
5. Store related destination recommendations

**Estimated time:** 3-4 hours (automated)
**API costs:** ~$10-15 for embeddings + GPT-4

---

## 5. Implementation Plan

### Step 1: Database Migration
Create SQL migration script to add new fields to the `destinations` table.

```sql
-- Add new columns in batches to avoid downtime
ALTER TABLE destinations
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS price_range TEXT,
ADD COLUMN IF NOT EXISTS opening_hours JSONB,
ADD COLUMN IF NOT EXISTS vibe_tags TEXT[],
ADD COLUMN IF NOT EXISTS amenities TEXT[],
ADD COLUMN IF NOT EXISTS color_palette JSONB,
ADD COLUMN IF NOT EXISTS keywords TEXT[],
ADD COLUMN IF NOT EXISTS neighborhood TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS country TEXT;

-- Create indexes for new searchable fields
CREATE INDEX IF NOT EXISTS idx_destinations_vibe_tags ON destinations USING GIN(vibe_tags);
CREATE INDEX IF NOT EXISTS idx_destinations_keywords ON destinations USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_destinations_amenities ON destinations USING GIN(amenities);
CREATE INDEX IF NOT EXISTS idx_destinations_price_range ON destinations(price_range);
CREATE INDEX IF NOT EXISTS idx_destinations_neighborhood ON destinations(neighborhood);
```

### Step 2: Data Enrichment Script
Create a Python script to fetch and enrich data from multiple sources.

**Script structure:**
```python
import os
import json
import requests
from openai import OpenAI
from colorthief import ColorThief
import time

# Configuration
GOOGLE_PLACES_API_KEY = os.getenv('GOOGLE_PLACES_API_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# Load destinations from Supabase
destinations = fetch_destinations_from_supabase()

for dest in destinations:
    # Phase 1: Fetch business info from Google Places
    places_data = fetch_google_places_data(dest['name'], dest['city'])
    
    # Phase 2: Extract design metadata with GPT-4
    design_data = extract_design_metadata(dest['content'])
    
    # Phase 3: Extract color palette from image
    color_palette = extract_color_palette(dest['main_image'])
    
    # Phase 4: Fetch amenities and accessibility
    amenities = extract_amenities(places_data)
    
    # Phase 5: Generate embeddings and AI summary
    embedding = generate_embedding(dest['content'])
    ai_summary = generate_summary(dest['content'])
    
    # Update destination in Supabase
    update_destination(dest['slug'], {
        'website': places_data.get('website'),
        'phone': places_data.get('phone'),
        'opening_hours': places_data.get('opening_hours'),
        'vibe_tags': design_data.get('vibe_tags'),
        'color_palette': color_palette,
        'amenities': amenities,
        'embedding_vector': embedding,
        'ai_summary': ai_summary,
    })
    
    # Rate limiting
    time.sleep(0.1)
```

### Step 3: Quality Assurance
- Verify data completeness for each destination
- Check for inconsistencies or errors
- Manual review of high-profile destinations
- A/B test AI recommendations with enriched data

### Step 4: Deployment
- Run migration script on production database
- Execute enrichment script in batches (100 destinations at a time)
- Monitor API usage and costs
- Update frontend to display new metadata

---

## 6. Cost Estimation

| Phase | API Calls | Estimated Cost | Time Required |
|-------|-----------|----------------|---------------|
| Phase 1: Business Info | ~2,000 Google Places calls | $0 (free tier) | 2-3 hours |
| Phase 2: Design Metadata | ~1,000 GPT-4 calls | $5-10 | 4-6 hours |
| Phase 3: Visual Enrichment | ~1,000 image processing | $0 (client-side) | 3-4 hours |
| Phase 4: Practical Info | ~500 API calls | $0 (free tier) | 2-3 hours |
| Phase 5: AI Optimization | ~1,000 embeddings + GPT-4 | $10-15 | 3-4 hours |
| **Total** | **~5,500 API calls** | **$15-25** | **14-20 hours** |

**Note:** All API usage is within free tier limits except OpenAI, which requires a paid account.

---

## 7. Expected Benefits

### For Users
- **Better search results** - More accurate filtering and discovery
- **Personalized recommendations** - AI understands user preferences better
- **Richer destination pages** - More useful information at a glance
- **Visual discovery** - Find destinations by color, vibe, or style
- **Practical planning** - Know opening hours, price range, accessibility before visiting

### For the Platform
- **Improved SEO** - More structured data for search engines
- **Higher engagement** - Users spend more time exploring
- **Better conversion** - More saves and visits due to better matches
- **Competitive advantage** - Unique features like Color Palette Explorer
- **Data-driven insights** - Analytics on popular vibes, styles, and trends

---

## 8. Next Steps

1. **Approve database schema changes** - Review proposed new fields
2. **Set up API keys** - Google Places, OpenAI, Foursquare, etc.
3. **Create enrichment script** - Python script to fetch and process data
4. **Run pilot test** - Enrich 50 destinations and validate results
5. **Full deployment** - Enrich all 921 destinations in batches
6. **Update frontend** - Display new metadata in UI
7. **Launch new features** - Color Palette Explorer, Urban DNA Profile, etc.

---

**Author:** Manus AI  
**Date:** October 26, 2025

