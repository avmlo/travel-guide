import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) as string;
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// AI-powered query understanding with strict validation
async function understandQuery(query: string, conversationHistory: any[]): Promise<{
  city?: string;
  category?: string;
  michelinStars?: number | null;
  descriptiveKeyword?: string;
}> {
  const lowerQuery = query.toLowerCase();
  const result: {
    city?: string;
    category?: string;
    michelinStars?: number | null;
    descriptiveKeyword?: string;
  } = {};

  // Use Gemini AI for interpretation if available
  if (GOOGLE_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

      // Build conversation context
      const context = conversationHistory
        .slice(-6) // Only use last 6 messages for context
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      const prompt = `You are a travel search assistant. Analyze this query and extract ONLY information that is EXPLICITLY mentioned. Be conservative - only extract what's clearly stated.

Current query: "${query}"
${context ? `\nPrevious context:\n${context}` : ''}

Extract and return ONLY valid JSON. Rules:
1. "city": Extract ONLY if explicitly mentioned (e.g., "in tokyo", "paris", "in new york")
2. "category": Extract ONLY if explicitly mentioned (restaurant, cafe, hotel, bar, etc.)
3. "michelinStars": Extract ONLY if "michelin" or "star" is mentioned. Return number (1-3) if specific stars mentioned, null if just "michelin", undefined if not mentioned.
4. "descriptiveKeyword": Extract ONLY if explicitly mentioned (romantic, cozy, best, etc.)

CRITICAL: 
- If user just types a city name like "tokyo", return {"city": "tokyo"} with NO other fields
- Do NOT infer Michelin unless explicitly mentioned
- Do NOT infer category unless explicitly mentioned
- For follow-ups like "show me more", use previous context but still validate

Examples:
- "tokyo" → {"city": "tokyo"}
- "restaurant in paris" → {"city": "paris", "category": "restaurant"}
- "michelin restaurant in tokyo" → {"city": "tokyo", "category": "restaurant", "michelinStars": null}
- "3 star restaurant in paris" → {"city": "paris", "category": "restaurant", "michelinStars": 3}
- "show me more" → use previous context if available

Return ONLY JSON, no other text:`;

      const aiResult = await model.generateContent(prompt);
      const response = aiResult.response;
      const text = response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        try {
          const aiParsed = JSON.parse(jsonMatch[0]);
          
          // STRICT VALIDATION: Only use AI values if they're validated in the actual query
          if (aiParsed.city) {
            // Validate city is actually mentioned
            const cityPatterns = [
              new RegExp(`(?:in|at|near)\\s+${aiParsed.city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i'),
              new RegExp(`\\b${aiParsed.city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
            ];
            if (cityPatterns.some(p => p.test(query)) || lowerQuery.includes(aiParsed.city.toLowerCase())) {
              result.city = aiParsed.city.replace(/\s+/g, '-');
            }
          }

          if (aiParsed.category) {
            // Validate category is actually mentioned
            if (lowerQuery.includes(aiParsed.category.toLowerCase())) {
              result.category = aiParsed.category.toLowerCase();
            }
          }

          // CRITICAL: Only use Michelin if explicitly mentioned in query
          if (aiParsed.michelinStars !== undefined && (lowerQuery.includes('michelin') || lowerQuery.includes('star'))) {
            result.michelinStars = aiParsed.michelinStars;
          }

          if (aiParsed.descriptiveKeyword) {
            // Validate descriptive keyword is actually mentioned
            if (lowerQuery.includes(aiParsed.descriptiveKeyword.toLowerCase())) {
              result.descriptiveKeyword = aiParsed.descriptiveKeyword.toLowerCase();
            }
          }
        } catch (e) {
          console.error('Failed to parse AI response:', e);
        }
      }
    } catch (error) {
      console.error('AI interpretation error:', error);
      // Fall through to pattern matching
    }
  }

  // Fallback to simple pattern matching (also used to supplement AI)
  if (!result.city) {
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
  }

  if (!result.category) {
    // Extract category
    const categories = ['restaurant', 'cafe', 'hotel', 'bar', 'bakery', 'culture', 'dining', 'museum', 'gallery', 'shop', 'market'];
    for (const cat of categories) {
      if (lowerQuery.includes(cat)) {
        result.category = cat;
        break;
      }
    }
  }

  // Extract Michelin - ONLY if not already set and explicitly mentioned
  if (result.michelinStars === undefined && (lowerQuery.includes('michelin') || lowerQuery.includes('star'))) {
    const starMatch = lowerQuery.match(/(\d)\s*star|star\s*(\d)/);
    if (starMatch) {
      const stars = parseInt(starMatch[1] || starMatch[2]);
      if (stars >= 1 && stars <= 3) {
        result.michelinStars = stars;
      }
    } else if (lowerQuery.includes('michelin')) {
      result.michelinStars = null;
    }
  }

  if (!result.descriptiveKeyword) {
    // Extract descriptive keywords
    const keywords = ['romantic', 'cozy', 'fine', 'casual', 'upscale', 'trendy', 'hidden', 'best', 'top', 'famous', 'popular'];
    for (const keyword of keywords) {
      if (lowerQuery.includes(keyword)) {
        result.descriptiveKeyword = keyword;
        break;
      }
    }
  }

  return result;
}

// Handle follow-up queries
function extractFollowUpContext(query: string, conversationHistory: any[]): {
  city?: string;
  category?: string;
} {
  const lowerQuery = query.toLowerCase();
  const followUpIndicators = ['more', 'show me', 'what about', 'how about', 'also', 'another', 'other', 'different', 'next', 'more options'];
  
  if (!followUpIndicators.some(phrase => lowerQuery.includes(phrase))) {
    return {};
  }

  // Look backwards for last city/category
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

    // Use AI + pattern matching for query understanding
    const parsed = await understandQuery(query, conversationHistory);
    
    // Check for follow-up context
    const followUpContext = extractFollowUpContext(query, conversationHistory);
    
    // Use follow-up context only if no explicit values in current query
    const searchCity = parsed.city || followUpContext.city;
    const searchCategory = parsed.category || followUpContext.category;
    // CRITICAL: Never use Michelin from context, only from explicit query
    const searchMichelinStars = parsed.michelinStars;
    const searchDescriptive = parsed.descriptiveKeyword;

    // Build database query
    let supabaseQuery = supabase.from('destinations').select('*');

    // City filter (highest priority)
    if (searchCity) {
      const citySearchTerm = searchCity.replace(/-/g, ' ').trim().toLowerCase();
      supabaseQuery = supabaseQuery.or(`city.ilike.%${citySearchTerm}%,city.ilike.%${citySearchTerm.replace(' ', '-')}%`);
    }

    // Category filter - only if explicitly mentioned (not descriptive keywords)
    if (searchCategory && !['romantic', 'cozy', 'fine', 'casual'].includes(searchCategory)) {
      supabaseQuery = supabaseQuery.ilike('category', `%${searchCategory}%`);
    }

    // Michelin filter - ONLY if explicitly mentioned in CURRENT query
    if (searchMichelinStars !== undefined && (query.toLowerCase().includes('michelin') || query.toLowerCase().includes('star'))) {
      if (searchMichelinStars !== null) {
        supabaseQuery = supabaseQuery.eq('michelin_stars', searchMichelinStars);
      } else {
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

    // Apply descriptive keyword filter (optional, doesn't block results)
    if (searchDescriptive && filtered.length > 0) {
      const keyword = searchDescriptive.toLowerCase();
      const keywordMatches = filtered.filter(d => {
        const name = (d.name || '').toLowerCase();
        const description = (d.description || '').toLowerCase();
        const content = (d.content || '').toLowerCase();
        return name.includes(keyword) || description.includes(keyword) || content.includes(keyword);
      });
      
      if (keywordMatches.length > 0) {
        filtered = keywordMatches;
      }
    }

    // Limit results
    filtered = filtered.slice(0, 12);

    // Generate conversational response
    if (filtered.length > 0) {
      const location = searchCity ? searchCity.replace(/-/g, ' ') : '';
      const categoryText = searchCategory ? ` ${searchCategory}s` : ' places';
      const michelinText = searchMichelinStars !== undefined && (query.toLowerCase().includes('michelin') || query.toLowerCase().includes('star'))
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

    // No results
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
