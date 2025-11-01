import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('input') || '';
    const sessionToken = searchParams.get('sessionToken') || '';
    const location = searchParams.get('location'); // Optional: "lat,lng" for location bias
    const radius = searchParams.get('radius'); // Optional: radius in meters
    const types = searchParams.get('types') || 'establishment'; // Optional: restrict to specific types

    if (!query || query.length < 2) {
      return NextResponse.json({ predictions: [] });
    }

    if (!GOOGLE_API_KEY) {
      return NextResponse.json({ error: 'Google API key not configured' }, { status: 500 });
    }

    // Build Google Places Autocomplete API URL
    const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    url.searchParams.set('input', query);
    url.searchParams.set('key', GOOGLE_API_KEY);
    
    // Optional parameters for better results
    if (types && types !== 'all') {
      url.searchParams.set('types', types);
    }
    
    if (location) {
      url.searchParams.set('location', location);
      if (radius) {
        url.searchParams.set('radius', radius);
      }
    }
    
    // Add session token if provided (helps with billing)
    if (sessionToken) {
      url.searchParams.set('sessiontoken', sessionToken);
    }

    // Add language and region bias
    url.searchParams.set('language', 'en');
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places Autocomplete error:', data.status, data.error_message);
      return NextResponse.json({ 
        error: data.error_message || `API error: ${data.status}`,
        predictions: []
      }, { status: 500 });
    }

    // Transform Google's response to our format
    const predictions = (data.predictions || []).map((pred: any) => ({
      place_id: pred.place_id,
      description: pred.description,
      structured_formatting: pred.structured_formatting || {},
      main_text: pred.structured_formatting?.main_text || pred.description.split(',')[0],
      secondary_text: pred.structured_formatting?.secondary_text || pred.description.split(',').slice(1).join(','),
      types: pred.types || [],
      matched_substrings: pred.matched_substrings || [],
    }));

    return NextResponse.json({
      predictions,
      sessionToken: data.sessiontoken || sessionToken,
    });

  } catch (error: any) {
    console.error('Google Places Autocomplete error:', error);
    return NextResponse.json(
      { error: error.message || 'Autocomplete failed', predictions: [] },
      { status: 500 }
    );
  }
}

