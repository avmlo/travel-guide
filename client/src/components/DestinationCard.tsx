import { Crown, MapPin } from "lucide-react";
import { Destination } from "@/types/destination";

interface DestinationCardProps {
  destination: Destination;
  onClick?: () => void;
  colorIndex?: number;
}

export function DestinationCard({ destination, onClick }: DestinationCardProps) {
  return (
    <div 
      className="group cursor-pointer destination-card"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 rounded-xl mb-2 transition-all duration-300">
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
          <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 p-2 rounded-full shadow-lg backdrop-blur-sm">
            <Crown className="h-4 w-4" />
          </div>
        )}
        {destination.michelinStars > 0 && (
          <div className="absolute top-3 left-3 bg-red-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
            {destination.michelinStars}⭐
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="font-semibold text-lg leading-tight line-clamp-2">
          {destination.name}
        </h3>
        
        <p className="text-sm text-gray-500 capitalize">
          {destination.city}
        </p>
      </div>
    </div>
  );
}

