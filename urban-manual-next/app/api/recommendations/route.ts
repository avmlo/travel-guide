import { NextRequest, NextResponse } from 'next/server';
import { SearchServiceClient } from '@google-cloud/discoveryengine';
import { supabase } from '@/lib/supabase';

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const location = process.env.GOOGLE_CLOUD_LOCATION || 'global';
const dataStoreId = process.env.VERTEX_AI_DATA_STORE_ID;

/**
 * GET /api/recommendations?slug=destination-slug&limit=6
 *
 * Returns AI-powered destination recommendations based on:
 * - Similar category (restaurants → restaurants)
 * - Same city or nearby cities
 * - Similar vibe/attributes
 * - User preferences (future)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');
    const limit = parseInt(searchParams.get('limit') || '6');

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    // 1. Get the current destination from Supabase
    const { data: currentDest, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !currentDest) {
      return NextResponse.json(
        { error: 'Destination not found' },
        { status: 404 }
      );
    }

    // 2. Check if Vertex AI is configured
    if (!projectId || !dataStoreId) {
      // Fallback: Simple Supabase-based recommendations
      return getFallbackRecommendations(currentDest, limit);
    }

    // 3. Use Vertex AI for smart recommendations
    try {
      const client = new SearchServiceClient();

      // Use engine's serving config for Enterprise + Generative AI features
      const engineId = `${dataStoreId}-engine`;
      const servingConfigPath = `projects/${projectId}/locations/${location}/collections/default_collection/engines/${engineId}/servingConfigs/default_config`;

      // Build smart query based on current destination
      const query = buildRecommendationQuery(currentDest);

      const response: any = await client.search({
        servingConfig: servingConfigPath,
        query,
        pageSize: limit + 5, // Get extra to filter out current destination
        // Boost similar items
        boostSpec: {
          conditionBoostSpecs: [
            {
              condition: `(category: "${currentDest.category}")`,
              boost: 2.0,
            },
            {
              condition: `(city: "${currentDest.city}")`,
              boost: 1.5,
            },
            {
              condition: currentDest.michelin_stars ? '(michelin_stars >= 1)' : '',
              boost: 1.3,
            },
          ].filter(spec => spec.condition),
        },
      });

      // Parse and filter results
      const results = Array.isArray(response) ? response : (response.results || []);
      const recommendations = results
        .map((result: any) => {
          try {
            const data = JSON.parse(result.document?.jsonData || '{}');
            return {
              slug: data.slug,
              name: data.name,
              city: data.city,
              category: data.category,
              image: data.image,
              michelin_stars: data.michelin_stars,
              crown: data.crown,
              relevanceScore: result.modelScores?.generic?.score || 0,
            };
          } catch {
            return null;
          }
        })
        .filter(Boolean)
        .filter((rec: any) => rec.slug !== slug) // Exclude current destination
        .slice(0, limit);

      return NextResponse.json({
        current: {
          slug: currentDest.slug,
          name: currentDest.name,
        },
        recommendations,
        source: 'vertex-ai',
      });

    } catch (vertexError) {
      console.error('Vertex AI error, falling back:', vertexError);
      return getFallbackRecommendations(currentDest, limit);
    }

  } catch (error: any) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get recommendations',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Build a smart query for finding similar destinations
 */
function buildRecommendationQuery(destination: any): string {
  const parts = [
    destination.category,
    `in ${destination.city}`,
  ];

  // Add descriptive terms
  if (destination.michelin_stars) {
    parts.push('fine dining', 'upscale');
  }

  if (destination.crown) {
    parts.push('popular', 'recommended');
  }

  // Add category-specific terms
  if (destination.category.toLowerCase().includes('restaurant')) {
    parts.push('dining', 'food');
  } else if (destination.category.toLowerCase().includes('cafe')) {
    parts.push('coffee', 'drinks');
  } else if (destination.category.toLowerCase().includes('bar')) {
    parts.push('cocktails', 'nightlife');
  }

  return parts.join(' ');
}

/**
 * Fallback recommendations using Supabase when Vertex AI is not configured
 */
async function getFallbackRecommendations(currentDest: any, limit: number) {
  console.log('Using fallback Supabase recommendations');

  const { data: recommendations } = await supabase
    .from('destinations')
    .select('slug, name, city, category, image, michelin_stars, crown')
    .neq('slug', currentDest.slug)
    .or(`category.eq.${currentDest.category},city.eq.${currentDest.city}`)
    .limit(limit);

  return NextResponse.json({
    current: {
      slug: currentDest.slug,
      name: currentDest.name,
    },
    recommendations: recommendations || [],
    source: 'supabase-fallback',
  });
}
