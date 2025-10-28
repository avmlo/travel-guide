import { useEffect, useRef, useState } from "react";
import { Destination } from "@/types/destination";

interface MapViewProps {
  destinations: Destination[];
  onDestinationClick: (slug: string) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export function MapView({ destinations, onDestinationClick }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const destinationsWithCoords = destinations.filter(
    (d) => d.lat !== 0 && d.long !== 0
  );

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setError("Google Maps API key not configured. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.");
      return;
    }

    // Load Google Maps script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=marker`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setMapLoaded(true);
    };

    script.onerror = () => {
      setError("Failed to load Google Maps.");
    };

    if (!document.querySelector(`script[src^="https://maps.googleapis.com/maps/api/js"]`)) {
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }

    return () => {
      // Cleanup markers
      markersRef.current.forEach(marker => marker.setMap?.(null));
      markersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google) return;

    try {
      // Initialize Google Map
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 25, lng: 0 },
        zoom: 2,
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false,
        zoomControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      googleMapRef.current = map;

      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // Add markers for destinations
      destinationsWithCoords.forEach((destination) => {
        const marker = new window.google.maps.Marker({
          position: { lat: destination.lat, lng: destination.long },
          map: map,
          title: destination.name,
          animation: window.google.maps.Animation.DROP,
        });

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 4px 0; font-weight: 600; font-size: 14px;">${destination.name}</h3>
              <p style="margin: 0; color: #666; font-size: 12px;">${destination.city}</p>
            </div>
          `,
        });

        marker.addListener('click', () => {
          // Close other info windows
          markersRef.current.forEach(m => {
            if (m.infoWindow) {
              m.infoWindow.close();
            }
          });

          infoWindow.open(map, marker);
          onDestinationClick(destination.slug);
        });

        // Store info window reference
        (marker as any).infoWindow = infoWindow;
        markersRef.current.push(marker);
      });

      // Fit bounds to show all markers
      if (destinationsWithCoords.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        destinationsWithCoords.forEach((destination) => {
          bounds.extend({ lat: destination.lat, lng: destination.long });
        });
        map.fitBounds(bounds);

        // Adjust zoom if only one marker
        if (destinationsWithCoords.length === 1) {
          map.setZoom(15);
        }
      }

    } catch (err) {
      console.error("Error creating map:", err);
      setError("Unable to display map. Please check your connection.");
    }
  }, [mapLoaded, destinationsWithCoords, onDestinationClick]);

  if (error) {
    return (
      <div className="w-full h-[calc(100vh-8rem)] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-8">
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">{error}</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center max-w-md">
          Showing {destinationsWithCoords.length} destinations with coordinates.
          Click on any destination card to view details.
        </p>
      </div>
    );
  }

  if (!mapLoaded) {
    return (
      <div className="w-full h-[calc(100vh-8rem)] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Loading Google Maps...</p>
      </div>
    );
  }

  if (destinationsWithCoords.length === 0) {
    return (
      <div className="w-full h-[calc(100vh-8rem)] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400 dark:text-gray-500">No destinations with coordinates to display on map.</p>
      </div>
    );
  }

  return (
    <>
      <div
        id="map-instructions"
        className="sr-only"
        aria-live="polite"
      >
        Interactive map showing {destinationsWithCoords.length} destination markers. Click on markers to view destination details.
      </div>
      <div
        ref={mapRef}
        className="w-full h-[calc(100vh-8rem)] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm"
        style={{ minHeight: "calc(100vh - 8rem)" }}
        role="application"
        aria-label="Interactive map of destinations"
        aria-describedby="map-instructions"
      />
    </>
  );
}
