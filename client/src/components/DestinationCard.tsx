import { Crown, MapPin } from "lucide-react";
import { Destination } from "@/types/destination";
import { capitalizeCity } from "@/lib/stringUtils";

interface DestinationCardProps {
  destination: Destination;
  onClick?: () => void;
  colorIndex?: number;
  isSaved?: boolean;
  isVisited?: boolean;
}

export function DestinationCard({ destination, onClick }: DestinationCardProps) {
  return (
    <div 
      className="group cursor-pointer destination-card overflow-hidden transition-all duration-300 hover:opacity-80 animate-in fade-in slide-in-from-bottom-4"
      onClick={onClick}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {destination.mainImage ? (
          <img 
            src={destination.mainImage} 
            alt={destination.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
            <MapPin className="h-16 w-16 opacity-20" />
          </div>
        )}
        
        {destination.crown && (
          <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 p-2">
            <Crown className="h-4 w-4" />
          </div>
        )}
        {destination.michelinStars > 0 && (
          <div className="absolute bottom-3 left-3 bg-white text-gray-900 px-2.5 py-1.5 text-xs font-bold flex items-center gap-1.5">
            <img 
              src="https://guide.michelin.com/assets/images/icons/1star-1f2c04d7e6738e8a3312c9cda4b64fd0.svg" 
              alt="Michelin Star" 
              className="h-4 w-4 inline-block"
            />
            <span>{destination.michelinStars}</span>
          </div>
        )}
      </div>
      
      <div className="py-3 space-y-0.5">
        <h3 className="font-medium text-sm leading-tight line-clamp-2 text-black dark:text-white">
          {destination.name}
        </h3>
        
        <p className="text-xs text-black/60 dark:text-gray-400">
          {capitalizeCity(destination.city)}
        </p>
      </div>
    </div>
  );
}

