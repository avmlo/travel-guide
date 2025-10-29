-- Urban Manual Database Enrichment Migration
-- This script adds new fields to the destinations table for better AI recommendations
-- Run this in your Supabase SQL Editor

-- Step 1: Add contact and business information
ALTER TABLE destinations
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS google_maps_url TEXT,
ADD COLUMN IF NOT EXISTS price_range TEXT, -- '$', '$$', '$$$', '$$$$'
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
ADD COLUMN IF NOT EXISTS vibe_tags TEXT[], -- ['cozy', 'minimalist', 'luxurious']
ADD COLUMN IF NOT EXISTS atmosphere TEXT,
ADD COLUMN IF NOT EXISTS interior_style TEXT;

-- Step 3: Add visual attributes
ALTER TABLE destinations
ADD COLUMN IF NOT EXISTS color_palette JSONB, -- {"primary": "#F5F5DC", "secondary": "#8B4513"}
ADD COLUMN IF NOT EXISTS dominant_colors TEXT[], -- ['beige', 'brown', 'white']
ADD COLUMN IF NOT EXISTS materials TEXT[], -- ['wood', 'concrete', 'marble']
ADD COLUMN IF NOT EXISTS additional_images TEXT[];

-- Step 4: Add practical information
ALTER TABLE destinations
ADD COLUMN IF NOT EXISTS amenities TEXT[], -- ['wifi', 'outdoor_seating', 'wheelchair_accessible']
ADD COLUMN IF NOT EXISTS wheelchair_accessible BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS parking_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS accepts_reservations BOOLEAN DEFAULT false;

-- Step 5: Add AI and search optimization
ALTER TABLE destinations
ADD COLUMN IF NOT EXISTS keywords TEXT[], -- ['minimalist', 'design', 'coffee']
ADD COLUMN IF NOT EXISTS ai_summary TEXT,
ADD COLUMN IF NOT EXISTS related_destinations TEXT[], -- Slugs of similar places
ADD COLUMN IF NOT EXISTS popularity_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS data_quality_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_enriched TIMESTAMPTZ;

-- Step 6: Add cuisine-specific fields (for restaurants/cafes)
ALTER TABLE destinations
ADD COLUMN IF NOT EXISTS cuisine_type TEXT[],
ADD COLUMN IF NOT EXISTS dietary_options TEXT[], -- ['vegetarian', 'vegan', 'gluten_free']
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

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully! New fields added to destinations table.';
END $$;

