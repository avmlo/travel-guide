import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Crown, MapPin } from "lucide-react";
import { Destination } from "@/types/destination";

interface DestinationCardProps {
  destination: Destination;
  onClick?: () => void;
  colorIndex?: number;
}

export function DestinationCard({ destination, onClick, colorIndex = 0 }: DestinationCardProps) {
  return (
    <div 
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-3">
        {destination.mainImage ? (
          <img 
            src={destination.mainImage} 
            alt={destination.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-muted to-muted-foreground/10">
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
      
      <div className="space-y-1">
        <h3 className="font-medium text-sm leading-tight line-clamp-2">
          {destination.name}
        </h3>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="lowercase">{destination.city}</span>
        </div>
        
        {destination.category && (
          <div className="text-xs text-muted-foreground">
            {destination.category}
          </div>
        )}
      </div>
    </div>
  );
}

