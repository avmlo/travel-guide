import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Crown, MapPin } from "lucide-react";
import { Destination } from "@/types/destination";

interface DestinationCardProps {
  destination: Destination;
  onClick?: () => void;
}

export function DestinationCard({ destination, onClick }: DestinationCardProps) {
  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col"
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden bg-muted">
        {destination.mainImage ? (
          <img 
            src={destination.mainImage} 
            alt={destination.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No image available
          </div>
        )}
        {destination.crown && (
          <div className="absolute top-2 right-2 bg-accent text-accent-foreground p-2 rounded-full">
            <Crown className="h-4 w-4" />
          </div>
        )}
      </div>
      
      <CardHeader className="flex-grow">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2">{destination.name}</CardTitle>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="capitalize">{destination.city}</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary">{destination.category}</Badge>
          {destination.michelinStars > 0 && (
            <Badge variant="default" className="bg-accent">
              {destination.michelinStars} ⭐ Michelin
            </Badge>
          )}
          {destination.reviewed && (
            <Badge variant="outline">Reviewed</Badge>
          )}
        </div>
        
        {destination.myRating > 0 && (
          <div className="flex items-center gap-1 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < destination.myRating
                    ? "fill-primary text-primary"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
        )}
        
        {destination.content && (
          <CardDescription className="line-clamp-3 mt-2">
            {destination.content}
          </CardDescription>
        )}
      </CardHeader>
    </Card>
  );
}

