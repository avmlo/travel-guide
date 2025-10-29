'use client';

import { useState } from 'react';
import { Destination } from '@/types/destination';
import { MapPin, Star, Crown, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface VisualDestinationCardProps {
  destination: Destination;
  onClick: () => void;
}

export function VisualDestinationCard({ destination, onClick }: VisualDestinationCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Redirect to login or show message
      return;
    }

    if (isSaved) {
      await supabase
        .from('saved_destinations')
        .delete()
        .eq('user_id', user.id)
        .eq('destination_slug', destination.slug);
      setIsSaved(false);
    } else {
      await supabase
        .from('saved_destinations')
        .insert({
          user_id: user.id,
          destination_slug: destination.slug
        });
      setIsSaved(true);
    }
  };

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 transition-all duration-300 hover:shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      {/* Image */}
      <div className="relative w-full overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
        )}
        <img
          src={destination.main_image || '/placeholder-image.jpg'}
          alt={destination.name}
          className={`w-full h-auto object-cover transition-all duration-500 ${
            isHovered ? 'scale-110' : 'scale-100'
          } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-60'
        }`} />

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm transition-all duration-300 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isSaved ? 'fill-red-500 text-red-500' : 'text-gray-700 dark:text-gray-300'
            }`}
          />
        </button>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {(destination.michelin_stars || destination.michelinStars) > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-600 text-white text-xs font-medium">
              <Star className="w-3 h-3 fill-current" />
              <span>{destination.michelin_stars || destination.michelinStars}</span>
            </div>
          )}
          {destination.crown && (
            <div className="p-1.5 rounded-full bg-yellow-500 text-white">
              <Crown className="w-3 h-3 fill-current" />
            </div>
          )}
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-bold text-lg mb-1 line-clamp-2 tracking-tight">
            {destination.name}
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-white/90">
            <MapPin className="w-4 h-4" />
            <span>{destination.city}</span>
            {destination.category && (
              <>
                <span className="text-white/50">•</span>
                <span className="capitalize">{destination.category}</span>
              </>
            )}
          </div>

          {/* Description on Hover */}
          <p className={`mt-2 text-sm text-white/80 line-clamp-2 transition-all duration-300 ${
            isHovered ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0'
          }`}>
            {destination.subline || destination.description}
          </p>
        </div>
      </div>
    </div>
  );
}

