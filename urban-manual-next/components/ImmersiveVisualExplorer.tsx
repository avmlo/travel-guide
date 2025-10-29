'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Destination } from '@/types/destination';
import { DestinationCardEnhanced } from './DestinationCardEnhanced';
import { VisualFilters } from './VisualFilters';

import { Loader2 } from 'lucide-react';

interface ImmersiveVisualExplorerProps {
  destinations: Destination[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  onCardClick?: (destination: Destination) => void;
  savedPlaces?: string[];
  visitedPlaces?: string[];
}

export function ImmersiveVisualExplorer({
  destinations,
  loading = false,
  onLoadMore,
  hasMore = false,
  onCardClick,
  savedPlaces = [],
  visitedPlaces = [],
}: ImmersiveVisualExplorerProps) {
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>(destinations);
  const [columns, setColumns] = useState(4);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Responsive columns
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setColumns(2); // sm
      else if (width < 768) setColumns(3); // md
      else if (width < 1024) setColumns(4); // lg
      else if (width < 1280) setColumns(5); // xl
      else if (width < 1536) setColumns(6); // 2xl
      else setColumns(7); // 2xl+
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update filtered destinations when props change
  useEffect(() => {
    setFilteredDestinations(destinations);
  }, [destinations]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && onLoadMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, onLoadMore]);

  // Distribute destinations into columns for masonry layout
  const distributeIntoColumns = useCallback(() => {
    const cols: Destination[][] = Array.from({ length: columns }, () => []);
    const colHeights = Array(columns).fill(0);

    filteredDestinations.forEach((dest) => {
      // Find column with minimum height
      const minHeight = Math.min(...colHeights);
      const minIndex = colHeights.indexOf(minHeight);
      
      cols[minIndex].push(dest);
      // Estimate height based on aspect-square cards + text
      colHeights[minIndex] += 1;
    });

    return cols;
  }, [filteredDestinations, columns]);

  const columnData = distributeIntoColumns();

  const handleFilterChange = (filtered: Destination[]) => {
    setFilteredDestinations(filtered);
  };

  return (
    <div className="w-full">
      {/* Filters */}
      <VisualFilters
        destinations={destinations}
        onFilterChange={handleFilterChange}
      />

      {/* Masonry Grid */}
      <div className="px-6 md:px-10 py-8 max-w-[1920px] mx-auto">
        {loading && filteredDestinations.length === 0 ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            <div className="flex gap-4 md:gap-6">
              {columnData.map((column, colIndex) => (
                <div
                  key={colIndex}
                  className="flex-1 flex flex-col gap-4 md:gap-6"
                  style={{ minWidth: 0 }}
                >
                  {column.map((destination, index) => (
                    <DestinationCardEnhanced
                      key={destination.slug}
                      destination={destination}
                      onClick={() => onCardClick?.(destination)}
                      isSaved={savedPlaces.includes(destination.slug)}
                      isVisited={visitedPlaces.includes(destination.slug)}
                      animationDelay={Math.min(index * 30, 500)}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Load More Trigger */}
            {hasMore && (
              <div
                ref={observerTarget}
                className="flex justify-center items-center py-8"
              >
                {loading && (
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                )}
              </div>
            )}

            {/* No Results */}
            {filteredDestinations.length === 0 && !loading && (
              <div className="text-center py-20">
                <p className="text-xl text-gray-400 mb-6">
                  No destinations found matching your filters
                </p>
              </div>
            )}

            {/* End of results indicator */}
            {!hasMore && filteredDestinations.length > 40 && (
              <div className="text-center py-8 text-gray-400 dark:text-gray-600 text-sm">
                You've reached the end
              </div>
            )}
          </>
        )}
      </div>


    </div>
  );
}

