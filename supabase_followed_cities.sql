-- Create followed_cities table to track cities users follow
CREATE TABLE IF NOT EXISTS followed_cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  city VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT followed_cities_unique UNIQUE (user_id, city)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_followed_cities_user_id ON followed_cities(user_id);
CREATE INDEX IF NOT EXISTS idx_followed_cities_city ON followed_cities(city);

-- Enable Row Level Security
ALTER TABLE followed_cities ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own followed cities
CREATE POLICY "Users can view own followed cities"
  ON followed_cities
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can follow cities
CREATE POLICY "Users can follow cities"
  ON followed_cities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can unfollow cities
CREATE POLICY "Users can unfollow cities"
  ON followed_cities
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON followed_cities TO authenticated;
GRANT ALL ON followed_cities TO service_role;

-- View to get followed city statistics
CREATE OR REPLACE VIEW followed_cities_stats AS
SELECT
  city,
  COUNT(*) as follower_count
FROM followed_cities
GROUP BY city
ORDER BY follower_count DESC;

GRANT SELECT ON followed_cities_stats TO authenticated;
GRANT SELECT ON followed_cities_stats TO anon;
