import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, Clock, ArrowRight } from "lucide-react";
import { DestinationCard } from "@/components/DestinationCard";
import { Destination } from "@/types/destination";
import { supabase } from "@/lib/supabase";
import { DestinationDrawer } from "@/components/DestinationDrawer";
import { CookieBanner } from "@/components/CookieBanner";
import { AdvancedSearchOverlay } from "@/components/AdvancedSearchOverlay";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";
import { ChatGPTStyleAI } from "@/components/ChatGPTStyleAI";
import { LocalMode } from "@/components/LocalMode";
import { cityCountryMap, countryOrder } from "@/data/cityCountryMap";

// Helper function to capitalize city names
function capitalizeCity(city: string): string {
  return city
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
  const [now, setNow] = useState(new Date());

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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUserData();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadDestinations() {
      try {
        const { data, error } = await supabase
          .from('destinations')
          .select('*')
          .order('name');

        if (error) throw error;

        // Transform Supabase data to match Destination type
        const transformedData: Destination[] = (data || []).map(d => ({
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
          subline: '',
        }));

        setDestinations(transformedData);
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

    // Sort cities by country priority, then alphabetically within country
    return cityArray.sort((a, b) => {
      const countryA = cityCountryMap[a] || 'Other';
      const countryB = cityCountryMap[b] || 'Other';

      const indexA = countryOrder.indexOf(countryA);
      const indexB = countryOrder.indexOf(countryB);

      // If same country, sort alphabetically
      if (countryA === countryB) {
        return a.localeCompare(b);
      }

      // Sort by country priority
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

      const matchesCity =
        !selectedCity || dest.city === selectedCity;

      const matchesCategory =
        !selectedCategory || dest.category === selectedCategory;

      return matchesSearch && matchesCity && matchesCategory;
    });
  }, [destinations, searchQuery, selectedCity, selectedCategory]);

  const displayedDestinations = filteredDestinations.slice(0, displayCount);
  const hasMore = displayCount < filteredDestinations.length;

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(40);
  }, [searchQuery, selectedCity, selectedCategory]);

  const handleCardClick = (destination: Destination) => {
    setSelectedDestination(destination);
    setIsDrawerOpen(true);
  };

  const displayedCities = showAllCities ? cities : cities.slice(0, 20);

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
      {
        label: "Destinations",
        value: destinations.length.toString().padStart(3, "0"),
      },
      {
        label: "Cities",
        value: cities.length.toString().padStart(2, "0"),
      },
      {
        label: "Saved",
        value: savedPlaces.length.toString().padStart(2, "0"),
      },
      {
        label: "Visited",
        value: visitedPlaces.length.toString().padStart(2, "0"),
      },
    ],
    [cities.length, destinations.length, savedPlaces.length, visitedPlaces.length],
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#05070c] text-white transition-colors duration-300">
      <Header />

      {/* Main Content */}
      <main className="px-6 md:px-10 py-12">
        <div className="max-w-[1440px] mx-auto space-y-16">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-6 py-10 sm:px-10 sm:py-14 shadow-[0_40px_120px_-60px_rgba(56,189,248,0.45)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_55%)]" />
            <div className="absolute -right-24 top-1/4 hidden h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl md:block" />
            <div className="relative z-10 grid gap-10 lg:grid-cols-[1.6fr,1fr]">
              <div className="space-y-8">
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.35em] text-white/50">Curated personal atlas</p>
                  <h1 className="text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
                    {greeting}, Urban Manual traveller
                  </h1>
                  <p className="max-w-xl text-base text-white/70 sm:text-lg">
                    We handpick the addresses worth your evening. Filter by city, category, or mood and glide into the perfect night out.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr),auto]">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
                    <Input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder={`Search ${destinations.length} places...`}
                      className="h-14 rounded-2xl border-white/20 bg-white/10 pl-12 text-base text-white placeholder:text-white/60 backdrop-blur-md focus-visible:border-white/40 focus-visible:ring-white/40"
                    />
                  </div>
                  <Button
                    onClick={() => setIsSearchOpen(true)}
                    className="h-14 rounded-2xl border border-white/30 bg-white/10 text-white transition hover:border-white/50 hover:bg-white/15"
                    variant="outline"
                  >
                    <Sparkles className="h-5 w-5" />
                    Advanced search
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                  {heroStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm"
                    >
                      <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">{stat.label}</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-3xl border border-white/15 bg-white/8 p-6 backdrop-blur-lg">
                <div className="flex items-center justify-between text-sm text-white/70">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {formattedDate}
                  </span>
                  <span>{formattedTime}</span>
                </div>

                <div className="mt-8 space-y-3">
                  <p className="text-sm uppercase tracking-[0.4em] text-white/40">Tonight's suggestion</p>
                  <h2 className="text-2xl font-semibold leading-snug">
                    {displayedDestinations[0]?.name ?? "Choose a city to begin"}
                  </h2>
                  <p className="text-sm text-white/60 line-clamp-3">
                    {displayedDestinations[0]?.content || "Dial in your filters to surface the right address for the hours ahead."}
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    onClick={() => {
                      if (displayedDestinations[0]) {
                        handleCardClick(displayedDestinations[0]);
                      }
                    }}
                    className="rounded-2xl bg-white text-slate-900 transition hover:bg-slate-100"
                  >
                    View details
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setLocation("/cities")}
                    className="rounded-2xl border border-white/30 bg-transparent text-white hover:border-white/50 hover:bg-white/10"
                    variant="outline"
                  >
                    Browse cities
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Filters */}
          <section className="space-y-12">
            <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
              <div className="space-y-6">
                <div className="space-y-3">
                  <h2 className="text-xs uppercase tracking-[0.3em] text-white/40">Places</h2>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCity("")}
                      className={`rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-wide transition ${
                        !selectedCity
                          ? "border-white/60 bg-white/15 text-white"
                          : "border-white/15 bg-white/5 text-white/60 hover:text-white"
                      }`}
                    >
                      Everywhere
                    </button>
                    {displayedCities.map((city) => (
                      <button
                        key={city}
                        onClick={() => setSelectedCity(city === selectedCity ? "" : city)}
                        className={`rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-wide transition ${
                          selectedCity === city
                            ? "border-white/60 bg-white/15 text-white"
                            : "border-white/15 bg-white/5 text-white/60 hover:text-white"
                        }`}
                      >
                        {capitalizeCity(city)}
                      </button>
                    ))}
                    {cities.length > 20 && (
                      <button
                        onClick={() => setShowAllCities(!showAllCities)}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-wide text-white/60 transition hover:text-white"
                      >
                        {showAllCities ? "Show less" : "Show more"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-xs uppercase tracking-[0.3em] text-white/40">Categories</h2>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { emoji: "🌍", label: "All", value: "" },
                      { emoji: "🍽️", label: "Eat & Drink", value: "Eat & Drink" },
                      { emoji: "🏨", label: "Stay", value: "Stay" },
                      { emoji: "🏛️", label: "Space", value: "Space" },
                      { emoji: "✨", label: "Other", value: "Other" },
                    ].map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setSelectedCategory(cat.value)}
                        className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                          selectedCategory === cat.value
                            ? "border-white/60 bg-white/15 text-white"
                            : "border-white/15 bg-white/5 text-white/70 hover:text-white"
                        }`}
                      >
                        <span>{cat.emoji}</span>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 backdrop-blur-sm">
                <p className="uppercase tracking-[0.3em] text-white/40">Active filters</p>
                <ul className="mt-4 space-y-2">
                  <li>
                    <span className="text-white/50">Keyword:</span> {searchQuery || "—"}
                  </li>
                  <li>
                    <span className="text-white/50">City:</span> {selectedCity ? capitalizeCity(selectedCity) : "All"}
                  </li>
                  <li>
                    <span className="text-white/50">Category:</span> {selectedCategory || "All"}
                  </li>
                  <li>
                    <span className="text-white/50">Results:</span> {filteredDestinations.length}
                  </li>
                </ul>
                {(searchQuery || selectedCity || selectedCategory) && (
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCity("");
                      setSelectedCategory("");
                    }}
                    className="mt-6 w-full rounded-xl border border-white/20 bg-transparent text-white hover:border-white/40 hover:bg-white/10"
                    variant="outline"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </div>

            {/* Results Count */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm uppercase tracking-[0.3em] text-white/40">
                Showing {filteredDestinations.length} {filteredDestinations.length === 1 ? "destination" : "destinations"}
              </p>
            </div>
          </section>

          {/* Destination Grid */}
          {filteredDestinations.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 px-10 py-24 text-center backdrop-blur-sm">
              <p className="text-xl font-medium text-white/70">No destinations match those filters yet.</p>
              <p className="mt-4 max-w-lg text-sm text-white/60">
                Try adjusting your categories or explore a different city to uncover more late-night gems.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCity("");
                  setSelectedCategory("");
                }}
                className="mt-8 rounded-2xl border border-white/30 bg-transparent text-white hover:border-white/50 hover:bg-white/10"
                variant="outline"
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
                    onClick={() => setDisplayCount((prev) => prev + 40)}
                    className="mt-12 rounded-2xl border border-white/20 bg-transparent px-8 py-5 text-white hover:border-white/40 hover:bg-white/10"
                    variant="outline"
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

      {/* Cookie Banner */}
      <CookieBanner />

      {/* Search Overlay */}
      <AdvancedSearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        destinations={destinations}
        onSelectDestination={(dest) => {
          setSelectedDestination(dest);
          setIsDrawerOpen(true);
        }}
      />

      {/* Destination Drawer */}
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

      {/* AI Assistant */}
      <ChatGPTStyleAI />

      {/* Local Mode */}
      <LocalMode
        destinations={destinations}
        onSelectDestination={(dest) => {
          setSelectedDestination(dest);
          setIsDrawerOpen(true);
        }}
      />
    </div>
  );
}

