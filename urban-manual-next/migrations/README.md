# Database Migrations

This folder contains SQL migration files that need to be run in your Supabase database.

## Required Migrations

### 1. Saved and Visited Places (saved_visited_places.sql)
**Status:** MUST RUN FIRST
**Purpose:** Creates tables for saving and tracking visited destinations

Run this migration in your Supabase SQL Editor to enable:
- Saving favorite destinations
- Marking destinations as visited
- User-specific saved/visited lists on the account page

### 2. Trips and Itinerary (trips.sql)
**Status:** MUST RUN for trips feature
**Purpose:** Creates tables for trip planning functionality

Run this migration in your Supabase SQL Editor to enable:
- Creating and managing trips
- Building itineraries
- Trip planning page at /trips

## How to Run Migrations

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** (in the left sidebar)
3. Click **New Query**
4. Copy the contents of each migration file (in order above)
5. Paste into the SQL Editor
6. Click **Run** or press `Cmd/Ctrl + Enter`
7. Verify success (you should see "Success. No rows returned")

## Migration Order

Run migrations in this order:
1. `saved_visited_places.sql` - Core user functionality
2. `trips.sql` - Trip planning feature

## Verification

After running migrations, verify tables were created:
1. Go to **Table Editor** in Supabase
2. You should see these new tables:
   - `saved_places`
   - `visited_places`
   - `trips`
   - `itinerary_items`

## Troubleshooting

### Migration fails with "already exists" error
This is normal if you've run the migration before. The migrations use `IF NOT EXISTS` to prevent errors.

### Migration fails with RLS policy errors
If policies already exist, you may need to drop them first:
```sql
DROP POLICY IF EXISTS "policy_name" ON table_name;
```

### Tables don't appear
- Refresh the Table Editor page
- Check the SQL Editor for error messages
- Verify you're in the correct Supabase project
