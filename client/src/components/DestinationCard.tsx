import { Crown, MapPin } from "lucide-react";
import { Destination } from "@/types/destination";

interface DestinationCardProps {
  destination: Destination;
  onClick?: () => void;
  colorIndex?: number;
}

const borderColors = [
  'border-red-500',
  'border-green-500',
  'border-blue-500',
  'border-yellow-500',
  'border-purple-500',
  'border-pink-500',
  'border-orange-500',
  'border-teal-500',
  'border-indigo-500',
  'border-cyan-500',
  'border-lime-500',
  'border-rose-500',
];

export function DestinationCard({ destination, onClick, colorIndex = 0 }: DestinationCardProps) {
  return (
    <div 
      className="group cursor-pointer border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {destination.mainImage ? (
          <img 
            src={destination.mainImage} 
            alt={destination.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
            <MapPin className="h-16 w-16 opacity-20" />
          </div>
        )}
        {destination.crown && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 p-1.5 rounded-full shadow-lg">
            <Crown className="h-4 w-4" />
          </div>
        )}
        {destination.michelinStars > 0 && (
          <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold shadow-lg">
            {destination.michelinStars}⭐
          </div>
        )}
      </div>
      
      <div className="p-3 bg-white">
        <h3 className="font-medium text-sm leading-tight mb-1 line-clamp-2">
          {destination.name.toLowerCase()}
        </h3>
        
        <div className="text-xs text-gray-500">
          {destination.city}
        </div>
      </div>
    </div>
  );
}

