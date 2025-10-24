import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Search, Sparkles, ArrowRight, MapPin } from "lucide-react";

import { DestinationCard } from "@/components/DestinationCard";
import { DestinationDrawer } from "@/components/DestinationDrawer";
import { CookieBanner } from "@/components/CookieBanner";
import { AdvancedSearchOverlay } from "@/components/AdvancedSearchOverlay";
import { ChatGPTStyleAI } from "@/components/ChatGPTStyleAI";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Destination } from "@/types/destination";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { cityCountryMap, countryOrder } from "@/data/cityCountryMap";
import { PageHero } from "@/components/layout/PageHero";
import { SiteShell } from "@/components/layout/SiteShell";
import { ContentSection } from "@/components/layout/ContentSection";

const categories = [
  { emoji: "🌍", label: "All", value: "" },
  { emoji: "🍽️", label: "Eat & Drink", value: "Eat & Drink" },
  { emoji: "🏨", label: "Stay", value: "Stay" },
  { emoji: "🏛️", label: "Space", value: "Space" },
  { emoji: "✨", label: "Other", value: "Other" },
];

function capitalizeCity(city: string): string {
  return city
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [displayCount, setDisplayCount] = useState(40);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showAllCities, setShowAllCities] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState<string[]>([]);
  const [visitedPlaces, setVisitedPlaces] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (session?.user) {
        const { data: savedData } = await supabase
          .from("saved_places")
          .select("destination_slug")
          .eq("user_id", session.user.id);

        if (savedData) {
          setSavedPlaces(savedData.map((s) => s.destination_slug));
        }

        const { data: visitedData } = await supabase
          .from("visited_places")
          .select("destination_slug")
          .eq("user_id", session.user.id);

        if (visitedData) {
          setVisitedPlaces(visitedData.map((v) => v.destination_slug));
        }
      }
    }

    loadUserData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUserData();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function loadDestinations() {
      try {
        const { data, error } = await supabase
          .from("destinations")
          .select("*")
          .order("name");

        if (error) throw error;

        const transformed: Destination[] = (data || []).map((d) => ({
          name: d.name,
          slug: d.slug,
          city: d.city,
          category: d.category,
          content: d.content || d.description || "",
          mainImage: d.image || "",
          michelinStars: d.michelin_stars || 0,
          crown: d.crown || false,
          brand: d.brand || "",
          cardTags: d.card_tags || "",
          lat: d.lat || 0,
          long: d.long || 0,
          myRating: 0,
          reviewed: false,
          subline: d.description || "",
        }));

        setDestinations(transformed);
      } catch (error) {
        console.error("Error loading destinations:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDestinations();
  }, []);

  const cities = useMemo(() => {
    const citySet = new Set(destinations.map((d) => d.city).filter(Boolean));
    const cityArray = Array.from(citySet);

    return cityArray.sort((a, b) => {
      const countryA = cityCountryMap[a] || "Other";
      const countryB = cityCountryMap[b] || "Other";

      const indexA = countryOrder.indexOf(countryA);
      const indexB = countryOrder.indexOf(countryB);

      if (countryA === countryB) {
        return a.localeCompare(b);
      }

      if (indexA === -1 && indexB === -1) return countryA.localeCompare(countryB);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [destinations]);

  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      const matchesSearch =
        searchQuery === "" ||
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCity = !selectedCity || dest.city === selectedCity;
      const matchesCategory = !selectedCategory || dest.category === selectedCategory;

      return matchesSearch && matchesCity && matchesCategory;
    });
  }, [destinations, searchQuery, selectedCity, selectedCategory]);

  const displayedDestinations = filteredDestinations.slice(0, displayCount);
  const hasMore = displayCount < filteredDestinations.length;

  useEffect(() => {
    setDisplayCount(40);
  }, [searchQuery, selectedCity, selectedCategory]);

  const handleCardClick = (destination: Destination) => {
    setSelectedDestination(destination);
    setIsDrawerOpen(true);
  };

  const handleDrawerSuggestion = (slug: string) => {
    const match = destinations.find((destination) => destination.slug === slug);
    if (match) {
      setSelectedDestination(match);
      setIsDrawerOpen(true);
    }
  };

  const displayedCities = showAllCities ? cities : cities.slice(0, 18);
  const activeFilters = [
    selectedCity ? `City • ${capitalizeCity(selectedCity)}` : null,
    selectedCategory ? `Category • ${selectedCategory}` : null,
  ].filter(Boolean);

  if (loading) {
    return <LoadingSkeleton />;
  }

  const hero = (
    <PageHero
      eyebrow="City intelligence"
      title="Fluent journeys for design-minded explorers"
      description="Surface modern places to stay, dine, and wander. Blend them into day-by-day itineraries that honour your pace, interests, and the city's rhythm."
      actions={
        <>
          <Button
            onClick={() => setIsSearchOpen(true)}
            className="rounded-full bg-emerald-600 px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Search className="h-4 w-4" />
            Search the atlas
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation("/account")}
            className="rounded-full border-emerald-500/40 px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700 transition hover:border-emerald-500 hover:text-emerald-600 dark:border-emerald-400/40 dark:text-emerald-200 dark:hover:text-emerald-100"
          >
            <Sparkles className="h-4 w-4" />
            Launch planner
          </Button>
        </>
      }
      stats={[
        { label: "Curated destinations", value: `${destinations.length}`, hint: "Thoughtfully vetted spots" },
        { label: "Cities tracked", value: `${cities.length}`, hint: "Across ${countryOrder.length} countries" },
        {
          label: "Your library",
          value: `${savedPlaces.length + visitedPlaces.length}`,
          hint: `${savedPlaces.length} saved • ${visitedPlaces.length} visited`,
        },
      ]}
      media={
        <div className="space-y-4">
          <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-transparent p-6 text-slate-700 shadow-sm dark:border-emerald-400/20 dark:text-slate-100">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-700/80 dark:text-emerald-200/70">Trip studio</p>
            <p className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
              Assign saved places to an effortless itinerary.
            </p>
            <p className="mt-2 text-sm text-slate-600/80 dark:text-slate-300">
              Drag destinations onto each day, let the assistant balance energy, and collect prompts for effortless planning.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {cities.slice(0, 6).map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className="rounded-full border border-white/80 bg-white/70 px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-500/40 hover:text-emerald-600 dark:border-emerald-400/30 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:text-emerald-300"
                >
                  {capitalizeCity(city)}
                </button>
              ))}
            </div>
            <button
              onClick={() => setLocation("/account")}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-white/80 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700 transition hover:bg-emerald-500/20 dark:border-emerald-400/30 dark:bg-slate-900/70 dark:text-emerald-200"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Open planner
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-emerald-500/15 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-emerald-400/15 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">Saved atlas</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{savedPlaces.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Destinations ready to slot into your itinerary.</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/15 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-emerald-400/15 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">Visited trail</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{visitedPlaces.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Keep notes and reflections for future reference.</p>
            </div>
            <div className="col-span-2 rounded-2xl border border-emerald-500/15 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-emerald-400/15 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">Active filters</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {activeFilters.length > 0 ? activeFilters.join(" • ") : "All experiences are in view"}
              </p>
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
          title="Fine-tune the atlas"
          description="Layer filters, jump into specific cities, or open the studio for advanced search."
          tone="muted"
        >
          <div className="space-y-10">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600/80 dark:text-emerald-300/80">
                  Search the library
                </p>
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="group flex w-full items-center justify-between rounded-2xl border border-emerald-500/15 bg-white/80 px-4 py-4 text-left text-sm text-slate-500 shadow-sm transition hover:border-emerald-500/40 hover:text-emerald-600 dark:border-emerald-400/15 dark:bg-slate-950/70 dark:text-slate-300"
                >
                  <span className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 transition group-hover:border-emerald-500/40 group-hover:text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                      <Search className="h-4 w-4" />
                    </span>
                    Search {destinations.length} experiences, venues, and stays
                  </span>
                  <ArrowRight className="h-4 w-4 text-emerald-500 transition group-hover:translate-x-1" />
                </button>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Combine mood, duration, and design sensibility with the advanced filters, or tap a city below to instantly refocus the feed.
                </p>
              </div>

              <div className="rounded-3xl border border-emerald-500/15 bg-white/90 p-6 shadow-sm dark:border-emerald-400/15 dark:bg-slate-950/60">
                <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600/80 dark:text-emerald-300/80">
                  <MapPin className="h-4 w-4" />
                  Quick pivots
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  {cities.slice(0, 6).map((city) => (
                    <button
                      key={city}
                      onClick={() => setSelectedCity(city)}
                      className="rounded-2xl border border-emerald-500/15 bg-white/80 px-4 py-3 text-left font-semibold text-slate-600 transition hover:border-emerald-500/30 hover:text-emerald-600 dark:border-emerald-400/20 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:text-emerald-300"
                    >
                      {capitalizeCity(city)}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setLocation("/cities")}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700 transition hover:border-emerald-500/40 hover:text-emerald-600 dark:border-emerald-400/30 dark:text-emerald-200"
                >
                  View all cities
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600/80 dark:text-emerald-300/80">Cities</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCity("")}
                    className={cn(
                      "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition",
                      selectedCity === ""
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-emerald-500/20 bg-white/80 text-slate-600 hover:border-emerald-500/40 hover:text-emerald-600 dark:border-emerald-400/20 dark:bg-slate-900/70 dark:text-slate-200",
                    )}
                  >
                    All
                  </button>
                  {displayedCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => setSelectedCity(selectedCity === city ? "" : city)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition",
                        selectedCity === city
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-emerald-500/20 bg-white/80 text-slate-600 hover:border-emerald-500/40 hover:text-emerald-600 dark:border-emerald-400/20 dark:bg-slate-900/70 dark:text-slate-200",
                      )}
                    >
                      {capitalizeCity(city)}
                    </button>
                  ))}
                </div>
                {cities.length > 18 && (
                  <button
                    onClick={() => setShowAllCities((prev) => !prev)}
                    className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600 transition hover:text-emerald-500 dark:text-emerald-300"
                  >
                    {showAllCities ? "Show fewer" : "Reveal more"}
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600/80 dark:text-emerald-300/80">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={cn(
                        "flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition",
                        selectedCategory === cat.value
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-emerald-500/20 bg-white/80 text-slate-600 hover:border-emerald-500/40 hover:text-emerald-600 dark:border-emerald-400/20 dark:bg-slate-900/70 dark:text-slate-200",
                      )}
                    >
                      <span>{cat.emoji}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          title="Curated destinations"
          description="A living library of modern restaurants, design-forward stays, cultural institutions, and hidden rituals."
          actions={
            activeFilters.length > 0 && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCity("");
                  setSelectedCategory("");
                }}
                className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 hover:text-emerald-600"
              >
                Clear filters
              </Button>
            )
          }
        >
          <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing {filteredDestinations.length} {filteredDestinations.length === 1 ? "destination" : "destinations"}
              </p>
              {user && (
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/70 dark:text-emerald-300/70">
                  Logged in • synced with your saved and visited lists
                </p>
              )}
            </div>

            {filteredDestinations.length === 0 ? (
              <div className="rounded-3xl border border-emerald-500/10 bg-white/80 px-6 py-14 text-center shadow-sm backdrop-blur dark:border-emerald-400/15 dark:bg-slate-950/60">
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">No destinations match that blend yet.</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Reset the filters or expand your search to uncover more of the atlas.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCity("");
                    setSelectedCategory("");
                  }}
                  className="mt-6 rounded-full bg-emerald-600 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-emerald-700"
                >
                  Reset filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
                  {displayedDestinations.map((destination, index) => (
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

                {hasMore && (
                  <div className="flex justify-center">
                    <button
                      onClick={() => setDisplayCount((prev) => prev + 40)}
                      className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 transition hover:border-emerald-500 hover:text-emerald-600 dark:border-emerald-400/30 dark:text-emerald-200"
                    >
                      Load more
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </ContentSection>

        <ContentSection
          title="Cities in focus"
          description="Where design, culinary innovation, and cultural energy are peaking this season."
          tone="muted"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cities.slice(0, 9).map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className="flex items-center justify-between rounded-2xl border border-emerald-500/15 bg-white/80 px-5 py-4 text-left text-base font-semibold text-slate-700 shadow-sm transition hover:border-emerald-500/30 hover:text-emerald-600 dark:border-emerald-400/20 dark:bg-slate-950/60 dark:text-slate-200"
              >
                <span>{capitalizeCity(city)}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ))}
          </div>
        </ContentSection>
      </div>

      <CookieBanner />
      <AdvancedSearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        destinations={destinations}
        onSelectDestination={(dest) => {
          setSelectedDestination(dest);
          setIsDrawerOpen(true);
        }}
      />

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

      <ChatGPTStyleAI />
    </SiteShell>
  );
}
