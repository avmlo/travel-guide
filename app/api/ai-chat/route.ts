import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) as string;
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Extract search parameters from conversation using Gemini
async function understandQueryWithContext(query: string, conversationHistory: any[]): Promise<{
  city?: string;
  category?: string;
  descriptiveKeyword?: string;
  michelinStars?: number | null;
  intent: string;
}> {
  if (!GOOGLE_API_KEY || conversationHistory.length === 0) {
    // Fallback to simple parsing
    return parseQueryFallback(query);
  }

  try {
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Build conversation context
    const context = conversationHistory
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const prompt = `You are a travel search assistant. Analyze this query in the context of the conversation and extract search parameters.

Conversation history:
${context}

Current query: "${query}"

Extract search intent and return ONLY valid JSON:
{
  "intent": "specific intent description",
  "city": "city name or null",
  "category": "restaurant/cafe/hotel/etc or null",
  "descriptiveKeyword": "romantic/cozy/best/etc or null",
  "michelinStars": number of michelin stars (1, 2, or 3) or null
}

Handle follow-up questions like:
- "show me more" → use previous city/category
- "what about cafes" → change category to cafe, keep city
- "nearby places" → keep previous location context
- "more options" → expand search

Examples:
- "michelin restaurant in tokyo" → {"city": "tokyo", "category": "restaurant", "michelinStars": null}
- "3 star restaurant in paris" → {"city": "paris", "category": "restaurant", "michelinStars": 3}
- "2 michelin star dining in london" → {"city": "london", "category": "dining", "michelinStars": 2}

Return only the JSON, no other text:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Failed to parse Gemini context response:', e);
      }
    }
  } catch (error) {
    console.error('Gemini context API error:', error);
  }

  return parseQueryFallback(query);
}

function parseQueryFallback(query: string): {
  city?: string;
  category?: string;
  descriptiveKeyword?: string;
  michelinStars?: number | null;
  intent: string;
} {
  const lowerQuery = query.toLowerCase();
  
  // Check for follow-up indicators
  const followUps = ['more', 'show me', 'what about', 'how about', 'also', 'another', 'other', 'different'];
  const isFollowUp = followUps.some(phrase => lowerQuery.includes(phrase));
  
  const cityMatch = lowerQuery.match(/(?:in|at|near)\s+([a-z\s-]+)/i);
  const categories = ['dining', 'restaurant', 'cafe', 'hotel', 'bar', 'bakery', 'culture'];
  const foundCategory = categories.find(cat => lowerQuery.includes(cat));
  const descriptiveKeywords = ['romantic', 'cozy', 'fine', 'casual', 'upscale', 'trendy', 'hidden', 'best'];
  const descriptiveKeyword = descriptiveKeywords.find(k => lowerQuery.includes(k));

  // Extract Michelin star rating
  let michelinStars: number | null = null;
  if (lowerQuery.includes('michelin') || lowerQuery.includes('star')) {
    // Try to extract number of stars (1, 2, or 3)
    const starMatch = lowerQuery.match(/(\d)\s*star|star.*?(\d)/);
    if (starMatch) {
      const stars = parseInt(starMatch[1] || starMatch[2]);
      if (stars >= 1 && stars <= 3) {
        michelinStars = stars;
      }
    } else if (lowerQuery.includes('michelin')) {
      // If just "michelin" without specific stars, set to null (will search all michelin)
      michelinStars = null;
    }
  }

  return {
    intent: isFollowUp ? 'follow-up' : 'search',
    city: cityMatch ? cityMatch[1].trim().replace(/\s+/g, '-') : undefined,
    category: foundCategory,
    descriptiveKeyword,
    michelinStars,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, userId, conversationHistory = [] } = body;

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ 
        content: 'Please enter a search query.',
        destinations: []
      });
    }

    const lowerQuery = query.toLowerCase();

    // Understand query with conversation context
    const context = await understandQueryWithContext(query, conversationHistory);
    
    // Extract from context or query directly
    let searchCity = context.city;
    let searchCategory = context.category;
    let searchDescriptive = context.descriptiveKeyword;
    // Only track Michelin if explicitly mentioned in query (not from false positives)
    let searchMichelinStars = lowerQuery.includes('michelin') || lowerQuery.includes('star') ? context.michelinStars : undefined;

    // If context didn't provide city but query does, extract it
    if (!searchCity) {
      // Try pattern matching first: "in tokyo", "at paris", etc.
      const cityMatch = lowerQuery.match(/(?:in|at|near)\s+([a-z\s-]+)/i);
      if (cityMatch) {
        searchCity = cityMatch[1].trim().replace(/\s+/g, '-');
      } else {
        // Check if query ends with a known city name
        const cityNames = ['tokyo', 'new york', 'paris', 'london', 'los angeles', 'singapore', 'hong kong', 'sydney', 'dubai', 'bangkok', 'berlin', 'amsterdam', 'rome', 'barcelona', 'lisbon', 'madrid', 'vienna', 'prague', 'stockholm', 'oslo', 'copenhagen', 'helsinki'];
        for (const cityName of cityNames) {
          if (lowerQuery.endsWith(cityName) || lowerQuery.includes(` ${cityName}`) || lowerQuery.includes(` ${cityName.replace(' ', '-')}`)) {
            searchCity = cityName.replace(/\s+/g, '-');
            break;
          }
        }
      }
    }

    // If context didn't provide category but query does, extract it
    if (!searchCategory) {
      const categories = ['dining', 'restaurant', 'cafe', 'hotel', 'bar', 'bakery', 'culture'];
      searchCategory = categories.find(cat => lowerQuery.includes(cat));
    }

    // Extract Michelin stars if not from context
    if (searchMichelinStars === undefined) {
      if (lowerQuery.includes('michelin') || lowerQuery.includes('star')) {
        const starMatch = lowerQuery.match(/(\d)\s*star|star.*?(\d)/);
        if (starMatch) {
          const stars = parseInt(starMatch[1] || starMatch[2]);
          if (stars >= 1 && stars <= 3) {
            searchMichelinStars = stars;
          }
        } else if (lowerQuery.includes('michelin')) {
          searchMichelinStars = null; // Search all michelin restaurants
        }
      }
    }

    // Check if this is a follow-up that should use previous context
    const followUpIndicators = ['more', 'show me', 'what about', 'how about', 'also', 'another', 'other', 'different', 'next'];
    const isFollowUp = followUpIndicators.some(phrase => lowerQuery.includes(phrase));

    // Extract previous context from conversation history
    if (isFollowUp && conversationHistory.length > 0) {
      // Look for city/category from previous assistant messages with destinations
      for (let i = conversationHistory.length - 1; i >= 0; i--) {
        const msg = conversationHistory[i];
        if (msg.role === 'assistant' && msg.destinations && msg.destinations.length > 0) {
          const prevCity = msg.destinations[0]?.city;
          const prevCategory = msg.destinations[0]?.category;
          if (!searchCity && prevCity) searchCity = prevCity;
          if (!searchCategory && prevCategory) searchCategory = prevCategory;
          break;
        }
      }
    }

    // Check if query is a city/country name (show all places in that city)
    // First, try to match city names directly - but only if we don't already have a city extracted
    let isCityQuery = false;
    if (!searchCity) {
      const cityNames = ['tokyo', 'new york', 'paris', 'london', 'los angeles', 'singapore', 'hong kong', 'sydney', 'dubai', 'bangkok', 'berlin', 'amsterdam', 'rome', 'barcelona', 'lisbon', 'madrid', 'vienna', 'prague', 'stockholm', 'oslo', 'copenhagen', 'helsinki'];
      isCityQuery = cityNames.some(city => {
        const cityLower = city.toLowerCase();
        const queryLower = lowerQuery.trim();
        // Match if query is just the city name, or ends with it, or contains it as a word
        return queryLower === cityLower || 
               queryLower === cityLower.replace(' ', '-') || 
               queryLower.endsWith(` ${cityLower}`) ||
               queryLower.endsWith(` ${cityLower.replace(' ', '-')}`);
      });
    }

    // Check for city queries (with extracted or context city, or direct city name)
    if (searchCity || isCityQuery) {
      const cityToSearch = searchCity || (isCityQuery ? lowerQuery.trim().replace(/\s+/g, '-') : null);
      
      if (cityToSearch) {
        // Normalize city search - handle both hyphenated and spaced versions
        const citySearchTerm = cityToSearch.replace(/-/g, ' ').trim().toLowerCase();
        
        let supabaseQuery = supabase
          .from('destinations')
          .select('*')
          .or(`city.ilike.%${citySearchTerm}%,city.ilike.%${citySearchTerm.replace(' ', '-')}%`);

        // Filter by category if found
        if (searchCategory && searchCategory !== 'romantic' && searchCategory !== 'cozy' && searchCategory !== 'fine' && searchCategory !== 'casual') {
          supabaseQuery = supabaseQuery.ilike('category', `%${searchCategory}%`);
        }

        // Filter by Michelin stars ONLY if explicitly mentioned in query
        // Only apply if user actually mentioned "michelin" or "star" in their query
        if (searchMichelinStars !== undefined && (lowerQuery.includes('michelin') || lowerQuery.includes('star'))) {
          if (searchMichelinStars !== null) {
            // Specific number of stars (1, 2, or 3)
            supabaseQuery = supabaseQuery.eq('michelin_stars', searchMichelinStars);
          } else {
            // "michelin" without specific stars - show all michelin restaurants (stars >= 1)
            supabaseQuery = supabaseQuery.gte('michelin_stars', 1);
          }
        }

        const { data, error } = await supabaseQuery.limit(50);

        if (!error && data && data.length > 0) {
          // Filter by descriptive keywords in name, description, or content if present
          let filtered = data;
          if (searchDescriptive) {
            // Try to find matches with descriptive keyword
            const keyword = searchDescriptive.toLowerCase();
            filtered = data.filter(d => {
              const name = (d.name || '').toLowerCase();
              const description = (d.description || '').toLowerCase();
              const content = (d.content || '').toLowerCase();
              
              return name.includes(keyword) || 
                     description.includes(keyword) || 
                     content.includes(keyword);
            });
            
            // Descriptive keywords are optional hints - always return results if we have city/category
            // If no matches found, still return all results (the keyword is just a preference)
            if (filtered.length === 0) {
              filtered = data;
            }
          }

          // Limit to top 12 results
          filtered = filtered.slice(0, 12);

          const categoryText = searchCategory ? ` ${searchCategory}s` : ' places';
          const locationText = cityToSearch.replace(/-/g, ' ');
          const descriptiveText = searchDescriptive ? ` that are ${searchDescriptive}` : '';
          const michelinText = searchMichelinStars !== undefined 
            ? (searchMichelinStars !== null ? ` with ${searchMichelinStars} Michelin star${searchMichelinStars > 1 ? 's' : ''}` : ' Michelin')
            : '';
          const count = filtered.length;
          
          // More conversational and fun responses
          const responses = [
            `✨ Ooh, ${locationText}! I've got ${count} amazing${michelinText} ${categoryText}${descriptiveText} for you in ${locationText}:`,
            `🎯 Perfect choice! Here are ${count}${michelinText} ${categoryText}${descriptiveText} in ${locationText} that'll blow your mind:`,
            `🌟 ${locationText}? Love it! Check out these ${count}${michelinText} ${categoryText}${descriptiveText}:`,
            `🔥 ${count} incredible${michelinText} ${categoryText}${descriptiveText} in ${locationText} coming right up:`,
          ];
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          
          return NextResponse.json({
            content: randomResponse,
            destinations: filtered
          });
        }
      }
    }

    // Check for category queries (cozy cafe, romantic restaurant, etc.)
    if (searchCategory || (!searchCity && !searchCategory)) {
      // If we have a category from context, or need to extract it
      if (!searchCategory) {
        const categories = ['dining', 'restaurant', 'cafe', 'hotel', 'bar', 'bakery', 'culture'];
        searchCategory = categories.find(cat => lowerQuery.includes(cat));
      }

      if (searchCategory) {
        let supabaseQuery = supabase
          .from('destinations')
          .select('*')
          .ilike('category', `%${searchCategory}%`);

        if (searchCity) {
          supabaseQuery = supabaseQuery.ilike('city', `%${searchCity}%`);
        }

        // Filter by Michelin stars ONLY if explicitly mentioned in query
        // Only apply if user actually mentioned "michelin" or "star" in their query
        if (searchMichelinStars !== undefined && (lowerQuery.includes('michelin') || lowerQuery.includes('star'))) {
          if (searchMichelinStars !== null) {
            // Specific number of stars (1, 2, or 3)
            supabaseQuery = supabaseQuery.eq('michelin_stars', searchMichelinStars);
          } else {
            // "michelin" without specific stars - show all michelin restaurants (stars >= 1)
            supabaseQuery = supabaseQuery.gte('michelin_stars', 1);
          }
        }

        const { data } = await supabaseQuery.limit(20);

        if (data && data.length > 0) {
          // Filter by descriptive keywords if present
          let filtered = data;
          if (searchDescriptive) {
            filtered = data.filter(d => 
              (d.name || '').toLowerCase().includes(searchDescriptive) ||
              (d.description || '').toLowerCase().includes(searchDescriptive) ||
              (d.content || '').toLowerCase().includes(searchDescriptive)
            );
            if (filtered.length === 0) filtered = data;
          }

          filtered = filtered.slice(0, 12);

          const location = searchCity ? ` in ${searchCity.replace(/-/g, ' ')}` : '';
          const descriptiveText = searchDescriptive ? ` that are ${searchDescriptive}` : '';
          const michelinText = searchMichelinStars !== undefined 
            ? (searchMichelinStars !== null ? ` with ${searchMichelinStars} Michelin star${searchMichelinStars > 1 ? 's' : ''}` : ' Michelin')
            : '';
          const count = filtered.length;
          
          // More conversational responses for categories
          const categoryResponses = [
            `✨ Yum! Here are ${count}${michelinText} ${searchCategory}${location !== '' ? location : 's'}${descriptiveText} that are absolutely worth visiting:`,
            `🎉 ${count}${michelinText} ${searchCategory}${location !== '' ? location : 's'}${descriptiveText}? Yes please! Check these out:`,
            `🌟 You're in for a treat! ${count}${michelinText} ${searchCategory}${location !== '' ? location : 's'}${descriptiveText} that'll make your day:`,
            `🔥 These ${count}${michelinText} ${searchCategory}${location !== '' ? location : 's'}${descriptiveText} are top-tier. Trust me:`,
          ];
          const randomResponse = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
          
          return NextResponse.json({
            content: randomResponse,
            destinations: filtered
          });
        }
      }
    }

    // General search fallback - search across all fields
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%,city.ilike.%${query}%`)
      .limit(12);

    if (!error && data && data.length > 0) {
      const count = data.length;
      const generalResponses = [
        `✨ Found ${count} ${count === 1 ? 'spot' : 'places'} matching "${query}" that caught my eye:`,
        `🎯 ${count} ${count === 1 ? 'place' : 'results'} for "${query}" - these look promising:`,
        `🌟 Here are ${count} ${count === 1 ? 'place' : 'places'} related to "${query}":`,
      ];
      const randomResponse = generalResponses[Math.floor(Math.random() * generalResponses.length)];
      
      return NextResponse.json({
        content: randomResponse,
        destinations: data
      });
    }

    // No results - more conversational and helpful response with working examples
    const noResultResponses = [
      `Hmm, I couldn't find anything for "${query}" 🧐 Try simpler queries like:\n\n• "tokyo" (all places in Tokyo)\n• "cafe in paris"\n• "restaurant in london"\n• Just a city name works great!`,
      `No results for "${query}" 😅 Keep it simple:\n\n• "paris" (see everything in Paris)\n• "restaurant in new york"\n• "hotel in tokyo"\n\nCity names are your friend!`,
      `Didn't find anything for "${query}" 🤔 Try:\n\n• Just type a city: "tokyo", "paris", "london"\n• Add a category: "restaurant in tokyo"\n• Be specific: "cafe in paris"\n\nSimple is better!`,
      `Nothing found for "${query}" 💡 Here's what works:\n\n• City only: "tokyo", "paris"\n• Category + city: "restaurant in london"\n• Keep it straightforward!`,
    ];
    const randomNoResult = noResultResponses[Math.floor(Math.random() * noResultResponses.length)];
    
    return NextResponse.json({
      content: randomNoResult,
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

