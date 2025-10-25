import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Search, Sparkles, Clock, ArrowRight, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DestinationCard } from "@/components/DestinationCard";
import { DestinationDrawer } from "@/components/DestinationDrawer";
import { CookieBanner } from "@/components/CookieBanner";
import { AdvancedSearchOverlay } from "@/components/AdvancedSearchOverlay";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
import { ChatGPTStyleAI } from "@/components/ChatGPTStyleAI";
import { LocalMode } from "@/components/LocalMode";
import { Destination } from "@/types/destination";
import { supabase } from "@/lib/supabase";
import { cityCountryMap, countryOrder } from "@/data/cityCountryMap";

const CATEGORY_FILTERS = [
  { emoji: "🌍", label: "All", value: "" },
  { emoji: "🍽️", label: "Eat & Drink", value: "Eat & Drink" },
  { emoji: "🏨", label: "Stay", value: "Stay" },
  { emoji: "🏛️", label: "Space", value: "Space" },
  { emoji: "✨", label: "Other", value: "Other" },
];

function capitalizeCity(city: string): string {
  return city
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    async function loadUserData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setSavedPlaces([]);
        setVisitedPlaces([]);
        return;
      }

      const [{ data: savedData }, { data: visitedData }] = await Promise.all([
        supabase.from("saved_places").select("destination_slug").eq("user_id", session.user.id),
        supabase.from("visited_places").select("destination_slug").eq("user_id", session.user.id),
      ]);

      if (savedData) {
        setSavedPlaces(savedData.map((entry) => entry.destination_slug));
      }
      if (visitedData) {
        setVisitedPlaces(visitedData.map((entry) => entry.destination_slug));
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
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadDestinations() {
      try {
        const { data, error } = await supabase.from("destinations").select("*").order("name");
        if (error) throw error;

        const transformed: Destination[] = (data || []).map((entry) => ({
          name: entry.name,
          slug: entry.slug,
          city: entry.city,
          category: entry.category,
          content: entry.content || entry.description || "",
          mainImage: entry.image || "",
          michelinStars: entry.michelin_stars || 0,
          crown: entry.crown || false,
          brand: "",
          cardTags: "",
          lat: 0,
          long: 0,
          myRating: 0,
          reviewed: false,
          subline: "",
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
    const citySet = new Set(destinations.map((destination) => destination.city).filter(Boolean));
    const list = Array.from(citySet);

    return list.sort((cityA, cityB) => {
      const countryA = cityCountryMap[cityA] || "Other";
      const countryB = cityCountryMap[cityB] || "Other";

      if (countryA === countryB) {
        return cityA.localeCompare(cityB);
      }

      const indexA = countryOrder.indexOf(countryA);
      const indexB = countryOrder.indexOf(countryB);

      if (indexA === -1 && indexB === -1) return countryA.localeCompare(countryB);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [destinations]);

  const filteredDestinations = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return destinations.filter((destination) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        destination.name.toLowerCase().includes(normalizedQuery) ||
        destination.content.toLowerCase().includes(normalizedQuery) ||
        destination.city.toLowerCase().includes(normalizedQuery) ||
        destination.category.toLowerCase().includes(normalizedQuery);

      const matchesCity = !selectedCity || destination.city === selectedCity;
      const matchesCategory = !selectedCategory || destination.category === selectedCategory;

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

  const displayedCities = showAllCities ? cities : cities.slice(0, 18);

  const greeting = useMemo(() => {
    const hour = now.getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 18) return "Good afternoon";
    return "Good evening";
  }, [now]);

  const formattedTime = useMemo(
    () =>
      now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    [now],
  );

  const formattedDate = useMemo(
    () =>
      now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    [now],
  );

  const heroStats = useMemo(
    () => [
      { label: "Destinations", value: destinations.length.toString().padStart(3, "0") },
      { label: "Cities", value: cities.length.toString().padStart(2, "0") },
      { label: "Saved", value: savedPlaces.length.toString().padStart(2, "0") },
      { label: "Visited", value: visitedPlaces.length.toString().padStart(2, "0") },
    ],
    [cities.length, destinations.length, savedPlaces.length, visitedPlaces.length],
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#0a0a0a]">
      <Header />

      <main className="px-6 py-12 md:px-10">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-16">
          <section className="relative overflow-hidden rounded-[40px] border border-black/5 bg-white px-8 py-14 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.35)] sm:px-12 sm:py-16">
            <div
              aria-hidden
              className="absolute inset-x-16 top-[-120px] h-[240px] rounded-full bg-gradient-to-r from-black/5 via-transparent to-black/5 blur-3xl"
            />
            <div className="relative grid gap-14 lg:grid-cols-[1.7fr,1fr]">
              <div className="space-y-10">
                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-[0.38em] text-neutral-500">The Urban Manual</p>
                  <h1 className="text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
                    {greeting}, evening explorer.
                  </h1>
                  <p className="max-w-xl text-lg text-neutral-600">
                    Consider this your nightly brief. Contemporary hospitality, collected cities, and the reservations worth
                    staying out for—all in one understated grid.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr),auto]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                    <Input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder={`Search ${destinations.length} places...`}
                      className="h-14 rounded-[26px] border border-black/10 bg-neutral-100 pl-14 text-base text-[#0a0a0a] placeholder:text-neutral-500 focus-visible:border-black/30 focus-visible:ring-black/10"
                    />
                  </div>
                  <Button
                    onClick={() => setIsSearchOpen(true)}
                    variant="outline"
                    className="h-14 rounded-[26px] border border-black/10 bg-white text-[#0a0a0a] transition hover:border-black/20 hover:bg-neutral-50"
                  >
                    <Sparkles className="h-5 w-5" />
                    Advanced search
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                  {heroStats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-black/5 bg-neutral-50 px-6 py-5">
                      <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">{stat.label}</p>
                      <p className="mt-3 text-2xl font-semibold tracking-tight text-[#0a0a0a]">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="flex flex-col justify-between rounded-[32px] border border-black/5 bg-[#0a0a0a] p-6 text-white">
                <div className="flex items-center justify-between text-sm text-white/70">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {formattedDate}
                  </span>
                  <span>{formattedTime}</span>
                </div>

                <div className="mt-8 space-y-3">
                  <p className="text-[11px] uppercase tracking-[0.38em] text-white/50">Tonight's spotlight</p>
                  <h2 className="text-2xl font-semibold leading-snug">
                    {displayedDestinations[0]?.name ?? "Choose a city to begin"}
                  </h2>
                  <p className="text-sm text-white/70 line-clamp-4">
                    {displayedDestinations[0]?.content || "Adjust the filters to surface a fresh set of rooms, tables, and soundscapes."}
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    onClick={() => {
                      if (displayedDestinations[0]) {
                        handleCardClick(displayedDestinations[0]);
                      }
                    }}
                    className="rounded-[26px] bg-white text-[#0a0a0a] transition hover:bg-neutral-100"
                  >
                    View details
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setLocation("/cities")}
                    variant="outline"
                    className="rounded-[26px] border border-white/40 bg-transparent text-white hover:border-white/60 hover:bg-white/10"
                  >
                    Browse cities
                  </Button>
                </div>
              </aside>
            </div>
          </section>

          <section className="space-y-10">
            <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
              <div className="space-y-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs uppercase tracking-[0.32em] text-neutral-500">
                    <SlidersHorizontal className="h-4 w-4 text-neutral-400" />
                    Places
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-3 text-[12px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
                    <button
                      onClick={() => setSelectedCity("")}
                      className={`border-b pb-1 transition-colors ${
                        !selectedCity
                          ? "border-[#0a0a0a] text-[#0a0a0a]"
                          : "border-transparent text-neutral-400 hover:border-black/15 hover:text-[#0a0a0a]"
                      }`}
                    >
                      Everywhere
                    </button>
                    {displayedCities.map((city) => {
                      const isActive = selectedCity === city;
                      return (
                        <button
                          key={city}
                          onClick={() => setSelectedCity(isActive ? "" : city)}
                          className={`border-b pb-1 transition-colors ${
                            isActive
                              ? "border-[#0a0a0a] text-[#0a0a0a]"
                              : "border-transparent text-neutral-400 hover:border-black/15 hover:text-[#0a0a0a]"
                          }`}
                        >
                          {capitalizeCity(city)}
                        </button>
                      );
                    })}
                    {cities.length > 18 && (
                      <button
                        onClick={() => setShowAllCities((previous) => !previous)}
                        className={`border-b pb-1 text-neutral-400 transition-colors hover:border-black/15 hover:text-[#0a0a0a] ${
                          showAllCities ? "border-[#0a0a0a]/40 text-[#0a0a0a]" : "border-transparent"
                        }`}
                      >
                        {showAllCities ? "Show less" : "Show more"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.32em] text-neutral-500">Categories</p>
                  <div className="flex flex-wrap gap-3">
                    {CATEGORY_FILTERS.map((category) => {
                      const isActive = selectedCategory === category.value;
                      return (
                        <button
                          key={category.value || "all"}
                          onClick={() => setSelectedCategory(isActive ? "" : category.value)}
                          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                            isActive
                              ? "border-[#0a0a0a] bg-[#0a0a0a] text-white"
                              : "border-black/10 bg-white text-neutral-600 hover:border-black/20 hover:text-[#0a0a0a]"
                          }`}
                        >
                          <span>{category.emoji}</span>
                          {category.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <aside className="h-max rounded-[32px] border border-black/5 bg-white p-6 text-sm text-neutral-600 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">Active filters</p>
                <ul className="mt-4 space-y-2">
                  <li>
                    <span className="text-neutral-400">Keyword:</span> {searchQuery || "—"}
                  </li>
                  <li>
                    <span className="text-neutral-400">City:</span> {selectedCity ? capitalizeCity(selectedCity) : "All"}
                  </li>
                  <li>
                    <span className="text-neutral-400">Category:</span> {selectedCategory || "All"}
                  </li>
                  <li>
                    <span className="text-neutral-400">Results:</span> {filteredDestinations.length}
                  </li>
                </ul>
                {(searchQuery || selectedCity || selectedCategory) && (
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCity("");
                      setSelectedCategory("");
                    }}
                    variant="outline"
                    className="mt-6 w-full rounded-[26px] border border-black/10 bg-white text-[#0a0a0a] transition hover:border-black/20 hover:bg-neutral-50"
                  >
                    Clear filters
                  </Button>
                )}
              </aside>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs uppercase tracking-[0.32em] text-neutral-500">
                Showing {filteredDestinations.length} {filteredDestinations.length === 1 ? "destination" : "destinations"}
              </p>
            </div>
          </section>

          {filteredDestinations.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[40px] border border-black/5 bg-white px-10 py-24 text-center shadow-sm">
              <p className="text-xl font-medium text-[#0a0a0a]">No destinations match those filters yet.</p>
              <p className="mt-4 max-w-lg text-sm text-neutral-600">
                Tweak the categories or explore another city to surface more spaces aligned with tonight's tempo.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCity("");
                  setSelectedCategory("");
                }}
                variant="outline"
                className="mt-8 rounded-[26px] border border-black/10 bg-white text-[#0a0a0a] hover:border-black/20 hover:bg-neutral-50"
              >
                Reset filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {displayedDestinations.map((destination) => (
                  <DestinationCard
                    key={destination.slug}
                    destination={destination}
                    onClick={() => handleCardClick(destination)}
                    isSaved={savedPlaces.includes(destination.slug)}
                    isVisited={visitedPlaces.includes(destination.slug)}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center">
                  <Button
                    onClick={() => setDisplayCount((previous) => previous + 40)}
                    variant="outline"
                    className="mt-12 rounded-[26px] border border-black/10 bg-white px-8 py-5 text-[#0a0a0a] hover:border-black/20 hover:bg-neutral-50"
                  >
                    Load more places
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <SimpleFooter />

      <CookieBanner />

      <AdvancedSearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        destinations={destinations}
        onSelectDestination={(destination) => {
          setSelectedDestination(destination);
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

      <LocalMode
        destinations={destinations}
        onSelectDestination={(destination) => {
          setSelectedDestination(destination);
          setIsDrawerOpen(true);
        }}
      />
    </div>
  );
}
