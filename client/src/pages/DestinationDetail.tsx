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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <div className="text-lg text-muted-foreground">Destination not found</div>
        <Button onClick={() => setLocation("/")} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-border bg-background sticky top-0 z-50">
        <div className="container py-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            className="mb-4 font-bold hover:bg-foreground hover:text-background"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            BACK TO CATALOGUE
          </Button>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            {destination.name}
          </h1>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Image */}
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden bg-muted aspect-[4/3] border-4 border-foreground">
              {destination.mainImage ? (
                <img 
                  src={destination.mainImage} 
                  alt={destination.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-muted to-muted-foreground/10">
                  <MapPin className="h-24 w-24 opacity-20" />
                </div>
              )}
              {destination.crown && (
                <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 p-3 rounded-full shadow-lg">
                  <Crown className="h-6 w-6" />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-lg mb-4">
                <MapPin className="h-5 w-5" />
                <span className="lowercase font-medium">{destination.city}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {destination.category && (
                  <Badge variant="secondary" className="text-sm px-3 py-1 font-bold uppercase">
                    {destination.category}
                  </Badge>
                )}
                {destination.michelinStars > 0 && (
                  <Badge className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 font-bold">
                    {destination.michelinStars} ⭐ MICHELIN
                  </Badge>
                )}
                {destination.reviewed && (
                  <Badge variant="outline" className="text-sm px-3 py-1 font-bold">
                    REVIEWED
                  </Badge>
                )}
                {destination.brand && (
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {destination.brand}
                  </Badge>
                )}
              </div>

              {destination.myRating > 0 && (
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <div className="text-sm font-bold mb-2 uppercase">Rating</div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < destination.myRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                    <span className="ml-2 font-bold">
                      {destination.myRating}/5
                    </span>
                  </div>
                </div>
              )}

              {destination.subline && (
                <p className="text-lg italic text-muted-foreground mb-6 border-l-4 border-foreground pl-4">
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
                    variant="default"
                    className="font-bold"
                    onClick={() => window.open(`https://www.google.com/maps?q=${destination.lat},${destination.long}`, '_blank')}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    VIEW ON MAP
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

