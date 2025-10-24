import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import {
  MapPin,
  CheckCircle2,
  LogOut,
  Settings2,
  Bookmark,
  Plane,
  Globe2,
  Sparkles,
  BarChart3,
  MessageCircle,
  CalendarClock,
  Compass,
  ListChecks,
  Plus,
  X
} from "lucide-react";
import { DestinationDrawer } from "@/components/DestinationDrawer";
import { Destination } from "@/types/destination";
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

  const filteredSuggestions = plannerOptions.filter((option) => {
    const matchesSearch =
      placeSearch.trim() === "" ||
      option.name.toLowerCase().includes(placeSearch.toLowerCase()) ||
      option.city.toLowerCase().includes(placeSearch.toLowerCase());
    const alreadyInDay = selectedDay ? (dayPlans[selectedDay] || []).includes(option.slug) : false;
    return matchesSearch && !alreadyInDay;
  });

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


  const heroStats = stats.map((stat) => ({
    label: stat.label,
    value: String(stat.value),
    hint: stat.sublabel,
  }));

  const handleScrollToPlanner = () => {
    const section = document.getElementById("planner");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const hero = (
    <PageHero
      eyebrow="Account studio"
      title={`Welcome back, ${displayName}`}
      description="Shape future trips, track memories, and let our assistant surface the next best stop."
      actions={
        <>
          <Button
            onClick={() => setLocation("/preferences")}
            className="rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.32em] text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Settings2 className="h-4 w-4" /> Preferences
          </Button>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="rounded-full border-emerald-500/40 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700 transition hover:border-emerald-500 hover:text-emerald-600 dark:border-emerald-400/40 dark:text-emerald-200"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </>
      }
      stats={heroStats}
      media={
        <div className="space-y-4">
          <div className="rounded-3xl border border-emerald-500/20 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-slate-950/70">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600/80 dark:text-emerald-300/80">Trip planner</p>
            <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">{tripName || "Name your next escape"}</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="rounded-2xl border border-emerald-500/15 bg-white/80 p-3 dark:border-emerald-400/20 dark:bg-slate-900/60">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">Duration</p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{tripDuration} day{tripDuration === 1 ? "" : "s"}</p>
              </div>
              <div className="rounded-2xl border border-emerald-500/15 bg-white/80 p-3 dark:border-emerald-400/20 dark:bg-slate-900/60">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">Places assigned</p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{totalAssignments}</p>
              </div>
              <div className="rounded-2xl border border-emerald-500/15 bg-white/80 p-3 dark:border-emerald-400/20 dark:bg-slate-900/60">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">Avg / day</p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{averageAssignments.toFixed(1)}</p>
              </div>
              <div className="rounded-2xl border border-emerald-500/15 bg-white/80 p-3 dark:border-emerald-400/20 dark:bg-slate-900/60">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">Open days</p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{unplannedDays}</p>
              </div>
            </div>
            <div className="mt-5 space-y-2 text-xs text-slate-500 dark:text-slate-400">
              {aiShortcuts.slice(0, 2).map((shortcut) => (
                <p key={shortcut} className="rounded-2xl border border-emerald-500/10 bg-white/70 px-3 py-2 dark:border-emerald-400/20 dark:bg-slate-900/60">
                  “{shortcut}”
                </p>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={handleScrollToPlanner}
              className="mt-5 inline-flex items-center gap-2 rounded-full border-emerald-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700 transition hover:border-emerald-500 hover:text-emerald-600 dark:border-emerald-400/40 dark:text-emerald-200"
            >
              <Sparkles className="h-3.5 w-3.5" /> Jump to planner
            </Button>
          </div>
        </div>
      }
    />
  );

  return (
    <SiteShell hero={hero} background="canvas">
      <div className="space-y-16">
        <ContentSection
          tone="muted"
          title="Journey intelligence"
          description="Understand how your travels evolve across categories, cadence, and cities."
        >
          <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-emerald-500/15 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-slate-950/70">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">Avg rating</p>
                  <p className="mt-4 text-4xl font-semibold text-slate-900 dark:text-white">{averageRating > 0 ? averageRating.toFixed(1) : "—"}</p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Across {ratingValues.length || "no"} logged reviews</p>
                </div>
                <div className="rounded-2xl border border-emerald-500/15 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-slate-950/70">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">Go-to category</p>
                  <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{topCategory}</p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Your most frequented experience type</p>
                </div>
                <div className="rounded-2xl border border-emerald-500/15 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-slate-950/70">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">City crush</p>
                  <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{topCity !== "—" ? capitalizeCity(topCity) : "—"}</p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Where you keep returning</p>
                </div>
                <div className="rounded-2xl border border-emerald-500/15 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-slate-950/70">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">Trips goal</p>
                  <div className="mt-4">
                    <div className="flex items-baseline justify-between text-slate-900 dark:text-white">
                      <span className="text-4xl font-semibold">{visitedTimeline.length}</span>
                      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">/{goalTarget}</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${goalProgress}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{goalProgress}% complete</p>
                  </div>
                </div>
              </div>

              {cadenceEntries.length > 0 && (
                <div className="rounded-3xl border border-emerald-500/15 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-slate-950/70">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">Travel cadence</p>
                  <div className="mt-5 flex gap-4 overflow-x-auto pb-1">
                    {cadenceEntries.map((entry) => (
                      <div
                        key={entry.year}
                        className="flex min-w-[120px] flex-col items-center gap-3 rounded-2xl border border-emerald-500/15 bg-white/80 p-4 text-center shadow-sm dark:border-emerald-400/20 dark:bg-slate-950/60"
                      >
                        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">{entry.year}</span>
                        <div className="relative h-20 w-full overflow-hidden rounded-full bg-emerald-100/70 dark:bg-emerald-900/40">
                          <div
                            className="absolute bottom-0 inset-x-0 rounded-full bg-emerald-500"
                            style={{ height: `${Math.round((entry.count / (maxCadenceCount || 1)) * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{entry.count} trips</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-5">
              <div className="rounded-3xl border border-emerald-500/15 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-slate-950/70">
                <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">
                  <Globe2 className="h-4 w-4" /> Travel footprint
                </div>
                <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-3xl font-semibold text-slate-900 dark:text-white">{uniqueCountries.size}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Countries</p>
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-slate-900 dark:text-white">{uniqueCities.size}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Cities</p>
                  </div>
                </div>
                <div className="mt-6 border-t border-emerald-500/15 pt-5 dark:border-emerald-400/20">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">Spotlight cities</p>
                  {spotlightCities.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Save or log destinations to build your personal atlas.</p>
                  ) : (
                    <ul className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                      {spotlightCities.map((city) => (
                        <li key={city} className="flex items-center justify-between">
                          <span>{capitalizeCity(city)}</span>
                          <span className="text-slate-400 dark:text-slate-500">{countryLabel(city)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-500/15 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-slate-950/70">
                <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">
                  <BarChart3 className="h-4 w-4" /> Saved city heatmap
                </div>
                {savedHeatmap.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Bookmark destinations to see which hubs you gravitate toward.</p>
                ) : (
                  <ul className="mt-6 space-y-4">
                    {savedHeatmap.map((city) => (
                      <li key={city.city} className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                          <span>{capitalizeCity(city.city)}</span>
                          <span className="text-slate-400 dark:text-slate-500">{city.count} saved</span>
                        </div>
                        <div className="h-2 rounded-full bg-emerald-100/80 dark:bg-emerald-900/40">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${Math.min((city.count / (savedHeatmap[0].count || 1)) * 100, 100)}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-3xl border border-emerald-500/15 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-slate-950/70">
                <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">
                  <Sparkles className="h-4 w-4" /> AI copilots
                </div>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Tap into the assistant anywhere on Urban Manual to surface ideas tailored to your saved and visited places.</p>
                <div className="mt-5 space-y-4">
                  {aiModules.map(({ title, description, icon: Icon }) => (
                    <div key={title} className="rounded-2xl border border-emerald-500/15 bg-white/80 p-4 shadow-sm dark:border-emerald-400/20 dark:bg-slate-950/60">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                        <Icon className="h-4 w-4" /> {title}
                      </div>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 border-t border-emerald-500/15 pt-4 dark:border-emerald-400/20">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">Quick prompts</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {aiShortcuts.map((shortcut) => (
                      <span key={shortcut} className="rounded-full border border-emerald-500/20 bg-white/70 px-3 py-1 text-xs font-medium text-slate-600 dark:border-emerald-400/20 dark:bg-slate-950/60 dark:text-slate-200">
                        {shortcut}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </ContentSection>

        <ContentSection
          id="planner"
          title="Trip planner"
          description="Draft a day-by-day itinerary by assigning your favorite places to each day."
        >
          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <div className="grid gap-4 rounded-3xl border border-emerald-500/15 bg-white/80 p-5 shadow-sm backdrop-blur lg:grid-cols-[1.4fr_auto] lg:items-end dark:border-emerald-400/20 dark:bg-slate-950/70">
                <div className="space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">Trip name</label>
                  <input
                    value={tripName}
                    onChange={(event) => setTripName(event.target.value)}
                    placeholder="Name your getaway"
                    className="w-full rounded-xl border border-emerald-500/20 bg-white/80 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-400/20 dark:bg-slate-950/70 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">
                    <span>Trip length</span>
                    <span className="text-slate-900 dark:text-white">{tripDuration} day{tripDuration === 1 ? "" : "s"}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={tripDuration}
                    onChange={(event) => setTripDuration(Number(event.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {dayNumbers.map((day) => {
                  const assignments = dayPlans[day] || [];
                  const isOpen = selectedDay === day;
                  return (
                    <div key={day} className="rounded-3xl border border-emerald-500/15 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-slate-950/70">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">Day {day}</p>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{assignments.length} {assignments.length === 1 ? "spot" : "spots"} assigned</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => clearDayPlan(day)}
                            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600 transition hover:border-emerald-500/40 hover:text-emerald-700 dark:border-emerald-400/20 dark:text-emerald-200"
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {assignments.length === 0 ? (
                          <p className="rounded-2xl border border-dashed border-emerald-500/20 bg-white/70 px-4 py-6 text-center text-sm text-slate-500 dark:border-emerald-400/20 dark:bg-slate-950/60 dark:text-slate-300">
                            No places assigned yet. Add saved or visited gems to structure the day.
                          </p>
                        ) : (
                          assignments.map((slug) => {
                            const details = plannerPlaceMap.get(slug);
                            if (!details) return null;
                            return (
                              <button
                                key={slug}
                                type="button"
                                onClick={() => handleCardClick(slug)}
                                className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-emerald-500/15 bg-white/80 p-4 text-left shadow-sm transition hover:border-emerald-500/40 hover:bg-white dark:border-emerald-400/20 dark:bg-slate-950/70"
                              >
                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-emerald-100/60 dark:bg-emerald-900/40">
                                  {details.image ? (
                                    <img src={details.image} alt={details.name} className="h-full w-full object-cover" />
                                  ) : null}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{details.name}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-300">{capitalizeCity(details.city)}</p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {details.badges.map((badge) => (
                                      <span key={badge} className="rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                                        {badge}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleRemovePlaceFromDay(day, slug);
                                  }}
                                  className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-emerald-500 transition hover:bg-emerald-500 hover:text-white dark:bg-slate-950/70"
                                >
                                  <X className="h-4 w-4" />
                                  <span className="sr-only">Remove</span>
                                </button>
                              </button>
                            );
                          })
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDay(isOpen ? null : day);
                          setPlaceSearch("");
                        }}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-500/40 hover:text-emerald-600 dark:border-emerald-400/20 dark:text-emerald-200"
                      >
                        <Plus className="h-4 w-4" /> {assignments.length > 0 ? "Add more spots" : "Add a spot"}
                      </button>

                      {isOpen && (
                        <div className="mt-4 space-y-3 rounded-2xl border border-emerald-500/20 bg-emerald-50/60 p-4 dark:border-emerald-400/20 dark:bg-emerald-950/40">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">Choose from your collection</p>
                            <button
                              type="button"
                              onClick={() => setSelectedDay(null)}
                              className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-600/80 transition hover:text-emerald-700 dark:text-emerald-300"
                            >
                              Close <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <input
                            value={placeSearch}
                            onChange={(event) => setPlaceSearch(event.target.value)}
                            placeholder="Search saved or visited spots"
                            className="w-full rounded-xl border border-emerald-500/20 bg-white/80 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-400/20 dark:bg-slate-950/70 dark:text-slate-100"
                          />
                          <div className="max-h-48 space-y-3 overflow-y-auto pr-1">
                            {filteredSuggestions.length === 0 ? (
                              <p className="rounded-xl border border-dashed border-emerald-500/20 bg-white/80 p-3 text-xs text-slate-500 dark:border-emerald-400/20 dark:bg-slate-950/60 dark:text-slate-300">
                                {plannerOptions.length === 0 ? "Save or log destinations to start planning." : "No matches. Try a different search or day."}
                              </p>
                            ) : (
                              filteredSuggestions.map((option) => (
                                <button
                                  key={option.slug}
                                  type="button"
                                  onClick={() => handleAddPlaceToDay(day, option.slug)}
                                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-white/80 px-3 py-2 text-left text-sm text-slate-700 transition hover:border-emerald-500/40 hover:text-emerald-600 dark:border-emerald-400/20 dark:bg-slate-950/70 dark:text-slate-200"
                                >
                                  <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">{option.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-300">{capitalizeCity(option.city)}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex flex-wrap gap-1">
                                      {option.badges.map((badge) => (
                                        <span key={badge} className="rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                                          {badge}
                                        </span>
                                      ))}
                                    </div>
                                    <Plus className="h-4 w-4 text-emerald-500" />
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
              <div className="rounded-3xl border border-emerald-500/15 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-slate-950/70">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">
                  <ListChecks className="h-4 w-4" /> Plan summary
                </div>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Assign saved highlights or past favorites to keep your itinerary balanced across the trip.</p>
                <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between rounded-2xl border border-emerald-500/20 px-3 py-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80">Days planned</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{tripDuration}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-emerald-500/20 px-3 py-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80">Places assigned</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{totalAssignments}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-emerald-500/20 px-3 py-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80">Avg per day</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{averageAssignments.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-emerald-500/20 px-3 py-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80">Open days</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{unplannedDays}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-500/15 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-slate-950/70">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">Need inspiration?</p>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Ask the AI chat to fill any blank days or surface themed experiences. Try prompting:</p>
                <div className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                  <p className="rounded-2xl bg-emerald-50/80 px-4 py-2 dark:bg-emerald-900/30">“Suggest a morning in {tripName || "my next city"} that pairs coffee and design.”</p>
                  <p className="rounded-2xl bg-emerald-50/80 px-4 py-2 dark:bg-emerald-900/30">“Balance my trip with one cultural highlight and one food experience each day.”</p>
                  <p className="rounded-2xl bg-emerald-50/80 px-4 py-2 dark:bg-emerald-900/30">“What hidden gems should I add to day {selectedDay || 1}?”</p>
                </div>
              </div>
            </aside>
          </div>
        </ContentSection>

        <ContentSection
          title="Saved destinations"
          description="Keep track of the places waiting on your list."
        >
          {savedPlaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-emerald-500/20 bg-white/80 px-8 py-14 text-center shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-slate-950/70">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100/80 dark:bg-emerald-900/40">
                <Bookmark className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">No saved spots yet</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Start bookmarking destinations you want to experience.</p>
              </div>
              <Button
                onClick={() => setLocation("/")}
                className="rounded-full bg-emerald-600 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-emerald-700"
              >
                Discover places
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {savedPlaces.map((place) => (
                <button
                  key={place.destination_slug}
                  onClick={() => handleCardClick(place.destination_slug)}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-emerald-500/15 bg-white/80 text-left shadow-sm transition hover:border-emerald-500/40 hover:shadow-[0_12px_40px_rgba(16,112,87,0.15)] dark:border-emerald-400/20 dark:bg-slate-950/70"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-emerald-100/60 dark:bg-emerald-900/40">
                    <img
                      src={place.destination.image || "/images/placeholder-destination.jpg"}
                      alt={place.destination.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">{place.destination.category || "Destination"}</p>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{place.destination.name}</h3>
                    <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
                      <MapPin className="h-4 w-4" /> {capitalizeCity(place.destination.city)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ContentSection>

        <ContentSection
          title="Visited timeline"
          description="Your documented destinations, stories, and ratings."
        >
          <div className="flex flex-wrap items-center gap-2 pb-4">
            {[{ key: "all", label: "All" }, { key: "rated", label: "Rated" }, { key: "notes", label: "With notes" }].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setVisitedFilter(filter.key as typeof visitedFilter)}
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                  visitedFilter === filter.key
                    ? "bg-emerald-600 text-white"
                    : "border border-emerald-500/20 text-emerald-700 hover:border-emerald-500/40 hover:text-emerald-600 dark:border-emerald-400/20 dark:text-emerald-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {filteredVisitedTimeline.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-emerald-500/20 bg-white/80 px-8 py-16 text-center shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-slate-950/70">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100/80 dark:bg-emerald-900/40">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">No visits logged yet</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Keep track of your journeys to build a personal travel log.</p>
              </div>
              <Button
                onClick={() => setLocation("/")}
                className="rounded-full bg-emerald-600 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-emerald-700"
              >
                Discover places
              </Button>
            </div>
          ) : (
            <ol className="space-y-6">
              {filteredVisitedTimeline.map((place) => (
                <li key={place.destination_slug}>
                  <button
                    onClick={() => handleCardClick(place.destination_slug)}
                    className="group flex w-full flex-col gap-4 rounded-3xl border border-emerald-500/15 bg-white/80 p-5 text-left shadow-sm transition hover:border-emerald-500/40 hover:bg-white dark:border-emerald-400/20 dark:bg-slate-950/70"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-300/80">{formatVisitedDate(place.visited_date)}</div>
                      {place.notes && (
                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-200">Personal note</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{place.destination.name}</h3>
                        <p className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
                          <MapPin className="h-4 w-4" /> {capitalizeCity(place.destination.city)}
                        </p>
                        {renderRating(place.rating)}
                      </div>
                      {place.destination.image && (
                        <div className="overflow-hidden rounded-xl bg-emerald-100/60 dark:bg-emerald-900/40">
                          <img
                            src={place.destination.image}
                            alt={place.destination.name}
                            className="h-24 w-full max-w-[160px] object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}
                    </div>
                    {place.notes && (
                      <p className="rounded-2xl bg-white/80 p-4 text-sm text-slate-600 shadow-inner dark:bg-slate-950/70 dark:text-slate-300">“{place.notes}”</p>
                    )}
                  </button>
                </li>
              ))}
            </ol>
          )}
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
