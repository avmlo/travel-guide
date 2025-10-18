import { useEffect, useState } from "react";
import { Destination } from "@/types/destination";
import "leaflet/dist/leaflet.css";

interface MapViewProps {
  destinations: Destination[];
  onDestinationClick: (slug: string) => void;
}

export function MapView({ destinations, onDestinationClick }: MapViewProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const destinationsWithCoords = destinations.filter(
    (d) => d.lat !== 0 && d.long !== 0
  );

  // Calculate center of all destinations
  const center: [number, number] = destinationsWithCoords.length > 0
    ? [
        destinationsWithCoords.reduce((sum, d) => sum + d.lat, 0) / destinationsWithCoords.length,
        destinationsWithCoords.reduce((sum, d) => sum + d.long, 0) / destinationsWithCoords.length,
      ]
    : [25, 0]; // Default center

  if (!isClient) {
    return (
      <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading map...</p>
      </div>
    );
  }

  // Dynamically import Leaflet components only on client side
  const MapContainer = require("react-leaflet").MapContainer;
  const TileLayer = require("react-leaflet").TileLayer;
  const Marker = require("react-leaflet").Marker;
  const Popup = require("react-leaflet").Popup;
  const L = require("leaflet");

  // Fix default marker icon issue with Leaflet in React
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });

  if (destinationsWithCoords.length === 0) {
    return (
      <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">No destinations with coordinates to display on map.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      <MapContainer
        center={center}
        zoom={2}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {destinationsWithCoords.map((destination) => (
          <Marker
            key={destination.slug}
            position={[destination.lat, destination.long]}
          >
            <Popup>
              <div className="min-w-[200px]">
                {destination.mainImage && (
                  <img
                    src={destination.mainImage}
                    alt={destination.name}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                )}
                <h3 className="font-semibold text-sm mb-1 capitalize">{destination.name}</h3>
                <p className="text-xs text-gray-600 mb-2">
                  {destination.city.charAt(0).toUpperCase() + destination.city.slice(1)}
                </p>
                <button
                  onClick={() => onDestinationClick(destination.slug)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  View details →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

