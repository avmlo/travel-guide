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
    <Card 
      className="overflow-hidden hover:shadow-xl transition-all cursor-pointer h-full flex flex-col border"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {destination.mainImage ? (
          <img 
            src={destination.mainImage} 
            alt={destination.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-muted to-muted-foreground/10">
            <MapPin className="h-16 w-16 opacity-20" />
          </div>
        )}
        {destination.crown && (
          <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 p-2 rounded-full shadow-lg">
            <Crown className="h-5 w-5" />
          </div>
        )}
        {destination.michelinStars > 0 && (
          <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            {destination.michelinStars} ⭐
          </div>
        )}
      </div>
      
      <CardHeader className="flex-grow p-4">
        <CardTitle className="text-base font-semibold line-clamp-2 mb-2">
          {destination.name}
        </CardTitle>
        
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
          <MapPin className="h-3.5 w-3.5" />
          <span className="lowercase">{destination.city}</span>
        </div>
        
        {destination.category && (
          <div className="text-xs text-muted-foreground">
            {destination.category}
          </div>
        )}
      </CardHeader>
    </Card>
  );
}

