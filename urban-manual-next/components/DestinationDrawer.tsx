'use client';

import { useEffect, useState } from 'react';
import { X, MapPin, Tag, Heart, Check, Share2, Navigation, Sparkles } from 'lucide-react';
import { Destination } from '@/types/destination';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Recommendation {
  slug: string;
  name: string;
  city: string;
  category: string;
  image: string | null;
  michelin_stars: number | null;
  crown: boolean;
}

interface DestinationDrawerProps {
  destination: Destination | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveToggle?: (slug: string, saved: boolean) => void;
  onVisitToggle?: (slug: string, visited: boolean) => void;
}

function capitalizeCity(city: string): string {
  return city
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function DestinationDrawer({ destination, isOpen, onClose, onSaveToggle, onVisitToggle }: DestinationDrawerProps) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isVisited, setIsVisited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Load saved and visited status
  useEffect(() => {
    async function checkSavedAndVisited() {
      if (!user || !destination) {
        setIsSaved(false);
        setIsVisited(false);
        return;
      }

      const { data: savedData } = await supabase
        .from('saved_places')
        .select('*')
        .eq('user_id', user.id)
        .eq('destination_slug', destination.slug)
        .single();

      setIsSaved(!!savedData);

      const { data: visitedData } = await supabase
        .from('visited_places')
        .select('*')
        .eq('user_id', user.id)
        .eq('destination_slug', destination.slug)
        .single();

      setIsVisited(!!visitedData);
    }

    checkSavedAndVisited();
  }, [user, destination]);

  const handleSave = async () => {
    if (!user || !destination) return;

    setLoading(true);
    const previousState = isSaved;
    const newState = !isSaved;

    // Optimistic update
    setIsSaved(newState);
    onSaveToggle?.(destination.slug, newState);

    try {
      if (previousState) {
        await supabase
          .from('saved_places')
          .delete()
          .eq('user_id', user.id)
          .eq('destination_slug', destination.slug);
      } else {
        await supabase
          .from('saved_places')
          .insert({
            user_id: user.id,
            destination_slug: destination.slug,
          });
      }
    } catch (error) {
      // Revert on error
      setIsSaved(previousState);
      onSaveToggle?.(destination.slug, previousState);
      console.error('Error toggling save:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVisit = async () => {
    if (!user || !destination) return;

    setLoading(true);
    const previousState = isVisited;
    const newState = !isVisited;

    // Optimistic update
    setIsVisited(newState);
    onVisitToggle?.(destination.slug, newState);

    try {
      if (previousState) {
        await supabase
          .from('visited_places')
          .delete()
          .eq('user_id', user.id)
          .eq('destination_slug', destination.slug);
      } else {
        await supabase
          .from('visited_places')
          .insert({
            user_id: user.id,
            destination_slug: destination.slug,
            visited_at: new Date().toISOString(),
          });
      }
    } catch (error) {
      // Revert on error
      setIsVisited(previousState);
      onVisitToggle?.(destination.slug, previousState);
      console.error('Error toggling visit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!destination) return;

    const url = `${window.location.origin}/destination/${destination.slug}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  // Load AI recommendations
  useEffect(() => {
    async function loadRecommendations() {
      if (!destination || !isOpen) {
        setRecommendations([]);
        return;
      }

      setLoadingRecommendations(true);

      try {
        const response = await fetch(`/api/recommendations?slug=${destination.slug}&limit=6`);
        const data = await response.json();

        if (data.recommendations) {
          setRecommendations(data.recommendations);
        }
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setLoadingRecommendations(false);
      }
    }

    loadRecommendations();
  }, [destination, isOpen]);

  if (!destination) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white dark:bg-gray-950 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } overflow-y-auto`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold">Destination</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Image */}
          {destination.image && (
            <div className="aspect-[16/10] rounded-lg overflow-hidden mb-6 bg-gray-100 dark:bg-gray-800">
              <img
                src={destination.image}
                alt={destination.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Title */}
          <div className="mb-6">
            <div className="flex items-start gap-3 mb-4">
              <h1 className="text-3xl font-bold flex-1">
                {destination.name}
              </h1>
              {destination.crown && (
                <span className="text-3xl flex-shrink-0">👑</span>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{capitalizeCity(destination.city)}</span>
              </div>

              {destination.category && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <span className="capitalize">{destination.category}</span>
                </div>
              )}

              {destination.michelin_stars && destination.michelin_stars > 0 && (
                <div className="flex items-center gap-2">
                  <span>⭐</span>
                  <span>{destination.michelin_stars} Michelin Star{destination.michelin_stars !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {user && (
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleSave}
                disabled={loading}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isSaved
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? 'Saved' : 'Save'}
              </button>

              <button
                onClick={handleVisit}
                disabled={loading}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isVisited
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Check className="h-5 w-5" />
                {isVisited ? 'Visited' : 'Mark as Visited'}
              </button>
            </div>
          )}

          {/* Sign in prompt */}
          {!user && (
            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <a href="/auth/login" className="font-medium hover:opacity-60">Sign in</a> to save destinations and track your visits
              </p>
            </div>
          )}

          {/* Michelin Stars */}
          {destination.michelin_stars && destination.michelin_stars > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2">
                {Array.from({ length: destination.michelin_stars }).map((_, i) => (
                  <img
                    key={i}
                    src="https://guide.michelin.com/assets/images/icons/1star-1f2c04d7e6738e8a3312c9cda4b64fd0.svg"
                    alt={`Michelin Star ${i + 1}`}
                    className="h-6 w-6"
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {destination.content && (
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase mb-3 text-gray-500 dark:text-gray-400">About</h3>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {destination.content}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-800 my-8" />

          {/* Map Section */}
          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase mb-4 text-gray-500 dark:text-gray-400">Location</h3>
            <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${encodeURIComponent(destination.name + ', ' + destination.city)}&zoom=15`}
                title={`Map showing location of ${destination.name}`}
              />
            </div>
          </div>

          {/* Directions Button */}
          <div className="mb-6">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.name + ' ' + destination.city)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors rounded-lg"
            >
              <Navigation className="h-4 w-4" />
              <span>Get Directions</span>
            </a>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-800 my-8" />

          {/* AI Recommendations */}
          {(loadingRecommendations || recommendations.length > 0) && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400">
                  You might also like
                </h3>
              </div>

              {loadingRecommendations ? (
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex-shrink-0 w-40">
                      <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg mb-2 animate-pulse" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-1 animate-pulse" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3 animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
                  {recommendations.map(rec => (
                    <button
                      key={rec.slug}
                      onClick={() => {
                        // Navigate to recommended destination
                        window.location.href = `/destination/${rec.slug}`;
                      }}
                      className="flex-shrink-0 w-40 group text-left"
                    >
                      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-2">
                        {rec.image ? (
                          <img
                            src={rec.image}
                            alt={rec.name}
                            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin className="h-8 w-8 opacity-20" />
                          </div>
                        )}
                        {rec.crown && (
                          <div className="absolute top-2 left-2 text-lg">👑</div>
                        )}
                        {rec.michelin_stars && rec.michelin_stars > 0 && (
                          <div className="absolute bottom-2 left-2 bg-white dark:bg-gray-900 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-0.5">
                            <span>⭐</span>
                            <span>{rec.michelin_stars}</span>
                          </div>
                        )}
                      </div>
                      <h4 className="font-medium text-xs leading-tight line-clamp-2 mb-1">
                        {rec.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {capitalizeCity(rec.city)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-800 my-8" />

          {/* Share Button */}
          <div className="flex justify-center">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition-opacity rounded-lg font-medium"
            >
              <Share2 className="h-4 w-4" />
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
