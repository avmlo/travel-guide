import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { MapPin, Heart, CheckCircle2 } from "lucide-react";
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

interface DayPlan {
  destinations: string[];
  notes: string;
}

export default function Account() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [visitedPlaces, setVisitedPlaces] = useState<VisitedPlace[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [activeTab, setActiveTab] = useState<'saved' | 'visited'>('saved');
  const [tripTitle, setTripTitle] = useState("Upcoming Adventure");
  const [tripStartDate, setTripStartDate] = useState("");
  const [tripLength, setTripLength] = useState(3);
  const [dayPlans, setDayPlans] = useState<DayPlan[]>(() =>
    Array.from({ length: 3 }, () => ({ destinations: [], notes: "" }))
  );

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
      if (tripLength === prev.length) return prev;
      if (tripLength > prev.length) {
        const additions = Array.from({ length: tripLength - prev.length }, () => ({ destinations: [], notes: "" }));
        return [...prev, ...additions];
      }
      return prev.slice(0, tripLength);
    });
  }, [tripLength]);

  const handleCardClick = (destinationSlug: string) => {
    const dest = allDestinations.find(d => d.slug === destinationSlug);
    if (dest) {
      setSelectedDestination(dest);
      setIsDrawerOpen(true);
    }
  };

  const handleAssignPlace = (dayIndex: number, slug: string) => {
    if (!slug) return;
    setDayPlans(prev =>
      prev.map((day, index) => {
        if (index !== dayIndex) return day;
        if (day.destinations.includes(slug)) {
          return day;
        }
        return { ...day, destinations: [...day.destinations, slug] };
      })
    );
  };

  const handleRemoveAssignment = (dayIndex: number, slug: string) => {
    setDayPlans(prev =>
      prev.map((day, index) => {
        if (index !== dayIndex) return day;
        return { ...day, destinations: day.destinations.filter(item => item !== slug) };
      })
    );
  };

  const handleNotesChange = (dayIndex: number, value: string) => {
    setDayPlans(prev =>
      prev.map((day, index) => (index === dayIndex ? { ...day, notes: value } : day))
    );
  };

  const handleClearDay = (dayIndex: number) => {
    setDayPlans(prev =>
      prev.map((day, index) => (index === dayIndex ? { destinations: [], notes: "" } : day))
    );
  };

  const handleResetPlanner = () => {
    setTripTitle("Upcoming Adventure");
    setTripStartDate("");
    setTripLength(3);
    setDayPlans(Array.from({ length: 3 }, () => ({ destinations: [], notes: "" })));
  };

  const assignSuggestion = (slug: string) => {
    if (dayPlans.some(day => day.destinations.includes(slug))) {
      return;
    }

    const targetIndex = dayPlans.reduce((bestIndex, day, index, arr) => {
      if (bestIndex === -1) return index;
      if (arr[bestIndex].destinations.length > day.destinations.length) {
        return index;
      }
      return bestIndex;
    }, -1);

    const indexToUse = targetIndex === -1 ? 0 : targetIndex;
    handleAssignPlace(indexToUse, slug);
  };

  const handleTripLengthChange = (value: number) => {
    if (Number.isNaN(value)) return;
    const normalized = Math.min(14, Math.max(1, value));
    setTripLength(normalized);
  };

  const formatDayLabel = (offset: number) => {
    if (!tripStartDate) return null;
    const base = new Date(tripStartDate);
    if (Number.isNaN(base.getTime())) return null;
    base.setDate(base.getDate() + offset);
    return base.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
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

  const uniqueCities = new Set([
    ...savedPlaces.map(p => p.destination.city),
    ...visitedPlaces.filter(p => p.destination).map(p => p.destination!.city)
  ]);

  const uniqueCountries = new Set([
    ...savedPlaces.map(p => p.destination.city),
    ...visitedPlaces.filter(p => p.destination).map(p => p.destination!.city)
  ].map(city => {
    // Simple country mapping for major cities
    const cityCountryMap: Record<string, string> = {
      'tokyo': 'Japan', 'kyoto': 'Japan', 'osaka': 'Japan',
      'paris': 'France', 'lyon': 'France',
      'london': 'United Kingdom',
      'new-york': 'United States', 'los-angeles': 'United States',
      'barcelona': 'Spain', 'madrid': 'Spain',
      'rome': 'Italy', 'milan': 'Italy',
    };
    return cityCountryMap[city] || 'Other';
  }));

  const destinationOptions = Array.from(
    new Map(
      [
        ...savedPlaces.map(place => ({
          slug: place.destination_slug,
          name: place.destination.name,
          city: place.destination.city,
          image: place.destination.image
        })),
        ...visitedPlaces
          .filter(place => place.destination)
          .map(place => ({
            slug: place.destination_slug,
            name: place.destination!.name,
            city: place.destination!.city,
            image: place.destination!.image
          }))
      ].map(item => [item.slug, item])
    ).values()
  );

  const totalAssignments = dayPlans.reduce((sum, day) => sum + day.destinations.length, 0);
  const populatedDays = dayPlans.filter(day => day.destinations.length > 0).length;
  const unassignedDestinations = destinationOptions.filter(option =>
    !dayPlans.some(day => day.destinations.includes(option.slug))
  );
  const quickSuggestions = unassignedDestinations.slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Main Content */}
      <main className="px-6 md:px-10 py-12">
        <div className="max-w-[1920px] mx-auto">
          
          {/* Profile Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-normal mb-2">{user?.user_metadata?.name || user?.email?.split('@')[0] || 'Traveler'}</h1>
            <p className="text-base text-gray-600">{user?.email}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-12 pb-12 border-b border-gray-200">
            <div>
              <div className="text-3xl font-normal mb-1">{visitedPlaces.length}</div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">Places Visited</div>
            </div>
            <div>
              <div className="text-3xl font-normal mb-1">{savedPlaces.length}</div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">Saved</div>
            </div>
            <div>
              <div className="text-3xl font-normal mb-1">{uniqueCities.size}</div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">Cities</div>
            </div>
          </div>

          {/* Trip Planner */}
          <section className="mb-12 pb-12 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Trip Planner</div>
                <h2 className="text-2xl font-normal mb-2">Plan your next escape</h2>
                <p className="text-sm text-gray-600 max-w-xl">
                  Assign your saved spots to each day, jot down notes, and keep everything organised before departure.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-xs uppercase text-gray-500">
                  <span className="block text-[11px] tracking-[0.2em]">Summary</span>
                  <div className="flex gap-6 mt-2 text-gray-900">
                    <div>
                      <div className="text-lg font-normal">{tripLength}</div>
                      <div className="text-[11px] uppercase tracking-[0.25em] text-gray-400">Days</div>
                    </div>
                    <div>
                      <div className="text-lg font-normal">{populatedDays}</div>
                      <div className="text-[11px] uppercase tracking-[0.25em] text-gray-400">Scheduled</div>
                    </div>
                    <div>
                      <div className="text-lg font-normal">{totalAssignments}</div>
                      <div className="text-[11px] uppercase tracking-[0.25em] text-gray-400">Stops</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleResetPlanner}
                  className="text-xs uppercase tracking-[0.2em] text-gray-500 hover:text-black transition-colors"
                >
                  Reset Planner
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.25em] text-gray-500 block mb-2">Trip title</label>
                    <input
                      value={tripTitle}
                      onChange={event => setTripTitle(event.target.value)}
                      placeholder="Upcoming Adventure"
                      className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.25em] text-gray-500 block mb-2">Start date</label>
                      <input
                        type="date"
                        value={tripStartDate}
                        onChange={event => setTripStartDate(event.target.value)}
                        className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.25em] text-gray-500 block mb-2">Days</label>
                      <input
                        type="number"
                        min={1}
                        max={14}
                        value={tripLength}
                        onChange={event => handleTripLengthChange(Number(event.target.value))}
                        className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] uppercase tracking-[0.25em] text-gray-500 mb-3">Quick suggestions</div>
                  {quickSuggestions.length === 0 ? (
                    <p className="text-xs text-gray-500">Everything you have saved is already on the itinerary.</p>
                  ) : (
                    <div className="space-y-3">
                      {quickSuggestions.map(option => (
                        <button
                          key={option.slug}
                          onClick={() => assignSuggestion(option.slug)}
                          className="w-full flex items-center justify-between border border-gray-200 px-3 py-2 text-left text-sm hover:border-black transition-colors"
                        >
                          <span className="flex items-center gap-3">
                            <span className="bg-gray-100 p-2">
                              <MapPin className="h-4 w-4" />
                            </span>
                            <span>
                              <span className="block font-medium text-sm">{option.name}</span>
                              <span className="block text-xs text-gray-500">{capitalizeCity(option.city)}</span>
                            </span>
                          </span>
                          <span className="text-[11px] uppercase tracking-[0.25em] text-gray-400">Add</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 grid sm:grid-cols-2 gap-6">
                {dayPlans.map((day, index) => {
                  const friendlyDate = formatDayLabel(index);
                  return (
                    <div key={index} className="border border-gray-200 p-5 flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.25em] text-gray-500">Day {index + 1}</div>
                          <div className="text-lg font-normal">{tripTitle || 'Trip day'}</div>
                          {friendlyDate && (
                            <div className="text-xs text-gray-500 mt-1">{friendlyDate}</div>
                          )}
                        </div>
                        <button
                          onClick={() => handleClearDay(index)}
                          className="text-[11px] uppercase tracking-[0.25em] text-gray-400 hover:text-black transition-colors"
                        >
                          Clear
                        </button>
                      </div>

                      <div className="space-y-2">
                        {day.destinations.length === 0 ? (
                          <p className="text-xs text-gray-500">Nothing scheduled yet. Add a saved spot below.</p>
                        ) : (
                          day.destinations.map(slug => {
                            const detail = destinationOptions.find(option => option.slug === slug);
                            if (!detail) return null;
                            return (
                              <div key={slug} className="border border-gray-200 px-3 py-2 flex items-center justify-between text-sm">
                                <button
                                  onClick={() => handleCardClick(slug)}
                                  className="text-left hover:opacity-70 transition-opacity"
                                >
                                  <span className="block font-medium">{detail.name}</span>
                                  <span className="block text-xs text-gray-500">{capitalizeCity(detail.city)}</span>
                                </button>
                                <button
                                  onClick={() => handleRemoveAssignment(index, slug)}
                                  className="text-[11px] uppercase tracking-[0.25em] text-gray-400 hover:text-black transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div>
                        <label className="text-[11px] uppercase tracking-[0.25em] text-gray-500 block mb-2">Add from saved & visited</label>
                        <select
                          value=""
                          onChange={event => handleAssignPlace(index, event.target.value)}
                          className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-black bg-white"
                        >
                          <option value="">Choose a destination</option>
                          {destinationOptions.map(option => (
                            <option key={option.slug} value={option.slug} disabled={day.destinations.includes(option.slug)}>
                              {option.name} — {capitalizeCity(option.city)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] uppercase tracking-[0.25em] text-gray-500 block mb-2">Notes</label>
                        <textarea
                          value={day.notes}
                          onChange={event => handleNotesChange(index, event.target.value)}
                          placeholder="Add reminders, meal ideas, or transfer info"
                          className="w-full border border-gray-200 px-3 py-2 text-sm min-h-[96px] resize-none focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Tab Navigation */}
          <div className="mb-8 border-b border-gray-200">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('saved')}
                className={`pb-4 text-sm font-bold uppercase tracking-wide transition-colors ${
                  activeTab === 'saved' 
                    ? 'border-b-2 border-black text-black' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Saved ({savedPlaces.length})
              </button>
              <button
                onClick={() => setActiveTab('visited')}
                className={`pb-4 text-sm font-bold uppercase tracking-wide transition-colors ${
                  activeTab === 'visited' 
                    ? 'border-b-2 border-black text-black' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Visited ({visitedPlaces.length})
              </button>
            </div>
          </div>

          {/* Content Grid */}
          {activeTab === 'saved' && (
            <>
              {savedPlaces.length === 0 ? (
                <div className="text-center py-16">
                  <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-400">No saved places yet</p>
                  <button 
                    onClick={() => setLocation('/')}
                    className="mt-4 text-sm font-bold uppercase hover:opacity-60 transition-opacity"
                  >
                    Explore Destinations
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {savedPlaces.map((place) => (
                    <button
                      key={place.destination_slug}
                      onClick={() => handleCardClick(place.destination_slug)}
                      className="group text-left"
                    >
                      <div className="aspect-square bg-gray-100 mb-3 overflow-hidden">
                        {place.destination.image && (
                          <img
                            src={place.destination.image}
                            alt={place.destination.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                      </div>
                      <h3 className="font-medium text-sm mb-1 line-clamp-2">{place.destination.name}</h3>
                      <p className="text-xs text-gray-600">{capitalizeCity(place.destination.city)}</p>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'visited' && (
            <>
              {visitedPlaces.length === 0 ? (
                <div className="text-center py-16">
                  <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-400">No visited places yet</p>
                  <button 
                    onClick={() => setLocation('/')}
                    className="mt-4 text-sm font-bold uppercase hover:opacity-60 transition-opacity"
                  >
                    Explore Destinations
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {visitedPlaces.map((place) => (
                    place.destination && (
                      <button
                        key={place.destination_slug}
                        onClick={() => handleCardClick(place.destination_slug)}
                        className="group text-left"
                      >
                        <div className="aspect-square bg-gray-100 mb-3 overflow-hidden relative">
                          {place.destination.image && (
                            <img
                              src={place.destination.image}
                              alt={place.destination.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          )}
                          {place.visited_date && (
                            <div className="absolute bottom-2 left-2 bg-white px-2 py-1 text-xs">
                              {new Date(place.visited_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </div>
                          )}
                        </div>
                        <h3 className="font-medium text-sm mb-1 line-clamp-2">{place.destination.name}</h3>
                        <p className="text-xs text-gray-600">{capitalizeCity(place.destination.city)}</p>
                        {place.rating > 0 && (
                          <div className="flex gap-0.5 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-xs ${i < place.rating ? 'text-black' : 'text-gray-300'}`}>★</span>
                            ))}
                          </div>
                        )}
                      </button>
                    )
                  ))}
                </div>
              )}
            </>
          )}
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

