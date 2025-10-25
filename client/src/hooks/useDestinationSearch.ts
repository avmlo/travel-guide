import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface SearchResult {
  slug: string;
  name: string;
  city: string;
  category: string;
  brand: string;
  main_image: string;
  michelin_stars: number;
  crown: boolean;
  rank: number;
}

interface SearchFilters {
  city?: string;
  category?: string;
  michelinOnly?: boolean;
}

/**
 * Full-text search hook with fuzzy matching
 * 
 * Features:
 * - Searches across name, description, category, city, brand
 * - Typo-tolerant (e.g., "tokio" finds "Tokyo")
 * - Ranked by relevance
 * - Optional filters for city, category, Michelin stars
 * 
 * @example
 * const { data: results } = useDestinationSearch('coffee tokyo');
 * const { data: filtered } = useDestinationSearch('restaurant', { city: 'tokyo', michelinOnly: true });
 */
export function useDestinationSearch(query: string, filters?: SearchFilters) {
  return useQuery({
    queryKey: ['search', query, filters],
    queryFn: async () => {
      if (!query || query.length < 2) {
        return [];
      }

      // Use filtered search if filters are provided
      if (filters && (filters.city || filters.category || filters.michelinOnly)) {
        const { data, error } = await supabase.rpc('search_destinations_filtered', {
          search_query: query,
          filter_city: filters.city || null,
          filter_category: filters.category || null,
          filter_michelin: filters.michelinOnly || false,
        });

        if (error) {
          console.error('Search error:', error);
          throw error;
        }

        return data as SearchResult[];
      }

      // Use basic search
      const { data, error } = await supabase.rpc('search_destinations', {
        search_query: query,
      });

      if (error) {
        console.error('Search error:', error);
        throw error;
      }

      return data as SearchResult[];
    },
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Search suggestions hook for autocomplete
 * Returns top 5 results for quick suggestions
 */
export function useSearchSuggestions(query: string) {
  const { data, isLoading } = useDestinationSearch(query);
  
  return {
    suggestions: data?.slice(0, 5) || [],
    isLoading,
  };
}

