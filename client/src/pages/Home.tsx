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
      eyebrow="urbanmanual.co reference"
      title="Curated city intelligence for modern travellers"
      description="We pulled cues from the editorial grids and neutral palettes of urbanmanual.co to reimagine this planner—balancing print-inspired calm with fast AI tooling for the way design people actually travel."
      actions={
        <>
          <Button
            onClick={() => setIsSearchOpen(true)}
            className="rounded-full bg-slate-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white shadow-[0_18px_30px_rgba(15,23,42,0.18)] transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <Search className="h-4 w-4" />
            Search the atlas
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation("/account")}
            className="rounded-full border-slate-400/70 px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-700 transition hover:border-slate-500 hover:text-slate-900 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-400"
          >
            <Sparkles className="h-4 w-4" />
            Build a trip
          </Button>
        </>
      }
      stats={[
        { label: "Curated destinations", value: `${destinations.length}`, hint: "Vetted through our editorial lens" },
        { label: "Cities tracked", value: `${cities.length}`, hint: `Across ${countryOrder.length} countries` },
        {
          label: "Your library",
          value: `${savedPlaces.length + visitedPlaces.length}`,
          hint: `${savedPlaces.length} saved • ${visitedPlaces.length} visited`,
        },
      ]}
      media={
        <div className="space-y-5">
          <div className="rounded-[28px] border border-slate-300/60 bg-white/80 p-6 text-slate-700 shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500/90 dark:text-slate-400/80">Trip studio</p>
            <p className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
              Assign saved places and borrow draws from our AI concierge.
            </p>
            <p className="mt-2 text-sm text-slate-600/90 dark:text-slate-300">
              Drop your favourite restaurants, hotels, and rituals onto each day, then request balancing suggestions inspired by the original Urban Manual feed.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {cities.slice(0, 6).map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className="rounded-full border border-slate-300/70 bg-white/80 px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:text-white"
                >
                  {capitalizeCity(city)}
                </button>
              ))}
            </div>
            <button
              onClick={() => setLocation("/account")}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-400/80 bg-white/90 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-900 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Open planner
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-slate-300/60 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500/80 dark:text-slate-400/80">Saved atlas</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{savedPlaces.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Destinations ready to slot into your itinerary.</p>
            </div>
            <div className="rounded-2xl border border-slate-300/60 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500/80 dark:text-slate-400/80">Visited trail</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{visitedPlaces.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Keep notes and reflections for future reference.</p>
            </div>
            <div className="col-span-2 rounded-2xl border border-slate-300/60 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500/80 dark:text-slate-400/80">Active filters</p>
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
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500/90 dark:text-slate-400/90">
                  Search the library
                </p>
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="group flex w-full items-center justify-between rounded-2xl border border-slate-300/60 bg-white/80 px-4 py-4 text-left text-sm text-slate-600 shadow-sm transition hover:border-slate-500 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-300"
                >
                  <span className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/70 bg-white/80 text-slate-900 transition group-hover:border-slate-500 group-hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
                      <Search className="h-4 w-4" />
                    </span>
                    Search {destinations.length} experiences, venues, and stays
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-900" />
                </button>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Combine mood, duration, and design sensibility with the advanced filters, or tap a city below to instantly refocus the feed.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-300/60 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-950/60">
                <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500/80 dark:text-slate-400/80">
                  <MapPin className="h-4 w-4" />
                  Quick pivots
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  {cities.slice(0, 6).map((city) => (
                    <button
                      key={city}
                      onClick={() => setSelectedCity(city)}
                      className="rounded-2xl border border-slate-300/60 bg-white/80 px-4 py-3 text-left font-semibold text-slate-600 transition hover:border-slate-500 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:text-white"
                    >
                      {capitalizeCity(city)}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setLocation("/cities")}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-400/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-700 transition hover:border-slate-500 hover:text-slate-900 dark:border-slate-600 dark:text-slate-200"
                >
                  View all cities
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500/90 dark:text-slate-400/90">Cities</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCity("")}
                    className={cn(
                      "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition",
                      selectedCity === ""
                        ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                        : "border-slate-300/70 bg-white/80 text-slate-600 hover:border-slate-500 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200",
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
                          ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                          : "border-slate-300/70 bg-white/80 text-slate-600 hover:border-slate-500 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200",
                      )}
                    >
                      {capitalizeCity(city)}
                    </button>
                  ))}
                </div>
                {cities.length > 18 && (
                  <button
                    onClick={() => setShowAllCities((prev) => !prev)}
                    className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-600 transition hover:text-slate-900 dark:text-slate-300"
                  >
                    {showAllCities ? "Show fewer" : "Reveal more"}
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500/90 dark:text-slate-400/90">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={cn(
                        "flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition",
                        selectedCategory === cat.value
                          ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                          : "border-slate-300/70 bg-white/80 text-slate-600 hover:border-slate-500 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200",
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
                className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 hover:text-slate-900"
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
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500/80 dark:text-slate-400/80">
                  Logged in • synced with your saved and visited lists
                </p>
              )}
            </div>

            {filteredDestinations.length === 0 ? (
              <div className="rounded-3xl border border-slate-300/60 bg-white/85 px-6 py-14 text-center shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/60">
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
                  className="mt-6 rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900"
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
                      className="inline-flex items-center gap-2 rounded-full border border-slate-400/80 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:border-slate-500 hover:text-slate-900 dark:border-slate-600 dark:text-slate-200"
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
                className="flex items-center justify-between rounded-2xl border border-slate-300/60 bg-white/80 px-5 py-4 text-left text-base font-semibold text-slate-700 shadow-sm transition hover:border-slate-500 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-200"
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
          />
        )}

        <ChatGPTStyleAI />
    </SiteShell>
  );
}
