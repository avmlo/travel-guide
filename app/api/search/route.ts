import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) as string;
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// AI-powered query understanding
async function understandQuery(query: string): Promise<{
  keywords: string[];
  city?: string;
  category?: string;
  filters?: {
    openNow?: boolean;
    priceLevel?: number;
    rating?: number;
    michelinStar?: number;
  };
}> {
  if (!GOOGLE_API_KEY) {
    return parseQueryFallback(query);
  }

  try {
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    // Use gemini-1.5-pro for better performance, fallback to gemini-pro
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `Analyze this travel/dining search query and extract structured information. Return ONLY valid JSON with this exact structure:
{
  "keywords": ["array", "of", "main", "keywords"],
  "city": "city name or null",
  "category": "category like restaurant/cafe/hotel or null",
  "filters": {
    "openNow": true/false/null,
    "priceLevel": 1-4 or null,
    "rating": 4-5 or null,
    "michelinStar": 1-3 or null
  }
}

Query: "${query}"

Examples:
- "romantic restaurant in tokyo" → {"keywords": ["romantic", "restaurant"], "city": "tokyo", "category": "restaurant"}
- "best cafes paris open now" → {"keywords": ["best", "cafes"], "city": "paris", "category": "cafe", "filters": {"openNow": true}}
- "michelin star dining new york" → {"keywords": ["dining"], "city": "new york", "filters": {"michelinStar": 1}}

Return only the JSON, no other text:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from response (might have markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Gemini API error:', error);
  }

  return parseQueryFallback(query);
}

// Fallback parser if AI is unavailable
function parseQueryFallback(query: string): {
  keywords: string[];
  city?: string;
  category?: string;
  filters?: any;
} {
  const lowerQuery = query.toLowerCase();
  const words = query.split(/\s+/);

  const cities = ['tokyo', 'paris', 'new york', 'london', 'rome', 'barcelona', 'berlin', 'amsterdam', 'sydney', 'dubai'];
  const categories = ['restaurant', 'cafe', 'hotel', 'bar', 'shop', 'museum', 'park', 'temple', 'shrine'];
  
  let city: string | undefined;
  let category: string | undefined;
  const keywords: string[] = [];

  // Find city
  for (const cityName of cities) {
    if (lowerQuery.includes(cityName)) {
      city = cityName;
      break;
    }
  }

  // Find category
  for (const cat of categories) {
    if (lowerQuery.includes(cat)) {
      category = cat;
      break;
    }
  }

  // Extract keywords (excluding city and category)
  for (const word of words) {
    const lowerWord = word.toLowerCase();
    if (!city?.includes(lowerWord) && !category?.includes(lowerWord)) {
      if (word.length > 2) {
        keywords.push(word);
      }
    }
  }

  return { keywords, city, category };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, pageSize = 50, filters = {}, userId } = body;

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ 
        results: [], 
        searchTier: 'basic',
        error: 'Query too short' 
      });
    }

    // Use AI to understand the query
    const intent = await understandQuery(query);

    // Build Supabase query
    let supabaseQuery = supabase
      .from('destinations')
      .select('slug, name, city, category, description, content, image, michelin_stars, crown, rating, price_level')
      .limit(pageSize);

    // Apply city filter
    if (intent.city || filters.city) {
      const cityFilter = intent.city || filters.city;
      supabaseQuery = supabaseQuery.ilike('city', `%${cityFilter}%`);
    }

    // Apply category filter
    if (intent.category || filters.category) {
      const categoryFilter = intent.category || filters.category;
      supabaseQuery = supabaseQuery.ilike('category', `%${categoryFilter}%`);
    }

    // Apply rating filter
    if (intent.filters?.rating || filters.rating) {
      const minRating = intent.filters?.rating || filters.rating;
      supabaseQuery = supabaseQuery.gte('rating', minRating);
    }

    // Apply price level filter
    if (intent.filters?.priceLevel || filters.priceLevel) {
      const maxPrice = intent.filters?.priceLevel || filters.priceLevel;
      supabaseQuery = supabaseQuery.lte('price_level', maxPrice);
    }

    // Apply Michelin star filter
    if (intent.filters?.michelinStar || filters.michelinStar) {
      const stars = intent.filters?.michelinStar || filters.michelinStar;
      supabaseQuery = supabaseQuery.gte('michelin_stars', stars);
    }

    // Full-text search on keywords
    if (intent.keywords && intent.keywords.length > 0) {
      const searchTerms = intent.keywords.join(' & ');
      supabaseQuery = supabaseQuery.or(`name.ilike.%${intent.keywords[0]}%,description.ilike.%${intent.keywords[0]}%`);
    } else {
      // Fallback: search the entire query
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,city.ilike.%${query}%`);
    }

    const { data, error } = await supabaseQuery;

    if (error) {
      console.error('Supabase search error:', error);
      return NextResponse.json({ 
        results: [], 
        searchTier: 'basic',
        error: error.message 
      });
    }

    // Filter by "open now" if requested (requires opening hours data)
    let results = data || [];
    if (intent.filters?.openNow || filters.openNow) {
      // This would require checking current_opening_hours_json
      // For now, we'll return all results and mark this as a limitation
    }

    // Rank results by relevance
    const rankedResults = results
      .map((dest: any) => {
        let score = 0;
        const lowerName = (dest.name || '').toLowerCase();
        const lowerDesc = (dest.description || '').toLowerCase();
        const lowerQuery = query.toLowerCase();

        // Boost score for exact matches
        if (lowerName.includes(lowerQuery)) score += 10;
        if (lowerDesc.includes(lowerQuery)) score += 5;

        // Boost for keywords
        intent.keywords?.forEach((keyword: string) => {
          if (lowerName.includes(keyword.toLowerCase())) score += 3;
          if (lowerDesc.includes(keyword.toLowerCase())) score += 1;
        });

        // Boost for Michelin stars
        if (dest.michelin_stars) score += dest.michelin_stars * 2;

        // Boost for high ratings
        if (dest.rating && dest.rating >= 4.5) score += 2;

        return { ...dest, _score: score };
      })
      .sort((a: any, b: any) => b._score - a._score)
      .map(({ _score, ...rest }: any) => rest);

    // Generate suggestions based on intent
    const suggestions: string[] = [];
    if (intent.city && !intent.category) {
      suggestions.push(`Try "best restaurants in ${intent.city}"`);
      suggestions.push(`Try "top cafes in ${intent.city}"`);
    }
    if (intent.category && !intent.city) {
      suggestions.push(`Try "best ${intent.category}s in Tokyo"`);
      suggestions.push(`Try "best ${intent.category}s in Paris"`);
    }

    return NextResponse.json({
      results: rankedResults,
      searchTier: GOOGLE_API_KEY ? 'ai-enhanced' : 'basic',
      intent,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    });

  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json({
      results: [],
      searchTier: 'basic',
      error: error.message || 'Search failed',
    }, { status: 500 });
  }
}

