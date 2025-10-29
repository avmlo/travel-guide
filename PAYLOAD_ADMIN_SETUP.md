# Payload CMS Admin Panel Setup

## Current Error on Vercel

You're seeing: **"Application error: a server-side exception has occurred"**

This is because the Payload admin panel requires a **real PostgreSQL database** to function, but the current `.env` has placeholder values.

## Quick Fix for Vercel Deployment

### Step 1: Set Up a PostgreSQL Database

Choose one of these options:

#### Option A: Vercel Postgres (Recommended)
1. Go to your Vercel project dashboard
2. Navigate to the "Storage" tab
3. Click "Create Database"
4. Select "Postgres"
5. Copy the `POSTGRES_URL` connection string

#### Option B: Neon (Free Tier Available)
1. Go to [neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string

#### Option C: Supabase Postgres
1. Go to your Supabase project
2. Navigate to Settings → Database
3. Copy the "Connection string" (in "Connection pooling" section)

### Step 2: Configure Vercel Environment Variables

1. Go to your Vercel project settings
2. Navigate to **Settings** → **Environment Variables**
3. Add these required variables:

```bash
# REQUIRED - Your PostgreSQL connection string
# Note: Vercel Postgres automatically sets POSTGRES_URL
POSTGRES_URL=postgresql://user:password@host:port/database

# REQUIRED - Generate with: openssl rand -base64 32
PAYLOAD_SECRET=<your-secure-random-string>

# OPTIONAL - Keep these for backward compatibility
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-key
SUPABASE_SERVICE_ROLE_KEY=placeholder-service-key
```

**Note:** If you're using Vercel Postgres, the `POSTGRES_URL` is automatically set when you create the database. You only need to add `PAYLOAD_SECRET`.

### Step 3: Redeploy

1. After adding environment variables, click **"Redeploy"** in Vercel
2. Or push a new commit to trigger a deployment

## Accessing the Admin Panel

Once deployed with the correct database URL:

1. Visit: `https://your-vercel-url.vercel.app/admin`
2. **First visit**: You'll be prompted to create your first admin user
3. Fill in:
   - Email
   - Password
   - Display name
4. Click "Create First User"
5. You're now logged in to the Payload CMS admin panel!

## Local Development Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your local PostgreSQL connection:
   ```bash
   POSTGRES_URL=postgresql://user:password@localhost:5432/urban_manual
   PAYLOAD_SECRET=$(openssl rand -base64 32)
   ```

3. Start your local PostgreSQL database

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Visit `http://localhost:3000/admin`

## Database Migrations

Payload CMS automatically creates the necessary database tables on first run. You don't need to run migrations manually.

## Troubleshooting

### Error: "Application error: a server-side exception"
- **Cause**: Database connection failed
- **Fix**: Verify your `POSTGRES_URL` is correct and the database is accessible

### Error: "Connection refused"
- **Cause**: PostgreSQL database is not running or not accessible
- **Fix**: Check your database service is running

### Error: "Invalid credentials"
- **Cause**: Wrong username/password in `POSTGRES_URL`
- **Fix**: Update the connection string with correct credentials

### Error: "PAYLOAD_SECRET is required"
- **Cause**: Missing or invalid `PAYLOAD_SECRET` environment variable
- **Fix**: Generate a new secret with `openssl rand -base64 32`

## Next Steps

After the admin panel is accessible:

1. **Migrate data** from Supabase to Payload using the migration scripts
2. **Create collections** for your 897 destinations
3. **Import media** to the Media collection
4. **Test the admin UI** by creating a few test destinations

## Admin Panel Features

Once set up, you'll have access to:

- ✅ Dashboard view
- ✅ Destinations management (897 items to migrate)
- ✅ Cities management
- ✅ Categories (Restaurant, Cafe, Hotel, Bar, Shop, Bakery)
- ✅ Users and authentication
- ✅ Media library
- ✅ Reviews and ratings
- ✅ Trips and saved places
- ✅ Version history and drafts
