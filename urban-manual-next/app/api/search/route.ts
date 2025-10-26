import { NextRequest, NextResponse } from 'next/server';
import { SearchServiceClient } from '@google-cloud/discoveryengine';
import { supabase } from '@/lib/supabase';

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const location = process.env.GOOGLE_CLOUD_LOCATION || 'global';
const dataStoreId = process.env.VERTEX_AI_DATA_STORE_ID;
const geminiApiKey = process.env.GEMINI_API_KEY;

interface SearchResult {
  slug: string;
  name: string;
  city: string;
  category: string;
  image: string | null;
  michelin_stars: number | null;
  crown: boolean;
  content?: string;
  relevanceScore?: number;
}

/**
 * POST /api/search
 *
 * Intelligent 3-tier search system:
 * 1. Discovery Engine (production) - Full ranking + personalization + AI summaries
 * 2. Gemini semantic (fallback) - Vector similarity search
 * 3. Basic search (always works) - Keyword matching
 *
 * Body: { query: string, pageSize?: number, filters?: { city?: string, category?: string } }
 */
export async function POST(request: NextRequest) {
  try {
    const { query, pageSize = 20, filters } = await request.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // TIER 1: Try Discovery Engine (best ranking + AI features)
    if (projectId && dataStoreId) {
      try {
        console.log('🔍 Using Discovery Engine search with full ranking');
        const result = await searchWithDiscoveryEngine(query, pageSize, filters);
        return NextResponse.json({
          ...result,
          searchTier: 'discovery-engine',
        });
      } catch (error) {
        console.warn('Discovery Engine failed, falling back:', error);
      }
    }

    // TIER 2: Try Gemini Semantic Search (good semantic understanding)
    if (geminiApiKey) {
      try {
        console.log('🧠 Using Gemini semantic search');
        const results = await searchWithGemini(query, pageSize, filters);
        return NextResponse.json({
          query,
          results,
          totalResults: results.length,
          searchTier: 'gemini-semantic',
        });
      } catch (error) {
        console.warn('Gemini search failed, falling back:', error);
      }
    }

    // TIER 3: Basic search (always works)
    console.log('⚡ Using basic search');
    const results = await searchBasic(query, pageSize, filters);
    return NextResponse.json({
      query,
      results,
      totalResults: results.length,
      searchTier: 'basic',
    });

  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      {
        error: 'Search failed',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/search?q=query&limit=20
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const pageSize = parseInt(searchParams.get('limit') || '20');
  const city = searchParams.get('city');
  const category = searchParams.get('category');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    );
  }

  const filters: any = {};
  if (city) filters.city = city;
  if (category) filters.category = category;

  return POST(
    new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({ query, pageSize, filters }),
    })
  );
}

/**
 * TIER 1: Discovery Engine Search
 * - Sophisticated ranking algorithms
 * - Personalization based on user behavior
 * - Query understanding and intent detection
 * - AI-generated summaries and extractive answers
 * - Boosting rules for quality signals
 */
async function searchWithDiscoveryEngine(
  query: string,
  pageSize: number,
  filters?: any
) {
  const client = new SearchServiceClient();
  const engineId = `${dataStoreId}-engine`;
  const servingConfigPath = `projects/${projectId}/locations/${location}/collections/default_collection/engines/${engineId}/servingConfigs/default_config`;

  // Build filter string for Discovery Engine
  let filterString = '';
  if (filters?.city) {
    filterString += `(city: "${filters.city}")`;
  }
  if (filters?.category) {
    if (filterString) filterString += ' AND ';
    filterString += `(category: "${filters.category}")`;
  }

  const response: any = await client.search({
    servingConfig: servingConfigPath,
    query,
    pageSize,
    filter: filterString || undefined,

    // Advanced ranking configuration - social signals
    boostSpec: {
      conditionBoostSpecs: [
        {
          condition: '(save_count >= 100)',
          boost: 3.0, // Highly saved = very popular
        },
        {
          condition: '(save_count >= 50)',
          boost: 2.5,
        },
        {
          condition: '(save_count >= 20)',
          boost: 2.0,
        },
        {
          condition: '(save_count >= 10)',
          boost: 1.5,
        },
        {
          condition: '(crown: true)',
          boost: 1.3, // Crown badge = editor's pick
        },
      ],
    },

    // Content search spec for better text matching
    contentSearchSpec: {
      searchResultMode: 'DOCUMENTS',
      snippetSpec: {
        maxSnippetCount: 3,
        returnSnippet: true,
      },
      summarySpec: {
        summaryResultCount: 3,
        includeCitations: true,
      },
      extractiveContentSpec: {
        maxExtractiveAnswerCount: 3,
      },
    },

    // Query expansion for better recall
    queryExpansionSpec: {
      condition: 'AUTO',
    },

    // Spell correction
    spellCorrectionSpec: {
      mode: 'AUTO',
    },
  });

  const searchResults = Array.isArray(response) ? response : (response.results || []);
  const results = searchResults.map((result: any) => {
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
        content: data.content,
        relevanceScore: result.modelScores?.generic?.score || 0,
      };
    } catch {
      return null;
    }
  }).filter(Boolean);

  return {
    query,
    results,
    totalResults: response.totalSize || 0,
    nextPageToken: response.nextPageToken,
    summary: response.summary?.summaryText || null,
    extractiveAnswers: response.summary?.extractiveAnswers || [],
  };
}

/**
 * TIER 2: Gemini Semantic Search
 * - Vector similarity using embeddings
 * - Understands semantic meaning ("romantic dinner" = fine dining)
 * - Good for natural language queries
 */
async function searchWithGemini(
  query: string,
  pageSize: number,
  filters?: any
): Promise<SearchResult[]> {
  // Generate embedding for search query
  const queryEmbedding = await generateGeminiEmbedding(query);

  // Build Supabase query with vector similarity
  let supabaseQuery = supabase
    .from('destinations')
    .select('*')
    .not('embedding', 'is', null);

  // Apply filters
  if (filters?.city) {
    supabaseQuery = supabaseQuery.eq('city', filters.city);
  }
  if (filters?.category) {
    supabaseQuery = supabaseQuery.eq('category', filters.category);
  }

  const { data: destinations, error } = await supabaseQuery;

  if (error || !destinations) {
    throw new Error('Failed to fetch destinations');
  }

  // Calculate cosine similarity with query embedding
  const results = destinations
    .map(dest => {
      if (!dest.embedding) return null;

      const similarity = cosineSimilarity(queryEmbedding, dest.embedding);

      // Apply social signal boosting
      let score = similarity;
      const saveCount = dest.save_count || 0;
      if (saveCount >= 100) score += 0.15;
      else if (saveCount >= 50) score += 0.12;
      else if (saveCount >= 20) score += 0.10;
      else if (saveCount >= 10) score += 0.05;
      if (dest.crown) score += 0.03;

      return {
        slug: dest.slug,
        name: dest.name,
        city: dest.city,
        category: dest.category,
        image: dest.image,
        michelin_stars: dest.michelin_stars,
        crown: dest.crown,
        content: dest.content,
        relevanceScore: score,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (b?.relevanceScore || 0) - (a?.relevanceScore || 0))
    .slice(0, pageSize) as SearchResult[];

  return results;
}

/**
 * TIER 3: Basic Search
 * - Fast keyword matching
 * - Works offline, no dependencies
 * - Simple ranking based on match quality + quality signals
 */
async function searchBasic(
  query: string,
  pageSize: number,
  filters?: any
): Promise<SearchResult[]> {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);

  let supabaseQuery = supabase
    .from('destinations')
    .select('*');

  // Apply filters
  if (filters?.city) {
    supabaseQuery = supabaseQuery.eq('city', filters.city);
  }
  if (filters?.category) {
    supabaseQuery = supabaseQuery.eq('category', filters.category);
  }

  const { data: destinations, error } = await supabaseQuery;

  if (error || !destinations) {
    throw new Error('Failed to fetch destinations');
  }

  // Score each destination
  const results = destinations
    .map(dest => {
      const nameLower = dest.name.toLowerCase();
      const categoryLower = (dest.category || '').toLowerCase();
      const cityLower = dest.city.toLowerCase();
      const contentLower = (dest.content || '').toLowerCase();

      let score = 0;

      // Exact match in name (highest priority)
      if (nameLower.includes(queryLower)) {
        score += 10;
      }

      // Name starts with query (second highest)
      if (nameLower.startsWith(queryLower)) {
        score += 5;
      }

      // Word matches in name
      queryWords.forEach(word => {
        if (nameLower.includes(word)) score += 3;
        if (categoryLower.includes(word)) score += 2;
        if (cityLower.includes(word)) score += 1.5;
        if (contentLower.includes(word)) score += 0.5;
      });

      // Social signal boosting (popularity)
      const saveCount = dest.save_count || 0;
      if (saveCount >= 100) score += 8;
      else if (saveCount >= 50) score += 6;
      else if (saveCount >= 20) score += 4;
      else if (saveCount >= 10) score += 2;
      if (dest.crown) score += 1;

      return {
        slug: dest.slug,
        name: dest.name,
        city: dest.city,
        category: dest.category,
        image: dest.image,
        michelin_stars: dest.michelin_stars,
        crown: dest.crown,
        content: dest.content,
        relevanceScore: score,
      };
    })
    .filter(dest => dest.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, pageSize);

  return results;
}

/**
 * Generate embedding using Gemini API
 */
async function generateGeminiEmbedding(text: string): Promise<number[]> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${geminiApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/embedding-001',
        content: { parts: [{ text }] },
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to generate embedding');
  }

  const data = await response.json();
  return data.embedding.values;
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
