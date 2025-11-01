import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');
    const limit = parseInt(searchParams.get('limit') || '6');

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    // Fetch the destination details
    const { data: destination, error: destError } = await supabase
      .from('destinations')
      .select('name, city, category, description, content, michelin_stars, rating, place_types_json, editorial_summary')
      .eq('slug', slug)
      .single();

    if (destError || !destination) {
      return NextResponse.json(
        { error: 'Destination not found' },
        { status: 404 }
      );
    }

    // Parse place types if available
    let placeTypes: string[] = [];
    if (destination.place_types_json) {
      try {
        placeTypes = typeof destination.place_types_json === 'string'
          ? JSON.parse(destination.place_types_json)
          : destination.place_types_json;
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Use Gemini to understand what makes this place special and suggest similar ones
    let searchCriteria = '';
    if (GOOGLE_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `You are a travel expert. Based on this place, suggest what other places would be similar or complementary:

Place: ${destination.name}
City: ${destination.city}
Category: ${destination.category || 'unknown'}
${destination.rating ? `Rating: ${destination.rating}/5` : ''}
${placeTypes.length > 0 ? `Place Types: ${placeTypes.join(', ')}` : ''}
${destination.editorial_summary ? `Summary: ${destination.editorial_summary.substring(0, 200)}` : ''}

Based on this place, provide search criteria to find similar places. Return ONLY valid JSON:
{
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "categories": ["category1", "category2"],
  "description": "What makes this place special and what to look for in similar places"
}

Keywords should be descriptive (e.g., "romantic", "rooftop", "authentic", "fine-dining", "casual", "historic").
Categories should match the place type (e.g., "restaurant", "cafe", "bar", "museum").`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            searchCriteria = parsed.description || '';
            // Use keywords and categories from AI, or fallback to defaults
            const keywords = parsed.keywords || [];
            const aiCategories = parsed.categories || [];
            
            // Build Supabase query based on AI suggestions
            let query = supabase
              .from('destinations')
              .select('slug, name, city, category, image, michelin_stars, rating')
              .neq('slug', slug)
              .limit(limit * 2); // Get more to filter

            // Filter by city first (similar places in same city)
            query = query.ilike('city', `%${destination.city}%`);

            // Filter by category if available
            if (destination.category) {
              query = query.or(`category.ilike.%${destination.category}%,category.is.null`);
            }

            const { data, error } = await query;

            if (error) throw error;

            // Filter and rank results based on keywords
            if (data && data.length > 0) {
              let ranked = data.map((d: any) => {
                let score = 0;
                const searchText = `${d.name || ''} ${d.category || ''}`.toLowerCase();
                
                // Boost if same category
                if (d.category?.toLowerCase() === destination.category?.toLowerCase()) {
                  score += 10;
                }
                
                // Check keywords
                keywords.forEach((keyword: string) => {
                  if (searchText.includes(keyword.toLowerCase())) {
                    score += 5;
                  }
                });

                // Boost by rating if available
                if (d.rating) {
                  score += d.rating;
                }

                // Boost by Michelin stars
                if (d.michelin_stars) {
                  score += d.michelin_stars * 3;
                }

                return { ...d, _score: score };
              }).sort((a, b) => b._score - a._score)
                .slice(0, limit);

              return NextResponse.json({
                recommendations: ranked,
                criteria: searchCriteria
              });
            }
          } catch (e) {
            console.error('Failed to parse Gemini response:', e);
          }
        }
      } catch (error) {
        console.error('Gemini API error:', error);
      }
    }

    // Fallback: Find similar places by category and city
    let query = supabase
      .from('destinations')
      .select('slug, name, city, category, image, michelin_stars, rating')
      .neq('slug', slug)
      .ilike('city', `%${destination.city}%`)
      .limit(limit);

    if (destination.category) {
      query = query.ilike('category', `%${destination.category}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      recommendations: data || [],
      criteria: ''
    });

  } catch (error: any) {
    console.error('Recommendations API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
