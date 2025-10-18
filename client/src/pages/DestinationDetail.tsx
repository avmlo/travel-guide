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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-lg text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <div className="text-lg text-gray-400">Destination not found</div>
        <Button onClick={() => setLocation("/")} className="rounded-full">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-[980px] mx-auto px-6">
          <div className="flex items-center justify-between h-12">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/")}
              className="hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-sm font-semibold">Travel Guide</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </nav>

      {/* Hero Image */}
      <section className="relative h-[60vh] bg-gray-100">
        {destination.mainImage ? (
          <img 
            src={destination.mainImage} 
            alt={destination.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
            <MapPin className="h-32 w-32 opacity-20" />
          </div>
        )}
        {destination.crown && (
          <div className="absolute top-6 right-6 bg-yellow-400 text-yellow-900 p-3 rounded-full shadow-lg">
            <Crown className="h-6 w-6" />
          </div>
        )}
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-[980px] mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            {/* Title */}
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6">
              {destination.name}
            </h2>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-5 w-5" />
                <span className="text-lg">{destination.city.charAt(0).toUpperCase() + destination.city.slice(1)}</span>
              </div>

              {destination.category && (
                <Badge variant="secondary" className="text-sm px-4 py-1.5 rounded-full">
                  {destination.category}
                </Badge>
              )}
              
              {destination.michelinStars > 0 && (
                <Badge className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-1.5 rounded-full">
                  {destination.michelinStars} ⭐ Michelin
                </Badge>
              )}
              
              {destination.reviewed && (
                <Badge variant="outline" className="text-sm px-4 py-1.5 rounded-full">
                  Reviewed
                </Badge>
              )}
            </div>

            {/* Rating */}
            {destination.myRating > 0 && (
              <div className="mb-8 p-6 bg-gray-50 rounded-2xl">
                <div className="text-sm font-semibold mb-3 text-gray-600">Rating</div>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${
                        i < destination.myRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-lg font-semibold">
                    {destination.myRating}/5
                  </span>
                </div>
              </div>
            )}

            {/* Subline */}
            {destination.subline && (
              <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                {destination.subline}
              </p>
            )}

            {/* Description */}
            {destination.content && (
              <div className="prose prose-lg max-w-none mb-8">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {destination.content}
                </p>
              </div>
            )}

            {/* Actions */}
            {(destination.lat !== 0 && destination.long !== 0) && (
              <div className="mt-8">
                <Button 
                  size="lg"
                  className="rounded-full px-8"
                  onClick={() => window.open(`https://www.google.com/maps?q=${destination.lat},${destination.long}`, '_blank')}
                >
                  <MapPin className="h-5 w-5 mr-2" />
                  View on Map
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

