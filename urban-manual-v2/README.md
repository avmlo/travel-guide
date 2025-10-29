# Urban Manual v2

A premium travel and destination discovery application built with Next.js 15, Payload CMS, Stytch authentication, and Supabase.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Then edit .env.local with your credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## ✨ Features

- ✅ **Payload CMS** - Admin panel at `/admin`
- ✅ **Stytch Auth** - Passkeys + Magic Links + Apple Sign In
- ✅ **Supabase** - PostgreSQL database
- ✅ **Builder.io Ready** - Visual editing
- ✅ **Next.js 15** - App Router
- ✅ **TypeScript** - Full type safety
- ✅ **Tailwind CSS** - Modern styling

## 📦 Tech Stack

- Next.js 15.2.3
- Payload CMS 3.x
- Stytch Authentication
- Supabase PostgreSQL
- Tailwind CSS 4.x
- TypeScript 5.x

## 🔧 Setup

### Environment Variables

Required in `.env.local`:

```bash
# Payload CMS
PAYLOAD_SECRET=your-secret-key
DATABASE_URL=postgresql://...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key

# Stytch
STYTCH_PROJECT_ID=your-id
STYTCH_SECRET=your-secret
NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN=your-token

# Builder.io
NEXT_PUBLIC_BUILDER_API_KEY=your-key
```

### First Run

1. Start dev server: `npm run dev`
2. Visit `/admin` to create admin user
3. Add destinations via Payload CMS
4. Configure Stytch authentication

## 📁 Structure

```
app/
├── layout.tsx           # Root layout with Stytch
├── page.tsx             # Homepage
├── auth/login/          # Login page
└── (payload)/admin/     # Payload CMS

lib/
├── supabase.ts          # Supabase client
├── stytch.ts            # Stytch config
└── utils.ts             # Utilities

payload.config.ts        # CMS configuration
```

## 🎨 Builder.io Integration

### Dev Command

```bash
npm run dev
```

### Setup in Builder.io

1. Set Preview URL: `http://localhost:3000`
2. Connect GitHub repo: `avmlo/urban-manual`
3. Branch: `components` or `main`

## 🚀 Deployment

### Vercel

```bash
vercel
```

Add all environment variables in Vercel dashboard.

## 📚 Documentation

- [Payload CMS](https://payloadcms.com/docs)
- [Stytch](https://stytch.com/docs)
- [Next.js](https://nextjs.org/docs)
- [Builder.io](https://www.builder.io/c/docs)

---

**Urban Manual v2** - Built with modern web technologies
