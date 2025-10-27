# Instagram Integration Setup

This guide explains how to add Instagram links to your destinations.

## Database Setup

### 1. Add Instagram Columns to Supabase

Run the migration in your Supabase SQL Editor:

```bash
# Navigate to Supabase Dashboard > SQL Editor
# Run the migration file: migrations/add_instagram_fields.sql
```

Or manually execute:

```sql
ALTER TABLE destinations
ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT;
```

---

## Adding Instagram Links

### Option 1: Manual Entry via Payload CMS (Easiest)

1. Go to `/admin` on your deployed site
2. Click on **Destinations**
3. Edit any destination
4. Scroll to find:
   - **Instagram Handle**: Enter username without @ (e.g., `restaurant_name`)
   - **Instagram URL**: Enter full profile URL (e.g., `https://www.instagram.com/restaurant_name/`)
5. Click **Save**

---

### Option 2: Bulk Import via CSV

1. Export your destinations from Supabase
2. Add two new columns: `instagram_handle` and `instagram_url`
3. Fill in the Instagram data
4. Import back to Supabase using the dashboard or SQL

Example CSV row:
```csv
slug,name,city,instagram_handle,instagram_url
chez-pierre,Chez Pierre,paris,chezpierre,https://www.instagram.com/chezpierre/
```

---

### Option 3: Fetch from Google Places API (Advanced)

The Google Places API sometimes includes social media links. If you have a destination's `place_id`, you can fetch Instagram from there.

See `scripts/enrich-destinations.ts` for an example enrichment script.

---

## How Instagram Links Appear

Once added, Instagram links will appear in the destination drawer under a "Connect" section with:
- 🌐 **Website** button (if available)
- 📞 **Call** button (if phone number available)
- 📷 **Instagram** button (gradient purple/pink styling)

---

## Finding Instagram Handles

### Manual Method:
1. Search Instagram for the destination name + city
2. Verify it's the correct account
3. Copy the username from the URL: `instagram.com/[username]`

### Automated Method (Future Enhancement):
- Could use Instagram Graph API (requires app approval)
- Could scrape from website footer/contact pages
- Could use third-party business data APIs

---

## API Reference

### Destination Object with Instagram:

```typescript
{
  slug: "chez-pierre",
  name: "Chez Pierre",
  city: "paris",
  instagram_handle: "chezpierre",        // Username only
  instagram_url: "https://www.instagram.com/chezpierre/",  // Full URL
  // ... other fields
}
```

---

## Need Help?

- Check if column exists: `SELECT column_name FROM information_schema.columns WHERE table_name = 'destinations';`
- Test Instagram link: Manually add one destination via Payload CMS and verify it appears in the drawer
