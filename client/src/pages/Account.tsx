import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import {
  MapPin,
  Heart,
  CheckCircle2,
  LogOut,
  Settings2,
  ArrowUpRight,
  Bookmark,
  Plane,
  Globe2,
  Sparkles,
  BarChart3
} from "lucide-react";
import { DestinationDrawer } from "@/components/DestinationDrawer";
import { Destination } from "@/types/destination";
import { Header } from "@/components/Header";
import { SimpleFooter } from "@/components/SimpleFooter";

// Helper function to capitalize city names
function capitalizeCity(city: string): string {
  return city
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

interface SavedPlace {
  destination_slug: string;
  destination: {
    name: string;
    city: string;
    category: string;
    image: string;
  };
}

interface VisitedPlace {
  destination_slug: string;
  visited_date: string;
  rating: number;
  notes: string;
  destination: {
    name: string;
    city: string;
    category: string;
    image: string;
  } | null;
}

const countryLabel = (city: string) => {
  const cityCountryMap: Record<string, string> = {
    "tokyo": "Japan",
    "kyoto": "Japan",
    "osaka": "Japan",
    "paris": "France",
    "lyon": "France",
    "london": "United Kingdom",
    "new-york": "United States",
    "los-angeles": "United States",
    "barcelona": "Spain",
    "madrid": "Spain",
    "rome": "Italy",
    "milan": "Italy"
  };

  return cityCountryMap[city.toLowerCase()] || "Other";
};

const formatVisitedDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });
};

const renderRating = (rating: number) => {
  if (!rating || rating <= 0) return null;

  const rounded = Math.round(rating);

  return (
    <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
      <div className="flex gap-0.5 text-sm text-amber-500">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < rounded ? "" : "text-neutral-200"}>
            ★
          </span>
        ))}
      </div>
      <span className="font-medium text-neutral-600">{rating.toFixed(1)}</span>
    </div>
  );
};

export default function Account() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [visitedPlaces, setVisitedPlaces] = useState<VisitedPlace[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [visitedFilter, setVisitedFilter] = useState<"all" | "rated" | "notes">("all");

  // Load all destinations for drawer
  useEffect(() => {
    async function loadDestinations() {
      const { data } = await supabase
        .from('destinations')
        .select('*');
      
      if (data) {
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
        setAllDestinations(transformed);
      }
    }
    loadDestinations();
  }, []);

  const handleCardClick = (destinationSlug: string) => {
    const dest = allDestinations.find(d => d.slug === destinationSlug);
    if (dest) {
      setSelectedDestination(dest);
      setIsDrawerOpen(true);
    }
  };

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLocation("/auth/login");
        return;
      }

      setUser(session.user);

      // Load saved places
      const { data: savedData } = await supabase
        .from('saved_destinations')
        .select('destination_slug')
        .eq('user_id', session.user.id);

      if (savedData) {
        // Fetch destination details
        const slugs = savedData.map(item => item.destination_slug);
        if (slugs.length > 0) {
          const { data: destData } = await supabase
            .from('destinations')
            .select('slug, name, city, category, image')
            .in('slug', slugs);
          
          if (destData) {
            setSavedPlaces(destData.map((dest: any) => ({
              destination_slug: dest.slug,
              destination: {
                name: dest.name,
                city: dest.city,
                category: dest.category,
                image: dest.image
              }
            })));
          }
        }
      }

      // Load visited places
      const { data: visitedData } = await supabase
        .from('visited_destinations')
        .select('destination_slug, visited_date, rating, notes')
        .eq('user_id', session.user.id)
        .order('visited_date', { ascending: false });

      if (visitedData) {
        // Fetch destination details
        const slugs = visitedData.map(item => item.destination_slug);
        if (slugs.length > 0) {
          const { data: destData } = await supabase
            .from('destinations')
            .select('slug, name, city, category, image')
            .in('slug', slugs);
          
          if (destData) {
            setVisitedPlaces(visitedData.map((item: any) => {
              const dest = destData.find((d: any) => d.slug === item.destination_slug);
              return {
                destination_slug: item.destination_slug,
                visited_date: item.visited_date,
                rating: item.rating,
                notes: item.notes,
                destination: dest ? {
                  name: dest.name,
                  city: dest.city,
                  category: dest.category,
                  image: dest.image
                } : null
              };
            }).filter(item => item.destination !== null));
          }
        }
      }

      setLoading(false);
    }

    loadUser();
  }, [setLocation]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setLocation("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-lg text-gray-400">Loading...</div>
      </div>
    );
  }

  const displayName =
    user?.user_metadata?.name || user?.email?.split("@")[0] || "Traveler";

  const uniqueCities = new Set([
    ...savedPlaces.map(p => p.destination.city),
    ...visitedPlaces.filter(p => p.destination).map(p => p.destination!.city)
  ]);

  const uniqueCountries = new Set(
    [
      ...savedPlaces.map(p => p.destination.city),
      ...visitedPlaces.filter(p => p.destination).map(p => p.destination!.city)
    ].map(city => countryLabel(city))
  );

  const visitedTimeline = visitedPlaces
    .filter(place => place.destination)
    .map(place => ({
      ...place,
      destination: place.destination!
    }))
    .sort((a, b) =>
      new Date(b.visited_date || 0).getTime() -
      new Date(a.visited_date || 0).getTime()
    );

  const filteredVisitedTimeline = visitedTimeline.filter(place => {
    if (visitedFilter === "rated") {
      return (place.rating || 0) >= 4;
    }
    if (visitedFilter === "notes") {
      return Boolean(place.notes);
    }
    return true;
  });

  const ratingValues = visitedTimeline
    .map(place => place.rating)
    .filter((rating): rating is number => typeof rating === "number" && rating > 0);
  const averageRating =
    ratingValues.length > 0
      ? ratingValues.reduce((sum, rating) => sum + rating, 0) / ratingValues.length
      : 0;

  const categoryCounts = visitedTimeline.reduce<Record<string, number>>((acc, place) => {
    const category = place.destination.category || "Other";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  const cityCounts = visitedTimeline.reduce<Record<string, number>>((acc, place) => {
    const city = place.destination.city;
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {});

  const topCity = Object.entries(cityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  const goalTarget = 12;
  const goalProgress = Math.min(Math.round((visitedTimeline.length / goalTarget) * 100), 100);

  const cadence = visitedTimeline.reduce<Record<string, number>>((acc, place) => {
    const year = new Date(place.visited_date || new Date()).getFullYear();
    if (!Number.isFinite(year)) {
      return acc;
    }
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {});

  const cadenceEntries = Object.entries(cadence)
    .map(([year, count]) => ({
      year,
      count
    }))
    .sort((a, b) => Number(b.year) - Number(a.year));

  const maxCadenceCount = cadenceEntries.reduce((max, entry) => Math.max(max, entry.count), 0);

  const savedByCity = savedPlaces.reduce<Record<string, number>>((acc, place) => {
    const city = place.destination.city;
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {});

  const savedHeatmap = Object.entries(savedByCity)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const spotlightCities = Array.from(uniqueCities).slice(0, 6);

  const stats = [
    {
      label: "Trips Logged",
      value: visitedPlaces.length,
      sublabel: "Documented adventures",
      icon: Plane
    },
    {
      label: "Saved Gems",
      value: savedPlaces.length,
      sublabel: "Handpicked spots",
      icon: Bookmark
    },
    {
      label: "Cities",
      value: uniqueCities.size,
      sublabel: "Urban stories",
      icon: MapPin
    },
    {
      label: "Countries",
      value: uniqueCountries.size,
      sublabel: "Global footprint",
      icon: Globe2
    }
  ];

  return (
    <div className="min-h-screen bg-[#f6f3ef]">
      <Header />

      {/* Main Content */}
      <main className="px-4 pb-20 pt-8 md:px-10">
        <div className="mx-auto max-w-6xl space-y-12">
          {/* Profile hero */}
          <section className="relative overflow-hidden rounded-3xl bg-neutral-900 px-6 py-10 text-neutral-100 md:px-10 md:py-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15),_transparent_45%)]" />
            <div className="relative grid gap-10 md:grid-cols-[1.25fr_1fr]">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                  <Plane className="h-3.5 w-3.5" /> Globe Trotter
                </span>
                <div>
                  <h1 className="text-4xl font-light tracking-tight text-white md:text-5xl">
                    {displayName}
                  </h1>
                  <p className="mt-2 text-sm text-white/70">{user?.email}</p>
                </div>
                <p className="max-w-xl text-sm text-white/70">
                  Curate your urban escapes, log the places that moved you, and keep your wishlist ready for the next departure.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setLocation("/preferences")}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-neutral-900 transition-transform hover:-translate-y-0.5"
                  >
                    <Settings2 className="h-4 w-4" /> Manage preferences
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              </div>
              <div className="rounded-3xl bg-white/5 p-6 backdrop-blur">
                <div className="grid grid-cols-2 gap-6 text-left sm:grid-cols-2">
                  {stats.map(({ label, value, sublabel, icon: Icon }) => (
                    <div key={label} className="rounded-2xl border border-white/5 bg-white/5 p-5">
                      <div className="mb-5 flex items-center justify-between text-white/60">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.25em]">
                          {label}
                        </span>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="text-3xl font-light text-white">{value}</div>
                      <p className="mt-2 text-xs text-white/60">{sublabel}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Main grid */}
          <section className="grid gap-10 xl:grid-cols-[2fr_1fr]">
            <div className="space-y-10">
              <div className="rounded-3xl bg-white p-6 shadow-[0_30px_60px_rgba(15,23,42,0.04)]">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-medium text-neutral-900">Journey insights</h2>
                    <p className="text-sm text-neutral-500">
                      Auto-generated analytics that help you understand how and where you travel.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">
                    <Globe2 className="h-3.5 w-3.5" /> Live metrics
                  </div>
                </div>
                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-neutral-200 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">Avg rating</p>
                    <p className="mt-4 text-4xl font-light text-neutral-900">
                      {averageRating > 0 ? averageRating.toFixed(1) : "—"}
                    </p>
                    <p className="mt-2 text-xs text-neutral-500">Across {ratingValues.length || "no"} logged reviews</p>
                  </div>
                  <div className="rounded-2xl border border-neutral-200 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">Go-to category</p>
                    <p className="mt-4 text-lg font-semibold text-neutral-900">{topCategory}</p>
                    <p className="mt-2 text-xs text-neutral-500">Your most frequented experience type</p>
                  </div>
                  <div className="rounded-2xl border border-neutral-200 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">City crush</p>
                    <p className="mt-4 text-lg font-semibold text-neutral-900">
                      {topCity !== "—" ? capitalizeCity(topCity) : "—"}
                    </p>
                    <p className="mt-2 text-xs text-neutral-500">Recurring destination on your map</p>
                  </div>
                  <div className="rounded-2xl border border-neutral-200 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">Trips goal</p>
                    <div className="mt-4">
                      <div className="flex items-baseline justify-between text-neutral-900">
                        <span className="text-4xl font-light">{visitedTimeline.length}</span>
                        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-400">/{goalTarget}</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-neutral-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-500"
                          style={{ width: `${goalProgress}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-neutral-500">{goalProgress}% complete</p>
                    </div>
                  </div>
                </div>
                {cadenceEntries.length > 0 && (
                  <div className="mt-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">Travel cadence</p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {cadenceEntries.map(entry => (
                        <div key={entry.year} className="rounded-2xl border border-neutral-200 p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-neutral-900">{entry.year}</span>
                            <span className="text-xs text-neutral-500">{entry.count} {entry.count === 1 ? "trip" : "trips"}</span>
                          </div>
                          <div className="mt-3 h-2 rounded-full bg-neutral-100">
                            <div
                              className="h-full rounded-full bg-neutral-900"
                              style={{
                                width: `${Math.min(
                                  maxCadenceCount ? (entry.count / maxCadenceCount) * 100 : 0,
                                  100
                                )}%`
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-medium text-neutral-900">Saved destinations</h2>
                    <p className="text-sm text-neutral-500">
                      Your curated shortlist of places to experience soon.
                    </p>
                  </div>
                  <button
                    onClick={() => setLocation("/")}
                    className="hidden items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600 transition-colors hover:border-neutral-500 hover:text-neutral-900 md:inline-flex"
                  >
                    Explore <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="rounded-3xl bg-white p-6 shadow-[0_30px_60px_rgba(15,23,42,0.04)]">
                  {savedPlaces.length === 0 ? (
                    <div className="flex flex-col items-center justify-center space-y-4 py-16 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                        <Heart className="h-8 w-8 text-neutral-400" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-neutral-900">No saved places yet</p>
                        <p className="mt-1 text-sm text-neutral-500">
                          Start bookmarking destinations to craft your future itinerary.
                        </p>
                      </div>
                      <button
                        onClick={() => setLocation("/")}
                        className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                      >
                        Browse destinations <ArrowUpRight className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {savedPlaces.map(place => (
                        <button
                          key={place.destination_slug}
                          onClick={() => handleCardClick(place.destination_slug)}
                          className="group text-left"
                        >
                          <div className="overflow-hidden rounded-2xl bg-neutral-100">
                            {place.destination.image ? (
                              <img
                                src={place.destination.image}
                                alt={place.destination.name}
                                className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-40 w-full items-center justify-center bg-neutral-200 text-sm text-neutral-500">
                                Awaiting imagery
                              </div>
                            )}
                          </div>
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-neutral-500">
                              <Bookmark className="h-3.5 w-3.5" /> Saved
                            </div>
                            <h3 className="text-base font-semibold text-neutral-900 line-clamp-2">
                              {place.destination.name}
                            </h3>
                            <p className="text-sm text-neutral-500">
                              {capitalizeCity(place.destination.city)}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-medium text-neutral-900">Visited memories</h2>
                    <p className="text-sm text-neutral-500">
                      A journal of the cities and moments you’ve already unlocked.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {[
                      { key: "all", label: "All" },
                      { key: "rated", label: "4★ & up" },
                      { key: "notes", label: "With notes" }
                    ].map(filter => (
                      <button
                        key={filter.key}
                        onClick={() => setVisitedFilter(filter.key as typeof visitedFilter)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                          visitedFilter === filter.key
                            ? "bg-neutral-900 text-white"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-900/10"
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-3xl bg-white p-6 shadow-[0_30px_60px_rgba(15,23,42,0.04)]">
                  {filteredVisitedTimeline.length === 0 ? (
                    <div className="flex flex-col items-center justify-center space-y-4 py-16 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                        <CheckCircle2 className="h-8 w-8 text-neutral-400" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-neutral-900">No visits logged yet</p>
                        <p className="mt-1 text-sm text-neutral-500">
                          Keep track of your journeys to build a personal travel log.
                        </p>
                      </div>
                      <button
                        onClick={() => setLocation("/")}
                        className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                      >
                        Discover places <ArrowUpRight className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <ol className="relative border-l border-neutral-200 pl-6">
                      {filteredVisitedTimeline.map(place => (
                        <li key={place.destination_slug} className="group relative mb-10 last:mb-0">
                          <span className="absolute -left-[11px] mt-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-neutral-900 text-white">
                            <MapPin className="h-3 w-3" />
                          </span>
                          <button
                            onClick={() => handleCardClick(place.destination_slug)}
                            className="w-full rounded-2xl border border-transparent p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-neutral-200 hover:bg-neutral-50"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                                {formatVisitedDate(place.visited_date)}
                              </div>
                              {place.notes && (
                                <span className="rounded-full bg-neutral-900/5 px-3 py-1 text-xs font-medium text-neutral-600">
                                  Personal note
                                </span>
                              )}
                            </div>
                            <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-neutral-900">
                                  {place.destination.name}
                                </h3>
                                <p className="mt-1 flex items-center gap-2 text-sm text-neutral-500">
                                  <MapPin className="h-4 w-4" /> {capitalizeCity(place.destination.city)}
                                </p>
                                {renderRating(place.rating)}
                              </div>
                              {place.destination.image && (
                                <div className="overflow-hidden rounded-xl bg-neutral-100">
                                  <img
                                    src={place.destination.image}
                                    alt={place.destination.name}
                                    className="h-24 w-40 object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                </div>
                              )}
                            </div>
                            {place.notes && (
                              <p className="mt-4 rounded-2xl bg-white p-4 text-sm text-neutral-600 shadow-inner">
                                “{place.notes}”
                              </p>
                            )}
                          </button>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl bg-neutral-900 p-6 text-neutral-100 shadow-[0_20px_40px_rgba(15,23,42,0.22)]">
                <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                  <Globe2 className="h-4 w-4" /> Travel footprint
                </div>
                <div className="mt-6 space-y-4">
                  <div>
                    <p className="text-4xl font-light text-white">{uniqueCountries.size}</p>
                    <p className="text-sm text-white/70">countries explored</p>
                  </div>
                  <div>
                    <p className="text-4xl font-light text-white">{uniqueCities.size}</p>
                    <p className="text-sm text-white/70">cities discovered</p>
                  </div>
                </div>
                <div className="mt-6 border-t border-white/10 pt-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                    Spotlight cities
                  </p>
                  {spotlightCities.length === 0 ? (
                    <p className="mt-4 text-sm text-white/60">
                      Save or log destinations to build your personal atlas.
                    </p>
                  ) : (
                    <ul className="mt-4 space-y-3 text-sm text-white/80">
                      {spotlightCities.map(city => (
                        <li key={city} className="flex items-center justify-between">
                          <span>{capitalizeCity(city)}</span>
                          <span className="text-white/50">{countryLabel(city)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-[0_30px_60px_rgba(15,23,42,0.04)]">
                <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                  <BarChart3 className="h-4 w-4" /> Saved city heatmap
                </div>
                {savedHeatmap.length === 0 ? (
                  <p className="mt-4 text-sm text-neutral-500">
                    Bookmark destinations to reveal which cities you’re gravitating toward.
                  </p>
                ) : (
                  <ul className="mt-6 space-y-4">
                    {savedHeatmap.map(city => (
                      <li key={city.city} className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-neutral-600">
                          <span>{capitalizeCity(city.city)}</span>
                          <span className="text-neutral-400">{city.count} saved</span>
                        </div>
                        <div className="h-2 rounded-full bg-neutral-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-500"
                            style={{
                              width: `${Math.min((city.count / savedHeatmap[0].count) * 100, 100)}%`
                            }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-[0_30px_60px_rgba(15,23,42,0.04)]">
                <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                  <Sparkles className="h-4 w-4" /> Achievement radar
                </div>
                <p className="mt-4 text-sm text-neutral-500">
                  Unlock badges by logging more cities, capturing personal notes, and leaving ratings.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs font-semibold text-neutral-500">
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">Cities</p>
                    <p className="mt-3 text-lg font-semibold text-neutral-900">{uniqueCities.size}</p>
                  </div>
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">Notes</p>
                    <p className="mt-3 text-lg font-semibold text-neutral-900">{visitedTimeline.filter(place => place.notes).length}</p>
                  </div>
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">5★</p>
                    <p className="mt-3 text-lg font-semibold text-neutral-900">{visitedTimeline.filter(place => (place.rating || 0) >= 5).length}</p>
                  </div>
                </div>
                <div className="mt-6 rounded-2xl bg-neutral-900 p-4 text-neutral-100">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Next actions</p>
                  <div className="mt-4 space-y-3 text-sm">
                    <button
                      onClick={() => setLocation("/lists")}
                      className="flex w-full items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-left font-medium text-white transition hover:bg-white/20"
                    >
                      Curate a list <ArrowUpRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setLocation("/feed")}
                      className="flex w-full items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-left font-medium text-white transition hover:bg-white/20"
                    >
                      Read the editorial feed <ArrowUpRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setLocation("/preferences")}
                      className="flex w-full items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-left font-medium text-white transition hover:bg-white/20"
                    >
                      Refine preferences <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>

      <SimpleFooter />

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
    </div>
  );
}

