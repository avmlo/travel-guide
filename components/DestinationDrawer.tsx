'use client';

import { useEffect, useState } from 'react';
import { X, MapPin, Tag, Heart, Check, Share2, Navigation, Sparkles, ChevronDown, Plus, Loader2, Clock } from 'lucide-react';
import { AppleMap } from '@/components/AppleMap';
import { Destination } from '@/types/destination';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface List {
  id: string;
  name: string;
  is_public: boolean;
}

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

// City timezone mapping
const CITY_TIMEZONES: Record<string, string> = {
  'tokyo': 'Asia/Tokyo',
  'new-york': 'America/New_York',
  'london': 'Europe/London',
  'paris': 'Europe/Paris',
  'los-angeles': 'America/Los_Angeles',
  'singapore': 'Asia/Singapore',
  'hong-kong': 'Asia/Hong_Kong',
  'sydney': 'Australia/Sydney',
  'dubai': 'Asia/Dubai',
  'bangkok': 'Asia/Bangkok',
  // Add more as needed
};

function getOpenStatus(openingHours: any, city: string): { isOpen: boolean; currentDay?: string; todayHours?: string } {
  if (!openingHours || !openingHours.weekday_text) {
    return { isOpen: false };
  }

  try {
    const timezone = CITY_TIMEZONES[city] || 'UTC';
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Google Places API weekday_text starts with Monday (index 0)
    // We need to convert: Sun=0 -> 6, Mon=1 -> 0, Tue=2 -> 1, etc.
    const googleDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const todayText = openingHours.weekday_text[googleDayIndex];
    const dayName = todayText?.split(':')[0];
    const hoursText = todayText?.substring(todayText.indexOf(':') + 1).trim();

    if (!hoursText) {
      return { isOpen: false, currentDay: dayName, todayHours: hoursText };
    }

    // Check if closed
    if (hoursText.toLowerCase().includes('closed')) {
      return { isOpen: false, currentDay: dayName, todayHours: 'Closed' };
    }

    // Check if 24 hours
    if (hoursText.toLowerCase().includes('24 hours') || hoursText.toLowerCase().includes('open 24 hours')) {
      return { isOpen: true, currentDay: dayName, todayHours: 'Open 24 hours' };
    }

    // Parse time ranges (e.g., "10:00 AM – 9:00 PM" or "10:00 AM – 2:00 PM, 5:00 PM – 9:00 PM")
    const timeRanges = hoursText.split(',').map((range: string) => range.trim());
    const currentTime = now.getHours() * 60 + now.getMinutes();

    for (const range of timeRanges) {
      const times = range.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/gi);
      if (times && times.length >= 2) {
        const openTime = parseTime(times[0]);
        const closeTime = parseTime(times[1]);

        if (currentTime >= openTime && currentTime < closeTime) {
          return { isOpen: true, currentDay: dayName, todayHours: hoursText };
        }
      }
    }

    return { isOpen: false, currentDay: dayName, todayHours: hoursText };
  } catch (error) {
    console.error('Error parsing opening hours:', error);
    return { isOpen: false };
  }
}

function parseTime(timeStr: string): number {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;

  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

export function DestinationDrawer({ destination, isOpen, onClose, onSaveToggle, onVisitToggle }: DestinationDrawerProps) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isVisited, setIsVisited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);
  const [checkAnimating, setCheckAnimating] = useState(false);

  // List management state
  const [showListsModal, setShowListsModal] = useState(false);
  const [userLists, setUserLists] = useState<List[]>([]);
  const [listsWithDestination, setListsWithDestination] = useState<Set<string>>(new Set());
  const [loadingLists, setLoadingLists] = useState(false);
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newListPublic, setNewListPublic] = useState(true);
  const [creatingList, setCreatingList] = useState(false);

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

    // Trigger animation
    setHeartAnimating(true);
    setTimeout(() => setHeartAnimating(false), 600);

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

    // Trigger animation
    setCheckAnimating(true);
    setTimeout(() => setCheckAnimating(false), 600);

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

  // Fetch user lists and check which ones contain this destination
  const fetchUserLists = async () => {
    if (!user || !destination) return;

    setLoadingLists(true);
    try {
      // Fetch user's lists
      const { data: lists, error: listsError } = await supabase
        .from('lists')
        .select('id, name, is_public')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (listsError) throw listsError;
      setUserLists(lists || []);

      // Fetch which lists contain this destination
      const { data: listItems, error: itemsError } = await supabase
        .from('list_items')
        .select('list_id')
        .eq('destination_slug', destination.slug);

      if (itemsError) throw itemsError;
      const listIds = new Set((listItems || []).map(item => item.list_id));
      setListsWithDestination(listIds);
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setLoadingLists(false);
    }
  };

  // Toggle destination in a list
  const toggleDestinationInList = async (listId: string) => {
    if (!user || !destination) return;

    const isInList = listsWithDestination.has(listId);
    const newListsWithDestination = new Set(listsWithDestination);

    if (isInList) {
      // Remove from list
      newListsWithDestination.delete(listId);
      setListsWithDestination(newListsWithDestination);

      const { error } = await supabase
        .from('list_items')
        .delete()
        .eq('list_id', listId)
        .eq('destination_slug', destination.slug);

      if (error) {
        // Revert on error
        setListsWithDestination(new Set([...newListsWithDestination, listId]));
        console.error('Error removing from list:', error);
      }
    } else {
      // Add to list
      newListsWithDestination.add(listId);
      setListsWithDestination(newListsWithDestination);

      const { error } = await supabase
        .from('list_items')
        .insert({
          list_id: listId,
          destination_slug: destination.slug,
        });

      if (error) {
        // Revert on error
        newListsWithDestination.delete(listId);
        setListsWithDestination(newListsWithDestination);
        console.error('Error adding to list:', error);
      }
    }
  };

  // Create a new list and optionally add current destination
  const createNewList = async () => {
    if (!user || !newListName.trim()) return;

    setCreatingList(true);
    try {
      const { data, error } = await supabase
        .from('lists')
        .insert([{
          user_id: user.id,
          name: newListName.trim(),
          description: newListDescription.trim() || null,
          is_public: newListPublic,
        }])
        .select()
        .single();

      if (error) throw error;

      // Add the new list to the state
      setUserLists([data, ...userLists]);

      // Add current destination to the new list
      if (destination) {
        await supabase.from('list_items').insert({
          list_id: data.id,
          destination_slug: destination.slug,
        });
        setListsWithDestination(new Set([...listsWithDestination, data.id]));
      }

      // Reset form and close create modal
      setNewListName('');
      setNewListDescription('');
      setNewListPublic(true);
      setShowCreateListModal(false);
    } catch (error) {
      console.error('Error creating list:', error);
      alert('Failed to create list');
    } finally {
      setCreatingList(false);
    }
  };

  // Open lists modal and fetch lists
  const openListsModal = () => {
    setShowListsModal(true);
    fetchUserLists();
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
              {/* Crown hidden for now */}
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
                  <img
                    src="https://guide.michelin.com/assets/images/icons/1star-1f2c04d7e6738e8a3312c9cda4b64fd0.svg"
                    alt="Michelin star"
                    className="h-4 w-4"
                  />
                  <span>{destination.michelin_stars} Michelin Star{destination.michelin_stars !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            {/* AI-Generated Tags */}
            {destination.tags && destination.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {destination.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full border border-purple-200 dark:border-purple-800"
                  >
                    ✨ {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Rating & Price Level */}
            {(destination.rating || destination.price_level) && (
              <div className="mt-4 flex items-center gap-4 text-sm">
                {destination.rating && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-semibold">{destination.rating.toFixed(1)}</span>
                    <span className="text-gray-500 dark:text-gray-400">Google Rating</span>
                  </div>
                )}
                {destination.price_level && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      {'$'.repeat(destination.price_level)}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">Price Level</span>
                  </div>
                )}
              </div>
            )}

            {/* Opening Hours */}
            {destination.opening_hours && (() => {
              const openStatus = getOpenStatus(destination.opening_hours, destination.city);
              return (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    {openStatus.todayHours && (
                      <span className={`text-sm font-semibold ${openStatus.isOpen ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {openStatus.isOpen ? 'Open now' : 'Closed'}
                      </span>
                    )}
                    {openStatus.todayHours && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        · {openStatus.todayHours}
                      </span>
                    )}
                  </div>
                  {destination.opening_hours.weekday_text && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                        View all hours
                      </summary>
                      <div className="mt-2 space-y-1 pl-6">
                        {destination.opening_hours.weekday_text.map((day: string, index: number) => {
                          const [dayName, hours] = day.split(': ');
                          const timezone = CITY_TIMEZONES[destination.city] || 'UTC';
                          const now = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
                          const dayOfWeek = now.getDay();
                          const googleDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                          const isToday = index === googleDayIndex;

                          return (
                            <div key={index} className={`flex justify-between ${isToday ? 'font-semibold text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                              <span>{dayName}</span>
                              <span>{hours}</span>
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Action Buttons */}
          {user && (
            <div className="flex gap-3 mb-6">
              <div className="flex-1 flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isSaved
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  } ${heartAnimating ? 'scale-95' : 'scale-100'}`}
                >
                  <Heart className={`h-5 w-5 transition-all duration-300 ${isSaved ? 'fill-current scale-110' : 'scale-100'} ${heartAnimating ? 'animate-[heartBeat_0.6s_ease-in-out]' : ''}`} />
                  <span className={`${heartAnimating && isSaved ? 'animate-[fadeIn_0.3s_ease-in]' : ''}`}>
                    {isSaved ? 'Saved' : 'Save'}
                  </span>
                  {heartAnimating && isSaved && (
                    <style jsx>{`
                      @keyframes heartBeat {
                        0%, 100% { transform: scale(1); }
                        15% { transform: scale(1.3); }
                        30% { transform: scale(1.1); }
                        45% { transform: scale(1.25); }
                        60% { transform: scale(1.05); }
                      }
                      @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                      }
                    `}</style>
                  )}
                </button>
                <button
                  onClick={openListsModal}
                  disabled={loading}
                  className="px-3 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Add to list"
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>

              <button
                onClick={handleVisit}
                disabled={loading}
                className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isVisited
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                } ${checkAnimating ? 'scale-95' : 'scale-100'}`}
              >
                <Check className={`h-5 w-5 transition-all duration-300 ${isVisited ? 'scale-110' : 'scale-100'} ${checkAnimating ? 'animate-[checkPop_0.6s_ease-in-out]' : ''}`} />
                <span className={`${checkAnimating && isVisited ? 'animate-[fadeIn_0.3s_ease-in]' : ''}`}>
                  {isVisited ? 'Visited' : 'Mark as Visited'}
                </span>
                {checkAnimating && isVisited && (
                  <style jsx>{`
                    @keyframes checkPop {
                      0%, 100% { transform: scale(1) rotate(0deg); }
                      25% { transform: scale(1.3) rotate(-10deg); }
                      50% { transform: scale(1.1) rotate(5deg); }
                      75% { transform: scale(1.2) rotate(-5deg); }
                    }
                    @keyframes fadeIn {
                      from { opacity: 0; }
                      to { opacity: 1; }
                    }
                  `}</style>
                )}
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

          {/* Description */}
          {destination.content && (
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase mb-3 text-gray-500 dark:text-gray-400">About</h3>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {destination.content}
              </div>
            </div>
          )}

          {/* Links Section */}
          {(destination.website || destination.phone_number || destination.instagram_url || destination.google_maps_url) && (
            <div className="mb-8">
              <style jsx>{`
                .pill-button {
                  display: inline-flex;
                  align-items: center;
                  gap: 6px;
                  padding: 8px 16px;
                  background: rgba(0, 0, 0, 0.6);
                  backdrop-filter: blur(10px);
                  color: white;
                  font-size: 14px;
                  font-weight: 500;
                  border-radius: 9999px;
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  cursor: pointer;
                  transition: all 0.2s ease;
                  text-decoration: none;
                }
                .pill-button:hover {
                  background: rgba(0, 0, 0, 0.7);
                }
                .pill-separator {
                  color: rgba(255, 255, 255, 0.6);
                }
              `}</style>
              <div className="flex flex-wrap gap-3">
                {destination.google_maps_url && (
                  <a
                    href={destination.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pill-button"
                  >
                    <span>📍</span>
                    <span className="pill-separator">•</span>
                    <span>Google Maps</span>
                  </a>
                )}
                {destination.website && (
                  <a
                    href={destination.website.startsWith('http') ? destination.website : `https://${destination.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pill-button"
                  >
                    <span>🌐</span>
                    <span className="pill-separator">•</span>
                    <span>Website</span>
                  </a>
                )}
                {destination.phone_number && (
                  <a
                    href={`tel:${destination.phone_number}`}
                    className="pill-button"
                  >
                    <span>📞</span>
                    <span className="pill-separator">•</span>
                    <span>Call</span>
                  </a>
                )}
                {destination.instagram_url && (
                  <a
                    href={destination.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pill-button"
                  >
                    <span>📷</span>
                    <span className="pill-separator">•</span>
                    <span>Instagram</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-800 my-8" />

          {/* Map Section */}
          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase mb-4 text-gray-500 dark:text-gray-400">Location</h3>
            <AppleMap
              places={[{ name: destination.name, city: destination.city }]}
              className="w-full h-64 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800"
            />
          </div>

          {/* Directions Button */}
          <div className="mb-6">
            <a
              href={`https://maps.apple.com/?q=${encodeURIComponent(destination.name + ' ' + destination.city)}`}
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
                        {/* Crown hidden for now */}
                        {rec.michelin_stars && rec.michelin_stars > 0 && (
                          <div className="absolute bottom-2 left-2 bg-white dark:bg-gray-900 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-0.5">
                            <img
                              src="https://guide.michelin.com/assets/images/icons/1star-1f2c04d7e6738e8a3312c9cda4b64fd0.svg"
                              alt="Michelin star"
                              className="h-3 w-3"
                            />
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

      {/* Lists Modal */}
      {showListsModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={() => setShowListsModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Add to List</h2>
              <button
                onClick={() => setShowListsModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingLists ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : userLists.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You don't have any lists yet</p>
                <button
                  onClick={() => {
                    setShowListsModal(false);
                    setShowCreateListModal(true);
                  }}
                  className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 transition-opacity font-medium"
                >
                  Create Your First List
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto mb-4 space-y-2">
                  {userLists.map((list) => (
                    <button
                      key={list.id}
                      onClick={() => toggleDestinationInList(list.id)}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <span className="font-medium">{list.name}</span>
                      {listsWithDestination.has(list.id) && (
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                      )}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setShowListsModal(false);
                    setShowCreateListModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create New List</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Create List Modal */}
      {showCreateListModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={() => setShowCreateListModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Create New List</h2>
              <button
                onClick={() => setShowCreateListModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">List Name *</label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g., Tokyo Favorites"
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  placeholder="Optional description..."
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="new-list-public"
                  checked={newListPublic}
                  onChange={(e) => setNewListPublic(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="new-list-public" className="text-sm">
                  Make this list public
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateListModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  disabled={creatingList}
                >
                  Cancel
                </button>
                <button
                  onClick={createNewList}
                  disabled={!newListName.trim() || creatingList}
                  className="flex-1 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {creatingList ? 'Creating...' : 'Create List'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
