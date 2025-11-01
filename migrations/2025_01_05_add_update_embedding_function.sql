-- Helper function to update destination embedding and search_text
-- This is needed because Supabase client doesn't easily support vector column updates

CREATE OR REPLACE FUNCTION update_destination_embedding(
  p_slug text,
  p_embedding vector,
  p_search_text text
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE destinations
  SET
    embedding = p_embedding,
    search_text = p_search_text
  WHERE slug = p_slug;
END;
$$;
