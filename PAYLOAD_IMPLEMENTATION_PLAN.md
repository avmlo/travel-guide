# Payload CMS Implementation Plan for Urban Manual

**Project:** Urban Manual
**Stack:** Next.js 16 + Supabase + Vercel
**Date:** October 26, 2025

## Overview

This document provides a complete, step-by-step plan to integrate Payload CMS into the Urban Manual project. The implementation will leverage your existing Supabase PostgreSQL database and deploy to Vercel alongside your Next.js frontend.

## Phase 1: Pre-Implementation Setup (30 minutes)

### 1.1. Verify Prerequisites

Before starting, ensure you have the following:

- **Node.js**: Version 18.x or higher
- **Supabase Project**: Active project with PostgreSQL database
- **Vercel Account**: Connected to your GitHub repository
- **Database Access**: Supabase connection string with write permissions

### 1.2. Backup Current Database

Create a backup of your current Supabase database before making any changes:

```bash
# In Supabase Dashboard:
# 1. Go to Database → Backups
# 2. Click "Create Backup"
# 3. Name it: "pre-payload-backup-2025-10-26"
```

### 1.3. Prepare Environment Variables

Gather the following from your Supabase dashboard:

- `DATABASE_URL` (Direct connection string)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Phase 2: Install Payload CMS (45 minutes)

### 2.1. Install Payload Dependencies

In your `urban-manual-next` directory:

```bash
cd /home/ubuntu/urban-manual/urban-manual-next

# Install Payload core packages
pnpm add payload @payloadcms/next @payloadcms/richtext-lexical

# Install PostgreSQL adapter
pnpm add @payloadcms/db-postgres

# Install additional utilities
pnpm add sharp cross-env
```

### 2.2. Create Payload Configuration

Create a new file: `payload.config.ts` in the root of your Next.js project:

```typescript
import { buildConfig } from 'payload/config'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'

export default buildConfig({
  // Use your existing Supabase database
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  
  // Rich text editor
  editor: lexicalEditor({}),
  
  // Admin panel configuration
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- Urban Manual CMS',
      favicon: '/favicon.ico',
      ogImage: '/og-image.jpg',
    },
  },
  
  // Collections (content types)
  collections: [
    {
      slug: 'users',
      auth: true,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'role',
          type: 'select',
          options: ['admin', 'editor', 'viewer'],
          defaultValue: 'editor',
          required: true,
        },
      ],
    },
    {
      slug: 'destinations',
      admin: {
        useAsTitle: 'name',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
        },
        {
          name: 'city',
          type: 'text',
          required: true,
        },
        {
          name: 'category',
          type: 'select',
          options: [
            { label: 'Restaurant', value: 'restaurant' },
            { label: 'Cafe', value: 'cafe' },
            { label: 'Hotel', value: 'hotel' },
            { label: 'Bar', value: 'bar' },
            { label: 'Shop', value: 'shop' },
            { label: 'Bakery', value: 'bakery' },
          ],
          required: true,
        },
        {
          name: 'content',
          type: 'richText',
        },
        {
          name: 'mainImage',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'vibes',
          type: 'array',
          fields: [
            {
              name: 'vibe',
              type: 'text',
            },
          ],
        },
        {
          name: 'keywords',
          type: 'array',
          fields: [
            {
              name: 'keyword',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      slug: 'media',
      upload: {
        staticDir: 'media',
        imageSizes: [
          {
            name: 'thumbnail',
            width: 400,
            height: 300,
            position: 'centre',
          },
          {
            name: 'card',
            width: 768,
            height: 1024,
            position: 'centre',
          },
          {
            name: 'tablet',
            width: 1024,
            height: undefined,
            position: 'centre',
          },
        ],
        adminThumbnail: 'thumbnail',
        mimeTypes: ['image/*'],
      },
      fields: [
        {
          name: 'alt',
          type: 'text',
        },
      ],
    },
  ],
  
  // TypeScript configuration
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  
  // GraphQL configuration
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
})
```

### 2.3. Update Next.js Configuration

Modify `next.config.js` to include Payload:

```javascript
import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing config
  experimental: {
    reactCompiler: false,
  },
}

export default withPayload(nextConfig)
```

### 2.4. Update Environment Variables

Add to your `.env.local`:

```bash
# Payload Configuration
PAYLOAD_SECRET=your-super-secret-key-here-min-32-chars
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Database (use your existing Supabase connection)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Supabase (keep existing)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Generate a secure secret:**
```bash
openssl rand -base64 32
```

## Phase 3: Create Payload Admin Routes (15 minutes)

### 3.1. Create Admin Route Handler

Create: `app/(payload)/admin/[[...segments]]/page.tsx`

```typescript
import { generatePageMetadata } from '@payloadcms/next/utilities'
import config from '@payload-config'
import { RootPage, generateMetadata } from '@payloadcms/next/views'

export const metadata = generatePageMetadata({ config })

const Page = ({ params, searchParams }) => {
  return <RootPage params={params} searchParams={searchParams} config={config} />
}

export default Page
```

### 3.2. Create API Route Handler

Create: `app/(payload)/api/[...slug]/route.ts`

```typescript
import { REST_DELETE, REST_GET, REST_PATCH, REST_POST } from '@payloadcms/next/routes'

export const GET = REST_GET
export const POST = REST_POST
export const DELETE = REST_DELETE
export const PATCH = REST_PATCH
```

## Phase 4: Database Migration (30 minutes)

### 4.1. Initialize Payload Database

Payload will automatically create the necessary tables in your Supabase database:

```bash
# Build the project
pnpm build

# This will:
# 1. Create Payload tables in Supabase
# 2. Generate TypeScript types
# 3. Set up the admin panel
```

### 4.2. Verify Database Tables

After building, check your Supabase dashboard. You should see new tables:

- `payload_preferences`
- `users`
- `destinations` (if not exists)
- `media`
- `payload_migrations`

### 4.3. Create Initial Admin User

```bash
# Start development server
pnpm dev

# Navigate to: http://localhost:3000/admin
# Create your first admin user through the UI
```

## Phase 5: Migrate Existing Data (1-2 hours)

### 5.1. Data Migration Strategy

You have two options for migrating existing destination data:

**Option A: Keep Existing Table (Recommended)**
- Modify Payload config to use your existing `destinations` table
- Add any missing columns Payload needs
- Keep your existing data intact

**Option B: Fresh Start**
- Export existing data
- Let Payload create new tables
- Import data through Payload API

### 5.2. Migration Script (Option A)

Create: `scripts/migrate-to-payload.ts`

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

async function migrate() {
  const payload = await getPayload({ config })
  
  // Fetch existing destinations from Supabase
  const { data: existingDestinations } = await supabase
    .from('destinations')
    .select('*')
  
  // Migrate each destination to Payload format
  for (const dest of existingDestinations) {
    await payload.create({
      collection: 'destinations',
      data: {
        name: dest.name,
        slug: dest.slug,
        city: dest.city,
        category: dest.category,
        content: dest.content,
        // ... map other fields
      },
    })
  }
  
  console.log('Migration complete!')
}

migrate()
```

## Phase 6: Vercel Deployment (30 minutes)

### 6.1. Configure Vercel Environment Variables

In your Vercel dashboard, add:

```bash
PAYLOAD_SECRET=your-production-secret
NEXT_PUBLIC_SERVER_URL=https://your-domain.vercel.app
DATABASE_URL=your-supabase-connection-string
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 6.2. Update Build Configuration

In Vercel project settings:

- **Build Command**: `pnpm build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`

### 6.3. Deploy

```bash
# Commit changes
git add .
git commit -m "Add Payload CMS integration"
git push origin main

# Vercel will automatically deploy
```

### 6.4. Verify Deployment

After deployment:
1. Visit `https://your-domain.vercel.app/admin`
2. Log in with your admin credentials
3. Test creating a new destination
4. Verify data appears in Supabase

## Phase 7: Integration with Frontend (1-2 hours)

### 7.1. Update API Routes

Replace tRPC calls with Payload API calls where needed:

```typescript
// Before (tRPC)
const destinations = await trpc.destinations.getAll.query()

// After (Payload)
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
const destinations = await payload.find({
  collection: 'destinations',
  limit: 100,
})
```

### 7.2. Update Type Definitions

Payload auto-generates TypeScript types:

```typescript
import type { Destination, Media } from '@/payload-types'

// Use these types throughout your app
const destination: Destination = {
  name: 'Example',
  slug: 'example',
  // ... TypeScript will validate
}
```

## Phase 8: Testing & Validation (1 hour)

### 8.1. Test Checklist

- [ ] Admin panel accessible at `/admin`
- [ ] Can create new destinations
- [ ] Can upload images
- [ ] Images are optimized and served
- [ ] API endpoints return correct data
- [ ] Frontend displays Payload data correctly
- [ ] Search functionality works
- [ ] Filters work with Payload data

### 8.2. Performance Testing

```bash
# Test API response times
curl -w "@curl-format.txt" -o /dev/null -s "https://your-domain.vercel.app/api/destinations"

# Expected: < 200ms response time
```

## Phase 9: Post-Implementation (Ongoing)

### 9.1. Content Migration

- Migrate all 921 destinations from old format to Payload
- Verify data integrity
- Update any hardcoded references

### 9.2. Team Onboarding

- Create editor accounts for team members
- Document content creation workflow
- Set up role-based permissions

### 9.3. Monitoring

- Set up error tracking (Sentry)
- Monitor API performance
- Track database query performance

## Estimated Timeline

| Phase | Duration | Complexity |
|-------|----------|------------|
| 1. Pre-Implementation | 30 min | Low |
| 2. Install Payload | 45 min | Medium |
| 3. Create Routes | 15 min | Low |
| 4. Database Migration | 30 min | Medium |
| 5. Migrate Data | 1-2 hours | High |
| 6. Vercel Deployment | 30 min | Medium |
| 7. Frontend Integration | 1-2 hours | High |
| 8. Testing | 1 hour | Medium |
| **Total** | **5-7 hours** | |

## Rollback Plan

If issues arise, you can rollback:

1. **Revert Git Commit**: `git revert HEAD`
2. **Restore Database Backup**: Use Supabase backup from Phase 1
3. **Redeploy Previous Version**: Vercel → Deployments → Redeploy

## Support Resources

- **Payload Docs**: https://payloadcms.com/docs
- **Payload Discord**: https://discord.com/invite/payload
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

## Next Steps

Once implementation is complete, consider:

1. **Add Visual Editing**: Enable live preview for content editors
2. **Set Up Webhooks**: Trigger rebuilds on content changes
3. **Implement Caching**: Use Next.js ISR for better performance
4. **Add Localization**: Support multiple languages
5. **Create Custom Fields**: Add Urban Manual-specific fields

---

**Ready to start?** Let me know and I can help you implement each phase step-by-step!

