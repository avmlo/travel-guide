import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { supabase } from "@/lib/supabase";
import { DestinationCard } from "@/components/DestinationCard";
import { Destination } from "@/types/destination";
import { DestinationDrawer } from "@/components/DestinationDrawer";
import { PageHero } from "@/components/layout/PageHero";
import { SiteShell } from "@/components/layout/SiteShell";
import { ContentSection } from "@/components/layout/ContentSection";
import { Button } from "@/components/ui/button";
// Helper function to capitalize city names
function capitalizeCity(city: string): string {
  return city
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function City() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/city/:city");
  const citySlug = params?.city || "";
  
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState<string[]>([]);
  const [visitedPlaces, setVisitedPlaces] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  // Load user's saved and visited places
  useEffect(() => {
    async function loadUserData() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (session?.user) {
        // Load saved places
        const { data: savedData } = await supabase
          .from('saved_places')
          .select('destination_slug')
          .eq('user_id', session.user.id);
        
        if (savedData) {
          setSavedPlaces(savedData.map(s => s.destination_slug));
        }

        // Load visited places
        const { data: visitedData } = await supabase
          .from('visited_places')
          .select('destination_slug')
          .eq('user_id', session.user.id);
        
        if (visitedData) {
          setVisitedPlaces(visitedData.map(v => v.destination_slug));
        }
      }
    }
    loadUserData();
  }, []);

  useEffect(() => {
    async function loadDestinations() {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('city', citySlug)
        .order('name');

      if (!error && data) {
        const transformed: Destination[] = data.map(d => ({
          name: d.name,
          slug: d.slug,
          city: d.city,
          category: d.category,
          content: d.content || d.description || '',
          mainImage: d.image || '',
          michelinStars: d.michelin_stars || 0,
          crown: d.crown || false,
          brand: '',
          cardTags: '',
          lat: 0,
          long: 0,
          myRating: 0,
          reviewed: false,
          subline: d.description || ''
        }));
        setDestinations(transformed);
      }

      setLoading(false);
    }

    if (citySlug) {
      loadDestinations();
    }
  }, [citySlug]);

  const handleCardClick = (destination: Destination) => {
    setSelectedDestination(destination);
    setIsDrawerOpen(true);
  };

  const handleDrawerSuggestion = (slug: string) => {
    const match = destinations.find(destination => destination.slug === slug);
    if (match) {
      setSelectedDestination(match);
      setIsDrawerOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-gray-400">Loading...</div>
      </div>
    );
  }

  const cityName = capitalizeCity(citySlug);
  const totalDestinations = destinations.length;
  const savedInCity = destinations.filter((destination) => savedPlaces.includes(destination.slug)).length;
  const visitedInCity = destinations.filter((destination) => visitedPlaces.includes(destination.slug)).length;
  const categoryCounts = destinations.reduce<Record<string, number>>((acc, destination) => {
    const category = destination.category || "Other";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  const categoryEntries = Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const hero = (
    <PageHero
      eyebrow="City digest"
      title={`${cityName}: curated experiences to explore now`}
      description={`Uncover ${totalDestinations} places that define ${cityName}'s current energy.`}
      actions={
        <>
          <Button
            onClick={() => setLocation("/cities")}
            variant="outline"
            className="rounded-full border-emerald-500/40 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700 transition hover:border-emerald-500 hover:text-emerald-600 dark:border-emerald-400/40 dark:text-emerald-200"
          >
            Back to cities
          </Button>
          <Button
            onClick={() => setLocation("/account")}
            className="rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.32em] text-white shadow-sm transition hover:bg-emerald-700"
          >
            Plan a trip
          </Button>
        </>
      }
      stats={[
        { label: "Destinations", value: `${totalDestinations}`, hint: "Handpicked" },
        { label: "Saved here", value: `${savedInCity}`, hint: "In your lists" },
        { label: "Visited", value: `${visitedInCity}`, hint: "Documented" },
      ]}
      media={
        <div className="space-y-4">
          <div className="rounded-3xl border border-emerald-500/20 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-slate-950/70">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600/80 dark:text-emerald-300/80">Top categories</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {categoryEntries.slice(0, 4).map((entry) => (
                <div key={entry.category} className="flex items-center justify-between">
                  <span>{entry.category}</span>
                  <span className="text-emerald-600/80 dark:text-emerald-200">{entry.count} spots</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-emerald-500/20 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-slate-950/70">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600/80 dark:text-emerald-300/80">Travel prompts</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p className="rounded-2xl bg-emerald-50/80 px-4 py-2 dark:bg-emerald-900/30">“Spend a morning in {cityName} balancing design and coffee.”</p>
              <p className="rounded-2xl bg-emerald-50/80 px-4 py-2 dark:bg-emerald-900/30">“What hidden gems should I add to an evening itinerary?”</p>
            </div>
          </div>
        </div>
      }
    />
  );

  return (
    <SiteShell hero={hero}>
      <div className="space-y-16">
        <ContentSection
          title="Curated places"
          description="Blend restaurants, stays, and cultural spots to design your next visit."
        >
          {destinations.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-emerald-500/20 bg-white/80 px-8 py-16 text-center shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-slate-950/70">
              <p className="text-lg font-semibold text-slate-900 dark:text-white">No destinations found yet.</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Check back soon as we continue to expand this city guide.</p>
              <Button
                onClick={() => setLocation("/cities")}
                className="rounded-full bg-emerald-600 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-emerald-700"
              >
                Explore other cities
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {destinations.map((destination, index) => (
                <DestinationCard
                  key={destination.slug}
                  destination={destination}
                  colorIndex={index}
                  onClick={() => handleCardClick(destination)}
                  isSaved={savedPlaces.includes(destination.slug)}
                  isVisited={visitedPlaces.includes(destination.slug)}
                />
              ))}
            </div>
          )}
        </ContentSection>

        <ContentSection
          tone="muted"
          title="City cues"
          description="Snapshot of how your library intersects with {cityName}."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-emerald-500/15 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-slate-950/70">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600/80 dark:text-emerald-300/80">Saved here</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{savedInCity}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Destinations you've earmarked in {cityName}</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/15 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-slate-950/70">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600/80 dark:text-emerald-300/80">Visited notes</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{visitedInCity}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Documented experiences around the city</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/15 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-slate-950/70">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600/80 dark:text-emerald-300/80">Active categories</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {categoryEntries.slice(0, 6).map((entry) => (
                  <span key={entry.category} className="rounded-full border border-emerald-500/20 bg-white/70 px-3 py-1 text-xs font-medium text-slate-600 dark:border-emerald-400/20 dark:bg-slate-950/60 dark:text-slate-200">
                    {entry.category}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </ContentSection>
      </div>

      {selectedDestination && (
        <DestinationDrawer
          destination={selectedDestination}
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedDestination(null);
          }}
          onSelectDestination={handleDrawerSuggestion}
        />
      )}
    </SiteShell>
  );
}
