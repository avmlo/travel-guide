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
  "descriptiveKeyword": "romantic/cozy/best/etc or null"
}

Handle follow-up questions like:
- "show me more" → use previous city/category
- "what about cafes" → change category to cafe, keep city
- "nearby places" → keep previous location context
- "more options" → expand search

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

  return {
    intent: isFollowUp ? 'follow-up' : 'search',
    city: cityMatch ? cityMatch[1].trim().replace(/\s+/g, '-') : undefined,
    category: foundCategory,
    descriptiveKeyword,
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

    // If context didn't provide city but query does, extract it
    if (!searchCity) {
      const cityMatch = lowerQuery.match(/(?:in|at|near)\s+([a-z\s-]+)/i);
      if (cityMatch) {
        searchCity = cityMatch[1].trim().replace(/\s+/g, '-');
      }
    }

    // If context didn't provide category but query does, extract it
    if (!searchCategory) {
      const categories = ['dining', 'restaurant', 'cafe', 'hotel', 'bar', 'bakery', 'culture'];
      searchCategory = categories.find(cat => lowerQuery.includes(cat));
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

    // Check for city queries (with extracted or context city)
    if (searchCity) {
      let supabaseQuery = supabase
        .from('destinations')
        .select('*')
        .ilike('city', `%${searchCity}%`);

      // Filter by category if found
      if (searchCategory && searchCategory !== 'romantic' && searchCategory !== 'cozy' && searchCategory !== 'fine' && searchCategory !== 'casual') {
        supabaseQuery = supabaseQuery.ilike('category', `%${searchCategory}%`);
      }

      const { data, error } = await supabaseQuery.limit(20);

      if (!error && data && data.length > 0) {
        // Filter by descriptive keywords in name, description, or content if present
        let filtered = data;
        if (searchDescriptive) {
          filtered = data.filter(d => 
            (d.name || '').toLowerCase().includes(searchDescriptive) ||
            (d.description || '').toLowerCase().includes(searchDescriptive) ||
            (d.content || '').toLowerCase().includes(searchDescriptive)
          );
          // If no matches, use original data
          if (filtered.length === 0) filtered = data;
        }

        // Limit to top 12 results
        filtered = filtered.slice(0, 12);

        const categoryText = searchCategory ? ` ${searchCategory}s` : ' places';
        const locationText = searchCity.replace(/-/g, ' ');
        const descriptiveText = searchDescriptive ? ` that are ${searchDescriptive}` : '';
        const followUpText = isFollowUp ? ' Here are more' : ` I found ${filtered.length}`;
        return NextResponse.json({
          content: `✨${followUpText}${categoryText}${descriptiveText} in ${locationText}:`,
          destinations: filtered
        });
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
          const followUpText = isFollowUp ? 'Here are more' : `Here are ${filtered.length}`;
          return NextResponse.json({
            content: `✨ ${followUpText} ${searchCategory}${location !== '' ? location : 's'}${descriptiveText} I think you'll love:`,
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
      return NextResponse.json({
        content: `✨ I found ${data.length} ${data.length === 1 ? 'place' : 'places'} matching "${query}" for you:`,
        destinations: data
      });
    }

    // No results - more helpful AI response
    return NextResponse.json({
      content: `I couldn't find any places for "${query}". 💡 Try asking me:\n\n• "romantic restaurants in Tokyo"\n• "cozy cafes in Paris"\n• "best hotels in New York"\n\nOr search by city or category!`,
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

