# Urban Manual - Sanity CMS Edition

A clean, modern travel guide built with Next.js 15 and Sanity CMS.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Sanity

1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Create a new project (free plan)
3. Copy your Project ID
4. Update `.env.local`:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production
```

### 3. Run Development Server

```bash
npm run dev
```

- **Frontend:** http://localhost:3000
- **Sanity Studio:** http://localhost:3000/studio

## 📦 What's Included

- ✅ **Next.js 15** - Latest App Router
- ✅ **Sanity CMS** - Hosted headless CMS
- ✅ **Tailwind CSS** - Modern styling
- ✅ **TypeScript** - Full type safety
- ✅ **Clean Design** - Minimal, elegant UI

## 🏗️ Project Structure

```
urban-manual/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Homepage
│   └── studio/            # Sanity Studio
├── sanity/
│   ├── schemas/           # Content schemas
│   │   ├── destination.ts
│   │   ├── city.ts
│   │   └── category.ts
│   └── lib/               # Sanity client & utils
├── sanity.config.ts       # Sanity configuration
└── .env.local             # Environment variables
```

## 📝 Content Types

### Destination
- Name, slug, brand, designer
- Category & city (references)
- Images, location, Michelin stars
- Featured flag (crown)

### City
- Name, slug, country
- Image & description

### Category
- Name, slug, description

## 🎨 Features

- **Clean Grid Layout** - Responsive destination cards
- **Image Optimization** - Next.js Image component
- **Sanity Studio** - Built-in CMS at `/studio`
- **Type-Safe** - Full TypeScript support
- **Production Ready** - Optimized build

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy!

### Environment Variables

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
```

## 📚 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Sanity Docs](https://www.sanity.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🎯 Next Steps

1. **Add Destinations** - Use Sanity Studio to add content
2. **Customize Design** - Edit Tailwind classes
3. **Add Features** - Search, filters, maps, etc.
4. **Deploy** - Push to production

---

Built with ❤️ using Next.js and Sanity

