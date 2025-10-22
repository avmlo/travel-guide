import { Destination } from "@/types/destination";
import { MapPin, Heart, TrendingUp, Sparkles, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface DiscoveryCardProps {
  destination: Destination & {
    feedReason?: string;
    feedScore?: number;
  };
  onView: (destination: Destination) => void;
  onSave?: (slug: string) => void;
  isSaved?: boolean;
  index?: number;
}

export function DiscoveryCard({ destination, onView, onSave, isSaved, index = 0 }: DiscoveryCardProps) {
  const colors = [
    'from-orange-100 to-orange-50',
    'from-green-100 to-green-50',
    'from-blue-100 to-blue-50',
    'from-purple-100 to-purple-50',
    'from-pink-100 to-pink-50',
    'from-yellow-100 to-yellow-50',
  ];

  const colorIndex = index % colors.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative"
    >
      <div
        className={`relative bg-gradient-to-br ${colors[colorIndex]} rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 h-full`}
        onClick={() => onView(destination)}
      >
        {/* Feed Reason Badge */}
        {destination.feedReason && (
          <div className="absolute top-3 left-3 z-10">
            <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium">
              {destination.feedReason.includes('Trending') && <TrendingUp className="h-3 w-3" />}
              {destination.feedReason.includes('Hidden') && <Sparkles className="h-3 w-3" />}
              {destination.feedReason.includes('New') && <Star className="h-3 w-3" />}
              <span>{destination.feedReason}</span>
            </div>
          </div>
        )}

        {/* Save Button */}
        {onSave && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave(destination.slug);
            }}
            className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            aria-label={isSaved ? "Unsave destination" : "Save destination"}
          >
            <Heart
              className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            />
          </button>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Michelin Stars & Crown */}
          <div className="flex items-center gap-2 mb-3">
            {destination.michelinStars && destination.michelinStars > 0 && (
              <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-0.5 rounded text-xs font-semibold">
                <Star className="h-3 w-3 fill-white" />
                <span>{destination.michelinStars} ⭐</span>
              </div>
            )}
            {destination.crown && (
              <div className="bg-yellow-500 text-white px-2 py-0.5 rounded text-xs font-semibold">
                👑 Top Pick
              </div>
            )}
          </div>

          {/* Name */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-black transition-colors">
            {destination.name}
          </h3>

          {/* Category */}
          <div className="inline-block bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 mb-3">
            {destination.category}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-4">
            <MapPin className="h-4 w-4" />
            <span className="font-medium">{destination.city}</span>
          </div>

          {/* Description */}
          {destination.content && (
            <p className="text-sm text-gray-600 line-clamp-3 mb-4">
              {destination.content}
            </p>
          )}

          {/* CTA */}
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-white/50 backdrop-blur-sm hover:bg-white border-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              onView(destination);
            }}
          >
            View Details
          </Button>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </motion.div>
  );
}
