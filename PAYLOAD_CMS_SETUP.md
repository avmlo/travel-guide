# Payload CMS Setup Guide

Payload CMS has been configured for The Urban Manual admin panel. Access it at `/admin`.

## Prerequisites

1. **PostgreSQL Database Connection**
   - Payload uses your Supabase PostgreSQL database
   - You need the PostgreSQL connection string (not the Supabase client)

## Environment Variables

Add these to your `.env.local` file in the `urban-manual-next/` directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Payload Database (PostgreSQL Connection String)
PAYLOAD_DATABASE_URI=postgresql://postgres:[YOUR-PASSWORD]@db.your-project.supabase.co:5432/postgres

# Server URL
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

### Getting Your Supabase PostgreSQL Connection String

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Find **Connection String** section
4. Copy the **URI** format (not the connection pooler)
5. Replace `[YOUR-PASSWORD]` with your database password

Example:
```
postgresql://postgres:yourpassword@db.abcdefghijklmnop.supabase.co:5432/postgres
```

## First-Time Setup

1. **Install Dependencies** (already done)
   ```bash
   cd urban-manual-next
   npm install
   ```

2. **Add Environment Variables**
   - Create `.env.local` file in `urban-manual-next/`
   - Add all variables listed above

3. **Build the Project**
   ```bash
   npm run build
   ```
   This will generate Payload types and schema

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access Admin Panel**
   - Open browser to `http://localhost:3000/admin`
   - Create your first admin user account

## Collections

The following collections are available in Payload:

### Users
- Authentication for admin panel
- Create your first user when you visit `/admin`

### Destinations
Manage all travel destinations with fields:
- Name & Slug
- City & Country
- Category
- Description (full & short)
- Image URL
- Michelin Stars (0-3)
- Crown (special designation)
- Location (latitude/longitude)
- Address
- Website

## Deployment to Vercel

When deploying to Vercel:

1. Add all environment variables in **Vercel Dashboard** → **Project Settings** → **Environment Variables**

2. Most importantly, add:
   ```
   PAYLOAD_DATABASE_URI=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
   NEXT_PUBLIC_SERVER_URL=https://your-domain.vercel.app
   ```

3. Payload will automatically run database migrations on build

## Database Schema

Payload will create its own tables in your PostgreSQL database:
- `payload_preferences`
- `payload_migrations`
- `users` (if not exists)
- Any other collection tables

These tables coexist with your existing Supabase tables.

## Usage

1. **Managing Destinations**
   - Go to `/admin/collections/destinations`
   - Add, edit, or delete destinations
   - All changes sync to your database immediately

2. **Media Management**
   - Currently configured for external URLs
   - Add image URLs in the "image" field
   - Can be extended to use Payload's media upload features

3. **User Management**
   - Create additional admin users at `/admin/collections/users`
   - Set permissions and roles as needed

## Syncing with Supabase

The Payload CMS connects directly to your PostgreSQL database. Any changes made through the admin panel will:
- Be immediately available in your Next.js app
- Sync with your Supabase database
- Work with existing RLS policies

## Troubleshooting

### Cannot connect to database
- Verify `PAYLOAD_DATABASE_URI` is correct
- Ensure your IP is whitelisted in Supabase (or use connection pooler)
- Check database password is correct

### Admin panel not loading
- Verify `NEXT_PUBLIC_SERVER_URL` matches your current URL
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Check that `sass` is installed for custom styles

## Next Steps

- Customize collections in `payload.config.ts`
- Add more fields to destinations
- Set up media upload with S3 or Supabase Storage
- Configure user roles and permissions
- Add webhooks for automation
