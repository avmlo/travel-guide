# Travel Guide

A modern, curated travel guide featuring 897 destinations across the world with AI-powered recommendations.

## Features

- 🌍 **897 Curated Destinations** - Handpicked places across major cities worldwide
- 🤖 **AI Travel Assistant** - Powered by Google Gemini for personalized recommendations
- 🗺️ **Interactive Map** - Visualize countries you've visited
- ⭐ **Michelin-Starred Restaurants** - Discover award-winning dining experiences
- 👤 **User Accounts** - Track visited places, save favorites, and build your travel profile
- 📱 **Responsive Design** - Beautiful on desktop and mobile
- 🎨 **Urban Manual Inspired** - Clean, minimal, editorial design

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, tRPC, Express
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## Environment Variables

Create a `.env` file in the root directory with:

```env
# Supabase
VITE_SUPABASE_URL=https://avdnefdfwvpjkuanhdwk.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Manus OAuth (if using)
APP_ID=your_app_id
APP_SECRET=your_app_secret

# Server
PORT=3002
NODE_ENV=production
```

## Deployment to Vercel

### Prerequisites
- Vercel account (sign up at https://vercel.com)
- GitHub account
- This repository pushed to GitHub

### Steps

1. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/yourusername/travel-guide.git
   git push -u origin master
   ```

2. **Deploy on Vercel**
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your `travel-guide` repository
   - Vercel will auto-detect the settings
   - Add environment variables in the Vercel dashboard
   - Click "Deploy"

3. **Configure Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env` file
   - Make sure to add them for Production, Preview, and Development

4. **Update Supabase URLs**
   - After deployment, get your Vercel URL
   - Add it to Supabase Authentication → URL Configuration
   - Site URL: `https://your-project.vercel.app`
   - Redirect URLs: `https://your-project.vercel.app/**`

## Local Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Database Setup

The project uses Supabase with the following tables:

### `destinations`
- Stores all travel destinations
- Fields: name, slug, city, category, description, image, michelin_stars, crown

### `visited_places`
- Tracks user's visited destinations
- Fields: user_id, destination_id, visited_date, rating, notes

### SQL Setup
Run these SQL commands in Supabase SQL Editor:

```sql
-- See setup_supabase.js for full schema
```

## Features Overview

### Home Page
- Browse 897 destinations
- Filter by city (pill-style buttons with counts)
- Search functionality
- Slideover drawer for destination details

### AI Assistant
- Natural language travel queries
- Recommendations from curated database only
- Itinerary generation
- Personalized greetings when logged in

### Account Page
- Travel statistics (places visited, cities explored, countries)
- Visited places grid with images and details
- Interactive world map showing visited countries
- Profile management

### Destination Details
- Large hero images
- Michelin star ratings
- One-click "Mark as Visited"
- Optional visit details (date, rating, notes)
- Save for later functionality

## Design Philosophy

Inspired by Urban Manual and Little Places London:
- Minimal, monochromatic color scheme
- Bold typography
- Large, beautiful imagery
- Story-led content
- Clean, editorial layout

## License

MIT

## Credits

Built with ❤️ using modern web technologies

