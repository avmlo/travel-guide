import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) as string;
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, userId } = body;

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ 
        content: 'Please enter a search query.',
        destinations: []
      });
    }

    const lowerQuery = query.toLowerCase();

    // Check for city queries
    const cityMatch = lowerQuery.match(/(?:in|at|near)\s+([a-z\s-]+)/i);
    if (cityMatch) {
      const city = cityMatch[1].trim().replace(/\s+/g, '-');
      
      // Check for category keywords in query
      const categories = ['dining', 'restaurant', 'cafe', 'hotel', 'bar', 'bakery', 'culture', 'romantic', 'cozy', 'fine', 'casual'];
      const foundCategory = categories.find(cat => lowerQuery.includes(cat));
      
      let supabaseQuery = supabase
        .from('destinations')
        .select('*')
        .ilike('city', `%${city}%`);

      // Filter by category if found
      if (foundCategory && foundCategory !== 'romantic' && foundCategory !== 'cozy' && foundCategory !== 'fine' && foundCategory !== 'casual') {
        supabaseQuery = supabaseQuery.ilike('category', `%${foundCategory}%`);
      }

      // Check for descriptive keywords that might match description/content
      const descriptiveKeywords = ['romantic', 'cozy', 'fine', 'casual', 'upscale', 'trendy', 'hidden', 'best'];
      const descriptiveKeyword = descriptiveKeywords.find(k => lowerQuery.includes(k));

      const { data, error } = await supabaseQuery.limit(20);

      if (!error && data && data.length > 0) {
        // Filter by descriptive keywords in name, description, or content if present
        let filtered = data;
        if (descriptiveKeyword) {
          filtered = data.filter(d => 
            (d.name || '').toLowerCase().includes(descriptiveKeyword) ||
            (d.description || '').toLowerCase().includes(descriptiveKeyword) ||
            (d.content || '').toLowerCase().includes(descriptiveKeyword)
          );
          // If no matches, use original data
          if (filtered.length === 0) filtered = data;
        }

        // Limit to top 12 results
        filtered = filtered.slice(0, 12);

        const categoryText = foundCategory ? ` ${foundCategory}s` : ' places';
        const locationText = city.replace(/-/g, ' ');
        return NextResponse.json({
          content: `Found ${filtered.length}${categoryText} in ${locationText}:`,
          destinations: filtered
        });
      }
    }

    // Check for category queries (cozy cafe, romantic restaurant, etc.)
    const categories = ['dining', 'restaurant', 'cafe', 'hotel', 'bar', 'bakery', 'culture'];
    const foundCategory = categories.find(cat => lowerQuery.includes(cat));
    if (foundCategory) {
      // Check for city in query too
      const cityInQuery = lowerQuery.match(/(?:in|at)\s+([a-z\s-]+)/i);
      let supabaseQuery = supabase
        .from('destinations')
        .select('*')
        .ilike('category', `%${foundCategory}%`);

      if (cityInQuery) {
        const city = cityInQuery[1].trim().replace(/\s+/g, '-');
        supabaseQuery = supabaseQuery.ilike('city', `%${city}%`);
      }

      // Check for descriptive keywords
      const descriptiveKeywords = ['romantic', 'cozy', 'fine', 'casual', 'upscale', 'trendy', 'hidden', 'best'];
      const descriptiveKeyword = descriptiveKeywords.find(k => lowerQuery.includes(k));

      const { data } = await supabaseQuery.limit(20);

      if (data && data.length > 0) {
        // Filter by descriptive keywords if present
        let filtered = data;
        if (descriptiveKeyword) {
          filtered = data.filter(d => 
            (d.name || '').toLowerCase().includes(descriptiveKeyword) ||
            (d.description || '').toLowerCase().includes(descriptiveKeyword) ||
            (d.content || '').toLowerCase().includes(descriptiveKeyword)
          );
          if (filtered.length === 0) filtered = data;
        }

        filtered = filtered.slice(0, 12);

        const location = cityInQuery ? ` in ${cityInQuery[1]}` : '';
        return NextResponse.json({
          content: `Found ${filtered.length} ${foundCategory}${location !== '' ? location + '' : 's'}:`,
          destinations: filtered
        });
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
        content: `Found ${data.length} places matching "${query}":`,
        destinations: data
      });
    }

    // No results
    return NextResponse.json({
      content: `No places found for "${query}". Try searching for a city or category like "restaurants in Tokyo".`,
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

