# Database Enrichment - Quick Start Guide

Follow these simple steps to enrich your Urban Manual database with AI-powered metadata.

---

## ✅ Step 1: Run Database Migration (5 minutes)

1. **Go to your Supabase SQL Editor:**
   - URL: https://supabase.com/dashboard/project/avdnefdfwvpjkuanhdwk/sql

2. **Copy the SQL migration:**
   - File: `/home/ubuntu/urban-manual/migrations/add_enrichment_fields.sql`
   - Or copy from below:

```sql
-- Urban Manual Database Enrichment Migration
-- This script adds new fields to the destinations table for better AI recommendations

-- Step 1: Add contact and business information
ALTER TABLE destinations
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS google_maps_url TEXT,
ADD COLUMN IF NOT EXISTS price_range TEXT,
ADD COLUMN IF NOT EXISTS opening_hours JSONB,
ADD COLUMN IF NOT EXISTS neighborhood TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS country TEXT;

-- Step 2: Add design and atmosphere metadata
ALTER TABLE destinations
ADD COLUMN IF NOT EXISTS architectural_style TEXT,
ADD COLUMN IF NOT EXISTS designer_name TEXT,
ADD COLUMN IF NOT EXISTS architect_name TEXT,
ADD COLUMN IF NOT EXISTS year_established INTEGER,
ADD COLUMN IF NOT EXISTS vibe_tags TEXT[],
ADD COLUMN IF NOT EXISTS atmosphere TEXT,
ADD COLUMN IF NOT EXISTS interior_style TEXT;

-- Step 3: Add visual attributes
ALTER TABLE destinations
ADD COLUMN IF NOT EXISTS color_palette JSONB,
ADD COLUMN IF NOT EXISTS dominant_colors TEXT[],
ADD COLUMN IF NOT EXISTS materials TEXT[],
ADD COLUMN IF NOT EXISTS additional_images TEXT[];

-- Step 4: Add practical information
ALTER TABLE destinations
ADD COLUMN IF NOT EXISTS amenities TEXT[],
ADD COLUMN IF NOT EXISTS wheelchair_accessible BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS parking_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS accepts_reservations BOOLEAN DEFAULT false;

-- Step 5: Add AI and search optimization
ALTER TABLE destinations
ADD COLUMN IF NOT EXISTS keywords TEXT[],
ADD COLUMN IF NOT EXISTS ai_summary TEXT,
ADD COLUMN IF NOT EXISTS related_destinations TEXT[],
ADD COLUMN IF NOT EXISTS popularity_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS data_quality_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_enriched TIMESTAMPTZ;

-- Step 6: Add cuisine-specific fields
ALTER TABLE destinations
ADD COLUMN IF NOT EXISTS cuisine_type TEXT[],
ADD COLUMN IF NOT EXISTS dietary_options TEXT[],
ADD COLUMN IF NOT EXISTS chef_name TEXT;

-- Step 7: Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_destinations_vibe_tags ON destinations USING GIN(vibe_tags);
CREATE INDEX IF NOT EXISTS idx_destinations_keywords ON destinations USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_destinations_amenities ON destinations USING GIN(amenities);
CREATE INDEX IF NOT EXISTS idx_destinations_price_range ON destinations(price_range);
CREATE INDEX IF NOT EXISTS idx_destinations_neighborhood ON destinations(neighborhood);
CREATE INDEX IF NOT EXISTS idx_destinations_country ON destinations(country);
CREATE INDEX IF NOT EXISTS idx_destinations_architectural_style ON destinations(architectural_style);
CREATE INDEX IF NOT EXISTS idx_destinations_cuisine_type ON destinations USING GIN(cuisine_type);

-- Step 8: Add comments for documentation
COMMENT ON COLUMN destinations.vibe_tags IS 'Atmosphere descriptors: cozy, modern, minimalist, luxurious, vibrant, rustic, etc.';
COMMENT ON COLUMN destinations.color_palette IS 'JSON object with primary, secondary, accent colors in hex format';
COMMENT ON COLUMN destinations.keywords IS 'Search keywords extracted from content and metadata';
COMMENT ON COLUMN destinations.ai_summary IS 'AI-generated concise summary (50-100 words)';
COMMENT ON COLUMN destinations.data_quality_score IS 'Completeness score 0-100 based on filled fields';
```

3. **Paste and run** the SQL in the editor
4. **Verify** - You should see "Success" message

---

## ✅ Step 2: Set Up API Keys (Optional - 2 minutes)

The enrichment script works with OpenAI (required) and Google Places (optional).

### Required:
- **OpenAI API Key**: Already set in your environment ✅

### Optional (for better data):
- **Google Places API Key**: 
  - Go to: https://console.cloud.google.com/
  - Enable "Places API"
  - Create API Key
  - Add to `.env.local`:
    ```
    GOOGLE_PLACES_API_KEY=your_key_here
    ```

---

## ✅ Step 3: Run Enrichment Script (Test with 10 destinations)

Once the migration is complete, run the enrichment script:

```bash
cd /home/ubuntu/urban-manual
python3 scripts/enrich_destinations.py
```

This will:
- ✅ Fetch 10 destinations from your database
- ✅ Extract design metadata using AI
- ✅ Generate AI summaries
- ✅ Add vibe tags, keywords, and more
- ✅ Update your database

**Expected output:**
```
============================================================
🚀 Urban Manual Database Enrichment Script
============================================================
🔑 Checking API keys...
  Supabase URL: ✅
  Supabase Key: ✅
  Google Places: ⚠️  (optional)
  OpenAI: ✅

📥 Fetching destinations from Supabase...
✅ Fetched 10 destinations

[1/10] 🔍 Enriching: laïzé marais (Paris)
  → Searching Google Places...
  ✅ Found on Google Places
  → Extracting design metadata with AI...
  ✅ Extracted metadata: 8 fields
  → Generating AI summary...
  ✅ Generated summary
  📊 Quality score: 75/100
  ✅ Enriched 12 fields
  ✅ Updated in database

...
```

---

## ✅ Step 4: Review Results

Check your Supabase database to see the enriched data:

1. Go to: https://supabase.com/dashboard/project/avdnefdfwvpjkuanhdwk/editor
2. Select `destinations` table
3. Look for new columns: `vibe_tags`, `keywords`, `ai_summary`, etc.

---

## ✅ Step 5: Run Full Enrichment (All 921 destinations)

Once you're happy with the test results, enrich all destinations:

1. Edit `/home/ubuntu/urban-manual/scripts/enrich_destinations.py`
2. Change line 16: `BATCH_SIZE = 10` → `BATCH_SIZE = 100`
3. Run the script multiple times (9-10 times) to process all 921 destinations

Or modify the script to remove the limit:

```python
# In enrich_destinations.py, line ~250
destinations = fetch_destinations(limit=None)  # Remove limit
```

---

## 📊 What You'll Get

After enrichment, each destination will have:

| Field | Example | Benefit |
|-------|---------|---------|
| `vibe_tags` | `['cozy', 'minimalist']` | Better filtering and recommendations |
| `keywords` | `['coffee', 'design', 'paris']` | Improved search |
| `ai_summary` | "A charming café known for..." | Quick descriptions |
| `price_range` | `'$$'` | Budget filtering |
| `website` | `'https://...'` | Direct links |
| `opening_hours` | `{"monday": "9:00-17:00"}` | Practical info |
| `architectural_style` | `'Art Deco'` | Design discovery |
| `cuisine_type` | `['french', 'bistro']` | Food preferences |
| `data_quality_score` | `75` | Completeness tracking |

---

## 🎯 Next Steps

Once enrichment is complete, you can:

1. **Update the frontend** to display new metadata
2. **Implement Color Palette Explorer** using color data
3. **Build Urban DNA Profile** using vibe tags and preferences
4. **Improve search** with keywords and tags
5. **Create AI recommendations** using similarity scores

---

## 🆘 Troubleshooting

### "No destinations found"
- Check your Supabase connection in `.env.local`
- Verify the `destinations` table exists

### "OpenAI API error"
- Check your OpenAI API key is set: `echo $OPENAI_API_KEY`
- Ensure you have credits in your OpenAI account

### "Google Places API error"
- This is optional - enrichment will still work
- Add the API key to `.env.local` if you want location data

---

**Questions?** Let me know and I'll help you through any issues!

