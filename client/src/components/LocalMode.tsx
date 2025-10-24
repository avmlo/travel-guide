import { useState, useEffect } from "react";
import { MapPin, Navigation, X, Loader2 } from "lucide-react";
import { Destination } from "@/types/destination";
import { getUserLocation, calculateDistance, formatDistance } from "@/lib/distance";
import { DestinationCard } from "@/components/DestinationCard";
import { toast } from "sonner";

interface LocalModeProps {
  destinations: Destination[];
  onSelectDestination: (destination: Destination) => void;
}

export function LocalMode({ destinations, onSelectDestination }: LocalModeProps) {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyDestinations, setNearbyDestinations] = useState<
    Array<Destination & { distance: number }>
  >([]);
  const [locationName, setLocationName] = useState<string>("");

  // Get location name from coordinates using reverse geocoding
  const getLocationName = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyDGCQSs6vTHRLQJ3qxLrxJLNQJ3qxLrxJL`
      );
      const data = await response.json();
      if (data.results && data.results[0]) {
        const addressComponents = data.results[0].address_components;
        const city = addressComponents.find((c: any) => c.types.includes("locality"));
        const country = addressComponents.find((c: any) => c.types.includes("country"));
        return city && country ? `${city.long_name}, ${country.short_name}` : "Your Location";
      }
    } catch (error) {
      console.error("Error getting location name:", error);
    }
    return "Your Location";
  };

  const activateLocalMode = async () => {
    setIsLoading(true);
    try {
      const location = await getUserLocation();
      setUserLocation(location);
      
      // Get location name
      const name = await getLocationName(location.lat, location.lng);
      setLocationName(name);

      // Calculate distances and sort by nearest
      const destinationsWithDistance = destinations
        .map((dest) => ({
          ...dest,
          distance: calculateDistance(location.lat, location.lng, dest.lat, dest.long),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 50); // Show top 50 nearest

      setNearbyDestinations(destinationsWithDistance);
      setIsActive(true);
      toast.success(`Found ${destinationsWithDistance.length} places nearby`);
    } catch (error: any) {
      console.error("Error getting location:", error);
      if (error.code === 1) {
        toast.error("Location permission denied. Please enable location access.");
      } else if (error.code === 2) {
        toast.error("Location unavailable. Please check your device settings.");
      } else if (error.code === 3) {
        toast.error("Location request timed out. Please try again.");
      } else {
        toast.error("Failed to get your location. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deactivateLocalMode = () => {
    setIsActive(false);
    setUserLocation(null);
    setNearbyDestinations([]);
    setLocationName("");
  };

  if (!isActive) {
    return (
      <button
        onClick={activateLocalMode}
        disabled={isLoading}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="font-medium">Getting location...</span>
          </>
        ) : (
          <>
            <Navigation className="h-5 w-5" />
            <span className="font-medium">Local Mode</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-40 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-6 py-4 z-10">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black dark:bg-white rounded-full">
              <MapPin className="h-5 w-5 text-white dark:text-black" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Local Mode</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {locationName} • {nearbyDestinations.length} places nearby
              </p>
            </div>
          </div>
          <button
            onClick={deactivateLocalMode}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {nearbyDestinations.map((destination) => (
            <div key={destination.slug} className="relative">
              <DestinationCard
                destination={destination}
                onClick={() => onSelectDestination(destination)}
              />
              {/* Distance Badge */}
              <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 dark:bg-white/80 text-white dark:text-black text-xs font-medium rounded-full backdrop-blur-sm">
                {formatDistance(destination.distance)}
              </div>
            </div>
          ))}
        </div>

        {nearbyDestinations.length === 0 && (
          <div className="text-center py-20">
            <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
            <p className="text-xl text-gray-400 dark:text-gray-500">
              No destinations found nearby
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

