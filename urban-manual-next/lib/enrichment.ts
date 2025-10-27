/**
 * Destination Enrichment Service
 * Uses Google Places API (New) + Gemini AI to enrich destination data
 */

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

export interface PlacesEnrichmentData {
  place_id: string | null;
  rating: number | null;
  price_level: number | null;
  opening_hours: any | null;
  phone_number: string | null;
  website: string | null;
  google_maps_url: string | null;
  google_types: string[];
}

export interface GeminiTagsData {
  tags: string[];
  suggested_category: string | null;
}

export interface EnrichedData {
  places: PlacesEnrichmentData;
  gemini: GeminiTagsData;
  category: string; // Final category decision
}

/**
 * Step 1: Search for place using Places API (New) - Text Search
 */
export async function findPlaceByText(
  name: string,
  city: string
): Promise<PlacesEnrichmentData> {
  if (!GOOGLE_API_KEY) {
    throw new Error('Google API key not configured');
  }

  try {
    // Use Places API (New) - Text Search
    const searchQuery = `${name}, ${city}`;
    const response = await fetch(
      `https://places.googleapis.com/v1/places:searchText`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.priceLevel,places.regularOpeningHours,places.internationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.types',
        },
        body: JSON.stringify({
          textQuery: searchQuery,
          maxResultCount: 1,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Places API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.places || data.places.length === 0) {
      return {
        place_id: null,
        rating: null,
        price_level: null,
        opening_hours: null,
        phone_number: null,
        website: null,
        google_maps_url: null,
        google_types: [],
      };
    }

    const place = data.places[0];

    // Convert price level from Google's format to 1-4
    const priceLevelMap: Record<string, number> = {
      'PRICE_LEVEL_FREE': 1,
      'PRICE_LEVEL_INEXPENSIVE': 1,
      'PRICE_LEVEL_MODERATE': 2,
      'PRICE_LEVEL_EXPENSIVE': 3,
      'PRICE_LEVEL_VERY_EXPENSIVE': 4,
    };

    return {
      place_id: place.id || null,
      rating: place.rating || null,
      price_level: place.priceLevel ? priceLevelMap[place.priceLevel] || null : null,
      opening_hours: place.regularOpeningHours || null,
      phone_number: place.internationalPhoneNumber || null,
      website: place.websiteUri || null,
      google_maps_url: place.googleMapsUri || null,
      google_types: place.types || [],
    };
  } catch (error) {
    console.error('Places API error:', error);
    return {
      place_id: null,
      rating: null,
      price_level: null,
      opening_hours: null,
      phone_number: null,
      website: null,
      google_maps_url: null,
      google_types: [],
    };
  }
}

/**
 * Step 2: Generate AI tags and category using Gemini
 */
export async function generateGeminiTags(
  name: string,
  city: string,
  existingCategory?: string,
  description?: string,
  googleTypes?: string[]
): Promise<GeminiTagsData> {
  if (!GOOGLE_API_KEY) {
    throw new Error('Google API key not configured');
  }

  try {
    const prompt = `You are a travel expert categorizing destinations. Analyze this place and provide:
1. 5-8 descriptive tags (e.g., "romantic", "family-friendly", "instagrammable", "hidden gem", "michelin-recommended", "rooftop", "speakeasy", etc.)
2. Best category classification

Place: ${name}
Location: ${city}
${existingCategory ? `Current category: ${existingCategory}` : ''}
${description ? `Description: ${description}` : ''}
${googleTypes?.length ? `Google types: ${googleTypes.join(', ')}` : ''}

Respond ONLY with valid JSON in this exact format:
{
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "suggested_category": "Category Name"
}

Tags should be lowercase, concise, and highly searchable. Categories should be one of: Restaurants, Cafes, Bars, Hotels, Culture, Shopping, Nightlife, Activities, Other.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract JSON from response (Gemini sometimes adds markdown)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON in Gemini response');
    }

    const result = JSON.parse(jsonMatch[0]);

    return {
      tags: result.tags || [],
      suggested_category: result.suggested_category || null,
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      tags: [],
      suggested_category: null,
    };
  }
}

/**
 * Step 3: Determine best category from Google types
 */
function categorizePlaceFromTypes(googleTypes: string[]): string | null {
  const typeMap: Record<string, string> = {
    restaurant: 'Restaurants',
    cafe: 'Cafes',
    bar: 'Bars',
    night_club: 'Nightlife',
    lodging: 'Hotels',
    museum: 'Culture',
    art_gallery: 'Culture',
    shopping_mall: 'Shopping',
    store: 'Shopping',
    tourist_attraction: 'Activities',
    park: 'Activities',
  };

  for (const type of googleTypes) {
    if (typeMap[type]) {
      return typeMap[type];
    }
  }

  return null;
}

/**
 * Main enrichment function - combines Places API + Gemini
 */
export async function enrichDestination(
  name: string,
  city: string,
  existingCategory?: string,
  description?: string
): Promise<EnrichedData> {
  console.log(`Enriching: ${name} in ${city}`);

  // Step 1: Get Google Places data
  const placesData = await findPlaceByText(name, city);

  // Step 2: Generate Gemini tags
  const geminiData = await generateGeminiTags(
    name,
    city,
    existingCategory,
    description,
    placesData.google_types
  );

  // Step 3: Determine final category
  let finalCategory = existingCategory || '';

  // Priority: Google types > Gemini suggestion > existing
  if (placesData.google_types.length > 0) {
    const googleCategory = categorizePlaceFromTypes(placesData.google_types);
    if (googleCategory) {
      finalCategory = googleCategory;
    }
  } else if (geminiData.suggested_category) {
    finalCategory = geminiData.suggested_category;
  }

  return {
    places: placesData,
    gemini: geminiData,
    category: finalCategory,
  };
}
