import { NextRequest, NextResponse } from 'next/server';
import { SearchServiceClient } from '@google-cloud/discoveryengine';

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID!;
const location = process.env.GOOGLE_CLOUD_LOCATION || 'global';
const dataStoreId = process.env.VERTEX_AI_DATA_STORE_ID!;

/**
 * POST /api/search
 *
 * Performs natural language search using Google Vertex AI Search
 *
 * Body:
 * {
 *   query: string;
 *   pageSize?: number;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { query, pageSize = 20 } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Check if Vertex AI is configured
    if (!projectId || !dataStoreId) {
      console.warn('Vertex AI not configured, falling back to basic search');
      return NextResponse.json(
        {
          error: 'Search service not configured',
          fallback: true
        },
        { status: 503 }
      );
    }

    // Initialize Vertex AI Search client
    const client = new SearchServiceClient();

    // Use engine's serving config for Enterprise + Generative AI features
    const engineId = `${dataStoreId}-engine`;
    const servingConfigPath = `projects/${projectId}/locations/${location}/collections/default_collection/engines/${engineId}/servingConfigs/default_config`;

    // Perform search with Enterprise features
    const response: any = await client.search({
      servingConfig: servingConfigPath,
      query,
      pageSize,
      // Query expansion for natural language understanding
      queryExpansionSpec: {
        condition: 'AUTO',
      },
      // Enable generative AI features (search summarization, extractive answers)
      contentSearchSpec: {
        summarySpec: {
          summaryResultCount: 3, // Number of results to summarize
          includeCitations: true,
        },
        extractiveContentSpec: {
          maxExtractiveAnswerCount: 3, // Enterprise feature: extractive answers
        },
      },
      // Boost featured and Michelin-starred destinations
      boostSpec: {
        conditionBoostSpecs: [
          {
            condition: '(crown: true)',
            boost: 2.0, // Boost featured destinations
          },
          {
            condition: '(michelin_stars >= 1)',
            boost: 1.5, // Boost Michelin-starred places
          },
        ],
      },
    });

    // Extract results
    const searchResults = Array.isArray(response) ? response : (response.results || []);
    const results = searchResults.map((result: any) => {
      try {
        // Parse the document data
        const data = JSON.parse(result.document?.jsonData || '{}');
        return {
          slug: data.slug,
          name: data.name,
          city: data.city,
          category: data.category,
          content: data.content,
          image: data.image,
          michelin_stars: data.michelin_stars,
          crown: data.crown,
          // Include relevance score
          relevanceScore: result.modelScores?.generic?.score || 0,
        };
      } catch (error) {
        console.error('Error parsing search result:', error);
        return null;
      }
    }).filter(Boolean);

    // Extract AI-generated summary (Enterprise feature)
    const summary = response.summary?.summaryText || null;
    const extractiveAnswers = response.summary?.extractiveAnswers || [];

    return NextResponse.json({
      query,
      results,
      totalResults: response.totalSize || 0,
      nextPageToken: response.nextPageToken,
      // Enterprise + Generative AI features
      summary, // AI-generated search summary
      extractiveAnswers, // Extractive answers from content
    });

  } catch (error: any) {
    console.error('Search error:', error);

    return NextResponse.json(
      {
        error: 'Search failed',
        message: error.message,
        fallback: true
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/search?q=query&limit=20
 *
 * Alternative GET endpoint for simple queries
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const pageSize = parseInt(searchParams.get('limit') || '20');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    );
  }

  // Forward to POST handler
  return POST(
    new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({ query, pageSize }),
    })
  );
}
