import { useQuery } from '@tantml:parameter>
<parameter name="supabase } from '@/lib/supabase';

interface NearbyDestination {
  slug: string;
  name: string;
  city: string;
  category: string;
  main_image: string;
  michelin_stars: number;
  crown: boolean;
  lat: number;
  long: number;
  distance_km: number;
}

/**
 * Find nearby destinations using PostGIS
 * Much more accurate than simple lat/long math
 * 
 * Features:
 * - GPS-accurate distance calculations
 * - Configurable radius
 * - Sorted by distance
 * - Optional category filter
 * 
 * @example
 * const { data: nearby } = useNearbyDestinations(35.6812, 139.7671, 5);
 * const { data: restaurants } = useNearbyDestinations(35.6812, 139.7671, 10, 'Dining');
 */
export function useNearbyDestinations(
  lat: number,
  lng: number,
  radiusKm: number = 5,
  category?: string
) {
  return useQuery({
    queryKey: ['nearby', lat, lng, radiusKm, category],
    queryFn: async () => {
      // Use category filter if provided
      if (category) {
        const { data, error } = await supabase.rpc('find_nearby_by_category', {
          user_lat: lat,
          user_lng: lng,
          filter_category: category,
          radius_km: radiusKm,
          limit_count: 50,
        });

        if (error) {
          console.error('Nearby search error:', error);
          throw error;
        }

        return data as NearbyDestination[];
      }

      // Basic nearby search
      const { data, error } = await supabase.rpc('find_nearby_destinations', {
        user_lat: lat,
        user_lng: lng,
        radius_km: radiusKm,
        limit_count: 50,
      });

      if (error) {
        console.error('Nearby search error:', error);
        throw error;
      }

      return data as NearbyDestination[];
    },
    enabled: lat !== 0 && lng !== 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get destinations within map bounds
 * Useful for showing markers on a map
 */
export function useDestinationsInBounds(
  minLat: number,
  minLng: number,
  maxLat: number,
  maxLng: number
) {
  return useQuery({
    queryKey: ['bounds', minLat, minLng, maxLat, maxLng],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_destinations_in_bounds', {
        min_lat: minLat,
        min_lng: minLng,
        max_lat: maxLat,
        max_lng: maxLng,
      });

      if (error) {
        console.error('Bounds search error:', error);
        throw error;
      }

      return data;
    },
    enabled: minLat !== 0 && minLng !== 0 && maxLat !== 0 && maxLng !== 0,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get user's current location
 * Returns coordinates and loading state
 */
export function useUserLocation() {
  return useQuery({
    queryKey: ['user-location'],
    queryFn: async () => {
      return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          }
        );
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

/**
 * Combined hook for nearby destinations based on user's location
 * Automatically gets user location and finds nearby places
 */
export function useNearbyFromCurrentLocation(radiusKm: number = 5, category?: string) {
  const { data: location, isLoading: locationLoading } = useUserLocation();
  const { data: nearby, isLoading: nearbyLoading } = useNearbyDestinations(
    location?.lat || 0,
    location?.lng || 0,
    radiusKm,
    category
  );

  return {
    destinations: nearby || [],
    userLocation: location,
    isLoading: locationLoading || nearbyLoading,
  };
}

