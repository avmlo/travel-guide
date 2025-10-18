import { Crown, MapPin } from "lucide-react";
import { Destination } from "@/types/destination";

interface DestinationCardProps {
  destination: Destination;
  onClick?: () => void;
  colorIndex?: number;
}

const borderColors = [
  "border-[#4ECDC4]", // Teal/Cyan
  "border-[#9B59B6]", // Purple
  "border-[#FF6B6B]", // Coral/Red
  "border-[#F39C12]", // Orange
  "border-[#3498DB]", // Blue
  "border-[#E74C3C]", // Red
];

export function DestinationCard({ destination, onClick, colorIndex = 0 }: DestinationCardProps) {
  const borderColor = borderColors[colorIndex % borderColors.length];
  
  return (
    <div 
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className={`relative aspect-[4/3] overflow-hidden bg-gray-100 border-4 ${borderColor} mb-3 transition-all duration-300 hover:shadow-lg`}>
        {destination.mainImage ? (
          <img 
            src={destination.mainImage} 
            alt={destination.name}
            className="w-full h-full object-cover"
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
        <h3 className="font-semibold text-lg leading-tight line-clamp-2 capitalize">
          {destination.name}
        </h3>
        
        <p className="text-sm text-gray-500">
          {destination.city.charAt(0).toUpperCase() + destination.city.slice(1)}
        </p>
        
        {destination.category && (
          <p className="text-xs text-gray-400">
            {destination.category}
          </p>
        )}
      </div>
    </div>
  );
}

