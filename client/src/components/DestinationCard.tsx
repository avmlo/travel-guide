import { Crown, MapPin } from "lucide-react";
import { Destination } from "@/types/destination";

interface DestinationCardProps {
  destination: Destination;
  onClick?: () => void;
  colorIndex?: number;
}

// Vibrant colors matching urbanmanual.co
const borderColors = [
  "border-red-500",
  "border-blue-500",
  "border-green-500",
  "border-orange-500",
  "border-pink-500",
  "border-purple-500",
  "border-teal-500",
  "border-yellow-500",
];

const badgeColors = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-purple-500",
  "bg-teal-500",
  "bg-yellow-500",
];

export function DestinationCard({ destination, onClick, colorIndex = 0 }: DestinationCardProps) {
  const borderColor = borderColors[colorIndex % borderColors.length];
  const badgeColor = badgeColors[colorIndex % badgeColors.length];
  
  return (
    <div 
      className={`group cursor-pointer destination-card bg-white border-4 ${borderColor} overflow-hidden transition-all duration-300 hover:shadow-xl`}
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
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
        
        {/* Number Badge - Top Right */}
        <div className={`absolute top-3 right-3 ${badgeColor} text-white px-3 py-1.5 font-black text-sm`}>
          {colorIndex + 1}
        </div>
        
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
      
      <div className="p-3 space-y-1 bg-white">
        <h3 className="font-bold text-base leading-tight line-clamp-2 text-black">
          {destination.name}
        </h3>
        
        <p className="text-xs text-black lowercase font-medium">
          {destination.city}
        </p>
      </div>
    </div>
  );
}

