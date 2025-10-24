import { Crown, MapPin } from "lucide-react";
import { Destination } from "@/types/destination";

function capitalizeCity(city: string): string {
  return city
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

interface DestinationCardProps {
  destination: Destination;
  onClick?: () => void;
  isSaved?: boolean;
  isVisited?: boolean;
}

export function DestinationCard({ destination, onClick }: DestinationCardProps) {
  const cityName = destination.city ? capitalizeCity(destination.city) : "";

  return (
    <div
      className="group cursor-pointer overflow-hidden transition-all duration-300 hover:opacity-90"
      onClick={onClick}
    >
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-gray-100">
        {destination.mainImage ? (
          <img
            src={destination.mainImage}
            alt={destination.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-300">
            <MapPin className="h-16 w-16 opacity-20" />
          </div>
        )}

        {destination.crown && (
          <div className="absolute left-3 top-3 rounded-md bg-yellow-400 p-2 text-yellow-900">
            <Crown className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="space-y-1.5 py-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-tight text-gray-900 dark:text-white">
          {destination.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">{cityName}</p>
      </div>
    </div>
  );
}
