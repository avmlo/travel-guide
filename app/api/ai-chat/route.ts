import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) as string;
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Enhanced query understanding with hybrid search support
interface StructuredSearch {
  city?: string;
  category?: string;
  filters?: {
    michelin_stars?: number | null; // null = any michelin, number = specific stars
    tags?: string[]; // e.g., ["restaurant", "lodging"]
    vibe?: string; // e.g., "romantic", "cozy", "upscale"
    rating?: number; // minimum rating
    price_level?: number; // max price level (1-4)
  };
  intent?: string;
}

async function understandQueryWithLLM(query: string, conversationHistory: any[]): Promise<StructuredSearch> {
  if (!GOOGLE_API_KEY) {
    return understandQueryFallback(query);
  }

  try {
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Build conversation context
    const context = conversationHistory
      .slice(-6)
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const prompt = `You are a travel search assistant. Analyze this query and extract structured search parameters. Handle complex queries like "romantic hotel with michelin star restaurant in tokyo".

Current query: "${query}"
${context ? `\nPrevious context:\n${context}` : ''}

Extract and return ONLY valid JSON with this exact structure:
{
  "city": "city name or null",
  "category": "primary category (hotel/restaurant/cafe/etc) or null",
  "filters": {
    "michelin_stars": number (1-3) if specific stars mentioned, null if just "michelin" mentioned, undefined if not mentioned,
    "tags": ["array", "of", "related", "categories/features"] (e.g., ["restaurant", "lodging"] for "hotel with restaurant"),
    "vibe": "descriptive vibe word" (romantic/cozy/upscale/casual/etc) or null,
    "rating": minimum rating (4-5) if mentioned or null,
    "price_level": max price level (1-4) if mentioned or null
  },
  "intent": "brief description of what user is looking for"
}

Examples:
- "tokyo" → {"city": "tokyo", "intent": "all places in tokyo"}
- "romantic hotel with michelin star restaurant in tokyo" → {"city": "tokyo", "category": "hotel", "filters": {"michelin_stars": null, "tags": ["restaurant", "lodging"], "vibe": "romantic"}, "intent": "romantic hotel in tokyo with michelin-starred restaurant"}
- "3 star restaurant in paris" → {"city": "paris", "category": "restaurant", "filters": {"michelin_stars": 3}, "intent": "3 michelin star restaurant in paris"}
- "best cafes in london open now" → {"city": "london", "category": "cafe", "filters": {"rating": 4}, "intent": "highly rated cafes in london"}
- "show me more" → use previous context if available

CRITICAL RULES:
- Only extract what is EXPLICITLY mentioned or clearly implied
- For "hotel with restaurant", set category to "hotel" and tags to ["restaurant", "lodging"]
- For Michelin: only set michelin_stars if "michelin" or "star" is mentioned in the query
- Be conservative with inferences

Return ONLY JSON, no other text:`;

    const aiResult = await model.generateContent(prompt);
    const response = aiResult.response;
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate parsed results match the query
        const validated: StructuredSearch = {
          intent: parsed.intent || 'searching for places'
        };

        // Validate city
        if (parsed.city) {
          const lowerQuery = query.toLowerCase();
          const cityPatterns = [
            new RegExp(`(?:in|at|near)\\s+${parsed.city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i'),
            new RegExp(`\\b${parsed.city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
          ];
          if (cityPatterns.some(p => p.test(query)) || lowerQuery.includes(parsed.city.toLowerCase())) {
            validated.city = parsed.city.replace(/\s+/g, '-');
          }
        }

        // Validate category
        if (parsed.category) {
          const lowerQuery = query.toLowerCase();
          if (lowerQuery.includes(parsed.category.toLowerCase())) {
            validated.category = parsed.category.toLowerCase();
          }
        }

        // Validate filters
        if (parsed.filters) {
          validated.filters = {};
          
          // Michelin stars - only if explicitly mentioned
          if (parsed.filters.michelin_stars !== undefined && 
              (query.toLowerCase().includes('michelin') || query.toLowerCase().includes('star'))) {
            validated.filters.michelin_stars = parsed.filters.michelin_stars;
          }

          // Tags - validate they make sense
          if (parsed.filters.tags && Array.isArray(parsed.filters.tags)) {
            validated.filters.tags = parsed.filters.tags.filter((tag: string) => {
              const lowerQuery = query.toLowerCase();
              return lowerQuery.includes(tag.toLowerCase()) || 
                     (tag === 'restaurant' && lowerQuery.includes('dining')) ||
                     (tag === 'lodging' && (lowerQuery.includes('hotel') || lowerQuery.includes('lodge')));
            });
          }

          // Vibe
          if (parsed.filters.vibe) {
            const lowerQuery = query.toLowerCase();
            if (lowerQuery.includes(parsed.filters.vibe.toLowerCase())) {
              validated.filters.vibe = parsed.filters.vibe.toLowerCase();
            }
          }

          // Rating
          if (parsed.filters.rating && query.toLowerCase().match(/rating|rated|star.*(\d)|(\d).*star/i)) {
            validated.filters.rating = parsed.filters.rating;
          }

          // Price level
          if (parsed.filters.price_level && query.toLowerCase().match(/price|budget|affordable|expensive|cheap/i)) {
            validated.filters.price_level = parsed.filters.price_level;
          }
        }

        return validated;
      } catch (e) {
        console.error('Failed to parse AI response:', e);
      }
    }
  } catch (error) {
    console.error('LLM interpretation error:', error);
  }

  return understandQueryFallback(query);
}

function understandQueryFallback(query: string): StructuredSearch {
  const lowerQuery = query.toLowerCase();
  const result: StructuredSearch = {
    intent: 'searching for places'
  };

  // Extract city
  const cityPatterns = [
    /(?:in|at|near)\s+([a-z\s-]+)/i,
    /\b(tokyo|paris|london|new york|los angeles|singapore|hong kong|sydney|dubai|bangkok|berlin|amsterdam|rome|barcelona|lisbon|madrid|vienna|prague|stockholm|oslo|copenhagen|helsinki|san francisco|chicago|miami|seattle|boston|toronto|vancouver|melbourne|auckland)\b/i
  ];
  
  for (const pattern of cityPatterns) {
    const match = lowerQuery.match(pattern);
    if (match) {
      result.city = (match[1] || match[0])?.trim().replace(/\s+/g, '-');
      break;
    }
  }

  // Check if entire query is a city name
  if (!result.city) {
    const cityNames = ['tokyo', 'paris', 'london', 'new york', 'los angeles', 'singapore', 'hong kong', 'sydney', 'dubai', 'bangkok', 'berlin', 'amsterdam', 'rome', 'barcelona', 'lisbon', 'madrid', 'vienna', 'prague', 'stockholm', 'oslo', 'copenhagen', 'helsinki'];
    for (const cityName of cityNames) {
      if (lowerQuery === cityName || lowerQuery === cityName.replace(' ', '-')) {
        result.city = cityName.replace(/\s+/g, '-');
        break;
      }
    }
  }

  // Extract category
  const categories = ['restaurant', 'cafe', 'hotel', 'bar', 'bakery', 'culture', 'dining', 'museum', 'gallery', 'shop', 'market'];
  for (const cat of categories) {
    if (lowerQuery.includes(cat)) {
      result.category = cat;
      break;
    }
  }

  // Extract filters
  result.filters = {};

  // Michelin stars
  if (lowerQuery.includes('michelin') || lowerQuery.includes('star')) {
    const starMatch = lowerQuery.match(/(\d)\s*star|star\s*(\d)/);
    if (starMatch) {
      const stars = parseInt(starMatch[1] || starMatch[2]);
      if (stars >= 1 && stars <= 3) {
        result.filters.michelin_stars = stars;
      }
    } else if (lowerQuery.includes('michelin')) {
      result.filters.michelin_stars = null;
    }
  }

  // Tags (for complex queries like "hotel with restaurant")
  if (lowerQuery.includes('hotel') && lowerQuery.includes('restaurant')) {
    result.filters.tags = ['restaurant', 'lodging'];
    if (!result.category) result.category = 'hotel';
  }

  // Vibe
  const vibes = ['romantic', 'cozy', 'fine', 'casual', 'upscale', 'trendy', 'hidden', 'best', 'top', 'famous', 'popular'];
  for (const vibe of vibes) {
    if (lowerQuery.includes(vibe)) {
      result.filters.vibe = vibe;
      break;
    }
  }

  return result;
}

// Handle follow-up queries
function extractFollowUpContext(query: string, conversationHistory: any[]): StructuredSearch | null {
  const lowerQuery = query.toLowerCase();
  const followUpIndicators = ['more', 'show me', 'what about', 'how about', 'also', 'another', 'other', 'different', 'next', 'more options'];
  
  if (!followUpIndicators.some(phrase => lowerQuery.includes(phrase))) {
    return null;
  }

  // Look backwards for last search context
  for (let i = conversationHistory.length - 1; i >= 0; i--) {
    const msg = conversationHistory[i];
    if (msg.role === 'assistant' && msg.destinations && msg.destinations.length > 0) {
      const firstDest = msg.destinations[0];
      return {
        city: firstDest.city,
        category: firstDest.category,
        intent: 'showing more similar places'
      };
    }
  }

  return null;
}

// Generate natural language response
function generateResponse(
  count: number, 
  searchParams: StructuredSearch,
  destinationNames: string[]
): string {
  const location = searchParams.city ? searchParams.city.replace(/-/g, ' ') : '';
  const categoryText = searchParams.category ? ` ${searchParams.category}s` : ' places';
  
  // Build filter descriptions
  const filterParts: string[] = [];
  
  if (searchParams.filters?.michelin_stars !== undefined) {
    if (searchParams.filters.michelin_stars === null) {
      filterParts.push('Michelin-starred');
    } else {
      filterParts.push(`${searchParams.filters.michelin_stars} Michelin star${searchParams.filters.michelin_stars > 1 ? 's' : ''}`);
    }
  }
  
  if (searchParams.filters?.vibe) {
    filterParts.push(searchParams.filters.vibe);
  }
  
  if (searchParams.filters?.tags && searchParams.filters.tags.length > 0) {
    // Special handling for "hotel with restaurant" type queries
    if (searchParams.filters.tags.includes('restaurant') && searchParams.filters.tags.includes('lodging')) {
      filterParts.push('with restaurant');
    }
  }
  
  const filterText = filterParts.length > 0 ? ` ${filterParts.join(', ')}` : '';
  
  // Create natural language response
  if (count > 0) {
    if (destinationNames.length > 0 && destinationNames.length <= 5) {
      // List specific places if we have a small number
      const namesText = destinationNames.slice(0, 3).join(', ') + 
                       (destinationNames.length > 3 ? `, and ${destinationNames.length - 3} more` : '');
      return `✨ Found ${count}${filterText} ${categoryText}${location ? ` in ${location}` : ''}: ${namesText}`;
    } else {
      // Generic response for larger sets
      const responses = [
        `✨ Found ${count}${filterText} ${categoryText}${location ? ` in ${location}` : ''} matching your search`,
        `🎯 Here are ${count}${filterText} ${categoryText}${location ? ` in ${location}` : ''} that match your criteria`,
        `🌟 ${count}${filterText} ${categoryText}${location ? ` in ${location}` : ''} for you:`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }
  
  return `I couldn't find any${filterText} ${categoryText}${location ? ` in ${location}` : ''} matching your search. Try adjusting your filters or search in a different city.`;
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

    // Use LLM to understand query structure
    const parsed = await understandQueryWithLLM(query, conversationHistory);
    
    // Check for follow-up context
    const followUpContext = extractFollowUpContext(query, conversationHistory);
    
    // Merge follow-up context if available
    const searchParams: StructuredSearch = {
      city: parsed.city || followUpContext?.city,
      category: parsed.category || followUpContext?.category,
      filters: {
        ...(followUpContext?.filters || {}),
        ...(parsed.filters || {})
      },
      intent: parsed.intent || followUpContext?.intent || 'searching for places'
    };

    // Build database query
    let supabaseQuery = supabase.from('destinations').select('*');

    // City filter (highest priority)
    if (searchParams.city) {
      const citySearchTerm = searchParams.city.replace(/-/g, ' ').trim().toLowerCase();
      supabaseQuery = supabaseQuery.or(`city.ilike.%${citySearchTerm}%,city.ilike.%${citySearchTerm.replace(' ', '-')}%`);
    }

    // Category filter
    if (searchParams.category && !['romantic', 'cozy', 'fine', 'casual'].includes(searchParams.category)) {
      supabaseQuery = supabaseQuery.ilike('category', `%${searchParams.category}%`);
    }

    // Michelin filter
    if (searchParams.filters?.michelin_stars !== undefined) {
      if (searchParams.filters.michelin_stars !== null) {
        supabaseQuery = supabaseQuery.eq('michelin_stars', searchParams.filters.michelin_stars);
      } else {
        supabaseQuery = supabaseQuery.gte('michelin_stars', 1);
      }
    }

    // Rating filter
    if (searchParams.filters?.rating) {
      supabaseQuery = supabaseQuery.gte('rating', searchParams.filters.rating);
    }

    // Price level filter
    if (searchParams.filters?.price_level) {
      supabaseQuery = supabaseQuery.lte('price_level', searchParams.filters.price_level);
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

    // Apply tag-based filtering (e.g., "hotel with restaurant")
    if (searchParams.filters?.tags && searchParams.filters.tags.length > 0) {
      // For "hotel with restaurant", we want hotels that also have restaurant features
      // This is a fuzzy match - we'll check if the place matches any of the tags in name/description
      const tags = searchParams.filters.tags.map(t => t.toLowerCase());
      filtered = filtered.filter(d => {
        const searchText = `${d.name || ''} ${d.description || ''} ${d.content || ''} ${d.category || ''}`.toLowerCase();
        return tags.some(tag => searchText.includes(tag));
      });
    }

    // Apply vibe/keyword filter (optional, doesn't block results)
    if (searchParams.filters?.vibe && filtered.length > 0) {
      const vibe = searchParams.filters.vibe.toLowerCase();
      const vibeMatches = filtered.filter(d => {
        const name = (d.name || '').toLowerCase();
        const description = (d.description || '').toLowerCase();
        const content = (d.content || '').toLowerCase();
        return name.includes(vibe) || description.includes(vibe) || content.includes(vibe);
      });
      
      if (vibeMatches.length > 0) {
        filtered = vibeMatches;
      }
    }

    // Limit results
    filtered = filtered.slice(0, 12);

    // Generate natural language response
    const destinationNames = filtered.slice(0, 5).map(d => d.name);
    const response = generateResponse(filtered.length, searchParams, destinationNames);

    return NextResponse.json({
      content: response,
      destinations: filtered,
      searchParams // Include structured search params for debugging/future use
    });

  } catch (error: any) {
    console.error('AI Chat API error:', error);
    return NextResponse.json({
      content: 'Sorry, I encountered an error. Please try again.',
      destinations: []
    }, { status: 500 });
  }
}