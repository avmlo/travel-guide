import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) as string;
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Simple, explicit query parsing - only extract what's clearly stated
function parseQuery(query: string): {
  city?: string;
  category?: string;
  michelinStars?: number | null;
  descriptiveKeyword?: string;
} {
  const lowerQuery = query.toLowerCase().trim();
  const result: {
    city?: string;
    category?: string;
    michelinStars?: number | null;
    descriptiveKeyword?: string;
  } = {};

  // Extract city - look for "in [city]" pattern or city name at end
  const cityPatterns = [
    /(?:in|at|near)\s+([a-z\s-]+)/i,
    /\b(tokyo|paris|london|new york|los angeles|singapore|hong kong|sydney|dubai|bangkok|berlin|amsterdam|rome|barcelona|lisbon|madrid|vienna|prague|stockholm|oslo|copenhagen|helsinki|san francisco|chicago|miami|seattle|boston|toronto|vancouver|melbourne|auckland)\b/i
  ];
  
  for (const pattern of cityPatterns) {
    const match = lowerQuery.match(pattern);
    if (match) {
      result.city = match[1]?.trim().replace(/\s+/g, '-') || match[0]?.trim().replace(/\s+/g, '-');
      break;
    }
  }

  // If no city pattern found, check if entire query is a city name
  if (!result.city) {
    const cityNames = ['tokyo', 'paris', 'london', 'new york', 'los angeles', 'singapore', 'hong kong', 'sydney', 'dubai', 'bangkok', 'berlin', 'amsterdam', 'rome', 'barcelona', 'lisbon', 'madrid', 'vienna', 'prague', 'stockholm', 'oslo', 'copenhagen', 'helsinki'];
    for (const cityName of cityNames) {
      if (lowerQuery === cityName || lowerQuery === cityName.replace(' ', '-')) {
        result.city = cityName.replace(/\s+/g, '-');
        break;
      }
    }
  }

  // Extract category - only if explicitly mentioned
  const categories = ['restaurant', 'cafe', 'hotel', 'bar', 'bakery', 'culture', 'dining', 'museum', 'gallery', 'shop', 'market'];
  for (const cat of categories) {
    if (lowerQuery.includes(cat)) {
      result.category = cat;
      break;
    }
  }

  // Extract Michelin stars - ONLY if "michelin" or "star" is explicitly mentioned
  if (lowerQuery.includes('michelin') || lowerQuery.includes('star')) {
    const starMatch = lowerQuery.match(/(\d)\s*star|star\s*(\d)/);
    if (starMatch) {
      const stars = parseInt(starMatch[1] || starMatch[2]);
      if (stars >= 1 && stars <= 3) {
        result.michelinStars = stars;
      } else {
        result.michelinStars = null; // "michelin" without specific stars
      }
    } else if (lowerQuery.includes('michelin')) {
      result.michelinStars = null; // Just "michelin" means all Michelin
    }
  }

  // Extract descriptive keywords
  const keywords = ['romantic', 'cozy', 'fine', 'casual', 'upscale', 'trendy', 'hidden', 'best', 'top', 'famous', 'popular'];
  for (const keyword of keywords) {
    if (lowerQuery.includes(keyword)) {
      result.descriptiveKeyword = keyword;
      break;
    }
  }

  return result;
}

// Handle follow-up queries by extracting context from previous messages
function extractFollowUpContext(query: string, conversationHistory: any[]): {
  city?: string;
  category?: string;
} {
  const lowerQuery = query.toLowerCase();
  const followUpIndicators = ['more', 'show me', 'what about', 'how about', 'also', 'another', 'other', 'different', 'next', 'more options'];
  
  if (!followUpIndicators.some(phrase => lowerQuery.includes(phrase))) {
    return {};
  }

  // Look backwards through conversation for last city/category
  for (let i = conversationHistory.length - 1; i >= 0; i--) {
    const msg = conversationHistory[i];
    if (msg.role === 'assistant' && msg.destinations && msg.destinations.length > 0) {
      const firstDest = msg.destinations[0];
      return {
        city: firstDest.city,
        category: firstDest.category
      };
    }
  }

  return {};
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, userId, conversationHistory = [] } = body;

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ 
        content: 'Please enter a search query (at least 2 characters).',
        destinations: []
      });
    }

    // Parse query explicitly - no AI interpretation, just clear extraction
    const parsed = parseQuery(query);
    
    // Check for follow-up context
    const followUpContext = extractFollowUpContext(query, conversationHistory);
    
    // Use follow-up context if no explicit values in current query
    const searchCity = parsed.city || followUpContext.city;
    const searchCategory = parsed.category || followUpContext.category;
    const searchMichelinStars = parsed.michelinStars; // Never use from context
    const searchDescriptive = parsed.descriptiveKeyword;

    // Build query based on what we found
    let supabaseQuery = supabase.from('destinations').select('*');

    // City filter (highest priority)
    if (searchCity) {
      const citySearchTerm = searchCity.replace(/-/g, ' ').trim().toLowerCase();
      supabaseQuery = supabaseQuery.or(`city.ilike.%${citySearchTerm}%,city.ilike.%${citySearchTerm.replace(' ', '-')}%`);
    }

    // Category filter - only apply if explicitly mentioned (not descriptive keywords)
    if (searchCategory && !['romantic', 'cozy', 'fine', 'casual'].includes(searchCategory)) {
      supabaseQuery = supabaseQuery.ilike('category', `%${searchCategory}%`);
    }

    // Michelin filter - ONLY if explicitly mentioned
    if (searchMichelinStars !== undefined) {
      if (searchMichelinStars !== null) {
        // Specific number of stars
        supabaseQuery = supabaseQuery.eq('michelin_stars', searchMichelinStars);
      } else {
        // Just "michelin" - all Michelin restaurants
        supabaseQuery = supabaseQuery.gte('michelin_stars', 1);
      }
    }

    const { data, error } = await supabaseQuery.limit(50);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({
        content: 'Sorry, I encountered an error searching the database.',
        destinations: []
      });
    }

    let filtered = data || [];

    // Apply descriptive keyword filter if present (optional, doesn't block results)
    if (searchDescriptive && filtered.length > 0) {
      const keyword = searchDescriptive.toLowerCase();
      const keywordMatches = filtered.filter(d => {
        const name = (d.name || '').toLowerCase();
        const description = (d.description || '').toLowerCase();
        const content = (d.content || '').toLowerCase();
        return name.includes(keyword) || description.includes(keyword) || content.includes(keyword);
      });
      
      // Use keyword matches if we have any, otherwise use all results
      if (keywordMatches.length > 0) {
        filtered = keywordMatches;
      }
    }

    // Limit results
    filtered = filtered.slice(0, 12);

    // Generate response
    if (filtered.length > 0) {
      const location = searchCity ? searchCity.replace(/-/g, ' ') : '';
      const categoryText = searchCategory ? ` ${searchCategory}s` : ' places';
      const michelinText = searchMichelinStars !== undefined
        ? (searchMichelinStars !== null ? ` with ${searchMichelinStars} Michelin star${searchMichelinStars > 1 ? 's' : ''}` : ' Michelin')
        : '';
      const descriptiveText = searchDescriptive ? ` that are ${searchDescriptive}` : '';
      
      const responses = [
        `✨ Found ${filtered.length}${michelinText} ${categoryText}${descriptiveText}${location ? ` in ${location}` : ''}:`,
        `🎯 Here are ${filtered.length}${michelinText} ${categoryText}${descriptiveText}${location ? ` in ${location}` : ''} that match your search:`,
        `🌟 ${filtered.length}${michelinText} ${categoryText}${descriptiveText}${location ? ` in ${location}` : ''} for you:`,
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];

      return NextResponse.json({
        content: response,
        destinations: filtered
      });
    }

    // No results - helpful message
    const suggestions = searchCity 
      ? `Try:\n• "${searchCity.replace(/-/g, ' ')}" (all places)\n• "restaurant in ${searchCity.replace(/-/g, ' ')}"\n• "cafe in ${searchCity.replace(/-/g, ' ')}"`
      : `Try:\n• A city name: "tokyo", "paris", "london"\n• Add a category: "restaurant in tokyo"\n• Be specific: "cafe in paris"`;

    return NextResponse.json({
      content: `I couldn't find any places matching "${query}" 😅\n\n${suggestions}`,
      destinations: []
    });

  } catch (error: any) {
    console.error('AI Chat API error:', error);
    return NextResponse.json({
      content: 'Sorry, I encountered an error. Please try again.',
      destinations: []
    }, { status: 500 });
  }
}
