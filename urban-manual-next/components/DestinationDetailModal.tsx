'use client';

import { useEffect, useState } from 'react';
import { Destination } from '@/types/destination';
import { X, MapPin, Star, Crown, ExternalLink, Heart, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DestinationDetailModalProps {
  destination: Destination;
  onClose: () => void;
}

export function DestinationDetailModal({ destination, onClose }: DestinationDetailModalProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isVisited, setIsVisited] = useState(false);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Check if destination is saved or visited
    checkSavedStatus();

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const checkSavedStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: saved } = await supabase
      .from('saved_destinations')
      .select('*')
      .eq('user_id', user.id)
      .eq('destination_slug', destination.slug)
      .single();

    const { data: visited } = await supabase
      .from('visited_destinations')
      .select('*')
      .eq('user_id', user.id)
      .eq('destination_slug', destination.slug)
      .single();

    setIsSaved(!!saved);
    setIsVisited(!!visited);
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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

  const handleVisited = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (isVisited) {
      await supabase
        .from('visited_destinations')
        .delete()
        .eq('user_id', user.id)
        .eq('destination_slug', destination.slug);
      setIsVisited(false);
    } else {
      await supabase
        .from('visited_destinations')
        .insert({
          user_id: user.id,
          destination_slug: destination.slug
        });
      setIsVisited(true);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[90vh]">
          {/* Hero Image */}
          <div className="relative h-80 overflow-hidden">
            <img
              src={destination.main_image || '/placeholder-image.jpg'}
              alt={destination.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {(destination.michelin_stars || destination.michelinStars) > 0 && (
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-600 text-white text-sm font-medium">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{destination.michelin_stars || destination.michelinStars} Michelin Star{(destination.michelin_stars || destination.michelinStars) > 1 ? 's' : ''}</span>
                </div>
              )}
              {destination.crown && (
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-yellow-500 text-white text-sm font-medium">
                  <Crown className="w-4 h-4 fill-current" />
                  <span>Featured</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm font-medium transition-all ${
                  isSaved
                    ? 'bg-red-500 text-white'
                    : 'bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                }`}
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
              <button
                onClick={handleVisited}
                className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm font-medium transition-all ${
                  isVisited
                    ? 'bg-green-500 text-white'
                    : 'bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                }`}
              >
                <Check className="w-5 h-5" />
                <span>{isVisited ? 'Visited' : 'Mark Visited'}</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {destination.name}
              </h2>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="w-5 h-5" />
                <span className="text-lg">{destination.city}</span>
                {destination.category && (
                  <>
                    <span>•</span>
                    <span className="capitalize">{destination.category}</span>
                  </>
                )}
              </div>
            </div>

            {/* Subline */}
            {destination.subline && (
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-6 font-medium">
                {destination.subline}
              </p>
            )}

            {/* Description */}
            {destination.description && (
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {destination.description}
                </p>
              </div>
            )}

            {/* Tags */}
            {destination.tags && destination.tags.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {destination.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            <div className="flex flex-wrap gap-3">
              {destination.website && (
                <a
                  href={destination.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit Website
                </a>
              )}
              {destination.instagram && (
                <a
                  href={destination.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-colors font-medium"
                >
                  Instagram
                </a>
              )}
              {destination.google_maps && (
                <a
                  href={destination.google_maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
                >
                  <MapPin className="w-4 h-4" />
                  View on Maps
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

