-- Migration: Add Performance Indexes
-- Created: 2025-10-27
-- Description: Adds database indexes for improved query performance

-- Saved Places Indexes
CREATE INDEX IF NOT EXISTS user_id_idx ON saved_places(user_id);
CREATE INDEX IF NOT EXISTS destination_slug_idx ON saved_places(destination_slug);
CREATE UNIQUE INDEX IF NOT EXISTS user_destination_unique_idx ON saved_places(user_id, destination_slug);

-- Visited Places Indexes
CREATE INDEX IF NOT EXISTS visited_user_id_idx ON visited_places(user_id);
CREATE INDEX IF NOT EXISTS visited_destination_slug_idx ON visited_places(destination_slug);
CREATE INDEX IF NOT EXISTS visited_at_idx ON visited_places(visited_at);

-- User Activity Indexes
CREATE INDEX IF NOT EXISTS activity_user_id_idx ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS activity_timestamp_idx ON user_activity(timestamp);
CREATE INDEX IF NOT EXISTS activity_user_timestamp_idx ON user_activity(user_id, timestamp);

-- Trips Indexes
CREATE INDEX IF NOT EXISTS trips_user_id_idx ON trips(user_id);
CREATE INDEX IF NOT EXISTS trips_status_idx ON trips(status);
CREATE INDEX IF NOT EXISTS trips_user_status_idx ON trips(user_id, status);
CREATE INDEX IF NOT EXISTS trips_start_date_idx ON trips(start_date);

-- Itinerary Items Indexes
CREATE INDEX IF NOT EXISTS itinerary_trip_id_idx ON itinerary_items(trip_id);
CREATE INDEX IF NOT EXISTS itinerary_trip_day_idx ON itinerary_items(trip_id, day);
CREATE INDEX IF NOT EXISTS itinerary_trip_day_order_idx ON itinerary_items(trip_id, day, order_index);
