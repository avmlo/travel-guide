import { useState, useEffect } from 'react';
import { Destination } from '@/types/destination';
import { MapPin, ExternalLink, Phone, Clock, Globe, Star, DollarSign } from 'lucide-react';

interface GoogleMapProps {
  destination: Destination;
}

export function GoogleMap({ destination }: GoogleMapProps) {
  const [placeData, setPlaceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlaceData() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `/api/places/search?name=${encodeURIComponent(destination.name)}&city=${encodeURIComponent(destination.city)}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch place data');
        }
        
        const data = await response.json();
        setPlaceData(data);
      } catch (err: any) {
        console.error('Error fetching place data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPlaceData();
  }, [destination.name, destination.city]);

  // Create search query for Google Maps
  const searchQuery = encodeURIComponent(`${destination.name}, ${destination.city}`);
  
  // Google Maps Embed URL
  const mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${searchQuery}&zoom=15`;
  
  // Google Maps link (opens in new tab)
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;

  return (
    <div className="space-y-4">
      {/* Map Embed */}
      <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden border border-gray-200">
        {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={mapEmbedUrl}
            title={`Map showing location of ${destination.name}`}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-500 p-6 text-center">
            <MapPin className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">Map integration requires Google Maps API key</p>
            <a 
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              View on Google Maps <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>

      {/* Place Information */}
      <div className="space-y-4">
        {loading && (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        )}
        
        {!loading && placeData && (
          <div className="space-y-3">
            {/* Address */}
            {placeData.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm text-gray-700">Address</p>
                  <p className="text-sm text-gray-600">{placeData.address}</p>
                </div>
              </div>
            )}
            
            {/* Opening Hours */}
            {placeData.opening_hours && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm text-gray-700">Hours</p>
                  <p className="text-sm">
                    {placeData.opening_hours.open_now ? (
                      <span className="text-green-600 font-medium">Open now</span>
                    ) : (
                      <span className="text-red-600 font-medium">Closed</span>
                    )}
                  </p>
                  {placeData.opening_hours.weekday_text && (
                    <div className="mt-1 space-y-0.5">
                      {placeData.opening_hours.weekday_text.map((day: string, i: number) => (
                        <p key={i} className="text-xs text-gray-500">{day}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Phone */}
            {placeData.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm text-gray-700">Phone</p>
                  <a 
                    href={`tel:${placeData.phone}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {placeData.phone}
                  </a>
                </div>
              </div>
            )}
            
            {/* Website */}
            {placeData.website && (
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm text-gray-700">Website</p>
                  <a 
                    href={placeData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Visit website <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}
            
            {/* Rating */}
            {placeData.rating && (
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm text-gray-700">Google Rating</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{placeData.rating.toFixed(1)}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3.5 w-3.5 ${
                            i < Math.floor(placeData.rating) 
                              ? 'text-yellow-400 fill-yellow-400' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    {placeData.user_ratings_total && (
                      <span className="text-xs text-gray-500">({placeData.user_ratings_total.toLocaleString()} reviews)</span>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Price Level */}
            {placeData.price_level !== undefined && placeData.price_level > 0 && (
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm text-gray-700">Price Level</p>
                  <p className="text-sm text-gray-600">
                    {'$'.repeat(placeData.price_level)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {!loading && !placeData && !error && (
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm text-gray-700">Location</p>
              <p className="text-sm text-gray-600">{destination.city}</p>
            </div>
          </div>
        )}
        
        {/* Open in Google Maps button */}
        <a
          href={placeData?.google_maps_url || mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Open in Google Maps
        </a>
      </div>


    </div>
  );
}

// Optional: Component for displaying Google Places data
interface PlaceInfoProps {
  placeName: string;
  city: string;
}

export function PlaceInfo({ placeName, city }: PlaceInfoProps) {
  const [placeData, setPlaceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This would call your backend API that uses Google Places API
    // For now, it's a placeholder
    async function fetchPlaceData() {
      try {
        // TODO: Implement backend endpoint that calls Google Places API
        // const response = await fetch(`/api/places?name=${placeName}&city=${city}`);
        // const data = await response.json();
        // setPlaceData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching place data:', error);
        setLoading(false);
      }
    }

    fetchPlaceData();
  }, [placeName, city]);

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!placeData) {
    return null;
  }

  return (
    <div className="space-y-3 text-sm">
      {placeData.opening_hours && (
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
          <div>
            <p className="font-medium text-gray-700">Hours</p>
            <p className="text-gray-600">
              {placeData.opening_hours.open_now ? (
                <span className="text-green-600">Open now</span>
              ) : (
                <span className="text-red-600">Closed</span>
              )}
            </p>
          </div>
        </div>
      )}

      {placeData.formatted_phone_number && (
        <div className="flex items-start gap-3">
          <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
          <div>
            <p className="font-medium text-gray-700">Phone</p>
            <a 
              href={`tel:${placeData.formatted_phone_number}`}
              className="text-gray-600 hover:text-blue-600"
            >
              {placeData.formatted_phone_number}
            </a>
          </div>
        </div>
      )}

      {placeData.website && (
        <div className="flex items-start gap-3">
          <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
          <div>
            <p className="font-medium text-gray-700">Website</p>
            <a 
              href={placeData.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600 flex items-center gap-1"
            >
              Visit website <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

