# Payload CMS Setup Guide

## Environment Variables Required

The CMS requires these environment variables to be set in Vercel:

### 1. DATABASE_URL (REQUIRED)
This is your Supabase PostgreSQL connection string:
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

**How to get it:**
1. Go to Supabase Dashboard
2. Project Settings > Database
3. Copy the "Connection String" (URI format)
4. Make sure to replace `[YOUR-PASSWORD]` with your actual database password

### 2. PAYLOAD_SECRET (REQUIRED)
A secure random string for encryption:
```
PAYLOAD_SECRET=your-secure-random-secret-key-minimum-32-characters
```

**How to generate:**
```bash
openssl rand -base64 32
```

## Accessing the CMS

Once environment variables are set:

1. **Admin Panel URL:** `https://your-domain.vercel.app/admin`
2. **First Time Setup:**
   - Visit `/admin`
   - Create your first admin user
   - Email: your-email@example.com
   - Password: (choose a secure password)

## Troubleshooting

### "CMS not working" / Blank page
**Cause:** Missing DATABASE_URL or PAYLOAD_SECRET
**Fix:** Add both environment variables in Vercel and redeploy

### Connection refused / Database error
**Cause:** Invalid DATABASE_URL
**Fix:** 
1. Verify your Supabase connection string is correct
2. Make sure your database password is correct
3. Check that your Supabase project is active

### Tables not created
**Cause:** Payload auto-creates tables on first run
**Fix:** 
1. Make sure DATABASE_URL is correct
2. Redeploy after setting environment variables
3. Visit `/admin` to trigger initial setup

## Current Vercel Environment Variables Needed

```env
# Required for CMS
DATABASE_URL=postgresql://...
PAYLOAD_SECRET=your-secret-key

# Already configured (for app functionality)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_GOOGLE_API_KEY=...
```

## Checking if CMS is working

Visit: `https://your-domain.vercel.app/admin`

- ✅ You should see a login screen
- ❌ If you see 404 or blank page → environment variables missing
- ❌ If you see database error → DATABASE_URL incorrect

## Managing Destinations via CMS

Once logged in:
1. Click "Destinations" in the sidebar
2. Add/Edit/Delete destinations
3. All changes sync to Supabase automatically
4. Front-end will display updates immediately
