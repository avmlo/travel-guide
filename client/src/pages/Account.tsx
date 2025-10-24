import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import {
  MapPin,
  CheckCircle2,
  LogOut,
  Settings2,
  ArrowUpRight,
  Bookmark,
  Plane,
  Globe2,
  Sparkles,
  BarChart3,
  MessageCircle,
  CalendarClock,
  Compass,
  CalendarRange,
  ListChecks,
  Plus,
  X
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
  const [tripName, setTripName] = useState("Next urban escape");
  const [tripDuration, setTripDuration] = useState(3);
  const [dayPlans, setDayPlans] = useState<Record<number, string[]>>({
    1: [],
    2: [],
    3: []
  });
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [placeSearch, setPlaceSearch] = useState("");

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

  useEffect(() => {
    setDayPlans(prev => {
      const next: Record<number, string[]> = {};
      for (let day = 1; day <= tripDuration; day++) {
        next[day] = prev[day] ? [...prev[day]] : [];
      }
      return next;
    });
    setSelectedDay(prev => (prev && prev > tripDuration ? null : prev));
  }, [tripDuration]);

  const handleCardClick = (destinationSlug: string) => {
    const dest = allDestinations.find(d => d.slug === destinationSlug);
    if (dest) {
      setSelectedDestination(dest);
      setIsDrawerOpen(true);
    }
  };

  const handleDrawerSuggestion = (slug: string) => {
    const match = allDestinations.find(destination => destination.slug === slug);
    if (match) {
      setSelectedDestination(match);
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

  const aiModules = [
    {
      title: "Conversational discovery",
      description: "Use the floating Modern AI chat to ask for vibes, cuisines, or hidden gems across any city.",
      icon: MessageCircle
    },
    {
      title: "Instant itineraries",
      description: "Generate day-by-day plans from the AI itinerary tool and personalize them with your saved places.",
      icon: CalendarClock
    },
    {
      title: "Drawer pairings",
      description: "Tap the new AI suggestions inside the destination drawer to hop to curated companions in one tap.",
      icon: Compass
    }
  ];

  const aiShortcuts = [
    "Plan a 3-day weekend in Kyoto",
    "Find Michelin-star dinners in Paris",
    "Show design hotels in Copenhagen",
    "Where should I grab coffee in Seoul?"
  ];

  const plannerPlaceMap = new Map<
    string,
    {
      slug: string;
      name: string;
      city: string;
      image: string;
      badges: string[];
    }
  >();

  savedPlaces.forEach(place => {
    plannerPlaceMap.set(place.destination_slug, {
      slug: place.destination_slug,
      name: place.destination.name,
      city: place.destination.city,
      image: place.destination.image,
      badges: ["Saved"]
    });
  });

  visitedTimeline.forEach(place => {
    const existing = plannerPlaceMap.get(place.destination_slug);
    if (existing) {
      if (!existing.badges.includes("Visited")) {
        existing.badges.push("Visited");
      }
    } else if (place.destination) {
      plannerPlaceMap.set(place.destination_slug, {
        slug: place.destination_slug,
        name: place.destination.name,
        city: place.destination.city,
        image: place.destination.image,
        badges: ["Visited"]
      });
    }
  });

  const plannerOptions = Array.from(plannerPlaceMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const totalAssignments = Object.values(dayPlans).reduce(
    (sum, entries) => sum + entries.length,
    0
  );

  const dayNumbers = Array.from({ length: tripDuration }, (_, index) => index + 1);
  const unplannedDays = dayNumbers.filter(day => (dayPlans[day] || []).length === 0).length;
  const averageAssignments = tripDuration > 0 ? totalAssignments / tripDuration : 0;

  const handleAddPlaceToDay = (day: number, slug: string) => {
    setDayPlans(prev => {
      const current = prev[day] || [];
      if (current.includes(slug)) {
        return prev;
      }
      return {
        ...prev,
        [day]: [...current, slug]
      };
    });
  };

  const handleRemovePlaceFromDay = (day: number, slug: string) => {
    setDayPlans(prev => ({
      ...prev,
      [day]: (prev[day] || []).filter(item => item !== slug)
    }));
  };

  const clearDayPlan = (day: number) => {
    setDayPlans(prev => ({
      ...prev,
      [day]: []
    }));
  };


  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="bg-neutral-50 px-4 pb-24 pt-8 md:px-10 md:pt-10">
        <div className="mx-auto max-w-6xl space-y-10 md:space-y-12">
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:gap-10">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                  <Plane className="h-3.5 w-3.5" /> Account overview
                </span>
                <h1 className="mt-5 text-4xl font-semibold tracking-tight text-neutral-900 md:text-5xl">{displayName}</h1>
                <p className="mt-2 text-sm text-neutral-500">{user?.email}</p>
                <p className="mt-6 max-w-xl text-sm text-neutral-600">
                  Keep your travel journal, curate future getaways, and let Urban Manual surface timely ideas for where to head next.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => setLocation("/preferences")}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
                  >
                    <Settings2 className="h-4 w-4" /> Manage preferences
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 px-5 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              </div>
              <div className="max-sm:-mx-2 max-sm:flex max-sm:gap-3 max-sm:overflow-x-auto max-sm:px-2 max-sm:pb-1 max-sm:snap-x max-sm:snap-mandatory sm:grid sm:grid-cols-2 sm:gap-4">
                {stats.map(({ label, value, sublabel, icon: Icon }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-neutral-200 p-4 sm:p-5 max-sm:min-w-[180px] max-sm:flex-1 max-sm:snap-start"
                  >
                    <div className="flex items-center justify-between text-neutral-500">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.25em]">{label}</span>
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="mt-5 text-3xl font-semibold text-neutral-900">{value}</p>
                    <p className="mt-2 text-xs text-neutral-500">{sublabel}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-900">Journey insights</h2>
                  <p className="text-sm text-neutral-500">Understand your recent patterns at a glance.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">
                  <Globe2 className="h-3.5 w-3.5" /> Live metrics
                </div>
              </div>
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4 max-md:grid-cols-2 max-sm:-mx-2 max-sm:flex max-sm:overflow-x-auto max-sm:px-2 max-sm:pb-1 max-sm:[&>div]:min-w-[200px] max-sm:[&>div]:flex-1 max-sm:[&>div]:snap-start max-sm:snap-x max-sm:snap-mandatory">
                <div className="rounded-2xl border border-neutral-200 p-4 sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">Avg rating</p>
                  <p className="mt-4 text-4xl font-semibold text-neutral-900">
                    {averageRating > 0 ? averageRating.toFixed(1) : "—"}
                  </p>
                  <p className="mt-2 text-xs text-neutral-500">Across {ratingValues.length || "no"} logged reviews</p>
                </div>
                <div className="rounded-2xl border border-neutral-200 p-4 sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">Go-to category</p>
                  <p className="mt-4 text-lg font-semibold text-neutral-900">{topCategory}</p>
                  <p className="mt-2 text-xs text-neutral-500">Your most frequented experience type</p>
                </div>
                <div className="rounded-2xl border border-neutral-200 p-4 sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">City crush</p>
                  <p className="mt-4 text-lg font-semibold text-neutral-900">
                    {topCity !== "—" ? capitalizeCity(topCity) : "—"}
                  </p>
                  <p className="mt-2 text-xs text-neutral-500">Where you keep returning</p>
                </div>
                <div className="rounded-2xl border border-neutral-200 p-4 sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">Trips goal</p>
                  <div className="mt-4">
                    <div className="flex items-baseline justify-between text-neutral-900">
                      <span className="text-4xl font-semibold">{visitedTimeline.length}</span>
                      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-400">/{goalTarget}</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full bg-neutral-900"
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
                  <div className="mt-4 flex gap-4 overflow-x-auto pb-1 max-sm:-mx-2 max-sm:px-2 max-sm:snap-x max-sm:snap-mandatory">
                    {cadenceEntries.map(entry => (
                      <div
                        key={entry.year}
                        className="flex-1 min-w-[120px] rounded-2xl border border-neutral-200 p-4 sm:p-5 max-sm:snap-start"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">{entry.year}</p>
                        <div className="mt-4 flex h-16 items-end gap-2">
                          <div className="w-full rounded-full bg-neutral-100">
                            <div
                              className="h-full rounded-full bg-neutral-900"
                              style={{ height: `${Math.round((entry.count / maxCadenceCount) * 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-neutral-900">{entry.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-7">
                <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                  <Globe2 className="h-4 w-4" /> Travel footprint
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-3xl font-semibold text-neutral-900">{uniqueCountries.size}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-neutral-500">Countries</p>
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-neutral-900">{uniqueCities.size}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-neutral-500">Cities</p>
                  </div>
                </div>
                <div className="mt-6 border-t border-neutral-200 pt-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">Spotlight cities</p>
                  {spotlightCities.length === 0 ? (
                    <p className="mt-4 text-sm text-neutral-500">
                      Save or log destinations to build your personal atlas.
                    </p>
                  ) : (
                    <ul className="mt-4 space-y-3 text-sm text-neutral-700">
                      {spotlightCities.map(city => (
                        <li key={city} className="flex items-center justify-between">
                          <span>{capitalizeCity(city)}</span>
                          <span className="text-neutral-400">{countryLabel(city)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-7">
                <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                  <BarChart3 className="h-4 w-4" /> Saved city heatmap
                </div>
                {savedHeatmap.length === 0 ? (
                  <p className="mt-4 text-sm text-neutral-500">
                    Bookmark destinations to see which hubs you gravitate toward.
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
                            className="h-full rounded-full bg-neutral-900"
                            style={{ width: `${Math.min((city.count / savedHeatmap[0].count) * 100, 100)}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-7">
                <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                  <Sparkles className="h-4 w-4" /> AI copilots
                </div>
                <p className="mt-4 text-sm text-neutral-600">
                  Tap into the assistant anywhere on Urban Manual to surface ideas tailored to your saved and visited places.
                </p>
                <div className="mt-5 space-y-4">
                  {aiModules.map(({ title, description, icon: Icon }) => (
                    <div key={title} className="rounded-2xl border border-neutral-200 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                        <Icon className="h-4 w-4" /> {title}
                      </div>
                      <p className="mt-2 text-sm text-neutral-600">{description}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 border-t border-neutral-200 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">Quick prompts</p>
                  <div className="mt-3 flex flex-wrap gap-2 max-sm:-mx-1 max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:px-1 max-sm:[&>span]:whitespace-nowrap">
                    {aiShortcuts.map(shortcut => (
                      <span
                        key={shortcut}
                        className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-600"
                      >
                        {shortcut}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </section>

          <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-neutral-900">Trip planner</h2>
                <p className="text-sm text-neutral-500">
                  Draft a day-by-day itinerary by assigning your favorite places to each day.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">
                <CalendarRange className="h-3.5 w-3.5" /> Interactive itinerary
              </div>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
              <div className="space-y-5">
                <div className="grid gap-4 rounded-2xl border border-neutral-200 p-4 sm:p-5 lg:grid-cols-[1.3fr_auto] lg:items-end">
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                      Trip name
                    </label>
                    <input
                      value={tripName}
                      onChange={event => setTripName(event.target.value)}
                      placeholder="Name your getaway"
                      className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                      <span>Trip length</span>
                      <span className="text-neutral-900">{tripDuration} day{tripDuration === 1 ? "" : "s"}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={tripDuration}
                      onChange={event => setTripDuration(Number(event.target.value))}
                      className="w-full accent-neutral-900"
                    />
                    <div className="flex flex-wrap gap-2">
                      {[3, 5, 7].map(option => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setTripDuration(option)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                            tripDuration === option
                              ? "bg-neutral-900 text-white"
                              : "border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                          }`}
                        >
                          {option}-day
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 max-md:-mx-2 max-md:flex max-md:overflow-x-auto max-md:px-2 max-md:pb-1 max-md:[&>div]:min-w-[260px] max-md:[&>div]:flex-1 max-md:[&>div]:snap-start max-md:snap-x max-md:snap-mandatory">
                  {dayNumbers.map(day => {
                    const assignments = dayPlans[day] || [];
                    const isOpen = selectedDay === day;
                    const filteredSuggestions = plannerOptions.filter(option => {
                      const query = placeSearch.trim().toLowerCase();
                      const matchesQuery =
                        query.length === 0 ||
                        option.name.toLowerCase().includes(query) ||
                        option.city.toLowerCase().includes(query);
                      const alreadySelected = assignments.includes(option.slug);
                      return matchesQuery && !alreadySelected;
                    });

                    return (
                      <div key={day} className="rounded-2xl border border-neutral-200 p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">Day {day}</p>
                            <p className="text-sm text-neutral-400">{tripName || "Untitled trip"}</p>
                          </div>
                          {assignments.length > 0 && (
                            <button
                              type="button"
                              onClick={() => clearDayPlan(day)}
                              className="rounded-full border border-neutral-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500 transition-colors hover:border-neutral-900/20 hover:bg-neutral-100"
                            >
                              Reset
                            </button>
                          )}
                        </div>

                        <div className="mt-4 space-y-3">
                          {assignments.length === 0 && (
                            <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500">
                              Drop in saved or visited spots to outline the day.
                            </div>
                          )}

                          {assignments.map(slug => {
                            const details = plannerPlaceMap.get(slug);
                            if (!details) {
                              return null;
                            }
                            return (
                              <button
                                key={slug}
                                type="button"
                                onClick={() => handleCardClick(slug)}
                                className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-3 text-left transition-colors hover:border-neutral-900/20 hover:bg-neutral-50"
                              >
                                <div className="h-14 w-16 overflow-hidden rounded-xl bg-neutral-100">
                                  <img
                                    src={details.image || "/images/placeholder-destination.jpg"}
                                    alt={details.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-neutral-900">{details.name}</p>
                                  <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
                                    <MapPin className="h-3.5 w-3.5" /> {capitalizeCity(details.city)}
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {details.badges.map(badge => (
                                      <span
                                        key={badge}
                                        className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500"
                                      >
                                        {badge}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={event => {
                                    event.stopPropagation();
                                    handleRemovePlaceFromDay(day, slug);
                                  }}
                                  className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-neutral-400 transition hover:bg-neutral-900 hover:text-white"
                                >
                                  <X className="h-4 w-4" />
                                  <span className="sr-only">Remove</span>
                                </button>
                              </button>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDay(isOpen ? null : day);
                            setPlaceSearch("");
                          }}
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:border-neutral-900/20 hover:bg-neutral-100"
                        >
                          <Plus className="h-4 w-4" /> {assignments.length > 0 ? "Add more spots" : "Add a spot"}
                        </button>

                        {isOpen && (
                          <div className="mt-4 space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-500">
                                Choose from your collection
                              </p>
                              <button
                                type="button"
                                onClick={() => setSelectedDay(null)}
                                className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-500 transition hover:text-neutral-900"
                              >
                                Close <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <input
                              value={placeSearch}
                              onChange={event => setPlaceSearch(event.target.value)}
                              placeholder="Search saved or visited spots"
                              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
                            />
                            <div className="max-h-48 space-y-3 overflow-y-auto pr-1">
                              {filteredSuggestions.length === 0 ? (
                                <p className="rounded-xl border border-dashed border-neutral-200 bg-white p-3 text-xs text-neutral-500">
                                  {plannerOptions.length === 0
                                    ? "Save or log destinations to start planning."
                                    : "No matches. Try a different search or day."}
                                </p>
                              ) : (
                                filteredSuggestions.map(option => (
                                  <button
                                    key={option.slug}
                                    type="button"
                                    onClick={() => handleAddPlaceToDay(day, option.slug)}
                                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-left text-sm text-neutral-700 transition hover:border-neutral-900/20 hover:bg-neutral-100"
                                  >
                                    <div>
                                      <p className="font-semibold text-neutral-900">{option.name}</p>
                                      <p className="text-xs text-neutral-500">{capitalizeCity(option.city)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex flex-wrap gap-1">
                                        {option.badges.map(badge => (
                                          <span
                                            key={badge}
                                            className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500"
                                          >
                                            {badge}
                                          </span>
                                        ))}
                                      </div>
                                      <Plus className="h-4 w-4 text-neutral-400" />
                                    </div>
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <aside className="space-y-5">
                <div className="rounded-3xl border border-neutral-200 bg-white p-6">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                    <ListChecks className="h-4 w-4" /> Plan summary
                  </div>
                  <p className="mt-4 text-sm text-neutral-600">
                    Assign saved highlights or past favorites to keep your itinerary balanced across the trip.
                  </p>
                  <div className="mt-5 space-y-3 text-sm text-neutral-600">
                    <div className="flex items-center justify-between rounded-2xl border border-neutral-200 px-3 py-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">Days planned</span>
                      <span className="text-sm font-semibold text-neutral-900">{tripDuration}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-neutral-200 px-3 py-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">Places assigned</span>
                      <span className="text-sm font-semibold text-neutral-900">{totalAssignments}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-neutral-200 px-3 py-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">Avg per day</span>
                      <span className="text-sm font-semibold text-neutral-900">{averageAssignments.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-neutral-200 px-3 py-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">Open days</span>
                      <span className="text-sm font-semibold text-neutral-900">{unplannedDays}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-neutral-200 bg-white p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">Need inspiration?</p>
                  <p className="mt-3 text-sm text-neutral-600">
                    Ask the AI chat to fill any blank days or surface themed experiences. Try prompting:
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-neutral-700">
                    <p className="rounded-2xl bg-neutral-50 px-4 py-2">“Suggest a morning in {tripName || "my next city"} that pairs coffee and design.”</p>
                    <p className="rounded-2xl bg-neutral-50 px-4 py-2">“Balance my trip with one cultural highlight and one food experience each day.”</p>
                    <p className="rounded-2xl bg-neutral-50 px-4 py-2">“What hidden gems should I add to day {selectedDay || 1}?”</p>
                  </div>
                </div>
              </aside>
            </div>
          </section>

          <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-neutral-900">Saved destinations</h2>
                <p className="text-sm text-neutral-500">Keep track of the places waiting on your list.</p>
              </div>
              <button
                onClick={() => setLocation("/")}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100"
              >
                Discover more <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
            {savedPlaces.length === 0 ? (
              <div className="mt-8 flex flex-col items-center justify-center gap-4 py-12 text-center sm:mt-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
                  <Bookmark className="h-6 w-6 text-neutral-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-neutral-900">No saved spots yet</p>
                  <p className="mt-1 text-sm text-neutral-500">Start bookmarking destinations you want to experience.</p>
                </div>
              </div>
            ) : (
              <div className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
                {savedPlaces.map(place => (
                  <button
                    key={place.destination_slug}
                    onClick={() => handleCardClick(place.destination_slug)}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 text-left transition-shadow hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                      <img
                        src={place.destination.image || "/images/placeholder-destination.jpg"}
                        alt={place.destination.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-400">
                        {place.destination.category || "Destination"}
                      </p>
                      <h3 className="text-lg font-semibold text-neutral-900">{place.destination.name}</h3>
                      <p className="flex items-center gap-2 text-sm text-neutral-500">
                        <MapPin className="h-4 w-4" /> {capitalizeCity(place.destination.city)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-neutral-900">Visited timeline</h2>
                <p className="text-sm text-neutral-500">Your documented destinations, stories, and ratings.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: "all", label: "All" },
                  { key: "rated", label: "Rated" },
                  { key: "notes", label: "With notes" }
                ].map(filter => (
                  <button
                    key={filter.key}
                    onClick={() => setVisitedFilter(filter.key as typeof visitedFilter)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                      visitedFilter === filter.key
                        ? "bg-neutral-900 text-white"
                        : "border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
            {filteredVisitedTimeline.length === 0 ? (
              <div className="mt-8 flex flex-col items-center justify-center gap-4 py-16 text-center sm:mt-10">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                  <CheckCircle2 className="h-8 w-8 text-neutral-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-neutral-900">No visits logged yet</p>
                  <p className="mt-1 text-sm text-neutral-500">Keep track of your journeys to build a personal travel log.</p>
                </div>
                <button
                  onClick={() => setLocation("/")}
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
                >
                  Discover places <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <ol className="mt-8 space-y-6 sm:mt-10 sm:space-y-8">
                {filteredVisitedTimeline.map(place => (
                  <li key={place.destination_slug}>
                    <button
                      onClick={() => handleCardClick(place.destination_slug)}
                      className="group flex w-full flex-col gap-4 rounded-2xl border border-neutral-200 p-4 text-left transition-colors hover:border-neutral-900/20 hover:bg-neutral-50 sm:p-5"
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
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-5">
                        <div>
                          <h3 className="text-lg font-semibold text-neutral-900">{place.destination.name}</h3>
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
                              className="h-24 w-full max-w-[160px] object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                        )}
                      </div>
                      {place.notes && (
                        <p className="rounded-2xl bg-white p-4 text-sm text-neutral-600 shadow-inner">
                          “{place.notes}”
                        </p>
                      )}
                    </button>
                  </li>
                ))}
              </ol>
            )}
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
          onSelectDestination={handleDrawerSuggestion}
        />
      )}
    </div>
  );
}

