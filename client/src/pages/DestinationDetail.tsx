import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Crown, MapPin, ArrowLeft, ExternalLink } from "lucide-react";
import { Destination } from "@/types/destination";

export default function DestinationDetail() {
  const [, params] = useRoute("/destination/:slug");
  const [, setLocation] = useLocation();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDestination() {
      try {
        const response = await fetch("/destinations.json");
        const data: Destination[] = await response.json();
        const found = data.find((d) => d.slug === params?.slug);
        setDestination(found || null);
      } catch (error) {
        console.error("Error loading destination:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDestination();
  }, [params?.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-lg text-muted-foreground">Destination not found</div>
        <Button onClick={() => setLocation("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to destinations
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="relative rounded-lg overflow-hidden bg-muted aspect-[4/3]">
              {destination.mainImage ? (
                <img 
                  src={destination.mainImage} 
                  alt={destination.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image available
                </div>
              )}
              {destination.crown && (
                <div className="absolute top-4 right-4 bg-accent text-accent-foreground p-3 rounded-full shadow-lg">
                  <Crown className="h-6 w-6" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">{destination.name}</h1>
              
              <div className="flex items-center gap-2 text-lg text-muted-foreground mb-4">
                <MapPin className="h-5 w-5" />
                <span className="capitalize">{destination.city}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {destination.category}
                </Badge>
                {destination.michelinStars > 0 && (
                  <Badge variant="default" className="bg-accent text-sm px-3 py-1">
                    {destination.michelinStars} ⭐ Michelin Star{destination.michelinStars > 1 ? 's' : ''}
                  </Badge>
                )}
                {destination.reviewed && (
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    Reviewed
                  </Badge>
                )}
                {destination.brand && (
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {destination.brand}
                  </Badge>
                )}
              </div>

              {destination.myRating > 0 && (
                <div className="mb-6">
                  <div className="text-sm font-medium mb-2">My Rating</div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-6 w-6 ${
                          i < destination.myRating
                            ? "fill-primary text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-lg font-semibold">
                      {destination.myRating}/5
                    </span>
                  </div>
                </div>
              )}

              {destination.subline && (
                <p className="text-lg text-muted-foreground italic mb-6">
                  {destination.subline}
                </p>
              )}

              {destination.content && (
                <div className="prose prose-lg max-w-none">
                  <p className="text-foreground leading-relaxed">
                    {destination.content}
                  </p>
                </div>
              )}

              {(destination.lat !== 0 && destination.long !== 0) && (
                <div className="mt-6">
                  <Button 
                    variant="outline"
                    onClick={() => window.open(`https://www.google.com/maps?q=${destination.lat},${destination.long}`, '_blank')}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    View on Map
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

