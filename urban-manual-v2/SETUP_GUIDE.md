# Urban Manual v2 - Complete Setup Guide

## 🎯 What We Built

A production-ready travel discovery app with:

✅ **Payload CMS** - Full content management system  
✅ **Stytch Authentication** - Passkeys + Magic Links + Apple Sign In  
✅ **Supabase Integration** - PostgreSQL database  
✅ **Builder.io Ready** - Visual editing capability  
✅ **Next.js 15** - Modern React framework  
✅ **TypeScript** - Type-safe codebase  
✅ **Tailwind CSS** - Beautiful styling  

---

## 🚀 Quick Start (5 minutes)

### 1. Clone and Install

```bash
cd urban-manual-v2
npm install
```

### 2. Set Up Environment Variables

Copy `.env.local` from the old project or create new one:

```bash
# Payload CMS
PAYLOAD_SECRET=your-secret-key-min-32-chars
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/urban_manual

# Supabase (copy from old project)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stytch (get from stytch.com)
STYTCH_PROJECT_ID=project-test-xxx
STYTCH_SECRET=secret-test-xxx
NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN=public-token-test-xxx

# Builder.io (get from builder.io)
NEXT_PUBLIC_BUILDER_API_KEY=your-builder-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Access the App

- **Homepage:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin
- **Login:** http://localhost:3000/auth/login

---

## 📋 Detailed Setup

### Payload CMS Setup

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Visit the admin panel:**
   - Go to http://localhost:3000/admin
   - Create your first admin user
   - Email: your-email@example.com
   - Password: (strong password)

3. **Collections Available:**
   - **Users** - Admin users with roles
   - **Destinations** - Travel destinations
   - **Media** - Image uploads
   - **Pages** - Custom pages

### Stytch Authentication Setup

1. **Create Stytch Account:**
   - Go to https://stytch.com
   - Sign up for free account
   - Create a new project

2. **Enable Authentication Methods:**
   - **Magic Links:** Email-based authentication
   - **WebAuthn:** Passkeys (biometric)
   - **OAuth:** Apple Sign In

3. **Configure Redirect URLs:**
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`

4. **Copy Credentials:**
   - Project ID → `STYTCH_PROJECT_ID`
   - Secret → `STYTCH_SECRET`
   - Public Token → `NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN`

### Supabase Setup

Your existing Supabase database will work! Just copy the credentials:

```bash
# From old .env.local
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

The app will read from your existing `destinations` table.

### Builder.io Setup

1. **Create Builder.io Account:**
   - Go to https://builder.io
   - Sign up (free tier available)
   - Create a new space

2. **Get API Key:**
   - Press `Cmd/Ctrl + K` (Command Palette)
   - Type "API"
   - Copy Public API Key

3. **Connect GitHub:**
   - Go to Builder.io dashboard
   - Click "Connect GitHub"
   - Select `avmlo/urban-manual`
   - Branch: `components`

4. **Configure Dev Command:**
   - **Setup Command:** `cd urban-manual-v2 && npm install`
   - **Dev Command:** `cd urban-manual-v2 && npm run dev`

5. **Set Preview URL:**
   - Go to Models → Page
   - Set Preview URL: `http://localhost:3000`

---

## 🎨 Using the App

### Adding Destinations

1. Go to http://localhost:3000/admin
2. Click "Destinations" → "Create New"
3. Fill in:
   - Name, City, Country
   - Category (museum, restaurant, etc.)
   - Description
   - Upload images
   - Location (lat/long)
   - Contact info
   - Social media
4. Click "Publish"

### Managing Users

1. Go to "Users" collection
2. Create users with roles:
   - **Admin:** Full access
   - **Editor:** Can edit content
   - **User:** Read-only

### Uploading Media

1. Go to "Media" collection
2. Upload images
3. Automatic resizing:
   - Thumbnail: 400x300
   - Card: 768x1024
   - Hero: 1920x1080

---

## 🔐 Authentication Flow

### Magic Link Login

1. User enters email
2. Receives magic link via email
3. Clicks link → authenticated

### Passkey Login

1. User clicks "Sign in with Passkey"
2. Uses biometric (Face ID, Touch ID, fingerprint)
3. Authenticated instantly

### Apple Sign In

1. User clicks "Sign in with Apple"
2. OAuth flow
3. Authenticated with Apple ID

---

## 🚀 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd urban-manual-v2
vercel
```

### Environment Variables in Vercel

Add all variables from `.env.local`:

```bash
vercel env add PAYLOAD_SECRET
vercel env add DATABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
# ... etc
```

### Database for Production

Use your existing Supabase database or create a new one:

1. Go to Supabase dashboard
2. Create new project (or use existing)
3. Copy connection string
4. Add to Vercel env vars

---

## 📁 Project Structure

```
urban-manual-v2/
├── app/
│   ├── layout.tsx              # Root layout with Stytch
│   ├── page.tsx                # Homepage with destinations
│   ├── auth/
│   │   └── login/
│   │       └── page.tsx        # Login page
│   └── (payload)/
│       └── admin/              # Payload CMS admin (auto-generated)
│
├── lib/
│   ├── supabase.ts             # Supabase client
│   ├── stytch.ts               # Stytch configuration
│   └── utils.ts                # Utility functions
│
├── payload.config.ts           # Payload CMS config
├── next.config.ts              # Next.js config
├── .env.local                  # Environment variables
└── package.json                # Dependencies
```

---

## 🔧 Development Workflow

### Local Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Adding New Collections

Edit `payload.config.ts`:

```typescript
{
  slug: 'your-collection',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    // Add more fields...
  ],
}
```

### Adding New Pages

Create in `app/` directory:

```typescript
// app/about/page.tsx
export default function AboutPage() {
  return <div>About Us</div>
}
```

---

## 🐛 Troubleshooting

### "Cannot connect to database"

**Solution:**
- Check `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Verify Supabase project is active

### "Stytch authentication failed"

**Solution:**
- Verify Stytch credentials in `.env.local`
- Check redirect URLs in Stytch dashboard
- Ensure authentication methods are enabled

### "Builder.io not connecting"

**Solution:**
- Verify dev server is running (`npm run dev`)
- Check `NEXT_PUBLIC_BUILDER_API_KEY`
- Ensure Preview URL is `http://localhost:3000`
- Try hard refresh (Cmd/Ctrl + Shift + R)

### "Images not loading"

**Solution:**
- Check Supabase storage permissions
- Verify image URLs are valid
- Ensure Sharp is installed (`npm install sharp`)

### "Payload admin not loading"

**Solution:**
- Check `PAYLOAD_SECRET` is at least 32 characters
- Verify `DATABASE_URL` is correct
- Clear browser cache
- Check console for errors

---

## 📊 Database Schema

### Destinations Table (Supabase)

```sql
CREATE TABLE destinations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  main_image TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  address TEXT,
  website TEXT,
  phone TEXT,
  instagram TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Payload Collections (Auto-created)

Payload will automatically create tables for:
- `users` - Admin users
- `media` - Uploaded images
- `pages` - Custom pages
- `payload_preferences` - User preferences
- `payload_migrations` - Schema migrations

---

## 🎯 Next Steps

### Immediate (Today)

1. ✅ Set up environment variables
2. ✅ Create first admin user
3. ✅ Add 5-10 test destinations
4. ✅ Test authentication flow

### Short-term (This Week)

1. Configure Stytch authentication
2. Connect Builder.io for visual editing
3. Customize homepage design
4. Add navigation component
5. Deploy to Vercel

### Long-term (This Month)

1. Import all destinations from old database
2. Add search functionality
3. Implement favorites/bookmarks
4. Add user profiles
5. SEO optimization
6. Analytics integration

---

## 📚 Resources

### Documentation

- [Payload CMS Docs](https://payloadcms.com/docs)
- [Stytch Docs](https://stytch.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Builder.io Docs](https://www.builder.io/c/docs)

### Video Tutorials

- [Payload CMS Crash Course](https://www.youtube.com/results?search_query=payload+cms+tutorial)
- [Stytch Authentication](https://www.youtube.com/results?search_query=stytch+authentication)
- [Next.js 15 App Router](https://www.youtube.com/results?search_query=nextjs+15+app+router)

### Community

- [Payload Discord](https://discord.gg/payload)
- [Next.js Discord](https://discord.gg/nextjs)
- [Stytch Slack](https://stytch.com/slack)

---

## 🎉 You're All Set!

Your Urban Manual v2 is ready to go. Start by:

1. Running `npm run dev`
2. Creating your admin user at `/admin`
3. Adding your first destination
4. Testing the login flow

**Questions?** Check the troubleshooting section or reach out for help!

---

**Built with ❤️ for Urban Manual**

