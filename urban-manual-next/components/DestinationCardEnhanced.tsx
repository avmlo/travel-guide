import { Crown, MapPin, Heart, Check } from "lucide-react";
import { Destination } from "@/types/destination";
import { ProgressiveImage } from "./ProgressiveImage";
import { cn } from "@/lib/utils";

// Helper function to capitalize city names
function capitalizeCity(city: string): string {
  return city
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

interface DestinationCardProps {
  destination: Destination;
  onClick?: () => void;
  colorIndex?: number;
  isSaved?: boolean;
  isVisited?: boolean;
  className?: string;
  animationDelay?: number;
}

export function DestinationCardEnhanced({
  destination,
  onClick,
  isSaved,
  isVisited,
  className,
  animationDelay = 0,
}: DestinationCardProps) {
  return (
    <button
      type="button"
      className={cn(
        "group cursor-pointer overflow-hidden w-full text-left",
        "transition-all duration-300 ease-out",
        "hover:opacity-90",
        "animate-fade-in",
        "focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 rounded-lg",
        className
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
      onClick={onClick}
      aria-label={`View details for ${destination.name} in ${capitalizeCity(destination.city)}`}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-lg mb-3">
        {destination.mainImage ? (
          <ProgressiveImage
            src={destination.mainImage}
            alt={destination.name}
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <MapPin className="h-16 w-16 opacity-20" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

        {/* Badges */}
        {destination.crown && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 p-1.5 rounded shadow-lg animate-scale-in" aria-label="Featured destination">
            <Crown className="h-4 w-4" aria-hidden="true" />
          </div>
        )}

        {isSaved && (
          <div className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg animate-scale-in" aria-label="Saved to favorites">
            <Heart className="h-3 w-3 fill-current" aria-hidden="true" />
          </div>
        )}

        {isVisited && (
          <div className="absolute top-2 right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg animate-scale-in" aria-label="Visited">
            <Check className="h-3 w-3" aria-hidden="true" />
          </div>
        )}

        {destination.michelinStars > 0 && (
          <div className="absolute bottom-2 left-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-lg animate-slide-up">
            <img
              src="https://guide.michelin.com/assets/images/icons/1star-1f2c04d7e6738e8a3312c9cda4b64fd0.svg"
              alt="Michelin Star"
              className="h-3 w-3"
            />
            <span>{destination.michelinStars}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1">
        <h3 className="font-medium text-sm leading-tight line-clamp-2 text-black dark:text-white transition-colors">
          {destination.name}
        </h3>

        <div className="flex items-center gap-1.5">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {capitalizeCity(destination.city)}
          </p>
          {destination.category && (
            <>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <p className="text-xs text-gray-500 dark:text-gray-500 capitalize">
                {destination.category}
              </p>
            </>
          )}
        </div>
      </div>
    </button>
  );
}
