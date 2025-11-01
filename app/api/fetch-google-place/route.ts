import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

function stripHtmlTags(text: string | null | undefined): string {
  if (!text) return '';
  
  return text
    .replace(/<p[^>]*>/gi, '') // Remove opening <p> tags
    .replace(/<\/p>/gi, '')    // Remove closing </p> tags
    .replace(/<br\s*\/?>/gi, '\n') // Convert <br> to newlines
    .trim();
}

async function findPlaceId(query: string, name?: string, city?: string): Promise<string | null> {
  if (!GOOGLE_API_KEY) return null;
  
  // Strategy 1: Try exact query first (name + city)
  let url = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
  url.searchParams.set('input', query);
  url.searchParams.set('inputtype', 'textquery');
  url.searchParams.set('fields', 'place_id');
  url.searchParams.set('key', GOOGLE_API_KEY);
  let r = await fetch(url.toString());
  let j = await r.json();
  if (j?.candidates?.[0]?.place_id) {
    return j.candidates[0].place_id;
  }
  
  // Strategy 2: Try just name
  if (name) {
    url = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
    url.searchParams.set('input', name);
    url.searchParams.set('inputtype', 'textquery');
    url.searchParams.set('fields', 'place_id');
    url.searchParams.set('key', GOOGLE_API_KEY);
    r = await fetch(url.toString());
    j = await r.json();
    if (j?.candidates?.[0]?.place_id) {
      return j.candidates[0].place_id;
    }
  }
  
  return null;
}

async function getPlaceDetails(placeId: string) {
  if (!GOOGLE_API_KEY) return null;
  
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('fields', [
    'name',
    'formatted_address',
    'international_phone_number',
    'website',
    'price_level',
    'rating',
    'user_ratings_total',
    'opening_hours',
    'current_opening_hours',
    'editorial_summary',
    'types',
    'photos',
    'geometry',
  ].join(','));
  url.searchParams.set('key', GOOGLE_API_KEY);
  const r = await fetch(url.toString());
  const j = await r.json();
  return j?.result || null;
}

export async function POST(request: NextRequest) {
  try {
    // Check admin status
    const authHeader = request.headers.get('x-admin-email');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!ADMIN_EMAILS.includes(authHeader.toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, city, placeId } = body;

    // If placeId is provided directly, use it (from autocomplete)
    let finalPlaceId: string | null = null;
    
    if (placeId) {
      finalPlaceId = placeId;
    } else if (name) {
      // Build search query
      const query = city ? `${name}, ${city}` : name;
      
      // Find place ID
      finalPlaceId = await findPlaceId(query, name, city);
      if (!finalPlaceId) {
        return NextResponse.json({ error: 'Place not found' }, { status: 404 });
      }
    } else {
      return NextResponse.json({ error: 'Name or placeId is required' }, { status: 400 });
    }

    // Ensure we have a valid placeId
    if (!finalPlaceId) {
      return NextResponse.json({ error: 'Place ID is required' }, { status: 400 });
    }

    // Get place details
    const details = await getPlaceDetails(finalPlaceId);
    if (!details) {
      return NextResponse.json({ error: 'Failed to fetch place details' }, { status: 500 });
    }

    // Extract city from address if not provided
    let extractedCity = city;
    if (!extractedCity && details.formatted_address) {
      const addressParts = details.formatted_address.split(',');
      if (addressParts.length >= 2) {
        extractedCity = addressParts[addressParts.length - 3]?.trim() || addressParts[addressParts.length - 2]?.trim();
      }
    }

    // Determine category from types
    let category = '';
    if (details.types && Array.isArray(details.types)) {
      // Priority order for category mapping
      const categoryMap: Record<string, string> = {
        'restaurant': 'restaurant',
        'cafe': 'cafe',
        'bar': 'bar',
        'lodging': 'hotel',
        'museum': 'museum',
        'art_gallery': 'gallery',
        'shopping_mall': 'shopping',
        'store': 'shopping',
        'park': 'park',
        'tourist_attraction': 'attraction',
        'church': 'attraction',
        'temple': 'attraction',
      };
      
      for (const type of details.types) {
        if (categoryMap[type]) {
          category = categoryMap[type];
          break;
        }
      }
      
      if (!category) {
        category = details.types[0]?.replace(/_/g, ' ') || '';
      }
    }

    // Get first photo if available
    let imageUrl = null;
    if (details.photos && details.photos.length > 0) {
      const photo = details.photos[0];
      imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`;
    }

    // Build response with form-friendly data
    const editorialSummary = stripHtmlTags(details.editorial_summary?.overview || '');
    const result = {
      name: details.name || name,
      city: extractedCity || city || '',
      category: category,
      description: editorialSummary,
      content: editorialSummary,
      image: imageUrl,
      formatted_address: details.formatted_address || '',
      phone: details.international_phone_number || '',
      website: details.website || '',
      rating: details.rating || null,
      price_level: details.price_level || null,
      opening_hours: details.current_opening_hours || details.opening_hours || null,
      place_types: details.types || [],
    };

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Fetch Google Place error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch place data' }, { status: 500 });
  }
}

