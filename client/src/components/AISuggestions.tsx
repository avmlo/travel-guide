import { useState, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Destination } from "@/types/destination";
import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";

interface AISuggestionsProps {
  destination: Destination;
  onSelectDestination: (destination: Destination) => void;
}

interface Suggestion {
  slug: string;
  reason: string;
  destination?: Destination;
}

export function AISuggestions({ destination, onSelectDestination }: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<string[]>([]);
  const [visitedPlaces, setVisitedPlaces] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  // Load destinations and user data
  useEffect(() => {
    async function loadData() {
      // Load all destinations
      const { data: destData } = await supabase
        .from('destinations')
        .select('*');
      
      if (destData) {
        const transformed: Destination[] = destData.map(d => ({
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

      // Load user data
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

    loadData();
  }, []);

  // Get AI suggestions
  const getSuggestionsMutation = trpc.ai.getSuggestions.useMutation();

  useEffect(() => {
    async function fetchSuggestions() {
      if (allDestinations.length === 0) return;
      
      setLoading(true);
      setError(null);

      try {
        const result = await getSuggestionsMutation.mutateAsync({
          currentDestination: {
            slug: destination.slug,
            name: destination.name,
            city: destination.city,
            category: destination.category,
            michelinStars: destination.michelinStars,
          },
          allDestinations: allDestinations.map(d => ({
            slug: d.slug,
            name: d.name,
            city: d.city,
            category: d.category,
            michelinStars: d.michelinStars,
          })),
          savedPlaces,
          visitedPlaces,
        });

        // Match suggestions with full destination data
        const suggestionsWithData = result.suggestions.map(s => ({
          ...s,
          destination: allDestinations.find(d => d.slug === s.slug),
        }));

        setSuggestions(suggestionsWithData);
      } catch (err: any) {
        console.error('Error fetching suggestions:', err);
        setError(err.message || 'Failed to load suggestions');
      } finally {
        setLoading(false);
      }
    }

    fetchSuggestions();
  }, [destination.slug, allDestinations, savedPlaces, visitedPlaces]);

  if (loading) {
    return (
      <div className="mt-8 pt-8 border-t border-gray-300">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-lg">AI Suggestions</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Finding similar places...</span>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('AI Suggestions error:', error);
    return (
      <div className="mt-8 pt-8 border-t border-gray-300">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-lg">AI Suggestions</h3>
        </div>
        <p className="text-sm text-gray-500">Unable to load suggestions at this time.</p>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null; // Don't show section if no suggestions
  }

  return (
    <div className="mt-8 pt-8 border-t border-gray-300">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-purple-600" />
        <h3 className="font-semibold text-lg">You Might Also Like</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        {user && savedPlaces.length > 0 
          ? "Based on your saved places and this destination"
          : "Similar destinations you might enjoy"}
      </p>
      <div className="space-y-4">
        {suggestions.map((suggestion) => {
          if (!suggestion.destination) return null;
          
          const dest = suggestion.destination;
          return (
            <button
              key={dest.slug}
              onClick={() => onSelectDestination(dest)}
              className="w-full text-left p-4 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 transition-all group"
            >
              <div className="flex gap-4">
                {dest.mainImage && (
                  <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                    <img 
                      src={dest.mainImage} 
                      alt={`${dest.name} - AI suggested destination`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-base group-hover:text-purple-600 transition-colors truncate">
                      {dest.name}
                    </h4>
                    {dest.michelinStars && dest.michelinStars > 0 && (
                      <div className="flex gap-0.5 flex-shrink-0">
                        {[...Array(dest.michelinStars)].map((_, i) => (
                          <img 
                            key={i}
                            src="https://guide.michelin.com/assets/images/icons/1star-1f2c04d7e6738e8a3312c9cda4b64fd0.svg"
                            alt={`Michelin Star ${i + 1}`}
                            className="h-4 w-4"
                            loading="lazy"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 capitalize mb-2">
                    {dest.city} • {dest.category}
                  </p>
                  <p className="text-sm text-gray-600 italic">
                    {suggestion.reason}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

