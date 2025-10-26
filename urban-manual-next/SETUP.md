# Urban Manual - Setup Guide

Complete setup instructions for running The Urban Manual locally and in production.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before starting, ensure you have:
- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** or **pnpm** package manager
- **Supabase account** ([Sign up free](https://supabase.com))
- **Google Cloud account** (optional, for Distance Matrix API)

---

## 🔐 Environment Variables

### Step 1: Copy the example file

```bash
cd urban-manual-next
cp .env.example .env.local
```

### Step 2: Fill in required values

Open `.env.local` and add your credentials:

#### ✅ REQUIRED: Supabase Configuration

Get these from your Supabase project:
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** > **API**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### ⚙️ OPTIONAL: Google Maps API

For real travel times in the Route Optimizer:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project or select existing
3. Enable these APIs:
   - **Distance Matrix API**
   - **Maps JavaScript API**
4. Go to **Credentials** and create an API key

```bash
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Note:** If not provided, the app will use Haversine distance estimates (less accurate but free).

---

## 🗄️ Database Setup

### Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **New Project**
3. Fill in:
   - **Project name**: urban-manual
   - **Database password**: (save this securely)
   - **Region**: Choose closest to your users
4. Click **Create new project**
5. Wait ~2 minutes for provisioning

### Step 2: Run Migrations

**⚠️ CRITICAL:** All features require migrations. Run these in order:

1. Open your Supabase project
2. Click **SQL Editor** in left sidebar
3. Click **New query**

#### Migration 1: Core Features (saved/visited places)

Copy entire contents of `migrations/saved_visited_places.sql` → Paste → **Run**

✅ Enables: Saving destinations, marking as visited

#### Migration 2: Trip Planning

Copy entire contents of `migrations/trips.sql` → Paste → **Run**

✅ Enables: Trip creation, itinerary planning

#### Migration 3: Social Features

Copy entire contents of `migrations/social-features.sql` → Paste → **Run**

✅ Enables: Lists, Feed, Reviews, Activities

### Step 3: Verify Migrations

Go to **Table Editor** and verify these tables exist:

**Core Tables:**
- `saved_places`
- `visited_places`

**Trip Tables:**
- `trips`
- `itinerary_items`

**Social Tables:**
- `user_profiles`
- `lists`
- `list_items`
- `activities`
- `follows`
- `reviews`
- `comments`
- `notifications`
- `list_likes`
- `review_helpful`

**Missing tables?** See [Troubleshooting](#database-issues) below.

---

## 💻 Local Development

### Install Dependencies

```bash
cd urban-manual-next
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Test Features

1. **Sign up / Sign in** - Create an account via Supabase auth
2. **Browse destinations** - Homepage catalog
3. **Save destinations** - Click heart icon (requires login)
4. **Create a trip** - Go to `/trips` page
5. **Create a list** - Go to `/lists` page
6. **View feed** - Go to `/feed` page
7. **Optimize route** - Go to `/optimize` page

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click **Import Project**
   - Select your GitHub repository
   - Set **Root Directory** to `urban-manual-next`

3. **Configure Environment Variables:**
   In Vercel project settings, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GOOGLE_MAPS_API_KEY` (optional)

4. **Deploy:**
   - Click **Deploy**
   - Wait ~2 minutes
   - Your app is live! 🎉

### Deploy to Other Platforms

The app is a standard Next.js 15 app and works on:
- **Netlify** - [Guide](https://docs.netlify.com/frameworks/next-js/)
- **Cloudflare Pages** - [Guide](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- **Railway** - [Guide](https://docs.railway.app/guides/nextjs)

---

## 🐛 Troubleshooting

### Database Issues

#### Error: "Failed to create trip"

**Cause:** `trips` table doesn't exist

**Fix:**
1. Go to Supabase SQL Editor
2. Run `migrations/trips.sql`
3. Verify `trips` table in Table Editor
4. Try again

#### Error: "relation does not exist"

**Cause:** Migration not run

**Fix:**
1. Check which table is mentioned in error
2. Run corresponding migration:
   - `saved_places` / `visited_places` → `saved_visited_places.sql`
   - `trips` → `trips.sql`
   - `lists` / `user_profiles` / `activities` → `social-features.sql`

#### Tables created but features not working

**Fix:**
1. Clear browser cache
2. Log out and log back in
3. Check browser console for errors
4. Verify RLS policies are enabled (Table Editor → click table → RLS tab)

### Authentication Issues

#### Can't sign up

**Check:**
1. Supabase credentials in `.env.local` are correct
2. Email confirmation is disabled (Supabase → Authentication → Settings → disable "Confirm email")

#### Signed in but can't save/visit places

**Check:**
1. Migrations are run (see Database Setup)
2. User is actually authenticated (check browser dev tools → Application → Local Storage)
3. RLS policies are working (try query in SQL Editor)

### Development Issues

#### Build fails with TypeScript errors

**Fix:**
```bash
npm run build
```

Check the error message and ensure all migrations are run.

#### Port 3000 already in use

**Fix:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

#### API routes not working

**Check:**
1. `.env.local` exists and has correct values
2. Restart dev server after changing environment variables
3. Check `/api/distance` returns data (if using Google Maps API)

### Google Maps API Issues

#### Distance calculations not accurate

**Cause:** Google Maps API key not set or invalid

**Fix:**
1. Check API key in `.env.local`
2. Verify Distance Matrix API is enabled in Google Cloud Console
3. Check API key restrictions don't block localhost

**Workaround:** App falls back to Haversine distance estimates automatically

---

## 📚 Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Supabase Documentation**: https://supabase.com/docs
- **React Documentation**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs

## 🆘 Getting Help

1. Check `migrations/README.md` for database setup details
2. Review error messages in browser console (F12)
3. Check Supabase logs (Dashboard → Logs)
4. Open an issue on GitHub with:
   - Error message
   - Steps to reproduce
   - Environment (dev/production)

---

## ✅ Deployment Checklist

Before going to production:

- [ ] All migrations run in Supabase
- [ ] Environment variables set in production
- [ ] Email confirmation configured in Supabase (Settings → Auth)
- [ ] RLS policies verified on all tables
- [ ] Google Maps API key restrictions set (optional)
- [ ] Custom domain configured (optional)
- [ ] Analytics configured (optional)

---

**Last updated:** 2025-10-26

Made with ❤️ using Next.js, Supabase, and Tailwind CSS
