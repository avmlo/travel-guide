import { Destination } from "@/types/destination";
import { DestinationCard } from "./DestinationCard";
import { Button } from "./ui/button";

interface DestinationGridProps {
  destinations: Destination[];
  savedPlaces: string[];
  visitedPlaces: string[];
  onCardClick: (destination: Destination) => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

export function DestinationGrid({
  destinations,
  savedPlaces,
  visitedPlaces,
  onCardClick,
  onLoadMore,
  hasMore,
}: DestinationGridProps) {
  if (destinations.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-400 mb-6">No destinations found.</p>
        <Button onClick={() => window.location.reload()}>Clear filters</Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6 animate-in fade-in duration-500">
        {destinations.map((destination, index) => (
          <DestinationCard
            key={destination.slug}
            destination={destination}
            colorIndex={index}
            onClick={() => onCardClick(destination)}
            isSaved={savedPlaces.includes(destination.slug)}
            isVisited={visitedPlaces.includes(destination.slug)}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-12">
          <button
            onClick={onLoadMore}
            className="px-8 py-3 border border-gray-300 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-all"
          >
            Load More
          </button>
        </div>
      )}
    </>
  );
}