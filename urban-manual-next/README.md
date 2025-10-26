# Urban Manual Next.js App

A modern travel guide application built with Next.js 16, featuring destination discovery, map views, and AI-powered recommendations.

## Features

- Browse curated travel destinations
- Interactive map view powered by Google Maps
- Save and organize destinations into lists
- AI-powered recommendations
- Social features (save counts, activity feed)

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Supabase account
- Google Maps API key (for map view feature)

### Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Configure the required environment variables:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Maps (required for map view feature)
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_maps_api_key
```

#### Getting a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Maps JavaScript API
4. Go to "Credentials" and create an API key
5. (Recommended) Restrict the API key to your domain

### Installation

Install dependencies:

```bash
npm install --legacy-peer-deps
# or
yarn install
# or
pnpm install
```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Database Setup

The app uses Supabase for data storage. Run the migrations in the `migrations/` directory in order:

1. `destination-enrichment.sql` - Adds place_id and enrichment fields
2. `saved_visited_places.sql` - Adds user saved/visited tracking
3. `social-features.sql` - Adds activity feeds and lists
4. `trips.sql` - Adds trip planning features

## Project Structure

```
urban-manual-next/
├── app/              # Next.js app directory (pages and routes)
├── components/       # React components
├── lib/             # Utility functions and API clients
├── types/           # TypeScript type definitions
├── migrations/      # Database migration scripts
└── public/          # Static assets
```

## Key Technologies

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Maps**: Google Maps JavaScript API
- **Analytics**: Vercel Analytics & Speed Insights
- **AI**: Google Cloud Discovery Engine (optional)

## Deployment

The app is configured for deployment on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

For more details, check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
