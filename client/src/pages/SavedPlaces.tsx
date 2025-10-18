import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";
import { DestinationCard } from "@/components/DestinationCard";
import { Destination } from "@/types/destination";
import { trpc } from "@/lib/trpc";

export default function SavedPlaces() {
  const [, setLocation] = useLocation();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const { data: user } = trpc.auth.me.useQuery();
  const { data: savedPlaces, isLoading } = trpc.user.getSavedPlaces.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    async function loadDestinations() {
      try {
        const response = await fetch("/destinations.json");
        const data: Destination[] = await response.json();
        setDestinations(data);
      } catch (error) {
        console.error("Error loading destinations:", error);
      }
    }

    loadDestinations();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <Heart className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Sign in to save places</h2>
        <p className="text-gray-600 mb-6">Create an account to save your favorite destinations</p>
        <Button onClick={() => window.location.href = "/api/auth/login"}>
          Sign In
        </Button>
      </div>
    );
  }

  const savedDestinations = destinations.filter((d) =>
    savedPlaces?.some((s) => s.destinationSlug === d.slug)
  );

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
              Saved Places
            </h1>
            <p className="text-xl text-gray-600">
              {savedDestinations.length} {savedDestinations.length === 1 ? 'place' : 'places'} saved
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-20">
              <p className="text-gray-400">Loading...</p>
            </div>
          ) : savedDestinations.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-400 mb-6">
                No saved places yet.
              </p>
              <Button onClick={() => setLocation("/")}>
                Explore Destinations
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6">
              {savedDestinations.map((destination, index) => (
                <DestinationCard
                  key={destination.slug}
                  destination={destination}
                  colorIndex={index}
                  onClick={() => setLocation(`/destination/${destination.slug}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

