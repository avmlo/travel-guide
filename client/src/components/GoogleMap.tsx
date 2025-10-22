import { useState, useEffect } from 'react';
import { Destination } from '@/types/destination';
import { MapPin, ExternalLink, Phone, Clock, Globe } from 'lucide-react';

interface GoogleMapProps {
  destination: Destination;
}

export function GoogleMap({ destination }: GoogleMapProps) {
  const [placeData, setPlaceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Create search query for Google Maps
  const searchQuery = encodeURIComponent(`${destination.name}, ${destination.city}`);
  
  // Google Maps Embed URL
  const mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${searchQuery}&zoom=15`;
  
  // Google Maps link (opens in new tab)
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;

  return (
    <div className="space-y-4">
      {/* Map Embed */}
      <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden border border-gray-200">
        {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
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

      {/* Location Info */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-sm text-gray-700">Location</p>
            <p className="text-sm text-gray-600">{destination.city}</p>
          </div>
        </div>

        {/* Open in Google Maps button */}
        <a
          href={mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Open in Google Maps
        </a>
      </div>

      {/* Additional Info Section */}
      {destination.content && (
        <div className="pt-4 border-t border-gray-200">
          <h4 className="font-semibold text-sm text-gray-700 mb-2">About</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {destination.content}
          </p>
        </div>
      )}
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

