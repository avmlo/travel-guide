import { useEffect, useRef, useState } from "react";
import { Destination } from "@/types/destination";

interface MapViewProps {
  destinations: Destination[];
  onDestinationClick: (slug: string) => void;
}

declare global {
  interface Window {
    mapkit: any;
  }
}

export function MapView({ destinations, onDestinationClick }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const destinationsWithCoords = destinations.filter(
    (d) => d.lat !== 0 && d.long !== 0
  );

  useEffect(() => {
    // Load MapKit JS script
    const script = document.createElement("script");
    script.src = "https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.core.js";
    script.crossOrigin = "anonymous";
    script.async = true;
    
    script.onload = () => {
      if (window.mapkit) {
        // Initialize MapKit with a token (using anonymous mode for demo)
        // Note: For production, you need to get a MapKit JS token from Apple Developer
        try {
          window.mapkit.init({
            authorizationCallback: (done: any) => {
              // For demo purposes, we'll use a public token approach
              // In production, you should generate a JWT token from your server
              done(""); // Empty token for now - will show error but demonstrate structure
            }
          });
          setMapLoaded(true);
        } catch (err) {
          console.error("MapKit initialization error:", err);
          setError("MapKit requires an Apple Developer token. Using fallback view.");
        }
      }
    };

    script.onerror = () => {
      setError("Failed to load Apple Maps. Using fallback view.");
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.mapkit) return;

    try {
      const map = new window.mapkit.Map(mapRef.current, {
        center: new window.mapkit.Coordinate(25, 0),
        zoom: 2,
        showsMapTypeControl: false,
        showsZoomControl: true,
        showsUserLocationControl: false,
      });

      // Add markers for destinations
      const annotations = destinationsWithCoords.map((destination) => {
        const annotation = new window.mapkit.MarkerAnnotation(
          new window.mapkit.Coordinate(destination.lat, destination.long),
          {
            title: destination.name,
            subtitle: destination.city,
            color: "#007AFF",
          }
        );

        annotation.addEventListener("select", () => {
          onDestinationClick(destination.slug);
        });

        return annotation;
      });

      map.showItems(annotations);
    } catch (err) {
      console.error("Error creating map:", err);
      setError("Unable to display map. Please check your connection.");
    }
  }, [mapLoaded, destinationsWithCoords, onDestinationClick]);

  if (error) {
    return (
      <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 flex flex-col items-center justify-center p-8">
        <p className="text-gray-600 mb-4 text-center">{error}</p>
        <p className="text-sm text-gray-400 text-center max-w-md">
          Showing {destinationsWithCoords.length} destinations with coordinates.
          Click on any destination card to view details.
        </p>
      </div>
    );
  }

  if (!mapLoaded) {
    return (
      <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading Apple Maps...</p>
      </div>
    );
  }

  if (destinationsWithCoords.length === 0) {
    return (
      <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">No destinations with coordinates to display on map.</p>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="w-full h-[600px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
      style={{ minHeight: "600px" }}
    />
  );
}

